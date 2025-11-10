# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/app`, following the Next.js App Router layout (`layout.tsx`, `page.tsx`, shared `globals.css`). Public assets (favicons, static images) belong in `public` so they are served from the root URL. Configuration for tooling stays at the workspace root (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`). Treat `node_modules` as read-only dependencies; custom UI primitives should live in new folders under `src/app` and be imported via relative paths to keep the module graph simple.

## Build, Test & Development Commands
- `npm run dev`: runs the Next 16 development server on `http://localhost:3000` with hot reload; use when iterating on UI or API routes.
- `npm run build`: creates an optimized production bundle; run before opening a PR to catch type or config regressions.
- `npm run start`: serves the last production build locally for smoke-testing deployment artifacts.
- `npm run lint`: executes ESLint across the repo using `eslint-config-next`; run after large refactors or before committing.

## Coding Style & Naming Conventions
TypeScript and React 19 are required—avoid `.js` unless absolutely necessary. Prettier 3 enforces two-space indentation, trailing commas, and double quotes; let it format everything (most editors can run `npx prettier --write` on demand). Components and hooks use PascalCase (`PortfolioGrid`) and camelCase (`usePortfolioData`). Tailwind 4 utilities belong in JSX class lists; reserve `globals.css` for base tokens or CSS variables. Keep files focused: colocate lightweight helpers next to the component and move reusable logic into `src/app/lib` when it grows.

## Testing Guidelines
No automated tests exist yet, but plan for component tests with React Testing Library and integration smoke-tests via Next’s built-in `app` router tooling. Add new tests under `src/app/__tests__` mirroring the folder structure of the feature under test, and name files `*.test.tsx`. Every new component should include at least one rendering test plus critical interaction coverage.

## Commit & Pull Request Guidelines
Current history uses short, imperative subjects (e.g., `Implement header`); continue this style with <=72 characters and reference tickets in the body when relevant. Each PR should describe scope, screenshots for UI changes, reproduction steps for bug fixes, and a checklist of manual or automated tests run. Link related issues, request review from an owner of the affected area, and ensure CI (lint/build) passes before marking ready for review.
