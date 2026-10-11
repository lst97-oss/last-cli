# last-cli

[![npm version](https://img.shields.io/npm/v/%40lst97-oss%2Flast-cli)](https://www.npmjs.com/package/@lst97-oss/last-cli)

Create projects from LAST templates. The current template is Payload + TanStack Start.

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
