import {json, type ActionFunctionArgs} from '@remix-run/node';

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const event = String(formData.get('event') || 'unknown');

  return json({ok: true, event});
}
