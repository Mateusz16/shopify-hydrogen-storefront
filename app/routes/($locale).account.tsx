import {redirect, type LoaderFunctionArgs} from '@remix-run/node';

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const customerAccountUrl =
    process.env.PUBLIC_CUSTOMER_ACCOUNT_URL ||
    `${url.protocol}//${process.env.PUBLIC_STORE_DOMAIN || url.host}/account`;
  const redirectTo = customerAccountUrl.startsWith('http')
    ? customerAccountUrl
    : `${url.origin}${customerAccountUrl}`;
  return redirect(redirectTo);
}

export default function AccountRedirectRoute() {
  return null;
}
