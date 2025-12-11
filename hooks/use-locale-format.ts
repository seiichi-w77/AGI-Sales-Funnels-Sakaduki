'use client';

import { useFormatter, useLocale, useNow, useTimeZone } from 'next-intl';
import { useMemo } from 'react';

export type SupportedLocale = 'ja' | 'en';
export type DateFormat = 'YYYY/MM/DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';

interface FormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * Custom hook for locale-aware formatting of dates, numbers, and currencies.
 * Uses next-intl's useFormatter under the hood.
 */
export function useLocaleFormat() {
  const format = useFormatter();
  const locale = useLocale() as SupportedLocale;
  const timezone = useTimeZone();
  const now = useNow();

  const formatters = useMemo(() => {
    /**
     * Format a date according to the current locale.
     * @example
     * formatDate(new Date()) // "2025/12/11" (ja) or "Dec 11, 2025" (en)
     */
    const formatDate = (
      date: Date | number | string,
      options?: FormatOptions
    ): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(d, {
        dateStyle: options?.dateStyle || 'medium',
        timeZone: timezone,
      });
    };

    /**
     * Format a date with time according to the current locale.
     * @example
     * formatDateTime(new Date()) // "2025/12/11 14:30" (ja) or "Dec 11, 2025, 2:30 PM" (en)
     */
    const formatDateTime = (
      date: Date | number | string,
      options?: FormatOptions
    ): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(d, {
        dateStyle: options?.dateStyle || 'medium',
        timeStyle: options?.timeStyle || 'short',
        timeZone: timezone,
      });
    };

    /**
     * Format time only according to the current locale.
     * @example
     * formatTime(new Date()) // "14:30" (ja) or "2:30 PM" (en)
     */
    const formatTime = (
      date: Date | number | string,
      options?: Pick<FormatOptions, 'timeStyle'>
    ): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(d, {
        timeStyle: options?.timeStyle || 'short',
        timeZone: timezone,
      });
    };

    /**
     * Format a relative time (e.g., "3 days ago", "in 2 hours").
     * @example
     * formatRelativeTime(pastDate) // "3日前" (ja) or "3 days ago" (en)
     */
    const formatRelativeTime = (date: Date | number | string): string => {
      const d = typeof date === 'string' ? new Date(date) : new Date(date);
      return format.relativeTime(d, now);
    };

    /**
     * Format a number according to the current locale.
     * @example
     * formatNumber(1234567.89) // "1,234,567.89"
     */
    const formatNumber = (
      value: number,
      options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        useGrouping?: boolean;
      }
    ): string => {
      return format.number(value, options);
    };

    /**
     * Format a number as a percentage.
     * @example
     * formatPercent(0.1234) // "12.34%" (ja) or "12.34%" (en)
     */
    const formatPercent = (
      value: number,
      decimals: number = 2
    ): string => {
      return format.number(value, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    /**
     * Format a currency value according to the current locale.
     * Uses JPY for Japanese locale, USD for English.
     * @example
     * formatCurrency(1000) // "¥1,000" (ja) or "$10.00" (en)
     */
    const formatCurrency = (
      value: number,
      currency?: string
    ): string => {
      // Default currency based on locale
      const defaultCurrency = locale === 'ja' ? 'JPY' : 'USD';
      const currencyCode = currency || defaultCurrency;

      // JPY doesn't use decimal places
      const minimumFractionDigits = currencyCode === 'JPY' ? 0 : 2;

      return format.number(value, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits,
      });
    };

    /**
     * Format a compact number (e.g., 1.2K, 3.4M).
     * @example
     * formatCompact(1234567) // "123万" (ja) or "1.2M" (en)
     */
    const formatCompact = (value: number): string => {
      return format.number(value, {
        notation: 'compact',
        compactDisplay: 'short',
      });
    };

    /**
     * Format bytes to human-readable size.
     * @example
     * formatBytes(1024) // "1 KB"
     */
    const formatBytes = (bytes: number, decimals: number = 1): string => {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      const value = bytes / Math.pow(k, i);
      return `${format.number(value, { maximumFractionDigits: decimals })} ${sizes[i]}`;
    };

    /**
     * Format duration in seconds to human-readable format.
     * @example
     * formatDuration(3661) // "1時間1分1秒" (ja) or "1h 1m 1s" (en)
     */
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      if (locale === 'ja') {
        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}時間`);
        if (minutes > 0) parts.push(`${minutes}分`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`);
        return parts.join('');
      } else {
        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
        return parts.join(' ');
      }
    };

    return {
      formatDate,
      formatDateTime,
      formatTime,
      formatRelativeTime,
      formatNumber,
      formatPercent,
      formatCurrency,
      formatCompact,
      formatBytes,
      formatDuration,
    };
  }, [format, locale, timezone, now]);

  return {
    ...formatters,
    locale,
    timezone,
    now,
  };
}

/**
 * Helper function for server-side date formatting.
 */
export function formatDateForLocale(
  date: Date | string | number,
  locale: SupportedLocale = 'ja',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return d.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: locale === 'ja' ? '2-digit' : 'short',
    day: '2-digit',
    ...options,
  });
}

/**
 * Helper function for server-side currency formatting.
 */
export function formatCurrencyForLocale(
  value: number,
  locale: SupportedLocale = 'ja',
  currency?: string
): string {
  const currencyCode = currency || (locale === 'ja' ? 'JPY' : 'USD');
  const minimumFractionDigits = currencyCode === 'JPY' ? 0 : 2;

  return value.toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}
