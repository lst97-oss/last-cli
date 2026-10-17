# last-cli

[![npm version](https://img.shields.io/npm/v/%40lst97-oss%2Flast-cli)](https://www.npmjs.com/package/@lst97-oss/last-cli)

Create projects from LAST templates. The current template is Payload + TanStack Start.

## What the template includes

Bare Payload v4 + TanStack Start starter. Boots standalone: placeholder `/`, admin at `/admin`, REST at `/api/*`. Users-only auth, en-only, Postgres `push:false`.

- **CMS**: `users` collection with auth, plain lexical editor, committed migrations (`bun run db:migrate`), first user via `bunx payload create-first-user`.
- **Shell**: `withPayloadRoot` + `ThemeProvider` (class mode) + Base-UI `Toaster` (`toast.add()`, never sonner); site 404 (`SiteNotFound`) + error boundary (`SiteError`); favicon + `robots.txt` (admin/api disallowed).
- **Backend kernel** (`src/server/`): `{ data }` / `{ error }` envelope, `HttpError` (5xx hidden on wire), `withContext` (request-id, logs, never-throws), zod `parseWith` + `parseJsonBody` + `parseSearchParams` + `parsePaginationParams` (limit 1–100 default 20). Business Postgres via Bun-native `getBusinessSql()` / `getBusinessDb()`.
- **Ops**: `/api/live` (no I/O) + `/api/ready` (DB probe, 503 when degraded), Docker `HEALTHCHECK`, minimal security headers, graceful shutdown (Nitro close + SIGINT/SIGTERM drain), `bun run smoke` boot contract, CI (typecheck + biome + migrate + test + node-server build + live smoke), `compose.yaml` local Postgres (`bun run db:up`), single `.bun-version` source.
- **Frontend**: TanStack Query/Form/Store wired (no explicit providers), Tailwind v4 semantic tokens, shadcn components including a development-only `/ui` showcase with sidebar, CodeBlock, and Trace examples.

Deliberately not included: real auth beyond Payload users, collections beyond `users`, i18n (stays en-only until the app has ≥2 locales), pagination UI, rate limiting, OpenAPI, email/storage/RAG/chat.

## Create a project

```sh
bunx --bun --package @lst97-oss/last-cli last-cli create my-app
```

You can also run it with npm and Node.js 22 or newer:

```sh
npx @lst97-oss/last-cli create my-app
```

The interactive prompts let you select the template and choose whether to install dependencies with Bun and initialize Git. To accept the defaults without prompts, add `--yes`:

```sh
bunx --bun --package @lst97-oss/last-cli last-cli create my-app --yes
```

The command creates `my-app`, updates its package name and README title, copies `.env.example` to `.env`, and optionally runs `git init` and `bun install`. It does not run database migrations.

After creation, edit `.env` and start the app:

```sh
cd my-app
bun run db:up             # local Postgres via compose.yaml
bun run db:migrate
bun run generate:types
bun run generate:importmap
bun run generate-routes
bun run dev
```

## Develop this CLI

```sh
bun install
bun run build
bun test
```

Node.js 22 or newer is required when running through npm. Bun can run the CLI with `bunx --bun` and is used to install and run the generated template.

## License

MIT
