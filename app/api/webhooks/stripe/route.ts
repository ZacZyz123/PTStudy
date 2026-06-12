import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

async function setSubscriptionStatus(
  customerId: string,
  fields: { subscription_status: string; stripe_subscription_id?: string | null }
) {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update(fields).eq('stripe_customer_id', customerId)
  if (error) console.error('Webhook profile update failed:', error)
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.customer && session.subscription) {
        await setSubscriptionStatus(session.customer as string, {
          subscription_status: 'active',
          stripe_subscription_id: session.subscription as string,
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await setSubscriptionStatus(subscription.customer as string, {
        subscription_status: 'inactive',
        stripe_subscription_id: null,
      })
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.customer) {
        await setSubscriptionStatus(invoice.customer as string, {
          subscription_status: 'past_due',
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status =
        subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'past_due'
            ? 'past_due'
            : 'inactive'
      await setSubscriptionStatus(subscription.customer as string, {
        subscription_status: status,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
