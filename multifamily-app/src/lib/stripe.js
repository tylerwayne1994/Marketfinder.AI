import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 35,
    priceId: 'price_1S1cAc2VFAlQshuqsVTF14Op'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    priceId: 'price_1S1cCR2VFAlQshuqGK9uNtSK'
  },
  power: {
    id: 'power',
    name: 'Power',
    price: 199,
    priceId: 'price_1S1cBM2VFAlQshuqgj3lNfja'
  }
};

export default stripePromise;