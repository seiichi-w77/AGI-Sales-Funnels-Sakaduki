import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'usd',
  paymentMethods: ['card'],
  billingPortalReturnUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing',
  successUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?success=true',
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?canceled=true',
} as const

export const PLANS = {
  starter: {
    name: 'Starter',
    priceMonthly: 9700,
    priceYearly: 97000,
    features: [
      '3 Funnels',
      '20 Pages',
      '1,000 Contacts',
      '5,000 Emails/month',
      '1 Course',
      '1 Custom Domain',
    ],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 29700,
    priceYearly: 297000,
    features: [
      'Unlimited Funnels',
      'Unlimited Pages',
      '10,000 Contacts',
      '50,000 Emails/month',
      'Unlimited Courses',
      '3 Custom Domains',
      'Affiliate Program',
      'A/B Testing',
    ],
  },
  funnelHacker: {
    name: 'Funnel Hacker',
    priceMonthly: 49700,
    priceYearly: 497000,
    features: [
      'Everything in Pro',
      'Unlimited Contacts',
      'Unlimited Emails',
      'Unlimited Custom Domains',
      'Priority Support',
      'API Access',
    ],
  },
} as const
