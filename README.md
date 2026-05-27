# RakizFx — Next.js

Production-grade Next.js 15 implementation of the RakizFx broker site.

## Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Server-side rendered shell with a client-side SPA for the live, animated UI

## Local development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Project layout

```
app/
  layout.tsx          # Root HTML shell, fonts, SEO metadata
  page.tsx            # Server entry; mounts the client SPA
  globals.css         # Original RakizFx stylesheet (6k lines)
  api/chat/route.ts   # Chat assistant endpoint (graceful fallback if no key)
public/
  assets/             # Images, video, SVGs, logo
src/
  components/         # Client UI (Nav, Footer, ChatBot, sections, pages)
  lib/                # Hooks and primitives (useReveal, CountUp, Sparkline)
```

## Routes

The site uses hash-based routing (`#markets`, `#accounts`, etc.) preserved from
the prototype. A future evolution can split these into Next.js file-based
routes for per-route SSR — every page module is already a separate component.

## Chat assistant

The legacy `window.claude.complete` shim is replaced by `app/api/chat/route.ts`.
Set `ANTHROPIC_API_KEY` in `.env.local` to enable live AI replies; otherwise
the endpoint returns a graceful fallback message.

## Deploying

This project deploys cleanly to Vercel, Netlify, Cloudflare Pages, or any host
that supports Next.js standalone builds. No environment variables are required
unless you enable the chat AI.
