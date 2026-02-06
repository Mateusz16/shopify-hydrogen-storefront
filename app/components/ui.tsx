import {Link} from '@remix-run/react';
import type {
  InputHTMLAttributes,
  PropsWithChildren,
  SelectHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import type {LocaleConfig, ProductCardViewModel} from '~/types/models';
import {formatMoney} from '~/lib/format';

export function Button(
  props: PropsWithChildren<{type?: 'button' | 'submit'; variant?: 'primary' | 'ghost'; className?: string}>,
) {
  return (
    <button type={props.type ?? 'button'} className={clsx('button', props.variant === 'ghost' ? 'button-ghost' : 'button-primary', props.className)}>
      {props.children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx('input', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx('select', props.className)} />;
}

export function Badge({children}: PropsWithChildren) {
  return <span className="badge">{children}</span>;
}

export function Price({amount, locale}: {amount: {amount: string; currencyCode: string}; locale: LocaleConfig}) {
  return <span>{formatMoney(amount.amount, amount.currencyCode, locale)}</span>;
}

export function ProductCard({product, locale, localePrefix}: {product: ProductCardViewModel; locale: LocaleConfig; localePrefix: string}) {
  return (
    <article className="card" aria-label={product.title}>
      <Link to={`/${localePrefix}/products/${product.handle}`}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.imageAlt ?? product.title} loading="lazy" />
        ) : (
          <div style={{aspectRatio: '4 / 5', background: '#ece6dc'}} />
        )}
      </Link>
      <div className="card-body">
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
          <strong>{product.title}</strong>
          {!product.availableForSale && <Badge>Sold out</Badge>}
        </div>
        <div style={{marginTop: '0.5rem'}}>
          <Price amount={product.price} locale={locale} />
        </div>
      </div>
    </article>
  );
}

export function VariantSelector({
  options,
  selected,
  onChange,
}: {
  options: Array<{name: string; values: string[]}>;
  selected: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="grid" style={{gap: '1rem'}}>
      {options.map((option) => (
        <div key={option.name}>
          <div style={{fontWeight: 600, marginBottom: '0.4rem'}}>{option.name}</div>
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            {option.values.map((value) => {
              const active = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={clsx('button', active ? 'button-primary' : 'button-ghost')}
                  onClick={() => onChange(option.name, value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Drawer({open, children}: PropsWithChildren<{open: boolean}>) {
  if (!open) return null;
  return <aside className="drawer" role="dialog" aria-modal="true">{children}</aside>;
}

export function Modal({open, children}: PropsWithChildren<{open: boolean}>) {
  if (!open) return null;
  return (
    <div style={{position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center'}}>
      <div style={{maxWidth: 520, width: 'calc(100% - 2rem)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)'}}>
        {children}
      </div>
    </div>
  );
}

export function Accordion({title, children}: PropsWithChildren<{title: string}>) {
  return (
    <details style={{border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem'}}>
      <summary style={{cursor: 'pointer', fontWeight: 600}}>{title}</summary>
      <div style={{marginTop: '0.75rem'}}>{children}</div>
    </details>
  );
}

export function Pagination({nextCursor, basePath}: {nextCursor?: string; basePath: string}) {
  return (
    <div className="pagination">
      {nextCursor ? (
        <Link className="button button-ghost" to={`${basePath}?cursor=${encodeURIComponent(nextCursor)}`}>
          Load more
        </Link>
      ) : (
        <span className="badge">No more products</span>
      )}
    </div>
  );
}

export function Toast({message, tone = 'success'}: {message: string; tone?: 'success' | 'error'}) {
  return (
    <div style={{padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${tone === 'success' ? 'var(--color-primary)' : 'var(--color-danger)'}`}}>
      {message}
    </div>
  );
}
