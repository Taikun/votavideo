# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains App Router routes (e.g. `admin/`, `published/`) built with server-first React components.
- `src/lib` hosts shared services: Prisma client, NextAuth helpers, channel metadata.
- `prisma/` holds schema and seed; run Prisma commands from here after model changes.
- `types/next-auth.d.ts` augments session types; adjust when auth payloads evolve.
- `public/` serves static assets referenced by the app.

## Build, Test, and Development Commands
- `npm run dev` starts the Turbopack dev server at `http://localhost:3000`.
- `npm run lint` runs `next lint`; use `-- --fix` to auto-resolve stylistic issues.
- `npm run build && npm start` simulates the Vercel production pipeline locally.
- `npm run prebuild` wipes cached Prisma clients and regenerates them after schema edits.
- `npx prisma migrate dev` creates and applies migrations, regenerating the client.
- `npx prisma db seed` (or `npx ts-node prisma/seed.ts`) loads demo proposals and votes.

## Coding Style & Naming Conventions
- Favor TypeScript, async/await, and functional React components; 2-space indentation and double quotes mirror existing files.
- Tailwind classes drive layout; keep utility ordering high-to-low priority and avoid inline style objects.
- Use camelCase for variables, PascalCase for components, and align Prisma models and types.

## Testing Guidelines
- No automated suite yet; run `npm run lint`, apply migrations, and manually exercise auth, voting, and publishing before opening a PR.
- Place any new tests under `src/__tests__` or next to the component, note the chosen runner in the PR, and document manual QA steps.

## Commit & Pull Request Guidelines
- Follow the repository pattern of concise imperative subjects (e.g. `Tweak admin copy`), optional bodies, wrapped near 72 characters.
- PRs should state context, solution, linked issues, schema changes, and attach UI screenshots or recordings when visuals change.
- Flag environment or seeding updates so reviewers know which setup commands to rerun.

## Environment & Data
- Copy `.env.dev` to `.env.local`, then supply `DATABASE_URL`, Imgur, and NextAuth secrets before running Prisma or Next.js.
- After touching Prisma schema or env vars, rerun `npm run prebuild` and restart the dev server to pick up changes.
