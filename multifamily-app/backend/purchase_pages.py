# Create this endpoint in protected_routes.py to handle purchasing additional pages
# Integrated with Stripe for LIVE mode

from fastapi import APIRouter, Request, Depends, HTTPException
from typing import Dict, Any
import json
import os

router = APIRouter()

# LIVE 60-page pack price ID ($25 one-time)
SIXTY_PAGE_PACK_PRICE_ID = "price_1SMXu02Xp6FKKwINH5pgt67b"

@router.post("/purchase-additional-pages")
async def purchase_additional_pages(request: Request):
    """
    Create Stripe checkout session for 60-page pack ($25 one-time payment)
    """
    try:
        import stripe
        
        data = await request.json()
        user_id = data.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Create Stripe checkout session for 60-page pack
        session = stripe.checkout.Session.create(
            mode="payment",  # One-time payment
            payment_method_types=["card"],
            line_items=[{
                "price": SIXTY_PAGE_PACK_PRICE_ID,
                "quantity": 1
            }],
            success_url=f"{frontend_url}/?subscription=success&redirect=underwrite",
            cancel_url=f"{frontend_url}/?subscription=cancelled",
            client_reference_id=user_id,
            metadata={
                "user_id": user_id,
                "product_type": "60_page_pack"
            }
        )
        
        return {
            "success": True,
            "sessionId": session.id,
            "url": session.url
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")