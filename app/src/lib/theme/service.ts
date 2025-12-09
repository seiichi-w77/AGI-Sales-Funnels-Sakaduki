import { prisma } from '@/lib/db/prisma'

export interface ThemeSettings {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    success: string
    error: string
    warning: string
    info: string
  }
  typography: {
    fontFamily: string
    headingFontFamily: string
    baseFontSize: string
    lineHeight: string
    headingLineHeight: string
  }
  spacing: {
    unit: number
    containerMaxWidth: string
    sectionPadding: string
  }
  borders: {
    radius: string
    radiusLarge: string
    radiusSmall: string
    width: string
  }
  shadows: {
    small: string
    medium: string
    large: string
  }
  buttons: {
    borderRadius: string
    padding: string
    fontSize: string
    fontWeight: string
  }
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateThemeInput {
  workspaceId: string
  name: string
  colors?: Partial<ThemeSettings['colors']>
  typography?: Partial<ThemeSettings['typography']>
  spacing?: Partial<ThemeSettings['spacing']>
  borders?: Partial<ThemeSettings['borders']>
  shadows?: Partial<ThemeSettings['shadows']>
  buttons?: Partial<ThemeSettings['buttons']>
  isDefault?: boolean
}

const defaultTheme: Omit<ThemeSettings, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'isDefault'> = {
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#0ea5e9',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFontFamily: 'Inter, system-ui, sans-serif',
    baseFontSize: '16px',
    lineHeight: '1.5',
    headingLineHeight: '1.2',
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1200px',
    sectionPadding: '80px',
  },
  borders: {
    radius: '8px',
    radiusLarge: '16px',
    radiusSmall: '4px',
    width: '1px',
  },
  shadows: {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  buttons: {
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
  },
}

/**
 * Get all themes for a workspace
 */
export async function getThemes(workspaceId: string): Promise<ThemeSettings[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.themes || []) as ThemeSettings[]
}

/**
 * Get theme by ID
 */
export async function getThemeById(workspaceId: string, themeId: string): Promise<ThemeSettings | null> {
  const themes = await getThemes(workspaceId)
  return themes.find((t) => t.id === themeId) || null
}

/**
 * Create a new theme
 */
export async function createTheme(input: CreateThemeInput): Promise<ThemeSettings> {
  const { workspaceId, name, isDefault = false, ...partialTheme } = input

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const themes = (settings.themes || []) as ThemeSettings[]

  if (isDefault) {
    for (const theme of themes) {
      theme.isDefault = false
    }
  }

  const newTheme: ThemeSettings = {
    id: `theme-${Date.now()}`,
    name,
    colors: { ...defaultTheme.colors, ...partialTheme.colors },
    typography: { ...defaultTheme.typography, ...partialTheme.typography },
    spacing: { ...defaultTheme.spacing, ...partialTheme.spacing },
    borders: { ...defaultTheme.borders, ...partialTheme.borders },
    shadows: { ...defaultTheme.shadows, ...partialTheme.shadows },
    buttons: { ...defaultTheme.buttons, ...partialTheme.buttons },
    isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        themes: [...themes, newTheme],
      } as object,
    },
  })

  return newTheme
}

interface UpdateThemeInput {
  name?: string
  colors?: Partial<ThemeSettings['colors']>
  typography?: Partial<ThemeSettings['typography']>
  spacing?: Partial<ThemeSettings['spacing']>
  borders?: Partial<ThemeSettings['borders']>
  shadows?: Partial<ThemeSettings['shadows']>
  buttons?: Partial<ThemeSettings['buttons']>
  isDefault?: boolean
}

/**
 * Update a theme
 */
export async function updateTheme(
  workspaceId: string,
  themeId: string,
  updates: UpdateThemeInput
): Promise<ThemeSettings> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace settings not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const themes = (settings.themes || []) as ThemeSettings[]

  const index = themes.findIndex((t) => t.id === themeId)
  if (index === -1) {
    throw new Error('Theme not found')
  }

  if (updates.isDefault) {
    for (const theme of themes) {
      theme.isDefault = false
    }
  }

  const updatedTheme: ThemeSettings = {
    ...themes[index],
    ...updates,
    colors: { ...themes[index].colors, ...updates.colors },
    typography: { ...themes[index].typography, ...updates.typography },
    spacing: { ...themes[index].spacing, ...updates.spacing },
    borders: { ...themes[index].borders, ...updates.borders },
    shadows: { ...themes[index].shadows, ...updates.shadows },
    buttons: { ...themes[index].buttons, ...updates.buttons },
    updatedAt: new Date().toISOString(),
  }

  themes[index] = updatedTheme

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        themes,
      } as object,
    },
  })

  return updatedTheme
}

/**
 * Delete a theme
 */
export async function deleteTheme(workspaceId: string, themeId: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    throw new Error('Workspace settings not found')
  }

  const settings = workspace.settings as Record<string, unknown>
  const themes = (settings.themes || []) as ThemeSettings[]

  const filteredThemes = themes.filter((t) => t.id !== themeId)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        themes: filteredThemes,
      } as object,
    },
  })
}

/**
 * Get default theme
 */
export function getDefaultTheme(): Omit<ThemeSettings, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'isDefault'> {
  return defaultTheme
}

/**
 * Generate CSS from theme
 */
export function generateThemeCss(theme: ThemeSettings): string {
  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-text: ${theme.colors.text};
  --color-text-muted: ${theme.colors.textMuted};
  --color-border: ${theme.colors.border};
  --color-success: ${theme.colors.success};
  --color-error: ${theme.colors.error};
  --color-warning: ${theme.colors.warning};
  --color-info: ${theme.colors.info};

  --font-family: ${theme.typography.fontFamily};
  --font-family-heading: ${theme.typography.headingFontFamily};
  --font-size-base: ${theme.typography.baseFontSize};
  --line-height: ${theme.typography.lineHeight};
  --line-height-heading: ${theme.typography.headingLineHeight};

  --spacing-unit: ${theme.spacing.unit}px;
  --container-max-width: ${theme.spacing.containerMaxWidth};
  --section-padding: ${theme.spacing.sectionPadding};

  --border-radius: ${theme.borders.radius};
  --border-radius-lg: ${theme.borders.radiusLarge};
  --border-radius-sm: ${theme.borders.radiusSmall};
  --border-width: ${theme.borders.width};

  --shadow-sm: ${theme.shadows.small};
  --shadow-md: ${theme.shadows.medium};
  --shadow-lg: ${theme.shadows.large};

  --button-border-radius: ${theme.buttons.borderRadius};
  --button-padding: ${theme.buttons.padding};
  --button-font-size: ${theme.buttons.fontSize};
  --button-font-weight: ${theme.buttons.fontWeight};
}
`.trim()
}

/**
 * Preset themes
 */
export function getPresetThemes(): { id: string; name: string; preview: Partial<ThemeSettings['colors']> }[] {
  return [
    {
      id: 'dark-blue',
      name: 'Dark Blue',
      preview: {
        primary: '#2563eb',
        background: '#0f172a',
        surface: '#1e293b',
      },
    },
    {
      id: 'light-minimal',
      name: 'Light Minimal',
      preview: {
        primary: '#1e293b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textMuted: '#64748b',
      },
    },
    {
      id: 'purple-gradient',
      name: 'Purple Gradient',
      preview: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        background: '#1e1b4b',
        surface: '#312e81',
      },
    },
    {
      id: 'green-nature',
      name: 'Green Nature',
      preview: {
        primary: '#16a34a',
        secondary: '#22c55e',
        background: '#14532d',
        surface: '#166534',
      },
    },
    {
      id: 'warm-sunset',
      name: 'Warm Sunset',
      preview: {
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#fbbf24',
        background: '#431407',
        surface: '#7c2d12',
      },
    },
  ]
}
