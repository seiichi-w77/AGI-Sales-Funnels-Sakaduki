import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  try {
    const event = await constructWebhookEvent(payload, signature)

    console.log(`[Stripe Webhook] Received event: ${event.type}`)

    const result = await handleWebhookEvent(event)

    if (!result.success) {
      console.error(`[Stripe Webhook] Handler failed: ${result.message}`)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    console.log(`[Stripe Webhook] Handler success: ${result.message}`)
    return NextResponse.json({ received: true, message: result.message })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[Stripe Webhook] Error: ${error}`)
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 })
  }
}
