import type {SeoMetaModel} from '~/types/models';

const BASE_URL = process.env.PUBLIC_STORE_DOMAIN
  ? `https://${process.env.PUBLIC_STORE_DOMAIN}`
  : 'https://example.com';

export function getSeoMeta(input: {
  title: string;
  description: string;
  pathname: string;
}): SeoMetaModel {
  const canonical = `${BASE_URL}${input.pathname}`;
  const normalizedPath = input.pathname === '/' ? '' : input.pathname;
  const withoutLocale = normalizedPath
    .replace(/^\/pl(\/|$)/, '/')
    .replace(/^\/en(\/|$)/, '/')
    .replace(/\/+$/, '');
  const suffix = withoutLocale === '/' ? '' : withoutLocale;
  const plPath = `/pl${suffix}`;
  const enPath = `/en${suffix}`;

  return {
    title: `${input.title} | Premium Storefront`,
    description: input.description,
    canonical,
    alternates: {
      pl: `${BASE_URL}${plPath}`,
      en: `${BASE_URL}${enPath}`,
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  sku?: string;
  image?: string;
  currencyCode: string;
  amount: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currencyCode,
      price: product.amount,
      availability: 'https://schema.org/InStock',
    },
  };
}
