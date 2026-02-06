import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Form, useLoaderData, useSearchParams} from '@remix-run/react';
import {Accordion, Badge, Button, Price, ProductCard, VariantSelector} from '~/components/ui';
import {getLocaleFromPathname} from '~/lib/i18n';
import {productJsonLd} from '~/lib/seo';
import {queryProductByHandle} from '~/lib/shopify';

export async function loader({params, request}: LoaderFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const handle = params.handle;

  if (!handle) {
    throw new Response('Product not found', {status: 404});
  }

  const url = new URL(request.url);
  const selectedOptions = Array.from(url.searchParams.entries()).map(([name, value]) => ({name, value}));

  const data = await queryProductByHandle(handle, locale, selectedOptions);
  const product = data.product;

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  const selectedVariant = product.selectedOrFirstAvailableVariant;

  const model = {
    id: product.id,
    handle: product.handle,
    title: product.title,
    imageUrl: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText,
    availableForSale: selectedVariant?.availableForSale ?? product.availableForSale,
    price: selectedVariant?.price,
    descriptionHtml: product.descriptionHtml,
    options: product.options,
    variants: product.variants.nodes,
  };

  const recommendations = (data.productRecommendations || []).slice(0, 4).map((item: any) => ({
    id: item.id,
    handle: item.handle,
    title: item.title,
    imageUrl: item.featuredImage?.url,
    imageAlt: item.featuredImage?.altText,
    availableForSale: item.availableForSale,
    price: item.priceRange.minVariantPrice,
  }));

  return json({
    locale,
    product: model,
    selectedVariantId: selectedVariant?.id,
    recommendations,
    structuredData: productJsonLd({
      name: model.title,
      description: product.descriptionHtml.replace(/<[^>]+>/g, ''),
      image: model.imageUrl,
      currencyCode: selectedVariant?.price?.currencyCode ?? 'PLN',
      amount: selectedVariant?.price?.amount ?? '0',
    }),
  });
}

export default function ProductRoute() {
  const {locale, product, selectedVariantId, recommendations, structuredData} = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();

  const selected: Record<string, string> = {};
  product.options.forEach((option: any) => {
    selected[option.name] = params.get(option.name) || option.values[0];
  });

  return (
    <div className="container" style={{padding: 'var(--space-12) 0'}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />
      <div className="two-col">
        <section>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.imageAlt || product.title} style={{borderRadius: 'var(--radius-lg)'}} />
          ) : (
            <div style={{aspectRatio: '4/5', background: '#ece6dc', borderRadius: 'var(--radius-lg)'}} />
          )}
        </section>

        <section className="sticky-buy">
          <h1 className="section-title" style={{marginBottom: '0.5rem'}}>{product.title}</h1>
          <div style={{display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: 'var(--space-4)'}}>
            <Price amount={product.price} locale={locale} />
            {!product.availableForSale && <Badge>Unavailable</Badge>}
          </div>

          <VariantSelector
            options={product.options}
            selected={selected}
            onChange={(name, value) => {
              const copy = new URLSearchParams(params);
              copy.set(name, value);
              setParams(copy, {replace: true});
            }}
          />

          <Form method="post" action={`/${locale.code}/cart`} style={{marginTop: 'var(--space-6)'}}>
            <input type="hidden" name="intent" value="add" />
            <input type="hidden" name="merchandiseId" value={selectedVariantId} />
            <input type="hidden" name="quantity" value="1" />
            <Button type="submit">Add to cart</Button>
          </Form>

          <div style={{marginTop: 'var(--space-6)'}} dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />

          <div className="grid" style={{marginTop: 'var(--space-6)'}}>
            <Accordion title="Delivery & returns">Shipping in 24-48h and 30-day returns policy.</Accordion>
            <Accordion title="Materials & care">Premium material blend. Follow care label recommendations.</Accordion>
          </div>
        </section>
      </div>

      <section style={{paddingTop: 'var(--space-12)'}}>
        <h2 className="section-title">You might also like</h2>
        <div className="grid product-grid">
          {recommendations.map((product: any) => (
            <ProductCard key={product.id} product={product} locale={locale} localePrefix={locale.code} />
          ))}
        </div>
      </section>
    </div>
  );
}
