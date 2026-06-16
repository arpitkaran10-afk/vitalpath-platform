# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From monorepo root
npm run dev           # Start all apps via Turborepo
npm run build         # Build all apps
npm run lint          # Lint all apps
npm run check-types   # Type-check all apps
npm run format        # Prettier format all TS/TSX/MD files

# Web app only (port 4001)
cd apps/web && npm run dev
cd apps/web && npm run check-types   # next typegen + tsc --noEmit

# Mobile app
cd apps/mobile && npm start
npx expo start --web                 # Run in browser

# Turborepo filter (run one app)
npx turbo dev --filter=web
npx turbo build --filter=web
```

There are no tests currently.

## Architecture

**Turborepo monorepo** with two apps (`apps/web`, `apps/mobile`) and shared packages (`packages/types`, `packages/programme`).

### Web app (`apps/web`) — Next.js 16 App Router, port 4001

- `app/layout.tsx` — root metadata/fonts
- `app/(app)/layout.tsx` — **app shell**: fixed 56px top header, full-width (no sidebar at any breakpoint), global `HealthConciergeModal` (FAB + bottom-sheet). `HAS_COACHING` constant at top toggles coaching-tier conditional sections.
- `app/(app)/today/page.tsx` — **primary page, ~7300+ lines, intentionally monolithic**. All tab content (`OverviewContent`, `Month1Content`, `Month2Content`, `LockedMonthContent`, `JourneyIndicator`, `MonthTransformationStory`, etc.) lives here as local functions. Do not split.
- `app/(app)/progress/page.tsx`, `community/page.tsx`, `journey/page.tsx` — secondary pages, each with a sticky back header (`top: 56px`, `ChevronLeft` + "Overview" → `/today`).
- `app/(app)/components/` — small shared components (`HabitCheckbox`, `CircularProgress`, `PhaseCard`). `BottomNav.tsx` exists but is not rendered — navigation was removed.
- Stub routes (`/habits`, `/meals`, `/steps`, `/sleep`) redirect to `/today`.

### Shared packages

- `@health-coaching/types` — all core TypeScript interfaces (`MemberProfile`, `HabitEntry`, `MealEntry`, `StepEntry`, `SleepEntry`, `DailyLog`, `ProgrammePhase`)
- `@health-coaching/programme` — `PROGRAMME_PHASES`, `DEFAULT_DAILY_HABITS`, `STEP_GOALS`, `SLEEP_GOAL_HOURS`, `getCurrentPhase()`, `getMonthFromStartDate()`

### Mobile app (`apps/mobile`) — Expo 56 / React Native 0.85

Independent from the web app. Shares types and programme data via packages but uses React Native components. MD3-inspired design tokens in `src/theme/index.ts`. Bottom tab navigator with 5 tabs.

## Key conventions

**Styling:** Inline styles are the primary approach in the web app (not Tailwind classes). Tailwind is only used in `globals.css` for base resets. This is intentional for portability and specificity.

**Desktop layout:** Activates at `≥1024px`. CSS utility classes follow prefixed naming conventions: `ov-*` for Overview page grids, `m2-*` for Month 2 grids, `lm-*` for locked month grids, `dt-*` for generic desktop utilities. Mobile-only sections use `ov-mobile-only`; desktop-only use `ov-desktop-only`.

**Navigation pattern:** No bottom nav. `/today` is the hub. Secondary pages (Progress, Community, Journey) are reached via dark forest gradient nav cards appended to carousels on the Overview page, and return via the sticky "← Overview" header pattern.

**Month naming:** Every month has a member-friendly title (dominant h2) and a clinical label (11px, muted/faint). Never make the clinical name the primary heading.

**Data:** All mock data, hardcoded. No backend or auth. Demo persona is Priya, Month 2, Day 14, moderate risk.

**Unbuilt routes:** `/goals`, `/meal-plan`, `/meal-plan/coach`, `/progress/selfie`, `/progress/biomarkers`, `/coach/message`, `/ai-coach`, `/ask`, `/briefing`, `/briefing/subscribe` — these are modal CTAs that don't have pages yet.

## Design tokens (web)

```css
--color-sage: #6B8F71        /* primary green */
--color-warm: #F5ECD7        /* warm background tint */
--color-terracotta: #C8604A  /* accent orange-red */
--color-gold: #D4A843        /* accent gold */
--color-ink: #1C2B1E         /* primary text */
--color-muted: #6B7B6E       /* secondary text */
--color-surface: #FAFAF8     /* page background */
--color-card: #FFFFFF
--color-border: #E8EDE9
```

Dark cards use `linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)`.

Typography: eyebrow = 10px/700/uppercase/sage, heading = 20px/800/ink, body = 13–14px/400–500.
