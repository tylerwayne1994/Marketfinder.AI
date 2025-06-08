import { loadStripe } from '@stripe/stripe-js'

// Load Stripe with your publishable key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key. Please check your .env.local file.')
}

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey)

// Stripe configuration for single $99/month plan
export const stripeConfig = {
  publishableKey: stripePublishableKey,
  priceId: process.env.REACT_APP_STRIPE_PRICE_ID // Single price ID for $99/month
}

// Plan details for your single subscription
export const planDetails = {
  name: 'MultifamilyAI',
  price: 99,
  currency: 'USD',
  interval: 'month',
  features: [
    'Unlimited property analyses',
    'Advanced AI-powered underwriting',
    'Property scraping from major platforms',
    'Interactive market heat maps',
    'Legal document generator',
    'Portfolio tracking & analytics',
    'Real-time deal alerts',
    'Priority customer support'
  ],
  trialDays: 3
}

export default stripePromise