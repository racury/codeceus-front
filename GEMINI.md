# Gemini CLI Project Instructions - codeceus (Frontend)

This file contains foundational mandates for the Gemini CLI when working on the `codeceus` frontend project. These instructions take precedence over general defaults.

## Project Overview
- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Package Manager**: `pnpm`
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite`)
- **Database**: Drizzle ORM (PostgreSQL via Docker)
- **Authentication**: Better Auth
- **UI Components**: shadcn-svelte (bits-ui)
- **Forms**: sveltekit-superforms & formsnap
- **Infrastructure**: Docker Compose (`compose.yaml`)
- **Backend Integration**: Connects to the `codeceus` Rust backend via `src/lib/server/codeceus.ts`.

## Engineering Standards
- **Svelte 5**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, etc.) instead of Svelte 4 legacy syntax.
- **Type Safety**: Strictly adhere to TypeScript. Avoid `any`. Use Drizzle schemas for database operations.
- **Components**: 
  - Use Tailwind CSS v4 for styling. 
  - Prefer functional and reusable components in `src/lib/components`.
  - UI components should be placed in `src/lib/components/ui` (shadcn-svelte pattern).
- **Forms**: Use `sveltekit-superforms` with `zod` validation and `formsnap` for accessible form components.
- **Linting & Formatting**: Follow the project's Prettier and ESLint configurations. Run `pnpm lint` and `pnpm check` to validate changes.
- **Database**: 
  - Use `pnpm db:generate` to create migrations.
  - Use `pnpm db:migrate` to apply migrations.
  - Use `pnpm db:push` for quick schema syncs in development.

## Common Commands
- **Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Linting**: `pnpm lint`
- **Formatting**: `pnpm format`
- **Type Checking**: `pnpm check`
- **Database Start**: `pnpm db:start` (Starts Docker containers)
- **Database Studio**: `pnpm db:studio`
- **Database Push**: `pnpm db:push`
- **Database Generate**: `pnpm db:generate`
- **Database Migrate**: `pnpm db:migrate`
- **Auth Schema Sync**: `pnpm auth:schema` (Generates Better Auth schema)

## Contextual Guidance
- **Backend Communication**: Use the `codeceus` utility in `src/lib/server/codeceus.ts` to interact with the code execution backend. Ensure `CODECEUS_URL` and `CODECEUS_TOKEN` are configured in `.env`.
- **Runes Usage**: Always prefer runes for state management. Avoid `$:` reactive declarations.
- **Database Schemas**: Always check `src/lib/server/db/schema.ts` and `src/lib/server/db/auth.schema.ts` before performing database operations.
- **Auth Logic**: Reference `src/lib/server/auth.ts` for authentication logic. Use the `auth:schema` command after updating `auth.ts` to keep the database schema in sync.
