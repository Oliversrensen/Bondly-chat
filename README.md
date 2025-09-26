
# Anonymous Chat — Ready-to-run Template

## Quickstart
1. **Clone & install**
   ```bash
   npm install
   ```
2. **Env**
   ```bash
   cp .env.example .env
   # fill in DATABASE_URL (Postgres) + STRIPE (optional for now) + SMTP if using email login
   ```
3. **DB**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. **Run** (two terminals)
   ```bash
   npm run dev         # Next.js on :3000
   npm run ws:dev      # Socket.IO server on :8080
   ```

Open http://localhost:3000

- Onboarding sets your gender and interests (stored to DB in a minimal way for demo).
- Chat: click 'Random match'. Open a second browser/tab and do the same to match with yourself.
- Stripe: set STRIPE keys and run `stripe listen --forward-to localhost:3000/api/stripe/webhook` to receive webhooks.

## Notes
- This template keeps auth super light by using a cookie UID for demo only. For production, wire up NextAuth Email provider in `src/lib/auth.ts` and protect routes.
- The matcher in `src/app/api/match/enqueue/route.ts` is simplified. Expand it to use Redis queues per-interest and Jaccard similarity.
- The WS server is standalone. Deploy it on Render/Fly and set `NEXT_PUBLIC_WS_URL` accordingly.
