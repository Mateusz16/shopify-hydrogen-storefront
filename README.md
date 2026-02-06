# Premium Shopify Storefront (Hydrogen + Remix)

Storefront e-commerce ready for Shopify Oxygen with PL/EN routing, SEO baseline, cart flow, search, CMS page route and premium-focused UI system.

## Implemented V1 foundation

- Hydrogen + Remix app structure for Oxygen.
- Locale routes: `/pl/*` and `/en/*`.
- Home, collection listing, product details, cart, search, CMS page and account redirect routes.
- Shopify Storefront GraphQL integration for:
  - `HomePageContent`
  - `CollectionByHandle`
  - `ProductByHandle`
  - `PredictiveSearch`
  - `CartCreate` / `CartLinesAdd` / `CartLinesUpdate` / `CartLinesRemove`
- SEO baseline:
  - canonical + hreflang
  - product JSON-LD
  - `sitemap.xml` and `robots.txt`
- UI kit components: `Button`, `Input`, `Select`, `Badge`, `ProductCard`, `Price`, `VariantSelector`, `Drawer`, `Modal`, `Accordion`, `Pagination`, `Toast`.
- Unit tests for locale, money formatting and SEO helpers.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and provide real credentials:

```bash
cp .env.example .env
```

3. Start local dev:

```bash
npm run dev
```

4. Run checks:

```bash
npm run typecheck
npm run test
```

## Required environment variables

- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PUBLIC_CUSTOMER_ACCOUNT_URL` (optional override)
- `PUBLIC_GA4_MEASUREMENT_ID` (for analytics script extension)
- `PUBLIC_HOTJAR_ID` (for analytics script extension)

## Notes

- Checkout remains Shopify-hosted by design.
- New Customer Accounts are handled by redirecting to account URL.
- Some advanced production hardening is still pending (CSP, consent/cookie manager, CI performance budgets, e2e tests).
