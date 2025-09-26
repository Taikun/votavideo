# VotaVideo

VotaVideo is a Next.js application that lets a community propose video ideas, vote on their favorites, and publish the winning productions. The project combines Prisma, NextAuth, and Tailwind CSS to deliver a streamlined workflow for managers and viewers alike.

## Key Features
- Collect video proposals with rich descriptions and thumbnails managed through Prisma.
- Authenticate voters and administrators with NextAuth and PostgreSQL-backed sessions.
- Track voting in real time and mark proposals as published once a video goes live.
- Provide a public gallery of published content while keeping draft proposals private.

## Getting Started
1. **Requirements**: Node.js 18+, npm, and access to a PostgreSQL database (Neon works well for development).
2. **Install dependencies**: `npm install`.
3. **Environment variables**: copy `.env.dev` to `.env.local` and fill in `DATABASE_URL`, NextAuth credentials, and Imgur API keys for thumbnail uploads.
4. **Database setup**: `npx prisma migrate dev` to apply schema changes, then `npx prisma db seed` (or `npx ts-node prisma/seed.ts`) to load demo content.
5. **Run locally**: `npm run dev` starts the Turbopack server on `http://localhost:3000`.

## Development Workflow
- Use `npm run lint` to enforce coding standards; append `-- --fix` for auto-fixes.
- Run `npm run prebuild` whenever you touch the Prisma schema or environment variables to regenerate the client.
- Build locally with `npm run build && npm start` before shipping changes to ensure the production bundle succeeds.

## Deployment Notes
The project deploys cleanly to Vercel. Double-check that environment variables are configured in the Vercel dashboard and that the Prisma database URL targets your production instance.

## Support the Project
If this project saves you time or inspires your next feature, you can buy me a coffee: [https://buymeacoffee.com/taikunchani](https://buymeacoffee.com/taikunchani)
