import { prisma } from '@/lib/db/prisma'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)
const resolveCname = promisify(dns.resolveCname)

export type DomainStatus = 'pending' | 'verifying' | 'verified' | 'failed' | 'active'
export type DomainType = 'custom' | 'subdomain'
export type SSLStatus = 'pending' | 'provisioning' | 'active' | 'failed'

export interface Domain {
  id: string
  domain: string
  type: DomainType
  status: DomainStatus
  verificationToken: string
  verificationMethod: 'txt' | 'cname'
  sslStatus: SSLStatus
  sslCertificateId?: string
  funnelId?: string
  isPrimary: boolean
  lastVerifiedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDomainInput {
  workspaceId: string
  domain: string
  type?: DomainType
  funnelId?: string
  isPrimary?: boolean
}

export interface DomainVerificationInfo {
  method: 'txt' | 'cname'
  recordName: string
  recordValue: string
  instructions: string
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sakaduki.app'

/**
 * Generate verification token
 */
function generateVerificationToken(): string {
  return `sakaduki-verify-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Get all domains for a workspace
 */
export async function getDomains(workspaceId: string): Promise<Domain[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.domains || []) as Domain[]
}

/**
 * Get domain by ID
 */
export async function getDomainById(workspaceId: string, domainId: string): Promise<Domain | null> {
  const domains = await getDomains(workspaceId)
  return domains.find((d) => d.id === domainId) || null
}

/**
 * Get domain by name
 */
export async function getDomainByName(workspaceId: string, domain: string): Promise<Domain | null> {
  const domains = await getDomains(workspaceId)
  return domains.find((d) => d.domain === domain) || null
}

/**
 * Create a new domain
 */
export async function createDomain(input: CreateDomainInput): Promise<Domain> {
  const { workspaceId, domain, type = 'custom', funnelId, isPrimary = false } = input

  // Validate domain format
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  if (!domainRegex.test(domain)) {
    throw new Error('Invalid domain format')
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const domains = (settings.domains || []) as Domain[]

  // Check if domain already exists
  if (domains.some((d) => d.domain === domain)) {
    throw new Error('Domain already exists')
  }

  // If setting as primary, unset other primary domains
  if (isPrimary) {
    for (const d of domains) {
      d.isPrimary = false
    }
  }

  const verificationToken = generateVerificationToken()
  const verificationMethod = type === 'subdomain' ? 'cname' : 'txt'

  const newDomain: Domain = {
    id: `domain-${Date.now()}`,
    domain,
    type,
    status: 'pending',
    verificationToken,
    verificationMethod,
    sslStatus: 'pending',
    funnelId,
    isPrimary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        domains: [...domains, newDomain],
      } as object,
    },
  })

  return newDomain
}

/**
 * Get domain verification info
 */
export function getDomainVerificationInfo(domain: Domain): DomainVerificationInfo {
  if (domain.verificationMethod === 'cname') {
    return {
      method: 'cname',
      recordName: domain.domain,
      recordValue: `${domain.verificationToken}.${APP_DOMAIN}`,
      instructions: `Add a CNAME record for "${domain.domain}" pointing to "${domain.verificationToken}.${APP_DOMAIN}"`,
    }
  }

  return {
    method: 'txt',
    recordName: `_sakaduki-verification.${domain.domain}`,
    recordValue: domain.verificationToken,
    instructions: `Add a TXT record for "_sakaduki-verification.${domain.domain}" with value "${domain.verificationToken}"`,
  }
}

/**
 * Verify domain ownership
 */
export async function verifyDomain(workspaceId: string, domainId: string): Promise<{
  verified: boolean
  error?: string
}> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return { verified: false, error: 'Workspace not found' }
  }

  const settings = workspace.settings as Record<string, unknown>
  const domains = (settings.domains || []) as Domain[]

  const domainIndex = domains.findIndex((d) => d.id === domainId)
  if (domainIndex === -1) {
    return { verified: false, error: 'Domain not found' }
  }

  const domain = domains[domainIndex]
  domain.status = 'verifying'
  domain.updatedAt = new Date().toISOString()

  try {
    let verified = false

    if (domain.verificationMethod === 'txt') {
      // Check TXT record
      const txtRecords = await resolveTxt(`_sakaduki-verification.${domain.domain}`)
      verified = txtRecords.some((records) =>
        records.some((record) => record === domain.verificationToken)
      )
    } else {
      // Check CNAME record
      const cnameRecords = await resolveCname(domain.domain)
      const expectedCname = `${domain.verificationToken}.${APP_DOMAIN}`
      verified = cnameRecords.some((record) =>
        record === expectedCname || record === `${expectedCname}.`
      )
    }

    if (verified) {
      domain.status = 'verified'
      domain.lastVerifiedAt = new Date().toISOString()
      domain.errorMessage = undefined

      // Start SSL provisioning
      domain.sslStatus = 'provisioning'
    } else {
      domain.status = 'pending'
      domain.errorMessage = 'DNS record not found. Please ensure the record is properly configured.'
    }

    domains[domainIndex] = domain

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        settings: {
          ...settings,
          domains,
        } as object,
      },
    })

    return { verified }
  } catch (error) {
    domain.status = 'failed'
    domain.errorMessage = error instanceof Error ? error.message : 'DNS lookup failed'
    domains[domainIndex] = domain

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        settings: {
          ...settings,
          domains,
        } as object,
      },
    })

    return { verified: false, error: domain.errorMessage }
  }
}

/**
 * Activate domain (after SSL is ready)
 */
export async function activateDomain(
  workspaceId: string,
  domainId: string,
  sslCertificateId?: string
): Promise<Domain> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const domains = (settings.domains || []) as Domain[]

  const domainIndex = domains.findIndex((d) => d.id === domainId)
  if (domainIndex === -1) {
    throw new Error('Domain not found')
  }

  const domain = domains[domainIndex]

  if (domain.status !== 'verified') {
    throw new Error('Domain must be verified before activation')
  }

  domain.status = 'active'
  domain.sslStatus = 'active'
  domain.sslCertificateId = sslCertificateId
  domain.updatedAt = new Date().toISOString()

  domains[domainIndex] = domain

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        domains,
      } as object,
    },
  })

  return domain
}

/**
 * Update domain settings
 */
export async function updateDomain(
  workspaceId: string,
  domainId: string,
  updates: Partial<Pick<Domain, 'funnelId' | 'isPrimary'>>
): Promise<Domain> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const domains = (settings.domains || []) as Domain[]

  const domainIndex = domains.findIndex((d) => d.id === domainId)
  if (domainIndex === -1) {
    throw new Error('Domain not found')
  }

  // If setting as primary, unset other primary domains
  if (updates.isPrimary) {
    for (const d of domains) {
      d.isPrimary = false
    }
  }

  const domain = domains[domainIndex]
  Object.assign(domain, updates, { updatedAt: new Date().toISOString() })
  domains[domainIndex] = domain

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        domains,
      } as object,
    },
  })

  return domain
}

/**
 * Delete domain
 */
export async function deleteDomain(workspaceId: string, domainId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const domains = (settings.domains || []) as Domain[]

  const filteredDomains = domains.filter((d) => d.id !== domainId)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        domains: filteredDomains,
      } as object,
    },
  })
}

/**
 * Get domains for a funnel
 */
export async function getDomainsForFunnel(workspaceId: string, funnelId: string): Promise<Domain[]> {
  const domains = await getDomains(workspaceId)
  return domains.filter((d) => d.funnelId === funnelId && d.status === 'active')
}

/**
 * Get primary domain for workspace
 */
export async function getPrimaryDomain(workspaceId: string): Promise<Domain | null> {
  const domains = await getDomains(workspaceId)
  return domains.find((d) => d.isPrimary && d.status === 'active') || null
}

/**
 * Generate subdomain from workspace/funnel
 */
export function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
}

/**
 * Check if subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  // Check all workspaces for this subdomain
  const workspaces = await prisma.workspace.findMany({
    select: { settings: true },
  })

  for (const workspace of workspaces) {
    if (!workspace.settings) continue
    const settings = workspace.settings as Record<string, unknown>
    const domains = (settings.domains || []) as Domain[]

    if (domains.some((d) => d.domain === `${subdomain}.${APP_DOMAIN}`)) {
      return false
    }
  }

  return true
}

/**
 * Get DNS configuration instructions
 */
export function getDnsInstructions(domain: Domain): string[] {
  const instructions: string[] = []

  if (domain.verificationMethod === 'txt') {
    instructions.push(
      `1. Log in to your domain registrar or DNS provider`,
      `2. Navigate to DNS settings for ${domain.domain}`,
      `3. Add a new TXT record:`,
      `   - Name/Host: _sakaduki-verification`,
      `   - Value: ${domain.verificationToken}`,
      `4. Wait for DNS propagation (can take up to 48 hours)`,
      `5. Click "Verify Domain" to confirm ownership`
    )

    if (domain.status === 'verified' || domain.status === 'active') {
      instructions.push(
        ``,
        `6. Add an A record or CNAME to point your domain to our servers:`,
        `   - For A record: Point to our IP address`,
        `   - For CNAME: Point to proxy.${APP_DOMAIN}`
      )
    }
  } else {
    instructions.push(
      `1. Log in to your domain registrar or DNS provider`,
      `2. Navigate to DNS settings for ${domain.domain}`,
      `3. Add a new CNAME record:`,
      `   - Name/Host: ${domain.domain.split('.')[0]}`,
      `   - Target: ${domain.verificationToken}.${APP_DOMAIN}`,
      `4. Wait for DNS propagation (can take up to 48 hours)`,
      `5. Click "Verify Domain" to confirm ownership`
    )
  }

  return instructions
}
