# Gemini CLI Project Instructions - codeceus

This file contains foundational mandates for the Gemini CLI when working on the `codeceus` project. These instructions take precedence over general defaults.

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
- When modifying or creating Svelte components, ensure they align with Svelte 5 paradigms.
- Always check `src/lib/server/db/schema.ts` and `src/lib/server/db/auth.schema.ts` before performing database operations.
- Reference `src/lib/server/auth.ts` for authentication logic.
- Use the `auth:schema` command after updating `auth.ts` to keep the database schema in sync.
