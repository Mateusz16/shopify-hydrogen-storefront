import {redirect} from '@remix-run/node';

export async function loader() {
  return redirect('/pl');
}

export default function IndexRedirect() {
  return null;
}
