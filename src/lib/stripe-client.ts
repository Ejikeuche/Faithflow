
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
       if (process.env.NODE_ENV !== 'production') {
         console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Using a dummy key for development. This will fail in production.');
         stripePromise = loadStripe('pk_test_dummy_key');
       } else {
          console.error('Stripe publishable key is not set.');
          return Promise.resolve(null);
       }
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};
