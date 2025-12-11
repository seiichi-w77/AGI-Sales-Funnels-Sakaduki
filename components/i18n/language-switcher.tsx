'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export type SupportedLocale = 'ja' | 'en';

interface Language {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'compact' | 'full';
  showFlag?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  className,
}: LanguageSwitcherProps) {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings');

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLocale);
    }

    // Navigate to the new locale
    router.replace(pathname, { locale: newLocale });
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label={t('language') || 'Select language'}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="cursor-pointer"
            >
              {showFlag && <span className="mr-2">{lang.flag}</span>}
              {lang.nativeName}
              {locale === lang.code && <span className="ml-2">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'full') {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2">
          {t('language') || 'Language'}
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                {showFlag && <span>{currentLanguage.flag}</span>}
                {currentLanguage.nativeName}
              </span>
              <Globe className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="cursor-pointer"
              >
                {showFlag && <span className="mr-2">{lang.flag}</span>}
                {lang.nativeName}
                {locale === lang.code && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          {showFlag && <span className="mr-1">{currentLanguage.flag}</span>}
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <span className="sm:hidden">
            <Globe className="h-4 w-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
            role="option"
            aria-selected={locale === lang.code}
          >
            {showFlag && <span className="mr-2">{lang.flag}</span>}
            {lang.nativeName}
            {locale === lang.code && <span className="ml-2">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export types for external use
export type { Language, LanguageSwitcherProps };
