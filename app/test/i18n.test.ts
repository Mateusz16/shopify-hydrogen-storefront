import {describe, expect, it} from 'vitest';
import {ensureLocalePrefix, getLocaleFromPathname, localeToCountryCode} from '~/lib/i18n';

describe('i18n helpers', () => {
  it('detects locale from pathname', () => {
    expect(getLocaleFromPathname('/pl/products/item').code).toBe('pl');
    expect(getLocaleFromPathname('/en/products/item').code).toBe('en');
    expect(getLocaleFromPathname('/products/item').code).toBe('pl');
  });

  it('rewrites locale prefix', () => {
    expect(ensureLocalePrefix('/pl/collections/all', 'en')).toBe('/en/collections/all');
    expect(ensureLocalePrefix('/collections/all', 'pl')).toBe('/pl/collections/all');
  });

  it('maps locale to country code', () => {
    expect(localeToCountryCode(getLocaleFromPathname('/pl'))).toBe('PL');
    expect(localeToCountryCode(getLocaleFromPathname('/en'))).toBe('US');
  });
});
