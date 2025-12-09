import { prisma } from '@/lib/db/prisma'

export type SupportedLocale = 'en' | 'ja' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ko'

export interface Translation {
  key: string
  translations: Record<SupportedLocale, string>
}

export interface LocaleSettings {
  defaultLocale: SupportedLocale
  enabledLocales: SupportedLocale[]
  autoDetect: boolean
  fallbackLocale: SupportedLocale
}

export interface ContentTranslation {
  id: string
  contentType: 'funnel' | 'step' | 'product' | 'email'
  contentId: string
  field: string
  locale: SupportedLocale
  value: string
  createdAt: string
  updatedAt: string
}

// Default system translations
const DEFAULT_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  // Common
  'common.save': {
    en: 'Save',
    ja: '保存',
    es: 'Guardar',
    fr: 'Enregistrer',
    de: 'Speichern',
    pt: 'Salvar',
    zh: '保存',
    ko: '저장',
  },
  'common.cancel': {
    en: 'Cancel',
    ja: 'キャンセル',
    es: 'Cancelar',
    fr: 'Annuler',
    de: 'Abbrechen',
    pt: 'Cancelar',
    zh: '取消',
    ko: '취소',
  },
  'common.delete': {
    en: 'Delete',
    ja: '削除',
    es: 'Eliminar',
    fr: 'Supprimer',
    de: 'Löschen',
    pt: 'Excluir',
    zh: '删除',
    ko: '삭제',
  },
  'common.edit': {
    en: 'Edit',
    ja: '編集',
    es: 'Editar',
    fr: 'Modifier',
    de: 'Bearbeiten',
    pt: 'Editar',
    zh: '编辑',
    ko: '편집',
  },
  'common.loading': {
    en: 'Loading...',
    ja: '読み込み中...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Laden...',
    pt: 'Carregando...',
    zh: '加载中...',
    ko: '로딩 중...',
  },
  'common.submit': {
    en: 'Submit',
    ja: '送信',
    es: 'Enviar',
    fr: 'Soumettre',
    de: 'Absenden',
    pt: 'Enviar',
    zh: '提交',
    ko: '제출',
  },

  // Checkout
  'checkout.title': {
    en: 'Checkout',
    ja: 'チェックアウト',
    es: 'Pagar',
    fr: 'Paiement',
    de: 'Kasse',
    pt: 'Finalizar Compra',
    zh: '结账',
    ko: '결제',
  },
  'checkout.subtotal': {
    en: 'Subtotal',
    ja: '小計',
    es: 'Subtotal',
    fr: 'Sous-total',
    de: 'Zwischensumme',
    pt: 'Subtotal',
    zh: '小计',
    ko: '소계',
  },
  'checkout.tax': {
    en: 'Tax',
    ja: '税金',
    es: 'Impuesto',
    fr: 'Taxe',
    de: 'Steuer',
    pt: 'Imposto',
    zh: '税',
    ko: '세금',
  },
  'checkout.total': {
    en: 'Total',
    ja: '合計',
    es: 'Total',
    fr: 'Total',
    de: 'Gesamt',
    pt: 'Total',
    zh: '总计',
    ko: '총액',
  },
  'checkout.pay_now': {
    en: 'Pay Now',
    ja: '今すぐ支払う',
    es: 'Pagar Ahora',
    fr: 'Payer Maintenant',
    de: 'Jetzt Bezahlen',
    pt: 'Pagar Agora',
    zh: '立即支付',
    ko: '지금 결제',
  },

  // Forms
  'form.email': {
    en: 'Email',
    ja: 'メールアドレス',
    es: 'Correo electrónico',
    fr: 'E-mail',
    de: 'E-Mail',
    pt: 'E-mail',
    zh: '电子邮件',
    ko: '이메일',
  },
  'form.name': {
    en: 'Name',
    ja: '名前',
    es: 'Nombre',
    fr: 'Nom',
    de: 'Name',
    pt: 'Nome',
    zh: '姓名',
    ko: '이름',
  },
  'form.phone': {
    en: 'Phone',
    ja: '電話番号',
    es: 'Teléfono',
    fr: 'Téléphone',
    de: 'Telefon',
    pt: 'Telefone',
    zh: '电话',
    ko: '전화번호',
  },
  'form.address': {
    en: 'Address',
    ja: '住所',
    es: 'Dirección',
    fr: 'Adresse',
    de: 'Adresse',
    pt: 'Endereço',
    zh: '地址',
    ko: '주소',
  },
  'form.city': {
    en: 'City',
    ja: '市区町村',
    es: 'Ciudad',
    fr: 'Ville',
    de: 'Stadt',
    pt: 'Cidade',
    zh: '城市',
    ko: '도시',
  },
  'form.country': {
    en: 'Country',
    ja: '国',
    es: 'País',
    fr: 'Pays',
    de: 'Land',
    pt: 'País',
    zh: '国家',
    ko: '국가',
  },
  'form.zip': {
    en: 'ZIP Code',
    ja: '郵便番号',
    es: 'Código Postal',
    fr: 'Code Postal',
    de: 'Postleitzahl',
    pt: 'CEP',
    zh: '邮编',
    ko: '우편번호',
  },

  // Errors
  'error.required': {
    en: 'This field is required',
    ja: 'この項目は必須です',
    es: 'Este campo es obligatorio',
    fr: 'Ce champ est obligatoire',
    de: 'Dieses Feld ist erforderlich',
    pt: 'Este campo é obrigatório',
    zh: '此字段为必填项',
    ko: '이 필드는 필수입니다',
  },
  'error.invalid_email': {
    en: 'Invalid email address',
    ja: '無効なメールアドレスです',
    es: 'Dirección de correo electrónico inválida',
    fr: 'Adresse e-mail invalide',
    de: 'Ungültige E-Mail-Adresse',
    pt: 'Endereço de e-mail inválido',
    zh: '电子邮件地址无效',
    ko: '유효하지 않은 이메일 주소',
  },
  'error.payment_failed': {
    en: 'Payment failed. Please try again.',
    ja: '支払いに失敗しました。再度お試しください。',
    es: 'El pago falló. Por favor, inténtelo de nuevo.',
    fr: 'Le paiement a échoué. Veuillez réessayer.',
    de: 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    pt: 'Pagamento falhou. Por favor, tente novamente.',
    zh: '支付失败，请重试。',
    ko: '결제에 실패했습니다. 다시 시도해 주세요.',
  },

  // Success messages
  'success.order_complete': {
    en: 'Thank you for your order!',
    ja: 'ご注文ありがとうございます！',
    es: '¡Gracias por su pedido!',
    fr: 'Merci pour votre commande !',
    de: 'Vielen Dank für Ihre Bestellung!',
    pt: 'Obrigado pelo seu pedido!',
    zh: '感谢您的订单！',
    ko: '주문해 주셔서 감사합니다!',
  },
  'success.subscription_active': {
    en: 'Your subscription is now active!',
    ja: 'サブスクリプションが有効になりました！',
    es: '¡Su suscripción está activa!',
    fr: 'Votre abonnement est maintenant actif !',
    de: 'Ihr Abonnement ist jetzt aktiv!',
    pt: 'Sua assinatura está ativa!',
    zh: '您的订阅已激活！',
    ko: '구독이 활성화되었습니다!',
  },
}

const LOCALE_NAMES: Record<SupportedLocale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  es: { native: 'Español', english: 'Spanish' },
  fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' },
  pt: { native: 'Português', english: 'Portuguese' },
  zh: { native: '中文', english: 'Chinese' },
  ko: { native: '한국어', english: 'Korean' },
}

/**
 * Get locale settings for a workspace
 */
export async function getLocaleSettings(workspaceId: string): Promise<LocaleSettings> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return {
      defaultLocale: 'en',
      enabledLocales: ['en'],
      autoDetect: true,
      fallbackLocale: 'en',
    }
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.localeSettings as LocaleSettings) || {
    defaultLocale: 'en',
    enabledLocales: ['en'],
    autoDetect: true,
    fallbackLocale: 'en',
  }
}

/**
 * Update locale settings
 */
export async function updateLocaleSettings(
  workspaceId: string,
  localeSettings: Partial<LocaleSettings>
): Promise<LocaleSettings> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const currentSettings = (settings.localeSettings as LocaleSettings) || {
    defaultLocale: 'en',
    enabledLocales: ['en'],
    autoDetect: true,
    fallbackLocale: 'en',
  }

  const updatedSettings: LocaleSettings = {
    ...currentSettings,
    ...localeSettings,
  }

  // Ensure default locale is in enabled locales
  if (!updatedSettings.enabledLocales.includes(updatedSettings.defaultLocale)) {
    updatedSettings.enabledLocales.push(updatedSettings.defaultLocale)
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        localeSettings: updatedSettings,
      } as object,
    },
  })

  return updatedSettings
}

/**
 * Get system translation
 */
export function getSystemTranslation(key: string, locale: SupportedLocale): string {
  const translation = DEFAULT_TRANSLATIONS[key]
  if (!translation) return key
  return translation[locale] || translation.en || key
}

/**
 * Get all system translations for a locale
 */
export function getSystemTranslations(locale: SupportedLocale): Record<string, string> {
  const translations: Record<string, string> = {}
  for (const [key, trans] of Object.entries(DEFAULT_TRANSLATIONS)) {
    translations[key] = trans[locale] || trans.en || key
  }
  return translations
}

/**
 * Get custom translations for a workspace
 */
export async function getCustomTranslations(
  workspaceId: string
): Promise<Record<string, Record<SupportedLocale, string>>> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return {}
  }

  const settings = workspace.settings as Record<string, unknown>
  return (settings.customTranslations as Record<string, Record<SupportedLocale, string>>) || {}
}

/**
 * Add or update custom translation
 */
export async function setCustomTranslation(
  workspaceId: string,
  key: string,
  translations: Partial<Record<SupportedLocale, string>>
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const customTranslations =
    (settings.customTranslations as Record<string, Record<SupportedLocale, string>>) || {}

  customTranslations[key] = {
    ...customTranslations[key],
    ...(translations as Record<SupportedLocale, string>),
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customTranslations,
      } as object,
    },
  })
}

/**
 * Delete custom translation
 */
export async function deleteCustomTranslation(workspaceId: string, key: string): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) return

  const settings = workspace.settings as Record<string, unknown>
  const customTranslations =
    (settings.customTranslations as Record<string, Record<SupportedLocale, string>>) || {}

  delete customTranslations[key]

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        customTranslations,
      } as object,
    },
  })
}

/**
 * Get content translations
 */
export async function getContentTranslations(
  workspaceId: string,
  contentType: ContentTranslation['contentType'],
  contentId: string
): Promise<ContentTranslation[]> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) {
    return []
  }

  const settings = workspace.settings as Record<string, unknown>
  const allTranslations = (settings.contentTranslations || []) as ContentTranslation[]

  return allTranslations.filter(
    (t) => t.contentType === contentType && t.contentId === contentId
  )
}

/**
 * Set content translation
 */
export async function setContentTranslation(
  workspaceId: string,
  contentType: ContentTranslation['contentType'],
  contentId: string,
  field: string,
  locale: SupportedLocale,
  value: string
): Promise<ContentTranslation> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings || {}) as Record<string, unknown>
  const translations = (settings.contentTranslations || []) as ContentTranslation[]

  const existingIndex = translations.findIndex(
    (t) =>
      t.contentType === contentType &&
      t.contentId === contentId &&
      t.field === field &&
      t.locale === locale
  )

  const now = new Date().toISOString()
  let translation: ContentTranslation

  if (existingIndex >= 0) {
    translation = {
      ...translations[existingIndex],
      value,
      updatedAt: now,
    }
    translations[existingIndex] = translation
  } else {
    translation = {
      id: `trans-${Date.now()}`,
      contentType,
      contentId,
      field,
      locale,
      value,
      createdAt: now,
      updatedAt: now,
    }
    translations.push(translation)
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        contentTranslations: translations,
      } as object,
    },
  })

  return translation
}

/**
 * Delete content translations for a content item
 */
export async function deleteContentTranslations(
  workspaceId: string,
  contentType: ContentTranslation['contentType'],
  contentId: string
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  if (!workspace?.settings) return

  const settings = workspace.settings as Record<string, unknown>
  const translations = (settings.contentTranslations || []) as ContentTranslation[]

  const filtered = translations.filter(
    (t) => !(t.contentType === contentType && t.contentId === contentId)
  )

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        contentTranslations: filtered,
      } as object,
    },
  })
}

/**
 * Detect locale from request
 */
export function detectLocale(
  acceptLanguageHeader: string | null,
  enabledLocales: SupportedLocale[]
): SupportedLocale {
  if (!acceptLanguageHeader) return 'en'

  const languages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const [locale, qValue] = lang.trim().split(';q=')
      return {
        locale: locale.split('-')[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1,
      }
    })
    .sort((a, b) => b.q - a.q)

  for (const { locale } of languages) {
    if (enabledLocales.includes(locale as SupportedLocale)) {
      return locale as SupportedLocale
    }
  }

  return enabledLocales[0] || 'en'
}

/**
 * Get available locales info
 */
export function getAvailableLocales(): { code: SupportedLocale; native: string; english: string }[] {
  return Object.entries(LOCALE_NAMES).map(([code, names]) => ({
    code: code as SupportedLocale,
    ...names,
  }))
}

/**
 * Get translation with fallback
 */
export async function translate(
  workspaceId: string,
  key: string,
  locale: SupportedLocale
): Promise<string> {
  // Try custom translations first
  const customTranslations = await getCustomTranslations(workspaceId)
  if (customTranslations[key]?.[locale]) {
    return customTranslations[key][locale]
  }

  // Fall back to system translations
  return getSystemTranslation(key, locale)
}

/**
 * Batch translate multiple keys
 */
export async function batchTranslate(
  workspaceId: string,
  keys: string[],
  locale: SupportedLocale
): Promise<Record<string, string>> {
  const customTranslations = await getCustomTranslations(workspaceId)
  const result: Record<string, string> = {}

  for (const key of keys) {
    if (customTranslations[key]?.[locale]) {
      result[key] = customTranslations[key][locale]
    } else {
      result[key] = getSystemTranslation(key, locale)
    }
  }

  return result
}
