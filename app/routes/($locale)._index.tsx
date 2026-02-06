import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Link, useLoaderData} from '@remix-run/react';
import {ProductCard} from '~/components/ui';
import {getLocaleFromPathname} from '~/lib/i18n';
import {queryHomePageContent, queryCollectionByHandle} from '~/lib/shopify';

export async function loader({request}: LoaderFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);

  const [shop, featured] = await Promise.all([
    queryHomePageContent(locale),
    queryCollectionByHandle('all', locale, {sortKey: 'BEST_SELLING', reverse: false}),
  ]);

  const products = featured.collection?.products?.edges?.map((edge: any) => ({
    id: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    imageUrl: edge.node.featuredImage?.url,
    imageAlt: edge.node.featuredImage?.altText,
    availableForSale: edge.node.availableForSale,
    price: edge.node.priceRange.minVariantPrice,
    compareAtPrice: edge.node.compareAtPriceRange?.minVariantPrice,
  })) ?? [];

  return json({
    locale,
    shopName: shop.shop.name,
    shopDescription: shop.shop.description,
    products,
  });
}

export default function HomeRoute() {
  const {locale, shopName, shopDescription, products} = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <section className="hero">
        <h1>Curated essentials for deliberate living.</h1>
        <p>{shopDescription || `${shopName} blends premium materials and sharp design for elevated daily rituals.`}</p>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
          <Link className="button button-primary" to={`/${locale.code}/collections/all`}>Explore collection</Link>
          <Link className="button button-ghost" to={`/${locale.code}/pages/o-nas`}>Our story</Link>
        </div>
      </section>

      <section>
        <h2 className="section-title">Bestsellers</h2>
        <div className="grid product-grid">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} locale={locale} localePrefix={locale.code} />
          ))}
        </div>
      </section>

      <section style={{padding: 'var(--space-12) 0'}}>
        <h2 className="section-title">Why customers choose us</h2>
        <div className="kpi-row">
          <article className="kpi"><strong>48h dispatch</strong><p>Fast handling and transparent shipment tracking.</p></article>
          <article className="kpi"><strong>30-day returns</strong><p>Risk-free product experience with simple policy.</p></article>
          <article className="kpi"><strong>Premium QA</strong><p>Every item passes strict quality checks before shipping.</p></article>
        </div>
      </section>
    </div>
  );
}
