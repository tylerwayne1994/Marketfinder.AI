# stripe_checkout.py
import os, uuid, logging, json
from typing import Optional, Dict, Any

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import stripe
from supabase import create_client

load_dotenv()

# ---- Env
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")  # set per env (test/prod)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not STRIPE_SECRET_KEY: raise RuntimeError("Missing STRIPE_SECRET_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY: raise RuntimeError("Missing Supabase env")

stripe.api_key = STRIPE_SECRET_KEY
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

checkout_bp = Blueprint("checkout_bp", __name__)

# ---- Helpers
def ok(data: Dict[str, Any], code: int = 200):
    return jsonify(data), code

def err(msg: str, code: int = 400, extra: Optional[Dict[str, Any]] = None):
    payload = {"error": msg}
    if extra: payload.update(extra)
    return jsonify(payload), code

def default_success_url() -> str:
    # Use SID placeholder for post-redirect reconciliation
    return f"{FRONTEND_URL}/billing/return?sid={{CHECKOUT_SESSION_ID}}"

def default_cancel_url() -> str:
    # Hosted Checkout back arrow goes here
    return f"{FRONTEND_URL}/dashboard#page=3"

def get_profile(user_id: str) -> Optional[Dict[str, Any]]:
    res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return res.data

def update_profile_by_customer(customer_id: str, updates: Dict[str, Any]) -> None:
    supabase.table("profiles").update(updates).eq("stripe_customer_id", customer_id).execute()

def ensure_stripe_customer(profile: Dict[str, Any]) -> str:
    cust = profile.get("stripe_customer_id")
    if cust: return cust
    created = stripe.Customer.create(
        email=profile.get("email"),
        metadata={"user_id": profile.get("id")}
    )
    supabase.table("profiles").update({"stripe_customer_id": created.id}).eq("id", profile.get("id")).execute()
    return created.id

# ---- Routes
@checkout_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    """
    Body JSON: { userId, priceId, successUrl?, cancelUrl? }
    Hosted Checkout back arrow -> cancelUrl
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        user_id = data.get("userId")
        price_id = data.get("priceId")
        if not user_id or not price_id:
            return err("Missing userId or priceId", 400)

        profile = get_profile(user_id)
        if not profile:
            return err("User not found", 404)

        customer_id = ensure_stripe_customer(profile)
        success_url = data.get("successUrl") or default_success_url()
        cancel_url = data.get("cancelUrl") or default_cancel_url()

        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            customer=customer_id,
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=user_id,
            metadata={"user_id": user_id, "plan_from_client": str(profile.get("subscription_plan") or "")},
            idempotency_key=str(uuid.uuid4()),
        )

        return ok({"checkout_url": session.url, "session_id": session.id})
    except Exception as e:
        logging.exception("create-checkout-session failed")
        return err("Failed to create checkout session", 500, {"detail": str(e)})

@checkout_bp.route("/cancel-subscription", methods=["POST"])
def cancel_subscription():
    """
    Body JSON: { subscriptionId }
    Cancels in Stripe. Webhook is source of truth; this does best-effort immediate update.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        sub_id = data.get("subscriptionId")
        if not sub_id:
            return err("Missing subscriptionId", 400)

        cancelled = stripe.Subscription.delete(sub_id)
        customer_id = cancelled.get("customer")
        if customer_id:
            update_profile_by_customer(customer_id, {"subscription_status": "canceled"})

        return ok({"success": True, "subscription": cancelled})
    except Exception as e:
        logging.exception("cancel-subscription failed")
        return err("Cancel subscription failed", 500, {"detail": str(e)})

@checkout_bp.route("/stripe/webhook", methods=["POST"])
def stripe_webhook():
    if not STRIPE_WEBHOOK_SECRET:
        return err("Webhook not configured", 500)

    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        logging.warning(f"Webhook signature verification failed: {e}")
        return err("Invalid signature", 400)

    try:
        etype = event.get("type")
        obj = event.get("data", {}).get("object", {})

        if etype == "checkout.session.completed":
            customer_id = obj.get("customer")
            subscription_id = obj.get("subscription")
            if customer_id:
                update_profile_by_customer(customer_id, {
                    "subscription_status": "active",
                    "stripe_subscription_id": subscription_id
                })

        elif etype == "customer.subscription.updated":
            customer_id = obj.get("customer")
            status = obj.get("status")
            if customer_id:
                update_profile_by_customer(customer_id, {"subscription_status": status})

        elif etype == "customer.subscription.deleted":
            customer_id = obj.get("customer")
            if customer_id:
                update_profile_by_customer(customer_id, {"subscription_status": "canceled"})

        # Add invoice.paid/payment_failed if you need them

        return ok({"received": True})
    except Exception as e:
        logging.exception("Webhook handler error")
        return err("Webhook handler error", 500, {"detail": str(e)})

# Optional health check
@checkout_bp.route("/health", methods=["GET"])
def health():
    return ok({"ok": True})
