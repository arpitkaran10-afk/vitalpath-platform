# VitalPath — Complete Codebase Reference

> Feed this file to any AI assistant (ChatGPT, Claude, Gemini, etc.) to give it full context about the VitalPath project before asking questions or requesting code changes.

---

## 1. Product Overview

**VitalPath** is a 6-month preventive health coaching platform targeting individuals with metabolic risk (pre-diabetes, diabetes, hypertension, obesity). The product guides members through a structured transformation journey with daily habit tracking, biomarker monitoring, coach communication, and community support.

**Core value proposition:** Sustainable behaviour change through a personalised, coach-led 6-month programme — not a quick fix.

**Target user:** Indian adults (35–60) with moderate-to-high metabolic risk, newly diagnosed or at risk of type 2 diabetes, hypertension, or obesity.

**Demo member:** Priya, Month 2, moderate risk category, assigned to Dr. Ananya Rao.

---

## 2. Repository Structure

```
health-coaching-platform/          ← Turborepo monorepo root
├── apps/
│   ├── web/                       ← Next.js 16 web app (primary product)
│   ├── mobile/                    ← Expo 56 React Native app
│   └── docs/                      ← Documentation app (stub)
├── packages/
│   ├── types/                     ← Shared TypeScript interfaces
│   ├── programme/                 ← 6-month programme data & logic
│   ├── ui/                        ← Shared React components (stub)
│   ├── eslint-config/             ← Shared ESLint config
│   └── typescript-config/         ← Shared TS config
├── turbo.json                     ← Turborepo pipeline config
└── package.json                   ← Root workspace config
```

---

## 3. Tech Stack

### Web App (`apps/web`)
| Concern | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5.9 |
| React | 19.2 |
| Styling | Tailwind CSS 4.3 + inline styles |
| Animation | Framer Motion (layout) |
| Icons | Lucide React |
| Fonts | System stack (web), Google Fonts planned |
| Dev port | **4001** |

### Mobile App (`apps/mobile`)
| Concern | Technology |
|---|---|
| Framework | Expo 56 / React Native 0.85 |
| Language | TypeScript 6 |
| Navigation | React Navigation (Bottom Tabs) |
| Charts | react-native-svg |
| Safe areas | react-native-safe-area-context |

### Monorepo
| Concern | Technology |
|---|---|
| Build orchestration | Turborepo |
| Package manager | npm workspaces |

---

## 4. Shared Packages

### `@health-coaching/types` (`packages/types/index.ts`)

All core data model interfaces:

```typescript
type RiskCategory = 'low' | 'moderate' | 'high';
type ProgrammeMonth = 1 | 2 | 3 | 4 | 5 | 6;

interface ProgrammePhase {
  month: ProgrammeMonth;
  name: string;
  focus: string;
  description: string;
  keyInterventions: string[];
  goals: string[];
  outcomes: string[];
}

interface HabitEntry {
  id: string;
  date: string;          // ISO date
  category: 'nutrition' | 'activity' | 'sleep' | 'stress' | 'gut';
  name: string;
  completed: boolean;
  notes?: string;
}

interface MealEntry {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  proteinRating: 1 | 2 | 3 | 4 | 5;
  fibreRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface StepEntry {
  id: string;
  date: string;
  steps: number;
  goal: number;
  activeMinutes?: number;
}

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;       // HH:MM
  wakeTime: string;      // HH:MM
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  currentMonth: ProgrammeMonth;
  startDate: string;
  riskCategory: RiskCategory;
}

interface DailyLog {
  date: string;
  habits: HabitEntry[];
  meals: MealEntry[];
  steps?: StepEntry;
  sleep?: SleepEntry;
}
```

---

### `@health-coaching/programme` (`packages/programme/index.ts`)

Programme data and helper functions.

**Exports:**

#### `PROGRAMME_PHASES: ProgrammePhase[]`

The package retains clinical names. The web UI uses member-friendly names (see §6 naming system below).

| Month | Clinical Name | Member-Friendly Name | Focus |
|---|---|---|---|
| 1 | Awareness & Baseline Correction | **Know Your Health** | Risk Identification & Nutrition Foundations |
| 2 | Foundation Building | **Build Healthy Habits** | Physical Activity & Nutrition Consistency |
| 3 | Metabolic Correction | **Sleep Better, Feel Better** | Sleep & Glycaemic Management |
| 4 | Optimisation & Integration | **Stress Less, Feel Better** | Stress & Mental Wellbeing |
| 5 | Sustainability & Transition | **Make It Stick** | Gut Health & Behaviour Sustainability |
| 6 | Consolidation & Performance | **Your New Normal** | Biomarker Tracking & Long-Term Maintenance |

#### `DEFAULT_DAILY_HABITS: Record<ProgrammeMonth, string[]>`

5–6 habits per month, progressive difficulty.

#### `STEP_GOALS: Record<ProgrammeMonth, number>`

```
Month 1: 5,000  |  Month 2: 7,000  |  Month 3: 8,000
Month 4: 8,500  |  Month 5: 9,000  |  Month 6: 10,000
```

#### `SLEEP_GOAL_HOURS = 7.5`

#### Helper functions
```typescript
getCurrentPhase(month: ProgrammeMonth): ProgrammePhase
getMonthFromStartDate(startDate: string): ProgrammeMonth
```

---

## 5. Web App (`apps/web`)

### File Structure

```
apps/web/
├── app/
│   ├── layout.tsx                 ← Root layout (fonts, metadata)
│   ├── globals.css                ← CSS variables + Tailwind + dt-* desktop utilities
│   ├── page.tsx                   ← Root redirect → /today
│   └── (app)/                     ← App route group
│       ├── layout.tsx             ← App shell (header, FAB — no sidebar)
│       ├── today/page.tsx         ← Main dashboard (7300+ lines, intentionally monolithic)
│       ├── progress/page.tsx      ← Biomarker tracking + charts
│       ├── community/page.tsx     ← Member success stories
│       ├── journey/page.tsx       ← Transformation documentary page (secondary)
│       ├── habits/page.tsx        ← Redirects → /today
│       ├── meals/page.tsx         ← Redirects → /today
│       ├── steps/page.tsx         ← Redirects → /today
│       ├── sleep/page.tsx         ← Redirects → /today
│       └── components/
│           ├── HabitCheckbox.tsx
│           ├── BottomNav.tsx      ← exists but not rendered (bottom nav removed)
│           ├── CircularProgress.tsx
│           └── PhaseCard.tsx
```

### Design Tokens (`globals.css`)

```css
/* Brand colours */
--color-sage: #6B8F71           /* Primary green */
--color-sage-light: #A8C5AC
--color-sage-dark: #4A6E50
--color-warm: #F5ECD7           /* Warm background tint */
--color-warm-mid: #EDD9B0       /* Mid warm tint */
--color-terracotta: #C8604A     /* Accent orange-red */
--color-terracotta-light: #E8907E
--color-gold: #D4A843           /* Accent gold */
--color-gold-light: #F0C96A
--color-ink: #1C2B1E            /* Primary text */
--color-muted: #6B7B6E          /* Secondary text */
--color-surface: #FAFAF8        /* Page background */
--color-card: #FFFFFF
--color-border: #E8EDE9
```

### App Shell Layout (`(app)/layout.tsx`)

- **Fixed top header** (56px): VitalPath brand, "Complete Profile (2/3)" badge, message + settings buttons
- **Right sidebar** — **REMOVED**. Desktop is full-width at all breakpoints. No sidebar in the app shell.
- ~~Mobile bottom nav~~ — **removed**. Navigation to Progress and Community is contextual via carousel nav cards in the Overview page.
- **`HealthConciergeModal`** — Global floating action button + premium modal. FAB: fixed bottom-right (`24px` from edges), `z-index: 300`, sage green 60px circle with `Sparkles` icon and "Continue Your Journey" tooltip. Backdrop: `z-index: 400`, radial vignette on desktop. Modal: `z-index: 401`. Backdrop tap dismisses. No toggle-on-FAB.

**State:** `open`, `isDesktop` (matchMedia `≥1024px`), `isWideDesktop` (matchMedia `≥1280px`). Both media queries are event-listener driven so they react to resize.

**`HAS_COACHING` constant** at top of file — `true` for demo. Replace with real entitlement check to toggle conditional sections.

**Mobile modal (unchanged):**
- Spring animation: `type: 'spring', damping: 28, stiffness: 280`
- Backdrop: `rgba(8,16,10,0.72)` + `backdropFilter: blur(8px)`
- Panel: `height: 88vh`, `borderRadius: 24px 24px 0 0`, `background: #F7F6F2`
- Drag handle pill at top, scrollable body with 7 sections in single column

**Desktop modal (1024px+):**
- Animation: fade + scale only (`opacity: 0→1, scale: 0.96→1`) — no bottom-sheet slide
- Outer wrapper: `position: fixed inset: 0`, flex centering, `pointerEvents: none`
- Panel: `width: min(92vw, 1400px)`, `height: min(85vh, 900px)`, dark forest background `linear-gradient(155deg, #0f1e11 → #0c1218)`, `border-radius: 28px`, `overflow: clip` (not `hidden` — preserves scroll), `transform: translateZ(0)` + `willChange: transform` for GPU compositing
- Single scroll wrapper inside body (`overflowY: auto`, `willChange: transform`) — **not** two independent scroll columns
- Grid inside: `65fr 35fr` at ≥1280px, `1fr 1fr` at 1024–1279px
- Backdrop: radial vignette `radial-gradient(ellipse at 50% 50%, rgba(8,20,12,0.76) → rgba(4,10,6,0.86))` + `blur(8px)`
- Dark forest header: Sparkles icon + "Health Command Center" title + X close button

**Desktop left column:** Transformation Story Hero (360px fixed height, cinematic dark gradient, stat pills, "Continue Story" CTA) → Goals + Progress Hub (2-col `1fr 1fr` row, each 220px) → Health Briefing (natural height, dark gold treatment)

**Desktop right column:** Ask Me Anything (240px, aurora dark card, strong AI presence) → Meal Planning (220px, gold warm gradient) → Support (220px, dark coaching/AI variant)

**Desktop card heights:** Story 360px · Ask 240px · Goals 220px · Meal 220px · Support 220px · Progress Hub 220px (two 110px inner cards)

**All 7 sections — content and routes:**
| # | Section | Desktop style | Route |
|---|---|---|---|
| 1 | YOUR TRANSFORMATION STORY | Dark forest cinematic (left col, hero) — `#1f3526 → #0d1f14` gradients, stat pills, white CTA | `/journey` |
| 2 | UPDATE MY HEALTH GOALS | Light sage card (left col, 2-col row) — `#f0f7f1 → #e6f0e8`, Target icon, "Update Goals" CTA pinned to bottom | `/goals` |
| 3 | PROGRESS HUB | Dark forest card (left col, 2-col row) — `#0d1a10 → #162112`, header "Track Your Progress", 2 inner cards: Upload Progress Selfie (brown gradient, Camera) + Log Biomarkers (navy gradient, Activity) | `/progress/selfie`, `/progress/biomarkers` |
| 4 | YOUR PERSONAL HEALTH BRIEFING | Dark forest card (left col, full width) — `#1e2e1f → #162318`, gold Mail icon, "Subscribe" + "View Previous Editions" CTAs | `/briefing/subscribe`, `/briefing` |
| 5 | ASK ME ANYTHING | Aurora dark card (right col top) — `#090f08 → #0c0910`, green/purple aurora glows, Sparkles icon | `/ask` |
| 6 | PERSONALISED MEAL PLAN | Gold warm card (right col mid) — `#FBF6EE → #F6EDD9`, Utensils icon — conditional: "Consult My Coach" if `HAS_COACHING`, else "Create My Plan" | conditional |
| 7 | SUPPORT | Dark coaching card (right col bottom) — sage gradient if `HAS_COACHING`, purple if not; Message/Bot icon — conditional CTA | conditional |

**Icon imports in layout.tsx:** `Settings`, `MessageCircle`, `Sparkles`, `X`, `Target`, `Camera`, `Activity`, `Bot`, `Utensils`, `BookOpen`, `ArrowRight`, `Mail`

**Main content padding-bottom:** `40px`. No sidebar at any breakpoint.

---

## 6. Today Page (`today/page.tsx`)

The most complex page. Uses `useSearchParams` to set the active tab, wrapped in `<Suspense>`.

### Tab System

```typescript
type TabId = 'overview' | 'month1' | 'month2' | 'month3' | 'month4' | 'month5' | 'month6';
```

| Tab | Status | Content |
|---|---|---|
| Overview | — | Main dashboard |
| Month 1 | completed (green dot) | Demo toggle: Active state OR Completed state |
| Month 2 | active (gold dot) | In-progress month screen |
| Month 3–6 | locked (lock icon) | Full future-month preview experiences |

Tab is set via `?tab=month2` query param. Active tab underline uses sage green.

### Tab Bar Styling
- Sticky at `top: 56px`, `z-index: 99`
- Backdrop blur `rgba(250,250,248,0.95)`
- Active: `border-bottom: 2px solid var(--color-sage)`, `color: var(--color-sage)`

---

### Overview Tab (`OverviewContent`)

**State:**
```typescript
const [activeFilter, setActiveFilter] = useState('Fitness');
const [showSetup, setShowSetup] = useState(true);
const [habitsChecked, setHabitsChecked] = useState([false, false, false, false, false]);
```

**Sections (top to bottom):**

1. **Hero** (290px) — Lifestyle photo with two-layer gradient, programme context pill ("Day 14 of 30 · Build Healthy Habits"), animated pulsing dot, greeting (`Good morning/afternoon/evening, Priya`), day-of-week subtitle. Above the progress bar: **"Your Health Goal" section** — 9px uppercase eyebrow + two glassmorphism pills in a horizontal row: 🔥 Reverse Diabetes (terracotta icon bg) and ⚖️ Lose Weight (sage icon bg). Pills use `rgba(255,255,255,0.08)` bg + `blur(12px)` + thin white border + `border-radius: 999px`. Each pill has a Framer Motion entrance (opacity 0→1, y 8→0, staggered 0.15s / 0.25s) and a separate icon breathing animation (y: 0→−2→0, 4s, Infinity). Inline 47% month progress bar below.

2. **Journey Indicator** — 6-node stepper showing Discover (✓ sage) → Build (active, dark, ring shadow) → Restore/Balance/Sustain/Thrive (locked, border only). Clicking any node swaps the chapter card beneath via `AnimatePresence`. Connected by sage/border lines. See `JourneyIndicator` component below for chapter card detail.

3. **My Transformation Journey** — `TransformationJourney` component. Hero card (340px, animated photo swap, Framer Motion), Success Blueprint card, Transformation Timeline (7 slots) with **"Capture Today's Win"** primary CTA (sage green, pill shape, `Camera` icon) at the bottom of the card, Future Self Preview card, Journey Destination CTA → `/journey`. The "Your Personalised Nutrition Plan" / Meal Planning card (SECTION 3) has been **removed** from this component.

3b. **Biomarker Progress Showcase** — `BiomarkerProgressShowcase` inserted immediately after `TransformationJourney` in the mobile Overview layout (inside `ov-mobile-only`). Hidden on desktop (the entire `ov-mobile-only` wrapper is `display: none` at ≥1024px).

3c. **Nutrition Strategy** — `NutritionStrategyCard` (`variant="default"`) inserted in the mobile Overview layout directly after `BiomarkerProgressShowcase` and before Today's Focus. Wrapped in `padding: '20px 24px 0'` with a "Your Nutrition" sage eyebrow label. Follows the narrative flow: Transformation → Health Progress → **Nutrition** → Daily Actions.

4. **Today's Focus Card** — Dark forest gradient card (`#1C2B1E → #3A5C3E`), gold `Target` icon, "Hit 7,000 steps before dinner", 74% gold progress bar, frosted step count chip showing 5,240/7,000.

5. **Setup Banner** (dismissable) — Slim gold-tinted strip: "Upload your baseline labs", `×` close button.

6. **Health Overview** — Eyebrow "TODAY AT A GLANCE", horizontal scroll carousel of `MetricCard` components **plus a final nav card**:
   - Steps: Poor badge, 5,240 steps, −1,760 vs goal
   - Sleep: Fair badge, 6.5 hrs, −1 hr vs target
   - Nutrition: Good badge, 1/3 meals, +2 meals to log
   - **"View Your Progress" nav card** — dark forest gradient card, `TrendingUp` icon, links to `/progress`.

7. **Personal Patterns** — Two full-width white cards with icon chip (sage/gold), category label, bold inline text pattern.

8. **Health Programme** — Eyebrow "MONTH 2 · BUILD HEALTHY HABITS", habits checklist card + 2×3 grid of `WorkflowCard` components.

9. **Explore Health Topics** — 5 filter pills, 3 question rows with chevrons.

10. **Member Success Stories** — Horizontal scroll carousel of 3 story cards **plus a final nav card** linking to `/community`.

11. **Coach Message** — White card, Dr. Ananya avatar with green online dot, message text.

12. **Journey Summary Footer** — Dark forest card, 6-node mini stepper, 3 stats: 42/180 days, 23% complete, 14-day streak.

---

### `JourneyIndicator({ dark?: boolean })` — Programme Stepper + Chapter Card

State: `selectedPhase` (1–6, defaults to 2).

**Stepper row:** 6 nodes connected by lines. Completed = sage filled ✓, Active = ink filled with ring shadow, Locked = transparent border. Clicking any node sets `selectedPhase` and swaps the chapter card below via `AnimatePresence`.

**Chapter card** — premium chapter cover experience with `AnimatePresence` spring transition on phase change. Each month has a distinct visual identity via a `CHAPTER_DESIGNS` record.

*Section 1 — Chapter Hero (gradient cover):*
- Deep dark gradient unique to each month (see table below)
- **Three layered Framer Motion glows** — slow-breathing radial orbs at top-right (7s), bottom-left (9s, delay 2s), and centre (5s, delay 1s) using `animate={{ y/opacity }}` with `repeat: Infinity`
- Frosted glass month badge (`MONTH X OF 6`) + frosted status badge with `backdropFilter: blur(10px)`. Active status gets green pulse dot `#7FFFA0`
- Chapter icon: 52×52 glassy container, distinct `Lucide` icon per month
- Eyebrow: `Chapter X · {journeyLabel}` in the month's `taglineColor`
- **Chapter title**: `phase.title` (full member-friendly name e.g. "Build Healthy Habits"), 30px/900, white, `textShadow`
- Tagline: `phase.tagline`, 13px/400, in the month's `taglineColor`

*Section 2 — Focus pills strip:*
- Thin border in `theme.tileBorder`, `16px 20px 18px` padding
- `YOUR FOCUS THIS CHAPTER` eyebrow
- Wrapping horizontal pill badges (inline-flex), each: emoji icon + label in `theme.accent` colour, tinted `theme.iconBg` background

**`CHAPTER_DESIGNS`** (keyed 1–6, defined inside `JourneyIndicator`) — each has: `heroGradient`, `glow1/2/3` (radial gradient strings), `iconBg`, `IconComponent` (Lucide), `iconColor`, `taglineColor`.

| Month | Title | Icon | Palette |
|---|---|---|---|
| 1 | Know Your Health | Sparkles | Warm amber → champagne gold (`#2A1400 → #D4A84A`) |
| 2 | Build Healthy Habits | TrendingUp | Deep forest → sage (`#071710 → #4E8A5E`) |
| 3 | Sleep Better, Feel Better | Moon | Midnight → indigo (`#040A18 → #2E5490`) |
| 4 | Stress Less, Feel Better | Brain | Deep violet → lavender (`#100A22 → #6E62AA`) |
| 5 | Make It Stick | Target | Forest → olive (`#09110A → #4E7252`) |
| 6 | Your New Normal | Star | Bronze → gold (`#180E00 → #B8840E`) |

**`PHASE_DATA`** (6 entries) — each has: `num`, `label`, `journeyLabel`, `tagline`, `title`, `icon`, `status`, `focus[]`, `outcome`, `tiles[]` (each tile: `icon`, `label`, `desc`).

**`MONTH_THEMES`** (keyed 1–6) — each has: `gradFrom`, `gradTo`, `accent`, `tileBorder`, `iconBg`. Used for focus pill colours in Section 2.

**`CHAPTER_STORY_DATA`** (keyed 1–6) — drives `MonthTransformationStory` copy. Each entry: `chapterNum`, `chapterName`, `headline`, `copy`, `primaryCta`, `secondaryCta`, `reflectionPrompt`, `futureCopy`, `mealHeading`.

**`BPS_METRIC_DATA`** — array of 6 metric objects powering `BiomarkerProgressShowcase` and `BpsChart`. Same value series as `METRIC_DATA` in `progress/page.tsx`. Each entry: `key`, `label`, `current`, `unit`, `change`, `changeDirection ('up'|'down')`, `insight` (1-sentence health copywriting), `values[6]`, `loggedCount` (2), `gradient` (card bg), `glow` (radial overlay), `accent`, `accentDim`, `lineColor`, `areaStop`. Metrics: Weight · Blood Pressure · Waist · Glucose · Activity · Sleep.

**`BPS_KPI_CHIPS`** — array of 4 objects for the animated KPI pills strip. Each entry: `label`, `value` (magnitude string), `icon` (↓/↑), `color`, `bg`, `border`. Metrics: Weight ↓3kg · BP ↓8mmHg · Waist ↓4cm · Glucose ↓11mg/dL.

**`STORY_HEADER_DESIGN`** (keyed 1–6) — per-month visual identity for the `MonthTransformationStory` header. Each entry: `gradient`, `glow1`, `glow2`, `accent`, `sub`, `ringFrom`, `ringTo`.

**`STORY_MILESTONES`** (keyed 1–6) — per-month 2×2 achievement data for the Journey Highlights grid in `MonthTransformationStory`. Each milestone: `icon`, `label`, `value`.

---

### Shared Sub-components

#### `MiniBarChart({ bars, color })`
- `display: flex`, `height: 40px`
- Last bar is full `color`, others are `color + '55'` (55% opacity)

#### `Badge({ label, type })`
- `type: 'poor' | 'fair' | 'good'`
- poor: red `#FEE2E2 / #DC2626`
- fair: amber `#FEF3C7 / #D97706`
- good: green `#DCFCE7 / #16A34A`

#### `MetricCard`
Props: `title, badge, badgeType, description, bars, barColor, mainValue, comparison, comparisonColor, encouragement`

Layout order (top → bottom): label + badge → **28px bold value** → comparison → chart (40px) → coach guidance (italic, separated by hairline).

#### `WorkflowCard({ imgSrc, icon, title, description })`
- 16px radius, 100px image with dark gradient overlay
- Hover: `translateY(-2px)`, elevated shadow
- Icon + title row, 11px description

#### `ArticleCard({ imgSrc, title, sources })`
- 260px wide, 20px radius, 160px image
- Heart + Bookmark icons

---

### Month 1 Tab (`Month1Content`)

Contains a **demo toggle** ("Active" / "Completed") at the top using `useState<'active' | 'completed'>('active')`. Renders either `Month1ActiveContent` or `Month1CompletedContent`.

`Month1Content` injects a `<style>` tag with all `m1-*` CSS classes. Both sub-components use the **dual-render architecture** (`m1-mobile-only` / `m1-desktop-only`). Desktop activates at 1024px+.

#### `Month1ActiveContent` — In-progress experience

**Mobile sections (7):** Hero (300px), Health Journey timeline, **My Transformation Story** (`MonthTransformationStory monthNum={1}`), What We've Learned 2×2 insights, Your Starting Point baseline grid, Mission cards, Month 2 Preview image.

**Desktop sections (5) — `m1-dt-*` classes:**

1. **Discovery Hero Workspace** (`m1-dt-hero-workspace`, 65/35 grid, 600px min-height):
   - LEFT 65% (`m1-dt-hero-left`): Cinematic full-bleed hero, animated progress bar (Framer Motion width animation), 60px/900 "Know Your Health" title, "Continue Journey →" CTA.
   - RIGHT 35% (`m1-dt-hero-right`): Dark forest panel (`#071209 → #0f2014`), full Health Journey timeline in dark style — Done nodes show sage ✓, Active has white ring + "NOW" badge, Upcoming is faint. Animated background glow.

2. **My Transformation Story** — `MonthTransformationStory monthNum={1}` inserted between the hero workspace and the sage band. Full-width, full-colour, no wrapper constraints. Consistent with Month 2 and Months 3–6 placement.

3. **Understanding You Workspace** (`m1-dt-discovery-workspace`, 50/50 grid, sage-tinted `#EEF3EF` band):
   - LEFT 50%: "What We've Learned About You" — 2×2 insight cards at 24px padding with larger emoji.
   - RIGHT 50%: "Your Starting Point" — white card with 32px metric values in a 2×2 internal grid.

4. **Your Month 1 Mission** (white band, 5-column grid):
   - Each mission item is a vertical card with 64px icon tile, label, and task count. Interactive tap-to-complete preserved.

5. **Month 2 Preview** (cinematic full-bleed image banner, 480px min-height):
   - Left: 56px editorial "Month 2 / Build Healthy Habits" title with theme pills.
   - Right: Frosted glass "Complete Month 1 first" progress card showing Day 12/30 and 60% to unlock.

#### `Month1CompletedContent` — Completion celebration

**Mobile sections (7):** Identical to the pre-redesign layout — Hero, Achievement Badges + Coach Insight, Milestone Timeline, Month Summary, View Summary button, Month 2 Transition Card, Share Achievement Card.

**Desktop sections (5) — `m1-dt-*` classes:**

1. **Completion Hero** (520px min-height): Full-bleed cinematic image, 68px/900 "Know Your Health" title, gold "Month 1 Complete" badge, 100% animated progress bar.

2. **Achievement Workspace** (`m1-dt-achievement-workspace`, 70/30 grid, sage `#EEF3EF` band):
   - LEFT 70%: 4-column grid of large circular achievement badges (80px ring, 28px value).
   - RIGHT 30%: Dark forest Coach Insight card, full-height, with quote and Dr. Ananya attribution.

3. **Journey Reflection** (`m1-dt-reflection-workspace`, 60/40 grid, white band):
   - LEFT 60%: Milestone Timeline in a `var(--color-surface)` card — 7 steps with icons and descriptions.
   - RIGHT 40%: Month 1 Summary paragraph card + "View Month 1 Summary →" button.

4. **Next Chapter** (dark `#071209` band, 2-col grid):
   - LEFT: 52px editorial Month 2 copy with focus-area tiles grid.
   - RIGHT: Locked cinematic image card with frosted glass "Month 2 is waiting" overlay.

5. **Share Achievement** (`m1-dt-share-layout`, 60/40 grid, warm stone `#F0EDE6` band):
   - Centred dark forest card with 60/40 split — stats + share buttons (WhatsApp / Download / Copy link) left, trophy celebration panel right.

---

### Month 2 Tab (`Month2Content`) — Redesigned

**State:**
```typescript
const [goalChecked, setGoalChecked] = useState([true, true, false, false]);
const [photos, setPhotos] = useState<string[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
```

Additional local constant `HABIT_PILLARS` (5 items with `days`/`total` for progress bars). `goalChecked` drives both the habit pillar tap interaction and the original month goals toggle.

**Sections:**

1. **Hero** (300px) — Walking photo, "Month 2 · In Progress" pill, **"Build Healthy Habits"** h2, subtitle, clinical label "Foundation Building" in faint muted text, progress bar + **"83% Consistent"** pill in the hero bar row.

2. **Your Momentum** — 3 dark gradient cards in a flex row (different gradient per card): `+900 daily steps` / `82% meal adherence` / `14 day streak`. Large value first, minimal label.

3. **My Transformation Story** — `MonthTransformationStory monthNum={2}` (passes `photos`, `handleFileChange`, `fileInputRef`). Self-contained section — owns its own `#EEF3EF` background, padding, and "My Transformation Story" heading. See `MonthTransformationStory` above.

4. **Today's Mission** — 3 large action cards. First ("Log all meals") shown as done (ticked, struck-through). Remaining two ("Reach 7,000 steps" / "Drink 2L water") shown as unchecked.

5. **Building Your Habits** — 5 habit pillar cards. Each shows: 44px icon tile (turns sage ✓ on tap, driven by `goalChecked`), label, percentage, progress bar, microcopy + day count. Driven by `HABIT_PILLARS` data and `goalChecked` state.

6. **Your Progress So Far** — 2×2 tinted cards with trend arrows: Weight ↓ Trending / Waist ↓ Reducing / Energy ↑ Improving / Movement ↑ Increasing.

7. **This Month's Focus** — Horizontal scroll carousel, 5 tall portrait image cards (160px wide, 200px tall): Indian Plate / Daily Movement / Strength / Hydration / Cut Sugar. Edge-bleeds with negative margin.

8. **Month 2 Wins Like** — 2×2 white icon cards (centred layout): Weight Trend / Movement / Meal Consistency / Daily Routine.

9. **Month 3 Preview** — "Coming Next / Month 3 · Sleep Better, Feel Better", clinical label "Metabolic Correction", subtitle "Sleep. Recovery. Blood sugar optimisation.", 4 frosted tag pills. **`marginTop: 32px` (mobile only)** — creates visual separation from the "Month 2 Wins Like" section above.

---

### Future Month Tabs (Months 3–6, `LockedMonthContent`) — Redesigned

Renders from `FUTURE_MONTH_DATA` record (keyed 3–6). Each entry: `name` (member-friendly), `clinicalName`, `tagline`, `inspiration`, `unlockDate`, `daysAway`, `img`, `accentColor`, `accentBg`, `themes[]`, `previewSections[]` (icon + title + description), `projectedOutcomes[]`, `pillars[]`.

Uses the **dual-render architecture** (`lm-mobile-only` / `lm-desktop-only`). The `<style>` tag with all `lm-*` classes is injected inside the component. Desktop activates at 1024px+. Month 6 has full-colour hero (no desaturation) — all other months use `grayscale(50%) brightness(0.72)` on hero images and `grayscale(35%) opacity(0.88)` on body content.

**Mobile layout (unchanged):**
- **Hero** (280px) — grayscale image, lock pill with countdown, large h2 member-friendly name, tagline, clinical name, theme pills.
- **Body** — `filter: grayscale(40%); opacity: 0.85`. Quote card, "What this chapter contains" 4-card list, horizontal scroll pillar carousel, 2×2 outcome grid, Month 6 graduation card.
- **Transformation Story** — `MonthTransformationStory` full colour outside grayscale filter.
- **CTA** — Dark forest card: "Keep Building Momentum / Complete Month 2 to unlock." Outer padding div has **`marginTop: 32px` (mobile only)** — creates visual separation from the `BiomarkerProgressShowcase` section above.

**Desktop layout — `lm-dt-*` classes with per-month colour identity:**

`DT_PAL` record (keyed 3–6) provides per-month: `dark`, `mid`, `accent`, `accentRgb`, `text`, `heroGrad`, `heroGlow`, `sectionBg`.

| Month | Mood | Palette |
|---|---|---|
| 3 | Calm / Restorative | Midnight blues → indigo (`#040A18 → #1A3660`), `text: #A8C0E8` |
| 4 | Balanced / Focused | Deep violet → lavender (`#100A22 → #42357A`), `text: #C8C0F0` |
| 5 | Consistency / Mastery | Forest greens → olive (`#0A1509 → #2A4A2E`), `text: #A8C5AC` |
| 6 | Achievement / Graduation | Gold → bronze (`#18100A → #4A2E10`), `text: #F0C96A`, full colour (no desaturation) |

**Desktop sections (6):**

1. **Cinematic Chapter Hero** (`lm-dt-hero-workspace`, 70/30 grid, 620px min-height):
   - LEFT 70% (`lm-dt-hero-left`): Full-bleed image with per-month gradient + glow overlays. 62–72px editorial month name. Theme pills. Lock badge with countdown.
   - RIGHT 30% (`lm-dt-hero-right`): Dark panel in `pal.dark → pal.mid` gradient. Large 52px countdown number. Theme preview strips. Ambient radial glows.

2. **Chapter Preview Workspace** (`lm-dt-preview-workspace`, 35/65 grid, per-month `pal.sectionBg` band):
   - LEFT 35% sticky: Dark inspiration card (month gradient) with `"…"` quote as emotional anchor.
   - RIGHT 65%: 2×2 grid of preview section cards — icon, title, description per section.

3. **Transformation Pillars Gallery** (`lm-dt-pillars-gallery`, 4-column grid, white band):
   - All 4 pillar images at 280px height, hover lift (+4px translateY, deeper shadow). No horizontal scroll.

4. **Future Outcomes Dashboard** (`lm-dt-outcomes-row`, 4-column grid, per-month `pal.sectionBg` band):
   - Each outcome in a tall card: 56px accent-tinted icon tile, 32px/900 metric value.
   - Month 6 only: Bonus graduation card — 2-col dark forest layout with 44px "Programme Complete." headline and blurred 🏆 trophy.

5. **My Transformation Story** (full colour, `var(--color-surface)` background):
   - `MonthTransformationStory monthNum={monthNum}` — outside any desaturation filter.

6. **Keep Building Momentum** (cinematic full-bleed CTA banner, 440px min-height):
   - Per-month image, gradient overlay, 52px editorial "Complete Month 2 to unlock this chapter." heading with per-month accent colour on the action phrase. Lock countdown badge in accent colour.

**Unlock dates:** Month 3: Jul 9 2026 / Month 4: Aug 9 2026 / Month 5: Sep 9 2026 / Month 6: Oct 9 2026

---

## 7. Progress Page (`progress/page.tsx`)

**Navigation model:** Secondary experience. Accessed from the "View Your Progress" nav card in the Health Overview carousel (Overview desktop: "View health report →" link in Today's Focus card). Returns to `/today` via sticky back header.

**Architecture:** Dual-render — `pg-mobile-only` / `pg-desktop-only`. Desktop activates at 1024px+. All desktop CSS in an inline `<style>` tag using `pg-*` / `pg-dt-*` prefixes. Mobile is unchanged.

**State (shared between both renders):**
```typescript
const [activeMetric, setActiveMetric] = useState<MetricKey>('Weight');
const [photos, setPhotos] = useState<Photo[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
const loggedCount = 2; // Month 1 and 2 logged
```

**Metrics tracked:**

| Metric | Unit | Values (M1→M6) | Target |
|---|---|---|---|
| Weight | kg | 82→81.2→80.8→80.1→79.5→79.0 | 76 kg |
| Waist | cm | 94→93→92→91.5→90.5→90 | < 88 cm |
| Glucose | mg/dL | 108→104→100→97→94→91 | < 100 mg/dL |
| Blood Pressure | mmHg | 138→135→132→130→128→125 | < 120 mmHg |
| Cholesterol | mg/dL | 210→205→200→196→192→188 | < 200 mg/dL |
| Activity | steps/day | 3200→5240→6800→7500→8200→9000 | 8,000+ |

**`LineChart`** — mobile SVG component (300×120 viewBox). Solid polyline for logged months, dashed for projected, circles on all points.

**`LineChartLarge`** — desktop SVG component (760×280 viewBox). Area fill under logged line (`url(#pdtArea)` gradient), value labels above logged dots, 5 gridlines, 7px logged dots, 5px projected dots.

**Mobile sections (unchanged):** Sticky back nav, page title + 6-month tracker, metric selector pills, active metric card with `LineChart`, month-by-month summary cards (M1 completed, M2 active), photo gallery with upload, community teaser link.

**Desktop sections (5 banded):**

1. **Progress Hero** (dark forest `#0d1a10`, 580px min-height, sticky back nav in same band): 2-col grid. Left: 56px/900 editorial headline + programme pill + 3 stats (weight change, programme %, streak) with 36px values. Right: 6-month journey stepper (colour-coded nodes) + programme progress bar.

2. **Metric Intelligence Workspace** (white `#ffffff`): Metric tab row + `pg-dt-65-35` grid. Left: `LineChartLarge` inside `#FAFAF8` card with 52px current value. Right sticky: Metric Snapshot panel (Current / Target / Trend / Change rows + on-track CTA card) + Months Logged strip.

3. **Transformation Dashboard** (warm stone `#F0EDE6`): `pg-dt-3col` grid. Col 1: Month 1 completed dark forest card (gold stat value). Col 2: Month 2 active white card (sage border, progress bar, sage stat value). Col 3: Stacked locked month rows 3–6 (muted, "Locked" badge).

4. **Visual Transformation** (sage tint `#EEF3EF`): `pg-dt-photo-wall` 4-col grid. Placeholder SVGs for M1/M2, uploaded photos, dashed add-photo card. All wired to shared `fileInputRef` / `handleFileChange`.

5. **Future Trajectory** (dark gradient `#0d1a10 → #0c1218`): 3-col projection cards (first 3 metrics) — each shows current vs Month 6 value side-by-side with progress bar + trend. Bottom: community CTA banner (`See what others achieved →` → `/community`).

**Desktop CSS classes:**
| Class | Purpose |
|---|---|
| `pg-mobile-only` / `pg-desktop-only` | Visibility toggles |
| `pg-dt-inner` | `max-width: 1600px`, `padding: 0 64px` |
| `pg-dt-inner-pad` | Same + `72px` vertical padding |
| `pg-dt-65-35` | 65fr/35fr grid, `gap: 48px`, `align-items: start` |
| `pg-dt-3col` | 3-col grid, `gap: 24px` |
| `pg-dt-photo-wall` | 4-col grid, `gap: 20px` |
| `pg-dt-metric-tabs` | Flex wrap row for metric selector |
| `pg-dt-card-lift` | Hover lift (+3px, deeper shadow) |

---

## 8. Community Page (`community/page.tsx`)

**Navigation model:** Secondary experience. Accessed from the "View All Stories" nav card in the Member Success Stories carousel. Returns to `/today` via sticky back header.

**Architecture:** Dual-render — `community-mobile-only` / `community-desktop-only`. Desktop activates at 1024px+. All desktop CSS in an inline `<style>` tag using `cm-*` prefixes. Mobile is unchanged.

**State (shared between both renders):**
```typescript
const [activeFilter, setActiveFilter] = useState<FilterType>('All');
const [expandedStory, setExpandedStory] = useState<number | null>(null);
```

**Filter types:** `'All' | 'Month 1' | 'Month 2' | 'Month 3+' | 'Similar to me'`

**Stories (6 total):**

| id | Name | Month | Headline |
|---|---|---|---|
| 1 | Meera S. | 3 | Lost 4kg and reversed pre-diabetes in 3 months |
| 2 | Rajesh K. | 6 | Completed the full 6 months — here's what changed |
| 3 | Sunita P. | 2 | Two weeks in and already sleeping better |
| 4 | Arjun M. | 4 | Breathwork changed how I handle work stress |
| 5 | Preethi R. | 5 | I now read nutrition labels without thinking |
| 6 | Vikram D. | 6 | Before/after: 6 months of Foundation to Performance |

**`StoryCard`** — mobile card component (unchanged): 200px photo, name + month badge, headline, stats, expandable body text, "Read story →" / "Close story ↑" toggle.

**`DesktopStoryCard`** — desktop card component: 240px photo with gradient overlay + month badge (colour-coded: gold for M6, sage for M3+, blue for M1–2) + name/stats overlaid at bottom of image. Below: headline. On expand: pull-quote with sage left-border + stat pills. Hover lift animation.

**`featured`** constant — `STORIES[1]` (Rajesh K., id=2) — used as the featured transformation.

**Mobile sections (unchanged):** Sticky back nav, page title, filter pills, 2-col story grid, dark forest inspiration banner.

**Desktop sections (4 acts):**

**Act 1 — Community Hero** (dark cinematic `#0d1a10`, 600px min-height): Sticky back nav in same band. 2-col grid. Left: 60px/900 editorial headline "People like you are succeeding", 847-member cohort context, filter buttons embedded in hero (white active state on dark). Right: 3 impact stats (847 members, 94% improvement, 6 months) with 44px stat values.

**Act 2 — Featured Transformation** (warm stone `#F0EDE6`): `cm-65-35` grid. Left: `DesktopStoryCard` variant — 420px cinematic image with gradient overlay, stats pills, story body expands with quote block + "Read Full Story →" CTA (wired to `expandedStory` state). Right sticky: dark forest quote card + white Journey Summary panel (Duration / Weight / Key result / BP rows).

**Act 3 — Member Success Gallery** (white `#ffffff`): Section heading + inline filter chips (top-right). `cm-3col` grid of `DesktopStoryCard` components, all wired to shared `expandedStory` / `setExpandedStory` state. Empty state message when filter yields 0 stories.

**Act 4 — You Are Not Alone** (dark gradient `#0d1a10 → #0c1218`): Full-width centred layout. 52px/900 headline "You are not alone in this journey", 847-member cohort reference, large white "Keep going" CTA → `/today`.

**Desktop CSS classes:**
| Class | Purpose |
|---|---|
| `community-mobile-only` / `community-desktop-only` | Visibility toggles |
| `cm-inner` | `max-width: 1600px`, `padding: 0 64px` |
| `cm-inner-pad` | Same + `72px` vertical padding |
| `cm-65-35` | 65fr/35fr grid, `gap: 56px`, `align-items: start` |
| `cm-3col` | 3-col grid, `gap: 28px` |
| `cm-card-base` | Hover lift (+4px, `box-shadow` transition) |

---

## 9. Journey Page (`journey/page.tsx`)

**Navigation model:** Secondary experience. Reached via "View Your Complete Journey →" CTA in the `TransformationJourney` component (Overview tab). Returns to `/today` via sticky back header.

**Architecture:** Dual-render pattern — `journey-mobile-only` / `journey-desktop-only`. Desktop activates at 1024px+. All desktop CSS injected via inline `<style>` tag inside the page. All CSS classes use `jdt-*` prefix.

**Local constants:**

| Constant | Purpose |
|---|---|
| `DEMO_MOMENTS` | 5 timeline moments with coach guidance text |
| `REEL_MOMENTS` | 7 curated photo reel items |
| `MILESTONES` | 6 achievement milestone cards (icon + title + value) |
| `CHAPTERS` | 6 chapter objects with status, summary, achievements, img |
| `JOURNEY_MAP` | 6 milestone nodes for the transformation roadmap |

**Mobile sections (unchanged, top to bottom):**
1. Cinematic Hero — full-bleed image with overlays, sticky back header
2. Transformation Timeline — `DEMO_MOMENTS` milestone progression
3. Comparison Slider — before/after draggable slider (`ComparisonSlider`)
4. Journey Highlights — 2×2 milestone cards grid
5. Monthly Chapters — expandable chapter cards
6. Visual Memories Reel — horizontal scroll carousel with upload
7. Transformation Map — compact horizontal roadmap
8. Coach Reflection — dark forest quote card
9. Yearbook Finale — photo collage grid with copy overlay

**Desktop sections (premium documentary experience, 1024px+):**

Uses alternating section bands as distinct narrative "acts":

| Act | Section | Band | Content |
|---|---|---|---|
| Act I | Cinematic Hero | Dark cinematic (`#0d1a0f`) | 70/30 grid — editorial headline + glassmorphism progress card with animated ring |
| Act I | Timeline + Comparison | `#FAFAF8` surface | 55/45 grid — documentary timeline left, sticky comparison slider right |
| Act II | Journey Highlights | `#F0EDE6` warm stone | 3-column trophy achievement gallery (large values, icon tiles) |
| Act II | Visual Memories + Coach | `#EEF3EF` sage | 70/30 grid — photo wall left, sticky coach reflection right |
| Act III | Monthly Chapters | `#0d1a0f` dark forest | 3×2 chapter gallery — Netflix-style cover cards with cinematic overlays + expansion |
| Act III | Transformation Roadmap | `#ffffff` white | Full-width horizontal roadmap with large nodes, animated pulse on active step |
| Act IV | Yearbook Finale | Dark premium gradient | 700px+ full-bleed photo collage, 72px editorial headline, stat pills, CTAs |

**Desktop CSS class system (`jdt-*`):**

| Class | Purpose |
|---|---|
| `jdt-page` | Page shell |
| `jdt-section` | Full-width band |
| `jdt-section-surface/white/stone/sage/dark/darkforest/premium` | Band backgrounds |
| `jdt-inner` / `jdt-inner-pad` | 1600px max-width centred container with padding |
| `jdt-hero` | 720px cinematic hero |
| `jdt-hero-grid` | 70fr/30fr hero layout |
| `jdt-timeline-workspace` | 55fr/45fr — timeline + sticky slider |
| `jdt-timeline-sticky` | Sticky at `top: 128px` |
| `jdt-highlights-grid` | 3-column milestone gallery |
| `jdt-memories-workspace` | 70fr/30fr — photo wall + sticky coach |
| `jdt-coach-sticky` | Sticky at `top: 128px` |
| `jdt-photo-wall` | Magazine photo grid (3-col, 2-row, featured spans col 1–2) |
| `jdt-photo-wall-featured` | Featured photo slot — spans columns 1–2 in the photo wall grid |
| `jdt-chapters-grid` | 3-column chapter gallery |
| `jdt-roadmap-row` | Full-width horizontal roadmap flex row |
| `jdt-yearbook` | 700px+ full-bleed finale section |
| `jdt-yearbook-grid` | 3×2 absolute photo collage |
| `jdt-yearbook-content` | Relative content layer |
| `jdt-card-lift` | Hover lift animation (+4px, deeper shadow) |
| `jdt-eyebrow-*` | Eyebrow label colour variants |
| `jdt-h2-dark` / `jdt-h2-light` | 40px/900 section headings |

**`ComparisonSlider`** now accepts an optional `height` prop (default 340, desktop uses 420).

**State:** `expandedChapter` (number | null) added to control desktop chapter card expansion. Shares `uploads`, `editingId`, `fileRef` with mobile render.

---

## 10. Mobile App (`apps/mobile`)

### File Structure

```
apps/mobile/
├── App.tsx                        ← Root with NavigationContainer + Bottom Tabs
├── index.ts                       ← Expo entry
├── src/
│   ├── theme/index.ts             ← MD3-inspired design tokens
│   ├── data/index.ts              ← All mock data + types
│   ├── components/
│   │   ├── Card.tsx               ← Elevated / filled / outlined variants
│   │   ├── Chip.tsx               ← Filter chip
│   │   ├── MiniBarChart.tsx       ← 7-bar SVG-free chart
│   │   └── ProgressRing.tsx       ← SVG circular progress
│   └── screens/
│       ├── TodayScreen.tsx
│       ├── ProgressScreen.tsx
│       ├── ProgrammeScreen.tsx
│       ├── CommunityScreen.tsx
│       └── ProfileScreen.tsx
```

### Design System (`src/theme/index.ts`)

MD3 (Material Design 3) inspired tokens:

```typescript
colors.primary = '#1B6CA8'         // Blue
colors.secondary = '#00897B'       // Teal
colors.tertiary = '#F57C00'        // Amber
colors.surface = '#F8FAFC'
colors.background = '#F4F6F9'
// + full MD3 token set (container, on-*, variant, error, success, warning)

spacing: { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }
radius: { xs:4, sm:8, md:12, lg:16, xl:24, full:999 }
elevation: { level0–level3 }  // shadow configs
typography: { displayLarge → labelSmall }  // 14 type roles
```

### Navigation (`App.tsx`)

Bottom tab navigator with 5 tabs:
- Today, Progress, Programme, Community, Profile
- Active tab: emoji icon in `primaryContainer` background circle
- Tab bar: white, `outlineVariant` top border, 60px height

### Mobile Screens

**TodayScreen** — Greeting + streak badge, coach banner (message button), 3 metric cards (horizontal scroll) with mini bar charts, habit list with Switch toggles, weekly focus card with progress bar, personal pattern insight card.

**ProgressScreen** — 6-month programme timeline dots, active phase card with circular %, biomarker chip selector, SVG line chart with month labels and current value label, month summary cards.

**ProgrammeScreen** — Overview card (3 stats), 6 expandable phase cards. Active = expanded by default, locked = lock icon, completed = strikethrough goals.

**CommunityScreen** — Cohort banner, filter chips, expandable story cards with outcome pills.

**ProfileScreen** — Avatar hero, 4-stat snapshot grid, coach card (message + schedule), settings rows list.

---

## 11. Component Inventory

### Web Components

| Component | File | Purpose |
|---|---|---|
| `MiniBarChart` | `today/page.tsx` | 7-bar CSS chart |
| `Badge` | `today/page.tsx` | poor/fair/good status |
| `MetricCard` | `today/page.tsx` | Health metric card with chart |
| `WorkflowCard` | `today/page.tsx` | Coaching toolkit tile |
| `ArticleCard` | `today/page.tsx` | Editorial content card |
| `Month1Content` | `today/page.tsx` | Demo toggle wrapper — injects `m1-*` CSS, renders `Month1ActiveContent` or `Month1CompletedContent` |
| `Month1ActiveContent` | `today/page.tsx` | Dual-render: Mobile — 7 sections (incl. MonthTransformationStory + **BiomarkerProgressShowcase**). Desktop (`m1-dt-*`) — Discovery Hero Workspace (65/35), **MonthTransformationStory**, **BiomarkerProgressShowcase**, Understanding You Workspace (50/50), Mission 5-col grid, Month 2 Preview banner |
| `Month1CompletedContent` | `today/page.tsx` | Dual-render: Mobile — 7 sections. Desktop (`m1-dt-*`) — 5 sections: Completion Hero, Achievement Workspace (70/30), Journey Reflection (60/40), Next Chapter dark band, Share Achievement (60/40) |
| `Month2Content` | `today/page.tsx` | Dual-render active month: Mobile — 9 sections (incl. MonthTransformationStory + **BiomarkerProgressShowcase**). Desktop (`m2-dt-*`) — cinematic hero (70/30), **`MonthTransformationStory`** (bare call — section wrapper/header owned by MTS), **BiomarkerProgressShowcase**, execution grid, results row, focus gallery |
| `LockedMonthContent` | `today/page.tsx` | Dual-render future chapter: Mobile — grayscale preview + full-colour MonthTransformationStory + **BiomarkerProgressShowcase** + unlock CTA. Desktop (`lm-dt-*`) — Cinematic Hero (70/30), Chapter Preview (35/65), Pillars Gallery (4-col), Outcomes Dashboard (4-col), Transformation Story (full colour), **BiomarkerProgressShowcase**, Cinematic CTA banner |
| `MonthTransformationStory` | `today/page.tsx` | Shared per-month story component inserted on all 6 month tabs. Props: `monthNum`, `uploadedPhotos?`, `onUpload?`, `fileRef?`. **Desktop architecture:** The component is fully self-contained — it owns its own section wrapper (`mts-dt-section`: `background: #EEF3EF`, `padding: 72px 64px`, `88px 80px` at ≥1400px), inner container (`mts-dt-section-inner`: `max-width: 1400px; margin: 0 auto`), and section header ("Your Documentary" eyebrow + "My Transformation Story" h2 at 32px/900). All call sites pass a bare `<MonthTransformationStory />` with no outer wrappers — layout is identical across all months. **Mobile sections** top-to-bottom: (1) **Story header** — dark gradient with 2 animated Framer Motion glows + 3 stat chips; visual identity from `STORY_HEADER_DESIGN[monthNum]`. (2) **Transformation reel** — 5 circular photo slots with gradient ring (uses uploaded photos). (3) **"Capture Today's Win" CTA strip** — file upload interface. (4) **Journey Highlights 2×2 grid** — month-specific achievements from `STORY_MILESTONES[monthNum]`. (5) **"View My Complete Journey" CTA** → `/journey`. (6) **`NutritionStrategyCard`** — `variant="default"` in the mobile layout; `variant="month"` in the desktop right column. (7) **Reflection card** — prompt + future vision copy from `CHAPTER_STORY_DATA[monthNum].reflectionPrompt` / `futureCopy`. **Desktop layout** (`mts-dt-workspace`, 70/30 grid): Left 70% (`mts-dt-left`, `gap: 24px`) — cinematic story header, photo reel card (`mts-dt-reel-grid` 5-col), upload CTA button, documentary journey CTA. Right 30% (`mts-dt-right`, sticky `top: 88px`) — reflection card, journey highlights (`mts-dt-highlights-grid` 2×2), `NutritionStrategyCard variant="month"`. |
| `NutritionStrategyCard` | `today/page.tsx` | **Fixed-height nutrition entitlement demo component.** Prop: `variant?: 'default' \| 'month'` (default: `'default'`). Accepts a segmented demo control with 3 tabs — **Coach Supported**, **DIY Builder**, **Assigned Plan** — backed by `useState<NutritionMode>`. **Architecture:** All 3 state panels are always in the DOM inside a single fixed-height content shell (`position: relative; height: contentH; overflow: hidden`). Each panel is `position: absolute; inset: 0` — only `opacity` and `pointerEvents` toggle on mode change. The outer container never reflows or changes height. `contentH` = `300px` (month) / `360px` (default). **State A — Coach Supported:** warm gold/amber gradient (`#2A1800 → #B07828`), 3 feature badges, optional Dr. Ananya avatar row (hidden in compact), headline, copy, gold CTA "Request My Meal Plan", "48 hours" note. **State B — DIY Builder:** warm cream palette (`#FAF5EC → #EDD9B0`), 3 earthy badges, optional framework icon row (hidden in compact), headline, copy, sage CTA "Create My Own Meal Plan". **State C — Assigned Plan:** dark forest (`#071710 → #163326`), header row ("Week 3 Nutrition Plan" + "75% today"), **peekable meal rail** (fixed height `railH`, `overflow-x: auto`, `scroll-snap-type: x mandatory`, right-edge fade gradient), progress bar strip, primary CTA "View Full Meal Plan" + ghost secondary "Request Adjustments". CTAs are wrapped in `.ns-assigned-ctas` — on desktop (`≥1024px`) both buttons become `width: fit-content` (min-width 240px primary / 200px secondary) and the wrapper is `align-items: center` so they centre-align and lose the full-width bar appearance; on mobile both remain full-width for tap target. **Meal rail data:** `NS_MEALS` (5 items — Breakfast/Lunch/Snack/Dinner/Weekend — each with `category`, `name`, `kcal`, `protein`, `color`, `colorDim`, `emoji`). **Compact sizing** (`variant="month"`): `contentH=300px`, `bp=12px 14px`, `mealW=130px`, `imgH=50px`, `railH=128px`, Panel C gap `8px` — coach avatar and framework icon row hidden, headlines shortened. **Full sizing** (`variant="default"`): `contentH=360px`, `bp=16px 18px`, `mealW=152px`, `imgH=76px`, `railH=160px`, Panel C gap `9px`. **CSS classes:** `ns-seg`, `ns-seg-btn`, `ns-badge`, `ns-meal-rail`, `ns-meal-tile`, `ns-cta-p`, `ns-cta-g`, `ns-pbar-track`, `ns-pbar-fill`, `ns-assigned-ctas` — all injected as inline `<style>`. **Placements:** (1) `MonthTransformationStory` mobile right column — `variant="default"`. (2) `MonthTransformationStory` desktop right column — `variant="month"`. (3) Overview desktop — 2-col row below `ov-dt-story-workspace` (paired with Future Self Preview card) — `variant="default"`. (4) Mobile Overview — inserted after `<BiomarkerProgressShowcase />`, before Today's Focus card, with "Your Nutrition" eyebrow label — `variant="default"`. |
| `BiomarkerProgressShowcase` | `today/page.tsx` | **Premium health intelligence showcase.** Dual-render architecture — separate mobile and desktop DOM trees. **Mobile** (unchanged): `bps-mobile-header` + `bps-mobile-chips` + `bps-mobile-track` — horizontal swipe carousel (`scroll-snap-type: x mandatory`) showing all 6 dark editorial cards (Weight, Blood Pressure, Waist, Glucose, Activity, Sleep) plus a final "Explore Every Health Trend" nav card → `/progress`. All mobile markup hidden at ≥1024px. **Desktop** (`bps-dt-shell`, shown at ≥1024px only): (1) **Header row** — large 44px/900 headline left, "SCROLL TO EXPLORE" hint + `ArrowRight` right. (2) **KPI chips strip** (`bps-dt-chips`) — 4 animated pills that count up from 0 on first viewport reveal via `IntersectionObserver`. (3) **Horizontal scrollable carousel** (`bps-dt-track`) — `overflow-x: auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`. Cards are `clamp(280px, 29vw, 360px)` wide → ~3.2 cards visible at once, all 6 biomarker cards shown. `useEffect` wires `wheel` events on `dtTrackRef` to convert vertical deltaY to horizontal scroll (only intercepted when not at edge). `cursor: grab` / `grabbing`. (4) Each **desktop biomarker card** (`bps-dt-card`) is 440px tall, 28px radius, 52px/900 value, chart rendered with `BpsChart tall` prop (larger, richer), month axis, frosted-glass insight quote. (5) **"Explore Your Complete Progress" final card** — dark forest gradient, ambient sage glows, large `ArrowRight` circle (56px top-right), editorial stacked copy ("Every biomarker. / Every milestone. / Every trend."), "View Progress →" badge, entire `<a>` clickable → `/progress`. No standalone CTA below the carousel. Placed in Overview desktop inside `<div className="ov-dt-bleed">` to break out of `ov-dt-body` padding. CSS injected as `bps-*` inline style classes. |
| `BpsChart` | `today/page.tsx` | SVG sub-component used by `BiomarkerProgressShowcase`. Props: `metric` (a `BPS_METRIC_DATA` entry) + optional `tall?: boolean`. **Standard** (W=240, H=88): used on mobile cards. **Tall** (W=320, H=160): used on desktop 440px cards — richer area fill (0.42 opacity), stronger glow (stdDeviation 4.5), larger endpoint rings, heavier line (3px). Both variants: smooth polyline (logged months solid, projected dashed), soft area fill with per-metric gradient, glowing endpoint (three-layer: large dim circle → coloured glow → white highlight dot), subtle logged dots, 2-line minimal grid. Per-metric unique `gradId` / `glowId` SVG filter IDs (tall variant prefixed `lg-`) avoid conflicts between multiple renders on the same page. |
| `HealthConciergeModal` | `(app)/layout.tsx` | Global FAB + responsive premium modal — mobile: 88vh bottom-sheet (spring slide), desktop: centered `min(92vw,1400px)×min(85vh,900px)` fade+scale modal with 65/35 column layout. 7 sections, conditional `HAS_COACHING` sections, GPU-composited, single-scroll-wrapper architecture |
| `DesktopStoryCard` | `community/page.tsx` | Desktop-only story card — 240px cinematic image with gradient overlay, month badge (colour-coded), hover lift, expandable pull-quote with sage left-border |
| `LineChartLarge` | `progress/page.tsx` | Desktop SVG chart (760×280) — area fill under logged line, value labels, 5 gridlines, distinct logged vs projected visual |
| `JourneyIndicator` | `today/page.tsx` | 6-node programme stepper + animated chapter cover card (dark gradient hero with 3 Framer Motion glows + focus pills strip) — mobile version |
| `JourneyIndicatorDesktop` | `today/page.tsx` | Desktop variant of JourneyIndicator — phase stepper + chapter card optimised for the `ov-dt-journey-workspace` 65/35 left column |
| `TransformationJourney` | `today/page.tsx` | Visual progress sub-section in Overview (mobile only): hero photo swap (SECTION 1), Success Blueprint (SECTION 2), Transformation Timeline (SECTION 3 — formerly SECTION 4) with "Capture Today's Win" primary CTA bottom-left, Future Self Preview (SECTION 4), Journey Destination CTA → `/journey`. The Meal Planning / "Your Personalised Nutrition Plan" card has been removed. |
| `OverviewContent` | `today/page.tsx` | Main dashboard |
| `TodayPageInner` | `today/page.tsx` | Tab controller (uses `useSearchParams`) |
| `HabitCheckbox` | `components/HabitCheckbox.tsx` | Toggleable habit row |
| `CircularProgress` | `components/CircularProgress.tsx` | SVG ring |
| `PhaseCard` | `components/PhaseCard.tsx` | Programme phase display |
| `BottomNav` | `components/BottomNav.tsx` | ~~Mobile bottom navigation~~ — file exists but component is no longer rendered in the app shell |

### Mobile Components

| Component | File | Purpose |
|---|---|---|
| `Card` | `components/Card.tsx` | Elevated/filled/outlined surface |
| `Chip` | `components/Chip.tsx` | Filter pill, selectable |
| `MiniBarChart` | `components/MiniBarChart.tsx` | 7-bar chart |
| `ProgressRing` | `components/ProgressRing.tsx` | SVG circular progress |

---

## 12. Data & State Management

All data is currently **hardcoded mock data** — there is no backend API or database connected. State lives in component-level `useState`.

**Key mock data points:**
- Member: Priya, Month 2, Day 14 of 30, moderate risk
- Coach: Dr. Ananya Rao, next session Thu Jun 12
- Current steps: 5,240 / 7,000 goal
- Current sleep: 6.5 hrs / 7.5 hr target
- Habit streak: 14 days
- Weight lost to date: 3 kg
- Programme progress: 33% (2 of 6 months)
- Cohort size: 847 members on Month 2

**Interactive state in today/page.tsx:**
- `habitsChecked` — toggles 5 daily habits
- `showSetup` — dismiss the upload labs banner
- `activeFilter` — Explore Health Topics pills
- `goalChecked` (Month 2) — toggles 4 month goals
- `photos` (Month 2) — stores uploaded progress photo URLs

---

## 13. Routing

| Route | Component | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Redirects → `/today` |
| `/today` | `today/page.tsx` | **Primary landing page** and navigation hub |
| `/today?tab=overview` | `OverviewContent` | Default |
| `/today?tab=month1` | `Month1Content` | |
| `/today?tab=month2` | `Month2Content` | |
| `/today?tab=month3` | `LockedMonthContent` monthNum=3 | |
| `/today?tab=month4` | `LockedMonthContent` monthNum=4 | |
| `/today?tab=month5` | `LockedMonthContent` monthNum=5 | |
| `/today?tab=month6` | `LockedMonthContent` monthNum=6 | |
| `/progress` | `progress/page.tsx` | **Secondary.** Reached via "View Your Progress" carousel card. Sticky "← Overview" back nav. |
| `/community` | `community/page.tsx` | **Secondary.** Reached via "View All Stories" carousel card. Sticky "← Overview" back nav. |
| `/journey` | `journey/page.tsx` | **Secondary.** Transformation documentary page — 9 sections including cinematic hero, transformation timeline, comparison slider, photo reel, journey roadmap. Reached via "View Your Complete Journey →" CTA in `TransformationJourney` component. Sticky "← Overview" back nav. |
| `/today/compare` | `today/compare/page.tsx` | A/B prototype — IA comparison tool, not a production route |
| `/habits` | `habits/page.tsx` | Redirects → `/today` |
| `/meals` | `meals/page.tsx` | Redirects → `/today` |
| `/steps` | `steps/page.tsx` | Redirects → `/today` |
| `/sleep` | `sleep/page.tsx` | Redirects → `/today` |

**Navigation hierarchy:**
```
/today  (primary hub)
  ├── /progress    (← Overview to return)
  ├── /community   (← Overview to return)
  └── /journey     (← Overview to return)
```

---

## 14. Programme Naming System

Every month has two names. Both must always be present in the UI.

| Layer | Purpose | Visual treatment |
|---|---|---|
| **Member-friendly title** | What the member achieves | Large h2, dominant, `var(--color-ink)` or white |
| **Subtitle** | One-sentence member benefit | 13–14px, muted/secondary colour |
| **Clinical label** | Internal programme phase name | 11px, `rgba(255,255,255,0.4)` on dark / `var(--color-muted)` on light |

**Rule:** Never show only the clinical name as the primary heading. The member-friendly title is always visually dominant.

**PHASE_DATA stepper labels** (short tab node labels):
Discover · Build · Restore · Balance · Sustain · Thrive

**Chapter journey labels** (displayed as hero in the chapter card):
Discover · Build · Restore · Balance · Sustain · Thrive

---

## 15. Visual Design Principles

The UI has been elevated through several design passes. Current visual language:

**Card style:** `border-radius: 16–20px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.05)`, `border: 1px solid var(--color-border)`, white background.

**Section headings:** Always preceded by a 10px uppercase sage eyebrow label (e.g. "TODAY AT A GLANCE"), followed by a 20px 800-weight heading.

**Hero sections:** Two-layer gradient overlays on lifestyle photography. Content justified to flex-end (bottom). Status pill with pulsing dot for active states.

**Dark cards:** `linear-gradient(135deg, #1C2B1E 0%, #3A5C3E/2D4A30 100%)` — used for Today's Focus, Share Achievement, Monthly transition headers.

**Journey indicator:** 6-node stepper, consistent across Overview and Month 2 tabs. Completed = sage filled ✓, Active = dark filled with ring shadow, Locked = transparent border.

**Typography hierarchy:**
- Eyebrow: 10px, 700, uppercase, `var(--color-sage)`, `letter-spacing: 0.08em`
- Heading: 20px, 800, `var(--color-ink)`, `letter-spacing: -0.02em`
- Body: 13–14px, 400–500, `var(--color-ink)` or `var(--color-muted)`
- Stats: 22–28px, 800, coloured accent

**Imagery treatment:** `object-fit: cover` with gradient overlays. Walking / Indian meals / sleep / hydration / strength training. Avoid clinical/hospital imagery.

**Interaction:** `transition: all 0.2s ease` on interactive elements. Hover: `translateY(-2px)` on cards. No heavy hover effects on mobile.

---

## 16. Development Commands

```bash
# From monorepo root
npm run dev          # Start all apps (Turborepo)

# Web app specifically (port 4001)
cd apps/web && npm run dev

# Mobile app
cd apps/mobile && npm start
# or
npx expo start --web   # Run in browser

# Type check
cd apps/web && npx tsc --noEmit
cd apps/mobile && npx tsc --noEmit

# Build web for production
cd apps/web && npm run build
```

---

## 17. Known Constraints & Decisions

- **No backend yet** — All data is hardcoded. Member profile, habits, metrics are all mock values.
- **Inline styles** — The web app primarily uses inline styles for component-level styling rather than Tailwind classes, for portability and specificity. Tailwind is used in `globals.css` for base resets.
- **Today page is monolithic** — `today/page.tsx` contains all tab content as local functions. This is intentional for current phase — splitting into separate files is a future refactor.
- **Mobile app is separate from web** — They share types and programme data via packages but are independently maintained. Mobile uses React Native components; web uses HTML/CSS.
- **Stub routes** — `/habits`, `/meals`, `/steps`, `/sleep` redirect to `/today` as placeholders for future dedicated pages.
- **No auth** — No login flow exists. App loads directly to `/today`.
- **Demo user only** — All content is for "Priya", Month 2, moderate risk. No multi-user support yet.
- **No bottom navigation, no sidebar** — The mobile bottom nav and desktop sidebar have both been removed. The app is full-width at all screen sizes. `/today` is the primary entry point; Progress and Community are reached through contextual carousel nav cards and return via sticky "← Overview" headers.
- **Nav card pattern** — Any new secondary experience should follow the same pattern: a dark forest gradient nav card (`#1C2B1E → #3A5C3E`) appended to the relevant carousel on the Overview page, and a sticky back header (`top: 56px`, `ChevronLeft` + "Overview") on the destination page.
- **Month naming** — Always use the member-friendly title as the dominant h2. Clinical phase name is always present but rendered small and muted. Never swap the hierarchy. See §13 Naming System.
- **Demo toggle** — Month 1 has a "Demo View: Active / Completed" segmented control at the top. This is a prototype affordance and not production UI. Other months do not have this.
- **Future month philosophy** — Months 3–6 are full-content preview experiences (not teasers). Mobile body content has `grayscale(40%) opacity: 0.85`. The unlock CTA and `MonthTransformationStory` are always full-colour and outside the grayscale filter. On desktop, each month has a unique per-month colour identity (`DT_PAL` record in `LockedMonthContent`) — Month 6 is full colour with no desaturation at any breakpoint.
- **Concierge modal routes** — `/goals`, `/meal-plan`, `/meal-plan/coach`, `/progress/selfie`, `/progress/biomarkers`, `/coach/message`, `/ai-coach`, `/ask`, `/briefing`, `/briefing/subscribe` are placeholder routes not yet built. Implement those pages before making the modal CTAs functional.
- **`HAS_COACHING` flag** — Hardcoded `true` at top of `(app)/layout.tsx`. Replace with real entitlement check (subscription tier, coaching plan status) before shipping.

---

## 18. What Each Chatbot Prompt Should Include

When asking an AI to modify this codebase, specify:

1. **Which file** — e.g. `apps/web/app/(app)/today/page.tsx`
2. **Which function/section** — e.g. `OverviewContent`, `Month2Content`, `MetricCard`
3. **What to preserve** — Always mention: state, hooks, all existing sections, business logic
4. **What to change** — Be specific: spacing, colours, layout, typography
5. **Design constraint** — "Premium wellness aesthetic. No clinical styling. Generous whitespace."

---

---

## 19. Desktop Layout System (1024px+)

The desktop experience is a completely separate DOM tree from mobile — **dual-render pattern**, not a wider single column.

### Breakpoints
| Range | Behaviour |
|---|---|
| `< 1024px` | Mobile layout — all `*-mobile-only` visible, `*-desktop-only` hidden |
| `1024px+` | Desktop layout — `*-mobile-only` hidden, `*-desktop-only` visible (applies to `ov-*`, `m1-*`, `m2-*`, `lm-*` dual-render classes) |
| `1400px+` | Wider padding / larger hero (secondary breakpoint inside each page's desktop styles) |
| `1600px+` | `max-width: 1600px` container cap (`*-dt-page` class on all month tabs) |

**No sidebar anywhere.** Desktop is full-width at all breakpoints — both in the app shell and inside the Overview desktop layout. All sections fill the full content width.

### CSS Class Naming Conventions

> **Important:** All `ov-*`, `m1-*`, `m2-*`, and `lm-*` classes are defined in **inline `<style>` tags inside `today/page.tsx`**, not in `globals.css`. The `dt-*` utilities in `globals.css` are legacy/supplementary — the primary desktop system uses `ov-*`.

| Prefix | Scope | Style tag location |
|---|---|---|
| `ov-mobile-only` / `ov-desktop-only` | Overview visibility toggle | inline style in `OverviewContent` |
| `ov-dt-*` | Overview desktop internals | inline style in `OverviewContent` |
| `m1-mobile-only` / `m1-desktop-only` | Month 1 visibility toggle | inline style in `Month1Content` |
| `m1-dt-*` | Month 1 desktop grids | inline style in `Month1Content` |
| `m2-mobile-only` / `m2-desktop-only` | Month 2 visibility toggle | inline style in `Month2Content` |
| `m2-dt-*` | Month 2 desktop grids | inline style in `Month2Content` |
| `lm-mobile-only` / `lm-desktop-only` | Locked months visibility toggle | inline style in `LockedMonthContent` |
| `lm-dt-*` | Locked months desktop grids | inline style in `LockedMonthContent` |
| `mts-mobile-only` / `mts-desktop-only` | MTS visibility toggles | inline style in `MonthTransformationStory` |
| `mts-dt-section` | Self-contained section wrapper — `background: #EEF3EF`, padding `72px 64px` (88px 80px at ≥1400px) | inline style in `MonthTransformationStory` |
| `mts-dt-section-inner` | `max-width: 1400px; margin: 0 auto` — content container | inline style in `MonthTransformationStory` |
| `mts-dt-section-header` | Section heading block — `margin-bottom: 40px` | inline style in `MonthTransformationStory` |
| `mts-dt-workspace` / `mts-dt-left` / `mts-dt-right` | 70/30 grid + column styles | inline style in `MonthTransformationStory` |
| `mts-dt-reel-grid` / `mts-dt-highlights-grid` | 5-col reel / 2×2 highlights grids | inline style in `MonthTransformationStory` |
| `ns-*` | NutritionStrategyCard internals | inline style in `NutritionStrategyCard` |
| `dt-*` | Generic desktop utilities (legacy) | `globals.css` |

### Overview Desktop Layout (`ov-desktop-only`)

The desktop Overview is a self-contained full-width layout tree. Key classes:

| Class | Purpose |
|---|---|
| `ov-dt-body` | Full-width block container. `padding: 0 48px` (no grid — sidebar removed) |
| `ov-dt-main` | Flex column, `gap: 0` — sections handle their own spacing via band classes |
| `ov-dt-section` | Full-bleed horizontal band. `margin: 0 -48px; padding: 72px 48px` — bleeds to page edges |
| `ov-dt-bleed` | Negative-margin breakout only. `margin: 0 -48px` (no padding). Used to break components that manage their own padding (e.g. `BiomarkerProgressShowcase`) out of `ov-dt-body`'s inset. |
| `ov-dt-section-warm` | Sage-tinted band `#EEF3EF` — Transformation Story |
| `ov-dt-section-dark` | Dark forest band `#1A2B1C` — Health Command Center |
| `ov-dt-section-white` | Pure white band `#ffffff` — Learn & Discover |
| `ov-dt-section-stone` | Warm stone band `#F0EDE6` — Your Journey So Far |
| `ov-dt-journey-workspace` | 65fr / 35fr — journey indicator left, today-at-a-glance right |
| `ov-dt-story-workspace` | 70fr / 30fr |
| `ov-dt-cmd-toolkit-full` | 6-col grid — all 6 toolkit cards in a single row |
| `ov-dt-stories-grid` | 3-col grid |
| `ov-dt-articles` | 2-col grid |

**Section 1 — Hero** (`ov-dt-hero`, 560px / 620px at 1400px+): Full-width cinematic — `ov-dt-hero-inner` is `display: flex` (not a grid). Single `ov-dt-hero-left` column, `max-width: 760px` (840px at 1400px+), `padding: 0 64px 60px 64px`. **Coach Presence card (Dr. Ananya) removed; `ov-dt-hero-right` zone and class removed.** Content stack bottom-up (`justify-content: flex-end`): chapter pill → **YOUR HEALTH GOAL glassmorphism capsule** (`background: rgba(8,18,10,0.52)`, `backdrop-filter: blur(16px)`, gold eyebrow, `memberGoals` icon-chips, impact microcopy) → greeting h1 60px/900 → day subtitle 17px → month progress bar (max-width 360px, sage→gold gradient). `memberGoals` constant defined at top of file after `TABS`.

**Section 2 — Journey Experience** (`ov-dt-section`, default `#FAFAF8`): `ov-dt-journey-workspace` 65/35 grid. Left 65% — `JourneyIndicatorDesktop` (phase stepper + chapter card). Right 35% sticky — 2 cards: (1) **Today's Habits** — live interactive checklist using shared `habitsChecked` state, streak pill, progress footer showing `X of 5 done`; (2) **Health Snapshot** — 2×2 compact metric tiles (Steps / Weight / HbA1c / BP) with animated bars. **Your Patterns moved out of sticky column** — rendered as a full-width 2-col row directly below the `ov-dt-journey-workspace` grid inside the same band to eliminate whitespace gap. `TransformationJourney` component removed from this section.

**Section 3 — My Transformation Story** (`ov-dt-section ov-dt-section-warm`, `#EEF3EF`): `ov-dt-story-workspace` 70/30 grid. Left 70% — cinematic header (48px headline, animated glows, stat chips) + large square photo reel + "Capture Today's Win" CTA + documentary CTA. Right 30% sticky — reflection journal card + Journey Highlights 2×2. **Future Self Preview + `NutritionStrategyCard` moved out of sticky column** — rendered as a side-by-side 2-col row directly below the `ov-dt-story-workspace` grid to eliminate whitespace gap. The Nutrition card uses `variant="default"` here. Uses separate `dtStoryPhotos`/`dtStoryActiveSlot`/`dtStoryRef` state.

**Section 3b — Biomarker Progress Showcase** (dark `#08110A`, full-bleed): `BiomarkerProgressShowcase` wrapped in `<div className="ov-dt-bleed">` (negative margin breakout — same as `ov-dt-section` but no padding, since BPS manages its own). Renders premium desktop carousel — ~3.2 cards visible, all 6 biomarker metrics, wheel-to-scroll, final "Explore Your Complete Progress" card → `/progress`.

**Section 4 — Health Command Center** (`ov-dt-section ov-dt-section-dark`, `#1A2B1C`): Full-width dark band. Section heading in white/sage. (1) **Today's Focus** — full-width 2-col card: left has goal headline (36px), progress bar, 3 inline actions (Log Steps, Log Activity, "View health report →" link to `/progress`); right has frosted step counter pill (56px gold number). (2) **Your Tools** — `ov-dt-cmd-toolkit-full` 6-col grid of toolkit cards rendered in dark glass style (semi-transparent backgrounds, white text).

**Section 5 — Learn & Discover** (`ov-dt-section ov-dt-section-white`, `#ffffff`): Featured Story (full-width 50/50 dark card) + 2-col stories grid + large filter pills + 50/50 Questions/Articles grid.

**Section 6 — Your Journey So Far** (`ov-dt-section ov-dt-section-stone`, `#F0EDE6`): Full-width dark forest card inside stone band. 3-col: Big Stats (52px staggered) | Visual Roadmap (6 phases, NOW/✓ badges) | Motivation + CTAs. Bottom: full-width animated progress bar.

### Section Banding — Visual Rhythm

Each section is a full-bleed horizontal band that butts directly against the next — no gaps, no uniform padding. Sections read as distinct "floors" of the page:

| Section | Band | Feel |
|---|---|---|
| Journey Experience | `#FAFAF8` surface | Neutral baseline |
| Transformation Story | `#EEF3EF` cool sage | Personal, documentary |
| Biomarker Progress Showcase | `#08110A` near-black | Evidence, premium intelligence |
| Health Command Center | `#1A2B1C` dark forest | Operational, focused |
| Learn & Discover | `#ffffff` white | Editorial, clean |
| Your Journey So Far | `#F0EDE6` warm stone | Reflective, closing |

### What Was Removed from Desktop Overview

The following elements were audited and removed to eliminate duplication:

- **Right sidebar** (`ov-dt-sidebar`, 25% column) — entire block removed. Body is now single full-width column.
- **`ov-dt-hero-right` zone** — removed. Hero is now single-column flex. `1fr 360px` grid replaced with `display: flex`.
- **Coach Presence card (Dr. Ananya)** in hero — removed. Greeting + goal capsule content is now the full hero focus.
- **Centre hero panel** ("Journey Status" glassmorphism card) — removed. Was duplicating Day/Month/% data already shown in left zone.
- **Momentum Strip** (`ov-dt-momentum`, 4 floating cards below hero) — removed. Was duplicating Streak/Consistency/Weight/Programme % shown in the Journey right panel.
- **`TransformationJourney` component** in Journey left column — removed. Covered by the dedicated Story section below.
- **Journey right companion panel** (4 cards: Current Chapter, Upcoming Milestone, Future Self, Journey CTA) — replaced with the 3 today-at-a-glance cards.
- **Health Snapshot 2×2** from Command Center Row 1 — removed. Navigation to `/progress` preserved via "View health report →" ghost link inside Today's Focus card.
- **Habits checklist** from Programme Studio in Command Center — removed. Habits live in Journey right panel.
- **Personal Patterns 4 cards** from Command Center Row 2 — removed. 2 teasers live in Journey right panel.
- **`ov-dt-cmd-row1`**, **`ov-dt-cmd-row2`** CSS classes — removed (Command Center is now single-column with toolkit full-width).

### Month 1 Desktop Grids (`m1-dt-*` classes)

| Class | Purpose |
|---|---|
| `m1-dt-page` | `max-width: 1600px`, centred container |
| `m1-dt-section` | `padding: 72px 80px` (88px 96px at 1400px+) |
| `m1-dt-section-sage` | `#EEF3EF` band |
| `m1-dt-section-white` | `#ffffff` band |
| `m1-dt-section-stone` | `#F0EDE6` band |
| `m1-dt-section-dark` | `#071209` band |
| `m1-dt-hero-workspace` | 65fr/35fr grid, 600px min-height (Active hero) |
| `m1-dt-hero-left` | Relative + overflow hidden for hero image |
| `m1-dt-hero-right` | Dark forest right panel for Health Journey |
| `m1-dt-discovery-workspace` | 50/50 grid — insights + baseline (Active S2) |
| `m1-dt-achievement-workspace` | 70fr/30fr grid — badges + coach (Completed S2) |
| `m1-dt-reflection-workspace` | 60fr/40fr grid — timeline + summary (Completed S3) |
| `m1-dt-share-layout` | 60fr/40fr grid — stats + trophy (Completed S5) |

### Month 2 Desktop Grids (`m2-dt-*` classes)

| Class | Purpose |
|---|---|
| `m2-dt-page` | `max-width: 1600px`, centred container |
| `m2-dt-section` | `padding: 72px 64px` band base |
| `m2-dt-section-sage/white/stone/dark` | Banded section backgrounds |
| `m2-dt-hero-workspace` | 70fr/30fr grid, 580px min-height |
| `m2-dt-hero-left` / `m2-dt-hero-right` | Cinematic hero / Momentum panel |
| `m2-dt-story-workspace` | ~~70fr/30fr story grid~~ — **removed**. MTS is now self-contained via `mts-dt-*` classes. |
| `m2-dt-exec-grid` | 50/50 — Mission + Habits |
| `m2-dt-results-row` | 4-col — Progress metrics |
| `m2-dt-wins-row` | 4-col — Month wins |
| `m2-dt-focus-gallery` | 5-col — Focus pillar cards |

### Locked Month Desktop Grids (`lm-dt-*` classes)

| Class | Purpose |
|---|---|
| `lm-dt-page` | `max-width: 1600px`, centred container |
| `lm-dt-section` | `padding: 72px 80px` (88px 96px at 1400px+) |
| `lm-dt-section-white` | `#ffffff` band |
| `lm-dt-hero-workspace` | 70fr/30fr grid, 620px min-height |
| `lm-dt-hero-left` / `lm-dt-hero-right` | Cinematic hero / Unlock countdown panel |
| `lm-dt-preview-workspace` | 35fr/65fr — quote anchor + section cards 2×2 |
| `lm-dt-pillars-gallery` | 4-col grid — pillar image cards |
| `lm-dt-outcomes-row` | 4-col grid — projected outcome cards |

### Progress Page Desktop Layout (`pg-*` classes)

Injected as inline `<style>` in `progress/page.tsx`. Breakpoint: `≥1024px`.

| Section | Band | Layout |
|---|---|---|
| S1 Hero (sticky back nav integrated) | Dark forest `#0d1a10` | 2-col `1fr 1fr`, 580px min-height |
| S2 Metric Intelligence | White `#ffffff` | `pg-dt-65-35` + sticky right panel |
| S3 Transformation Dashboard | Warm stone `#F0EDE6` | `pg-dt-3col` (M1 done / M2 active / M3–6 locked list) |
| S4 Visual Transformation | Sage tint `#EEF3EF` | `pg-dt-photo-wall` 4-col |
| S5 Future Trajectory | Dark gradient | 3-col projection cards + community CTA |

### Community Page Desktop Layout (`cm-*` classes)

Injected as inline `<style>` in `community/page.tsx`. Breakpoint: `≥1024px`.

| Act | Band | Layout |
|---|---|---|
| Act 1 Hero | Dark cinematic `#0d1a10` | 2-col `1fr 1fr`, 600px min-height, filters in hero |
| Act 2 Featured | Warm stone `#F0EDE6` | `cm-65-35`, sticky right panel |
| Act 3 Gallery | White `#ffffff` | `cm-3col` DesktopStoryCard grid |
| Act 4 Finale | Dark gradient | Full-width centred, 52px headline, white CTA |

---

*Last updated: June 16, 2026 | VitalPath v2.8 | 6-month preventive health coaching platform | today/page.tsx ~8000 lines*
