# Portfolio Architecture Planning

## Decisions

### Tailwind v4 — CSS-based tokens, no tailwind.config.ts
This project uses Tailwind CSS v4 (via `@tailwindcss/postcss`). Tailwind v4 does **not** use a
`tailwind.config.ts` file. All design tokens are defined in `app/globals.css` inside a `@theme inline`
block. Custom colours are available as classes e.g. `bg-surface`, `text-accent-gold`, `border-border`.
Border-radius values are all set to `0px` to enforce the pixel aesthetic globally.

### Single-page app with React state routing
No Next.js file-based routing is used for page navigation. A single `app/page.tsx` manages
two concerns:
- **Screen state** — `useState<Screen>` where `Screen = "title" | "portfolio"`.
  `AnimatePresence mode="wait"` wraps transitions between `TitleScreen` and `PortfolioScreen`.
- **Chat overlay** — a separate `useState<boolean>` (`isChatOpen`). `ChatScreen` renders inside
  its own `AnimatePresence` as a fixed overlay on top of the portfolio, without unmounting it.

Chat is **not** a screen value — it's an independent boolean so the portfolio stays mounted
underneath the overlay.

### next-intl without i18n routing
Since this is an SPA, we use next-intl's "without i18n routing" setup:
- `i18n/request.ts` reads locale from a cookie (defaults to `"en"`)
- No `middleware.ts` — not needed without locale-based URL routing
- `NextIntlClientProvider` wraps children in `layout.tsx`
- Locale switching will set a cookie + call `router.refresh()`

### Server vs client components
- `layout.tsx` is a server component (async, fetches locale/messages)
- `page.tsx` is a client component (manages screen state)
- Section components (`StatsSection`, `SkillsSection`, `QuestsSection`, `ItemsSection`) are
  **client components** — originally planned as server components, but they need `"use client"`
  because `useTranslations()` is a hook that requires client context. They are still purely
  presentational (no local state, no effects) — the client boundary is solely for i18n.
- Interactive components (`TitleScreen`, `PortfolioScreen`, `ChatScreen`, `HudBar`, `TabNav`) are
  client components

### HudBar design
- Displays `▶ PABLO ABRIL` (gold) + role (muted) separated by a dim `│` on desktop.
- EN/ES toggle is a bordered button with both labels visible; active locale highlighted in gold.
- Uses `hud.name` and `hud.level` i18n keys (added to both en.json and es.json).
- Locale toggle sets `locale` cookie with `max-age=31536000;SameSite=Lax` then calls `router.refresh()`.

### PortfolioScreen tab transitions
- `PortfolioScreen` owns `activeTab` state and delegates tab rendering to `TabNav`.
- Content area uses `AnimatePresence mode="wait"` with subtle y-axis fade (`y: 4` → `0` → `-4`,
  150ms) between tab switches.
- ASK PABLO is not a real tab — it doesn't set `activeTab`. Instead it calls `onOpenChat` which
  bubbles up to `page.tsx` to toggle the `ChatScreen` overlay.

### API route for chat
`app/api/chat/route.ts` handles POST requests. Will use `ANTHROPIC_API_KEY` server-side only.

## Component tree

```
RootLayout (server)
└─ NextIntlClientProvider
   └─ Home (page.tsx, client — screen state)
      ├─ HudBar (client — lang toggle, visible on portfolio + chat) ✅
      ├─ AnimatePresence mode="wait"
      │  ├─ TitleScreen (client — onStart callback) ✅
      │  └─ PortfolioScreen (client — tabbed content) ✅
      │     ├─ TabNav (client — tab switching + ASK PABLO button) ✅
      │     └─ AnimatePresence mode="wait" (tab content transitions)
      │        ├─ StatsSection (client — useTranslations) ✅
      │        ├─ SkillsSection (client — useTranslations) ⬜ placeholder
      │        ├─ QuestsSection (client — useTranslations) ⬜ placeholder
      │        └─ ItemsSection (client — useTranslations) ⬜ placeholder
      └─ AnimatePresence (overlay)
         └─ ChatScreen (client — fixed overlay, chat UI) ⬜ placeholder

app/api/chat/route.ts (server — Anthropic API proxy) ⬜ stub
```

## File structure

```
types/index.ts              Screen, PortfolioTab, ChatMessage types                  ✅
components/TitleScreen.tsx   Game title screen with PRESS START                       ✅
components/PortfolioScreen.tsx  Tabbed RPG menu (tab state + AnimatePresence)          ✅
components/ChatScreen.tsx    Ask Pablo AI chat overlay                                ⬜ placeholder
components/HudBar.tsx        Top HUD — name, role, EN/ES cookie toggle                ✅
components/TabNav.tsx        Tab navigation — 4 tabs + ASK PABLO overlay trigger      ✅
components/StatsSection.tsx  Bio / character stats                                    ✅
components/SkillsSection.tsx Tech skills as XP bars                                   ⬜ placeholder
components/QuestsSection.tsx Work experience as quests                                ⬜ placeholder
components/ItemsSection.tsx  Projects as collectible items                            ⬜ placeholder
app/api/chat/route.ts       POST endpoint for Anthropic chat                         ⬜ stub
i18n/request.ts             next-intl request config (cookie-based locale)            ✅
messages/en.json             English translations (nav, title, stats, skills,          ✅
                             quests, items, chat, hud sections)
messages/es.json             Spanish translations (mirrors en.json)                   ✅
data/                        (future) Content data files for skills, quests, items    ⬜ empty
```

## Open questions & decisions

1. **Pixel cursor asset** — DECIDED: use a .png file in public/.
   16x16 pixel sword cursor. Create during polish phase.
   Currently using an inline SVG data URI in `globals.css`.

2. **Content data files** — DECIDED: TypeScript objects in data/ folder.
   One file per section: data/skills.ts, data/quests.ts, data/items.ts.
   Each exports a typed array. Types defined in types/index.ts.

3. **Chat streaming** — DECIDED: yes, stream tokens. The character-by-character
   UX matches the RPG dialogue box aesthetic perfectly.

4. **Locale persistence** — ✅ IMPLEMENTED: cookie-based toggle in HudBar.
   Sets `locale` cookie + calls `router.refresh()`. Uses `useLocale()` to
   read current locale and highlight the active option in gold.

5. **OG image** — DECIDED: backlog, do last before final deploy.

## Implementation notes

### TitleScreen (completed)
- Full-screen retro RPG title with three vertical sections: game title, save slot, PRESS START.
- Game title: "PABLO ABRIL" in gold (`text-accent-gold`), "─── PORTFOLIO ───" subtitle in muted.
- Save slot: gold-bordered box (`border-2 border-border-active`) displaying LV 37, role, location,
  years exp, and ★ 60K+ DOWNLOADS. Styled after SNES save file select screens.
- PRESS START: hard-blink animation (`step-end`, 1.2s) via `.animate-blink` utility in `globals.css`.
- Accessibility: uses `role="button"` + `tabIndex={0}` with React `onKeyDown` handler (Enter/Space)
  instead of a window-level `useEffect` keydown listener. Added `focus-visible:ring-2` for keyboard
  focus. This diverges from the original plan (which only specified Enter + click anywhere) but is
  strictly an enhancement.
- All 7 display strings (`gameName`, `subtitle`, `role`, `location`, `yearsExp`, `downloads`,
  `level`) sourced from `useTranslations("title")` — zero hardcoded text.
- Responsive: text sizes scale via `sm:` / `md:` breakpoints; save slot maxes at `max-w-md`.

### StatsSection (completed)
- Content (character info, stat values, bio, contact links) is defined inline in the component
  via i18n keys rather than in a `data/` file. StatsSection has no typed data array because its
  content is unique/singleton — unlike skills, quests, and items which are lists of similar entries.
- Layout: character info block (gold labels, white values, green status), 2×2 stat grid
  (gold labels, green values), bio paragraph, and `▶`-prefixed contact links.
- All strings in `messages/en.json` and `messages/es.json` under the `stats` namespace.
- Contact links: GitHub (github.com/Jezzail), LinkedIn (linkedin.com/in/pabloabril/),
  Email (pat43607@gmail.com) — all open in new tab with `rel="noopener noreferrer"`.

### HudBar (completed)
See HudBar design decision above — full details there.

### PortfolioScreen + TabNav (completed)
See PortfolioScreen tab transitions decision above — full details there.