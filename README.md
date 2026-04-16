# PABLO ABRIL — Portfolio

> **Retro RPG portfolio built with Next.js 16, TypeScript, Tailwind CSS v4, and Framer Motion.**
> Live at [patportfolio.dev](https://patportfolio.dev)

A single-page portfolio built with a 16-bit RPG aesthetic — think SNES save screen meets character sheet. Features an AI chat widget powered by Claude that lets visitors talk to me directly.

---

## Features

- **Retro RPG UI** — Press Start 2P font, CRT scanline overlay, pixel avatar, no border-radius anywhere
- **Ask Pablo** — AI chat widget backed by Anthropic's `claude-sonnet-4-20250514`, streaming responses with RPG text-reveal effect
- **Avatar emotion system** — Claude prefixes every reply with `[EMOTION:X]`; the client extracts the tag and crossfades to the matching pixel avatar (13 expressions)
- **Dark / Light themes** — RPG dark (default) and parchment light, auto-detected from `prefers-color-scheme`, togglable at runtime
- **English / Spanish i18n** — full translations via `next-intl`, cookie-persisted locale toggle
- **Magazine reader** — inline PDF reader for _Missed Trigger_, my MTG community magazine (4 issues, hosted on Vercel Blob)
- **SPA architecture** — no URL routing; screen state managed with React `useState` + Framer Motion `AnimatePresence`

---

## Tech Stack

| Layer                  | Choice                                             |
| ---------------------- | -------------------------------------------------- |
| Framework              | Next.js 16 (App Router)                            |
| Language               | TypeScript 5 (strict)                              |
| Styling                | Tailwind CSS v4 (CSS-based tokens, no config file) |
| Animation              | Framer Motion 12                                   |
| i18n                   | next-intl 4 (without routing)                      |
| AI                     | Anthropic SDK — claude-sonnet-4-20250514           |
| PDF                    | react-pdf 10 + pdfjs-dist                          |
| Unit/Integration tests | Vitest + React Testing Library                     |
| E2E tests              | Playwright                                         |
| CI                     | GitHub Actions                                     |
| Deploy                 | Vercel                                             |

---

## Project Structure

```
app/
  page.tsx              # SPA root — screen state (title / portfolio / chat)
  layout.tsx            # Root layout — fonts, i18n provider, theme init script
  globals.css           # Tailwind v4 @theme tokens, CRT overlay, global resets
  api/chat/route.ts     # Anthropic streaming proxy (server-only)
components/
  TitleScreen.tsx       # PRESS START screen with save slot
  PortfolioScreen.tsx   # Tabbed RPG menu (STATS / SKILLS / QUESTS / ITEMS)
  ChatScreen.tsx        # Ask Pablo overlay — streaming AI chat + avatar
  HudBar.tsx            # Sticky top bar — name, level, theme & lang toggles
  TabNav.tsx            # Tab navigation
  StatsSection.tsx      # About / bio / contact
  SkillsSection.tsx     # Skills as RPG XP bars with category filters
  QuestsSection.tsx     # Work experience as quest log
  ItemsSection.tsx      # Projects as collectible items
  MagazineReader.tsx    # Inline PDF reader (react-pdf)
  ErrorBoundary.tsx     # Class-based error boundary for section resilience
  ThemeToggle.tsx       # Shared dark/light toggle
  LanguageToggle.tsx    # Shared EN/ES locale toggle
data/                   # Static content (skills, quests, items) — TS arrays
lib/
  emotion.ts            # Avatar emotion tag parser utility
  useTheme.ts           # useSyncExternalStore-based theme hook
types/index.ts          # All shared TypeScript types
messages/
  en.json               # English translations
  es.json               # Spanish translations
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- An Anthropic API key

### Installation

```bash
git clone https://github.com/Jezzail/portfolio-v2.git
cd portfolio-v2
npm install
```

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build          # production build
npm run type-check     # tsc --noEmit
npm run lint           # ESLint
npm run format         # Prettier
npm run test:unit      # Vitest unit tests
npm run test:integration  # Vitest integration tests
npm run test:e2e       # Playwright E2E (requires running server)
npm run test:all       # unit + integration + E2E
```

---

## Architecture notes

### Single-page app

No Next.js file-based routing for navigation. `app/page.tsx` owns a `useState<"title" | "portfolio">` for screen transitions and a separate `useState<boolean>` for the chat overlay. `AnimatePresence mode="wait"` handles transitions between screens. The chat overlay renders on top of the portfolio without unmounting it.

### Tailwind v4

No `tailwind.config.ts`. All design tokens (colours, font sizes, border-radius) live in the `@theme inline` block inside `app/globals.css`. Custom colour tokens use `var(--theme-*)` CSS properties so they adapt automatically to the active theme.

### Avatar emotion protocol

The Anthropic system prompt instructs Claude to open every reply with `[EMOTION:X]` (one of 13 emotions). The streaming API route passes this through as-is. The ChatScreen client reads the stream, extracts the tag before the first `]`, updates avatar state with a CSS opacity crossfade, then renders the remainder as the reply text.

### Rate limiting

`/api/chat` uses a simple in-memory rate limiter (20 req/min per IP). This is best-effort in serverless — each Vercel function instance has its own map. A stricter limit (5 req/min) applies to requests where the IP cannot be identified. An origin check rejects cross-origin requests in production.

---

## Environment variables

| Variable            | Required | Description                                                           |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Yes      | Anthropic API key — **server-side only, never exposed to the client** |

---

## Contact

Pablo Abril — [pat43607@gmail.com](mailto:pat43607@gmail.com) · [LinkedIn](https://linkedin.com/in/pabloabril/) · [GitHub](https://github.com/Jezzail)
