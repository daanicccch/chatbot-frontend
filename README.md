# gpt-chatbot Frontend

Frontend repo for the gpt-chatbot demo.

This repo contains only the `Next.js` client:

- ChatGPT-like chat UI
- TanStack Query data layer
- Supabase Auth modal and guest UX
- image/document upload flows
- SSE response streaming on the client
- cross-tab sync with `BroadcastChannel`

The backend now lives in `D:\Testovoe\gpt-chatbot\backend`.

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `TanStack Query`
- `Tailwind CSS v4`
- `framer-motion`

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

If you prefer, `.env` works too for local development.

Frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

## Run

1. Start backend from the separate backend repo.
2. Install frontend dependencies:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`
