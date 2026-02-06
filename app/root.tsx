import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import type {LinksFunction, LoaderFunctionArgs} from '@remix-run/node';
import type {ReactNode} from 'react';
import {json} from '@remix-run/node';
import {getLocaleFromPathname} from '~/lib/i18n';
import {getSeoMeta} from '~/lib/seo';
import globalStyles from '~/styles/global.css?url';
import tokensStyles from '~/styles/tokens.css?url';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tokensStyles},
  {rel: 'stylesheet', href: globalStyles},
];

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const locale = getLocaleFromPathname(url.pathname);
  return json({
    locale,
    seo: getSeoMeta({
      title: 'Premium Storefront',
      description: 'Hydrogen storefront with premium UX',
      pathname: url.pathname,
    }),
  });
}

export function Layout({children}: {children: ReactNode}) {
  const {seo, locale} = useLoaderData<typeof loader>();
  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
        <link rel="alternate" hrefLang="pl" href={seo.alternates.pl} />
        <link rel="alternate" hrefLang="en" href={seo.alternates.en} />
        {process.env.PUBLIC_GA4_MEASUREMENT_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.PUBLIC_GA4_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${process.env.PUBLIC_GA4_MEASUREMENT_ID}');`,
              }}
            />
          </>
        ) : null}
        {process.env.PUBLIC_HOTJAR_ID ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${process.env.PUBLIC_HOTJAR_ID},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
            }}
          />
        ) : null}
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
