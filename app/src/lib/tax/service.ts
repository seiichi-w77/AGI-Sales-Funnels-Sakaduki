import { prisma } from '@/lib/db/prisma'

export interface TaxRate {
  id: string
  name: string
  rate: number // Percentage (e.g., 10 for 10%)
  country: string
  state?: string
  postalCode?: string
  taxType: 'sales' | 'vat' | 'gst'
  isDefault: boolean
  isActive: boolean
}

export interface TaxCalculationInput {
  workspaceId: string
  items: {
    productId: string
    amount: number // In cents
    quantity: number
    taxable: boolean
  }[]
  shippingAddress?: {
    country: string
    state?: string
    postalCode?: string
  }
  billingAddress?: {
    country: string
    state?: string
    postalCode?: string
  }
}

export interface TaxCalculationResult {
  subtotal: number
  taxAmount: number
  total: number
  taxBreakdown: {
    name: string
    rate: number
    amount: number
    jurisdiction: string
  }[]
}

// Default tax rates by country/state
const DEFAULT_TAX_RATES: Record<string, number> = {
  // US States
  'US-CA': 7.25,
  'US-NY': 8.0,
  'US-TX': 6.25,
  'US-FL': 6.0,
  'US-WA': 6.5,
  'US-IL': 6.25,
  'US-PA': 6.0,
  'US-OH': 5.75,
  'US-GA': 4.0,
  'US-NC': 4.75,
  // Countries
  JP: 10.0, // Japan Consumption Tax
  GB: 20.0, // UK VAT
  DE: 19.0, // Germany VAT
  FR: 20.0, // France VAT
  AU: 10.0, // Australia GST
  CA: 5.0, // Canada GST (federal only)
}

/**
 * Calculate tax for an order
 */
export async function calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
  const { workspaceId, items, shippingAddress, billingAddress } = input

  // Use shipping address for tax calculation if available, otherwise billing
  const taxAddress = shippingAddress || billingAddress

  // Calculate subtotal for taxable items
  const taxableSubtotal = items
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + item.amount * item.quantity, 0)

  const totalSubtotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0)

  if (!taxAddress || taxableSubtotal === 0) {
    return {
      subtotal: totalSubtotal,
      taxAmount: 0,
      total: totalSubtotal,
      taxBreakdown: [],
    }
  }

  // Get applicable tax rate
  const taxRate = await getTaxRate(workspaceId, taxAddress)

  if (!taxRate || taxRate.rate === 0) {
    return {
      subtotal: totalSubtotal,
      taxAmount: 0,
      total: totalSubtotal,
      taxBreakdown: [],
    }
  }

  // Calculate tax amount
  const taxAmount = Math.round(taxableSubtotal * (taxRate.rate / 100))

  return {
    subtotal: totalSubtotal,
    taxAmount,
    total: totalSubtotal + taxAmount,
    taxBreakdown: [
      {
        name: taxRate.name,
        rate: taxRate.rate,
        amount: taxAmount,
        jurisdiction: taxRate.state
          ? `${taxRate.country}-${taxRate.state}`
          : taxRate.country,
      },
    ],
  }
}

/**
 * Get applicable tax rate for an address
 */
export async function getTaxRate(
  workspaceId: string,
  address: { country: string; state?: string; postalCode?: string }
): Promise<TaxRate | null> {
  // Try to find a custom tax rate for this workspace
  // For now, use default rates
  const { country, state } = address

  // Look for state-specific rate first
  if (state) {
    const stateKey = `${country}-${state}`
    if (DEFAULT_TAX_RATES[stateKey] !== undefined) {
      return {
        id: stateKey,
        name: getStateTaxName(country, state),
        rate: DEFAULT_TAX_RATES[stateKey],
        country,
        state,
        taxType: getTaxType(country),
        isDefault: true,
        isActive: true,
      }
    }
  }

  // Fall back to country rate
  if (DEFAULT_TAX_RATES[country] !== undefined) {
    return {
      id: country,
      name: getCountryTaxName(country),
      rate: DEFAULT_TAX_RATES[country],
      country,
      taxType: getTaxType(country),
      isDefault: true,
      isActive: true,
    }
  }

  return null
}

/**
 * Get tax type based on country
 */
function getTaxType(country: string): 'sales' | 'vat' | 'gst' {
  const vatCountries = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'IE', 'PT', 'GR', 'PL']
  const gstCountries = ['AU', 'NZ', 'SG', 'MY', 'IN']

  if (vatCountries.includes(country)) return 'vat'
  if (gstCountries.includes(country)) return 'gst'
  return 'sales'
}

/**
 * Get tax name for a state
 */
function getStateTaxName(country: string, state: string): string {
  if (country === 'US') {
    return `${state} Sales Tax`
  }
  if (country === 'CA') {
    const pstProvinces = ['BC', 'SK', 'MB']
    const qstProvinces = ['QC']
    const hstProvinces = ['ON', 'NB', 'NS', 'NL', 'PE']

    if (hstProvinces.includes(state)) return 'HST'
    if (qstProvinces.includes(state)) return 'GST + QST'
    if (pstProvinces.includes(state)) return 'GST + PST'
    return 'GST'
  }
  return 'Tax'
}

/**
 * Get tax name for a country
 */
function getCountryTaxName(country: string): string {
  const taxNames: Record<string, string> = {
    JP: 'Consumption Tax',
    GB: 'VAT',
    DE: 'MwSt',
    FR: 'TVA',
    AU: 'GST',
    CA: 'GST',
    US: 'Sales Tax',
  }
  return taxNames[country] || 'Tax'
}

/**
 * Get all tax rates for a workspace
 */
export async function getWorkspaceTaxRates(workspaceId: string): Promise<TaxRate[]> {
  // Return default rates for now
  // In a full implementation, this would query custom workspace tax rates
  return Object.entries(DEFAULT_TAX_RATES).map(([key, rate]) => {
    const [country, state] = key.includes('-') ? key.split('-') : [key, undefined]
    return {
      id: key,
      name: state ? getStateTaxName(country, state) : getCountryTaxName(country),
      rate,
      country,
      state,
      taxType: getTaxType(country),
      isDefault: true,
      isActive: true,
    }
  })
}

/**
 * Validate tax ID/number (VAT, GST, etc.)
 */
export async function validateTaxId(
  taxId: string,
  country: string
): Promise<{ valid: boolean; businessName?: string; error?: string }> {
  // Basic format validation
  const formats: Record<string, RegExp> = {
    GB: /^GB\d{9}$|^GB\d{12}$|^GBGD\d{3}$|^GBHA\d{3}$/,
    DE: /^DE\d{9}$/,
    FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
    AU: /^\d{11}$/,
  }

  if (formats[country] && !formats[country].test(taxId)) {
    return { valid: false, error: 'Invalid tax ID format' }
  }

  // In a full implementation, this would call a VAT validation API
  // For now, just return format validation result
  return { valid: true }
}

/**
 * Calculate reverse charge (for B2B transactions in EU)
 */
export function isReverseChargeApplicable(
  sellerCountry: string,
  buyerCountry: string,
  buyerHasValidVatId: boolean
): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ]

  // Reverse charge applies for B2B transactions between EU countries
  // when buyer has valid VAT ID and countries are different
  return (
    euCountries.includes(sellerCountry) &&
    euCountries.includes(buyerCountry) &&
    sellerCountry !== buyerCountry &&
    buyerHasValidVatId
  )
}

/**
 * Format tax amount for display
 */
export function formatTaxAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}
