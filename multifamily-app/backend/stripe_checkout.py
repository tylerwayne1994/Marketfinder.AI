# Reactivate subscription endpoint

# ...existing code...

# Place this after router = APIRouter()

import stripe
import os
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from supabase import create_client
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Create FastAPI router
router = APIRouter()

# Cancel subscription endpoint (must be after router is defined)
@router.post('/cancel-subscription')
async def cancel_subscription(request: Request):
    try:
        data = await request.json()
        subscription_id = data.get('subscriptionId')
        logging.info(f"/cancel-subscription subscriptionId: {subscription_id}")
        if not subscription_id:
            logging.error(f"Missing subscriptionId in request body: {data}")
            return JSONResponse({'error': 'Missing subscriptionId', 'received_body': data}, status_code=400)

        # Cancel the subscription in Stripe
        cancelled = stripe.Subscription.delete(subscription_id)

        # Find the user by Stripe customer ID and update status in Supabase
        customer_id = cancelled['customer']
        # Find user profile by stripe_customer_id
        result = supabase.table('profiles').select('id').eq('stripe_customer_id', customer_id).single().execute()
        if result.data:
            supabase.table('profiles').update({'subscription_status': 'cancelled'}).eq('stripe_customer_id', customer_id).execute()

        return JSONResponse({'success': True})
    except Exception as e:
        logging.error(f"Cancel subscription failed: {str(e)}")
        return JSONResponse({'error': str(e)}, status_code=500)

# Initialize Supabase client
supabase = create_client(
    os.getenv('SUPABASE_URL'), 
    os.getenv('SUPABASE_SERVICE_KEY')
)

@router.post('/create-checkout-session')
async def create_checkout_session(request: Request):
    try:
        data = await request.json()
        user_id = data.get('userId')
        price_id = data.get('priceId')
        
        if not user_id or not price_id:
            return JSONResponse({'error': 'Missing userId or priceId'}, status_code=400, headers={"Access-Control-Allow-Origin": "*"})

        # Get user profile from Supabase
        result = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not result.data:
            return JSONResponse({'error': 'User not found'}, status_code=404, headers={"Access-Control-Allow-Origin": "*"})

        profile = result.data
        
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url=data.get('successUrl', f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/signup?payment=success&session_id={{CHECKOUT_SESSION_ID}}"),
            cancel_url="https://terra-investai.com/dashboard",
            customer_email=profile.get('email'),
            metadata={
                'user_id': user_id,
                'subscription_plan': profile.get('subscription_plan')
            }
        )
        
        return JSONResponse({'checkout_url': session.url})
        
    except Exception as e:
        logging.error(f"Checkout session creation failed: {str(e)}")
        return JSONResponse({'error': 'Failed to create checkout session'}, status_code=500)


# Cancel subscription endpoint
@router.post('/cancel-subscription')
async def cancel_subscription(request: Request):
    try:
        data = await request.json()
        subscription_id = data.get('subscriptionId')
        if not subscription_id:
            return JSONResponse({'error': 'Missing subscriptionId'}, status_code=400)

        # Cancel the subscription in Stripe
        cancelled = stripe.Subscription.delete(subscription_id)

        # Find the user by Stripe customer ID and update status in Supabase
        customer_id = cancelled['customer']
        # Find user profile by stripe_customer_id
        result = supabase.table('profiles').select('id').eq('stripe_customer_id', customer_id).single().execute()
        if result.data:
            supabase.table('profiles').update({'subscription_status': 'cancelled'}).eq('stripe_customer_id', customer_id).execute()

        return JSONResponse({'success': True})
    except Exception as e:
        logging.error(f"Cancel subscription failed: {str(e)}")
        return JSONResponse({'error': str(e)}, status_code=500)