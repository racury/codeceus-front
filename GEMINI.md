# Gemini CLI Project Instructions - racury-oj

This file contains foundational mandates for the Gemini CLI when working on the `racury-oj` project. These instructions take precedence over general defaults.

## Project Overview
- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Package Manager**: `pnpm`
- **Styling**: Tailwind CSS
- **Database**: Drizzle ORM
- **Authentication**: Better Auth
- **Infrastructure**: Docker Compose (`compose.yaml`)

## Engineering Standards
- **Svelte 5**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, etc.) instead of Svelte 4 legacy syntax.
- **Type Safety**: Strictly adhere to TypeScript. Avoid `any`. Use Drizzle schemas for database operations.
- **Components**: Use Tailwind CSS for styling. Prefer functional and reusable components in `src/lib/components`.
- **Linting & Formatting**: Follow the project's Prettier and ESLint configurations. Run `pnpm lint` and `pnpm check` to validate changes.
- **Database**: Use `pnpm drizzle-kit generate` and `pnpm drizzle-kit migrate` for schema changes.

## Common Commands
- **Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Linting**: `pnpm lint`
- **Formatting**: `pnpm format`
- **Type Checking**: `pnpm check`
- **Database Start**: `pnpm db:start`
- **Database Studio**: `pnpm db:studio`
- **Database Push**: `pnpm db:push`
- **Database Generate**: `pnpm db:generate`
- **Database Migrate**: `pnpm db:migrate`
- **Auth Schema Sync**: `pnpm auth:schema`

## Contextual Guidance
- When modifying or creating Svelte components, ensure they align with Svelte 5 paradigms.
- Always check `src/lib/server/db/schema.ts` before performing database operations.
- Reference `src/lib/server/auth.ts` for authentication logic.
