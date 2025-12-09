import { prisma } from '@/lib/db/prisma'

export type CodeLocation = 'head' | 'body_start' | 'body_end'
export type CodeScope = 'funnel' | 'step' | 'workspace'

export interface CustomCode {
  id: string
  name: string
  type: 'css' | 'js'
  code: string
  location: CodeLocation
  scope: CodeScope
  scopeId: string // funnelId, stepId, or workspaceId
  isActive: boolean
  order: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomCodeInput {
  workspaceId: string
  name: string
  type: 'css' | 'js'
  code: string
  location?: CodeLocation
  scope: CodeScope
  scopeId: string
  isActive?: boolean
  order?: number
  description?: string
}

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /document\.cookie/gi,
  /localStorage\./gi,
  /sessionStorage\./gi,
  /window\.location\s*=/gi,
  /window\.open\s*\(/gi,
  /<script/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
]

// Warning patterns that are allowed but flagged
const WARNING_PATTERNS = [
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /\.innerHTML/gi,
  /\.outerHTML/gi,
  /document\.write/gi,
]

/**
 * Validate custom code for security
 */
export function validateCode(code: string, type: 'css' | 'js'): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for dangerous patterns in JavaScript
  if (type === 'js') {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(code)) {
        errors.push(`Dangerous pattern detected: ${pattern.source}`)
      }
    }

    for (const pattern of WARNING_PATTERNS) {
      if (pattern.test(code)) {
        warnings.push(`Potentially unsafe pattern: ${pattern.source}`)
      }
    }
  }

  // Check for @import in CSS (can be used for data exfiltration)
  if (type === 'css') {
    if (/@import/gi.test(code)) {
      warnings.push('@import statements can pose security risks')
    }
    if (/url\s*\(\s*["']?data:/gi.test(code)) {
      errors.push('Data URLs in CSS are not allowed')
    }
    if (/expression\s*\(/gi.test(code)) {
      errors.push('CSS expressions are not allowed')
    }
    if (/behavior\s*:/gi.test(code)) {
      errors.push('CSS behaviors are not allowed')
    }
  }

  // Check code length
  if (code.length > 100000) {
    errors.push('Code exceeds maximum length of 100KB')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Minify CSS (simple implementation)
 */
export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove space around special chars
    .replace(/;}/g, '}') // Remove trailing semicolons
    .trim()
}

/**
 * Get all custom code for a workspace
 */
export async function getCustomCodes(workspaceId: string): Promise<CustomCode[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.customCodes || []) as CustomCode[]
}

/**
 * Get custom code by ID
 */
export async function getCustomCodeById(
  workspaceId: string,
  codeId: string
): Promise<CustomCode | null> {
  const codes = await getCustomCodes(workspaceId)
  return codes.find((c) => c.id === codeId) || null
}

/**
 * Get custom codes for a specific scope
 */
export async function getCustomCodesForScope(
  workspaceId: string,
  scope: CodeScope,
  scopeId: string
): Promise<CustomCode[]> {
  const codes = await getCustomCodes(workspaceId)
  return codes
    .filter((c) => c.scope === scope && c.scopeId === scopeId && c.isActive)
    .sort((a, b) => a.order - b.order)
}

/**
 * Create custom code
 */
export async function createCustomCode(input: CreateCustomCodeInput): Promise<CustomCode> {
  const {
    workspaceId,
    name,
    type,
    code,
    location = type === 'css' ? 'head' : 'body_end',
    scope,
    scopeId,
    isActive = true,
    order = 0,
    description,
  } = input

  // Validate code
  const validation = validateCode(code, type)
  if (!validation.valid) {
    throw new Error(`Code validation failed: ${validation.errors.join(', ')}`)
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const customCodes = (settings.customCodes || []) as CustomCode[]

  const newCode: CustomCode = {
    id: `code-${Date.now()}`,
    name,
    type,
    code,
    location,
    scope,
    scopeId,
    isActive,
    order,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customCodes: [...customCodes, newCode],
      } as object,
    },
  })

  return newCode
}

/**
 * Update custom code
 */
export async function updateCustomCode(
  workspaceId: string,
  codeId: string,
  updates: Partial<Omit<CustomCode, 'id' | 'createdAt'>>
): Promise<CustomCode> {
  // Validate code if being updated
  if (updates.code && updates.type) {
    const validation = validateCode(updates.code, updates.type)
    if (!validation.valid) {
      throw new Error(`Code validation failed: ${validation.errors.join(', ')}`)
    }
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const customCodes = (settings.customCodes || []) as CustomCode[]

  const codeIndex = customCodes.findIndex((c) => c.id === codeId)
  if (codeIndex === -1) {
    throw new Error('Custom code not found')
  }

  // Re-validate if code is being updated
  if (updates.code) {
    const codeType = updates.type || customCodes[codeIndex].type
    const validation = validateCode(updates.code, codeType)
    if (!validation.valid) {
      throw new Error(`Code validation failed: ${validation.errors.join(', ')}`)
    }
  }

  const updatedCode: CustomCode = {
    ...customCodes[codeIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  customCodes[codeIndex] = updatedCode

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customCodes,
      } as object,
    },
  })

  return updatedCode
}

/**
 * Delete custom code
 */
export async function deleteCustomCode(workspaceId: string, codeId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const customCodes = (settings.customCodes || []) as CustomCode[]

  const filteredCodes = customCodes.filter((c) => c.id !== codeId)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customCodes: filteredCodes,
      } as object,
    },
  })
}

/**
 * Get compiled CSS/JS for rendering
 */
export async function getCompiledCode(
  workspaceId: string,
  funnelId: string,
  stepId?: string
): Promise<{
  headCss: string
  headJs: string
  bodyStartJs: string
  bodyEndJs: string
}> {
  const codes = await getCustomCodes(workspaceId)

  // Filter active codes for the scope hierarchy
  const relevantCodes = codes.filter((c) => {
    if (!c.isActive) return false
    if (c.scope === 'workspace' && c.scopeId === workspaceId) return true
    if (c.scope === 'funnel' && c.scopeId === funnelId) return true
    if (c.scope === 'step' && c.scopeId === stepId) return true
    return false
  })

  // Sort by scope (workspace < funnel < step) then by order
  const scopeOrder: Record<CodeScope, number> = { workspace: 0, funnel: 1, step: 2 }
  relevantCodes.sort((a, b) => {
    const scopeDiff = scopeOrder[a.scope] - scopeOrder[b.scope]
    if (scopeDiff !== 0) return scopeDiff
    return a.order - b.order
  })

  const result = {
    headCss: '',
    headJs: '',
    bodyStartJs: '',
    bodyEndJs: '',
  }

  for (const code of relevantCodes) {
    if (code.type === 'css') {
      result.headCss += minifyCss(code.code) + '\n'
    } else {
      switch (code.location) {
        case 'head':
          result.headJs += code.code + '\n'
          break
        case 'body_start':
          result.bodyStartJs += code.code + '\n'
          break
        case 'body_end':
          result.bodyEndJs += code.code + '\n'
          break
      }
    }
  }

  return result
}

/**
 * Duplicate custom code
 */
export async function duplicateCustomCode(
  workspaceId: string,
  codeId: string,
  newName?: string
): Promise<CustomCode> {
  const code = await getCustomCodeById(workspaceId, codeId)

  if (!code) {
    throw new Error('Custom code not found')
  }

  return createCustomCode({
    workspaceId,
    name: newName || `${code.name} (Copy)`,
    type: code.type,
    code: code.code,
    location: code.location,
    scope: code.scope,
    scopeId: code.scopeId,
    isActive: false, // Start as inactive
    order: code.order + 1,
    description: code.description,
  })
}

/**
 * Reorder custom codes
 */
export async function reorderCustomCodes(
  workspaceId: string,
  codeOrders: { id: string; order: number }[]
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const customCodes = (settings.customCodes || []) as CustomCode[]

  for (const { id, order } of codeOrders) {
    const code = customCodes.find((c) => c.id === id)
    if (code) {
      code.order = order
      code.updatedAt = new Date().toISOString()
    }
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customCodes,
      } as object,
    },
  })
}

/**
 * Get code snippets library (common tracking/analytics snippets)
 */
export function getCodeSnippetLibrary(): Record<string, { name: string; type: 'css' | 'js'; location: CodeLocation; code: string; description: string }> {
  return {
    google_analytics: {
      name: 'Google Analytics 4',
      type: 'js',
      location: 'head',
      code: `<!-- Replace GA_MEASUREMENT_ID with your ID -->
(function() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
})();`,
      description: 'Google Analytics 4 tracking snippet',
    },
    facebook_pixel: {
      name: 'Facebook Pixel',
      type: 'js',
      location: 'head',
      code: `<!-- Replace PIXEL_ID with your Pixel ID -->
(function() {
  var n = window.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
  if (!window._fbq) window._fbq = n;
  n.push = n; n.loaded = true; n.version = '2.0';
  n.queue = [];
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
})();`,
      description: 'Facebook Pixel tracking snippet',
    },
    hotjar: {
      name: 'Hotjar',
      type: 'js',
      location: 'head',
      code: `<!-- Replace HOTJAR_ID with your Hotjar ID -->
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:HOTJAR_ID,hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
      description: 'Hotjar heatmaps and recordings',
    },
    custom_fonts: {
      name: 'Custom Google Fonts',
      type: 'css',
      location: 'head',
      code: `/* Replace with your font family */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}`,
      description: 'Import and apply custom Google Fonts',
    },
    smooth_scroll: {
      name: 'Smooth Scroll',
      type: 'css',
      location: 'head',
      code: `html {
  scroll-behavior: smooth;
}`,
      description: 'Enable smooth scrolling on anchor links',
    },
  }
}
