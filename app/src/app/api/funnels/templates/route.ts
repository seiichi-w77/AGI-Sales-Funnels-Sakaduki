import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { FUNNEL_TEMPLATES, getTemplateById, getTemplatesByCategory, getTemplatesByType } from '@/lib/funnel/templates'
import { createFunnel, createFunnelStep, generateUniqueFunnelSlug } from '@/lib/funnel/service'
import { hasWorkspaceAccess } from '@/lib/workspace/service'
import { z } from 'zod'
import type { FunnelType } from '@prisma/client'

const applyTemplateSchema = z.object({
  workspaceId: z.string(),
  templateId: z.string(),
  name: z.string().min(1).max(100),
})

/**
 * GET /api/funnels/templates - List all templates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'lead_generation' | 'sales' | 'webinar' | 'membership' | 'ecommerce' | null
    const type = searchParams.get('type') as FunnelType | null

    let templates = FUNNEL_TEMPLATES

    if (category) {
      templates = getTemplatesByCategory(category)
    } else if (type) {
      templates = getTemplatesByType(type)
    }

    // Return template summaries (without full pageContent for listing)
    const summaries = templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.type,
      thumbnail: t.thumbnail,
      category: t.category,
      stepCount: t.steps.length,
    }))

    return NextResponse.json({ templates: summaries })
  } catch (error) {
    console.error('Error listing templates:', error)
    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/funnels/templates - Create funnel from template
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = applyTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workspaceId, templateId, name } = parsed.data

    // Check access
    const hasAccess = await hasWorkspaceAccess(workspaceId, session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get template
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Generate unique slug
    const slug = await generateUniqueFunnelSlug(workspaceId, name)

    // Create funnel
    const funnel = await createFunnel({
      workspaceId,
      name,
      slug,
      type: template.type,
      description: template.description,
      thumbnail: template.thumbnail,
    })

    // Create steps from template
    for (let i = 0; i < template.steps.length; i++) {
      const stepTemplate = template.steps[i]
      await createFunnelStep({
        funnelId: funnel.id,
        name: stepTemplate.name,
        slug: stepTemplate.slug,
        type: stepTemplate.type,
        sortOrder: i,
        pageContent: stepTemplate.pageContent,
      })
    }

    return NextResponse.json({ funnel }, { status: 201 })
  } catch (error) {
    console.error('Error creating funnel from template:', error)
    return NextResponse.json(
      { error: 'Failed to create funnel from template' },
      { status: 500 }
    )
  }
}
