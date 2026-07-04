# Typing-Dvorak app vercel

A web app for practicing touch typing with the **Dvorak Simplified Keyboard** layout. Built with [Astro](https://astro.build/) and deployed on [Vercel](https://vercel.com/).

## Features

- **9 progressive lessons** — Home row → top → bottom → punctuation → numbers → words → sentences
- **Curriculum unlock** — Complete each lesson with 90%+ accuracy to unlock the next
- **Practice & Test modes** — Relaxed practice or 60s timed test with WPM penalties for errors
- **Live typing feedback** — Correct/incorrect keystrokes highlighted in real time
- **Keyboard visualization** — Dvorak layout with next-key highlight, finger colors, and home guides (U · H)
- **Blind mode** — Hide the on-screen keyboard for advanced practice
- **Sound effects** — Optional audio feedback on keystrokes
- **Stats dashboard** — WPM chart, per-lesson bests, day streak
- **QWERTY vs Dvorak** — Educational comparison table on the home page
- **i18n** — English and Spanish
- **PWA** — Offline support via service worker
- **Dark / light theme**

## Tech Stack

| Layer      | Technology     |
| ---------- | -------------- |
| Framework  | Astro 7        |
| UI         | React islands  |
| Styling    | Tailwind CSS 4 |
| Tests      | Vitest         |
| Lint       | ESLint         |
| CI         | GitHub Actions |
| Deployment | Vercel         |

## Getting Started

```bash
git clone https://github.com/Oliverx25/Typing-Dvorak.git
cd Typing-Dvorak
npm install
npm run dev
```

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run test      # Unit tests
npm run lint      # ESLint
```

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new) — Astro preset auto-detected
3. Deploy

## Project Structure

```
src/
├── components/   # React UI (typing, keyboard, stats, settings)
├── contexts/     # AppProvider (i18n + settings)
├── hooks/        # useTypingSession
├── i18n/         # en.ts, es.ts
├── pages/        # /, /lesson/[id], /stats
├── utils/        # Dvorak, lessons, curriculum, storage, sound
└── styles/       # Global CSS + Tailwind
```

## Supabase (optional — cloud sync & auth)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env` and set `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`
3. In **SQL Editor**, run migrations in order:
   - `supabase/schema/01_initial_schema.sql`
   - `supabase/rls/02_security_policies.sql`
   - `supabase/schema/03_profile_avatars_storage.sql` *(avatars bucket + profile photo columns)*
4. Enable **GitHub** / **Google** providers under Authentication → Providers
5. Add redirect URLs: `https://your-domain/auth/callback`, `http://localhost:4321/auth/callback`

Profile photos are stored in the public `avatars` bucket; metadata flag `avatar_custom` in Auth distinguishes custom uploads from OAuth defaults.

## License

MIT
