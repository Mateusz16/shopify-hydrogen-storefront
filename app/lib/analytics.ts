export type AnalyticsEventName =
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'search'
  | 'login';

export function pushAnalyticsEvent(name: AnalyticsEventName, payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({event: name, ...payload});
  (window as any).dataLayer = dataLayer;
}
