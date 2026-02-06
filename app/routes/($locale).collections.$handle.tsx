import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link} from '@remix-run/react';
import {Pagination, ProductCard, Select} from '~/components/ui';
import {getLocaleFromPathname} from '~/lib/i18n';
import {queryCollectionByHandle} from '~/lib/shopify';

export async function loader({params, request}: LoaderFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const handle = params.handle || 'all';
  const url = new URL(request.url);

  const sortKey = url.searchParams.get('sort') || 'BEST_SELLING';
  const reverse = url.searchParams.get('reverse') === '1';
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const data = await queryCollectionByHandle(handle, locale, {sortKey, reverse}, cursor);
  const collection = data.collection;

  const products = collection?.products?.edges?.map((edge: any) => ({
    id: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    imageUrl: edge.node.featuredImage?.url,
    imageAlt: edge.node.featuredImage?.altText,
    availableForSale: edge.node.availableForSale,
    price: edge.node.priceRange.minVariantPrice,
    compareAtPrice: edge.node.compareAtPriceRange?.minVariantPrice,
  })) ?? [];

  const nextCursor = collection?.products?.pageInfo?.hasNextPage
    ? collection.products.edges[collection.products.edges.length - 1]?.cursor
    : undefined;

  return json({
    locale,
    handle,
    title: collection?.title || 'Collection',
    description: collection?.description || '',
    sortKey,
    reverse,
    products,
    nextCursor,
  });
}

export default function CollectionRoute() {
  const {locale, title, description, handle, sortKey, products, nextCursor} = useLoaderData<typeof loader>();

  return (
    <div className="container" style={{padding: 'var(--space-12) 0'}}>
      <header style={{marginBottom: 'var(--space-6)'}}>
        <h1 className="section-title" style={{marginBottom: '0.4rem'}}>{title}</h1>
        <p>{description}</p>
      </header>

      <div style={{display: 'flex', gap: '1rem', marginBottom: 'var(--space-6)', flexWrap: 'wrap'}}>
        <label style={{minWidth: 220}}>
          Sort
          <Select defaultValue={sortKey} onChange={(event) => {
            const value = event.currentTarget.value;
            window.location.search = `?sort=${value}`;
          }}>
            <option value="BEST_SELLING">Best selling</option>
            <option value="PRICE">Price</option>
            <option value="CREATED">Newest</option>
            <option value="TITLE">Title</option>
          </Select>
        </label>
        <Link className="button button-ghost" to={`/${locale.code}/search`}>Advanced search</Link>
      </div>

      <div className="grid product-grid">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} locale={locale} localePrefix={locale.code} />
        ))}
      </div>

      <div style={{marginTop: 'var(--space-6)'}}>
        <Pagination basePath={`/${locale.code}/collections/${handle}`} nextCursor={nextCursor} />
      </div>
    </div>
  );
}
