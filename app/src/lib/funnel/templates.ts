import type { FunnelType, FunnelStepType } from '@prisma/client'

export interface FunnelTemplate {
  id: string
  name: string
  description: string
  type: FunnelType
  thumbnail: string
  category: 'lead_generation' | 'sales' | 'webinar' | 'membership' | 'ecommerce'
  steps: {
    name: string
    slug: string
    type: FunnelStepType
    pageContent: Record<string, unknown>
  }[]
}

/**
 * Lead Magnet Funnel Template
 */
const leadMagnetTemplate: FunnelTemplate = {
  id: 'lead-magnet',
  name: 'Lead Magnet Funnel',
  description: 'Capture leads with a free offer. Perfect for building your email list.',
  type: 'LEAD_MAGNET',
  thumbnail: '/templates/lead-magnet.png',
  category: 'lead_generation',
  steps: [
    {
      name: 'Opt-in Page',
      slug: 'optin',
      type: 'OPTIN',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'hero',
            styles: {
              backgroundColor: '#1e293b',
              padding: '80px 20px',
              textAlign: 'center',
            },
            children: [
              {
                type: 'heading',
                content: { text: 'Get Your Free [Lead Magnet] Now!', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '48px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Discover the secrets to [benefit] without [pain point]' },
                styles: { color: '#94a3b8', fontSize: '20px', marginBottom: '40px' },
              },
            ],
          },
          {
            type: 'section',
            id: 'form',
            styles: {
              backgroundColor: '#0f172a',
              padding: '60px 20px',
            },
            children: [
              {
                type: 'form',
                fields: [
                  { name: 'firstName', type: 'text', label: 'First Name', required: true },
                  { name: 'email', type: 'email', label: 'Email Address', required: true },
                ],
                submitButton: {
                  text: 'Get Instant Access',
                  styles: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 32px' },
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Thank You Page',
      slug: 'thank-you',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmation',
            styles: {
              backgroundColor: '#1e293b',
              padding: '80px 20px',
              textAlign: 'center',
            },
            children: [
              {
                type: 'heading',
                content: { text: 'Thank You!', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '48px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Your [Lead Magnet] is on its way to your inbox.' },
                styles: { color: '#94a3b8', fontSize: '20px', marginBottom: '40px' },
              },
              {
                type: 'text',
                content: { text: 'While you wait, check out our special offer below...' },
                styles: { color: '#ffffff', fontSize: '18px' },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * VSL (Video Sales Letter) Funnel Template
 */
const vslTemplate: FunnelTemplate = {
  id: 'vsl-funnel',
  name: 'Video Sales Letter Funnel',
  description: 'High-converting video sales page with order form. Perfect for digital products.',
  type: 'VSL',
  thumbnail: '/templates/vsl.png',
  category: 'sales',
  steps: [
    {
      name: 'Sales Page',
      slug: 'sales',
      type: 'SALES',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'hero',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Attention: [Target Audience]', level: 'h2' },
                styles: { color: '#fbbf24', fontSize: '18px', marginBottom: '10px' },
              },
              {
                type: 'heading',
                content: { text: 'How To [Achieve Result] In [Timeframe]', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '42px', marginBottom: '30px' },
              },
            ],
          },
          {
            type: 'section',
            id: 'video',
            styles: { backgroundColor: '#0f172a', padding: '40px 20px' },
            children: [
              {
                type: 'video',
                content: {
                  url: '',
                  poster: '',
                  autoplay: false,
                  controls: true,
                },
                styles: { maxWidth: '800px', margin: '0 auto' },
              },
            ],
          },
          {
            type: 'section',
            id: 'cta',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'button',
                content: { text: 'Yes! I Want This Now' },
                styles: {
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '20px 40px',
                  fontSize: '20px',
                  borderRadius: '8px',
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Order Form',
      slug: 'order',
      type: 'ORDER_FORM',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'order',
            styles: { backgroundColor: '#1e293b', padding: '40px 20px' },
            children: [
              {
                type: 'heading',
                content: { text: 'Complete Your Order', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '32px', marginBottom: '30px', textAlign: 'center' },
              },
              {
                type: 'checkout',
                settings: {
                  showOrderSummary: true,
                  showGuarantee: true,
                  paymentMethods: ['card'],
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Upsell',
      slug: 'upsell',
      type: 'UPSELL',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'upsell',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Wait! Your Order Is Not Complete...', level: 'h1' },
                styles: { color: '#ef4444', fontSize: '36px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Get [Upsell Product] for just $XX (normally $XXX)' },
                styles: { color: '#ffffff', fontSize: '24px', marginBottom: '30px' },
              },
              {
                type: 'button',
                content: { text: 'Yes! Add To My Order' },
                styles: { backgroundColor: '#16a34a', color: '#ffffff', padding: '16px 32px', marginRight: '10px' },
              },
              {
                type: 'button',
                content: { text: 'No Thanks' },
                styles: { backgroundColor: '#64748b', color: '#ffffff', padding: '16px 32px' },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Thank You',
      slug: 'thank-you',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmation',
            styles: { backgroundColor: '#1e293b', padding: '80px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Thank You For Your Purchase!', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '42px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Your order has been confirmed. Check your email for access details.' },
                styles: { color: '#94a3b8', fontSize: '18px' },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * Webinar Funnel Template
 */
const webinarTemplate: FunnelTemplate = {
  id: 'webinar-funnel',
  name: 'Webinar Funnel',
  description: 'Register attendees for your live or automated webinar.',
  type: 'WEBINAR',
  thumbnail: '/templates/webinar.png',
  category: 'webinar',
  steps: [
    {
      name: 'Registration Page',
      slug: 'register',
      type: 'OPTIN',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'hero',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'text',
                content: { text: 'FREE LIVE TRAINING' },
                styles: { color: '#fbbf24', fontSize: '14px', letterSpacing: '2px', marginBottom: '10px' },
              },
              {
                type: 'heading',
                content: { text: 'How To [Achieve Massive Result] Without [Pain Point]', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '40px', marginBottom: '30px' },
              },
              {
                type: 'countdown',
                settings: { targetDate: '', showDays: true, showHours: true, showMinutes: true, showSeconds: true },
                styles: { marginBottom: '30px' },
              },
            ],
          },
          {
            type: 'section',
            id: 'registration',
            styles: { backgroundColor: '#0f172a', padding: '60px 20px' },
            children: [
              {
                type: 'form',
                fields: [
                  { name: 'firstName', type: 'text', label: 'First Name', required: true },
                  { name: 'email', type: 'email', label: 'Email Address', required: true },
                ],
                submitButton: {
                  text: 'Reserve My Spot',
                  styles: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 32px', width: '100%' },
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Confirmation Page',
      slug: 'confirmation',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmed',
            styles: { backgroundColor: '#1e293b', padding: '80px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: "You're Registered!", level: 'h1' },
                styles: { color: '#16a34a', fontSize: '48px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Check your email for the webinar details and add it to your calendar.' },
                styles: { color: '#94a3b8', fontSize: '18px', marginBottom: '30px' },
              },
              {
                type: 'countdown',
                settings: { targetDate: '', label: 'Webinar starts in:' },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Webinar Room',
      slug: 'webinar',
      type: 'WEBINAR',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'webinar-room',
            styles: { backgroundColor: '#0f172a', padding: '20px' },
            children: [
              {
                type: 'video',
                content: { url: '', autoplay: true, controls: false },
                styles: { width: '100%', maxWidth: '1000px', margin: '0 auto' },
              },
              {
                type: 'chat',
                settings: { enabled: true, moderated: false },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * Cart Funnel Template
 */
const cartTemplate: FunnelTemplate = {
  id: 'cart-funnel',
  name: 'Shopping Cart Funnel',
  description: 'E-commerce checkout with order bumps and upsells.',
  type: 'CART',
  thumbnail: '/templates/cart.png',
  category: 'ecommerce',
  steps: [
    {
      name: 'Cart Page',
      slug: 'cart',
      type: 'CHECKOUT',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'cart',
            styles: { backgroundColor: '#ffffff', padding: '40px 20px' },
            children: [
              {
                type: 'heading',
                content: { text: 'Your Cart', level: 'h1' },
                styles: { color: '#1e293b', fontSize: '32px', marginBottom: '30px' },
              },
              {
                type: 'cart',
                settings: { showQuantity: true, showRemove: true },
              },
              {
                type: 'orderBump',
                settings: {
                  enabled: true,
                  productId: '',
                  headline: 'Special Offer!',
                  description: 'Add this to your order for just $XX',
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Checkout',
      slug: 'checkout',
      type: 'ORDER_FORM',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'checkout',
            styles: { backgroundColor: '#f8fafc', padding: '40px 20px' },
            children: [
              {
                type: 'checkout',
                settings: {
                  showOrderSummary: true,
                  collectShipping: true,
                  collectBilling: true,
                  paymentMethods: ['card', 'paypal'],
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Upsell',
      slug: 'upsell',
      type: 'UPSELL',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'upsell',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Before You Go...', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '36px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Complete your order with this exclusive bundle deal' },
                styles: { color: '#94a3b8', fontSize: '18px', marginBottom: '30px' },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Order Confirmation',
      slug: 'confirmation',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmation',
            styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Order Confirmed!', level: 'h1' },
                styles: { color: '#16a34a', fontSize: '42px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Thank you for your purchase. A confirmation email has been sent.' },
                styles: { color: '#64748b', fontSize: '18px', marginBottom: '30px' },
              },
              {
                type: 'orderDetails',
                settings: { showItems: true, showShipping: true },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * Book Funnel Template
 */
const bookTemplate: FunnelTemplate = {
  id: 'book-funnel',
  name: 'Free + Shipping Book Funnel',
  description: 'Give away your book for free, just cover shipping. Perfect for authors.',
  type: 'BOOK',
  thumbnail: '/templates/book.png',
  category: 'sales',
  steps: [
    {
      name: 'Book Page',
      slug: 'book',
      type: 'SALES',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'hero',
            styles: { backgroundColor: '#1e293b', padding: '80px 20px' },
            children: [
              {
                type: 'row',
                styles: { maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px' },
                children: [
                  {
                    type: 'column',
                    styles: { flex: 1 },
                    children: [
                      {
                        type: 'image',
                        content: { src: '', alt: 'Book Cover' },
                        styles: { maxWidth: '400px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
                      },
                    ],
                  },
                  {
                    type: 'column',
                    styles: { flex: 1 },
                    children: [
                      {
                        type: 'text',
                        content: { text: 'FREE BOOK (Just Pay Shipping)' },
                        styles: { color: '#fbbf24', fontSize: '14px', letterSpacing: '2px', marginBottom: '10px' },
                      },
                      {
                        type: 'heading',
                        content: { text: '[Book Title]', level: 'h1' },
                        styles: { color: '#ffffff', fontSize: '42px', marginBottom: '20px' },
                      },
                      {
                        type: 'text',
                        content: { text: 'Discover how to [benefit] in this groundbreaking new book.' },
                        styles: { color: '#94a3b8', fontSize: '18px', marginBottom: '30px' },
                      },
                      {
                        type: 'button',
                        content: { text: 'Get Your Free Copy' },
                        styles: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 32px', fontSize: '18px' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Shipping Form',
      slug: 'shipping',
      type: 'ORDER_FORM',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'shipping',
            styles: { backgroundColor: '#ffffff', padding: '40px 20px' },
            children: [
              {
                type: 'heading',
                content: { text: 'Where Should We Ship Your Free Book?', level: 'h1' },
                styles: { color: '#1e293b', fontSize: '28px', marginBottom: '30px', textAlign: 'center' },
              },
              {
                type: 'checkout',
                settings: {
                  collectShipping: true,
                  collectBilling: true,
                  showOrderSummary: true,
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Audiobook Upsell',
      slug: 'audiobook',
      type: 'UPSELL',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'upsell',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Want The Audiobook Too?', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '36px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Get the complete audiobook for just $XX (normally $XXX)' },
                styles: { color: '#94a3b8', fontSize: '18px', marginBottom: '30px' },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Thank You',
      slug: 'thank-you',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmation',
            styles: { backgroundColor: '#1e293b', padding: '80px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Your Book Is On The Way!', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '42px', marginBottom: '20px' },
              },
              {
                type: 'text',
                content: { text: 'Check your email for shipping updates.' },
                styles: { color: '#94a3b8', fontSize: '18px' },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * Storefront Funnel Template
 */
const storefrontTemplate: FunnelTemplate = {
  id: 'storefront-funnel',
  name: 'Storefront',
  description: 'A simple product catalog with shopping cart.',
  type: 'STOREFRONT',
  thumbnail: '/templates/storefront.png',
  category: 'ecommerce',
  steps: [
    {
      name: 'Store',
      slug: 'store',
      type: 'CUSTOM',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'hero',
            styles: { backgroundColor: '#1e293b', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Welcome to Our Store', level: 'h1' },
                styles: { color: '#ffffff', fontSize: '42px', marginBottom: '20px' },
              },
            ],
          },
          {
            type: 'section',
            id: 'products',
            styles: { backgroundColor: '#f8fafc', padding: '60px 20px' },
            children: [
              {
                type: 'productGrid',
                settings: { columns: 3, showPrice: true, showAddToCart: true },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Cart',
      slug: 'cart',
      type: 'CHECKOUT',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'cart',
            styles: { backgroundColor: '#ffffff', padding: '40px 20px' },
            children: [
              {
                type: 'cart',
                settings: { showQuantity: true, showRemove: true },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Checkout',
      slug: 'checkout',
      type: 'ORDER_FORM',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'checkout',
            styles: { backgroundColor: '#f8fafc', padding: '40px 20px' },
            children: [
              {
                type: 'checkout',
                settings: {
                  showOrderSummary: true,
                  collectShipping: true,
                  paymentMethods: ['card'],
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'Order Complete',
      slug: 'complete',
      type: 'THANK_YOU',
      pageContent: {
        sections: [
          {
            type: 'section',
            id: 'confirmation',
            styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
            children: [
              {
                type: 'heading',
                content: { text: 'Order Placed!', level: 'h1' },
                styles: { color: '#16a34a', fontSize: '42px', marginBottom: '20px' },
              },
              {
                type: 'orderDetails',
                settings: { showItems: true, showShipping: true, showTracking: true },
              },
            ],
          },
        ],
      },
    },
  ],
}

/**
 * All available templates
 */
export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  leadMagnetTemplate,
  vslTemplate,
  webinarTemplate,
  cartTemplate,
  bookTemplate,
  storefrontTemplate,
]

/**
 * Get template by ID
 */
export function getTemplateById(id: string): FunnelTemplate | undefined {
  return FUNNEL_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: FunnelTemplate['category']): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter((t) => t.category === category)
}

/**
 * Get templates by funnel type
 */
export function getTemplatesByType(type: FunnelType): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter((t) => t.type === type)
}
