import { prisma } from '@/lib/db/prisma'
import type { EmailCampaign, EmailCampaignType, EmailCampaignStatus } from '@prisma/client'

export interface CreateCampaignInput {
  workspaceId: string
  name: string
  subject: string
  preheader?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  content: Record<string, unknown>
  contentText?: string
  type?: EmailCampaignType
  audienceRules?: Record<string, unknown>
  scheduledAt?: Date
}

export interface UpdateCampaignInput {
  name?: string
  subject?: string
  preheader?: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
  content?: Record<string, unknown>
  contentText?: string
  audienceRules?: Record<string, unknown>
  scheduledAt?: Date | null
}

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  from: {
    name: string
    email: string
  }
  replyTo?: string
  tags?: string[]
}

/**
 * Create a new email campaign
 */
export async function createCampaign(input: CreateCampaignInput): Promise<EmailCampaign> {
  return prisma.emailCampaign.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      subject: input.subject,
      preheader: input.preheader,
      fromName: input.fromName,
      fromEmail: input.fromEmail,
      replyTo: input.replyTo,
      content: input.content as object,
      contentText: input.contentText,
      type: input.type || 'BROADCAST',
      audienceRules: input.audienceRules as object,
      scheduledAt: input.scheduledAt,
      status: input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
    },
  })
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(campaignId: string): Promise<EmailCampaign | null> {
  return prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })
}

/**
 * List campaigns in workspace
 */
export async function listCampaigns(
  workspaceId: string,
  options?: {
    type?: EmailCampaignType
    status?: EmailCampaignStatus
    limit?: number
    offset?: number
  }
): Promise<{ campaigns: EmailCampaign[]; total: number }> {
  const { type, status, limit = 20, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(type && { type }),
    ...(status && { status }),
  }

  const [campaigns, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.emailCampaign.count({ where }),
  ])

  return { campaigns, total }
}

/**
 * Update campaign
 */
export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput
): Promise<EmailCampaign> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status === 'SENDING' || campaign.status === 'SENT') {
    throw new Error('Cannot update a campaign that is being sent or already sent')
  }

  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      name: input.name,
      subject: input.subject,
      preheader: input.preheader,
      fromName: input.fromName,
      fromEmail: input.fromEmail,
      replyTo: input.replyTo,
      content: input.content as object,
      contentText: input.contentText,
      audienceRules: input.audienceRules as object,
      scheduledAt: input.scheduledAt,
      status: input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
    },
  })
}

/**
 * Delete campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status === 'SENDING') {
    throw new Error('Cannot delete a campaign that is currently sending')
  }

  await prisma.emailCampaign.delete({
    where: { id: campaignId },
  })
}

/**
 * Schedule campaign
 */
export async function scheduleCampaign(
  campaignId: string,
  scheduledAt: Date
): Promise<EmailCampaign> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status !== 'DRAFT') {
    throw new Error('Can only schedule draft campaigns')
  }

  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      scheduledAt,
      status: 'SCHEDULED',
    },
  })
}

/**
 * Cancel scheduled campaign
 */
export async function cancelScheduledCampaign(campaignId: string): Promise<EmailCampaign> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status !== 'SCHEDULED') {
    throw new Error('Can only cancel scheduled campaigns')
  }

  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      scheduledAt: null,
      status: 'DRAFT',
    },
  })
}

/**
 * Get contacts for campaign based on audience rules
 */
export async function getCampaignAudience(
  workspaceId: string,
  audienceRules?: Record<string, unknown>
): Promise<{ id: string; email: string; firstName: string | null }[]> {
  // Build query based on audience rules
  const where: Record<string, unknown> = {
    workspaceId,
    status: 'ACTIVE',
  }

  if (audienceRules) {
    if (audienceRules.tags && Array.isArray(audienceRules.tags)) {
      where.tags = { hasSome: audienceRules.tags }
    }
    // Add more audience filtering logic as needed
  }

  const contacts = await prisma.contact.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
    },
  })

  return contacts
}

/**
 * Send campaign to all recipients
 */
export async function sendCampaign(campaignId: string): Promise<void> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
    throw new Error('Campaign is not in a sendable state')
  }

  // Update status to sending
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' },
  })

  try {
    // Get audience
    const audience = await getCampaignAudience(
      campaign.workspaceId,
      campaign.audienceRules as Record<string, unknown>
    )

    let totalSent = 0

    // Send to each contact
    for (const contact of audience) {
      try {
        // Personalize content
        const personalizedHtml = personalizeContent(
          (campaign.content as { html?: string })?.html || '',
          contact
        )

        // Send email
        await sendEmail({
          to: contact.email,
          subject: personalizeContent(campaign.subject, contact),
          html: personalizedHtml,
          text: campaign.contentText || undefined,
          from: {
            name: campaign.fromName,
            email: campaign.fromEmail,
          },
          replyTo: campaign.replyTo || undefined,
        })

        // Record email event
        await prisma.emailEvent.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            type: 'SENT',
            email: contact.email,
          },
        })

        totalSent++
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error)
      }
    }

    // Update campaign with results
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        totalSent,
      },
    })
  } catch (error) {
    // Revert to draft on error
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'DRAFT' },
    })
    throw error
  }
}

/**
 * Send a single email
 * This is a placeholder - integrate with your email provider (Resend, SendGrid, etc.)
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const { to, subject, html, text, from, replyTo } = params

  // TODO: Integrate with actual email provider
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // const result = await resend.emails.send({
  //   from: `${from.name} <${from.email}>`,
  //   to: [to],
  //   subject,
  //   html,
  //   text,
  //   reply_to: replyTo,
  // })
  // return { id: result.id }

  console.log(`Sending email to ${to}: ${subject}`)
  console.log(`From: ${from.name} <${from.email}>`)
  if (replyTo) console.log(`Reply-To: ${replyTo}`)

  // Return mock ID for now
  return { id: `email_${Date.now()}` }
}

/**
 * Personalize content with contact data
 */
function personalizeContent(
  content: string,
  contact: { firstName: string | null; email: string }
): string {
  return content
    .replace(/{{first_name}}/gi, contact.firstName || '')
    .replace(/{{email}}/gi, contact.email)
}

/**
 * Record email event (open, click, etc.)
 */
export async function recordEmailEvent(
  campaignId: string,
  contactId: string,
  type: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED' | 'UNSUBSCRIBED',
  metadata?: Record<string, unknown>
): Promise<void> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  })

  if (!contact) return

  await prisma.emailEvent.create({
    data: {
      campaignId,
      contactId,
      type,
      email: contact.email,
      metadata: metadata as object,
    },
  })

  // Update campaign stats
  const updateField =
    type === 'OPENED'
      ? 'totalOpened'
      : type === 'CLICKED'
        ? 'totalClicked'
        : type === 'BOUNCED'
          ? 'totalBounced'
          : null

  if (updateField) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        [updateField]: { increment: 1 },
      },
    })
  }

  // Handle unsubscribe
  if (type === 'UNSUBSCRIBED') {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    })
  }

  // Handle bounce
  if (type === 'BOUNCED') {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'BOUNCED',
      },
    })
  }

  // Handle complaint
  if (type === 'COMPLAINED') {
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'COMPLAINED',
      },
    })
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  const openRate = campaign.totalSent > 0
    ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(2)
    : 0

  const clickRate = campaign.totalOpened > 0
    ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(2)
    : 0

  const bounceRate = campaign.totalSent > 0
    ? ((campaign.totalBounced / campaign.totalSent) * 100).toFixed(2)
    : 0

  return {
    totalSent: campaign.totalSent,
    totalOpened: campaign.totalOpened,
    totalClicked: campaign.totalClicked,
    totalBounced: campaign.totalBounced,
    openRate,
    clickRate,
    bounceRate,
  }
}

/**
 * Get email templates
 */
export function getEmailTemplates() {
  return [
    {
      id: 'blank',
      name: 'Blank',
      description: 'Start from scratch',
      thumbnail: null,
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Welcome new subscribers',
      content: {
        html: `
          <h1>Welcome, {{first_name}}!</h1>
          <p>Thank you for joining us. We're excited to have you here.</p>
        `,
      },
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Weekly or monthly updates',
      content: {
        html: `
          <h1>Your Weekly Update</h1>
          <p>Here's what's new this week...</p>
        `,
      },
    },
    {
      id: 'promotion',
      name: 'Promotional',
      description: 'Sales and special offers',
      content: {
        html: `
          <h1>Special Offer Just For You!</h1>
          <p>Don't miss out on this exclusive deal.</p>
        `,
      },
    },
    {
      id: 'transactional',
      name: 'Order Confirmation',
      description: 'Post-purchase emails',
      content: {
        html: `
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order details are below.</p>
        `,
      },
    },
  ]
}
