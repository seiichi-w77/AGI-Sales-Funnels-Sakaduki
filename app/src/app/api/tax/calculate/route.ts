import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { calculateTax, validateTaxId, getWorkspaceTaxRates } from '@/lib/tax/service'
import { hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'

const calculateTaxSchema = z.object({
  workspaceId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      amount: z.number().int().min(0),
      quantity: z.number().int().min(1),
      taxable: z.boolean(),
    })
  ),
  shippingAddress: z
    .object({
      country: z.string().length(2),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  billingAddress: z
    .object({
      country: z.string().length(2),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
})

/**
 * POST /api/tax/calculate - Calculate tax for items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = calculateTaxSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await calculateTax(parsed.data)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating tax:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    )
  }
}
