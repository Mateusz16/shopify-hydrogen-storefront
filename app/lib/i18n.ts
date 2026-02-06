import type {LocaleCode, LocaleConfig} from '~/types/models';

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  pl: {
    code: 'pl',
    language: 'pl-PL',
    currency: 'PLN',
    label: 'Polski',
  },
  en: {
    code: 'en',
    language: 'en-US',
    currency: 'USD',
    label: 'English',
  },
};

export function getLocaleFromPathname(pathname: string): LocaleConfig {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0] as LocaleCode | undefined;
  if (maybeLocale && LOCALES[maybeLocale]) {
    return LOCALES[maybeLocale];
  }
  return LOCALES.pl;
}

export function ensureLocalePrefix(pathname: string, locale: LocaleCode): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalized === '/') return `/${locale}`;
  const current = normalized.split('/').filter(Boolean)[0] as LocaleCode;
  if (LOCALES[current]) {
    return normalized.replace(`/${current}`, `/${locale}`);
  }
  return `/${locale}${normalized}`;
}

export function localeToCountryCode(locale: LocaleConfig): 'PL' | 'US' {
  return locale.code === 'pl' ? 'PL' : 'US';
}
