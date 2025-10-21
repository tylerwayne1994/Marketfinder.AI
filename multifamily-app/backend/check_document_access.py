# check_document_access.py - Simple document access checking
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

router = APIRouter()

@router.get("/document/check-access")
async def check_document_access(
    user_id: str = Query(...),
    pages_requested: Optional[int] = Query(1),
    feature: Optional[str] = Query("upload")
):
    """
    Simple document access check - allow everything for now
    """
    return {
        "allowed": True,
        "plan": "starter",
        "remaining": {"pages": 1000, "documents": 100},
        "limits": {"max_pages_per_month": 1000, "max_documents_per_month": 100},
        "feature": feature,
        "error": None
    }