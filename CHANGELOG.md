# Changelog

## v0.2.0

- Template picker now offers two templates: Payload + TanStack Start (repo renamed to `last-payload-tanstack-start-template`, pin updated to `v0.4.0`) and blank TanStack Start (`last-tanstack-start-template`, no CMS, canonical business kernel). `--yes` still scaffolds the Payload template.
- README now documents both templates.

## v0.1.3

- Template pin updated to `payload-tanstack-start-template@03f025e` (`v0.3.0`), including the development-only shadcn UI showcase, sidebar, CodeBlock, and Trace components.
- Updated the template summary and selection hint to describe the included UI showcase, and listed required generation commands in the post-create instructions.

## v0.1.2

- Template pin bumped to `payload-tanstack-start-template@8b5bd35` (v0.2.0 boot contract: server kernel, themed shell, live/ready probes, compose Postgres, smoke + CI boot proof, pinned Bun).

## v0.1.1

- Template rundown — `## What the template includes` in the README (CMS, shell, backend kernel, ops, frontend, deliberate exclusions) plus a one-line hint on the interactive template picker, so users see what they get before downloading.
- Post-create flow matches the template quickstart — outro and README now run `bun run db:up` + `bun run db:migrate` before `bun run dev`.
