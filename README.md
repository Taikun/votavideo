![header](https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,100:9333EA&height=200&section=header&text=VotaVideo&fontSize=50&fontColor=ffffff&animation=fadeIn)

# VotaVideo

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Buy Me a Coffee](https://img.shields.io/badge/☕-Buy%20Me%20a%20Coffee-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/taikunchani)

---

VotaVideo is a **Next.js application** that lets a community propose video ideas, vote on their favorites, and publish the winning productions.  
The project combines **Prisma**, **NextAuth**, and **Tailwind CSS** to deliver a streamlined workflow for managers and viewers alike.

## ✨ Key Features
- Collect video proposals with rich descriptions and thumbnails managed through Prisma.
- Authenticate voters and administrators with NextAuth and PostgreSQL-backed sessions.
- Track voting in real time and mark proposals as published once a video goes live.
- Provide a public gallery of published content while keeping draft proposals private.

## 🚀 Getting Started
1. **Requirements**: Node.js 18+, npm, and access to a PostgreSQL database (Neon works well for development).
2. **Install dependencies**:  
   ```bash
   npm install
   ```
3. **Environment variables**: copy `.env.dev` to `.env.local` and fill in:
   - `DATABASE_URL`  
   - NextAuth credentials  
   - Imgur API keys for thumbnail uploads
4. **Database setup**:  
   ```bash
   npx prisma migrate dev
   npx prisma db seed   # or npx ts-node prisma/seed.ts
   ```
5. **Run locally**:  
   ```bash
   npm run dev
   ```
   Starts the Turbopack server on [http://localhost:3000](http://localhost:3000).

## 🛠 Development Workflow
- Run `npm run lint` to enforce coding standards; append `-- --fix` for auto-fixes.
- Use `npm run prebuild` whenever you touch the Prisma schema or environment variables to regenerate the client.
- Build locally with:
  ```bash
  npm run build && npm start
  ```
  to ensure the production bundle succeeds before shipping.

## 📦 Deployment Notes
The project deploys cleanly to **Vercel**.  
Double-check that environment variables are configured in the Vercel dashboard and that the Prisma database URL targets your production instance.

## ❤️ Support the Project
If this project saves you time or inspires your next feature, you can support it here:  

[![Buy Me a Coffee](https://img.shields.io/badge/☕-Support%20on%20Buy%20Me%20a%20Coffee-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/taikunchani)
