import { NextRequest, NextResponse } from 'next/server'
import { validateTaxId } from '@/lib/tax/service'
import { z } from 'zod'

const validateTaxIdSchema = z.object({
  taxId: z.string().min(1),
  country: z.string().length(2),
})

/**
 * POST /api/tax/validate - Validate a tax ID (VAT, GST, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = validateTaxIdSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await validateTaxId(parsed.data.taxId, parsed.data.country)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error validating tax ID:', error)
    return NextResponse.json(
      { error: 'Failed to validate tax ID' },
      { status: 500 }
    )
  }
}
