
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // In a real application, you'd want to log this error more formally
  // For this context, we will throw an error during development if the key is missing.
  if (process.env.NODE_ENV === 'development') {
    console.warn('STRIPE_SECRET_KEY is not set in the environment variables. Using a dummy key for development.');
  } else {
    throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
  }
}

export const stripe = new Stripe(secretKey || 'sk_test_dummy_key', {
  apiVersion: '2024-04-10',
  typescript: true,
});
