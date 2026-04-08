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
