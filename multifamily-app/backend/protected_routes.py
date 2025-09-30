# backend/protected_routes.py
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

@router.get("/dashboard/summary")
async def dashboard_summary(user_id: str = Query(...)):
    # Minimal, DB-free summary so the UI can render
    return {
        "plan": "starter",           # starter | pro | power
        "status": "inactive",        # active | pending | cancelling | inactive
        "current_month": "This month",
        "usage": {
            "om_pdfs_parsed": 0,
            "pages_processed": 0,
            "underwriting_sessions": 0
        },
        # Only present for pro in your UI, but harmless to include
        "limits": {
            "max_pdfs_per_month": 15,
            "max_pages_per_pdf": 25
        },
        "remaining": {
            "pdfs": 15
        }
    }

@router.get("/user/access-check")
async def access_check(
    user_id: str = Query(...),
    feature: str = Query(..., description="upload | manual | pfa")
):
    # Allow everything for now; UI just needs the shape
    return {"allowed": True, "plan": "starter", "remaining": None, "feature": feature, "error": None}

@router.get("/user/usage")
async def user_usage(user_id: str = Query(...)):
    # Zero usage with a starter plan
    return {
        "usage": {
            "om_pdfs_parsed": 0,
            "pages_processed": 0,
            "underwriting_sessions": 0
        },
        "plan": "starter",
        "status": "inactive",
        "limits": {
            "max_pdfs_per_month": 15,
            "max_pages_per_pdf": 25
        },
        "remaining": {"pdfs": 15}
    }
