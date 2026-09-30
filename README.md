# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Google Maps location search

Customer delivery locations use the Google Maps Place Autocomplete widget. In Google Cloud, enable **Maps JavaScript API** and **Places API (New)**, then add a browser-restricted key to `.env`:

```bash
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_key
```

Restrict the key to the HTTP referrers used by the app (for example `http://localhost:3000/*`, `https://heltifud.com/*` and `https://www.heltifud.com/*`) and restrict its API access to those two APIs.

## Testing

### Administrative API access

Protected administrative endpoints require a Supabase Auth user whose
`app_metadata.role` is exactly `admin`. The server calls `auth.getUser()` on each
protected request to validate the user and read the current role. Missing or
invalid authentication returns 401; an authenticated user without this role
receives 403. `user_metadata`, request parameters and headers do not grant access.

Before deploying this authorization check, assign the role to the existing
administrators. Use the Supabase SQL Editor with privileged project access and
replace the example UUID with the verified user's Auth ID. These operations
preserve all other application metadata fields; they are manual administration
steps, not application migrations.

```sql
-- Grant access to one verified administrator.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = '00000000-0000-0000-0000-000000000000'::uuid
returning id, raw_app_meta_data;

-- Revoke the administrative role without deleting other metadata.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
where id = '00000000-0000-0000-0000-000000000000'::uuid
returning id, raw_app_meta_data;
```

Run only the desired grant or revoke statement and confirm it returns the
intended user. Verify access using that user's session: a protected API request
should reach its handler after granting the role and return 403 after revocation.
If no row is returned, check the Auth ID; do not remove the `where` clause.
Never grant roles from browser code or expose privileged Supabase credentials.

This change covers the API endpoints already protected by the authentication
middleware. Ingredient authorization (H02), database RLS (H03), and role checks
for the administrative UI remain separate work. The public GET endpoints
`/api/menu`, `/api/menu/next` and `/api/plans` remain accessible without a session.

Run the unit and component tests with Vitest:

```bash
pnpm test:unit
```

Run browser end-to-end checks with Playwright:

```bash
pnpm test:e2e
```

Run the complete local/CI safety net:

```bash
pnpm test:ci
```

Vitest is configured through `@nuxt/test-utils` so component tests run with Nuxt auto-imports, aliases, plugins and a `happy-dom` DOM. Playwright starts the Nuxt dev server on `http://127.0.0.1:3101` unless `PLAYWRIGHT_BASE_URL` is provided, and runs the smoke suite on desktop and mobile Chromium.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
