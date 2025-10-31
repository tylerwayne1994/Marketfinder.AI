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
async def create_checkout_session(request: Request, user_id: str = Query(None)):

    """Create a live Stripe checkout session for the $1/month subscription."""
    import os
    import stripe

    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_key:
        raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY not configured")
    
    # CRITICAL: Verify we're using a LIVE key
    if stripe_key.startswith("sk_test_"):
        log.error("[CHECKOUT] FATAL: Using test key when live key expected!")
        raise HTTPException(status_code=500, detail="Stripe test key detected; live key required")
    
    if not stripe_key.startswith("sk_live_"):
        log.error("[CHECKOUT] FATAL: Stripe key has unexpected prefix: %s", stripe_key[:10])
        raise HTTPException(status_code=500, detail="Invalid Stripe key format")
    
    stripe.api_key = stripe_key
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    key_preview = f"{stripe_key[:15]}...{stripe_key[-4:]}"
    log.info("[CHECKOUT] Using LIVE Stripe key: %s", key_preview)
    log.info("[CHECKOUT] Frontend URL: %s", frontend_url)

    # Allow the frontend/body to override the price id (helps us debug easily)
    env_price_id = os.getenv("STRIPE_STANDARD_MONTHLY_PRICE_ID")
    hardcoded_live_price_id = "price_1SNgjJ2Xp6fFKkWlNaMjlC7Hc"  # $1 live monthly starter plan

    if env_price_id:
        log.info("[CHECKOUT] Loaded price id from env STRIPE_STANDARD_MONTHLY_PRICE_ID=%s", env_price_id)
    else:
        env_price_id = hardcoded_live_price_id
        log.warning(
            "[CHECKOUT] STRIPE_STANDARD_MONTHLY_PRICE_ID not set; using fallback live price %s",
            hardcoded_live_price_id,
        )

    body = {}
    try:
        body = await request.json()
    except Exception:
        body = {}

    # Accept user ID from query or body to support both callers
    user_id = user_id or body.get("user_id") or body.get("userId") or body.get("user")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    requested_price_id = body.get("priceId") or body.get("price_id")
    price_candidates = []
    if requested_price_id:
        price_candidates.append(("requested", requested_price_id))
    price_candidates.append(("default", env_price_id))

    price_obj = None
    price_id = None
    last_error = None

    for source, candidate in price_candidates:
        try:
            current_price = stripe.Price.retrieve(candidate)
            log.info(
                "[CHECKOUT] Using %s price %s | amount=%s %s | livemode=%s | product=%s",
                source,
                current_price.id,
                current_price.unit_amount,
                current_price.currency,
                current_price.livemode,
                current_price.product,
            )
            price_obj = current_price
            price_id = current_price.id
            if source == "requested" and not current_price.livemode:
                log.warning(
                    "[CHECKOUT] Requested price %s is in test mode; falling back to default live price",
                    current_price.id,
                )
                price_obj = None
                price_id = None
                continue
            break
        except Exception as price_error:
            last_error = price_error
            log.warning(
                "[CHECKOUT] Unable to use %s price %s: %s",
                source,
                candidate,
                price_error,
            )

    if not price_obj or not price_id:
        detail = "Unable to retrieve a valid Stripe price"
        if requested_price_id:
            detail += f" (tried override `{requested_price_id}`)"
        if last_error:
            detail += f": {last_error}"
        raise HTTPException(status_code=400, detail=detail)

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
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

        log.info("[CHECKOUT] Session created id=%s url=%s livemode=%s", session.id, session.url, session.livemode)
        
        # CRITICAL: Block test-mode sessions
        if not session.livemode:
            log.error("[CHECKOUT] FATAL: Created session in TEST mode despite live key! session_id=%s", session.id)
            raise HTTPException(
                status_code=500, 
                detail=f"Stripe returned test-mode session {session.id} despite live API key. Check Stripe account configuration."
            )

        return {
            "sessionId": session.id,
            "url": session.url,
            "checkout_url": session.url,
            "price": {
                "id": price_obj.id,
                "amount": price_obj.unit_amount,
                "currency": price_obj.currency,
                "livemode": price_obj.livemode,
            }
        }

    except Exception as e:
        log.exception("[CHECKOUT] Stripe session creation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
