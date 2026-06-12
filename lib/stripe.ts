import Stripe from 'stripe'

let stripeClient: Stripe | null = null

/** Server-side Stripe client (lazy so builds don't require the secret). */
export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeClient
}
