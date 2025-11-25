# health_check_app.py - Property Health Check Analysis Backend
# Run with: uvicorn health_check_app:app --host 127.0.0.1 --port 8011 --reload

import os, io, json, base64, re
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader, PdfWriter
from cors_config import install_cors
from dotenv import load_dotenv
from mistralai import Mistral
from anthropic import Anthropic

# Usage tracking
from usage_tracker import increment_page_usage, count_pages_from_file

# Load environment variables from the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')
load_dotenv(env_path)

# ---------------- Config ----------------
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

if not MISTRAL_API_KEY:
   raise RuntimeError("Set MISTRAL_API_KEY in .env")
if not CLAUDE_API_KEY:
   raise RuntimeError("Set CLAUDE_API_KEY in .env")

MISTRAL = Mistral(api_key=MISTRAL_API_KEY)
ANTHROPIC = Anthropic(api_key=CLAUDE_API_KEY)

# Configurable Anthropic model name (set ANTHROPIC_MODEL in env to override)
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

ALLOWED_ORIGINS = [o.strip() for o in (os.getenv("ALLOWED_ORIGINS") or "*").split(",")]
MAX_BYTES = 50 * 1024 * 1024
OCR_MODEL = "mistral-ocr-latest"

ALLOWED_DOC_MIMES = {
   "application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp",
}
ALLOWED_SHEET_MIMES = {
   "text/csv",
   "application/vnd.ms-excel",
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
ALLOWED_UPLOAD_MIMES = ALLOWED_DOC_MIMES | ALLOWED_SHEET_MIMES

app = FastAPI(title="Property Health Check Backend", version="4.0.0")
install_cors(app)

# ---------------- Utils ----------------
def _to_data_url(file_bytes: bytes, mime: str) -> str:
   return f"data:{mime};base64,{base64.b64encode(file_bytes).decode('utf-8')}"

def _parse_pages_string(pages: str, total_pages: int) -> List[int]:
   pages = (pages or "").replace(" ", "")
   if not pages:
       return []
   result = set()
   for chunk in pages.split(","):
       if "-" in chunk:
           a, b = chunk.split("-", 1)
           start, end = int(a), int(b)
           if start < 1 or end > total_pages or start > end:
               raise ValueError(f"Bad range '{chunk}' (doc has {total_pages} pages)")
           for p in range(start, end + 1):
               result.add(p - 1)
       else:
           p = int(chunk)
           if p < 1 or p > total_pages:
               raise ValueError(f"Bad page '{chunk}'")
           result.add(p - 1)
   return sorted(result)

def _slice_pdf(pdf_bytes: bytes, pages_spec: str) -> bytes:
   reader = PdfReader(io.BytesIO(pdf_bytes))
   idxs = _parse_pages_string(pages_spec, len(reader.pages))
   if not idxs:
       return pdf_bytes
   writer = PdfWriter()
   for i in idxs:
       writer.add_page(reader.pages[i])
   out = io.BytesIO()
   writer.write(out)
   return out.getvalue()

def _as_number(v):
   try:
       if v is None:
           return None
       if isinstance(v, (int, float)):
           return float(v)
       s = str(v).strip()
       if not s:
           return None
       neg = s.startswith("(") and s.endswith(")")
       s = s.replace("$", "").replace(",", "").replace("%", "").replace("(", "").replace(")", "")
       x = float(s)
       return -x if neg else x
   except:
       return None

# ---------------- OCR + Claude Extraction ----------------
def _call_mistral_ocr(doc_bytes: bytes, mime: str) -> dict:
   try:
       resp = MISTRAL.ocr.process(
           model=OCR_MODEL,
           document={"type": "document_url", "document_url": _to_data_url(doc_bytes, mime)},
           include_image_base64=False,
       )
       return json.loads(resp.model_dump_json())
   except Exception as e:
       raise HTTPException(status_code=502, detail=f"Mistral OCR call failed: {e}")

def _call_claude_parse_health_check(ocr_text: str) -> Dict[str, Any]:
   """Extract data for health check analysis"""
   
   prompt = f"""Extract ALL financial data from this document.

OCR TEXT:
{ocr_text[:20000]}

Return ONLY this JSON structure with extracted values:
{{
 "property": {{
   "address": "",
   "city": "",
   "state": "",
   "zip": "",
   "units": 0,
   "year_built": 0,
   "rba_sqft": 0
 }},
 "pricing_financing": {{
   "price": 0,
   "price_per_unit": 0
 }},
 "pnl": {{
   "gross_potential_rent": 0,
   "other_income": 0,
   "vacancy_rate": 0,
   "vacancy_amount": 0,
   "effective_gross_income": 0,
   "operating_expenses": 0,
   "noi": 0
 }},
 "expenses": {{
   "taxes": 0,
   "insurance": 0,
   "utilities": 0,
   "repairs_maintenance": 0,
   "management": 0,
   "payroll": 0,
   "admin": 0,
   "marketing": 0,
   "reserves": 0,
   "total": 0
 }},
 "unit_mix": []
}}

Convert monthly amounts to annual."""

   try:
       res = ANTHROPIC.messages.create(
           model=ANTHROPIC_MODEL,
           max_tokens=4000,
           temperature=0,
           messages=[{"role": "user", "content": prompt}],
       )
       txt = res.content[0].text.strip()
       txt = re.sub(r'```json\s*', '', txt)
       txt = re.sub(r'```\s*', '', txt)
       match = re.search(r'\{.*\}', txt, re.DOTALL)
       if match:
           return json.loads(match.group(0))
       return json.loads(txt)
   except Exception as e:
       print(f"Claude parsing error: {e}")
       return {
           "property": {},
           "pricing_financing": {},
           "pnl": {},
           "expenses": {},
           "unit_mix": []
       }

# ---------------- Data Processing ----------------
def _normalize_and_compute(data: Dict[str, Any]) -> Dict[str, Any]:
   """Normalize data and compute missing metrics"""
   
   data.setdefault("property", {})
   data.setdefault("pricing_financing", {})
   data.setdefault("pnl", {})
   data.setdefault("expenses", {})
   data.setdefault("unit_mix", [])
   
   # Convert to numbers
   for key in ["units", "year_built", "rba_sqft"]:
       if key in data["property"]:
           data["property"][key] = _as_number(data["property"][key])
   
   for key in ["price", "price_per_unit"]:
       if key in data["pricing_financing"]:
           data["pricing_financing"][key] = _as_number(data["pricing_financing"][key])
   
   for key in data["pnl"]:
       data["pnl"][key] = _as_number(data["pnl"][key])
   
   for key in data["expenses"]:
       data["expenses"][key] = _as_number(data["expenses"][key])
   
   # Calculate missing metrics
   pnl = data["pnl"]
   expenses = data["expenses"]
   
   # Calculate total expenses if we have line items
   if not expenses.get("total"):
       total = 0
       for k, v in expenses.items():
           if k != "total" and v:
               total += v
       if total > 0:
           expenses["total"] = total
           if not pnl.get("operating_expenses"):
               pnl["operating_expenses"] = total
   
   # Calculate EGI if missing
   gpr = pnl.get("gross_potential_rent")
   vac = pnl.get("vacancy_amount")
   other = pnl.get("other_income")
   if not pnl.get("effective_gross_income") and gpr:
       egi = gpr - (abs(vac) if vac else 0) + (other if other else 0)
       pnl["effective_gross_income"] = egi
   
   # Calculate NOI if missing
   egi = pnl.get("effective_gross_income")
   opex = pnl.get("operating_expenses")
   if not pnl.get("noi") and egi and opex:
       pnl["noi"] = egi - opex
   
   # Calculate expense ratio
   if egi and opex:
       pnl["expense_ratio"] = opex / egi
   
   # Calculate cap rate
   price = data["pricing_financing"].get("price")
   noi = pnl.get("noi")
   if price and noi:
       data["pricing_financing"]["cap_rate"] = noi / price
   
   return data

def _validate_data(data: Dict[str, Any]) -> Dict[str, Any]:
   """Check if we have minimum data for analysis"""
   
   missing_critical = []
   weak_fields = []
   
   pnl = data.get("pnl", {})
   
   if not pnl.get("noi"):
       if not pnl.get("effective_gross_income"):
           missing_critical.append("pnl.effective_gross_income")
       if not pnl.get("operating_expenses"):
           missing_critical.append("pnl.operating_expenses")
   
   if not data.get("property", {}).get("units"):
       weak_fields.append({
           "field": "property.units",
           "reason": "Needed for per-unit analysis"
       })
   
   return {
       "can_run_healthcheck": len(missing_critical) == 0,
       "verified_payload": data,
       "missing_critical_fields": missing_critical,
       "weak_confidence_fields": weak_fields
   }

def _generate_health_check_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
   """Generate AGGRESSIVE health check analysis"""
   
   # Extract all values
   prop = data.get("property", {})
   pricing = data.get("pricing_financing", {})
   pnl = data.get("pnl", {})
   expenses = data.get("expenses", {})
   
   units = prop.get("units") or 1
   year_built = prop.get("year_built") or 0
   price = pricing.get("price") or 0
   
   noi = pnl.get("noi") or 0
   egi = pnl.get("effective_gross_income") or 0
   gpr = pnl.get("gross_potential_rent") or 0
   opex = pnl.get("operating_expenses") or 0
   expense_ratio = pnl.get("expense_ratio") or 0
   
   taxes = expenses.get("taxes") or 0
   insurance = expenses.get("insurance") or 0
   utilities = expenses.get("utilities") or 0
   repairs = expenses.get("repairs_maintenance") or 0
   mgmt = expenses.get("management") or 0
   marketing = expenses.get("marketing") or 0
   
   # Per unit metrics
   opex_per_unit = opex / units if units else opex
   insurance_per_unit = insurance / units if units else insurance
   utilities_per_unit = utilities / units if units else utilities
   repairs_per_unit = repairs / units if units else repairs
   noi_per_unit = noi / units if units else noi
   
   is_new = year_built >= 2022
   
   # Initialize result structure
   result = {
       "snapshot": {
           "property_name": prop.get("address", "Property"),
           "address": prop.get("address", ""),
           "city": prop.get("city", ""),
           "state": prop.get("state", ""),
           "year_built_or_renovated": str(year_built) if year_built else "Unknown",
           "unit_count": str(int(units)) if units else "Unknown",
           "unit_mix": f"{int(units)} units",
           "occupancy": f"{(1 - (pnl.get('vacancy_rate', 0) or 0)) * 100:.1f}%",
           "financials_present": "P&L/T12",
           "rent_notes": f"GPR ${gpr:,.0f} = ${gpr/units/12:,.0f}/unit/month | Expense ratio {expense_ratio*100:.1f}% is {'FRAUDULENT' if expense_ratio < 0.30 else 'excessive' if expense_ratio > 0.50 else 'suboptimal'}"
       },
       "operational_issues": [],
       "noi_levers": {"revenue": [], "expenses": []},
       "market_position": {"competitive_advantages": [], "competitive_disadvantages": []},
       "strengths": [],
       "weak_spots": [],
       "force_appreciation": [],
       "tenant_retention": [],
       "missing_items": [],
       "source_check": f"P&L showing {expense_ratio*100:.1f}% expense ratio on {int(units)} units"
   }
   
   # CRITICAL: Expense ratio analysis
   if expense_ratio < 0.30:
       result["operational_issues"].append({
           "text": f"FRAUDULENT: {expense_ratio*100:.1f}% expense ratio is IMPOSSIBLE. Either hiding expenses or books are fake. Real ratio should be 35-45%.",
           "severity": "high",
           "pages": []
       })
       result["weak_spots"].append({
           "text": f"Financial reporting is suspect - {expense_ratio*100:.1f}% expense ratio indicates missing or hidden expenses",
           "pages": []
       })
   elif expense_ratio > 0.50:
       result["operational_issues"].append({
           "text": f"CATASTROPHIC: {expense_ratio*100:.1f}% expense ratio means you're hemorrhaging ${(opex - egi*0.40):,.0f} annually vs 40% target",
           "severity": "high",
           "pages": []
       })
   
   # UTILITIES - THE BIG ONE
   if utilities > 0:
       rubs_recovery = utilities * 0.75  # 75% recovery minimum
       result["operational_issues"].append({
           "text": f"UNACCEPTABLE: Paying ${utilities:,.0f} utilities (${utilities_per_unit:,.0f}/unit) with ZERO recovery. You're subsidizing tenants.",
           "severity": "high",
           "pages": []
       })
       result["noi_levers"]["revenue"].append({
           "text": f"IMMEDIATE: Implement RUBS to recover 75% of ${utilities:,.0f} utility costs. Stop giving away money.",
           "estimated_annual_impact": f"${rubs_recovery:,.0f}",
           "impact_level": "high",
           "pages": []
       })
   
   # R&M ON NEW CONSTRUCTION
   if is_new and repairs > 500 * units:
       excess = repairs - (300 * units)
       result["operational_issues"].append({
           "text": f"FRAUD/INCOMPETENCE: ${repairs:,.0f} R&M on {year_built} construction. Should be ${300*units:,.0f} max. Someone's stealing ${excess:,.0f}.",
           "severity": "high",
           "pages": []
       })
       result["noi_levers"]["expenses"].append({
           "text": f"FIRE YOUR CONTRACTOR: Cut R&M from ${repairs:,.0f} to ${300*units:,.0f} for new construction",
           "estimated_annual_impact": f"${excess:,.0f}",
           "impact_level": "high",
           "pages": []
       })
   elif repairs_per_unit > 1200:
       excess = repairs - (1000 * units)
       result["noi_levers"]["expenses"].append({
           "text": f"R&M BLOAT: ${repairs_per_unit:,.0f}/unit exceeds $1000 benchmark by ${excess:,.0f}",
           "estimated_annual_impact": f"${excess:,.0f}",
           "impact_level": "medium",
           "pages": []
       })
   
   # INSURANCE
   if insurance_per_unit > 550:
       excess = insurance - (500 * units)
       result["noi_levers"]["expenses"].append({
           "text": f"INSURANCE OVERPAY: ${insurance_per_unit:,.0f}/unit vs $500 benchmark. Shop immediately.",
           "estimated_annual_impact": f"${excess:,.0f}",
           "impact_level": "high" if excess > 2000 else "medium",
           "pages": []
       })
   
   # MANAGEMENT
   if egi and mgmt:
       mgmt_pct = (mgmt / egi) * 100
       if mgmt_pct > 4.0:
           excess = mgmt - (egi * 0.035)
           result["noi_levers"]["expenses"].append({
               "text": f"MANAGEMENT RIP-OFF: {mgmt_pct:.1f}% of EGI. Fire them or renegotiate to 3.5%",
               "estimated_annual_impact": f"${excess:,.0f}",
               "impact_level": "high" if excess > 3000 else "medium",
               "pages": []
           })
   
   # OTHER INCOME OPPORTUNITY
   if pnl.get("other_income", 0) < units * 600:  # $50/month per unit minimum
       opportunity = (units * 600) - (pnl.get("other_income", 0) or 0)
       result["noi_levers"]["revenue"].append({
           "text": f"MISSING REVENUE: Only ${pnl.get('other_income', 0):,.0f} other income. Should be ${units*600:,.0f} minimum from parking/pets/storage",
           "estimated_annual_impact": f"${opportunity:,.0f}",
           "impact_level": "medium",
           "pages": []
       })
   
   # Calculate total opportunity
   total_revenue_opp = 0
   total_expense_opp = 0
   
   for item in result["noi_levers"]["revenue"]:
       try:
           amount = float(item["estimated_annual_impact"].replace("$", "").replace(",", ""))
           total_revenue_opp += amount
       except:
           pass
   
   for item in result["noi_levers"]["expenses"]:
       try:
           amount = float(item["estimated_annual_impact"].replace("$", "").replace(",", ""))
           total_expense_opp += amount
       except:
           pass
   
   total_opportunity = total_revenue_opp + total_expense_opp
   
   # FORCE APPRECIATION
   if total_opportunity > 0:
       value_at_5cap = total_opportunity / 0.05
       value_at_6cap = total_opportunity / 0.06
       result["force_appreciation"].append({
           "text": f"MANDATORY FIXES: ${total_opportunity:,.0f} NOI increase = ${value_at_6cap:,.0f} value at 6% cap or ${value_at_5cap:,.0f} at 5% cap",
           "value_impact": "high",
           "pages": []
       })
   
   # MARKET POSITION
   if expense_ratio < 0.30:
       result["market_position"]["competitive_disadvantages"].append({
           "text": "Financial credibility destroyed by impossible expense ratio",
           "pages": []
       })
   
   if utilities > 0:
       result["market_position"]["competitive_disadvantages"].append({
           "text": f"Competitors charge $100-150/unit for utilities while you pay ${utilities_per_unit:,.0f}/unit",
           "pages": []
       })
   
   # STRENGTHS (if any)
   if noi_per_unit > 10000:
       result["strengths"].append({
           "text": f"NOI of ${noi_per_unit:,.0f}/unit is strong despite poor management",
           "pages": []
       })
   
   # WEAKNESSES
   result["weak_spots"].append({
       "text": f"INCOMPETENT MANAGEMENT: Leaving ${total_opportunity:,.0f}/year on the table through poor operations",
       "pages": []
   })
   
   if opex_per_unit > 3500:
       result["weak_spots"].append({
           "text": f"OpEx at ${opex_per_unit:,.0f}/unit while top operators achieve $3,000-3,500/unit",
           "pages": []
       })
   
   # TENANT RETENTION
   if is_new:
       result["tenant_retention"].append({
           "text": "New property honeymoon ending - high R&M suggests problems already emerging",
           "pages": []
       })
   
   # MISSING ITEMS
   result["missing_items"] = [
       "Detailed rent roll showing actual vs market rents",
       "12 months of utility bills to verify RUBS potential",
       "Management contract showing termination clauses",
       "Service contracts revealing vendor overcharges",
       "Competitive market analysis showing rent upside"
   ]
   
   return result

# ---------------- API Endpoints ----------------
@app.get("/health")
def health():
   return {
       "ok": True,
       "service": "Property Health Check",
       "version": "4.0.0",
       "port": 8011
   }

@app.post("/api/health-check/verify")
async def health_check_verify(
   file: UploadFile = File(...),
   pages: Optional[str] = Form(default=""),
   user_fixes: Optional[str] = Form(default="{}"),
   user_id: Optional[str] = Form(default=None)
):
   """Extract and verify property data"""
   
   print(f"\n{'='*80}")
   print(f"[HEALTH CHECK] REQUEST RECEIVED")
   print(f"[HEALTH CHECK] File: {file.filename}")
   print(f"[HEALTH CHECK] User ID: {user_id}")
   print(f"[HEALTH CHECK] Pages: {pages}")
   print(f"{'='*80}\n")
   
   # Check 60-page limit (backend enforcement)
   if user_id:
       try:
           from usage_tracker import get_supabase_client
           from datetime import datetime
           
           current_month = datetime.now().strftime("%Y-%m")
           supabase = get_supabase_client()
           
           result = supabase.table("user_usage") \
               .select("pages_processed") \
               .eq("user_id", user_id) \
               .eq("month_year", current_month) \
               .execute()
           
           pages_used = result.data[0]["pages_processed"] if result.data else 0
           
           if pages_used >= 60:
               raise HTTPException(
                   status_code=403,
                   detail="You have reached your 60-page limit for this month. Please purchase more pages to continue."
               )
           
           print(f"[HEALTH CHECK] Usage check passed: {pages_used}/60 pages used")
       except HTTPException:
           raise
       except Exception as e:
           print(f"[HEALTH CHECK] Warning: Could not check usage limit: {e}")
           # Continue processing if check fails (non-blocking)
   
   mime = (file.content_type or "").lower()
   if mime not in ALLOWED_UPLOAD_MIMES:
       raise HTTPException(status_code=415, detail=f"Unsupported content type: {mime}")
   
   data = await file.read()
   orig_data = data  # Save for page counting
   orig_mime = mime  # Save for page counting
   if not data:
       raise HTTPException(status_code=400, detail="Empty upload")
   if len(data) > MAX_BYTES:
       raise HTTPException(status_code=413, detail="File too large")
   
   # Handle PDF page selection
   if mime == "application/pdf" and pages:
       try:
           data = _slice_pdf(data, pages)
       except ValueError as e:
           raise HTTPException(status_code=400, detail=str(e))
   
   # OCR the document
   markdown_text = ""
   if mime in ALLOWED_DOC_MIMES:
       try:
           ocr_json = _call_mistral_ocr(data, mime)
           for page in ocr_json.get("pages", []):
               if isinstance(page, dict) and "markdown" in page:
                   markdown_text += page["markdown"] + "\n\n"
       except Exception as e:
           print(f"OCR error: {e}")
           raise HTTPException(status_code=502, detail=f"OCR failed: {str(e)}")
   else:
       try:
           markdown_text = data.decode("utf-8", errors="ignore")
       except:
           markdown_text = str(data)[:100000]
   
   if not markdown_text:
       raise HTTPException(status_code=400, detail="No text extracted from document")
   
   # Parse with Claude
   extracted_data = _call_claude_parse_health_check(markdown_text)
   
   # Normalize and compute metrics
   extracted_data = _normalize_and_compute(extracted_data)
   
   # Apply user corrections if any
   try:
       user_fixes_dict = json.loads(user_fixes) if user_fixes != "{}" else {}
       for key_path, value in user_fixes_dict.items():
           keys = key_path.split('.')
           target = extracted_data
           for key in keys[:-1]:
               target = target.setdefault(key, {})
           target[keys[-1]] = _as_number(value) if isinstance(value, str) else value
       extracted_data = _normalize_and_compute(extracted_data)
   except Exception as e:
       print(f"Error applying user fixes: {e}")
   
   # Validate
   validation = _validate_data(extracted_data)
   
   # Track page usage
   if user_id:
       try:
           pages_count = count_pages_from_file(orig_data, orig_mime)
           await increment_page_usage(user_id, pages_count, "pfa")
           print(f"[Usage] Tracked {pages_count} pages for user {user_id} (PFA)")
       except Exception as e:
           print(f"[Usage] Error tracking usage: {str(e)}")
   
   return {
       "ok": True,
       "verification": validation,
       "file_name": file.filename
   }

@app.post("/api/health-check/analyze")
async def health_check_analyze(request: Dict[str, Any]):
   """Generate health check analysis"""
   
   verified_payload = request.get("verified_payload", {})
   if not verified_payload:
       raise HTTPException(status_code=400, detail="Missing verified_payload")
   
   try:
       health_check_result = _generate_health_check_analysis(verified_payload)
       return {
           "ok": True,
           "health_check": health_check_result
       }
   except Exception as e:
       print(f"Analysis error: {e}")
       return {
           "ok": True,
           "health_check": {
               "snapshot": {"property_name": "Analysis Error", "error": str(e)},
               "operational_issues": [],
               "noi_levers": {"revenue": [], "expenses": []},
               "market_position": {"competitive_advantages": [], "competitive_disadvantages": []},
               "strengths": [],
               "weak_spots": [],
               "force_appreciation": [],
               "tenant_retention": [],
               "missing_items": ["Analysis failed"],
               "source_check": f"Error: {str(e)}"
           }
       }

if __name__ == "__main__":
   import uvicorn
   uvicorn.run(app, host="127.0.0.1", port=8011)