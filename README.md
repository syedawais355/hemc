# Verda — Online Pharmacy & Telehealth

Production-grade e-commerce app: Next.js (App Router, TypeScript) storefront + admin
panel, backed by Supabase (Postgres + Auth). The browser never touches the database —
all data flows through our own API, which talks to Supabase with a server-only key.

## Stack

- **Next.js 16** (App Router, Server Components, Route Handlers)
- **Supabase** — Postgres + Auth (project `medicines`, region ap-south-1)
- No ORM; a thin typed repository layer over the Supabase client

## Run locally

```bash
npm install
# .env.local must contain the three Supabase values (see .env.example)
npm run dev   # http://localhost:3000
```

### Environment (`.env.local`)

| Variable | Exposure | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Auth client only (RLS denies table access) |
| `SUPABASE_SECRET_KEY` | **server-only** | API → DB access (bypasses RLS). Never shipped to the browser. |

## Security model (the database is never exposed)

- Every table has **Row Level Security enabled with no policies** (deny-by-default), and
  direct grants to the `anon`/`authenticated` roles are revoked.
- The only code that reads/writes data is the server-side API, using the **secret key**
  (`src/lib/supabase/admin.ts`). A leaked public key can read/write nothing.
- Auth sessions are httpOnly cookies managed by `@supabase/ssr`; middleware refreshes
  them. Authorization (`requireUser` / `requireAdmin`) is enforced in every protected route.
- Checkout pricing is computed in the database (`place_order()`), never trusted from the client.

## Project structure

```
src/
  app/
    (shop)/            storefront (home, shop, product, cart, wishlist, account, login, signup)
    admin/             role-guarded admin (dashboard, products, categories, reviews, users)
    api/               the ONLY entry point to data
  components/          Header, Footer, ProductCard, BuyBox, ReviewForm/List, Modal, Icon, Toast
  lib/
    supabase/          admin (service-role) + server (auth/session) clients
    repos/             data access: products, categories, reviews, cart, wishlist, orders, users, profiles
    client/            browser store (auth + cart + wishlist), API wrapper, guest storage, theme
    auth.ts http.ts validate.ts types.ts
  middleware.ts        refreshes the auth session cookie
  styles/              design tokens, base, layout, components, pages, app
```

## Data model

`categories` · `products` (with `image_url`, `uom`, `tag`, `is_active`, trigger-maintained
`avg_rating` + `review_count`) · `reviews` (one per user/product) · `profiles` (extends
`auth.users`: name/phone/address/DOB/role/is_disabled) · `cart_items` · `wishlist_items`
· `orders` + `order_items`.

## Cart & wishlist

Guests get a cart/wishlist in `localStorage`. On sign-in it **merges into the account**
(DB) and the guest copy is cleared. Ordering requires an account.

## Admin

`/admin` is restricted to `role = 'admin'`. To promote an account:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Admins can add/edit/delete products and categories, moderate (delete) any review, and
disable or delete users.

## Deploy (Vercel)

Linked to the Vercel project `medicines` (domain `hemc.pk`). Add the three env vars to
Vercel first, then `vercel deploy --prod`.
