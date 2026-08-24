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
