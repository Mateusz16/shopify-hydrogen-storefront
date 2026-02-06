import {describe, expect, it} from 'vitest';
import {formatMoney} from '~/lib/format';
import {LOCALES} from '~/lib/i18n';

describe('formatMoney', () => {
  it('formats PLN in polish locale', () => {
    const value = formatMoney('129.99', 'PLN', LOCALES.pl);
    expect(value).toContain('129');
  });

  it('formats USD in english locale', () => {
    const value = formatMoney('129.99', 'USD', LOCALES.en);
    expect(value).toContain('129.99');
  });
});
