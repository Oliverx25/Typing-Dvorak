# Typing-Dvorak

A web app for practicing touch typing with the **Dvorak Simplified Keyboard** layout. Built with [Astro](https://astro.build/) and deployed on [Vercel](https://vercel.com/).

## Features

- **Progressive lessons** — Home row, top row, bottom row, words, and sentences
- **Live typing feedback** — Correct and incorrect keystrokes highlighted in real time
- **Performance stats** — WPM, accuracy, and elapsed time
- **Keyboard visualization** — On-screen Dvorak layout with next-key highlighting
- **Session history** — Best results saved in localStorage
- **Dark / light theme** — Toggle with system preference fallback

## Tech Stack

| Layer      | Technology     |
| ---------- | -------------- |
| Framework  | Astro 7        |
| UI         | React (islands)|
| Styling    | Tailwind CSS 4 |
| Deployment | Vercel         |
| Language   | TypeScript     |

## Getting Started

```bash
git clone https://github.com/Oliverx25/Typing-Dvorak.git
cd Typing-Dvorak
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Select the **Astro** framework preset (auto-detected)
4. Deploy — no extra configuration needed

Vercel will run `npm run build` and serve the static output from `dist/`.

## Project Structure

```
src/
├── components/   # React islands + Astro components
├── layouts/      # Base page layout
├── pages/        # Routes (home + /lesson/[id])
├── styles/       # Global CSS + Tailwind
└── utils/        # Dvorak layout, lessons, typing logic, storage
```

## License

MIT
