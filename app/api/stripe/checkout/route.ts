import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? user.email,
        name: profile.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel`,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
