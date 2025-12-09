import { prisma } from '@/lib/db/prisma'

export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed'
export type ABTestGoal = 'conversion' | 'clicks' | 'time_on_page' | 'bounce_rate' | 'revenue'

export interface ABTestVariant {
  id: string
  name: string
  weight: number // Percentage of traffic (0-100)
  stepId: string // Reference to funnel step variant
  isControl: boolean
  impressions: number
  conversions: number
  revenue: number
  bounceRate: number
  avgTimeOnPage: number
}

export interface ABTest {
  id: string
  name: string
  description: string
  funnelId: string
  originalStepId: string
  status: ABTestStatus
  goal: ABTestGoal
  variants: ABTestVariant[]
  winnerVariantId?: string
  confidenceLevel: number // Target confidence (e.g., 95)
  minimumSampleSize: number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateABTestInput {
  funnelId: string
  name: string
  description?: string
  originalStepId: string
  goal?: ABTestGoal
  confidenceLevel?: number
  minimumSampleSize?: number
}

export interface ABTestResults {
  testId: string
  status: ABTestStatus
  variants: {
    id: string
    name: string
    isControl: boolean
    impressions: number
    conversions: number
    conversionRate: number
    revenue: number
    revenuePerVisitor: number
    improvement: number // Percentage improvement over control
    confidence: number // Statistical confidence
    isWinner: boolean
  }[]
  hasWinner: boolean
  winnerVariantId?: string
  totalImpressions: number
  totalConversions: number
  overallConversionRate: number
}

/**
 * Get all A/B tests for a funnel
 */
export async function getABTests(funnelId: string): Promise<ABTest[]> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    return []
  }

  const settings = funnel.settings as Record<string, unknown>
  return (settings.abTests || []) as ABTest[]
}

/**
 * Get A/B test by ID
 */
export async function getABTestById(funnelId: string, testId: string): Promise<ABTest | null> {
  const tests = await getABTests(funnelId)
  return tests.find((t) => t.id === testId) || null
}

/**
 * Create a new A/B test
 */
export async function createABTest(input: CreateABTestInput): Promise<ABTest> {
  const {
    funnelId,
    name,
    description = '',
    originalStepId,
    goal = 'conversion',
    confidenceLevel = 95,
    minimumSampleSize = 100,
  } = input

  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  const settings = (funnel?.settings || {}) as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  // Create control variant from original step
  const controlVariant: ABTestVariant = {
    id: `variant-${Date.now()}-control`,
    name: 'Control',
    weight: 50,
    stepId: originalStepId,
    isControl: true,
    impressions: 0,
    conversions: 0,
    revenue: 0,
    bounceRate: 0,
    avgTimeOnPage: 0,
  }

  const newTest: ABTest = {
    id: `abtest-${Date.now()}`,
    name,
    description,
    funnelId,
    originalStepId,
    status: 'draft',
    goal,
    variants: [controlVariant],
    confidenceLevel,
    minimumSampleSize,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests: [...abTests, newTest],
      } as object,
    },
  })

  return newTest
}

/**
 * Add variant to A/B test
 */
export async function addABTestVariant(
  funnelId: string,
  testId: string,
  variant: { name: string; stepId: string; weight?: number }
): Promise<ABTest> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) {
    throw new Error('A/B test not found')
  }

  const test = abTests[testIndex]

  if (test.status !== 'draft') {
    throw new Error('Cannot add variants to a running or completed test')
  }

  const newVariant: ABTestVariant = {
    id: `variant-${Date.now()}`,
    name: variant.name,
    weight: variant.weight || Math.floor(100 / (test.variants.length + 1)),
    stepId: variant.stepId,
    isControl: false,
    impressions: 0,
    conversions: 0,
    revenue: 0,
    bounceRate: 0,
    avgTimeOnPage: 0,
  }

  // Rebalance weights
  const totalVariants = test.variants.length + 1
  const defaultWeight = Math.floor(100 / totalVariants)

  for (const v of test.variants) {
    v.weight = defaultWeight
  }
  newVariant.weight = 100 - (defaultWeight * test.variants.length)

  test.variants.push(newVariant)
  test.updatedAt = new Date().toISOString()

  abTests[testIndex] = test

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })

  return test
}

/**
 * Update A/B test
 */
export async function updateABTest(
  funnelId: string,
  testId: string,
  updates: Partial<Pick<ABTest, 'name' | 'description' | 'goal' | 'confidenceLevel' | 'minimumSampleSize' | 'status'>>
): Promise<ABTest> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) {
    throw new Error('A/B test not found')
  }

  const test = abTests[testIndex]

  // Handle status transitions
  if (updates.status) {
    if (updates.status === 'running' && test.variants.length < 2) {
      throw new Error('At least 2 variants are required to start a test')
    }
    if (updates.status === 'running' && !test.startDate) {
      test.startDate = new Date().toISOString()
    }
    if (updates.status === 'completed' && !test.endDate) {
      test.endDate = new Date().toISOString()
    }
  }

  const updatedTest: ABTest = {
    ...test,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  abTests[testIndex] = updatedTest

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })

  return updatedTest
}

/**
 * Update variant weights
 */
export async function updateVariantWeights(
  funnelId: string,
  testId: string,
  weights: { variantId: string; weight: number }[]
): Promise<ABTest> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) {
    throw new Error('A/B test not found')
  }

  const test = abTests[testIndex]

  // Validate total weight equals 100
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  if (totalWeight !== 100) {
    throw new Error('Total weight must equal 100')
  }

  for (const { variantId, weight } of weights) {
    const variant = test.variants.find((v) => v.id === variantId)
    if (variant) {
      variant.weight = weight
    }
  }

  test.updatedAt = new Date().toISOString()
  abTests[testIndex] = test

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })

  return test
}

/**
 * Delete A/B test
 */
export async function deleteABTest(funnelId: string, testId: string): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const filteredTests = abTests.filter((t) => t.id !== testId)

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests: filteredTests,
      } as object,
    },
  })
}

/**
 * Record impression for variant
 */
export async function recordImpression(
  funnelId: string,
  testId: string,
  variantId: string
): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) return

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) return

  const test = abTests[testIndex]
  const variant = test.variants.find((v) => v.id === variantId)
  if (!variant) return

  variant.impressions++
  test.updatedAt = new Date().toISOString()
  abTests[testIndex] = test

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })
}

/**
 * Record conversion for variant
 */
export async function recordConversion(
  funnelId: string,
  testId: string,
  variantId: string,
  revenue?: number
): Promise<void> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) return

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) return

  const test = abTests[testIndex]
  const variant = test.variants.find((v) => v.id === variantId)
  if (!variant) return

  variant.conversions++
  if (revenue) {
    variant.revenue += revenue
  }

  test.updatedAt = new Date().toISOString()
  abTests[testIndex] = test

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })
}

/**
 * Get which variant to show based on weights
 */
export function selectVariant(test: ABTest): ABTestVariant {
  const random = Math.random() * 100
  let cumulative = 0

  for (const variant of test.variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return variant
    }
  }

  // Fallback to control
  return test.variants.find((v) => v.isControl) || test.variants[0]
}

/**
 * Calculate statistical significance using Z-test
 */
function calculateConfidence(
  controlConversions: number,
  controlImpressions: number,
  variantConversions: number,
  variantImpressions: number
): number {
  if (controlImpressions === 0 || variantImpressions === 0) return 0

  const p1 = controlConversions / controlImpressions
  const p2 = variantConversions / variantImpressions
  const n1 = controlImpressions
  const n2 = variantImpressions

  // Pooled proportion
  const p = (controlConversions + variantConversions) / (n1 + n2)

  // Standard error
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))

  if (se === 0) return 0

  // Z-score
  const z = Math.abs(p2 - p1) / se

  // Convert Z-score to confidence level (simplified)
  // Using normal distribution approximation
  if (z >= 2.576) return 99
  if (z >= 1.96) return 95
  if (z >= 1.645) return 90
  if (z >= 1.28) return 80
  return Math.round(z * 40) // Rough approximation for lower values
}

/**
 * Get A/B test results with statistics
 */
export async function getABTestResults(funnelId: string, testId: string): Promise<ABTestResults> {
  const test = await getABTestById(funnelId, testId)

  if (!test) {
    throw new Error('A/B test not found')
  }

  const control = test.variants.find((v) => v.isControl)
  if (!control) {
    throw new Error('Control variant not found')
  }

  const controlConversionRate = control.impressions > 0
    ? (control.conversions / control.impressions) * 100
    : 0

  const variantResults = test.variants.map((variant) => {
    const conversionRate = variant.impressions > 0
      ? (variant.conversions / variant.impressions) * 100
      : 0

    const revenuePerVisitor = variant.impressions > 0
      ? variant.revenue / variant.impressions
      : 0

    const improvement = controlConversionRate > 0
      ? ((conversionRate - controlConversionRate) / controlConversionRate) * 100
      : 0

    const confidence = variant.isControl
      ? 100
      : calculateConfidence(
          control.conversions,
          control.impressions,
          variant.conversions,
          variant.impressions
        )

    return {
      id: variant.id,
      name: variant.name,
      isControl: variant.isControl,
      impressions: variant.impressions,
      conversions: variant.conversions,
      conversionRate,
      revenue: variant.revenue,
      revenuePerVisitor,
      improvement,
      confidence,
      isWinner: false,
    }
  })

  // Determine winner
  let hasWinner = false
  let winnerVariantId: string | undefined

  for (const result of variantResults) {
    if (!result.isControl &&
        result.confidence >= test.confidenceLevel &&
        result.impressions >= test.minimumSampleSize &&
        result.improvement > 0) {
      result.isWinner = true
      hasWinner = true
      winnerVariantId = result.id
      break
    }
  }

  const totalImpressions = test.variants.reduce((sum, v) => sum + v.impressions, 0)
  const totalConversions = test.variants.reduce((sum, v) => sum + v.conversions, 0)
  const overallConversionRate = totalImpressions > 0
    ? (totalConversions / totalImpressions) * 100
    : 0

  return {
    testId: test.id,
    status: test.status,
    variants: variantResults,
    hasWinner,
    winnerVariantId,
    totalImpressions,
    totalConversions,
    overallConversionRate,
  }
}

/**
 * Declare winner and end test
 */
export async function declareWinner(
  funnelId: string,
  testId: string,
  variantId: string
): Promise<ABTest> {
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    select: { settings: true },
  })

  if (!funnel?.settings) {
    throw new Error('Funnel not found')
  }

  const settings = funnel.settings as Record<string, unknown>
  const abTests = (settings.abTests || []) as ABTest[]

  const testIndex = abTests.findIndex((t) => t.id === testId)
  if (testIndex === -1) {
    throw new Error('A/B test not found')
  }

  const test = abTests[testIndex]
  const winner = test.variants.find((v) => v.id === variantId)

  if (!winner) {
    throw new Error('Variant not found')
  }

  test.winnerVariantId = variantId
  test.status = 'completed'
  test.endDate = new Date().toISOString()
  test.updatedAt = new Date().toISOString()

  abTests[testIndex] = test

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      settings: {
        ...settings,
        abTests,
      } as object,
    },
  })

  return test
}
