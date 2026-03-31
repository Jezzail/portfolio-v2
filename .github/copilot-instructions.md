# Pablo Abril — Portfolio Project

## Who I am
Senior Frontend / React Native Engineer. Spanish, based in Seoul, South Korea.
10+ years experience. Currently sole FE engineer on TABA, a live React Native 
taxi app with 60,000+ downloads. Looking for Senior Frontend or Tech Lead roles.
Born 1988. Gamer since the 8-bit era. Design-minded developer.

## What this project is
Personal portfolio at patportfolio.dev — built with Next.js 16 App Router, 
TypeScript, Tailwind CSS, Framer Motion, next-intl. Deployed on Vercel.

Key feature: "Ask Pablo" — AI chat widget using Anthropic API 
(claude-sonnet-4-20250514) that answers questions about me using 
pablo-context.md as its knowledge base.

## Visual design
Retro RPG / 16-bit game aesthetic. Think SNES save screen meets character 
sheet. Reference: joe8lee.com for personality, but retro game execution.

Design tokens (use these EXACTLY, never deviate):
- Background: #0a0a1a
- Surface: #0e0e28
- Border: #2a2a5a
- Border active: #f0d060
- Accent gold: #f0d060
- Accent green: #60d0a0
- Accent blue: #6090f0
- Text primary: #e8e8d0
- Text muted: #8080b0
- Text dim: #3a3a6a

Font: "Press Start 2P" from Google Fonts — used for ALL text, no exceptions.
No border-radius anywhere — 0px, always. Pixel aesthetic means sharp corners.
All borders: 2px solid. Never 1px, never 3px.
image-rendering: pixelated on any pixel assets.
CRT scanline overlay: repeating-linear-gradient on a fixed ::after pseudo-element.

Note: These visual rules (Press Start 2P everywhere, no border-radius, 2px borders, pixelated images, etc.) describe the **target/future-state** design system.
The current template code (e.g., usage of `rounded-full` and Geist/Arial in `app/layout.tsx` and `app/globals.css`) may still violate these rules.
When modifying or adding UI code, do **not** assume the existing styles already conform; instead, avoid introducing new deviations and, where practical, refactor touched areas toward these target constraints without breaking existing layout/behavior.
## Architecture — CRITICAL, read carefully
Target architecture: this should be a SINGLE PAGE APP. No routing, no navigation between pages.
The goal is for the entire portfolio to live in one page (app/page.tsx), with React state controlling 
which "screen" is visible instead of using multiple routes.

When implementing or refactoring app/page.tsx, follow this target flow with three screens, all rendered in the DOM with visibility controlled by state:
1. TitleScreen — game title screen with save slot and PRESS START
2. PortfolioScreen — the main portfolio, tabbed RPG menu
3. ChatScreen — the Ask Pablo AI chat (opens as overlay on top of the portfolio)

Tabs in PortfolioScreen (these are the section names, keep them):
- STATS → about me, bio, personal info
- SKILLS → tech skills as RPG XP bars with LVL numbers
- QUESTS → work experience as completed quests
- ITEMS → projects as collectible items
- ASK PABLO → opens ChatScreen overlay

## i18n
next-intl handles English / Spanish. All user-facing strings live in:
- messages/en.json  ← exists, add new keys here
- messages/es.json  ← exists, mirror every key with Spanish translation
Language toggle in the HUD — EN / ES pill toggle.
NEVER hardcode user-facing strings in components. Always use useTranslations().
When adding a new UI string, add it to BOTH files before using it in a component.

## Code conventions — NON NEGOTIABLE
- App Router only. Never use Pages Router patterns.
- Server components by default. Add "use client" only when component needs 
  useState, useEffect, event handlers, or Framer Motion.
- One component per file. Named exports only, no default exports except 
  for page.tsx and layout.tsx.
- Tailwind for all styling. No CSS modules. No inline style= except for 
  dynamic values that Tailwind cannot handle.
- All API routes in app/api/
- All components in components/
- All types in types/
- All content/data in data/ (never hardcode content in components)
- No any in TypeScript. Strict mode is on.

## Environment variables
ANTHROPIC_API_KEY — never expose client side, only used in API routes.
Add to .env.local (already in .gitignore), never commit it.

## What to never do
- Never use Pages Router
- Never use react-helmet (use Next.js Metadata API)
- Never add border-radius
- Never hardcode colors outside of Tailwind config
- Never hardcode strings outside of messages/ files
- Never expose ANTHROPIC_API_KEY to the client
- Never install unnecessary dependencies without asking first