import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Form, useLoaderData, useNavigation} from '@remix-run/react';
import {Input, ProductCard} from '~/components/ui';
import {getLocaleFromPathname} from '~/lib/i18n';
import {queryPredictiveSearch} from '~/lib/shopify';

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const locale = getLocaleFromPathname(url.pathname);
  const term = url.searchParams.get('q') || '';

  if (!term) {
    return json({locale, term, products: [], collections: []});
  }

  const data = await queryPredictiveSearch(term, locale);

  const products = (data.predictiveSearch?.products || []).map((item: any) => ({
    id: item.id,
    handle: item.handle,
    title: item.title,
    imageUrl: item.featuredImage?.url,
    imageAlt: item.featuredImage?.altText,
    availableForSale: true,
    price: item.priceRange.minVariantPrice,
  }));

  return json({
    locale,
    term,
    products,
    collections: data.predictiveSearch?.collections || [],
  });
}

export default function SearchRoute() {
  const {locale, term, products, collections} = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="container" style={{padding: 'var(--space-12) 0'}}>
      <h1 className="section-title">Search</h1>
      <Form method="get" style={{maxWidth: 540, marginBottom: 'var(--space-6)'}}>
        <Input name="q" defaultValue={term} placeholder="Search products and collections" />
      </Form>

      {navigation.state === 'loading' && <p>Searching…</p>}

      {term && (
        <p style={{color: 'var(--color-text-muted)'}}>
          Results for: <strong>{term}</strong>
        </p>
      )}

      <section style={{marginTop: 'var(--space-6)'}}>
        <h2 className="section-title" style={{fontSize: '1.5rem'}}>Products</h2>
        <div className="grid product-grid">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} locale={locale} localePrefix={locale.code} />
          ))}
        </div>
      </section>

      <section style={{marginTop: 'var(--space-8)'}}>
        <h2 className="section-title" style={{fontSize: '1.5rem'}}>Collections</h2>
        <div className="grid" style={{gap: '0.75rem'}}>
          {collections.map((collection: any) => (
            <a key={collection.id} className="card card-body" href={`/${locale.code}/collections/${collection.handle}`}>
              {collection.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
