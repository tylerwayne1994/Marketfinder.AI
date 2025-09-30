from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# ---- Request models (kept so your client payloads don't break)
class PDFParseRequest(BaseModel):
    user_id: str
    page_count: int

class UnderwritingRequest(BaseModel):
    user_id: str

class PFARequest(BaseModel):
    user_id: str

# ---- Helpers
def _current_month_label() -> str:
    return datetime.utcnow().strftime("%B %Y")

def _default_usage():
    return {
        "om_pdfs_parsed": 0,
        "pages_processed": 0,
        "underwriting_sessions": 0,
    }

# =========================================
# ==========  PUBLIC API ROUTES  ==========
# =========================================

@router.get("/dashboard/summary")
async def get_dashboard_summary(user_id: str = Query(...)):
    """
    TEMP: Return safe defaults so the dashboard never 500s.
    No calls to usage_middleware or usage/limits tables.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")

    return {
        "usage": _default_usage(),
        "limits": None,                    # no limits until you reintroduce them
        "remaining": {"pdfs": 0},          # computed only when limits exist
        "plan": "starter",                 # read from profiles later if you want
        "status": "inactive",              # ditto
        "current_month": _current_month_label(),
    }

@router.get("/user/access-check")
async def check_user_feature_access(
    user_id: str = Query(...),
    feature: str = Query(..., description="Feature to check: upload, manual, or pfa"),
):
    """
    TEMP: Always allow, no subscription gating.
    Change this later when you add limits/Stripe.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")

    return {
        "allowed": True,
        "plan": "starter",
        "remaining": None,
        "error": None,
        "feature": feature,
    }

@router.get("/user/usage")
async def get_current_usage(user_id: str = Query(...)):
    """
    TEMP: Return zeroed usage and starter/inactive plan.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")

    return {
        "usage": _default_usage(),
        "plan": "starter",
        "status": "inactive",
        "limits": None,
        "remaining": {"pdfs": 0},
    }

# The following endpoints are stubbed to avoid touching usage_middleware.
# Keep them if your client calls them; they just return success.
@router.post("/ai-parse-pdf")
async def ai_parse_pdf(request: PDFParseRequest):
    if not request.user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return {
        "message": "PDF processed (stubbed).",
        "features_extracted": [],
        "pages_processed": int(request.page_count),
    }

@router.post("/underwriting")
async def create_underwriting(request: UnderwritingRequest):
    if not request.user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return {
        "message": "Underwriting analysis completed (stubbed).",
        "analysis_id": "uw_stub",
        "plan": "starter",
    }

@router.post("/pfa-analysis")
async def property_financial_analysis(request: PFARequest):
    if not request.user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return {
        "message": "Property financial analysis completed (stubbed).",
        "analysis_id": "pfa_stub",
        "plan": "starter",
    }
