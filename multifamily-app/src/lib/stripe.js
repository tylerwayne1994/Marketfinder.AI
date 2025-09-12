import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 35,
  priceId: 'price_1S6Khq2Xp6FKKwINgUI5caDQ'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
  priceId: 'price_1S6Kk62Xp6FKKwINIyh13ZGN'
  },
  power: {
    id: 'power',
    name: 'Power',
    price: 199,
  priceId: 'price_1S6Kit2Xp6FKKwINQBHnNglZ'
  }
};

export default stripePromise;