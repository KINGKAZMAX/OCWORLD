# AGENTS.md

This file is for agentic coding agents operating in `/Users/pika/Downloads/source_code`.
It summarizes the real repository layout, verified commands, and code conventions found in this codebase.

## Repository Overview

- React 18 + TypeScript + Vite frontend at the repo root.
- Tailwind CSS with shadcn-style utilities and `cn()`.
- Zustand for frontend state in `src/store`.
- Hono + Drizzle backend under `backend/`.
- Vercel bridge entrypoint in `api/index.ts`.

## Top-Level Structure

- `src/` — frontend application code.
- `src/pages/` — route-level React pages.
- `src/components/` — reusable UI/layout components.
- `src/components/ui/` — shared UI primitives such as `Button`.
- `src/store/` — Zustand stores.
- `src/lib/` — utilities and API helpers.
- `backend/` — backend implementation.
- `backend/src/` — backend source.
- `backend/src/__generated__/` — generated schema/types; do not edit.
- `api/index.ts` — Vercel handler wrapping the backend app.

## Tooling

- Package manager: `npm`
- Lockfile: `package-lock.json`
- Frontend alias: `@ -> ./src`
- Backend local runtime: `tsx`
- Database tooling: `drizzle-kit`

## Verified Commands

Run these from the repo root unless noted otherwise.

### Root commands

- `npm install` — install root dependencies.
- `npm run dev` — start the Vite frontend dev server.
- `npm run build` — build the frontend for production. Verified working.
- `npm run preview` — preview the production build.
- `npm run dev:backend` — start the local backend server on port `3001`. Verified booting.
- `npm run db:push` — run `drizzle-kit push` using the root drizzle config.

### Backend commands

Run these from `backend/`.

- `npm install` — install backend dependencies.
- `npm run dev` — start the backend local server.
- `npm run typecheck` — run backend TypeScript checks with `tsc --noEmit`.

## Current Command Reality

- No root `lint` script.
- No root `typecheck` script.
- No configured test runner at root or in `backend/`.
- No verified single-test command exists today.

## Single-Test Guidance

This repo does **not** currently define a test framework or test scripts.

- There is no `npm test`.
- There is no `vitest`, `jest`, `playwright`, or `cypress` config.
- There are no discovered `*.test.*` or `*.spec.*` files.
- Do **not** invent a single-test command.
- If tests are added later, update this file with the exact single-test command.
- For now, use `npm run build` at root and `npm run typecheck` in `backend/` as the closest validation steps.

## Important Validation Notes

- Root `npm run build` succeeds.
- Backend `npm run typecheck` currently fails in `backend/src/index.ts`.
- Existing failures include unknown JSON typing and missing `GoogleGenAI` references.
- Treat those as pre-existing unless your change touches them.

## Existing Repo-Specific Guidance

- Existing backend-specific guide: `backend/AGENTS.md`
- No `.cursorrules`
- No `.cursor/rules/`
- No `.github/copilot-instructions.md`

## Backend Rules Carried Forward from `backend/AGENTS.md`

If you work in `backend/`, follow these rules:

- Read `backend/src/__generated__/server-types.d.ts` before guessing SDK types.
- Read `backend/src/__generated__/db_schema.ts` before changing data-model usage.
- Read `backend/src/__generated__/storage_schema.ts` before storage work.
- Treat `backend/src/__generated__/` as generated code.
- Keep all API routes under `/api`.
- Prefer Drizzle ORM over raw SQL.
- Use `.returning()` when you need inserted row IDs.
- Check for null after storage reads.
- Prefer `db.batch([...])` over `db.transaction()` in that backend environment.
- Store large payloads in storage, not oversized DB rows.
- Use presigned URLs for client-facing file access.

## Frontend Code Style

### Imports

- The codebase uses both alias imports and relative imports.
- Prefer `@/...` for cross-folder imports under `src/`.
- Relative imports are common for very local files.
- Match the surrounding file’s import style instead of rewriting broadly.
- Group imports roughly as: framework, third-party, internal.

### Formatting

- Formatting is mixed across the repo.
- Some files use double quotes and semicolons; others use single quotes and no semicolons.
- Preserve the style already used in the file you are editing.
- Do not reformat unrelated code.
- Keep diffs small and local.

### TypeScript

- Prefer explicit interfaces/types for props, store state, and structured payloads.
- Existing patterns use `interface` for object contracts and `type` for unions/helpers.
- Use literal unions for constrained values such as `StyleId`.
- Use `Partial<T>` for patch-style updates when appropriate.
- Respect the `@` alias defined in `tsconfig.app.json` and `vite.config.ts`.
- Do not use `as any`, `@ts-ignore`, or `@ts-expect-error`.

### Naming

- React components and pages use `PascalCase`.
- Stores follow `useXxxStore` naming.
- Utility functions use `camelCase`.
- Shared constants often use `UPPER_SNAKE_CASE`.

### React and State Patterns

- Use function components.
- Route components live in `src/pages/` and are wired in `src/App.tsx`.
- Protected screens are wrapped by `ProtectedRoute` rather than duplicating auth checks.
- Zustand is the default lightweight state layer.
- Shared class merging uses `cn()` from `src/lib/utils.ts`.

### Styling Patterns

- Tailwind utility classes are the primary styling mechanism.
- The design system uses tokens like `bg-background`, `text-foreground`, `primary`, and `secondary`.
- Shared UI variants use `class-variance-authority`.
- Motion-heavy screens use `framer-motion` directly in page components.
- Preserve the existing visual language from `YOUWARE.md`: premium/mobile-first, soft neutral palette, rounded corners, subtle motion.

### Error Handling and Logging

- Existing code commonly uses `try/catch` and `try/finally` around async flows.
- Prefer user-visible error state in the UI instead of silent failures.
- Preserve meaningful HTTP error responses on the backend.
- Avoid empty catch blocks in new code.
- The repo already has many `console.log`, `console.error`, and `console.warn` calls.
- Avoid adding casual debug logging unless it is genuinely useful and matches nearby patterns.

### Backend-Specific Cautions

- `backend/app.ts` is the shared Hono app factory used by local and Vercel entrypoints.
- `backend/src/index.ts` appears to be a separate EdgeSpark-style backend path and currently has typecheck issues.
- Do not assume both backend paths are equally current; inspect the real entrypoint you are changing.
- Avoid broad backend refactors unless needed for the requested fix.

## Safe Editing Guidance

- Read adjacent files before introducing a new pattern.
- Prefer minimal, surgical changes.
- Do not normalize quote/semicolon style across unrelated files.
- Do not edit generated files under `backend/src/__generated__/`.
- Do not invent missing scripts in docs; document the repo as it actually exists.
- If you add linting or tests, update this file with the exact commands, including single-file or single-test usage.

## Suggested Verification Workflow

For frontend-only changes:

1. Run `npm run build`.
2. If the change touches backend integration, also run the backend locally.

For backend-only changes:

1. Run `npm run dev` from `backend/` or `npm run dev:backend` from root.
2. Run `npm run typecheck` from `backend/`.
3. If typecheck fails, distinguish your regression from pre-existing backend issues.

For cross-stack changes:

1. Run the backend locally on `3001`.
2. Run the frontend dev server.
3. Run `npm run build` from root.
4. Manually verify the relevant API and UI flow.
