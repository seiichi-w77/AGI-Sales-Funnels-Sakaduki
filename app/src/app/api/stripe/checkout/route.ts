import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, workspaceId, customerEmail, customerId, trialDays, successUrl, cancelUrl } =
      body

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 })
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const session = await createCheckoutSession({
      priceId,
      workspaceId,
      customerEmail,
      customerId,
      trialDays,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Checkout] Error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
