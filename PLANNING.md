# Portfolio Architecture Planning

## Decisions

### Tailwind v4 — CSS-based tokens, no tailwind.config.ts
This project uses Tailwind CSS v4 (via `@tailwindcss/postcss`). Tailwind v4 does **not** use a
`tailwind.config.ts` file. All design tokens are defined in `app/globals.css` inside a `@theme inline`
block. Custom colours are available as classes e.g. `bg-surface`, `text-accent-gold`, `border-border`.
Border-radius values are all set to `0px` to enforce the pixel aesthetic globally.

### Single-page app with React state routing
No Next.js file-based routing is used for page navigation. A single `app/page.tsx` controls three
screens via `useState<Screen>`:
- `"title"` → `<TitleScreen />`
- `"portfolio"` → `<PortfolioScreen />`
- `"chat"` → `<ChatScreen />` (rendered as fixed overlay on top of portfolio)

`AnimatePresence` from Framer Motion wraps screen transitions with fade animations. The chat screen
uses a **separate** `AnimatePresence` so it can overlay the portfolio without unmounting it.

### next-intl without i18n routing
Since this is an SPA, we use next-intl's "without i18n routing" setup:
- `i18n/request.ts` reads locale from a cookie (defaults to `"en"`)
- No `middleware.ts` — not needed without locale-based URL routing
- `NextIntlClientProvider` wraps children in `layout.tsx`
- Locale switching will set a cookie + call `router.refresh()`

### Server vs client components
- `layout.tsx` is a server component (async, fetches locale/messages)
- `page.tsx` is a client component (manages screen state)
- Section components (`StatsSection`, `SkillsSection`, `QuestsSection`, `ItemsSection`) are server
  components — they render static content
- Interactive components (`TitleScreen`, `PortfolioScreen`, `ChatScreen`, `HudBar`, `TabNav`) are
  client components

### API route for chat
`app/api/chat/route.ts` handles POST requests. Will use `ANTHROPIC_API_KEY` server-side only.

## Component tree

```
RootLayout (server)
└─ NextIntlClientProvider
   └─ Home (page.tsx, client — screen state)
      ├─ HudBar (client — lang toggle, visible on portfolio + chat)
      ├─ AnimatePresence mode="wait"
      │  ├─ TitleScreen (client — onStart callback)
      │  └─ PortfolioScreen (client — tabbed content)
      │     ├─ TabNav (client — tab switching + ASK PABLO button)
      │     └─ <active tab content>
      │        ├─ StatsSection (server)
      │        ├─ SkillsSection (server)
      │        ├─ QuestsSection (server)
      │        └─ ItemsSection (server)
      └─ AnimatePresence (overlay)
         └─ ChatScreen (client — fixed overlay, chat UI)

app/api/chat/route.ts (server — Anthropic API proxy)
```

## File structure

```
types/index.ts              Screen, PortfolioTab, ChatMessage types
components/TitleScreen.tsx   Game title screen with PRESS START
components/PortfolioScreen.tsx  Tabbed RPG menu
components/ChatScreen.tsx    Ask Pablo AI chat overlay
components/HudBar.tsx        Top HUD — lang toggle, status info
components/TabNav.tsx        Tab navigation for portfolio sections
components/StatsSection.tsx  Bio / character stats
components/SkillsSection.tsx Tech skills as XP bars
components/QuestsSection.tsx Work experience as quests
components/ItemsSection.tsx  Projects as collectible items
app/api/chat/route.ts       POST endpoint for Anthropic chat
i18n/request.ts             next-intl request config (cookie-based locale)
messages/en.json             English translations
messages/es.json             Spanish translations
data/                        (future) Content data files
```

## Open questions

1. **Pixel cursor asset** — Currently using an inline SVG data URI. Should we create a proper
   `.cur` or `.png` cursor file in `public/` instead?
2. **Content data files** — The `data/` directory is empty. Need to decide structure for skills,
   quests, items data (JSON? TS objects?) before implementing section components.
3. **Chat streaming** — Should the Anthropic API response stream tokens to the client, or return
   the full response at once? Streaming gives better UX but adds complexity.
4. **Locale persistence** — Currently reading locale from a cookie. Need to implement the
   cookie-setting logic in `HudBar` when the lang toggle is clicked.
5. **OG image** — No `opengraph-image` asset exists yet. Should generate one matching the retro
   RPG theme for social sharing.

   ## Open questions

1. **Pixel cursor asset** — DECIDED: use a .png file in public/. 
   16x16 pixel sword cursor. Create during polish phase.

2. **Content data files** — DECIDED: TypeScript objects in data/ folder.
   One file per section: data/skills.ts, data/quests.ts, data/items.ts.
   Each exports a typed array. Types defined in types/index.ts.

3. **Chat streaming** — DECIDED: yes, stream tokens. The character-by-character
   UX matches the RPG dialogue box aesthetic perfectly.

4. **Locale persistence** — DECIDED: cookie-based, implement in HudBar 
   when lang toggle is clicked.

5. **OG image** — DECIDED: backlog, do last before final deploy.