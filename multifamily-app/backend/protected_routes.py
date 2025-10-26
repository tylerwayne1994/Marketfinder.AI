# backend/protected_routes.py
from fastapi import APIRouter, HTTPException, Query, Request
import logging

router = APIRouter()
log = logging.getLogger("protected_routes")

# ---- Optional subrouters (guarded to avoid import-time crashes) ----
def _try_include(module_name: str, attr: str = "router"):
    try:
        mod = __import__(module_name, fromlist=[attr])
        sub = getattr(mod, attr)
        router.include_router(sub)
    except Exception as e:
        log.exception("Failed to include %s.%s: %s", module_name, attr, e)

# purchase_additional_pages should be a FastAPI-compatible endpoint func
try:
    from purchase_pages import purchase_additional_pages
    router.post("/purchase-additional-pages")(purchase_additional_pages)
except Exception as e:
    log.exception("purchase_pages import failed: %s", e)

_try_include("check_document_access", "router")
_try_include("delete_user", "router")

# ---- Simple, DB-free endpoints that your UI expects ----
@router.get("/dashboard/summary")
async def dashboard_summary(user_id: str = Query(...)):
    """Get dashboard summary with actual usage data from Supabase"""
    from datetime import datetime
    from supabase import create_client
    import os
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    # Use service role key for backend operations (bypasses RLS)
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        # Fallback to defaults if env vars not set
        return {
            "plan": "starter",
            "status": "active",
            "current_month": "This month",
            "usage": {"pages_used": 0, "om_pdfs_parsed": 0, "pages_processed": 0, "underwriting_sessions": 0},
            "limits": {"pages_per_month": 50, "max_pages_per_pdf": 25},
            "remaining": {"pages": 50},
        }
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # Get current month in YYYY-MM format
        current_month = datetime.now().strftime("%Y-%m")
        
        # Get user profile for additional pages purchased
        profile_response = supabase.table("profiles").select("additional_pages_purchased").eq("id", user_id).execute()
        additional_pages = 0
        if profile_response.data and len(profile_response.data) > 0:
            additional_pages = profile_response.data[0].get("additional_pages_purchased", 0) or 0
        
        # Query user_usage table for current month
        response = supabase.table("user_usage").select("*").eq("user_id", user_id).eq("month_year", current_month).execute()
        
        # Extract usage data
        if response.data and len(response.data) > 0:
            usage_record = response.data[0]
            pages_processed = usage_record.get("pages_processed", 0)
            om_pdfs_parsed = usage_record.get("om_pdfs_parsed", 0)
            underwriting_sessions = usage_record.get("underwriting_sessions", 0)
        else:
            # No usage record for this month yet
            pages_processed = 0
            om_pdfs_parsed = 0
            underwriting_sessions = 0
        
        # Calculate total pages limit: base plan (50) + additional pages purchased
        base_pages_limit = 50
        total_pages_limit = base_pages_limit + additional_pages
        
        # Calculate remaining pages
        pages_remaining = max(0, total_pages_limit - pages_processed)
        
        return {
            "plan": "starter",
            "status": "active",
            "current_month": current_month,
            "usage": {
                "pages_used": pages_processed,  # For backwards compatibility
                "om_pdfs_parsed": om_pdfs_parsed,
                "pages_processed": pages_processed,
                "underwriting_sessions": underwriting_sessions
            },
            "limits": {"pages_per_month": total_pages_limit, "max_pages_per_pdf": 25},
            "remaining": {"pages": pages_remaining},
        }
    except Exception as e:
        print(f"Error fetching usage data: {e}")
        # Return defaults on error
        return {
            "plan": "starter",
            "status": "active",
            "current_month": "This month",
            "usage": {"pages_used": 0, "om_pdfs_parsed": 0, "pages_processed": 0, "underwriting_sessions": 0},
            "limits": {"pages_per_month": 50, "max_pages_per_pdf": 25},
            "remaining": {"pages": 50},
        }

@router.get("/user/access-check")
async def access_check(
    user_id: str = Query(...),
    feature: str = Query(..., description="upload | manual | pfa")
):
    # Let the backend be the single source of truth.
    return {"allowed": True, "plan": "starter", "remaining": None, "feature": feature, "error": None}

@router.get("/user/usage")
async def user_usage(user_id: str = Query(...)):
    """Get user usage data from Supabase"""
    from datetime import datetime
    from supabase import create_client
    import os
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    # Use service role key for backend operations (bypasses RLS)
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        # Fallback to defaults if env vars not set
        return {
            "usage": {"pages_used": 0, "om_pdfs_parsed": 0, "pages_processed": 0, "underwriting_sessions": 0},
            "plan": "starter",
            "status": "active",
            "limits": {"pages_per_month": 50, "max_pages_per_pdf": 25},
            "remaining": {"pages": 50},
        }
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # Get current month in YYYY-MM format
        current_month = datetime.now().strftime("%Y-%m")
        
        # Get user profile for additional pages purchased
        profile_response = supabase.table("profiles").select("additional_pages_purchased").eq("id", user_id).execute()
        additional_pages = 0
        if profile_response.data and len(profile_response.data) > 0:
            additional_pages = profile_response.data[0].get("additional_pages_purchased", 0) or 0
        
        # Query user_usage table for current month
        response = supabase.table("user_usage").select("*").eq("user_id", user_id).eq("month_year", current_month).execute()
        
        # Extract usage data
        if response.data and len(response.data) > 0:
            usage_record = response.data[0]
            pages_processed = usage_record.get("pages_processed", 0)
            om_pdfs_parsed = usage_record.get("om_pdfs_parsed", 0)
            underwriting_sessions = usage_record.get("underwriting_sessions", 0)
        else:
            # No usage record for this month yet
            pages_processed = 0
            om_pdfs_parsed = 0
            underwriting_sessions = 0
        
        # Calculate total pages limit: base plan (50) + additional pages purchased
        base_pages_limit = 50
        total_pages_limit = base_pages_limit + additional_pages
        
        # Calculate remaining pages
        pages_remaining = max(0, total_pages_limit - pages_processed)
        
        return {
            "usage": {
                "pages_used": pages_processed,  # For backwards compatibility
                "om_pdfs_parsed": om_pdfs_parsed,
                "pages_processed": pages_processed,
                "underwriting_sessions": underwriting_sessions
            },
            "plan": "starter",
            "status": "active",
            "limits": {"pages_per_month": total_pages_limit, "max_pages_per_pdf": 25},
            "remaining": {"pages": pages_remaining},
        }
    except Exception as e:
        print(f"Error fetching usage data: {e}")
        # Return defaults on error
        return {
            "usage": {"pages_used": 0, "om_pdfs_parsed": 0, "pages_processed": 0, "underwriting_sessions": 0},
            "plan": "starter",
            "status": "active",
            "limits": {"pages_per_month": 50, "max_pages_per_pdf": 25},
            "remaining": {"pages": 50},
        }

# ============================================================================
# STRIPE SUBSCRIPTION MANAGEMENT
# ============================================================================

print("[PROTECTED ROUTES] Registering cancel-subscription endpoint")

@router.options("/cancel-subscription")
async def cancel_subscription_options():
    """Handle OPTIONS preflight for cancel-subscription"""
    from fastapi.responses import Response
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.post("/cancel-subscription")
async def cancel_subscription(request: Request, user_id: str = Query(None)):
    """Cancel user's Stripe subscription"""
    import os
    import stripe
    from supabase import create_client
    from fastapi.responses import JSONResponse
    
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    # Get Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    supabase = create_client(supabase_url, supabase_key)
    
    try:
        # If user_id not provided as query param, try to read JSON body
        if not user_id:
            try:
                body = await request.json()
                user_id = body.get('user_id') or body.get('userId') or body.get('user')
            except Exception:
                user_id = None

        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")

        # Get user's stripe_customer_id from profiles
        result = supabase.table("profiles").select("stripe_customer_id").eq("id", user_id).single().execute()
        
        if not result.data or not result.data.get("stripe_customer_id"):
            raise HTTPException(status_code=404, detail="No subscription found")
        
        stripe_customer_id = result.data["stripe_customer_id"]
        print(f"[CANCEL SUB] Looking for subscriptions for customer: {stripe_customer_id}")
        
        # Get active subscriptions for this customer
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=10
        )
        
        print(f"[CANCEL SUB] Found {len(subscriptions.data)} active subscriptions")
        print(f"[CANCEL SUB] Subscriptions: {[s.id for s in subscriptions.data]}")
        
        if not subscriptions.data:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        # Cancel the first active subscription
        subscription = subscriptions.data[0]
        cancelled_sub = stripe.Subscription.delete(subscription.id)
        
        # Update Supabase profile
        supabase.table("profiles").update({
            "subscription_status": "cancelled",
            "stripe_subscription_id": None
        }).eq("id", user_id).execute()
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Subscription cancelled successfully",
                "cancelled_at": cancelled_sub.canceled_at
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        if "stripe" in str(type(e)).lower():
            raise HTTPException(status_code=400, detail=str(e))
        print(f"Error cancelling subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-checkout-session")
async def create_checkout_session(user_id: str = Query(...)):
    """Create Stripe checkout session for $60/month subscription"""
    import os
    import stripe
    
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # LIVE Monthly subscription price ID ($1/month for testing)
    MONTHLY_SUBSCRIPTION_PRICE_ID = "price_1SMa3C2Xp6FKKwINynG52E6N"
    
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": MONTHLY_SUBSCRIPTION_PRICE_ID,
                "quantity": 1
            }],
            success_url=f"{frontend_url}/dashboard?subscription=success",
            cancel_url=f"{frontend_url}/?subscription=cancelled",
            client_reference_id=user_id,
            metadata={
                "user_id": user_id,
                "subscription_type": "monthly"
            }
        )
        
        return {
            "sessionId": session.id,
            "url": session.url
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
