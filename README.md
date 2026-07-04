<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4f46e5,100:a82da8&height=220&section=header&text=Typing%20Dvorak&fontSize=65&fontAlignY=40&fontColor=fff&desc=Master%20the%20Dvorak%20Layout%20in%20Real-Time&descAlignY=60&descSize=20" />

<br />

<a href="https://typing-dvorak.vercel.app">
  <img src="https://img.shields.io/badge/Live_Demo-typing--dvorak.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
</a>
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
<a href="https://astro.build/">
  <img src="https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
</a>

</div>

<p align="center">
  A web application for learning, practicing, and mastering the <strong>Dvorak Simplified Keyboard</strong>
  through progressive lessons, detailed analytics, and real-time multiplayer typing races.
</p>

---

## 🛠️ Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=astro,react,tailwind,supabase,postgres,ts,vite,vercel&perline=8" alt="Tech stack icons" />

</div>

<table>
<tr>
<td valign="top">

| Layer | Technology |
| ----- | ---------- |
| **Framework** | [Astro 7](https://astro.build/) (SSR on Vercel) |
| **UI** | [React 19](https://react.dev/) islands |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend** | [Supabase](https://supabase.com/) — PostgreSQL, Auth, Storage, Realtime |
| **Deploy** | [Vercel](https://vercel.com/) |

</td>
<td valign="top">

| Tooling | Technology |
| ------- | ---------- |
| **Language** | TypeScript |
| **Unit tests** | [Vitest](https://vitest.dev/) |
| **E2E tests** | [Playwright](https://playwright.dev/) |
| **Lint / format** | ESLint, Prettier |
| **Node.js** | >= 22.12.0 |

</td>
</tr>
</table>

---

## 🚀 Features

### 📚 Progressive Lessons

Structured curriculum that introduces keys row by row and advances to words, sentences, symbols, and advanced challenges.

| Track | Content |
| ----- | ------- |
| Basics | Home Row, Top Row, Bottom Row, Shift and Caps, All Rows, Common Words |
| Symbols & Numbers | Punctuation, Numbers, Developer Symbols |
| Advanced | Sentences, Advanced Challenge |
| Optional | Adaptive Drill (generated practice) |

| Capability | Details |
| ---------- | ------- |
| Curriculum unlock | **90%+ accuracy** required to unlock the next lesson |
| Practice & Test | Open practice or 60s timed test with WPM penalties |
| Custom practice | Paste any text at `/practice/custom` |
| Live feedback | Per-character highlighting, WPM, accuracy, progress bar |
| Combo counter | Current and max correct-key streaks |
| Virtual keyboard | Dvorak layout, finger colors, home-row guides |
| Star ratings | Performance scored on each completion |

### 🌐 Real-Time Multiplayer

Authenticated players create or join lobbies and race synchronously.

| Feature | Details |
| ------- | ------- |
| Routes | `/multiplayer` · `/multiplayer/room?code=XXXXXX` |
| Room creation | Host picks lesson/text, rules, and modifiers; receives a room code |
| Join by code | Supabase validation before entering the lobby |
| Waiting room | Ready states, player grid, avatars, host controls |
| Host panel | Change lesson, text, and rules between races |
| Race sync | Countdown, shared text, live leaderboard via Realtime |
| Ownership transfer | Host leave → privileges pass to longest-present player |
| Room lifecycle | PostgreSQL registry; close deletes row and frees the code |

---

## 📊 Platform, Settings & Data

| Area | Feature | Details |
| ---- | ------- | ------- |
| **Stats** | Dashboard | WPM trends, lesson bests, streak, key-error heatmap at `/stats` |
| **Stats** | Achievements | First lesson, 7-day streak, 50 WPM, perfect run, curriculum complete |
| **Stats** | Cloud sync | Sessions, key errors, badges, and preferences via Supabase |
| **Settings** | Language | English or Spanish (full i18n) |
| **Settings** | Sound | Optional keystroke audio |
| **Settings** | Blind mode | Hide virtual keyboard by default |
| **Settings** | Finger colors | Color-code keys by finger |
| **Settings** | Highlight theme | Indigo, emerald, cyan, red, amber, fuchsia accents |
| **Settings** | Theme | Light / dark toggle |
| **Data** | Local-first | Guest progress in `localStorage` (sessions, streaks, key stats, settings) |
| **Data** | Export / Import | JSON backup from Settings |
| **Data** | Account sync | Signed-in users sync and export local + cloud data |
| **App** | Authentication | Email, GitHub, Google; custom display name and avatar |
| **App** | Landing page | QWERTY vs Dvorak comparison |
| **App** | PWA | Manifest + service worker for offline asset caching |
| **App** | Responsive | Mobile-friendly typing UI with collapsible keyboard |

---

## 🎮 Game Modes & Modifiers

Multiplayer supports multi-select win conditions and optional modifiers via osu!-style **ModBadge** panels. Default match: **Max Score**, no modifiers. Rules are set in the create-room sidebar and the host setup modal.

| Type | Mode | Description |
| ---- | ---- | ----------- |
| Win condition | **Max Score** *(default)* | Composite score balancing speed, accuracy, and combo |
| Win condition | **First to Finish** | First player to complete the text wins |
| Win condition | **Highest WPM** | Highest words-per-minute at race end |
| Modifier | **Sudden Death** | One mistake eliminates you from the race |
| Modifier | **Blind Mode** | Hides the on-screen keyboard during the race |

> **Max Score formula:** `Score = (WPM × 10) × (Accuracy / 100) + (MaxCombo × 5)`
>
> Low accuracy reduces the WPM weight; long combos add bonus points. Scores broadcast in real time when Max Score is active.

---

<details>
<summary><b>🔍 Multiplayer architecture</b></summary>

Multiplayer uses **Supabase Realtime** channels and a lightweight **room registry** in PostgreSQL — no custom WebSocket server.

```
Host / Players                    Supabase
     |                                |
     |-- createRoom(code) ----------->| INSERT into `rooms` (status=open)
     |-- channel `room-{code}` ------>| Realtime Presence + Broadcast
     |-- track(presence) ------------>| Player list, ready state
     |-- broadcast(room:state) ------>| Lesson, rules, race phase
     |-- broadcast(progress) -------->| WPM, accuracy, score, completion
     |-- closeRoom / DELETE --------->| Row removed; code freed
```

* **Presence** — `userId`, display name, avatar, ready flag, finish state
* **Broadcast events** — `room:state`, `room:request_state`, `room:kick`, `room:return_lobby`, `progress`
* **Room registry** — Partial unique index: one open room per code; close = DELETE row
* **Cleanup** — `purge_stale_rooms()` removes legacy and abandoned rooms (7-day default)
* **Lifecycle** — `beforeunload` + React cleanup → `closeRoom` or host transfer via `keepalive`
* **Collisions** — 6-char codes, DB uniqueness, retry on create

</details>

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Oliverx25/Typing-Dvorak.git
cd Typing-Dvorak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

```bash
cp .env.example .env
```

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Without Supabase, the app runs in local-only mode (lessons, stats, guest progress). Auth and multiplayer require configuration.

### 4. Supabase migrations

Run in order in the Supabase SQL Editor:

| # | File |
| - | ---- |
| 1 | `supabase/schema/01_initial_schema.sql` |
| 2 | `supabase/rls/02_security_policies.sql` |
| 3 | `supabase/schema/03_profile_avatars_storage.sql` |
| 4 | `supabase/schema/04_user_badges.sql` |
| 5 | `supabase/schema/05_profile_display_name_custom.sql` |
| 6 | `supabase/schema/06_profile_preferences.sql` |
| 7 | `supabase/schema/07_max_combo.sql` |
| 8 | `supabase/schema/08_multiplayer_rooms.sql` |
| 9 | `supabase/schema/09_rooms_code_reuse.sql` *(if old `08` was applied first)* |

Enable **GitHub** / **Google** under Authentication. Redirect URLs:

* Local — `http://localhost:4321/auth/callback`
* Production — `https://your-production-domain/auth/callback`

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

<details>
<summary><b>📜 All npm scripts</b></summary>

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build (Vercel output) |
| `npm run preview` | Preview production build |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run lint` | ESLint on `src/` |
| `npm run format` | Prettier format |

Background dev (Astro 7): `astro dev --background` · `astro dev status` · `astro dev logs` · `astro dev stop`

</details>

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── achievements/    # Badge grid and summaries
│   ├── auth/            # Login, signup, profile, avatars
│   ├── layout/          # Header, settings panel, shell
│   ├── lessons/         # Lesson cards, guards, curriculum UI
│   ├── multiplayer/     # Lobby, race, ModBadge, room setup
│   ├── pages/           # Route-level React page components
│   ├── typing/          # TypingTest, keyboard, stats bar, combo
│   └── ui/              # Shared buttons, cards, toggles, icons
├── contexts/            # AppProvider, AuthProvider, theme
├── hooks/               # useTypingSession, useMultiplayerLobby, useMultiplayerRace
├── i18n/                # en.ts, es.ts
├── layouts/             # Astro layout shell
├── pages/               # Astro routes (SSR/prerender)
├── services/supabase/   # Auth, sync, rooms, profile, badges
├── styles/              # Global CSS, Tailwind
├── types/               # Multiplayer and shared types
└── utils/               # curriculum, keyboard, multiplayer, progress, stats, typing

supabase/schema/         # Ordered SQL migrations
supabase/rls/            # Row Level Security policies
public/badges/           # Achievement SVG icons
public/icons/            # UI and multiplayer rule icons
```

---

## 🚢 Deploy to Vercel

1. Push to GitHub.
2. Import in [Vercel](https://vercel.com/new) (Astro preset auto-detected).
3. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

Production: [https://typing-dvorak.vercel.app](https://typing-dvorak.vercel.app)

---

## 👤 Author

<div align="center">

**Oliver Olvera** — Full-Stack Developer

<a href="https://github.com/Oliverx25">
  <img src="https://img.shields.io/badge/GitHub-Oliverx25-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
</a>
<a href="https://www.linkedin.com/in/oliverolvera/">
  <img src="https://img.shields.io/badge/LinkedIn-Oliver_Olvera-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
</a>

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:a82da8,100:4f46e5&height=100&section=footer&text=Built%20with%20Astro%20%26%20Supabase&fontSize=22&fontColor=fff" alt="Footer" />

<br />

<sub>MIT License · Typing Dvorak © 2026</sub>

</div>
