# Backend endpoint for purchasing additional pages
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any
import json
import os
import logging

router = APIRouter()
log = logging.getLogger("purchase_pages")

# LIVE 60-page pack price ID
DEFAULT_SIXTY_PAGE_PACK_PRICE_ID = "price_1SOoIO2Xp6FKKwINoJmmZtAM"  # $25 one-time

@router.post("/purchase-additional-pages")
async def purchase_additional_pages(request: Request):
    """
    Create Stripe checkout session for 60-page pack (one-time payment)
    """
    try:
        import stripe
        
        data = await request.json()
        user_id = data.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        stripe_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_key:
            raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY not configured")
        
        # Verify live mode
        if stripe_key.startswith("sk_test_"):
            log.error("[PURCHASE] Using test key when live key expected!")
            raise HTTPException(status_code=500, detail="Stripe test key detected; live key required")
        
        stripe.api_key = stripe_key
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Get price ID from env or use default
        price_id = os.getenv("STRIPE_ADDITIONAL_PAGES_PRICE_ID", DEFAULT_SIXTY_PAGE_PACK_PRICE_ID)
        log.info("[PURCHASE] Using price ID: %s", price_id)
        
        # Verify the price exists and is in live mode
        try:
            price_obj = stripe.Price.retrieve(price_id)
            if not price_obj.livemode:
                log.error("[PURCHASE] Price is in test mode!")
                raise HTTPException(status_code=500, detail="Price must be in live mode")
            log.info("[PURCHASE] Price verified: %s %s | livemode=%s", 
                    price_obj.unit_amount, price_obj.currency, price_obj.livemode)
        except Exception as e:
            log.error("[PURCHASE] Failed to retrieve price: %s", e)
            raise HTTPException(status_code=400, detail=f"Invalid price ID: {str(e)}")
        
        # Create Stripe checkout session for 60-page pack
        session = stripe.checkout.Session.create(
            mode="payment",  # One-time payment
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            success_url=f"{frontend_url}/dashboard?purchase=success",
            cancel_url=f"{frontend_url}/dashboard?purchase=cancelled",
            client_reference_id=user_id,
            metadata={
                "user_id": user_id,
                "product_type": "60_page_pack"
            }
        )
        
        log.info("[PURCHASE] Session created: id=%s url=%s livemode=%s", 
                session.id, session.url, session.livemode)
        
        # Block test-mode sessions
        if not session.livemode:
            log.error("[PURCHASE] Created session in TEST mode despite live key!")
            raise HTTPException(status_code=500, detail="Session must be in live mode")
        
        return {
            "success": True,
            "sessionId": session.id,
            "url": session.url,
            "checkout_url": session.url
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")