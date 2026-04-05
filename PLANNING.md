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
      │        ├─ SkillsSection (client — useTranslations + useState) ✅
      │        ├─ QuestsSection (client — useTranslations + useState) ✅
      │        └─ ItemsSection (client — useTranslations) ✅
      └─ AnimatePresence (overlay)
         └─ ChatScreen (client — fixed overlay, chat UI) ⬜ placeholder

app/api/chat/route.ts (server — Anthropic API proxy) ✅
```

## File structure

```
types/index.ts              Screen, PortfolioTab, ChatMessage, Skill,                ✅
                             SkillCategory, Quest, QuestStatus,
                             QuestFilter types
components/TitleScreen.tsx   Game title screen with PRESS START                       ✅
components/PortfolioScreen.tsx  Tabbed RPG menu (tab state + AnimatePresence)          ✅
components/ChatScreen.tsx    Ask Pablo AI chat overlay                                ⬜ placeholder
components/HudBar.tsx        Top HUD — name, role, EN/ES cookie toggle                ✅
components/TabNav.tsx        Tab navigation — 4 tabs + ASK PABLO overlay trigger      ✅
components/StatsSection.tsx  Bio / character stats                                    ✅
components/SkillsSection.tsx Tech skills as XP bars with category filters            ✅
components/QuestsSection.tsx Work experience as quests                                ✅
components/ItemsSection.tsx  Projects as collectible items                            ✅
app/api/chat/route.ts       POST endpoint for Anthropic chat                         ✅
i18n/request.ts             next-intl request config (cookie-based locale)            ✅
messages/en.json             English translations (nav, title, stats, skills,          ✅
                             quests, items, chat, hud sections)
messages/es.json             Spanish translations (mirrors en.json)                   ✅
data/                        Content data files for skills, quests, items            ✅ (data/skills.ts, data/quests.ts, data/items.ts)
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

### SkillsSection (completed)
- Data lives in `data/skills.ts` — typed `Skill[]` array with 14 skills across 4 categories
  (frontend, mobile, tooling, leadership). `Skill` and `SkillCategory` types in `types/index.ts`.
- Category filter tabs: ALL / FRONTEND / MOBILE / TOOLING / LEADERSHIP. Active filter highlighted
  with `border-border-active text-accent-gold`. Filter state managed via `useState<Filter>`.
- When ALL is selected, skills are grouped by category with `▸ CATEGORY` headers.
  When a specific category is selected, group headers are hidden.
- Each skill row: name (left), pixel XP bar (center, `border-2 border-border`), LVL number (right, gold).
  Bar fill width = `(level / 10) * 100%`. Fill colour: gold for level 8+, green for 5–7, muted below 5.
- Skill names are kept in English (tech terms). All UI labels (title, filter names, category headers,
  "LVL" prefix) are translated via `useTranslations('skills')` with keys in both en.json and es.json.
- XP bar fill uses a single inline `style={{ width }}` for the dynamic percentage — unavoidable since
  Tailwind cannot do runtime-computed widths. All other styling is Tailwind classes.

### QuestsSection (completed)
- Data lives in `data/quests.ts` — typed `Quest[]` array with 4 entries (1 current, 3 completed).
  `Quest`, `QuestStatus`, and `QuestFilter` types in `types/index.ts`.
- Filter tabs: ALL / CURRENT / PAST. Active filter highlighted with `border-border-active text-accent-gold`.
  Filter state managed via `useState<QuestFilter>`.
- Each quest card: bordered container (`border-2 border-border`) with company name (gold), status badge
  (green border + text for ACTIVE, muted for COMPLETE), role, period · location, and ▶-prefixed objectives.
- Role names and objective strings are i18n keys resolved via `useTranslations('quests')` — allows
  full translation while keeping data/quests.ts language-agnostic.
- Period and location are kept as plain strings (dates and city names don't need translation).
- All UI labels (title, filter names, status badges) translated in both en.json and es.json.

### ItemsSection (completed)
- Data lives in `data/items.ts` — typed `Item[]` array with 4 entries (1 legendary, 1 rare,
  1 uncommon, 1 locked). `Item` and `ItemRarity` types in `types/index.ts`.
- No filter tabs — all items displayed in a flat list.
- Each item card: bordered container (`border-2 border-border`) with item name (gold, or dim if
  locked), rarity badge (colour-coded: gold for legendary, blue for rare, green for uncommon,
  dim for locked), description, tech tag row, and `▶ VIEW` link button if URL exists.
- Locked item: dimmed with `opacity-50`, `border-text-dim`, no link button, `[ SLOT LOCKED ]`
  name and `???` description.
- Rarity badge colours: legendary = `accent-gold`, rare = `accent-blue`, uncommon = `accent-green`,
  locked = `text-dim`.
- Tech tags are kept as plain English strings (framework names). All UI labels (title, rarity names,
  item names, descriptions, link notes, view button) translated via `useTranslations('items')`.
- Items with `linkNote` display a muted note below the link button explaining link context
  (e.g. "Product landing — not Pablo's code").
- Link buttons open in new tab with `rel="noopener noreferrer"`.

### CI Pipeline (completed)
- GitHub Actions workflow configured in `.github/workflows/ci.yml` — runs on pull requests to `main` and pushes to `main`.
- Pipeline split into two jobs: `check` (runs on PR + push) and `build` (runs only on push).
- `check` job includes: `npm ci` (clean install), `npm run lint` (ESLint), and `npm run type-check` (TypeScript validation).
- `build` job depends on `check` (`needs: check`) and executes `npm run build` to catch runtime/import issues.
- Build step intentionally skipped on PRs to keep CI fast, while still enforcing code quality via lint + type checks.
- Ensures consistent, reproducible builds and prevents broken code from being merged.
- Local pre-commit enforcement via Husky — `pre-commit` hook runs lint-staged before every commit.
- Local pre-push enforcement via Husky — `pre-push` hook runs type-check before every push.
- Commits are blocked locally if linting or type checks fail, reducing CI failures and improving feedback loop.
- CI validation on PR ensures all checks pass before merge (aligned with required status checks).
- No deploy step in CI — Vercel handles automatic deployment on merge to `main`.

### Avatar emotion system
- 12 expression PNGs live in `public/avatar/` — filenames: `pat_neutral.png`,
  `pat_happy.png`, `pat_thinking.png`, `pat_sad.png`, `pat_surprised.png`,
  `pat_confused.png`, `pat_confident.png`, `pat_laughing.png`, `pat_focused.png`,
  `pat_embarrassed.png`, `pat_explaining.png`, `pat_error.png`.
- The API system prompt instructs Claude to begin every reply with `[EMOTION:X]`
  where X is one of the 12 valid emotion strings (lowercase, no spaces).
- The streaming client reads chunks, extracts the emotion tag before the first `]`,
  then streams the remainder as the visible reply text.
- ChatScreen renders the dialogue panel (left) + avatar panel (right), RPG style.
- Emotion image transitions use CSS `opacity` crossfade (300ms) — no Framer Motion
  needed for this, keeps it lightweight.
- `AvatarEmotion` type added to `types/index.ts`.

### ChatScreen layout
- Fixed overlay (`position: fixed, inset: 0`) on top of PortfolioScreen.
- Left column: avatar image (current emotion, pixelated rendering), character name tag.
- Right column: scrollable message history + input row at bottom.
- Message bubbles: gold border for Pablo, muted border for user.
- Streaming in progress: blinking cursor `▌` appended to last Pablo bubble.
- Close button (ESC or × button) calls `onClose` → returns to portfolio.