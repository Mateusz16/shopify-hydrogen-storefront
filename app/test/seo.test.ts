import {describe, expect, it} from 'vitest';
import {getSeoMeta, productJsonLd} from '~/lib/seo';

describe('seo helpers', () => {
  it('returns canonical and alternates', () => {
    const meta = getSeoMeta({
      title: 'Product page',
      description: 'Great product',
      pathname: '/pl/products/item',
    });

    expect(meta.canonical).toContain('/pl/products/item');
    expect(meta.alternates.pl).toContain('/pl/products/item');
    expect(meta.alternates.en).toContain('/en/products/item');
  });

  it('builds product schema', () => {
    const schema = productJsonLd({
      name: 'Product',
      description: 'Description',
      currencyCode: 'PLN',
      amount: '99.99',
    });

    expect(schema['@type']).toBe('Product');
    expect(schema.offers.price).toBe('99.99');
  });
});
