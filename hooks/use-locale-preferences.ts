'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export type SupportedLocale = 'ja' | 'en';
export type DateFormat = 'YYYY/MM/DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';

interface UserPreferences {
  language: SupportedLocale;
  timezone: string;
  dateFormat: DateFormat;
}

const STORAGE_KEY = 'preferred-language';
const TIMEZONE_KEY = 'preferred-timezone';
const DATE_FORMAT_KEY = 'preferred-date-format';

/**
 * Get browser's preferred language
 */
function getBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') return 'ja';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('en')) return 'en';

  return 'ja'; // Default to Japanese
}

/**
 * Custom hook for managing locale preferences with priority:
 * 1. User settings (DB) - for logged in users
 * 2. localStorage - for persistent local settings
 * 3. Browser language - for first-time visitors
 * 4. System default - Japanese
 */
export function useLocalePreferences() {
  const { data: session, status } = useSession();
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: currentLocale,
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY/MM/DD',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);

      // If logged in, fetch from API
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/users/me/preferences');
          if (response.ok) {
            const data = await response.json();
            setPreferences(data.preferences);

            // Update localStorage to sync
            localStorage.setItem(STORAGE_KEY, data.preferences.language);
            localStorage.setItem(TIMEZONE_KEY, data.preferences.timezone);
            localStorage.setItem(DATE_FORMAT_KEY, data.preferences.dateFormat);

            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Failed to fetch user preferences:', error);
        }
      }

      // Fallback to localStorage
      const storedLang = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      const storedTimezone = localStorage.getItem(TIMEZONE_KEY);
      const storedDateFormat = localStorage.getItem(DATE_FORMAT_KEY) as DateFormat | null;

      if (storedLang && ['ja', 'en'].includes(storedLang)) {
        setPreferences(prev => ({
          ...prev,
          language: storedLang,
          timezone: storedTimezone || prev.timezone,
          dateFormat: storedDateFormat || prev.dateFormat,
        }));
      } else {
        // Fallback to browser language
        const browserLang = getBrowserLanguage();
        setPreferences(prev => ({
          ...prev,
          language: browserLang,
        }));
        localStorage.setItem(STORAGE_KEY, browserLang);
      }

      setIsLoading(false);
    };

    if (status !== 'loading') {
      loadPreferences();
    }
  }, [status, session]);

  // Update language
  const setLanguage = useCallback(async (newLanguage: SupportedLocale) => {
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, newLanguage);

    // Update state
    setPreferences(prev => ({ ...prev, language: newLanguage }));

    // If logged in, save to DB
    if (status === 'authenticated') {
      try {
        await fetch('/api/users/me/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLanguage }),
        });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }

    // Navigate to new locale
    router.replace(pathname, { locale: newLanguage });
  }, [status, router, pathname]);

  // Update timezone
  const setTimezone = useCallback(async (newTimezone: string) => {
    localStorage.setItem(TIMEZONE_KEY, newTimezone);
    setPreferences(prev => ({ ...prev, timezone: newTimezone }));

    if (status === 'authenticated') {
      try {
        await fetch('/api/users/me/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timezone: newTimezone }),
        });
      } catch (error) {
        console.error('Failed to save timezone preference:', error);
      }
    }
  }, [status]);

  // Update date format
  const setDateFormat = useCallback(async (newFormat: DateFormat) => {
    localStorage.setItem(DATE_FORMAT_KEY, newFormat);
    setPreferences(prev => ({ ...prev, dateFormat: newFormat }));

    if (status === 'authenticated') {
      try {
        await fetch('/api/users/me/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateFormat: newFormat }),
        });
      } catch (error) {
        console.error('Failed to save date format preference:', error);
      }
    }
  }, [status]);

  return {
    preferences,
    isLoading,
    setLanguage,
    setTimezone,
    setDateFormat,
    isAuthenticated: status === 'authenticated',
  };
}

/**
 * Get stored language preference (for use outside React components)
 */
export function getStoredLanguage(): SupportedLocale {
  if (typeof window === 'undefined') return 'ja';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['ja', 'en'].includes(stored)) {
    return stored as SupportedLocale;
  }

  return getBrowserLanguage();
}
