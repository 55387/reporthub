import { describe, it, expect } from 'vitest';
import zhMessages from '@/i18n/messages/zh.json';
import enMessages from '@/i18n/messages/en.json';

describe('i18n messages', () => {
  it('should have matching keys between zh and en', () => {
    const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          return getKeys(value as Record<string, unknown>, fullKey);
        }
        return fullKey;
      });
    };

    const zhKeys = getKeys(zhMessages).sort();
    const enKeys = getKeys(enMessages).sort();

    expect(zhKeys).toEqual(enKeys);
  });

  it('should have all nav keys defined', () => {
    const navKeys = ['dashboard', 'shares', 'analysis', 'ai', 'settings'];
    navKeys.forEach((key) => {
      expect(zhMessages.nav).toHaveProperty(key);
      expect(enMessages.nav).toHaveProperty(key);
    });
  });

  it('should have non-empty values', () => {
    const checkValues = (obj: Record<string, unknown>, path = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string') {
          expect(value.length, `Empty value at ${fullPath}`).toBeGreaterThan(0);
        } else if (typeof value === 'object' && value !== null) {
          checkValues(value as Record<string, unknown>, fullPath);
        }
      });
    };

    checkValues(zhMessages);
    checkValues(enMessages);
  });
});
