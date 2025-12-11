/**
 * Example test file
 *
 * Run tests: npm test
 * Watch mode: npm test -- --watch
 * Coverage: npm test -- --coverage
 */

import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, slugify } from '../lib/utils';

describe('AGI-Sales-Funnels-Sakaduki Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500');
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle conflicting tailwind classes', () => {
      const result = cn('px-4', 'px-8');
      expect(result).toBe('px-8');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base active');
    });
  });

  describe('formatCurrency', () => {
    it('should format JPY currency', () => {
      const result = formatCurrency(1000);
      expect(result).toBe('￥1,000');
    });

    it('should format USD currency', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toBe('$1,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format date in Japanese locale', () => {
      const result = formatDate('2025-01-15');
      expect(result).toContain('2025');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      const result = slugify('Hello World');
      expect(result).toBe('hello-world');
    });

    it('should handle special characters', () => {
      const result = slugify('Hello! World?');
      expect(result).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      const result = slugify('Hello   World');
      expect(result).toBe('hello-world');
    });
  });
});

describe('Environment', () => {
  it('should have Node.js environment', () => {
    expect(typeof process).toBe('object');
    expect(process.env).toBeDefined();
  });
});
