
'use server';

import { stripe } from '@/lib/stripe';
import type { Plan } from '@/lib/types';
import { z } from 'zod';
import { headers } from 'next/headers';

const schema = z.object({
  plan: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    memberLimit: z.object({
      min: z.number(),
      max: z.number().nullable(),
    }),
  }),
});

export async function createCheckoutSession(
  data: { plan: Plan }
): Promise<{ sessionId: string }> {
  // Check if Stripe is configured
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Please add your Stripe secret key to the environment variables.');
  }


  const validation = schema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid plan data');
  }

  const { plan } = validation.data;
  const origin = headers().get('origin') || 'http://localhost:9002';

  // Check if a price for this plan already exists in Stripe
  let priceId;
  const prices = await stripe.prices.list({
    lookup_keys: [plan.id],
    expand: ['data.product']
  });

  if (prices.data.length > 0) {
    priceId = prices.data[0].id;
  } else {
    // If no price exists, create a new product and price
    const product = await stripe.products.create({
      name: plan.name,
    });
    const newPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price * 100, // Price in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: plan.id,
    });
    priceId = newPrice.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/plans?payment=cancelled`,
  });

  if (!session.id) {
    throw new Error('Could not create checkout session');
  }

  return { sessionId: session.id };
}
