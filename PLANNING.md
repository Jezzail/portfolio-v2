# Portfolio Architecture Planning

## Decisions

### Tailwind v4 — CSS-based tokens, no tailwind.config.ts

This project uses Tailwind CSS v4 (via `@tailwindcss/postcss`). Tailwind v4 does **not** use a
`tailwind.config.ts` file. All design tokens are defined in `app/globals.css` inside a `@theme inline`
block. Custom colours are available as classes e.g. `bg-surface`, `text-accent-gold`, `border-border`.
Border-radius values are all set to `0px` to enforce the pixel aesthetic globally.

Colour tokens use CSS custom properties for theming (see "Dark/light theme system" below).
The `@theme inline` block references `var(--theme-*)` properties so Tailwind utility classes
automatically adapt to the active theme.

### Dark/light theme system

Two themes: **dark** (default) and **light** (beige/parchment RPG feel).

- Theme custom properties (`--theme-bg`, `--theme-surface`, etc.) are defined on `:root`
  (dark values) and overridden on `[data-theme="light"]` in `globals.css`.
- `@theme inline` references these properties: `--color-background: var(--theme-bg)` etc.
- Auto-detect: on first visit, a blocking `<script>` in `layout.tsx` `<head>` reads
  `localStorage.getItem('theme')`; if absent, falls back to `prefers-color-scheme`.
  Sets `document.documentElement.dataset.theme` before first paint to avoid flash.
- Manual toggle: DARK / LIGHT pill button (same style as the EN / ES language toggle).
  Saves preference to `localStorage` under key `theme` and sets `data-theme` on `<html>`.
- `lib/useTheme.ts` exposes a `useTheme()` hook returning `{ theme, toggleTheme }`.
  Used by both `HudBar` (portfolio screen) and `TitleScreen` (top-right corner).
- `<html>` has `suppressHydrationWarning` to prevent mismatch from the init script.
- Opacity modifiers on themed colours (e.g. `bg-background/50`) use `color-mix()` since
  Tailwind v4 can't decompose `var()` values at build time. All modern browsers support this.

Light theme palette:

- Background: #f0ead6, Surface: #e8dfc8, Border: #b8a878, Border-active: #8a6000
- Accent gold: #8a6000, Accent green: #2a7a50, Accent blue: #2a50a0
- Text primary: #1a1a0a, Text muted: #6a5a30, Text dim: #b8a878

### Font size scale (pixel font)

Press Start 2P renders large, so the project uses a custom small font-size scale
defined in `@theme inline`:

- `text-2xs` = 7px (line-height 1.5) — tiny badges, status tags
- `text-xs` = 9px (line-height 1.5)
- `text-sm` = 11px (line-height 1.5)
- `text-base` = 13px (line-height 1.5)
- `text-lg` = 15px (line-height 1.5)
- `text-xl` through `text-4xl` remain at Tailwind defaults (used only for game title).

No hardcoded `text-[Npx]` values in components — all font sizes use Tailwind tokens.

### Max-width content container

TitleScreen is wrapped in `max-w-215 mx-auto` via page.tsx. PortfolioScreen manages its
own max-w-215 internally — HudBar renders full-width (full bleed bg), while TabNav and
content sections are each wrapped in `max-w-215 mx-auto`.
CRT scanline overlay and background remain full-bleed (full viewport).

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

- Two-line left block: line 1 = `PABLO ABRIL` in `text-accent-gold text-base font-bold`,
  line 2 = `LVL 10 · SENIOR FRONTEND ENGINEER` in `text-accent-green text-xs`.
- Uses `hud.name`, `hud.lvl`, and `hud.role` i18n keys (added to both en.json and es.json).
- Theme toggle and language toggle sit on the right, vertically centered.
- Locale toggle sets `locale` cookie with `max-age=31536000;SameSite=Lax` then calls `router.refresh()`.

### PortfolioScreen tab transitions

- `PortfolioScreen` owns `activeTab` state and delegates tab rendering to `TabNav`.
- Content area uses `AnimatePresence mode="wait"` with subtle y-axis fade (`y: 4` → `0` → `-4`,
  150ms) between tab switches. `onExitComplete` scrolls to top so the scroll happens while the
  content area is empty (between exit and enter animations).
- ASK PABLO is an inline navigator bar between HudBar and TabNav (inside the sticky header
  group). Full-width button with chat icon, `[ ASK PABLO ]` title + subtitle on left,
  `▶ OPEN` on right. Uses `nav.askPablo`, `nav.askPabloDesc`, `nav.open` i18n keys.
- `◀ BACK TO TITLE` text button below tab content area — calls `onBack` prop to return
  to TitleScreen. I18n key: `portfolio.backToTitle`.
- Scrollbar hidden globally on all elements via `*` selector with `scrollbar-width: none`
  (Firefox) and `*::-webkit-scrollbar { display: none }` (Chromium/Safari) in globals.css.
- TabNav wrapper has `border-l-2 border-r-2 border-border` to contain edges on wide screens.
- **Sticky header group**: HudBar + ASK PABLO navigator + TabNav are wrapped in a single
  `sticky top-0 z-40` container inside PortfolioScreen. HudBar renders full-width (full bleed bg),
  navigator and TabNav are inside `max-w-215`. All stick together when scrolling.
- `isChatOpen` prop removed — no longer needed since the floating bubble was replaced by
  the inline navigator.

### API route for chat

`app/api/chat/route.ts` handles POST requests. Will use `ANTHROPIC_API_KEY` server-side only.

## Component tree

```
RootLayout (server)
└─ NextIntlClientProvider
   └─ Home (page.tsx, client — screen state)
      ├─ AnimatePresence mode="wait"
      │  ├─ TitleScreen (client — onStart callback, inside max-w-215) ✅
      │  └─ PortfolioScreen (client — manages own max-w-215) ✅
      │     ├─ sticky top-0 z-40 wrapper
      │     │  ├─ HudBar (client — full-width bg, toggles) ✅
      │     │  ├─ ASK PABLO navigator (inline button → opens chat) ✅
      │     │  └─ TabNav (client — tab switching, inside max-w-215) ✅
      │     ├─ AnimatePresence mode="wait" (tab content, inside max-w-215)
      │     │  ├─ StatsSection (client — useTranslations) ✅
      │     │  ├─ SkillsSection (client — useTranslations + useState) ✅
      │     │  ├─ QuestsSection (client — useTranslations + useState) ✅
      │     │  └─ ItemsSection (client — useTranslations) ✅
      └─ AnimatePresence (overlay)
         └─ ChatScreen (client — fixed overlay, chat UI) ✅

app/api/chat/route.ts (server — Anthropic API proxy) ✅
```

## File structure

```
types/index.ts              Screen, PortfolioTab, ChatMessage, Skill,                ✅
                             SkillCategory, Quest, QuestStatus,
                             QuestFilter types
components/TitleScreen.tsx   Game title screen with PRESS START                       ✅
components/ThemeToggle.tsx   Shared 🌙/☀️ single-emoji theme toggle button             ✅
components/LanguageToggle.tsx Shared single-active-locale toggle button                ✅
components/PortfolioScreen.tsx  Tabbed RPG menu (tab state + AnimatePresence)          ✅
components/ChatScreen.tsx    Ask Pablo AI chat overlay                                ✅
components/HudBar.tsx        Top HUD — name, role, EN/ES cookie toggle                ✅
components/TabNav.tsx        Tab navigation — 4 tabs only                            ✅
components/StatsSection.tsx  Bio / character stats                                    ✅
components/SkillsSection.tsx Tech skills as XP bars with category filters            ✅
components/QuestsSection.tsx Work experience as quests                                ✅
components/ItemsSection.tsx  Projects as collectible items                            ✅
app/api/chat/route.ts       POST endpoint for Anthropic chat                         ✅
i18n/request.ts             next-intl request config (cookie-based locale)            ✅
messages/en.json             English translations (nav, title, stats, skills,          ✅
                             quests, items, chat, hud, portfolio sections)
messages/es.json             Spanish translations (mirrors en.json)                   ✅
data/                        Content data files for skills, quests, items            ✅ (data/skills.ts, data/quests.ts, data/items.ts)
components/MagazineReader.tsx  Inline PDF reader for Missed Trigger magazine          ✅
lib/emotion.ts               Emotion tag parser utility (extracted from ChatScreen) ✅
lib/useTheme.ts              useTheme hook — dark/light toggle, localStorage         ✅
vitest.config.ts             Vitest config (jsdom env, path aliases, setup file)    ✅
playwright.config.ts         Playwright config (chromium, localhost:3000)           ✅
__tests__/setup.ts           Vitest global setup (next-intl, framer-motion mocks)  ✅
__tests__/unit/              Unit tests (TitleScreen, Skills, Quests, Stats, emotion) ✅
__tests__/integration/       Integration tests (chat API, tab nav, lang toggle)      ✅
e2e/                         E2E tests (full flow, tab flow, ask pablo)              ✅
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

- Full-screen retro RPG title with vertical sections: game title, save slots, PRESS START, copyright.
- Game title: "PABLO ABRIL" in gold (`text-accent-gold`) with 3D text-shadow (gold #b8860b + dark brown
  #3a2a00, two-layer offset). Subtitle "─── PORTFOLIO ───" in muted.
- Save slot 1: slim RPG row with bordered pixel avatar (`public/avatar/mini_pat.png`, image-rendering:
  pixelated). ▶ arrow on hover via CSS `::before` pseudo-element on avatar container (no layout shift).
  CLASS / LOCATION / EXP tags stacked vertically: labels in `accent-blue`, values in `accent-green`.
  "ACTIVE" text right-aligned, vertically centered. No year badge, no divider line.
  Card width matches PortfolioScreen content (`max-w-215`).
- Empty slot: "— EMPTY —" / "no data" with placeholder ? avatar. Right column shows "——".
  `pointer-events-none` — non-interactive. Hover border uses `text-dim` color (not gold) to signal
  disabled state.
- PRESS START: ▶ and ◀ inline with text (no flex), blink animation (`step-end`, 1.2s).
- Copyright line: absolutely positioned at bottom (`absolute bottom-4`), keeps title
  section centered via `justify-center` on the flex column.
- Top-right toggles: shared `ThemeToggle` + shared `LanguageToggle` components, positioned
  within the `max-w-215` parent container (absolute top-right inside `relative` root).
- Accessibility: `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space). `focus-visible:ring-2`.
- All display strings from `useTranslations("title")` — zero hardcoded text.
- Mobile no-scroll: uses `h-dvh overflow-hidden` on root element. `flex flex-col justify-center`
  centers the main content (title + save slots + PRESS START). Copyright is absolutely positioned
  at bottom. Reduced padding on mobile via responsive prefixes (`py-6 sm:py-10`, `mt-2 sm:mt-4`).

### ThemeToggle (completed)

- Shared client component in `components/ThemeToggle.tsx`. Used by both TitleScreen and HudBar.
- Single-emoji button: shows only the active theme — 🌙 for dark, ☀️ for light. Clicking toggles.
  No text label, no two-option pill, no highlight logic needed.
- Same bordered button style as language toggle.
- Uses `useTheme()` hook from `lib/useTheme.ts`.

### LanguageToggle (completed)

- Shared client component in `components/LanguageToggle.tsx`. Used by both TitleScreen and HudBar.
- Single-active-locale button: shows only the current locale (`EN` or `ES`) in `text-accent-gold`.
  Clicking toggles to the other. No two-option pill.
- Sets `locale` cookie with `max-age=31536000;SameSite=Lax` then calls `router.refresh()`.
- Uses `useLocale()` and `useRouter()` from next-intl / Next.js.

### StatsSection (completed)

- Content (character info, stat values, bio, contact links) is defined inline in the component
  via i18n keys rather than in a `data/` file. StatsSection has no typed data array because its
  content is unique/singleton — unlike skills, quests, and items which are lists of similar entries.
- Layout: character info block (gold labels, white values, green status),
  bio paragraph, and `▶`-prefixed contact links. (2×2 stat grid removed.)
- All strings in `messages/en.json` and `messages/es.json` under the `stats` namespace.
- Contact links: GitHub (github.com/Jezzail), LinkedIn (linkedin.com/in/pabloabril/),
  Email (pat43607@gmail.com) — all open in new tab with `rel="noopener noreferrer"`.

### HudBar (completed)

See HudBar design decision above — full details there.

### PortfolioScreen + TabNav (completed)

See PortfolioScreen tab transitions decision above — full details there.

### SkillsSection (completed)

- Data lives in `data/skills.ts` — typed `Skill[]` array with 10 skills across 3 categories
  (mobile_frontend, product, leadership). `Skill` and `SkillCategory` types in `types/index.ts`.
- Category filter tabs: ALL / MOBILE & FRONTEND / SHIPPING PRODUCT / LEADERSHIP. Active filter
  highlighted with `border-border-active text-accent-gold`. Filter state managed via `useState<Filter>`.
- When ALL is selected, skills are grouped by category with `▸ CATEGORY` headers.
  When a specific category is selected, group headers are hidden.
- Each skill row: `flex-col` on mobile, `sm:flex-row sm:items-center` on desktop.
  Name has `sm:w-35` fixed width so long names (e.g. "Performance Optimisation") wrap without
  displacing the XP bar. XP bar + LVL sit in a `flex items-center gap-3` sub-row.
  Pixel XP bar: `border-2 border-border`, LVL number right-aligned in gold.
  Bar fill width = `(level / 10) * 100%`. Fill colour: gold for level 8+, green for 5–7, muted below 5.
- Skill names are kept in English (tech terms). All UI labels (title, filter names, category headers,
  "LVL" prefix) are translated via `useTranslations('skills')` with keys in both en.json and es.json.
- XP bar fill uses a single inline `style={{ width }}` for the dynamic percentage — unavoidable since
  Tailwind cannot do runtime-computed widths. All other styling is Tailwind classes.

### QuestsSection (completed)

- Data lives in `data/quests.ts` — typed `Quest[]` array with 4 entries (1 current, 3 completed).
  `Quest`, `QuestStatus`, and `QuestFilter` types in `types/index.ts`.
- Filter tabs: ALL / ACTIVE / COMPLETE. Active filter highlighted with `border-border-active text-accent-gold`.
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
  dim for locked), description, slash-separated tech tags, and `▶ VIEW` link button if URL exists.
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
  needed for this, keeps it lightweight. New emotion images are preloaded via `new Image()`
  before triggering the crossfade, preventing a flash of the previous emotion.
- `AvatarEmotion` type added to `types/index.ts`.

### ChatScreen layout

- Fixed overlay (`position: fixed, inset: 0`) on top of PortfolioScreen.
- Layout uses `h-dvh` (dynamic viewport height) instead of `h-screen`/`100vh` so the
  layout shrinks correctly when the mobile keyboard opens.
- Avatar crossfade pair (two `<img>` tags with opacity transition) is extracted into a
  reusable `avatarCrossfade` JSX variable, rendered in both mobile and desktop positions.
- On mobile: avatar shown above the input row in a strip with name + level on the left
  and avatar (`w-24 h-24`, `image-rendering: pixelated`) on the right. Separated from
  messages by a `border-t-2`. Hidden on desktop (`md:hidden`).
- On desktop (`md:+`): existing side-panel layout — avatar in a right column
  (`border-l-2 border-border`, min `w-32 h-32`), messages + input in the left column.
- Left column: scrollable message history + input row at bottom.
  Message list uses `flex-1 overflow-y-auto`, input row pinned at bottom of flex column.
- Message bubbles: gold border for Pablo, muted border for user.
- Streaming in progress: blinking cursor `▌` appended to last Pablo bubble.
- Close button (ESC or × button) calls `onClose` → returns to portfolio.
- RPG text reveal: AI reply text appears one character at a time (30ms interval),
  simulating classic RPG dialogue boxes. Full text stored in a ref; a `displayedCharCount`
  state drives the visible slice. The reveal timer continues after the stream ends until
  all characters are shown, then `isStreaming` is cleared.
- Emotion fallback: if the API response does not include `[EMOTION:X]` (missing tag,
  malformed tag, or stream too short), emotion resets to `neutral` instead of staying
  stuck on `thinking`.
- Auto-focus: input field regains focus automatically after each send/reply cycle completes
  (desktop only, `min-width: 768px`). Disabled on mobile to prevent the keyboard from
  covering the AI reply.

### MagazineReader / Missed Trigger (completed)

- Uses `react-pdf` (v10) to render PDF pages in the browser via PDF.js.
- react-pdf is dynamically imported via `next/dynamic` with `ssr: false` to avoid
  the `DOMMatrix is not defined` error — PDF.js relies on browser APIs not available
  during server-side rendering / static page generation.
- PDF.js worker loaded from unpkg CDN: `pdfjs.GlobalWorkerOptions.workerSrc`
  set to `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`.
  Worker source is configured inside the dynamic import callback so it runs only client-side.
- 4 magazine PDFs hosted on Vercel Blob (public URLs in `data/items.ts` as
  `magazineIssues` array). `MagazineIssue` type in `types/index.ts`.
- Full-screen modal pattern — MagazineReader renders as a fixed overlay at
  `z-index: 10000` (above the CRT scanline overlay at `z-index: 9999`).
  Modal is 90vw × 90vh, centered, with semi-transparent background backdrop.
  Closes on Escape key or clicking outside the modal panel.
- **Local CRT overlay**: The modal container uses the `.crt-local` CSS class which adds
  its own `::after` scanline overlay at `z-index: 5`. The PDF viewport has `relative z-10`
  so the rendered PDF sits above the local scanlines (clean, no CRT effect on the PDF),
  while the modal chrome (header, footer, backdrop) keeps the scanline aesthetic.
  `.crt-local` class is defined in `globals.css` and is reusable for any container.
- Issue selector buttons in ItemsSection replace the `▶ VIEW` link for magazine items.
  Clicking an issue button opens the modal reader with that issue pre-selected.
  Issue tabs inside the modal header allow switching issues without closing.
- Mixed portrait/landscape PDFs are sized using a general "contain" calculation
  based on the page's original aspect ratio and the modal viewport constraints,
  preserving aspect ratio while fitting each page within the available width/height.
- Preset page counts per issue (16, 24, 20, 34) stored in `MagazineIssue.pages`
  to avoid async page count fetch. Navigation bounded to [1, pages].
- Error state: shows "LOAD FAILED" + download fallback link to the PDF URL.
- `hasMagazineReader` boolean field on `Item` type controls which items
  render the reader instead of a standard link button.
- All UI strings via `useTranslations('items.magazine')` — i18n keys in
  both en.json and es.json.
- Item data keys use relative paths (e.g. `magazine.name`) since
  `useTranslations('items')` already scopes to the `items` namespace.
  `magazineIssues[].labelKey` values are also stored as relative keys
  (e.g. `issue1`) resolved via `useTranslations('items.magazine')`.

### Testing suite (completed)

- **Stack**: Vitest + React Testing Library (unit/integration), Playwright (E2E).
  Jest is NOT used — Vitest was chosen for native ESM, TypeScript, and Vite compatibility.
- **Emotion parser extraction**: `tryExtractEmotion` and `isValidEmotion` were extracted
  from `ChatScreen.tsx` into `lib/emotion.ts` to enable standalone unit testing.
  ChatScreen now imports from `lib/emotion.ts`.
- **Vitest config** (`vitest.config.ts`): jsdom environment, `@vitejs/plugin-react` for JSX,
  `@/` path alias, setup file at `__tests__/setup.ts`.
- **Test setup** (`__tests__/setup.ts`): Mocks `next-intl` (loads real en.json translations),
  `next/navigation` (router stubs), and `framer-motion` (motion.\* → plain HTML elements,
  AnimatePresence → passthrough). Uses `@testing-library/jest-dom/vitest` for matchers.
- **Playwright config** (`playwright.config.ts`): Chromium only, targets localhost:3000,
  auto-starts `npm run dev` via `webServer`, retries 2× in CI.

#### Unit tests (`__tests__/unit/`)

- `TitleScreen.test.tsx` — PRESS START renders, save slot text (LV 37, role, location), click calls onStart.
- `SkillsSection.test.tsx` — all 10 skills render by name, XP bars present, level numbers present.
- `QuestsSection.test.tsx` — company names, section title, status badges, translated roles.
- `StatsSection.test.tsx` — GitHub/LinkedIn/Email links with correct hrefs, section title, name/class.
- `emotion-parser.test.ts` — tag extraction, all 12 valid emotions, malformed/missing tags, buffer overflow.

#### Integration tests (`__tests__/integration/`)

- `chat-api.test.ts` — POST /api/chat returns 400 for missing/empty/invalid messages; returns streaming
  response with emotion tag for valid input. Anthropic SDK and fs are mocked.
- `tab-navigation.test.tsx` — clicking STATS/SKILLS/QUESTS/ITEMS tabs renders correct section heading;
  ASK PABLO button calls onOpenChat callback.
- `language-toggle.test.tsx` — EN active by default, clicking toggle sets `locale=es` cookie and calls
  router.refresh(), Spanish messages file has matching keys.

#### E2E tests (`e2e/`)

- `full-flow.spec.ts` — land on TitleScreen → click PRESS START → PortfolioScreen with CHARACTER STATS.
- `tab-flow.spec.ts` — navigate past title, click all 4 tabs + ASK PABLO, assert section headings visible.
- `ask-pablo.spec.ts` — intercept /api/chat with mock response, open chat, send message, assert reply appears.

#### Scripts & CI

- `package.json` scripts: `test:unit`, `test:integration`, `test:e2e`, `test:all`.
- Husky `pre-push` hook: runs `type-check` + `test:unit` + `test:integration` (fast, no E2E).
- GitHub Actions CI (`ci.yml`): `check` job now runs unit + integration tests after lint/type-check.
  New `e2e` job (push-only) installs Playwright, builds, and runs E2E tests.
- `tsconfig.json`: `__tests__/` and `e2e/` excluded from `tsc --noEmit` to avoid Vitest global conflicts.

### Layout, typography & theming foundations (completed)

- **Theme system**: CSS custom properties on `:root` (dark) and `[data-theme="light"]` (light),
  referenced by `@theme inline` via `var()`. Blocking `<script>` in `<head>` detects
  `localStorage('theme')` → `prefers-color-scheme` → default dark, sets `data-theme` before paint.
- **Theme toggle**: DARK / LIGHT pill button matching EN / ES style. In `HudBar` for portfolio
  screen, absolute-positioned top-right in `TitleScreen`. Shared via `lib/useTheme.ts` hook.
  `stopPropagation` on TitleScreen toggle prevents triggering `onStart` on the parent div.
- **Font size scale**: Custom sizes in `@theme inline` — xs=9px, sm=11px, base=13px, lg=15px.
  All components updated: hardcoded `text-[8px]` → `text-xs`, `text-[10px]` → `text-sm`,
  `sm:text-xs` → `sm:text-base`, etc. Sub-scale sizes (7px, 8px) kept for tiny badges.
- **Max-width container**: `max-w-215` centered wrapper in `page.tsx` around screen content.
  HudBar: full-width background with inner content constrained to the same max-width.
  CRT overlay and background remain full-bleed. ChatScreen unaffected (fixed overlay).
- **i18n keys added**: `hud.dark` / `hud.light` in both en.json and es.json.
- **New dev dependency**: `Prettier` added for code formatting; `format` / `format:check` scripts
  wired into lint-staged and CI.
