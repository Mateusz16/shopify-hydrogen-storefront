import {Form, Link, useLocation, useNavigate} from '@remix-run/react';
import type {PropsWithChildren} from 'react';
import type {LocaleConfig} from '~/types/models';
import {ensureLocalePrefix, LOCALES} from '~/lib/i18n';

export function StoreLayout({locale, children}: PropsWithChildren<{locale: LocaleConfig}>) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link className="brand" to={`/${locale.code}`}>Atelier Commerce</Link>
          <nav className="nav" aria-label="Main navigation">
            <Link to={`/${locale.code}/collections/all`}>Shop</Link>
            <Link to={`/${locale.code}/search`}>Search</Link>
            <Link to={`/${locale.code}/pages/o-nas`}>Story</Link>
            <Link to={`/${locale.code}/cart`}>Cart</Link>
            <Link to={`/${locale.code}/account`}>Account</Link>
          </nav>
          <div className="locale-switch" aria-label="Locale switcher">
            {Object.values(LOCALES).map((value) => (
              <button
                key={value.code}
                className={`locale-chip ${value.code === locale.code ? 'active' : ''}`}
                onClick={() => navigate(ensureLocalePrefix(location.pathname, value.code))}
              >
                {value.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer container">
        <div className="grid" style={{gap: '0.4rem'}}>
          <strong>Atelier Commerce</strong>
          <span>Premium Shopify storefront on Hydrogen + Oxygen.</span>
        </div>
      </footer>
      <Form method="post" action="/analytics/track" style={{display: 'none'}}>
        <input name="event" value="page_view" readOnly />
      </Form>
    </>
  );
}
