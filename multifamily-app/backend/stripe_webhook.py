import stripe
import os
import json
import logging
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize
router = APIRouter()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

supabase = create_client(
    os.getenv('SUPABASE_URL'), 
    os.getenv('SUPABASE_SERVICE_KEY')
)

@router.post('/stripe-webhook')
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    logging.info("Webhook received")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        logging.info(f"Webhook event type: {event['type']}")
    except ValueError:
        logging.error("Invalid payload")
        return JSONResponse({'error': 'Invalid payload'}, status_code=400)
    except stripe.error.SignatureVerificationError:
        logging.error("Invalid signature")
        return JSONResponse({'error': 'Invalid signature'}, status_code=400)

    # Handle checkout.session.completed and customer.subscription.created
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        subscription_id = session.get('subscription')
        customer_id = session.get('customer')
        logging.info(f"[Webhook] checkout.session.completed: user_id={user_id}, customer_id={customer_id}, subscription_id={subscription_id}")
        logging.info(f"[Webhook] session object: {session}")
        try:
            update_fields = {
                'subscription_status': 'active',
                'stripe_customer_id': customer_id
            }
            if subscription_id:
                update_fields['stripe_subscription_id'] = subscription_id
            result = supabase.table('profiles').update(update_fields).eq('id', user_id).execute()
            logging.info(f"[Webhook] Supabase update result: {result}")
        except Exception as e:
            logging.error(f"[Webhook] Failed to update user {user_id}: {str(e)}")
            return JSONResponse({'error': 'Database update failed'}, status_code=500)

    elif event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        subscription_id = subscription.get('id')
        logging.info(f"[Webhook] customer.subscription.created: customer_id={customer_id}, subscription_id={subscription_id}")
        logging.info(f"[Webhook] subscription object: {subscription}")
        try:
            result = supabase.table('profiles').select('id').eq('stripe_customer_id', customer_id).single().execute()
            if result.data:
                update_fields = {
                    'stripe_subscription_id': subscription_id,
                    'subscription_status': 'active'
                }
                supabase.table('profiles').update(update_fields).eq('stripe_customer_id', customer_id).execute()
                logging.info(f"[Webhook] Subscription ID updated for customer {customer_id}")
            else:
                logging.error(f"[Webhook] No user found with stripe_customer_id={customer_id} to update subscription_id.")
        except Exception as e:
            logging.error(f"[Webhook] Failed to update subscription for {customer_id}: {str(e)}")

    # Handle subscription.deleted (cancellation)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription['customer']
        
        logging.info(f"Processing subscription cancellation for customer: {customer_id}")
        
        try:
            # Find user by customer ID and update status
            result = supabase.table('profiles').select('id').eq('stripe_customer_id', customer_id).single().execute()
            
            if result.data:
                supabase.table('profiles').update({
                    'subscription_status': 'cancelled'
                }).eq('stripe_customer_id', customer_id).execute()
                
                logging.info(f"Subscription cancelled for customer {customer_id}")
                
        except Exception as e:
            logging.error(f"Failed to cancel subscription for {customer_id}: {str(e)}")

    return JSONResponse({'status': 'success'}, status_code=200)