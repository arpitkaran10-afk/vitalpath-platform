# VitalPath — Complete Codebase Reference
> Version 2.6 — Updated 2026-06-19

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
│   ├── onboarding/page.tsx        ← Post-signup onboarding flow (5 screens, outside app shell)
│   └── (app)/                     ← App route group
│       ├── layout.tsx             ← App shell (header, FAB, HPlusPill — no sidebar)
│       ├── today/page.tsx         ← Main dashboard (8500+ lines, intentionally monolithic)
│       ├── hplus/page.tsx         ← H+ Points experience (score, timeline, analytics, achievements)
│       ├── overview/page.tsx      ← Programme overview / onboarding landing page (900 lines)
│       ├── progress/page.tsx      ← Biomarker tracking + charts
│       ├── community/page.tsx     ← Member success stories
│       ├── journey/page.tsx       ← Transformation documentary page (secondary)
│       ├── daily-plan/page.tsx    ← Personalised Daily Meal & Exercise Plan (secondary)
│       ├── nudges/page.tsx        ← Nudge Library — browse & activate habit reminders
│       ├── habits/page.tsx        ← Redirects → /today
│       ├── meals/page.tsx         ← Redirects → /today
│       ├── steps/page.tsx         ← Redirects → /today
│       ├── sleep/page.tsx         ← Redirects → /today
│       └── components/
│           ├── HabitCheckbox.tsx
│           ├── BottomNav.tsx      ← exists but not rendered (bottom nav removed)
│           ├── CircularProgress.tsx
│           ├── PhaseCard.tsx
│           └── NutritionBlueprintWizard.tsx  ← 5-step meal plan onboarding wizard
├── lib/
│   ├── nudges-normalized.json     ← 388 structured nudges imported by nudges/page.tsx
│   ├── hplus-types.ts             ← H+ engine config, HPLUS_CONFIG, all H+ TypeScript interfaces
│   ├── hplus-demo-data.ts         ← H+ static demo data functions (Phase 2: replace with API)
│   └── hplus-store.ts             ← H+ shared in-memory store (singleton, useHPlusStore hook)
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

- **Fixed top header** (56px): VitalPath brand left; right side: "Complete Profile (2/3)" badge → **H+ Score Pill** → Messages icon → Settings icon
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

**Desktop right column:** Ask Me Anything (240px, aurora dark card, strong AI presence) → Daily Nudges (~230px natural height, aurora dark card, `#0a0a1a → #0a0f0a`) → Meal Planning (220px, gold warm gradient) → Support (220px, dark coaching/AI variant)

**Desktop card heights:** Story 360px · Ask 240px · Nudges ~230px (natural/auto height) · Goals 220px · Meal 220px · Support 220px · Progress Hub 220px (two 110px inner cards)

**All 8 sections — content and routes:**
| # | Section | Desktop style | Route |
|---|---|---|---|
| 1 | YOUR TRANSFORMATION STORY | Dark forest cinematic (left col, hero) — `#1f3526 → #0d1f14` gradients, stat pills, white CTA | `/journey` |
| 2 | UPDATE MY HEALTH GOALS | Light sage card (left col, 2-col row) — `#f0f7f1 → #e6f0e8`, Target icon, "Update Goals" CTA pinned to bottom | `/goals` |
| 3 | PROGRESS HUB | Dark forest card (left col, 2-col row) — `#0d1a10 → #162112`, header "Track Your Progress", 2 inner cards: Upload Progress Selfie (brown gradient, Camera) + Log Biomarkers (navy gradient, Activity) | `/progress/selfie`, `/progress/biomarkers` |
| 4 | YOUR PERSONAL HEALTH BRIEFING | Dark forest card (left col, full width) — `#1e2e1f → #162318`, gold Mail icon, "Subscribe" + "View Previous Editions" CTAs | `/briefing/subscribe`, `/briefing` |
| 5 | ASK ME ANYTHING | Aurora dark card (right col top) — `#090f08 → #0c0910`, green/purple aurora glows, Sparkles icon | `/ask` |
| 6 | YOUR DAILY NUDGES | Aurora dark card (right col) — `#0a0a1a → #0a0f0a`, Bell icon, sage glow top-right + indigo glow bottom-left; conditional copy: "3 nudges synced with Dr. Ananya" (`HAS_COACHING=true`) / "Set up your nudge schedule". CTA: "Configure Nudges" — **left-aligned**, inside the content column (not floated right). Card height is `auto` (no fixed height, `overflow` not clipped). | `/nudges` |
| 7 | PERSONALISED MEAL PLAN | Gold warm card (right col) — `#FBF6EE → #F6EDD9`, Utensils icon — conditional: "Consult My Coach" if `HAS_COACHING`, else "Create My Plan" | conditional |
| 8 | SUPPORT | Dark coaching card (right col bottom) — sage gradient if `HAS_COACHING`, purple if not; Message/Bot icon — conditional CTA | conditional |

**H+ Score Pill (`HPlusPill`)** — lives in `(app)/layout.tsx`, rendered between "Complete Profile" and Messages. **Light surface pill** — `background: linear-gradient(135deg, rgba(107,143,113,0.10), rgba(212,168,67,0.10))`, sage green border `rgba(107,143,113,0.28)`. Contains: 22px circular badge (sage→gold gradient, `Zap` icon white filled, subtle sage box-shadow), live score from `useHPlusStore()` in warm amber-brown `#8A6B1A`. No animated glow. Renders via **`<Link href="/hplus">`** (Next.js client-side navigation — preserves the H+ store singleton). `Zap` imported from lucide-react.

**Icon imports in layout.tsx:** `Settings`, `MessageCircle`, `Sparkles`, `X`, `Target`, `Camera`, `Activity`, `Bot`, `Utensils`, `BookOpen`, `ArrowRight`, `Mail`, `Bell`, `Zap`

**Icon imports in today/page.tsx (lucide-react):** `Lock`, `LockOpen`, `CheckCircle2`, `ChevronLeft`, `ChevronRight`, `Plus`, `Heart`, `Bookmark`, `BarChart3`, `Moon`, `UtensilsCrossed`, `Footprints`, `Brain`, `FlaskConical`, `Bell`, `Target`, `TrendingUp`, `Zap`, `Share2`, `Download`, `Link2`, `Camera`, `Star`, `Sparkles`, `ArrowRight`, `BookOpen`, `Droplets`, `Scale`, `Dumbbell`, `Activity`

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
| Overview | — | Main dashboard — supports `pre_started` and `active` states |
| Month 1 | completed (`LockOpen` icon, muted grey `var(--color-muted)`) | Demo toggle: Active state OR Completed state |
| Month 2 | active (`LockOpen` icon, sage green `var(--color-sage)`) | In-progress month screen |
| Month 3–6 | locked (`Lock` icon, muted grey) | Full future-month preview experiences |

Tab is set via `?tab=month2` query param. Active tab underline uses sage green.

### Tab Bar Styling
- Sticky at `top: 56px`, `z-index: 99`
- Backdrop blur `rgba(250,250,248,0.95)`
- Active: `border-bottom: 2px solid var(--color-sage)`, `color: var(--color-sage)`
- Status icons: `LockOpen size={12} strokeWidth={2}` for completed (muted) and active (sage); `Lock size={9}` for locked months. Icon sits inline after label text at `gap: 5px`, vertically centred via `alignItems: center` on the button.

### Overview State System

```typescript
type OverviewState = 'pre_started' | 'active';
```

`TodayPageInner` reads `?state=pre_started` from `searchParams` and passes it as `overviewState` + `setOverviewState` props to `OverviewContent`. Default is `'active'`.

**Demo toggle:** A fixed segmented control (top-right, `z-index: 200`, dark forest pill) renders when `setOverviewState` is provided. Labels: `PRE-STARTED` / `ACTIVE`. Clicking switches state in-place without navigation.

**Pre-started vs Active — what changes per section:**

| Section | Active | Pre-Started |
|---|---|---|
| Hero context pill | Day 14 of 30 · Build Healthy Habits | Personalised for you · 6-Month Programme |
| Hero headline (mobile) | Good morning/afternoon/evening, Priya | Your health transformation starts today. |
| Hero headline (desktop) | Good morning/afternoon/evening, Priya | Your health / transformation / starts today. (gradient) |
| Hero subtext | Day-of-week motivational copy | 6-month programme description |
| Hero stats | 47% progress bar + Day 14 of 30 | 6 Months · 180 Days · Dr. Ananya stat tiles |
| Desktop chapter pill | Chapter 2 · Build Healthy Habits | Enrolled · Ready to begin your transformation |
| Desktop hero CTA | Continue Journey → Month 2 | Start Month 1 (sage green) + Explore My Journey (ghost) |
| Mobile CTAs (below hero) | — (not shown) | Start Month 1 + Explore Journey button strip |
| Today's Focus card | Active focus task + progress bar | What Day 1 Looks Like — 4 welcoming checklist items |
| Health Overview heading | Your performance today / Health Overview | What we track together / Health Pillars |
| Personal Patterns heading | Discovered from your data / Your personal patterns | What we help you discover / Your Health Patterns |
| Daily Journey section heading | Month 2 · Build Healthy Habits / Complete Today's Journey | Preview / Your Daily Coaching Experience |
| Daily Journey subtext | 847 members logged actions today | Preview framing copy |
| Success Stories heading | People like you / Member Success Stories | They started exactly where you are / People Who Made It |
| Success Stories intro | — | "People who started exactly where you are today" paragraph |
| Coach message heading | Message from your coach | A welcome from your coach |
| Coach message status | Available now | Ready to begin |
| Coach message body | Active coaching nudge about logging | Welcome message from Dr. Ananya |
| Coach message CTA | Reply to Dr. Ananya → /coach/message | Start Month 1 → /today?tab=month1 |
| Footer card | Journey stats + 3 nav links | "You're ready to begin." conversion card + Start Month 1 CTA |
| Journey section heading (desktop) | Your Transformation Roadmap / Your Journey Experience | Your Transformation Blueprint / Your 6-Month Journey |
| Journey indicator default phase | 2 | 1 |
| Patterns section heading (desktop) | From your data / Your Patterns | What we help you discover / Your Health Patterns |
| Stories section heading (desktop) | People like you / Member Success Stories | They started exactly where you are / People Who Made It |

**All active functionality is untouched.** `isPreStarted = overviewState === 'pre_started'` is a read-only flag; every active code path is preserved in the `else` branch.

---

### Overview Tab (`OverviewContent`)

**Props:**
```typescript
function OverviewContent({ overviewState = 'active', setOverviewState }: {
  overviewState?: OverviewState;
  setOverviewState?: (s: OverviewState) => void;
})
```

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

8. **Complete Today's Journey** — Eyebrow "MONTH 2 · BUILD HEALTHY HABITS", section renamed from "Your Health Programme". Habits checklist card on the left. Right side replaced with the **`EarnTodayCarousel`** (horizontal swipe, 9 cinematic cards). H+ score pill replaces old "Log activity" button in the section header.

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

#### `WorkflowCard({ imgSrc, icon, title, description, badge? })`
- 16px radius, 100px image with dark gradient overlay
- Optional `badge` prop: renders a small white pill top-left of the image (10px/700, `rgba(255,255,255,0.92)` bg, 20px radius) — used by Daily Nudges card ("Reminders")
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

**State:** `discoveryDone: boolean[]` (8 items, one per mission). `handleDiscoveryToggle(i)` toggles completion for unlocked missions.

**Mobile sections (6, top to bottom):**
1. Hero (300px) — "Know Your Health" h2, Day 12/30, progress bar, "Continue Journey" CTA
2. Health Journey timeline — 5-node vertical milestone path with spine line
3. **Your Month 1 Discovery Journey** — `DiscoveryJourneySection` (horizontal scroll carousel of 8 mission cards, "Your Health Story" progress widget)
4. **My Transformation Story** — `MonthTransformationStory monthNum={1}`
5. **DailyOperationsSection monthNum={1}** / **BiomarkerProgressShowcase**
6. **Insights You've Unlocked** — dynamic insight cards driven by `discoveryDone`; empty state when none completed. Followed by Your Starting Point baseline grid and Month 2 Preview.

**Desktop sections — `m1-dt-*` classes:**

1. **Discovery Hero Workspace** (`m1-dt-hero-workspace`, 65/35 grid, 600px min-height):
   - LEFT 65%: Cinematic full-bleed hero, 60px/900 "Know Your Health" title, animated progress bar, "Continue Journey →" CTA.
   - RIGHT 35%: Dark forest panel (`#071209 → #0f2014`), Health Journey timeline in dark style.

2. **Your Month 1 Discovery Journey** (`DiscoveryJourneySectionDesktop`) — white band. Header: "Your Month 1 Discovery Journey" (44px/900) + "Your Health Story" progress widget (right, 280px). Below: `m1-dt-dj-carousel` horizontal scroll — 8 cinematic cards (`m1-dt-dj-card`, 320px → 360px at 1400px+). Each card shows insight preview before completion, unlocked insight rows after. Blueprint card (Mission 8) locked until missions 1–7 complete.

3. **My Transformation Story** — `MonthTransformationStory monthNum={1}`, full-width full-colour.

4. **DailyOperationsSection monthNum={1}** / **BiomarkerProgressShowcase**

5. **Insights You've Unlocked** (`m1-dt-section m1-dt-section-sage`, `#EEF3EF`):
   - Header: "Insights You've Unlocked" eyebrow + "Your health story, as it unfolds." (40px/900) + 3 baseline stat chips (Weight / Blood Sugar / Blood Pressure).
   - Empty state: centred dashed card with 🔍 prompt.
   - Populated: `m1-dt-insights-grid` (4-col, `align-items: start`) — `m1-dt-insight-featured` (spans 2 cols, 36px padding, "Biggest Opportunity" label, first unlocked insight enlarged) + `m1-dt-insight-card` for remaining insights (type badge top-right, 24px padding).

6. **Your Starting Point** (white band, 50/50 `m1-dt-discovery-workspace`) — What We've Learned 2×2 + baseline metrics 2×2.

7. **Month 2 Preview** (cinematic full-bleed image banner, 480px min-height).

**Discovery data constants** (module-level, before `Month1ActiveContent`):

- `DISCOVERY_MISSIONS` — 8 objects. Each: `id`, `title`, `description`, `cta`, `insightPreview`, `time`, `img`, `gradient`, `accent`, `accentBg`, `locked` (only id=7), `insights: DiscoveryInsight[]`.
- `DiscoveryInsight` type: `{ icon, label, text, type ('Opportunity'|'Priority'|'Goal'|'Habit Pattern'|'Strength'|'Blueprint'), color, bg, border }`.
- `unlockedInsights` — computed inline: `DISCOVERY_MISSIONS.flatMap((m, i) => discoveryDone[i] ? m.insights.map(ins => ({...ins, missionTitle: m.title})) : [])`.

**`m1-dt-*` CSS class additions:**
| Class | Purpose |
|---|---|
| `m1-dt-discovery-journey` | White band wrapper for `DiscoveryJourneySectionDesktop` |
| `m1-dt-dj-inner` | `max-width: 1600px; padding: 80px 80px 72px` (96px at 1400px+) |
| `m1-dt-dj-carousel` | Horizontal scroll, `scroll-snap-type: x mandatory`, thin scrollbar |
| `m1-dt-dj-card` | `flex-shrink: 0; width: 320px` (360px at 1400px+), `border-radius: 20px`, hover lift |
| `m1-dt-insights-grid` | 4-col grid, `gap: 20px`, `align-items: start` |
| `m1-dt-insight-featured` | `grid-column: span 2`, `border-radius: 28px`, `padding: 36px 32px` |
| `m1-dt-insight-card` | `border-radius: 24px`, `padding: 24px 22px`, hover lift |

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

### Month 2 Tab (`Month2Content`) — Foundation Building Experience

**Design philosophy:** Confidence through consistency. The user should feel "I am becoming the kind of person who follows healthy habits." Sections removed: Today's Execution Center (duplicate of Complete Today's Journey), Results Dashboard / Five Pillars gallery (duplicate of Proof Your Efforts Are Working). Replaced with a compact coaching reinforcement block before Month 3 Preview.

**State:**
```typescript
const [photos, setPhotos] = useState<string[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
```

**Mobile section order (top to bottom):**
1. **Hero** (300px) — Walking photo, "Month 2 · In Progress" pill, "Build Healthy Habits" h2, clinical label, progress bar + "83% Consistent" pill.
2. **Your Momentum** — 3 dark gradient cards: `+900 daily steps` / `82% meal adherence` / `14 day streak`.
3. **My Transformation Story** — `MonthTransformationStory monthNum={2}` (passes `photos`, `handleFileChange`, `fileInputRef`).
4. **DailyOperationsSection monthNum={2}** / **BiomarkerProgressShowcase**
5. **Your Foundations Are Taking Shape** (`m2-mobile-only` wrapper, `padding: 24px 24px 0`):
   - Section header (20px/900 title, muted subtitle)
   - Strongest Foundation — 220px cinematic image card (movement photo, gradient, "Your Strongest Foundation" eyebrow, "Daily Movement" pill, headline + 2 stat pills)
   - This Week's Focus — white card, gold eyebrow, "Protein At Breakfast" title, copy
   - Coach Insight — sage-tinted card, Dr. Ananya avatar, italic quote
6. **Month 3 Preview** — cinematic 200px image card, "Coming Next" eyebrow, 4 frosted tag pills.

**Desktop section order — `m2-dt-*` classes:**
1. **Hero + Momentum Workspace** (`m2-dt-hero-workspace`, 70/30 grid, 580px min-height):
   - LEFT 70%: Cinematic walking photo, gradient layers, 56px/900 "Build Healthy Habits", animated 47% progress bar, "83% Consistent" pill, "Continue Journey" white CTA button.
   - RIGHT 30% (`m2-dt-hero-right`, dark forest `#071710 → #0d1f14`): "Your Momentum" header, 3 stacked frosted cards (steps / meals / streak, large 36px values, ghost emoji watermarks).
2. **My Transformation Story** — `MonthTransformationStory monthNum={2}`.
3. **DailyOperationsSection monthNum={2}** / **BiomarkerProgressShowcase**
4. **Your Foundations Are Taking Shape** (`#EEF3EF`, `padding: 56px 64px`):
   - Compact header: "Month 2 · Foundations" eyebrow + 32px/900 title (no large editorial paragraph).
   - `m2-dt-foundations-workspace` (65/35 grid, `gap: 32px`):
     - LEFT 65%: Cinematic card (`minHeight: 360px`, `border-radius: 24px`) — movement photo, "Your Strongest Foundation" eyebrow, "Daily Movement" pill, 26px/900 headline, body copy, 3 stat pills, "View Habit Progress" ghost CTA.
     - RIGHT 35% (`m2-dt-foundations-right`, flex column, `gap: 20px`): Coach Insight card (sage-tinted, Dr. Ananya avatar 40px, italic quote) + This Week's Focus card (white, gold eyebrow, "Protein At Breakfast" 18px/900, copy, "Learn Why" CTA).
5. **Month 3 Preview** (cinematic full-bleed banner, `minHeight: 400px`) — dark navy gradient, animated indigo glow, 48px/900 "Sleep Better, Feel Better" title, 4 frosted tag pills, frosted countdown card ("16 days · Jul 9, 2026").

**`m2-dt-*` CSS classes:**
| Class | Purpose |
|---|---|
| `m2-mobile-only` / `m2-desktop-only` | Visibility toggles |
| `m2-dt-page` | `max-width: 1600px` container |
| `m2-dt-section` | `padding: 72px 64px` (88px 80px at 1400px+) |
| `m2-dt-section-sage` | `background: #EEF3EF` |
| `m2-dt-hero-workspace` | 70/30 grid, `min-height: 580px` (660px at 1400px+) |
| `m2-dt-hero-left` | Relative, overflow hidden |
| `m2-dt-hero-right` | Dark forest gradient, flex column, bottom-justify |
| `m2-dt-story-workspace` | 70/30 grid — used inside `MonthTransformationStory` |
| `m2-dt-foundations-workspace` | 65/35 grid, `gap: 32px`, `align-items: start` |
| `m2-dt-foundations-right` | Flex column, `gap: 20px` |

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

## 7. Overview Page (`overview/page.tsx`)

**Purpose:** Programme overview / onboarding landing page. Shown to prospective or not-yet-started members; also accessible during active programme as a programme summary.

**Navigation model:** Standalone page at `/overview`. Not part of the Today tab system — no back nav pattern.

**Demo toggle:** A fixed `Preview` segmented control in the top-right corner (`top: 64px, right: 16px, z-index: 500`, dark forest background) toggles `status` between `'not_started'` and `'active'` via `useState<ProgramStatus>`.

**State:**
```typescript
type ProgramStatus = 'not_started' | 'active';
const [status, setStatus] = useState<ProgramStatus>('not_started');
```

### `NotStartedOverview` — Pre-programme experience

Marketing/onboarding view. 8 sections, all with `FadeIn` scroll-reveal animations (`whileInView`, `once: true`).

**Sections:**
1. **Hero** — Dark cinematic (`linear-gradient(155deg, #0A1A0C → #2A4030)`), 3 ambient radial glows. Centred `max-width: 760px`. Animated eyebrow pill, `clamp(32px,5vw,58px)` headline "A healthier, happier version of you starts here.", two CTAs: "Start My Transformation" → `/today?tab=month1` (sage primary) + "Explore The Journey" → `#roadmap` (ghost). 3 trust stats: 6 / 180+ / 5.
2. **What could change in 6 months?** — White band. `ns-outcome-grid` (2-col → 4-col at 640px+). 8 `OUTCOMES` cards with sage tinted gradient background and hover lift.
3. **Your Transformation Roadmap** (`id="roadmap"`) — Surface band. Vertical `MONTHS` list (max-width 760px). Each month is an expand/collapse button (`expandedMonth` state). Collapsed: white card with month badge, theme label, title. Expanded: dark gradient (per-month `m.gradient`), description + 4 `checkpoints` with `Check` icons. `ns-roadmap-line` SVG connectors between months.
4. **What you'll receive** — White band. `ns-feature-grid` (2-col → 4-col at 768px+). 8 `FEATURES` cards with hover border highlight.
5. **Your transformation story** — Dark forest cinematic band (`#0D1A10 → #2A4030`). 3-stage `ns-story-grid` (1-col → 3-col): Today / Month 3 / Month 6 — each with emoji, label, subtitle, description copy.
6. **Why people succeed** — Surface band. `ns-reasons-grid` (1-col → 2-col → 3-col). 5 `REASONS` cards with sage check icon and hover lift.
7. **Your first month** — White band. Single dark forest card (max-width 760px) — Month 1 overview with `MONTH1_ITEMS` checklist + "Begin Month 1" CTA → `/today?tab=month1`.
8. **Final CTA** — Dark forest cinematic band. Centred 48px headline + sage primary CTA.

**Local data constants:** `MONTHS` (6 entries — `num`, `theme`, `title`, `description`, `accent`, `accentLight`, `gradient`, `dotColor`, `checkpoints[]`), `OUTCOMES` (8 items), `FEATURES` (8 items), `REASONS` (5 items), `MONTH1_ITEMS` (6 strings).

**`FadeIn` component:** `motion.div` with `initial={{ opacity: 0, y: 18 }}`, `whileInView`, `viewport={{ once: true, margin: '-40px' }}`, optional `delay` prop.

**CSS classes (inline `<style>`):**

| Class | Purpose |
|---|---|
| `ns-mobile` / `ns-desktop` | Dual-render toggles (desktop activates at 1024px+) |
| `ns-dt-inner` | `max-width: 1200px; padding: 0 64px` |
| `ns-dt-section` / `ns-dt-section-sm` | `96px / 72px` vertical padding |
| `ns-outcome-grid` | 2-col → 4-col responsive grid |
| `ns-feature-grid` | 2-col → 4-col responsive grid |
| `ns-roadmap-line` | Vertical connector line (2px, sage gradient, 40px tall) |
| `ns-cta-primary` | Sage green CTA button with hover lift |
| `ns-cta-secondary` | Ghost CTA button on dark backgrounds |
| `ns-reasons-grid` | 1-col → 2-col → 3-col responsive grid |
| `ns-story-grid` | 1-col → 3-col responsive grid |

### Active state

When `status === 'active'`: renders `ContinueJourneyBanner` component + a white card redirecting to `/today`.

**`ContinueJourneyBanner`:** Dark forest card (`#1C2B1E → #3A5C3E`). Left: conic progress ring (47% filled), month label, Day 14 of 30, % complete + days remaining. Right: "Continue Journey →" ghost button → `/today?tab=month2`. Bottom: animated Framer Motion progress bar (width 0 → 47%). Constants: `ACTIVE_MONTH_NUM = 2`, `ACTIVE_PCT = 47`, `ACTIVE_DAY = 14`, `ACTIVE_DAYS_TOTAL = 30`.

---

## 8. Progress Page (`progress/page.tsx`)

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

## 9. Community Page (`community/page.tsx`)

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

## 10. Journey Page (`journey/page.tsx`)

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

## 11. Mobile App (`apps/mobile`)

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

## 12. Component Inventory

### Web Components

| Component | File | Purpose |
|---|---|---|
| `MiniBarChart` | `today/page.tsx` | 7-bar CSS chart |
| `Badge` | `today/page.tsx` | poor/fair/good status |
| `MetricCard` | `today/page.tsx` | Health metric card with chart |
| `WorkflowCard` | `today/page.tsx` | Coaching toolkit tile (still used in mobile Health Programme section; desktop replaced by `EarnTodayCarousel`) |
| `EarnTodayCarousel` | `today/page.tsx` | **Primary execution hub.** Horizontal-scroll carousel of 9 cinematic action cards (200×250px). Cards: Meal, Exercise, Water, Sleep, Sunlight, Meditation, Mood, Biomarkers, Daily Nudges. Full-bleed photography, dark gradient overlay, glassmorphism status pill (top-right), H+ badge bottom-left. Completion state: sage ring shadow + tinted overlay. Rendered in both the mobile (`ov-prog-inner-split` right column) and desktop dark band (replacing "Your Tools" carousel). Props: `categoryProgress`, `hplus`, `onOpen`, `loggedToday`. |
| `ActionLoggingModal` | `today/page.tsx` | **Premium cinematic logging modal — unified framework.** Centered dark modal (`max-width: 760px`, `border-radius: 28px`, dark forest `#0a1a0d`), spring scale-in, backdrop blur 8px. **Unified header** (all steps except success): ‹ back button (mid-flow, computed from `backMap` per type) or × close (entry step), activity label in uppercase, live H+ reward pill showing remaining cap for that category (e.g. "+4 H+ available" or "✓ Cap reached"). **Shared framework components** defined inside the function: `StepIndicator` (segmented progress bar, `current/total`, per-flow accent colour — same component across all 8 flows), `HeroImageBand` (180px full-bleed image, `sublabel` eyebrow, `coachNote` italic line), `ActivityDateTimeSelector` (see below), `LastLoggedBar` (historical context text, italic, muted — not KPI metrics), `SuccessScreen` (universal, see below). **`ActivityDateTimeSelector`** — two glassmorphism pill selectors placed below `StepIndicator` on every step of every flow: (1) **Date pill** — displays "Today", "Yesterday", or `formatDateDisplay(ISO)` (e.g. "Jun 18, 2026"). Backed by a hidden native `<input type="date" max={todayISO}>` — tap opens OS date picker. Default: today's ISO date. (2) **Time pill** — displays formatted 12h time (e.g. "2:28 PM"). Backed by a hidden native `<input type="time">` — tap opens OS time picker. State: `logDate: string` (ISO `'YYYY-MM-DD'`), `logTime: string` (24h `'HH:MM'`). Both reset in `close()`. Both flow through to `sheet.logDate`/`sheet.logTime` at every step transition and are shown on the success screen. **No KPI dashboard metrics** inside logging flows — no "X meals logged today", no targets, no streak counts, no goal progress bars. The only contextual information shown is historical (e.g. "Last reading: Blood Pressure · 118/76 · 3 days ago" via `LastLoggedBar` on the biomarker picker; "Sleep is typically logged in the morning for the previous night" hint on sleep step 1). **`SuccessScreen`** — unified tailored success, auto-closes after 3.2s. Contains: animated sage/gold ambient glows, spring check badge, `details` prop (array of `{icon, label, value}` pill cards showing what was actually logged — activity/duration/intensity for exercise, hours/quality/sunlight for sleep, glucose value/context for biomarkers, mood label/influences for mood etc.), `+{pts} H+` in 52px gold, score transition (`prev → new`), 🔥 streak pill, italic coaching subtitle. **Meal (5-step plan path, 3 alternative paths):** `slot-select` → `plan-meal` → `adherence` → `adherence-changes` (conditional) → `components` → `portion` → `success`. Custom path: `slot-select` → (any step) → `custom-meal` → `success`. History path: `plan-meal` tap → `portion` → `success`. Every step has `HeroImageBand` (slot image), `StepIndicator` (1–5/5), `ActivityDateTimeSelector`. **Portion step** requires explicit chip selection — no silent 100% default; submit button disabled until a chip is tapped. **Exercise (4 steps):** `pick` (8 cinematic image cards: Walk/Running/Cycling/Strength/Yoga/Swimming/Sports/Stretching) → `duration` (premium glassmorphism selector: large 80px number, draggable, `−`/`+` circular 64px buttons with long-press acceleration, quick-select strip below of 6 preset cards 15/20/30/45/60/90 min that sync back to the selector; encouragement copy keyed to range; "Confirm X min →" CTA) → `intensity` (4 list rows: Easy/Moderate/Vigorous/Athletic with colour accent bars) → `reflection` (2×2 feeling cards: Energising/Good/Challenging/Very Hard, log button required) → `success`. State: `exerciseDuration` (number, default 30), `longPressRef`, `dragStartY`, `dragStartVal`. **Water (2 steps):** `pick` (premium hydration counter: large glass count with 💧 emoji, `−`/`+` 60px circular buttons, animated 💧×10 progress row "X/10 glasses today", ml label below, motivational message keyed to range, "Log X Glasses (Yml) →" CTA) → `context` (4 time-of-day cards + "Skip · Log now") → `success`. State: `waterGlasses` (number, default 1). **Sleep (4 steps):** `bedtime` (combined bedtime + wake time step — two premium tappable `<motion.button>` selector cards that call `showPicker()` on hidden off-screen `<input type="time">` refs; live "Estimated Sleep" duration card with animated copy keyed to duration range; `to24()`/`to12()` converter helpers; `bedtimeInputRef`/`waketimeInputRef` refs; `LastLoggedBar` hint) → `quality` (4 list rows: Excellent/Good/Fair/Poor) → `interruptions` (4 chips: 0/1/2/3+) → `sunlight-prompt` (2 large cards: Yes/No + skip) → `success` (shows duration, quality, sunlight details). Step count reduced from 5 to 4 (bedtime+waketime merged into one screen). State: `sleepBedtime` (default '10:30 PM'), `sleepWaketime` (default '6:30 AM'), `bedtimeInputRef`, `waketimeInputRef`. **Sunlight (1 step):** `pick` (premium experience — benefit reinforcement card showing live minute count + "Supports: Energy / Sleep Quality / Circadian Rhythm" checkmarks; glassmorphism duration selector with breathing amber glow, 80px number, 64px `−`/`+` buttons, long-press; coaching message keyed to range; "Log X min of Sunlight →" CTA) → `success`. State: `sunlightMinutes` (default 10), `sunlightLongPressRef`. **Meditation (multi-path flow):** `pick` (mindfulness check-in — two premium choice cards: "I Already Meditated" / "I'd Like To Meditate Now") → **Path A** `log-duration` (premium duration selector + "Log X min →" CTA, awards +4 H+) → `success`. **Path B** `feeling` (5 emotional state cards: Overwhelmed/Stressed/Distracted/Tired/Feeling Good, each with supporting microcopy) → `session-prep` (recommendation card keyed to feeling — title/description/suggested duration — + duration selector + "▶ Begin Session" CTA) → `active` (full-screen live timer experience: dark premium gradient, breathing circle animation expanding/contracting on 3.8s cycle with Inhale/Exhale label, mm:ss countdown, thin progress bar, rotating gentle prompts every 2 min, Pause/Resume + End Session controls; timer interval started inline when step renders if not already running) → `post-feeling` (5 emoji reflection cards: 😔/😐/🙂/😌/😁) → `success` (shows mood arrow, session length, +4 H+). State: `meditationMinutes` (default 10), `meditationSecsLeft`, `meditationPaused`, `meditationPromptIdx`, `breathPhase` ('inhale'|'exhale'), `meditationTimerRef`, `meditationBreathRef`, `meditationLongPressRef`. LoggingSheet adds: `feeling?`, `postFeeling?`, `sessionType?: 'log'|'live'`. **Mood (3 steps):** `pick` (3×2 grid: 😁 Great/🙂 Good/😐 Okay/😔 Low/😣 Stressed/😡 Frustrated) → `influences` (multi-select chips: Work/Family/Health/Sleep/Exercise/Food/Relationships/Finances/Travel/Self Care/Other + "Skip — log now") → `reflection` (contextual journal prompt textarea + "Skip reflection") → `success` (shows mood label + top influences). **Biomarkers (redesigned hub + 4 paths):** `pick` — premium progress hub (no image cards; full-width stacked progress cards showing last value, trend badge e.g. "↓ 2.8 kg since Month 1", last-updated age, animated entrance; tap opens metric). Glucose: `glucose-context` (5 list rows) → `glucose-value` (premium ± selector at 94 default, live interpretation message, "Save X mg/dL →" CTA) → `success`. BP: `bp-entry` — **single-screen** (large live "SYS / DIA" preview; two side-by-side panels each with 44px animated value + 44px `−`/`+` buttons; live coloured interpretation badge: Normal Range/Slightly Elevated/Above Normal/High; "Save SYS/DIA mmHg →" CTA). Weight: `weight-value` (premium ± selector at 70.4 kg default stored ×10; Last Reading + Change context cards; live encouragement copy keyed to delta; "Save X kg →" CTA) → `weight-timing` (2 cards: Morning/Evening) → `success`. Waist: `waist-value` (premium ± selector at 90 cm default; Last Reading + Change context cards; measurement tip; encouragement copy; "Save X cm →") → `success`. **All biomarker successes** show a custom per-metric success screen (large reading as headline, trend badge, story copy, ✓ +2 H+ pill, Done CTA) rather than the generic `SuccessScreen`. State: `bioNumVal` (default 700, used for all ± selectors; weight stored ×10), `bioNum2Val` (default 800, used for BP diastolic), `bioLPRef`, `bioLP2Ref`. **`LoggingSheet` union:** Meal — `logDate: string` (ISO), `logTime: string` (24h HH:MM). Exercise — adds `intensity`, `feeling`. Water — adds `context`. Sleep — adds `bedtime`, `waketime`, `quality`, `interruptions`, `morningLight`. Meditation — adds `feeling?`, `postFeeling?`, `sessionType?: 'log'|'live'`. Mood — adds `moodLabel`, `influences[]`. Biomarker — adds `value2` (BP diastolic), `context`, `timing`. Biomarker step union updated to: `'pick' | 'glucose-context' | 'glucose-value' | 'bp-entry' | 'weight-value' | 'weight-timing' | 'waist-value' | 'success'`. |
| `ArticleCard` | `today/page.tsx` | Editorial content card |
| `Month1Content` | `today/page.tsx` | Demo toggle wrapper — injects `m1-*` CSS, renders `Month1ActiveContent` or `Month1CompletedContent` |
| `Month1ActiveContent` | `today/page.tsx` | Dual-render. State: `discoveryDone[8]`. Mobile — Hero, Health Journey timeline, **DiscoveryJourneySection** (carousel + "Your Health Story" progress), **MonthTransformationStory**, **DailyOperationsSection**, **BiomarkerProgressShowcase**, **Insights You've Unlocked** (dynamic, empty state when none), Starting Point, Month 2 Preview. Desktop (`m1-dt-*`) — Discovery Hero Workspace (65/35), **DiscoveryJourneySectionDesktop** (white band, carousel 320px cards, "Your Health Story" widget), **MonthTransformationStory**, **DailyOperationsSection**, **BiomarkerProgressShowcase**, **Insights You've Unlocked** (4-col `m1-dt-insights-grid`: featured card spans 2 cols + regular insight cards), Starting Point 50/50, Month 2 Preview. The "Focus on Awareness, Not Perfection" mission checklist was removed. |
| `Month1CompletedContent` | `today/page.tsx` | Dual-render: Mobile — 7 sections. Desktop (`m1-dt-*`) — 5 sections: Completion Hero, Achievement Workspace (70/30), Journey Reflection (60/40), Next Chapter dark band, Share Achievement (60/40) |
| `Month2Content` | `today/page.tsx` | Dual-render active month. State: `photos[]`, `fileInputRef`. **Removed:** `goalChecked`, `HABIT_PILLARS`, Today's Execution Center, Results Dashboard, Five Pillars gallery. Mobile — Hero, Your Momentum (3 dark cards), **MonthTransformationStory**, **DailyOperationsSection**, **BiomarkerProgressShowcase**, **Your Foundations Are Taking Shape** (cinematic foundation card + This Week's Focus + Coach Insight), Month 3 Preview. Desktop (`m2-dt-*`) — cinematic hero (70/30), **MonthTransformationStory**, **DailyOperationsSection**, **BiomarkerProgressShowcase**, **Your Foundations Are Taking Shape** (`#EEF3EF`, 65/35: left cinematic card 360px min-height / right: Coach Insight + This Week's Focus stacked), Month 3 Preview banner. |
| `LockedMonthContent` | `today/page.tsx` | Dual-render future chapter: Mobile — grayscale preview + full-colour MonthTransformationStory → **DailyOperationsSection** → **BiomarkerProgressShowcase** + unlock CTA. Desktop (`lm-dt-*`) — Cinematic Hero (70/30), Chapter Preview (35/65), Pillars Gallery (4-col), Outcomes Dashboard (4-col), Transformation Story (full colour), **DailyOperationsSection**, **BiomarkerProgressShowcase**, Cinematic CTA banner |
| `DailyOperationsSection` | `today/page.tsx` | **Reusable daily execution hub inserted on all 6 monthly tabs, immediately after `MonthTransformationStory`.** Props: `monthNum: number`. Reads live data from `useHPlusStore()`. Owns its own `ActionLoggingModal` instance with shim dispatchers. **Desktop** (`dos-dt-section`, `#EEF3EF` sage band, `dos-dt-workspace` 70/30): Left 70% (`dos-dt-left`, `min-width: 0; overflow: hidden`) — dark forest container with `EarnTodayCarousel`. Right 30% (`dos-dt-right`, sticky `top: 88px`) — Mission Status card (dark forest, 120px SVG ring with sage→gold gradient, completion fraction, H+ earned badge, 5-item animated checklist) + Daily Streak card (white, 🔥, streak/30-day bar). **Mobile** (`dos-mobile-only`, `#EEF3EF`): header → Mission Status → Streak → carousel. CSS classes: `dos-mobile-only`/`dos-desktop-only`, `dos-dt-section`, `dos-dt-inner`, `dos-dt-workspace`, `dos-dt-left`, `dos-dt-right`. |
| `MonthTransformationStory` | `today/page.tsx` | Shared per-month story component inserted on all 6 month tabs. Props: `monthNum`, `uploadedPhotos?`, `onUpload?`, `fileRef?`. **Desktop architecture:** The component is fully self-contained — it owns its own section wrapper (`mts-dt-section`: `background: #EEF3EF`, `padding: 72px 64px`, `88px 80px` at ≥1400px), inner container (`mts-dt-section-inner`: `max-width: 1400px; margin: 0 auto`), and section header ("Your Documentary" eyebrow + "My Transformation Story" h2 at 32px/900). All call sites pass a bare `<MonthTransformationStory />` with no outer wrappers — layout is identical across all months. **Mobile sections** top-to-bottom: (1) **Story header** — dark gradient with 2 animated Framer Motion glows + 3 stat chips; visual identity from `STORY_HEADER_DESIGN[monthNum]`. (2) **Transformation reel** — 5 circular photo slots with gradient ring (uses uploaded photos). (3) **"Capture Today's Win" CTA strip** — file upload interface. (4) **Journey Highlights 2×2 grid** — month-specific achievements from `STORY_MILESTONES[monthNum]`. (5) **"View My Complete Journey" CTA** → `/journey`. (6) **`NutritionStrategyCard`** — `variant="default"` in the mobile layout; `variant="month"` in the desktop right column. (7) **Reflection card** — prompt + future vision copy from `CHAPTER_STORY_DATA[monthNum].reflectionPrompt` / `futureCopy`. **Desktop layout** (`mts-dt-workspace`, 70/30 grid): Left 70% (`mts-dt-left`, `gap: 24px`) — cinematic story header, photo reel card (`mts-dt-reel-grid` 5-col), upload CTA button, documentary journey CTA. Right 30% (`mts-dt-right`, sticky `top: 88px`) — reflection card, journey highlights (`mts-dt-highlights-grid` 2×2), `NutritionStrategyCard variant="month"`. |
| `NutritionStrategyCard` | `today/page.tsx` | **Fixed-height nutrition entitlement demo component.** Prop: `variant?: 'default' \| 'month'` (default: `'default'`). Accepts a segmented demo control with 3 tabs — **Coach Supported**, **DIY Builder**, **Assigned Plan** — backed by `useState<NutritionMode>`. Also holds `useState<BlueprintData \| null>(null)` for the wizard result. **Architecture:** All 3 state panels are always in the DOM inside a single fixed-height content shell (`position: relative; height: contentH; overflow: hidden`). Each panel is `position: absolute; inset: 0` — only `opacity` and `pointerEvents` toggle on mode change. The outer container never reflows or changes height. `contentH` = `300px` (month) / `360px` (default). **State A — Coach Supported:** warm gold/amber gradient (`#2A1800 → #B07828`), 3 feature badges, optional Dr. Ananya avatar row (hidden in compact), headline, copy, gold CTA "Request My Meal Plan", "48 hours" note. **State B — DIY Builder:** warm cream palette (`#FAF5EC → #EDD9B0`), 3 earthy badges, optional framework icon row (hidden in compact), headline, copy, sage CTA **"Create My Own Meal Plan"** — clicking this opens `NutritionBlueprintWizard` via `useState<boolean>(false)`. On wizard completion, `handleBlueprintComplete(data)` stores the `BlueprintData`, closes the wizard, and sets `mode` to `'assigned'`. **State C — Assigned Plan:** dark forest (`#071710 → #163326`), header row (title from `generatePlanTitle(blueprint)` when a blueprint exists, else "Week 3 Nutrition Plan"; a "Generated from your Nutrition Blueprint" badge shown when blueprint active), "75% today", **peekable meal rail** (fixed height `railH`, `overflow-x: auto`, `scroll-snap-type: x mandatory`) — meals sourced from `generateMeals(blueprint)` when blueprint exists, else `NS_MEALS`. Right-edge fade gradient. Progress bar strip. Primary CTA **"View Full Meal Plan"** → `/daily-plan` (rendered as `<a>` tag). Ghost secondary "Request Adjustments". **Meal rail data:** `NS_MEALS` (5 default items — Breakfast/Lunch/Snack/Dinner/Weekend). When a blueprint is active, `generateMeals()` returns region+diet-matched meals from `MEAL_DB` inside `NutritionBlueprintWizard.tsx`. **Compact sizing** (`variant="month"`): `contentH=300px`, `bp=12px 14px`, `mealW=130px`, `imgH=50px`, `railH=128px`, Panel C gap `8px` — coach avatar and framework icon row hidden, headlines shortened. **Full sizing** (`variant="default"`): `contentH=360px`, `bp=16px 18px`, `mealW=152px`, `imgH=76px`, `railH=160px`, Panel C gap `9px`. **CSS classes:** `ns-seg`, `ns-seg-btn`, `ns-badge`, `ns-meal-rail`, `ns-meal-tile`, `ns-cta-p`, `ns-cta-g`, `ns-pbar-track`, `ns-pbar-fill`, `ns-assigned-ctas` — all injected as inline `<style>`. **Placements:** (1) `MonthTransformationStory` mobile right column — `variant="default"`. (2) `MonthTransformationStory` desktop right column — `variant="month"`. (3) Overview desktop — 2-col row below `ov-dt-story-workspace` (paired with Future Self Preview card) — `variant="default"`. (4) Mobile Overview — inserted after `<BiomarkerProgressShowcase />`, before Today's Focus card, with "Your Nutrition" eyebrow label — `variant="default"`. |
| `NutritionBlueprintWizard` | `components/NutritionBlueprintWizard.tsx` | **5-step personalised meal plan onboarding wizard.** Rendered as a React portal over the page (`createPortal` into `document.body`). Props: `onComplete(data: BlueprintData)`, `onClose()`. **Steps:** (1) Goal — 12 options, **single-select, auto-advances after 200ms** (`advanceAfterSelection` helper). (2) Medical Conditions — 16 options, multi-select, searchable chip grid (3-col desktop / 2-col mobile), Continue button required, supports "None" exclusive select. (3) Symptoms — 25 options, multi-select, same searchable chip grid, Continue button required. (4) Dietary Preference — 2 options (Vegetarian / Non-Vegetarian), large centred cards, **single-select, auto-advances after 200ms**. (5) Culinary Preference — 22 regional Indian cuisines, **single-select, auto-advances after 200ms**, searchable cards with short + sub-label. **Auto-advance helper:** `advanceAfterSelection(saveFn)` — calls `saveFn()` immediately (so selected state renders), then calls `goNext()` via `setTimeout(..., 200)`. Used on Steps 1, 4, 5. Footer Continue button only rendered for Steps 2 and 3. Header Back/Cancel always rendered for steps 0–4. **Flow after step 5:** Generation screen (dark forest gradient, 6 checklist items animated sequentially, 800ms final hold before advancing). Then **Meal Plan Preview** screen (step 6). **Meal Plan Preview:** full editorial scroll experience. Compact dark hero strip (plan title from `generatePlanTitle`, "Scroll through your daily meal journey below" subtitle). Vertical list of meal blocks — one per meal (Breakfast/Lunch/Snack/Dinner/Weekend). Each block: eyebrow row (32px coloured dot + time label + category heading), full-bleed hero image (220px mobile / 270px tablet / 300px desktop, `object-fit: cover`, gradient overlay, meal name + nutrition chips over image), horizontal options rail (`.nbw-meal-opts-rail`) containing one `.nbw-meal-opt-card` per option — architecture supports multiple options per slot. **Scroll-gated activation:** `previewScrolled` state (default `false`). `onScroll` handler on `.nbw-content` sets `previewScrolled = true` when within 160px of bottom. Activation card (`nbw-activate-card`) only appears (`AnimatePresence` fade-up, `y: 24→0`) after `previewScrolled` is true — inline at document end, not sticky/floating. Activation card: dark forest background, "Ready to start?" eyebrow, plan description, **"Activate My Meal Plan"** primary CTA, **"Edit My Answers"** secondary (returns to step 0 preserving all form state). **`goBack` from step 6** → `setStep(0)` (not step 4) — user returns to Goal selection with all prior answers intact. **`MEAL_IMGS`** lookup (~80 entries) maps every `MEAL_DB` meal name to a real Unsplash URL (`?w=800&q=85`); `FALLBACK` used when name not found. **On activation:** calls `onComplete(BlueprintData)`. **State:** `goal`, `conditions[]`, `symptoms[]`, `dietPreference`, `culinaryPreference`, `genProgress`, `previewScrolled`, `mounted`. **Container:** 980px centered modal on desktop (dark forest gradient, 28px radius, spring entrance animation). Full-screen on mobile. Frosted backdrop. `.nbw-content` padding overridden to `0` on step 6 (meal blocks are edge-to-edge). **Exports:** default `NutritionBlueprintWizard`, `type BlueprintData`, `generateMeals(blueprint): NsMeal[]`, `generatePlanTitle(blueprint): string`. `MEAL_DB` has ~24 entries covering South Indian, North Indian, Maharashtrian, Gujarati, Rajasthani, Bengali, Kerala, Kashmiri, Mughalai + default fallbacks. **CSS classes (preview screen):** `nbw-meal-block`, `nbw-meal-eyebrow`, `nbw-meal-dot`, `nbw-meal-hero-wrap`, `nbw-meal-hero-img`, `nbw-meal-opts-rail`, `nbw-meal-opt-card`, `nbw-meal-opt-img-wrap`, `nbw-meal-opt-img`, `nbw-activate-card` (all injected as inline `<style>`). |
| `BiomarkerProgressShowcase` | `today/page.tsx` | **Premium health intelligence showcase.** Dual-render architecture — separate mobile and desktop DOM trees. **Mobile** (unchanged): `bps-mobile-header` + `bps-mobile-chips` + `bps-mobile-track` — horizontal swipe carousel (`scroll-snap-type: x mandatory`) showing all 6 dark editorial cards (Weight, Blood Pressure, Waist, Glucose, Activity, Sleep) plus a final "Explore Every Health Trend" nav card → `/progress`. All mobile markup hidden at ≥1024px. **Desktop** (`bps-dt-shell`, shown at ≥1024px only): (1) **Header row** — large 44px/900 headline left, "SCROLL TO EXPLORE" hint + `ArrowRight` right. (2) **KPI chips strip** (`bps-dt-chips`) — 4 animated pills that count up from 0 on first viewport reveal via `IntersectionObserver`. (3) **Horizontal scrollable carousel** (`bps-dt-track`) — `overflow-x: auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`. Cards are `clamp(280px, 29vw, 360px)` wide → ~3.2 cards visible at once, all 6 biomarker cards shown. `useEffect` wires `wheel` events on `dtTrackRef` to convert vertical deltaY to horizontal scroll (only intercepted when not at edge). `cursor: grab` / `grabbing`. (4) Each **desktop biomarker card** (`bps-dt-card`) is 440px tall, 28px radius, 52px/900 value, chart rendered with `BpsChart tall` prop (larger, richer), month axis, frosted-glass insight quote. (5) **"Explore Your Complete Progress" final card** — dark forest gradient, ambient sage glows, large `ArrowRight` circle (56px top-right), editorial stacked copy ("Every biomarker. / Every milestone. / Every trend."), "View Progress →" badge, entire `<a>` clickable → `/progress`. No standalone CTA below the carousel. Placed in Overview desktop inside `<div className="ov-dt-bleed">` to break out of `ov-dt-body` padding. CSS injected as `bps-*` inline style classes. |
| `BpsChart` | `today/page.tsx` | SVG sub-component used by `BiomarkerProgressShowcase`. Props: `metric` (a `BPS_METRIC_DATA` entry) + optional `tall?: boolean`. **Standard** (W=240, H=88): used on mobile cards. **Tall** (W=320, H=160): used on desktop 440px cards — richer area fill (0.42 opacity), stronger glow (stdDeviation 4.5), larger endpoint rings, heavier line (3px). Both variants: smooth polyline (logged months solid, projected dashed), soft area fill with per-metric gradient, glowing endpoint (three-layer: large dim circle → coloured glow → white highlight dot), subtle logged dots, 2-line minimal grid. Per-metric unique `gradId` / `glowId` SVG filter IDs (tall variant prefixed `lg-`) avoid conflicts between multiple renders on the same page. |
| `HealthConciergeModal` | `(app)/layout.tsx` | Global FAB + responsive premium modal — mobile: 88vh bottom-sheet (spring slide), desktop: centered `min(92vw,1400px)×min(85vh,900px)` fade+scale modal with 65/35 column layout. **8 sections** (added YOUR DAILY NUDGES as section 6 in right col), conditional `HAS_COACHING` sections, GPU-composited, single-scroll-wrapper architecture |
| `NudgesPage` | `nudges/page.tsx` | Nudge Library — dual-render (`nudge-mobile-only`/`nudge-desktop-only`). Mobile: single-column cards. Desktop: dark hero band with stat cluster + filter pills, 2-col card grid. Filter pills for 13 health goals (Weight Loss + Reduce Blood Pressure pre-selected). `NudgeCard` (toggle + frequency badge + inline schedule editor). `ScheduleEditor` (time input + day checkboxes + save). `Toggle` (custom switch component). |
| `DesktopStoryCard` | `community/page.tsx` | Desktop-only story card — 240px cinematic image with gradient overlay, month badge (colour-coded), hover lift, expandable pull-quote with sage left-border |
| `LineChartLarge` | `progress/page.tsx` | Desktop SVG chart (760×280) — area fill under logged line, value labels, 5 gridlines, distinct logged vs projected visual |
| `JourneyIndicator` | `today/page.tsx` | 6-node programme stepper + animated chapter cover card (dark gradient hero with 3 Framer Motion glows + focus pills strip) — mobile version |
| `JourneyIndicatorDesktop` | `today/page.tsx` | Desktop variant of JourneyIndicator — phase stepper + chapter card, placed in `ov-dt-journey-left` (left column of `ov-dt-journey-workspace`). Chapter card hero reduced: `minHeight: 240px`, padding `32px 36px 36px`, icon 56px/18px, title 36px/900, tagline 14px. Focus pills padding `18px 36px 22px`. `CHAPTER_DESIGNS_DT` record provides per-month hero gradients and glow colours. Stepper uses `selectedPhase` prop with `onPhaseChange` callback to swap chapter via `AnimatePresence`. |
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

## 13. H+ Points System

### Overview

H+ is the member engagement and behaviour-reinforcement engine. Every healthy action earns 2 H+ points. Members start at 100 H+ (demo seeds at 428). Max 30 H+ per day from activity logging; biomarkers are counted outside the daily cap.

### Configuration (`lib/hplus-types.ts` — `HPLUS_CONFIG`)

```typescript
const HPLUS_CONFIG = {
  startingScore: 100,
  pointsPerActivity: 2,
  biomarkerPointsPerEntry: 2,
  biomarkerCapMode: 'outside_daily_cap',  // configurable — do not hardcode
  dailyMaxPoints: 30,
  dailyCaps: {
    meals: 14, exercise: 6, sleep: 2, sunlight: 2,
    water: 2, meditation: 2, medication: 2, mood: 2,
  },
  referralPaidMemberBonus: 1000,
  referralMilestoneBonus: 100,
}
```

### Shared Store (`lib/hplus-store.ts`)

Module-level singleton that survives Next.js client-side navigation within a session. **Also persisted to `sessionStorage`** (`key: 'hplus_session_state'`) so state survives full page reloads. Hydration happens at module load time — if a valid session entry exists it is used instead of `INITIAL_HPLUS`/`INITIAL_CATEGORIES`. Every `notify()` call serialises state to sessionStorage (score, categories, loggedToday array, newActivities with ISO timestamps). **Phase 2:** replace `logActivity()` with real API call.

**Exports:**
- `logActivity(category, points, label, value?)` — single write function. Updates score, todayPoints, category progress, loggedToday Set, newActivities array. Calls `persistState()` then notifies all subscribers.
- `useHPlusStore()` — React hook. Subscribes to store on mount, re-reads fresh state (handles back-navigation). Returns `{ hplus, categories, loggedToday, newActivities }`.
- `getState()` / `subscribe(fn)` — raw read + listener API for non-React contexts.
- `ActivityCategory` type: `'meal' | 'exercise' | 'water' | 'sleep' | 'sunlight' | 'meditation' | 'mood' | 'biomarker'` (singular)
- `CategoryProgress` interface: `{ category: string, emoji, label, current, max, hplusMax, color, accentBg }` — category uses **plural** keys (`'meals'`, `'biomarkers'`) matching `HPlusCategoryKey`
- `HPlusEngineState` interface: `{ score, todayPoints, todayMax, streak, longestStreak, monthPerfectDays, perfectWeeks, monthRank }`

**Key mapping:** Today page modal uses singular `ActivityCategory` keys; store `CategoryProgress` uses plural `HPlusCategoryKey` keys. `logActivity` maps `meal→meals`, `biomarker→biomarkers` internally. The `EarnTodayCarousel` also maps both ways for dispatch and `loggedToday` lookups.

### Demo Data (`lib/hplus-demo-data.ts`)

Static functions that return hardcoded data for the H+ page sections not yet driven by the store. **Phase 2:** replace each with an API call.

- `getDemoActivities()` — demo timeline entries (used as fallback when no session logs exist)
- `getAnalyticsData(period)` — day/week/month chart data
- `getMonthCalendar()` — June 2026 perfect-day heatmap
- `getAchievements()` — 8 achievements (4 earned, 4 locked), bronze/silver/gold/platinum tiers
- `getLeaderboardPreview()` — top 3 + current user at rank 12
- `getReferrals()` — 3 demo referrals

### H+ Page (`hplus/page.tsx`)

**Architecture: unified responsive** — single DOM tree, no dual-render. The old `hp-mobile-only` / `hp-desktop-only` split has been replaced with `hp-r-*` responsive CSS utility classes that adapt layout at `≥1024px`. Mobile and desktop see the same 8 sections, same data, same narrative — only grids and spacing adapt.

**Responsive CSS utilities (`hp-r-*`)** — all defined in an inline `<style>` inside `HPlusPage`:

| Class | Mobile | Desktop (≥1024px) |
|---|---|---|
| `hp-r-section-pad` | `padding: 40px 20px` | `padding: 72px 64px` |
| `hp-r-hero-pad` | `padding: 36px 20px` | `padding: 48px 64px` |
| `hp-r-inner` | full width | `max-width: 1440px; margin: 0 auto` |
| `hp-r-hero-grid` | flex column | `1fr 300px` grid, `gap: 56px` |
| `hp-r-65-35` | flex column | `65fr 35fr` grid |
| `hp-r-70-30` | flex column | `70fr 30fr` grid |
| `hp-r-50-50` | flex column | `1fr 1fr` grid |
| `hp-r-4col` | `2×2` grid | `repeat(4,1fr)` grid |
| `hp-r-3col` | flex column | `repeat(3,1fr)` grid |
| `hp-r-2col` | `1fr 1fr` grid | `1fr 1fr` grid (wider gap) |
| `hp-r-sticky` | no sticky | `position: sticky; top: 112px` |
| `hp-r-desktop-only` | `display: none` | `display: block` |
| `hp-r-mobile-only` | `display: block` | `display: none` |

**Page structure:** `HPlusPage` (data assembly) → `HPlusPageContent` (back nav + section orchestrator) → 8 `Sec*` components.

**Back nav placement:** The sticky "← Overview" bar (`position: sticky; top: 56px; height: 56px`) is rendered in `HPlusPageContent` as a sibling **before** `<SecHero>` — not inside the hero section. This matches the pattern used by Progress, Journey, and Community pages. `hp-r-sticky` uses `top: 112px` (56px global header + 56px back nav).

**Live data from store** (via `useHPlusStore()`):
- Hero score, streak, today points, month rank — all from `store.hplus`
- Category breakdown — from `store.categories`
- Today's timeline — `store.newActivities` (session-logged) prepended to `getDemoActivities()`
- **Day analytics** — `buildLiveDayAnalytics()` (inline in `HPlusPage`) computes cumulative H+ curves from `activities` bucketed into 8 two-hour slots (6AM→8PM). 3 dynamic insight strings. Used when `analyticsPeriod === 'day'`.
- **Calendar heatmap today cell** — overridden with live `todayPoints`, `todayBiomarkerPoints`, and `isPerfect`.

**Static demo data** (from `hplus-demo-data.ts`): week/month analytics, historical calendar cells, achievements, leaderboard, referrals.

**8 sections (`Sec*` components):**

1. **`SecHero`** — Dark cinematic (`#071310 → #060f10`). Simplified to three elements only. `hp-r-hero-grid`: left = eyebrow pill ("H+ Transformation Score") + `<h1>` headline ("Every healthy choice / compounds.") + supporting copy; right = premium glassmorphic H+ score centerpiece (220px ring, `CircularScore` 200px, `AnimatedCounter`, "H+ Points" gradient label, rank label). Removed: achievement chips (streak / rank / perfect days / chapter), momentum strip, 7-dot streak tracker. Mobile: stacks left then right. Ring sized 220px on both breakpoints; score font `clamp(44px,6vw,60px)`. Back nav rendered as a sibling in `HPlusPageContent`, not inside this section.

2. **`SecTodaysJourney`** — Surface `#FAFAF8`. `hp-r-65-35`: left = `DtActionPath` (completed group with success glow + H+ emphasis; pending group with hover-right affordance); right = `DtCommandCenter` (dark forest sticky card: 2×2 stats, perfect-day gold progress bar, streak, "Continue Today's Journey" CTA). Mobile: stacks action path above command center card.

3. **`SecMomentum`** — Dark forest. `hp-r-4col` (2×2 on mobile → 4-col on desktop) momentum cards: Current Streak / Best Streak / Perfect Days / Consistency % — each with icon, large value, encouraging copy. Below: `DtConsistencyWall` calendar in glassmorphic container — gold perfect-day cells, warm green strong days, white day labels.

4. **`SecAchievements`** — Warm stone `#F0EDE6`. `DtNextAchievementCard` (tier-coloured featured card, large progress bar, projected unlock). Below: **desktop** = 4-col `AchievementCard` grid (`hp-r-desktop-only`); **mobile** = horizontal swipe carousel of 220px cards (`hp-r-mobile-only`, `hp-scroll-hide`). Same achievements on both devices.

5. **`SecAnalytics`** — White `#fff`. `hp-r-70-30`: left = `DtHeroChart` (SVG area chart with combined + activity lines, legend, summary stats, Day/Week/Month segmented control); right sticky = `DtInsightPanel` (4 coaching insight cards: strongest habit / biggest H+ source / growth edge / potential weekly gain). Mobile: hero chart full-width, insight panel stacks below.

6. **`SecCategories`** — Sage `#EEF3EF`. **Desktop** (`hp-r-desktop-only`): `DtCategoryPerformance` 3-col priority groups (Already Strong / Growth Opportunities / Quick Wins). **Mobile** (`hp-r-mobile-only`): 2-col `RadialProgress` grid. Same categories on both.

7. **`SecCommunity`** — Dark forest. `hp-r-50-50`: left = `DtFeaturedTransformation` (member story card — Rajesh K., quote, stats, achievement chips); right = `LeaderboardPreview` (dark variant). Mobile: stacks featured story above leaderboard.

8. **`SecReferrals`** — Surface `#FAFAF8`. `DtReferralCelebration`: `hp-r-50-50` — left = celebration headline + social proof ("247 members joined") + gold "Share Your Journey" CTA; right = reward tier cards + active referrals list. Mobile: stacks left above right.

**Key sub-components (shared):** `AnimatedCounter` (rAF count-up), `CircularScore` (SVG arc, gradient + glow), `RadialProgress` (per-category ring), `AchievementCard` (tier-aware, `TIER_COLORS`), `LeaderboardPreview` (light + dark variant via `dark` prop), `ReferralSection` (legacy mobile referral — still used in `MobileHPlus`-era referral section).

**Desktop-only sub-components (also shown on mobile via responsive layout):** `DtActionPath`, `DtCommandCenter`, `DtConsistencyWall`, `DtNextAchievementCard`, `DtHeroChart`, `DtInsightPanel`, `DtCategoryPerformance`, `DtFeaturedTransformation`, `DtReferralCelebration`.

**CSS class prefix:** `hp-*` + `hp-r-*`. Defined in an inline `<style>` inside `HPlusPage`. Section backgrounds follow VitalPath banding: dark cinematic → `#FAFAF8` → dark forest → `#F0EDE6` → `#fff` → `#EEF3EF` → dark forest → `#FAFAF8`.

---

## 14. Data & State Management

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

**Interactive state in today/page.tsx (`OverviewContent`):**
- `habitsChecked` — toggles 5 daily habits
- `showSetup` — dismiss the upload labs banner
- `activeFilter` — Explore Health Topics pills
- `photos` (Month 2) — stores uploaded progress photo URLs
- `sheet` — controls which `ActionLoggingModal` is open and which step it's on (`LoggingSheet` discriminated union)
- `logDate: string` — ISO date `'YYYY-MM-DD'`, shared across all logging flows via `ActivityDateTimeSelector`, defaults to today, resets on modal close
- `logTime: string` — 24h `'HH:MM'`, shared across all logging flows, defaults to current time, resets on modal close
- `storeSnap` — live snapshot from `useHPlusStore()`: `hplus`, `categories`, `loggedToday`, `newActivities`

**H+ engine state** (shared via `lib/hplus-store.ts`, persists across navigation within the session):
- `hplus.score` — cumulative H+ score (starts 428 in demo)
- `hplus.todayPoints` / `todayMax` — today's progress toward 30 H+
- `hplus.streak` — current daily streak
- `categories[]` — per-category current/max counts (meals, exercise, water, sleep, sunlight, meditation, mood, biomarkers)
- `loggedToday` — Set of ActivityCategory strings logged this session
- `newActivities[]` — `LoggedActivity` entries created this session (prepended to demo timeline on H+ page)

---

## 15. Routing

| Route | Component | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Redirects → `/today` |
| `/onboarding` | `onboarding/page.tsx` | **Post-signup onboarding flow.** Rendered outside the `(app)` shell — no global header, no FAB, full-screen dark luxury aesthetic. 5 screens: (1) Welcome hero (Unsplash lifestyle photo, cinematic overlay, gradient headline), (2) Your Information (name/DOB/gender/height/weight/waist), (3) Goals (up to 3 from 5 categories, 29 goals total), (4) Health Conditions (multi-select chips incl. "Other Health Condition" with text reveal, "None" deselects all others), (5) You're All Set (Unsplash forest path photo, goal summary, 6-month roadmap). State: `step`, `userInfo`, `selectedGoals`, `selectedConditions`, `otherCondition`. Transitions: pure opacity fade (no lateral slide). In-flow CTAs — no `position:fixed` buttons. Progress bar fixed at top. Back nav shown on steps 2–4 only. **"Begin Month 1" CTA navigates to `/today?tab=overview&state=pre_started`** — landing the new member in the Pre-Started Overview experience rather than directly into Month 1. |
| `/overview` | `overview/page.tsx` | Programme overview / onboarding page. Demo toggle: `not_started` (8-section marketing/onboarding experience) vs `active` (ContinueJourneyBanner + redirect to `/today`). |
| `/today` | `today/page.tsx` | **Primary landing page** and navigation hub |
| `/hplus` | `hplus/page.tsx` | **H+ Points experience.** **Unified responsive** — single DOM tree, no dual-render. `hp-r-*` CSS utilities adapt layout at ≥1024px. Sticky "← Overview" back nav rendered in `HPlusPageContent` as a sibling before `SecHero` (not inside it). 8 `Sec*` sections: `SecHero` (headline + supporting copy + H+ score ring only — no chips or momentum strip), `SecTodaysJourney` (action path + command center), `SecMomentum` (4 momentum cards + consistency wall calendar), `SecAchievements` (next achievement card + desktop 4-col grid / mobile carousel), `SecAnalytics` (hero chart + insight panel), `SecCategories` (desktop priority groups / mobile 2-col grid), `SecCommunity` (featured story + leaderboard), `SecReferrals` (celebration layout). All data live from `useHPlusStore()` + demo fallbacks. Same narrative and information hierarchy on all devices. |
| `/today?tab=overview` | `OverviewContent` | Default — renders in `active` state |
| `/today?tab=overview&state=pre_started` | `OverviewContent` | **Pre-Started state** — transformation blueprint for enrolled members who haven't begun Month 1. Arrival point from onboarding completion. |
| `/today?tab=month1` | `Month1Content` | |
| `/today?tab=month2` | `Month2Content` | |
| `/today?tab=month3` | `LockedMonthContent` monthNum=3 | |
| `/today?tab=month4` | `LockedMonthContent` monthNum=4 | |
| `/today?tab=month5` | `LockedMonthContent` monthNum=5 | |
| `/today?tab=month6` | `LockedMonthContent` monthNum=6 | |
| `/progress` | `progress/page.tsx` | **Secondary.** Reached via "View Your Progress" carousel card. Sticky "← Overview" back nav. |
| `/community` | `community/page.tsx` | **Secondary.** Reached via "View All Stories" carousel card. Sticky "← Overview" back nav. |
| `/journey` | `journey/page.tsx` | **Secondary.** Transformation documentary page — 9 sections including cinematic hero, transformation timeline, comparison slider, photo reel, journey roadmap. Reached via "View Your Complete Journey →" CTA in `TransformationJourney` component. Sticky "← Overview" back nav. |
| `/daily-plan` | `daily-plan/page.tsx` | **Secondary.** Personalised Daily Meal & Exercise Plan — full-day transformation journey with cinematic hero, "Built Around You" profile cards, vertical timeline of 10 activities (hydration, movement, meals, recovery) each with a horizontal image-first carousel, Why This Supports Your Goal strip, weekly momentum section, **AI Disclaimer card**, dark forest closing. Reached via "View Full Meal Plan" CTA in `NutritionStrategyCard` Assigned Plan panel, and "Today's Meal & Exercise Plan" nav cards in Overview. Sticky "← Overview" back nav. `HAS_COACHING` constant defined at top of file (default `true`). |
| `/nudges` | `nudges/page.tsx` | **Secondary.** Nudge Library — 388 nudges from `lib/nudges-normalized.json`. Browse by health goal filter pills (13 goals; Weight Loss + Reduce Blood Pressure pre-selected for Priya). Toggle nudges on/off. Edit schedule inline (time input + day checkboxes). Reached via "Daily Nudges" WorkflowCard in Health Programme section and "Your Daily Nudges" card in HealthConciergeModal. Sticky "← Overview" back nav. CSS prefix: `nudge-*`. |
| `/today/compare` | `today/compare/page.tsx` | A/B prototype — IA comparison tool, not a production route |
| `/habits` | `habits/page.tsx` | Redirects → `/today` |
| `/meals` | `meals/page.tsx` | Redirects → `/today` |
| `/steps` | `steps/page.tsx` | Redirects → `/today` |
| `/sleep` | `sleep/page.tsx` | Redirects → `/today` |

**Navigation hierarchy:**
```
/onboarding
  └── "Begin Month 1" → /today?tab=overview&state=pre_started

/today?tab=overview&state=pre_started  (pre-started: transformation blueprint)
  └── "Start Month 1" → /today?tab=month1

/today  (primary hub, active member)
  ├── /hplus        (← Overview to return — H+ Points experience)
  ├── /progress     (← Overview to return)
  ├── /community    (← Overview to return)
  ├── /journey      (← Overview to return)
  ├── /daily-plan   (← Overview to return)
  └── /nudges       (← Overview to return)
```

---

## 16. Programme Naming System

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

## 17. Visual Design Principles

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

## 18. Development Commands

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

## 19. Known Constraints & Decisions

- **No backend yet** — All data is hardcoded. Member profile, habits, metrics are all mock values.
- **Inline styles** — The web app primarily uses inline styles for component-level styling rather than Tailwind classes, for portability and specificity. Tailwind is used in `globals.css` for base resets.
- **Today page is monolithic** — `today/page.tsx` contains all tab content as local functions. This is intentional for current phase — splitting into separate files is a future refactor.
- **Mobile app is separate from web** — They share types and programme data via packages but are independently maintained. Mobile uses React Native components; web uses HTML/CSS.
- **Stub routes** — `/habits`, `/meals`, `/steps`, `/sleep` redirect to `/today` as placeholders for future dedicated pages.
- **No auth** — No login flow exists. App loads directly to `/today`. The `/onboarding` page exists as a post-signup experience but is not gated — navigate to it directly at `/onboarding`.
- **Onboarding is stateless** — Data collected in the 5-screen onboarding flow (name, DOB, goals, conditions) is not persisted anywhere. The flow completes by redirecting to `/today?tab=overview&state=pre_started`. Persistence requires a backend integration.
- **Pre-started state is URL-driven** — `?state=pre_started` is read from `searchParams` on each render. There is no session or cookie storing it. The browser URL preserves it on refresh; navigating away loses it.
- **Demo user only** — All content is for "Priya", Month 2, moderate risk. No multi-user support yet.
- **No bottom navigation, no sidebar** — The mobile bottom nav and desktop sidebar have both been removed. The app is full-width at all screen sizes. `/today` is the primary entry point; Progress and Community are reached through contextual carousel nav cards and return via sticky "← Overview" headers.
- **Nav card pattern** — Any new secondary experience should follow the same pattern: a dark forest gradient nav card (`#1C2B1E → #3A5C3E`) appended to the relevant carousel on the Overview page, and a sticky back header (`top: 56px`, `ChevronLeft` + "Overview") on the destination page. `/daily-plan` follows this pattern — nav cards in both the mobile Overview footer and the desktop Overview closing section CTA group.
- **`/daily-plan` CSS prefix** — `dp-*`. Dual-render: `daily-mobile-only` / `daily-desktop-only`. All styles injected as inline `<style>` in `daily-plan/page.tsx`. Carousel component `RecommendationCarousel` uses `dp-rail-wrap` / `dp-rail`. Card types: `dp-rec-card` (hydration/movement/recovery), `dp-meal-card` (meals), `dp-snack-card`. All carousels are horizontal-scroll-only (`scroll-snap-type: x mandatory`) with no grid fallback. Image wrappers have `background: #e8ede9` placeholder colour to prevent white-flash on image load.
- **Month naming** — Always use the member-friendly title as the dominant h2. Clinical phase name is always present but rendered small and muted. Never swap the hierarchy. See §13 Naming System.
- **Demo toggle** — Month 1 has a "Demo View: Active / Completed" segmented control at the top. This is a prototype affordance and not production UI. Other months do not have this.
- **Future month philosophy** — Months 3–6 are full-content preview experiences (not teasers). Mobile body content has `grayscale(40%) opacity: 0.85`. The unlock CTA and `MonthTransformationStory` are always full-colour and outside the grayscale filter. On desktop, each month has a unique per-month colour identity (`DT_PAL` record in `LockedMonthContent`) — Month 6 is full colour with no desaturation at any breakpoint.
- **H+ store persistence** — `lib/hplus-store.ts` is a module-level singleton that survives client-side navigation. State is also written to `sessionStorage` (`key: 'hplus_session_state'`) on every `logActivity()` call and hydrated at module load, so it also survives full page reloads within the same browser session. The H+ pill in the header uses `<Link href="/hplus">` (Next.js client navigation) — not `<a href>` — so the singleton is never killed during normal in-app navigation. Phase 2: replace `logActivity()` with an API write and seed initial state from an API fetch on mount.
- **H+ key naming duality** — The modal uses singular `ActivityCategory` keys (`meal`, `biomarker`). The store `CategoryProgress` and `HPlusCategoryKey` use plural keys (`meals`, `biomarkers`). The mapping lives in `hplus-store.ts → toStoreCatKey()` and also inline in `EarnTodayCarousel` dispatch/lookup. Any new category logging must handle both.
- **H+ page Phase 2 plan** — **Day analytics** is now live (derived from `store.newActivities` + `getDemoActivities()`). **Calendar today cell** is live (overrides `getMonthCalendar()` output). Week/Month analytics charts, historical calendar cells, achievements, leaderboard, and referrals still use static demo data from `lib/hplus-demo-data.ts`. Replace each static function with an API call when the backend is ready.
- **`EarnTodayCarousel` replaces "Your Tools"** — The old paginated `WorkflowCard` carousel (with `toolsPage`/`directionRef`/`yt-*` CSS) has been fully removed. `yt-carousel-outer`, `yt-carousel-track`, `yt-arrow-prev/next`, `yt-dots`, `yt-dot`, `yt-dot-active` CSS classes are no longer in use.
- **Concierge modal routes** — `/goals`, `/meal-plan`, `/meal-plan/coach`, `/progress/selfie`, `/progress/biomarkers`, `/coach/message`, `/ai-coach`, `/ask`, `/briefing`, `/briefing/subscribe` are placeholder routes not yet built. Implement those pages before making the modal CTAs functional. `/nudges` and `/hplus` **are built** and functional.
- **Nudge data** — `lib/nudges-normalized.json` (388 entries) is the source of truth for the Nudge Library. All nudge state (toggle on/off, custom schedules) is local `useState` — not persisted. `Nudge` type: `{ id, health_goal, habit, nudge_primary, nudge_followup, trigger_type: 'time'|'context'|'interval'|'user_set', schedule_time, recurrence, default_enabled, user_customizable_time }`. Priya's demo goals are pre-selected: `Weight Loss` + `Reduce Blood Pressure`.
- **Nudge Library CSS** — All styles in `nudge-*` prefixed classes inside an inline `<style>` tag in `nudges/page.tsx`. Dual-render: `nudge-mobile-only` / `nudge-desktop-only` at 1024px+. No shared stylesheet entries needed.
- **`HAS_COACHING` flag** — Hardcoded `true` at top of `(app)/layout.tsx` (governs HealthConciergeModal sections) and separately at top of `daily-plan/page.tsx` (governs `AiDisclaimer` CTA). Both default to `true`. Replace with real entitlement check before shipping.

---

## 20. What Each Chatbot Prompt Should Include

When asking an AI to modify this codebase, specify:

1. **Which file** — e.g. `apps/web/app/(app)/today/page.tsx`
2. **Which function/section** — e.g. `OverviewContent`, `Month2Content`, `MetricCard`
3. **What to preserve** — Always mention: state, hooks, all existing sections, business logic
4. **What to change** — Be specific: spacing, colours, layout, typography
5. **Design constraint** — "Premium wellness aesthetic. No clinical styling. Generous whitespace."

---

---

## 21. Desktop Layout System (1024px+)

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
| `yt-*` | ~~Your Tools carousel~~ — **REMOVED.** Replaced by `EarnTodayCarousel`. These classes no longer exist in `OverviewContent`. | — |
| `hp-*` | H+ page internals — section bands, segmented control, card lift, badge glow keyframe, breathing animations | inline style in `hplus/page.tsx` |
| `hp-r-*` | H+ page **responsive layout utilities** — `hp-r-section-pad`, `hp-r-hero-grid`, `hp-r-65-35`, `hp-r-70-30`, `hp-r-50-50`, `hp-r-4col`, `hp-r-3col`, `hp-r-2col`, `hp-r-sticky`, `hp-r-desktop-only`, `hp-r-mobile-only`. Single breakpoint at 1024px. Replaces the old `hp-mobile-only`/`hp-desktop-only` dual-render split. | inline style in `hplus/page.tsx` |
| `nudge-mobile-only` / `nudge-desktop-only` | Nudge Library visibility toggles | inline style in `nudges/page.tsx` |
| `nudge-dt-*` | Nudge Library desktop internals — `nudge-dt-inner`, `nudge-dt-inner-pad`, `nudge-dt-2col` (2-col card grid) | inline style in `nudges/page.tsx` |
| `nudge-pill-row` | Health goal filter pill scrollable row (both mobile and desktop) | inline style in `nudges/page.tsx` |
| `nudge-card-lift` | Hover lift animation on nudge cards | inline style in `nudges/page.tsx` |
| `nudge-sticky-header` | Sticky back nav (`top: 56px`, dark forest, backdrop blur) | inline style in `nudges/page.tsx` |
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
| `ov-dt-journey-workspace` | `65fr / 35fr`, `grid-template-rows: auto auto`, `gap: 28px 32px` — 2-col × 2-row editorial grid |
| `ov-dt-journey-left` | Left col, spans both rows (`grid-row: 1 / 3`). Flex column, `gap: 24px` — Chapter card then Your Patterns |
| `ov-dt-journey-right-top` | Right col, row 1 — Your Habits card |
| `ov-dt-journey-right-bottom` | Right col, row 2 — Health Snapshot card |
| `ov-dt-story-workspace` | 70fr / 30fr |
| `ov-dt-cmd-toolkit-full` | ~~6-col static grid~~ — replaced by `yt-carousel-track` (4-col, paginated) |
| `ov-dt-stories-grid` | 3-col grid |
| `ov-dt-articles` | 2-col grid |

**Section 1 — Hero** (`ov-dt-hero`, 560px / 620px at 1400px+): Full-width cinematic — `ov-dt-hero-inner` is `display: flex` (not a grid). Single `ov-dt-hero-left` column, `max-width: 760px` (840px at 1400px+), `padding: 0 64px 60px 64px`. **Coach Presence card (Dr. Ananya) removed; `ov-dt-hero-right` zone and class removed.** Content stack bottom-up (`justify-content: flex-end`): chapter pill → **YOUR HEALTH GOAL glassmorphism capsule** (`background: rgba(8,18,10,0.52)`, `backdrop-filter: blur(16px)`, gold eyebrow, `memberGoals` icon-chips, impact microcopy) → greeting h1 60px/900 → day subtitle 17px → month progress bar (max-width 360px, sage→gold gradient). `memberGoals` constant defined at top of file after `TABS`.

**Section 2 — Journey Experience** (`ov-dt-section`, default `#FAFAF8`): `ov-dt-journey-workspace` — 2-col × 2-row editorial grid (`65fr / 35fr`, `grid-template-rows: auto auto`). **Left column spans both rows** (`grid-row: 1/3`): `JourneyIndicatorDesktop` (phase stepper + reduced-height chapter card) stacked above **Your Patterns** (4-card 2×2 insight grid). **Right top** (`ov-dt-journey-right-top`): **Your Habits** — live interactive checklist using shared `habitsChecked` state, streak pill, progress footer `X of 5 done`. **Right bottom** (`ov-dt-journey-right-bottom`): **Health Snapshot** — dark forest gradient card (`#071710 → #163326`), 4 metrics as horizontal rows (icon + 22px coloured value + inline progress bar + sub-label), tinted `dimColor` row backgrounds for visual grouping. **Chapter card** reduced ~15–20%: hero `minHeight: 240px` (was 300px), padding `32px 36px 36px` (was 40px 40px 48px), icon 56px (was 68px), title 36px (was 44px), focus pills padding `18px 36px 22px` (was 22px 40px 28px). **Your Patterns** is now a 4-card 2×2 grid: Sleep · Streaks · Nutrition · Movement — each card has coloured `bg`/`border`, 24px emoji, 10px category eyebrow, 14px stat value, 13px headline, 12px insight copy. The `gap: 12px` grid and uniform `16px` card padding create natural height to balance the Health Snapshot card without artificial stretching.

**Section 3 — My Transformation Story** (`ov-dt-section ov-dt-section-warm`, `#EEF3EF`): `ov-dt-story-workspace` 70/30 grid. Left 70% — cinematic header (48px headline, animated glows, stat chips) + large square photo reel + "Capture Today's Win" CTA + documentary CTA. Right 30% sticky — reflection journal card + Journey Highlights 2×2. **Future Self Preview + `NutritionStrategyCard` moved out of sticky column** — rendered as a side-by-side 2-col row directly below the `ov-dt-story-workspace` grid to eliminate whitespace gap. The Nutrition card uses `variant="default"` here. Uses separate `dtStoryPhotos`/`dtStoryActiveSlot`/`dtStoryRef` state.

**Section 3b — Biomarker Progress Showcase** (dark `#08110A`, full-bleed): `BiomarkerProgressShowcase` wrapped in `<div className="ov-dt-bleed">` (negative margin breakout — same as `ov-dt-section` but no padding, since BPS manages its own). Renders premium desktop carousel — ~3.2 cards visible, all 6 biomarker metrics, wheel-to-scroll, final "Explore Your Complete Progress" card → `/progress`.

**Section 4 — Complete Today's Journey** (`ov-dt-section ov-dt-section-dark`, `#1A2B1C`): Full-width dark band. Section renamed from "Health Command Center" → **"Complete Today's Journey"**. Section header row: heading left + live H+ score pill + streak count right. (0) **Upload Labs banner** (conditional, `showSetup` state) — shown above Today's Focus when `showSetup === true`. Dark-surface-aware design: gold directional gradient background (`rgba(212,168,67,0.14→0.07)`), `border: 1px solid rgba(212,168,67,0.32)`, subtle radial highlight top-left behind text. 🧪 icon left. Heading `#F8FAF8` near-white 15px/800. Body text `rgba(196,218,200,0.80)` sage-tinted white. CTA "Upload Labs" styled as gold gradient button (`#D4A843 → #B07828`, `box-shadow` gold glow, hover lift). Dismiss is a `28px` circular ghost button. (1) **Today's Focus** — full-width 2-col card: left has goal headline (36px), progress bar, 3 inline actions (Log Steps, Log Activity, "View health report →" link to `/progress`); right has frosted step counter pill (56px gold number). (2) **Earn Today's H+** — `EarnTodayCarousel` component. Horizontal-scroll row of 9 cinematic cards (200×250px, no grid). H+ progress bar + "Today's Opportunities" chips above. Dark glass cards with full-bleed photography, status pills, H+ badges. On mobile (inside `ov-prog-inner-split` right column): same `EarnTodayCarousel`. The old "Your Tools" paginated carousel (`toolsPage`, `directionRef`, `yt-*` CSS classes) has been **removed** from the desktop. The old 2×3 `WorkflowCard` grid has been **replaced** with `EarnTodayCarousel` on mobile too.

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
- **Journey right companion panel** (4 cards: Current Chapter, Upcoming Milestone, Future Self, Journey CTA) — replaced with `ov-dt-journey-right-top` (Your Habits) and `ov-dt-journey-right-bottom` (Health Snapshot). The old `ov-dt-journey-right` sticky wrapper class is removed.
- **Health Snapshot 2×2** from Command Center Row 1 — removed and relocated to `ov-dt-journey-right-bottom` in Section 2 as a richer dark forest card.
- **Habits checklist** from Programme Studio in Command Center — removed. Lives in `ov-dt-journey-right-top` (Your Habits card in Section 2).
- **Personal Patterns 4 cards** from Command Center Row 2 — removed from Command Center. Relocated to `ov-dt-journey-left` as a 4-card 2×2 insight grid (Sleep · Streaks · Nutrition · Movement) stacked below the chapter card.
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

### Daily Plan Page Layout (`dp-*` classes)

Injected as inline `<style>` in `daily-plan/page.tsx`. Dual-render: `daily-mobile-only` / `daily-desktop-only`. Breakpoint: `≥1024px`.

**Constants:** `HAS_COACHING = true` (top of file). `MEMBER` (name, day, goal, condition, preference, cuisine). `Sparkles` added to lucide imports.

**Page sections (order):**

| Section | Band | Content |
|---|---|---|
| Hero | Dark cinematic `#071710` | Content-height (no min-height) — eyebrow, h1 "Good Morning, Priya", plan subtitle, blueprint source, motivational quote card |
| Built Around You | Warm `#FAF5EC` | 4 profile cards: Goal / Condition / Preference / Cuisine — each with icon, value, 1-line explanation |
| Today's Journey | White `#ffffff` | Vertical timeline (`dp-timeline`, `::before` sage line) of 10 `TLEvent` cards — each with time, section title, supporting copy, carousel(s), optional Why strip, Mark Complete button |
| Weekly Momentum | Sage `#EEF3EF` | 7 day pills (done/active/pending), animated adherence progress bar |
| **AI Disclaimer** | **White `#ffffff`** | **`AiDisclaimer` component — `useInView`-gated fade-up card (y:20→0, 0.5s). `dp-ai-wrap` sets responsive top margin (48px mobile / 64px desktop). `dp-ai-card`: warm off-white `#FAFAF5`, sage border, 22/24px radius, subtle shadow, max-width 720px centred. Badge: "✨ AI Generated Nutrition Plan". Headline: "Want more personalised recommendations?". Body: AI disclaimer copy. CTA: `dp-ai-cta` sage gradient button (52px height, full-width ≤640px). CTA label/href gated by `HAS_COACHING`: `true` → "Connect with Your Coach" → `/coach/message`; `false` → "Learn About Coach Support" → `/today`.** |
| Closing | Dark forest `#0a1a0e` | Emotional copy, 3 stat numbers, "Return to My Journey" CTA → `/today` |

**Timeline events (10 total):**
Morning Reset (07:00) → Movement Break (07:30) → Start Your Day Strong / Breakfast (09:15) → Midmorning Nourishment (11:30) → Fuel Your Afternoon / Lunch (13:00) → Post-Lunch Movement (14:00) → Energy Boost / Snack (16:30) → Evening Movement (18:00) → Finish Strong / Dinner (19:30) → Wind Down & Recover (21:00)

**Carousel architecture (`RecommendationCarousel`):**
- Every option group (meals, hydration, movement, recovery, snacks) renders a `RecommendationCarousel` — horizontal-scroll-only, `scroll-snap-type: x mandatory`, no grid fallback at any breakpoint
- Desktop: `← →` arrow buttons top-right of each carousel (`.dp-rail-arrows`, hidden on mobile)
- No edge-fade overlay (removed to prevent shimmer appearance)

**Card types:**
| Class | Width (mob/desk) | Image height (mob/desk) | Used for |
|---|---|---|---|
| `dp-rec-card` | 252px / 296px | 158px / 178px | Hydration, movement, recovery |
| `dp-meal-card` | 262px / 308px | 170px / 192px | Breakfast, lunch, dinner |
| `dp-snack-card` | 200px / 230px | 130px / 130px | Snacks |

All image wrappers use `background: #e8ede9` as a loading placeholder. Cards support `.selected` class: sage border + glow shadow. Desktop hover: `translateY(-4px)`, image `scale(1.03)`.

**Key CSS classes:**
| Class | Purpose |
|---|---|
| `daily-mobile-only` / `daily-desktop-only` | Visibility toggles |
| `dp-sticky-header` | Sticky back nav at `top: 56px`, dark forest |
| `dp-inner` / `dp-inner-pad` | `max-width: 1600px`, padded container |
| `dp-timeline` / `dp-tl-event` / `dp-tl-dot` | Vertical timeline with sage `::before` spine |
| `dp-event-card` / `dp-event-body` / `dp-event-footer` | Timeline event card sections |
| `dp-rail-wrap` / `dp-rail` | Carousel wrapper + scrollable rail |
| `dp-rail-arrows` / `dp-arrow-btn` | Desktop arrow nav (hidden on mobile) |
| `dp-rec-card` / `dp-rec-img-wrap` / `dp-rec-img` | Recommendation card + image |
| `dp-meal-card` / `dp-meal-img-wrap` / `dp-meal-img` | Meal card + image |
| `dp-snack-card` / `dp-snack-img-wrap` / `dp-snack-img` | Snack card + image |
| `dp-card-body` | Shared card content padding |
| `dp-img-badge` / `dp-img-tag` | Selection checkmark / food tag overlaid on image |
| `dp-selected-pill` / `dp-choose-btn` | Selection state CTA |
| `dp-complete-btn` | Mark Complete / Completed toggle |
| `dp-why-strip` | "Why This Supports Your Goal" explanation block after main meals |
| `dp-micro` | Micro-motivation quote revealed on completion |
| `dp-week-pill` | Day adherence pill (done/active/pending) |
| `dp-profile-grid` | 2-col (mobile) / 4-col (≥768px) profile cards |
| `dp-section-darkforest` | Closing section gradient |
| `dp-eyebrow` / `dp-eyebrow-light` | Eyebrow label styles (dark / light bg variant) |
| `dp-benefit` | Benefit tag chip inside cards |
| `dp-ai-wrap` | AI Disclaimer outer spacing — `padding-top: 48px` mobile / `64px` desktop |
| `dp-ai-card` | Disclaimer card — warm off-white `#FAFAF5`, sage border 1.5px, `border-radius: 22/24px`, centred, max-width 720px |
| `dp-ai-badge` | "✨ AI Generated Nutrition Plan" pill badge — sage tinted, uppercase 10px |
| `dp-ai-cta` | Primary CTA button — sage gradient, 52px height, full-width on mobile ≤640px, auto on desktop |

---

*Last updated: June 19, 2026 | VitalPath v5.6 | 6-month preventive health coaching platform*

*Changes since v5.5 (June 19, 2026):*
- **H+ page unified responsive architecture** — Removed dual-render (`hp-mobile-only`/`hp-desktop-only`). `MobileHPlus` and `DesktopHPlus` functions replaced with a single `HPlusPageContent` orchestrator calling 8 `Sec*` section components (`SecHero`, `SecTodaysJourney`, `SecMomentum`, `SecAchievements`, `SecAnalytics`, `SecCategories`, `SecCommunity`, `SecReferrals`). New `hp-r-*` CSS utility classes handle all layout adaptation at `≥1024px`. Mobile and desktop now share identical narrative, information hierarchy, and data — only grids/spacing adapt.
- **Achievement Gallery** — Desktop: 4-col grid. Mobile: horizontal swipe carousel (220px cards, `hp-scroll-hide`). Same achievements on both.
- **Category Performance** — Desktop: `DtCategoryPerformance` 3-col priority groups. Mobile: 2-col `RadialProgress` grid. Same categories on both.
- **`LeaderboardPreview`** — Added `dark?: boolean` prop for use inside dark-band community section without duplicating markup.
- **Dead code removed** — `MobileTimeline`, `DesktopTimeline`, `TodaySummaryCard`, `MobileAnalytics`, `DesktopAnalytics`, `CalendarHeatmap` (≈435 lines) deleted. All superseded by `Sec*`/`Dt*` components.
- *hplus/page.tsx ~1860 lines*

*Changes since v5.4 (June 19, 2026):*
- **Exercise `duration` step** — Replaced 6-card grid with a premium glassmorphism duration selector (80px number, vertical drag, `−`/`+` 64px circular buttons with long-press acceleration at 500ms delay + 120ms repeat). Quick-select preset strip kept below as shortcuts — clicking a preset syncs the selector and advances the step. Encouragement copy keyed to time ranges (<15/15–30/30–60/60+). Bug fixed: old `onPointerDown`+`onPointerUp` double-fire producing ×3 increments replaced with `onClick`-only increment + delayed long-press. State: `exerciseDuration`, `longPressRef`, `dragStartY/Val`.
- **Water `pick` step** — Removed 6-card static grid. Replaced with premium hydration counter: large glass count, `−`/`+` 60px circular buttons, animated 💧×10 progress row, live ml conversion, motivational message keyed to glass count. State: `waterGlasses`.
- **Sleep flow** — Merged `bedtime` + `waketime` into a single step (`bedtime`). Both time pickers are `<motion.button>` cards that call `input.showPicker()` (with `focus()`/`click()` fallback) on hidden off-screen `<input type="time">` refs (`bedtimeInputRef`, `waketimeInputRef`). Live "Estimated Sleep" card calculates and animates duration and quality message. Step count reduced from 5 → 4 (quality is now 2/4, interruptions 3/4, sunlight-prompt 4/4). Back-nav map updated.
- **Sunlight `pick` step** — Removed 4-card duration grid. Replaced with: (1) benefit reinforcement card with live minute count + "Supports Energy / Sleep Quality / Circadian Rhythm"; (2) premium duration selector identical to Exercise (breathing amber glow orb, 80px value, 64px `−`/`+` buttons, coaching message). State: `sunlightMinutes`, `sunlightLongPressRef`.
- **Meditation flow — full redesign.** `pick` step replaced with a mindfulness check-in (2 premium choice cards). Two paths: **Path A** (I Already Meditated) → `log-duration` (premium selector + direct log). **Path B** (I'd Like To Meditate Now) → `feeling` (5 emotional state cards) → `session-prep` (recommendation card keyed to feeling + duration selector + "▶ Begin Session") → `active` (full-screen live timer with breathing circle animation, countdown, rotating gentle prompts, Pause/End controls) → `post-feeling` (5 emoji reflection) → `success` (mood-shift arrow, duration, +4 H+). `LoggingSheet` type union expanded with `log-duration`, `feeling`, `session-prep`, `active`, `post-feeling` steps plus `feeling?`, `postFeeling?`, `sessionType?` fields. State: `meditationMinutes`, `meditationSecsLeft`, `meditationPaused`, `meditationPromptIdx`, `breathPhase`, `meditationTimerRef`, `meditationBreathRef`, `meditationLongPressRef`.
- **Biomarker hub — redesigned.** `pick` step: removed 2×2 image card grid + "What are you measuring?" heading. Replaced with full-width stacked progress cards — each shows last reading as headline value, trend badge (↓ delta / range label), last-updated age, staggered entrance animation. Tap anywhere on a card opens that metric.
- **Biomarker value inputs — all replaced with ± selectors.** `bioNumVal` state (default 700, weight stored ×10 for one decimal) + `bioNum2Val` (default 800, BP diastolic) replace free-text `<input type="number">`. Shared `makeLongPress()` factory + per-field `bioLPRef`/`bioLP2Ref` refs. `MetricSelector` inner component renders the glassmorphism selector with breathing radial glow.
- **Blood pressure — collapsed from 3 steps to 1.** `bp-systolic` + `bp-diastolic` + `bp-context` steps removed. New `bp-entry` step: large live "SYS / DIA" preview, two side-by-side panels (SYSTOLIC / DIASTOLIC each with ± buttons), live coloured interpretation badge (Normal Range / Slightly Elevated / Above Normal / High), single "Save →" CTA.
- **Weight step** — Added "Last Reading" + "Change" context cards (live diff from 70.4 kg baseline). Encouragement copy keyed to direction of change. ± selector at 70.4 kg default.
- **Waist step** — Added "Last Reading" + "Change" context cards (diff from 90 cm baseline). Measurement tip card ("just above the navel, exhale gently"). Encouragement copy keyed to direction of change.
- **All biomarker success screens** — replaced generic `SuccessScreen` with a custom per-metric layout: large reading headline, trend badge, story copy, animated ✓ +2 H+ pill, Done CTA.
- **Glucose value step** — Premium ± selector (default 94 mg/dL) with live interpretation message (Normal / Slightly elevated / Above target).
- *today/page.tsx ~10,500+ lines*

*Changes since v5.2:*
- *`ActivityDateTimeSelector` — new universal date/time component replacing the old Today/Yesterday chip pattern. Two glassmorphism pill selectors: date (native `<input type="date" max={todayISO}>`, displays "Today"/"Yesterday"/formatted date) + time (native `<input type="time">`, displays 12h formatted). Placed below `StepIndicator` on every step of every flow. `logDate` state changed from `'today'|'yesterday'|'custom'` → ISO string `'YYYY-MM-DD'`. `logTime` changed from display string → 24h `'HH:MM'`. Users can now retrospectively log any past date.*
- *All KPI/dashboard metrics removed from inside logging flows — removed "X meals logged", meal targets, workout counts, hydration goals, streak counts, sleep goals from `InsightBar` pills. Logging experiences now contain only action-completion elements.*
- *`LastLoggedBar` added selectively where historical context is genuinely useful: Sleep step 1 (orientation hint about logging for previous night), Biomarker picker (last reading value + date).*
- *Modal width increased from `max-width: 540px` → `max-width: 760px`.*

*Changes since v5.1:*
- *All remaining logging flows (Exercise, Water, Sleep, Sunlight, Meditation, Mood, Biomarkers) redesigned to match Meal flow quality — each now has a 180px `HeroImageBand` on every step, `StepIndicator`, `ActivityDateTimeSelector`, and tailored `SuccessScreen` with `details` pill cards.*
- *`StepIndicator` — single shared component (segmented bar + `current/total` label, per-flow accent colour). Replaces bespoke `ExStepBar`/`SleepStepBar`/`MoodStepBar` inline components.*
- *`SuccessScreen` — unified with `details` prop showing specific logged data (activity/duration/intensity for exercise; hours/quality/sunlight for sleep; glucose value/context for biomarkers; mood + influences for mood).*
- *Unified modal header — back arrow (‹) for mid-flow steps computed from `backMap`, × close on entry steps and always visible mid-flow as secondary. Activity label + live H+ remaining cap pill. Replaces old "H+ score + +2 available" header.*
- *Exercise expanded to 4 steps: pick → duration (6 options incl. 90min) → intensity (4 levels with colour bars) → reflection (4 feeling cards, submit button required).*
- *Sleep expanded to 5 steps: bedtime → waketime (live duration calc) → quality → interruptions → sunlight-prompt.*
- *Mood expanded to 3 steps: pick (6 emotions) → influences (multi-select chips) → reflection (contextual journal prompt).*
- *Biomarkers expanded to metric-specific paths: Glucose (context → value), BP (systolic → diastolic → context), Weight (value → timing), Waist (value). All with step-appropriate heroes.*
- *Portion step now requires explicit chip selection — no silent 100% default.*
- *today/page.tsx ~10,000+ lines*

*Changes since v5.0:*
- *`ActionLoggingModal` meal flow completely redesigned — coaching-grade 7-step nutrition adherence capture. New steps: `slot-select` → `plan-meal` → `adherence` → `adherence-changes` (conditional) → `components` → `portion` → `success`. Scoring: `exact`/`mostly` = +2, `changes`/`custom` = +1. `MealSuccessScreen` shows slot, meal name, date/time, adherence badge, coaching insight. Auto-closes after 3.2s.*
- *New supporting data: `TODAYS_MEAL_PLAN` (badge, tags[], img), `MEAL_HISTORY` (20 entries), `MEAL_SLOTS` (5 configs), `ADHERENCE_POINTS`, `ADHERENCE_MESSAGES`.*

*Changes since v4.0:*
- *`DailyOperationsSection` — new reusable component inserted on all 6 monthly tabs immediately after `MonthTransformationStory`. Desktop: 70/30 `dos-dt-*` grid — `EarnTodayCarousel` in dark forest left panel + Mission Status card (SVG ring, checklist) + Streak card on right. Mobile: header → Mission Status → Streak → carousel. `#EEF3EF` sage band background.*
- *`lib/hplus-store.ts` — added `sessionStorage` persistence (`key: 'hplus_session_state'`). State survives full page reloads. Every `logActivity()` call serialises to sessionStorage via `persistState()`.*
- *H+ page `hplus/page.tsx` — Day analytics tab is now live: `buildLiveDayAnalytics()` computes cumulative curves from the real activity log, generates dynamic insight strings. Calendar today cell overridden with live `todayPoints`. H+ pill changed from `<a>` to Next.js `<Link>` to preserve store singleton across navigation.*
- *`HPlusPill` visual refresh — light surface pill (sage/gold tint bg, `rgba(107,143,113,0.28)` border, score in warm amber `#8A6B1A`) replaces dark forest background. Sits naturally on the white header.*
- *Daily Nudges card in `HealthConciergeModal` — CTA moved from bottom-right (`alignSelf: flex-end`, `marginTop: auto`) to left-aligned inside content column (`alignSelf: flex-start`, `marginTop: 20px`). Fixed `height: 200px` and `overflow: hidden` removed — card height is now auto with `padding-bottom: 24px`.*
- *today/page.tsx ~9200+ lines | hplus/page.tsx ~1850+ lines*
