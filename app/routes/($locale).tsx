import {json, redirect, type LoaderFunctionArgs} from '@remix-run/node';
import {Outlet, useLoaderData} from '@remix-run/react';
import {StoreLayout} from '~/components/layout';
import {getLocaleFromPathname} from '~/lib/i18n';

export async function loader({params, request}: LoaderFunctionArgs) {
  const locale = params.locale;
  if (locale !== 'pl' && locale !== 'en') {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/' || pathname === '') {
      return redirect('/pl');
    }
    return redirect(`/pl${pathname}`);
  }

  return json({locale: getLocaleFromPathname(`/${locale}`)});
}

export default function LocaleLayoutRoute() {
  const {locale} = useLoaderData<typeof loader>();
  return (
    <StoreLayout locale={locale}>
      <Outlet />
    </StoreLayout>
  );
}
