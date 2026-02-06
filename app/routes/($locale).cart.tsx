import {json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs} from '@remix-run/node';
import {Form, Link, useLoaderData} from '@remix-run/react';
import {Button, Price} from '~/components/ui';
import {getLocaleFromPathname} from '~/lib/i18n';
import {
  getCartId,
  mutationCartCreate,
  mutationCartLinesAdd,
  mutationCartLinesRemove,
  mutationCartLinesUpdate,
  queryCart,
  setCartId,
} from '~/lib/shopify';

export async function loader({request}: LoaderFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const cartId = await getCartId(request);
  const cart = cartId ? await queryCart(cartId, locale) : null;
  return json({locale, cart});
}

export async function action({request}: ActionFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const formData = await request.formData();

  const intent = String(formData.get('intent'));
  const quantity = Number(formData.get('quantity') || 1);

  let cartId = await getCartId(request);

  if (intent === 'add') {
    const merchandiseId = String(formData.get('merchandiseId'));
    const cart = cartId
      ? await mutationCartLinesAdd(cartId, [{merchandiseId, quantity}], locale)
      : await mutationCartCreate([{merchandiseId, quantity}], locale);

    return redirect(`/${locale.code}/cart?added=1`, {
      headers: {'Set-Cookie': await setCartId(cart.id)},
    });
  }

  if (!cartId) {
    return redirect(`/${locale.code}/cart`);
  }

  if (intent === 'update') {
    const lineId = String(formData.get('lineId'));
    await mutationCartLinesUpdate(cartId, [{id: lineId, quantity}], locale);
    return redirect(`/${locale.code}/cart`);
  }

  if (intent === 'remove') {
    const lineId = String(formData.get('lineId'));
    await mutationCartLinesRemove(cartId, [lineId], locale);
    return redirect(`/${locale.code}/cart?removed=1`);
  }

  if (intent === 'checkout') {
    const cart = await queryCart(cartId, locale);
    if (cart?.checkoutUrl) {
      return redirect(cart.checkoutUrl);
    }
  }

  return redirect(`/${locale.code}/cart`);
}

export default function CartRoute() {
  const {locale, cart} = useLoaderData<typeof loader>();
  const total = cart?.cost?.subtotalAmount;

  return (
    <div className="container" style={{padding: 'var(--space-12) 0'}}>
      <h1 className="section-title">Cart</h1>

      {!cart || !cart.lines.length ? (
        <div className="grid" style={{gap: '0.75rem'}}>
          <p>Your cart is empty.</p>
          <Link className="button button-primary" to={`/${locale.code}/collections/all`}>Browse collection</Link>
        </div>
      ) : (
        <>
          <div className="grid" style={{gap: 'var(--space-4)'}}>
            {cart.lines.map((line: any) => (
              <article key={line.id} className="card">
                <div className="card-body" style={{display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem'}}>
                  {line.merchandise.image ? (
                    <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.product.title} />
                  ) : (
                    <div style={{aspectRatio: '1 / 1', background: '#ece6dc'}} />
                  )}
                  <div>
                    <strong>{line.merchandise.product.title}</strong>
                    <p>{line.merchandise.title}</p>
                    <Price amount={line.merchandise.price} locale={locale} />

                    <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.75rem'}}>
                      <Form method="post">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="quantity" value={Math.max(1, line.quantity - 1)} />
                        <Button type="submit" variant="ghost">-</Button>
                      </Form>
                      <span style={{alignSelf: 'center'}}>{line.quantity}</span>
                      <Form method="post">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="quantity" value={line.quantity + 1} />
                        <Button type="submit" variant="ghost">+</Button>
                      </Form>
                      <Form method="post" style={{marginLeft: 'auto'}}>
                        <input type="hidden" name="intent" value="remove" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <Button type="submit" variant="ghost">Remove</Button>
                      </Form>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div style={{marginTop: 'var(--space-6)', display: 'grid', gap: '0.5rem'}}>
            <strong>Subtotal: {total ? <Price amount={total} locale={locale} /> : '-'}</strong>
            <Form method="post">
              <input type="hidden" name="intent" value="checkout" />
              <Button type="submit">Go to checkout</Button>
            </Form>
          </div>
        </>
      )}
    </div>
  );
}
