"""
pfa_ai_routes.py - Additional AI endpoints for PFA paste-text ingestion and chat adjustments

These endpoints are additive and do NOT modify existing /api/health-check/verify or /api/health-check/analyze
flows. They are mounted from health_check_app.py via include_router and inherit its CORS settings.
"""

import os
import json
import re
from copy import deepcopy
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from anthropic import Anthropic


# Load .env from backend directory if present
load_dotenv()

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
if not CLAUDE_API_KEY:
    raise RuntimeError("Set CLAUDE_API_KEY in .env")

ANTHROPIC = Anthropic(api_key=CLAUDE_API_KEY)
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
ANTHROPIC_FALLBACK_MODELS = [
    ANTHROPIC_MODEL,
    # Fallbacks for older SDKs/environments that don't recognize the alias
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    # Newer alias in case user's key has access to 3.7 series
    "claude-3-7-sonnet-latest",
]

router = APIRouter()


# ------------------------- Helpers -------------------------
def _as_number(v) -> Optional[float]:
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


def _normalize_and_compute(data: Dict[str, Any]) -> Dict[str, Any]:
    data = data or {}
    data.setdefault("property", {})
    data.setdefault("pricing_financing", {})
    data.setdefault("pnl", {})
    data.setdefault("expenses", {})
    data.setdefault("unit_mix", [])

    # number conversions
    for key in ["units", "year_built", "rba_sqft"]:
        if key in data["property"]:
            data["property"][key] = _as_number(data["property"][key])

    for key in ["price", "price_per_unit"]:
        if key in data["pricing_financing"]:
            data["pricing_financing"][key] = _as_number(data["pricing_financing"][key])

    for k in list(data["pnl"].keys()):
        data["pnl"][k] = _as_number(data["pnl"][k])

    for k in list(data["expenses"].keys()):
        data["expenses"][k] = _as_number(data["expenses"][k])

    pnl = data["pnl"]
    expenses = data["expenses"]

    # total expenses and map to pnl.operating_expenses
    if not expenses.get("total"):
        tot = 0.0
        for k, v in expenses.items():
            if k != "total" and v:
                tot += v
        if tot > 0:
            expenses["total"] = tot
            if not pnl.get("operating_expenses"):
                pnl["operating_expenses"] = tot

    gpr = pnl.get("gross_potential_rent")
    vac_amt = pnl.get("vacancy_amount")
    other_inc = pnl.get("other_income")
    if not pnl.get("effective_gross_income") and gpr is not None:
        egi = gpr - (abs(vac_amt) if vac_amt else 0) + (other_inc or 0)
        pnl["effective_gross_income"] = egi

    egi = pnl.get("effective_gross_income")
    opex = pnl.get("operating_expenses") or expenses.get("total")
    if not pnl.get("noi") and egi is not None and opex is not None:
        pnl["noi"] = egi - opex

    if egi and opex and not pnl.get("expense_ratio"):
        pnl["expense_ratio"] = opex / egi

    price = data["pricing_financing"].get("price")
    noi = pnl.get("noi")
    if price and noi and not data["pricing_financing"].get("cap_rate"):
        data["pricing_financing"]["cap_rate"] = noi / price

    return data


def _calc_metrics(state: Dict[str, Any]) -> Dict[str, Any]:
    """Compute core underwriting metrics from a scenario state.

    Expected structure (tolerant to missing fields):
    state = {
      "purchase": {"price", "down_payment_pct", "interest_rate", "amort_years", "closing_costs"?},
      "income": {"gpr", "other_income", "vacancy_rate", "egi"?},
      "expenses": {"total" or individual lines},
      "pnl"?: may include egi/noi (we recompute if needed)
    }
    """
    purchase = state.get("purchase", {})
    income = state.get("income", {})
    expenses = state.get("expenses", {})
    pnl = deepcopy(state.get("pnl", {}))

    price = _as_number(purchase.get("price")) or 0
    dpct = (_as_number(purchase.get("down_payment_pct")) or 0.25)
    rate = (_as_number(purchase.get("interest_rate")) or 0.0675)  # as decimal, e.g. 0.0675 = 6.75%
    amort_years = int(_as_number(purchase.get("amort_years")) or 30)
    closing_costs = _as_number(purchase.get("closing_costs")) or 0

    gpr = _as_number(income.get("gpr"))
    other = _as_number(income.get("other_income")) or 0
    vac_rate = _as_number(income.get("vacancy_rate"))

    # expenses total
    total_exp = _as_number(expenses.get("total"))
    if total_exp is None:
        total_exp = 0.0
        for k, v in expenses.items():
            if k != "total":
                nv = _as_number(v)
                if nv:
                    total_exp += nv

    # compute EGI from GPR/vacancy/other if not provided
    if pnl.get("effective_gross_income") is not None:
        egi = _as_number(pnl.get("effective_gross_income"))
    else:
        if gpr is not None:
            vac_amt = gpr * (vac_rate or 0)
            egi = gpr - vac_amt + other
        else:
            egi = None

    # NOI
    if pnl.get("noi") is not None:
        noi = _as_number(pnl.get("noi"))
    else:
        noi = (egi - total_exp) if (egi is not None and total_exp is not None) else None

    # Loan and debt service
    equity = price * dpct + closing_costs if price else 0
    loan_amount = price - price * dpct if price else 0
    monthly_rate = rate / 12 if rate else 0
    n = amort_years * 12
    if loan_amount and monthly_rate and n:
        monthly_pmt = loan_amount * (monthly_rate) / (1 - (1 + monthly_rate) ** (-n))
    elif loan_amount and n:
        monthly_pmt = loan_amount / n
    else:
        monthly_pmt = 0
    annual_debt = monthly_pmt * 12

    # Metrics
    cap_rate = (noi / price) if (noi is not None and price) else None
    dscr = (noi / annual_debt) if (noi is not None and annual_debt) else None
    cash_flow = (noi - annual_debt) if (noi is not None) else None
    coc = (cash_flow / equity) if (cash_flow is not None and equity) else None
    expense_ratio = (total_exp / egi) if (egi and total_exp is not None) else None

    return {
        "price": price,
        "loanAmount": loan_amount,
        "equity": equity,
        "NOI": noi,
        "EGI": egi,
        "expensesTotal": total_exp,
        "annualDebtService": annual_debt,
        "monthlyDebtService": monthly_pmt,
        "capRate": cap_rate,
        "DSCR": dscr,
        "cashFlowAnnual": cash_flow,
        "cashFlowMonthly": (cash_flow / 12) if cash_flow is not None else None,
        "CoC": coc,
        "expenseRatio": expense_ratio,
        "inputsEcho": {
            "down_payment_pct": dpct,
            "interest_rate": rate,
            "amort_years": amort_years,
            "closing_costs": closing_costs,
        },
    }


def _deep_apply_patch(obj: Dict[str, Any], patch: Dict[str, Any]) -> Dict[str, Any]:
    out = deepcopy(obj)
    for k, v in (patch or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_apply_patch(out[k], v)
        else:
            out[k] = v
    return out


def _clamp_patch(current: Dict[str, Any], patch: Dict[str, Any]) -> Dict[str, Any]:
    """Apply simple guardrails to limit unrealistic edits."""
    guarded = deepcopy(patch)

    try:
        cur_price = _as_number(current.get("purchase", {}).get("price")) or 0
        if "purchase" in guarded and "price" in guarded["purchase"] and cur_price:
            new_price = _as_number(guarded["purchase"]["price"]) or cur_price
            # limit to ±15%
            min_p, max_p = cur_price * 0.85, cur_price * 1.15
            new_price = max(min_p, min(new_price, max_p))
            guarded["purchase"]["price"] = new_price
    except Exception:
        pass

    try:
        if "purchase" in guarded and "interest_rate" in guarded["purchase"]:
            cur_rate = _as_number(current.get("purchase", {}).get("interest_rate")) or 0.0675
            new_rate = _as_number(guarded["purchase"]["interest_rate"]) or cur_rate
            # limit to ±100 bps
            min_r, max_r = cur_rate - 0.01, cur_rate + 0.01
            guarded["purchase"]["interest_rate"] = max(min_r, min(new_rate, max_r))
    except Exception:
        pass

    try:
        if "purchase" in guarded and "down_payment_pct" in guarded["purchase"]:
            dp = _as_number(guarded["purchase"]["down_payment_pct"]) or 0.25
            guarded["purchase"]["down_payment_pct"] = max(0.20, min(dp, 0.50))
    except Exception:
        pass

    return guarded


# ------------------------- Models -------------------------
class IngestTextRequest(BaseModel):
    text: str
    user_id: Optional[str] = None


class AskRequest(BaseModel):
    question: str
    currentState: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None


# ------------------------- Endpoints -------------------------
@router.post("/ingest-text")
def ingest_text(req: IngestTextRequest):
    """Parse pasted listing text into normalized fields plus a quick snapshot.
    Uses Claude; no OCR involved.
    """
    raw = (req.text or "").strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Missing text")

    prompt = f"""
Extract ALL multifamily property details and financials from the text below into this JSON:
{{
  "property": {{"address":"","city":"","state":"","zip":"","units":0,"year_built":0}},
  "pricing_financing": {{"price":0,"price_per_unit":0}},
  "pnl": {{"gross_potential_rent":0,"other_income":0,"vacancy_rate":0,"vacancy_amount":0,"effective_gross_income":0,"operating_expenses":0,"noi":0}},
  "expenses": {{"taxes":0,"insurance":0,"utilities":0,"repairs_maintenance":0,"management":0,"admin":0,"marketing":0,"reserves":0,"total":0}},
  "unit_mix": []
}}

Rules:
- Convert monthly to annual where applicable.
- Use 0 when unknown. Do not hallucinate.
- Return ONLY the JSON object.

TEXT:
{raw[:20000]}
"""

    # Try Anthropic with model fallbacks to avoid 404 not_found errors across SDK versions
    last_err = None
    for model_name in ANTHROPIC_FALLBACK_MODELS:
        try:
            res = ANTHROPIC.messages.create(
                model=model_name,
                max_tokens=4000,
                temperature=0,
                messages=[{"role": "user", "content": prompt}],
            )
            txt = res.content[0].text.strip()
            txt = re.sub(r"```json\s*", "", txt)
            txt = re.sub(r"```\s*", "", txt)
            m = re.search(r"\{.*\}", txt, re.DOTALL)
            data = json.loads(m.group(0) if m else txt)
            break
        except Exception as e:
            last_err = e
            continue
    else:
        raise HTTPException(status_code=502, detail=f"Claude parse failed: {last_err}")

    data = _normalize_and_compute(data)

    # Build snapshot
    pnl = data.get("pnl", {})
    pricing = data.get("pricing_financing", {})
    cap = pnl.get("noi") / pricing.get("price") if (pnl.get("noi") and pricing.get("price")) else None
    snapshot = {
        "capRate": cap,
        "expenseRatio": pnl.get("expense_ratio"),
        "NOI": pnl.get("noi"),
    }

    # Simple missing list
    missing = []
    if data.get("property", {}).get("units") in (None, 0):
        missing.append("property.units")
    if pnl.get("effective_gross_income") is None:
        missing.append("pnl.effective_gross_income")
    if pnl.get("operating_expenses") is None:
        missing.append("pnl.operating_expenses")

    return {
        "ok": True,
        "normalizedFields": data,
        "missingOrAmbiguous": missing,
        "statusSnapshot": snapshot,
        "notes": [],
    }


@router.post("/ask")
def ask(req: AskRequest):
    """LLM-guided, guardrailed adjustments with server-side metric recompute.
    Returns editsPatch + explanation + afterMetrics + decision.
    """
    question = (req.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Missing question")

    current = req.currentState or {}

    # Ask Claude to propose a minimal patch within bounds
    prompt = f"""
You are assisting with a multifamily underwriting scenario. Propose the SMALLEST set of changes to reach the user's goal.
Rules:
- Only propose fields that need changing.
- Allowed fields: purchase.price, purchase.interest_rate, purchase.down_payment_pct, income.vacancy_rate, income.other_income, expenses.total.
- Keep changes realistic and minimal. DON'T return computed metrics, only the patch and a brief explanation.
Return JSON ONLY with this shape:
{{
  "editsPatch": {{ /* only changed fields */ }},
  "explanation": "one short paragraph",
  "intent": "cashflow|dscr|coc|other"
}}

USER QUESTION:
{question}

CURRENT STATE:
{json.dumps(current)[:20000]}
"""

    last_err = None
    for model_name in ANTHROPIC_FALLBACK_MODELS:
        try:
            res = ANTHROPIC.messages.create(
                model=model_name,
                max_tokens=1500,
                temperature=0,
                messages=[{"role": "user", "content": prompt}],
            )
            txt = res.content[0].text.strip()
            txt = re.sub(r"```json\s*", "", txt)
            txt = re.sub(r"```\s*", "", txt)
            m = re.search(r"\{.*\}", txt, re.DOTALL)
            llm = json.loads(m.group(0) if m else txt)
            patch = llm.get("editsPatch", {})
            explanation = llm.get("explanation", "")
            break
        except Exception as e:
            last_err = e
            continue
    else:
        raise HTTPException(status_code=502, detail=f"Claude propose failed: {last_err}")

    # Guardrails
    patch = _clamp_patch(current, patch)
    # Apply patch and recompute
    updated = _deep_apply_patch(current, patch)
    after = _calc_metrics(updated)

    # Simple decision rubric
    decision = "watch"
    dscr = after.get("DSCR") or 0
    coc = after.get("CoC") or 0
    if dscr >= 1.20 and coc >= 0.08:
        decision = "proceed"
    elif dscr < 1.0:
        decision = "pass"

    return {
        "ok": True,
        "editsPatch": patch,
        "explanation": explanation,
        "afterMetrics": after,
        "decision": decision,
    }
