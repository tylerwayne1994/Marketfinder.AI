# health_check_parser.py - Parser for Property Health Check Analysis

import json
import base64
import re
from typing import Dict, Any, List, Optional
from mistralai import Mistral
from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")

class HealthCheckParser:
    def __init__(self):
        self.mistral = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
        self.anthropic = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
        self.ocr_model = "mistral-ocr-latest"
    
    def _to_data_url(self, file_bytes: bytes, mime: str) -> str:
        """Convert file bytes to data URL"""
        b64 = base64.b64encode(file_bytes).decode('utf-8')
        return f"data:{mime};base64,{b64}"
    
    def _as_number(self, v) -> Optional[float]:
        """Safe number conversion"""
        if v is None:
            return None
        try:
            if isinstance(v, (int, float)):
                return float(v)
            s = str(v).strip()
            if not s:
                return None
            # Handle parentheses for negatives
            neg = s.startswith("(") and s.endswith(")")
            # Remove formatting
            s = re.sub(r'[$,%()]', '', s)
            x = float(s)
            return -x if neg else x
        except:
            return None
    
    def parse_document(self, file_bytes: bytes, mime_type: str, selected_pages: List[int] = None) -> Dict[str, Any]:
        """Parse document and extract financial data"""
        
        # OCR if needed
        if mime_type in ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]:
            ocr_text = self._ocr_document(file_bytes, mime_type)
        else:
            # Handle CSV/Excel
            try:
                ocr_text = file_bytes.decode('utf-8', errors='ignore')
            except:
                ocr_text = str(file_bytes)[:100000]
        
        # Extract data using Claude
        extracted = self._extract_with_claude(ocr_text, selected_pages)
        
        # Post-process and calculate derived metrics
        return self._post_process(extracted)
    
    def _ocr_document(self, file_bytes: bytes, mime: str) -> str:
        """OCR document using Mistral"""
        try:
            resp = self.mistral.ocr.process(
                model=self.ocr_model,
                document={
                    "type": "document_url",
                    "document_url": self._to_data_url(file_bytes, mime)
                },
                include_image_base64=False
            )
            
            ocr_json = json.loads(resp.model_dump_json())
            
            # Combine markdown from all pages
            text_parts = []
            for page in ocr_json.get("pages", []):
                if isinstance(page, dict) and "markdown" in page:
                    text_parts.append(page["markdown"])
            
            return "\n\n".join(text_parts)
        except Exception as e:
            raise Exception(f"OCR failed: {str(e)}")
    
    def _extract_with_claude(self, text: str, pages: List[int] = None) -> Dict[str, Any]:
        """Extract structured data using Claude"""
        
        prompt = f"""Extract ALL financial and property data from this document. Be extremely thorough.

DOCUMENT TEXT:
{text[:20000]}  # Limit for token management

Extract into this EXACT structure:
{{
  "property": {{
    "address": "", "city": "", "state": "", "zip": "",
    "units": 0, "year_built": 0, "rba_sqft": 0,
    "property_type": "", "property_class": ""
  }},
  "pnl": {{
    "gross_potential_rent": 0,
    "other_income": 0,
    "vacancy_rate": 0,
    "vacancy_amount": 0,
    "effective_gross_income": 0,
    "operating_expenses": 0,
    "noi": 0,
    "cap_rate": 0,
    "expense_ratio": 0
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
    "other": 0,
    "total": 0
  }},
  "unit_mix": [
    {{"type": "1BR/1BA", "units": 0, "unit_sf": 0, "rent_current": 0, "rent_market": 0}}
  ],
  "occupancy": {{
    "total_units": 0,
    "occupied_units": 0,
    "vacant_units": 0,
    "occupancy_rate": 0
  }},
  "rent_roll_summary": {{
    "total_units_on_roll": 0,
    "avg_rent": 0,
    "min_rent": 0,
    "max_rent": 0,
    "vacant_count": 0
  }}
}}

CRITICAL RULES:
1. Convert ALL monthly amounts to annual (multiply by 12)
2. Extract exact numbers, not rounded
3. Calculate totals if line items present
4. Use 0 for missing numeric fields
5. Extract unit-by-unit detail if available

Return ONLY the JSON object."""

        try:
            response = self.anthropic.messages.create(
              model=ANTHROPIC_MODEL,
              max_tokens=4000,
              temperature=0,
              messages=[{"role": "user", "content": prompt}]
            )
            
            text = response.content[0].text.strip()
            text = text.replace("```json", "").replace("```", "")
            
            # Find JSON in response
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return json.loads(text)
            
        except Exception as e:
            raise Exception(f"Claude extraction failed: {str(e)}")
    
    def _post_process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate derived metrics and clean data"""
        
        # Convert all numbers
        for section in ["pnl", "expenses"]:
            if section in data:
                for key in data[section]:
                    data[section][key] = self._as_number(data[section][key])
        
        if "property" in data:
            for key in ["units", "year_built", "rba_sqft"]:
                if key in data["property"]:
                    data["property"][key] = self._as_number(data["property"][key])
        
        # Calculate missing metrics
        pnl = data.get("pnl", {})
        expenses = data.get("expenses", {})
        property_info = data.get("property", {})
        
        # Calculate total expenses if we have line items
        if expenses and not expenses.get("total"):
            total = sum(v for k, v in expenses.items() 
                       if k != "total" and v is not None)
            if total > 0:
                expenses["total"] = total
                pnl["operating_expenses"] = total
        
        # Calculate NOI if missing
        egi = pnl.get("effective_gross_income")
        opex = pnl.get("operating_expenses") or expenses.get("total")
        if egi and opex and not pnl.get("noi"):
            pnl["noi"] = egi - opex
        
        # Calculate expense ratio
        if egi and opex and not pnl.get("expense_ratio"):
            pnl["expense_ratio"] = opex / egi
        
        # Calculate vacancy rate from amounts
        gpr = pnl.get("gross_potential_rent")
        vac_amt = pnl.get("vacancy_amount")
        if gpr and vac_amt and not pnl.get("vacancy_rate"):
            pnl["vacancy_rate"] = abs(vac_amt) / gpr
        
        return data
    
    def apply_corrections(self, data: Dict[str, Any], corrections: Dict[str, Any]) -> Dict[str, Any]:
        """Apply user corrections to extracted data"""
        
        for key_path, value in corrections.items():
            keys = key_path.split('.')
            target = data
            for key in keys[:-1]:
                target = target.setdefault(key, {})
            
            # Convert to number if numeric
            if isinstance(value, str) and re.match(r'^-?\d+\.?\d*$', value.replace(',', '')):
                value = self._as_number(value)
            
            target[keys[-1]] = value
        
        # Recalculate derived metrics
        return self._post_process(data)
    
    def validate_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate data completeness for analysis"""
        
        pnl = data.get("pnl", {})
        expenses = data.get("expenses", {})
        property_info = data.get("property", {})
        
        missing_critical = []
        weak_fields = []
        
        # Critical fields for basic analysis
        if not pnl.get("noi") and not (pnl.get("effective_gross_income") and pnl.get("operating_expenses")):
            if not pnl.get("effective_gross_income"):
                missing_critical.append("pnl.effective_gross_income")
            if not pnl.get("operating_expenses"):
                missing_critical.append("pnl.operating_expenses")
        
        # Important but not critical
        if not property_info.get("units"):
            weak_fields.append({
                "field": "property.units",
                "reason": "Needed for per-unit analysis"
            })
        
        if not pnl.get("gross_potential_rent"):
            weak_fields.append({
                "field": "pnl.gross_potential_rent",
                "reason": "Needed for vacancy analysis"
            })
        
        if not any(expenses.get(k) for k in ["taxes", "insurance", "utilities", "repairs_maintenance"]):
            weak_fields.append({
                "field": "expenses.breakdown",
                "reason": "Detailed expenses needed to identify specific savings"
            })
        
        can_run = len(missing_critical) == 0
        
        return {
            "can_run": can_run,
            "missing_critical": missing_critical,
            "weak_fields": weak_fields
        }
    
    def analyze_property_health(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform aggressive health analysis with specific recommendations"""
        
        # Extract metrics
        pnl = data.get("pnl", {})
        expenses = data.get("expenses", {})
        property_info = data.get("property", {})
        unit_mix = data.get("unit_mix", [])
        
        units = self._as_number(property_info.get("units")) or 1
        noi = self._as_number(pnl.get("noi")) or 0
        opex = self._as_number(pnl.get("operating_expenses")) or 0
        egi = self._as_number(pnl.get("effective_gross_income")) or 0
        gpr = self._as_number(pnl.get("gross_potential_rent")) or 0
        
        # Individual expenses
        taxes = self._as_number(expenses.get("taxes")) or 0
        insurance = self._as_number(expenses.get("insurance")) or 0
        utilities = self._as_number(expenses.get("utilities")) or 0
        repairs = self._as_number(expenses.get("repairs_maintenance")) or 0
        mgmt = self._as_number(expenses.get("management")) or 0
        admin = self._as_number(expenses.get("admin")) or 0
        marketing = self._as_number(expenses.get("marketing")) or 0
        
        # Per unit metrics
        opex_per_unit = opex / units if units else 0
        insurance_per_unit = insurance / units if units else 0
        repairs_per_unit = repairs / units if units else 0
        utilities_per_unit = utilities / units if units else 0
        
        prompt = f"""You are a hardened multifamily operator analyzing a distressed {int(units)}-unit property.

PROPERTY METRICS:
Units: {int(units)}
NOI: ${noi:,.0f} (${noi/units:,.0f}/unit)
OpEx: ${opex:,.0f} (${opex_per_unit:,.0f}/unit)
EGI: ${egi:,.0f}
GPR: ${gpr:,.0f}
Expense Ratio: {(opex/egi*100) if egi else 0:.1f}%

EXPENSE DETAIL:
Taxes: ${taxes:,.0f} (${taxes/units:,.0f}/unit)
Insurance: ${insurance:,.0f} (${insurance_per_unit:,.0f}/unit)
Utilities: ${utilities:,.0f} (${utilities_per_unit:,.0f}/unit)
R&M: ${repairs:,.0f} (${repairs_per_unit:,.0f}/unit)
Management: ${mgmt:,.0f} ({(mgmt/egi*100) if egi else 0:.1f}% of EGI)
Admin: ${admin:,.0f}
Marketing: ${marketing:,.0f}

UNIT MIX:
{json.dumps(unit_mix, indent=2)}

ANALYSIS RULES:
1. Insurance benchmark: $500-600/unit/year. Current: ${insurance_per_unit:,.0f}
2. R&M benchmark: $800-1200/unit/year. Current: ${repairs_per_unit:,.0f}
3. Management benchmark: 4-5% of EGI. Current: {(mgmt/egi*100) if egi else 0:.1f}%
4. Marketing benchmark: $200-300/unit/year
5. Expense ratio benchmark: 35-45%. Current: {(opex/egi*100) if egi else 0:.1f}%
6. If utilities > $500/unit and owner-paid, MUST recommend RUBS

For EVERY issue, calculate EXACT dollar impact using THIS property's numbers.

Return this JSON with ACTUAL NUMBERS:

{{
  "snapshot": {{
    "property_name": "{property_info.get('address', 'Property')}",
    "address": "{property_info.get('address', '')}",
    "city": "{property_info.get('city', '')}",
    "state": "{property_info.get('state', '')}",
    "year_built_or_renovated": "{property_info.get('year_built', '')}",
    "unit_count": "{int(units)}",
    "unit_mix": "Detail from unit_mix",
    "occupancy": "Calculate from data",
    "financials_present": "P&L/T12",
    "rent_notes": "Key observation"
  }},
  
  "operational_issues": [
    {{
      "text": "MUST USE EXACT NUMBERS: Insurance at ${insurance_per_unit:,.0f}/unit exceeds $600 benchmark by ${(insurance_per_unit-600)*units:,.0f} annually",
      "severity": "high" if insurance_per_unit > 700 else "medium" if insurance_per_unit > 600 else "low",
      "pages": []
    }},
    {{
      "text": "Repairs at ${repairs_per_unit:,.0f}/unit vs $1000 benchmark costs extra ${(repairs_per_unit-1000)*units:,.0f} annually",
      "severity": "high" if repairs_per_unit > 1500 else "medium",
      "pages": []
    }}
  ],
  
  "noi_levers": {{
    "revenue": [
      {{
        "text": "Implement RUBS on {int(units)} units at $35/unit/month",
        "estimated_annual_impact": "${int(units)*35*12:,.0f}",
        "impact_level": "high" if units*35*12 > 20000 else "medium",
        "pages": []
      }}
    ],
    "expenses": [
      {{
        "text": "Reduce insurance from ${insurance:,.0f} to $600/unit benchmark",
        "estimated_annual_impact": "${max(0, insurance - 600*units):,.0f}",
        "impact_level": "high" if insurance - 600*units > 20000 else "medium",
        "pages": []
      }},
      {{
        "text": "Cut management from {(mgmt/egi*100) if egi else 0:.1f}% to 5% of EGI",
        "estimated_annual_impact": "${max(0, mgmt - egi*0.05):,.0f}",
        "impact_level": "high" if mgmt - egi*0.05 > 15000 else "medium",
        "pages": []
      }}
    ]
  }},
  
  "strengths": [
    {{"text": "Property generates ${noi:,.0f} NOI (${noi/units:,.0f}/unit)", "pages": []}}
  ],
  
  "weak_spots": [
    {{"text": "Operating expenses at ${opex_per_unit:,.0f}/unit exceed $3500 benchmark by ${(opex_per_unit-3500)*units:,.0f}/year", "pages": []}}
  ],
  
  "force_appreciation": [
    {{
      "text": "Reduce OpEx from ${opex:,.0f} to ${units*3500:,.0f} ($3500/unit), increase NOI by ${opex-units*3500:,.0f}, at 6% cap rate = ${(opex-units*3500)/0.06:,.0f} value increase",
      "value_impact": "high" if opex-units*3500 > 100000 else "medium",
      "pages": []
    }}
  ],
  
  "tenant_retention": [
    {{"text": "High repairs at ${repairs_per_unit:,.0f}/unit suggest deferred maintenance impacting retention", "pages": []}}
  ],
  
  "missing_items": [
    "Detailed rent roll",
    "12-month utility bills",
    "Service contracts"
  ],
  
  "source_check": "Analysis based on P&L showing ${opex:,.0f} OpEx across {int(units)} units"
}}

USE EXACT NUMBERS FROM THIS PROPERTY. NO GENERIC STATEMENTS."""

        try:
            response = self.anthropic.messages.create(
              model=ANTHROPIC_MODEL,
              max_tokens=4000,
              temperature=0,
              messages=[{"role": "user", "content": prompt}]
            )
            
            text = response.content[0].text.strip()
            text = text.replace("```json", "").replace("```", "")
            
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return json.loads(text)
            
        except Exception as e:
            # Return minimal structure on error
            return {
                "snapshot": {"property_name": "Analysis Failed", "error": str(e)},
                "operational_issues": [],
                "noi_levers": {"revenue": [], "expenses": []},
                "market_position": {"competitive_advantages": [], "competitive_disadvantages": []},
                "strengths": [],
                "weak_spots": [],
                "force_appreciation": [],
                "tenant_retention": [],
                "missing_items": ["Analysis could not complete"],
                "source_check": f"Error: {str(e)}"
            }