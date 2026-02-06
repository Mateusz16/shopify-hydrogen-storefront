import type {LocaleConfig} from '~/types/models';

export function formatMoney(
  amount: string | number,
  currencyCode: string,
  locale: LocaleConfig,
): string {
  return new Intl.NumberFormat(locale.language, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}
