import {type LoaderFunctionArgs} from '@remix-run/node';

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/pl</loc></url>
  <url><loc>${base}/en</loc></url>
  <url><loc>${base}/pl/collections/all</loc></url>
  <url><loc>${base}/en/collections/all</loc></url>
</urlset>`;

  return new Response(xml, {
    headers: {'Content-Type': 'application/xml; charset=utf-8'},
  });
}
