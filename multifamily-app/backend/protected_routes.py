from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from usage_middleware import (
    get_user_limits, 
    get_user_usage, 
    increment_usage, 
    get_usage_summary,
    check_user_access,
    track_usage_after_success
)
from typing import Optional

router = APIRouter()

class PDFParseRequest(BaseModel):
    user_id: str
    page_count: int

class UnderwritingRequest(BaseModel):
    user_id: str

class PFARequest(BaseModel):
    user_id: str

def check_feature_access(user_id: str, feature_type: str, page_count: Optional[int] = None):
    """
    Check if user has access to feature - uses middleware function
    """
    allowed, error_msg, remaining, plan = check_user_access(user_id, feature_type)
    
    if not allowed:
        raise HTTPException(
            status_code=403, 
            detail={
                'error': error_msg,
                'upgrade_required': True,
                'current_plan': plan,
                'feature_required': feature_type
            }
        )
    
    # Additional page limit check for Pro users
    if feature_type == 'upload' and page_count:
        limits = get_user_limits(user_id)
        if limits and plan == 'pro':
            max_pages = limits.get('max_pages_per_pdf', 25)
            if page_count > max_pages:
                raise HTTPException(
                    status_code=403,
                    detail={
                        'error': f'PDF exceeds {max_pages} page limit for Pro plan',
                        'page_count': page_count,
                        'limit': max_pages,
                        'upgrade_required': True,
                        'current_plan': plan
                    }
                )
    
    return plan, remaining

@router.post("/ai-parse-pdf")
async def ai_parse_pdf(request: PDFParseRequest):
    """
    AI PDF parsing with subscription enforcement
    """
    plan, remaining = check_feature_access(request.user_id, 'upload', request.page_count)
    
    # Your AI parsing logic here
    # result = process_ai_pdf_parsing(pdf_content, pages)
    
    # Track usage after successful processing
    track_usage_after_success(
        request.user_id, 
        'upload', 
        {'pages_count': request.page_count}
    )
    
    response_data = {
        'message': 'PDF processed successfully',
        'features_extracted': ['rent_roll', 'expenses', 'income'],
        'pages_processed': request.page_count
    }
    
    # Add remaining count for Pro users
    if plan == 'pro' and remaining > 0:
        response_data['remaining_pdfs'] = remaining - 1
    
    return response_data

@router.post("/underwriting")
async def create_underwriting(request: UnderwritingRequest):
    """
    Manual underwriting analysis
    """
    plan, remaining = check_feature_access(request.user_id, 'manual')
    
    # Your underwriting logic here
    # result = process_manual_underwriting(data)
    
    # Track usage
    track_usage_after_success(request.user_id, 'manual')
    
    return {
        'message': 'Underwriting analysis completed',
        'analysis_id': 'uw_123456',
        'plan': plan
    }

@router.post("/pfa-analysis")
async def property_financial_analysis(request: PFARequest):
    """
    Property Financial Analysis
    """
    plan, remaining = check_feature_access(request.user_id, 'pfa')
    
    # Your PFA logic here
    # result = process_property_financial_analysis(data)
    
    # Track usage
    track_usage_after_success(request.user_id, 'pfa')
    
    return {
        'message': 'Property financial analysis completed',
        'analysis_id': 'pfa_123456',
        'plan': plan
    }


import logging

@router.get("/dashboard/summary")
async def get_dashboard_summary(user_id: str = Query(...)):
    """
    Get usage summary for dashboard
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    try:
        summary = get_usage_summary(user_id)
        if not summary:
            logging.error(f"get_usage_summary returned None for user_id={user_id}")
            raise HTTPException(status_code=500, detail="Unable to get usage summary")
        return summary
    except Exception as e:
        logging.exception(f"Exception in /dashboard/summary for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/access-check")
async def check_user_feature_access(
    user_id: str = Query(...), 
    feature: str = Query(..., description="Feature to check: upload, manual, or pfa")
):
    """
    Check user's access to specific feature
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    allowed, error_msg, remaining, plan = check_user_access(user_id, feature)
    
    return {
        'allowed': allowed,
        'plan': plan,
        'remaining': remaining if remaining > 0 else None,
        'error': error_msg if not allowed else None,
        'feature': feature
    }

@router.get("/user/usage")
async def get_current_usage(user_id: str = Query(...)):
    """
    Get current month's usage for user
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    usage = get_user_usage(user_id)
    limits = get_user_limits(user_id)
    
    if not limits:
        raise HTTPException(status_code=403, detail="No active subscription found")
    
    response_data = {
        'usage': usage,
        'plan': limits.get('user_plan', 'starter'),
        'status': limits.get('status', 'unknown')
    }
    
    # Add limits for Pro users
    if limits.get('user_plan') == 'pro':
        response_data['limits'] = {
            'max_pdfs_per_month': limits.get('max_pdfs_per_month', 15),
            'max_pages_per_pdf': limits.get('max_pages_per_pdf', 25)
        }
        response_data['remaining'] = {
            'pdfs': max(0, limits.get('max_pdfs_per_month', 15) - usage.get('om_pdfs_parsed', 0))
        }
    
    return response_data