
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('STRIPE_SECRET_KEY is not set in the environment variables. Using a dummy key for development. This will fail in production.');
  } else {
    throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
  }
}

export const stripe = new Stripe(secretKey || 'sk_test_dummy_key', {
  apiVersion: '2024-04-10',
  typescript: true,
});
