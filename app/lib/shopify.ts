import {createCookie} from '@remix-run/node';
import type {CartViewModel, CollectionFilterState, LocaleConfig} from '~/types/models';

const STOREFRONT_API_VERSION = '2025-01';

const cartIdCookie = createCookie('cartId', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: true,
  maxAge: 60 * 60 * 24 * 30,
});

interface StorefrontClientConfig {
  storeDomain: string;
  publicToken: string;
}

function getStorefrontClientConfig(): StorefrontClientConfig {
  const storeDomain = process.env.PUBLIC_STORE_DOMAIN || '';
  const publicToken = process.env.PUBLIC_STOREFRONT_API_TOKEN || '';

  if (!storeDomain || !publicToken) {
    throw new Error('Missing Shopify Storefront credentials in environment variables.');
  }

  return {storeDomain, publicToken};
}

async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const {storeDomain, publicToken} = getStorefrontClientConfig();
  const response = await fetch(`https://${storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': publicToken,
    },
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    throw new Error(`Storefront API failed with status ${response.status}`);
  }

  const body = await response.json() as {data?: T; errors?: Array<{message: string}>};
  if (body.errors?.length) {
    throw new Error(body.errors[0].message);
  }

  if (!body.data) {
    throw new Error('No data returned from Storefront API');
  }

  return body.data;
}

export async function queryHomePageContent(locale: LocaleConfig) {
  return storefrontQuery<{shop: {name: string; description: string}}>('
    query HomePageContent($language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
      shop {
        name
        description
      }
    }
  ', {
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });
}

export async function queryCollectionByHandle(
  handle: string,
  locale: LocaleConfig,
  filters: CollectionFilterState,
  cursor?: string,
) {
  return storefrontQuery<any>(`
    query CollectionByHandle($handle: String!, $cursor: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        products(first: 12, after: $cursor, sortKey: $sortKey, reverse: $reverse) {
          edges {
            cursor
            node {
              id
              handle
              title
              availableForSale
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  `, {
    handle,
    cursor,
    sortKey: filters.sortKey,
    reverse: filters.reverse,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });
}

export async function queryProductByHandle(
  handle: string,
  locale: LocaleConfig,
  selectedOptions: Array<{name: string; value: string}> = [],
) {
  return storefrontQuery<any>(`
    query ProductByHandle($handle: String!, $selectedOptions: [SelectedOptionInput!]!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      product(handle: $handle) {
        id
        handle
        title
        descriptionHtml
        availableForSale
        options {
          name
          values
        }
        featuredImage {
          url
          altText
        }
        selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
        variants(first: 50) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      productRecommendations(productHandle: $handle) {
        id
        handle
        title
        availableForSale
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  `, {
    handle,
    selectedOptions,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });
}

export async function queryPredictiveSearch(query: string, locale: LocaleConfig) {
  return storefrontQuery<any>(`
    query PredictiveSearch($query: String!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      predictiveSearch(query: $query, limit: 8) {
        products {
          id
          handle
          title
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
        collections {
          id
          handle
          title
        }
      }
    }
  `, {
    query,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });
}

export async function queryPageByHandle(handle: string, locale: LocaleConfig) {
  return storefrontQuery<any>(`
    query PageByHandle($handle: String!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      page(handle: $handle) {
        id
        title
        body
      }
    }
  `, {
    handle,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });
}

export async function getCartId(request: Request) {
  return cartIdCookie.parse(request.headers.get('Cookie'));
}

export async function setCartId(cartId: string) {
  return cartIdCookie.serialize(cartId);
}

export async function queryCart(cartId: string, locale: LocaleConfig): Promise<CartViewModel | null> {
  const data = await storefrontQuery<any>(`
    query Cart($cartId: ID!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                image {
                  url
                  altText
                }
                product {
                  title
                  handle
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `, {
    cartId,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });

  return data.cart;
}

export async function mutationCartCreate(
  lines: Array<{merchandiseId: string; quantity: number}>,
  locale: LocaleConfig,
): Promise<CartViewModel> {
  const data = await storefrontQuery<any>(`
    mutation CartCreate($lines: [CartLineInput!], $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      cartCreate(input: {lines: $lines}) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image { url altText }
                  product { title handle }
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `, {
    lines,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });

  return data.cartCreate.cart;
}

export async function mutationCartLinesAdd(
  cartId: string,
  lines: Array<{merchandiseId: string; quantity: number}>,
  locale: LocaleConfig,
): Promise<CartViewModel> {
  const data = await storefrontQuery<any>(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image { url altText }
                  product { title handle }
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `, {
    cartId,
    lines,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });

  return data.cartLinesAdd.cart;
}

export async function mutationCartLinesUpdate(
  cartId: string,
  lines: Array<{id: string; quantity: number}>,
  locale: LocaleConfig,
): Promise<CartViewModel> {
  const data = await storefrontQuery<any>(`
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image { url altText }
                  product { title handle }
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `, {
    cartId,
    lines,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });

  return data.cartLinesUpdate.cart;
}

export async function mutationCartLinesRemove(
  cartId: string,
  lineIds: string[],
  locale: LocaleConfig,
): Promise<CartViewModel> {
  const data = await storefrontQuery<any>(`
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image { url altText }
                  product { title handle }
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `, {
    cartId,
    lineIds,
    language: locale.code.toUpperCase(),
    country: locale.code === 'pl' ? 'PL' : 'US',
  });

  return data.cartLinesRemove.cart;
}
