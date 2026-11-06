# NeedleLove

A local React / TypeScript / Tailwind / GSAP boutique, with an Express API and SQLite database. Built directly in this folder.

## Run

Requires Node.js 24 (uses built-in `node:sqlite`).

```sh
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL (normally http://127.0.0.1:5173). The API runs on 127.0.0.1:3001. Set a strong `ADMIN_PASSWORD` in `.env`, restart the server, then visit `/admin`. Admin is deliberately disabled without a password. Do not put secrets in `VITE_` variables.

```sh
npm run build
npm test
npm start
```

The production server serves `dist` on port 3001. Production admin cookies require HTTPS; use a trusted HTTPS reverse proxy before deploying. This project has not been deployed.

## Included

- Exact homepage sequence: introduction, hero, four best sellers, filtered four-item collection, approved reviews, footer.
- Four independently transformable textured SVG petals; one shared loader/hero representation. A reversible GSAP scrub timeline measures actual product-image rectangles, sends each petal to its card, expands an arrival bloom, and reveals the card. Recalculates on resizing and font loads. No pinned scroll section.
- Reduced-motion fallback, responsive 2-column mobile catalog, focus indicators, native modal cart with focus containment.
- Six editable categories and 16 seeded demo products. Full category query links, catalog load more, detail pages, persistent cart, stock constraints and clear add feedback.
- Server-authoritative prices, duplicate-line aggregation, atomic inventory decrement and order creation, unpaid COD state. No simulated online payment success.
- Password-protected admin with HTTP-only sessions, rate-limited login, same-origin mutation checks, product editing/archiving, safe raster uploads, category editing, four-best-seller selection, review moderation and order viewing.

## Demo status and launch dependencies

All products, inventory, reviews and prices are demonstration data. Four original AI-generated images are shared across the sample listings; replace them with accurate individual product photographs before launch. The hero is a deliberately layered, high-detail stitch illustration, not a photographed physical flower. `Petal` in `src/components/Flower.tsx` can accept transparent petal artwork without changing the animation paths.

Orders persist in `.data/store.sqlite`; uploaded images are under `.data/uploads`. Both are excluded from Git. Keep the data directory private and backed up. Public visitors cannot list orders or write catalog data. Admin sessions expire after eight hours and reset on a server restart. This is a single-store-owner local backend, not a hosted identity service or multi-user admin.

Demo orders are not fulfilled and no payment is collected. Keep `STORE_MODE=demo` until real inventory, delivery charges, policies, contacts and fulfillment operations are ready. `COD_ENABLED` and `SHIPPING_COST` configure checkout. Set `STORE_CURRENCY` before first startup to configure currency (default PKR). Prices use whole currency units. Existing product prices must be updated in the database when changing currencies; checkout rejects currency mismatches. No external merchant account is needed for the demo. Online payments require a real provider adapter and verified server-side webhook before setting a paid state (`server/checkout.mjs`).

The database prepares product-image and variant tables; gallery/variant management is not exposed in the initial admin UI. The seeded products have no variant options. Contact/social and legal pages explicitly identify missing merchant information. No real customer testimonials or verification claims are fabricated. Product rich-result offers are intentionally omitted while inventory is demonstration-only.

## Key files

- `src/components/Flower.tsx`: stitched artwork, loader and scroll choreography
- `src/styles/globals.css`: tokens, responsive layouts and motion fallbacks
- `src/hooks/useStore.tsx`: shared cart and store state
- `src/pages/`: homepage, catalog, details, cart, checkout and admin
- `server/seed.mjs`: replaceable demonstration content
- `server/db.mjs`: database schema and first-run seed
- `server/checkout.mjs`: transaction and payment abstraction
- `server/index.mjs`: API, admin authentication and uploads
- `tests/checkout.test.mjs`: price tampering, inventory, validation and transaction tests
