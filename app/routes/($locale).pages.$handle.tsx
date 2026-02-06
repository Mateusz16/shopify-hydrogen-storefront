import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getLocaleFromPathname} from '~/lib/i18n';
import {queryPageByHandle} from '~/lib/shopify';

export async function loader({params, request}: LoaderFunctionArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const handle = params.handle;

  if (!handle) {
    throw new Response('Page not found', {status: 404});
  }

  const data = await queryPageByHandle(handle, locale);

  if (!data.page) {
    throw new Response('Page not found', {status: 404});
  }

  return json({locale, page: data.page});
}

export default function CmsPageRoute() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <article className="container" style={{padding: 'var(--space-12) 0', maxWidth: 840}}>
      <h1 className="section-title">{page.title}</h1>
      <div dangerouslySetInnerHTML={{__html: page.body}} />
    </article>
  );
}
