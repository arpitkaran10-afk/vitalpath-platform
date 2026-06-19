'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Utensils,
  Dumbbell,
  Moon,
  Sun,
  Droplets,
  Brain,
  Pill,
  SmilePlus,
  Activity,
  Star,
  Flame,
  Zap,
  Trophy,
  Crown,
  Users,
  Gift,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

import {
  getAnalyticsData,
  getMonthCalendar,
  getAchievements,
  getLeaderboardPreview,
  getReferrals,
  getTodayActivities as getDemoActivities,
} from '../../../lib/hplus-demo-data';
import { useHPlusStore } from '../../../lib/hplus-store';
import type { HPlusCategoryKey, HPlusActivity, HPlusCategoryStats, HPlusDaySummary } from '../../../lib/hplus-types';
import type { HPlusEngineState } from '../../../lib/hplus-store';

// Convenience type for the stats shape used across sub-components
interface HPageStats {
  score: number;
  streak: number;
  longestStreak: number;
  todayPoints: number;
  todayMax: number;
  todayBiomarkerPoints: number;
  monthRank: string;
  monthPerfectDays: number;
  perfectWeeks: number;
}

// ─── Icon maps ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<HPlusCategoryKey, React.ElementType> = {
  meals: Utensils,
  exercise: Dumbbell,
  sleep: Moon,
  sunlight: Sun,
  water: Droplets,
  meditation: Brain,
  medication: Pill,
  mood: SmilePlus,
  biomarkers: Activity,
};

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  star: Star,
  flame: Flame,
  activity: Activity,
  sun: Sun,
  zap: Zap,
  trophy: Trophy,
  crown: Crown,
  users: Users,
};

const TIER_COLORS: Record<string, { accent: string; bg: string; ring: string; label: string }> = {
  bronze: { accent: '#C8864A', bg: 'rgba(200,134,74,0.1)', ring: 'rgba(200,134,74,0.35)', label: 'Bronze' },
  silver: { accent: '#A0ADB8', bg: 'rgba(160,173,184,0.1)', ring: 'rgba(160,173,184,0.35)', label: 'Silver' },
  gold:   { accent: '#D4A843', bg: 'rgba(212,168,67,0.1)',  ring: 'rgba(212,168,67,0.35)',  label: 'Gold'   },
  platinum: { accent: '#A8C5E8', bg: 'rgba(168,197,232,0.1)', ring: 'rgba(168,197,232,0.35)', label: 'Platinum' },
};

const DEFAULT_TIER = { accent: '#A0ADB8', bg: 'rgba(160,173,184,0.1)', ring: 'rgba(160,173,184,0.35)', label: 'Bronze' };

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1.4, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const end = start + duration * 1000;
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (end - start), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <span>{display.toLocaleString()}{suffix}</span>;
}

// ─── Circular progress SVG ────────────────────────────────────────────────────

function CircularScore({ score, max = 500, size = 200 }: { score: number; max?: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="hplus-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B8F71" />
          <stop offset="60%" stopColor="#A8C5AC" />
          <stop offset="100%" stopColor="#D4A843" />
        </linearGradient>
        <filter id="hplus-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={cx} cy={cx} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
      {/* Arc */}
      <motion.circle
        cx={cx} cy={cx} r={radius}
        fill="none"
        stroke="url(#hplus-arc-grad)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cx}px`, transform: 'rotate(-90deg)', filter: 'url(#hplus-glow)' }}
      />
    </svg>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBarChart({ values, color, maxVal }: { values: number[]; color: string; maxVal?: number }) {
  const peak = maxVal ?? Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '52px' }}>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / peak) * 100}%` }}
          transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
          style={{
            flex: 1,
            minWidth: '6px',
            borderRadius: '3px 3px 0 0',
            background: color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ─── Radial category progress ─────────────────────────────────────────────────

function RadialProgress({
  pct,
  color,
  size = 60,
  strokeWidth = 6,
}: {
  pct: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct / 100, 1));
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HPlusPage() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Live data from shared store
  const store = useHPlusStore();

  // Build stats from store (overrides demo seed values)
  const stats = {
    score: store.hplus.score,
    streak: store.hplus.streak,
    longestStreak: store.hplus.longestStreak,
    todayPoints: store.hplus.todayPoints,
    todayMax: store.hplus.todayMax,
    todayBiomarkerPoints: store.categories.find(c => c.category === 'biomarkers')?.current ?? 0,
    monthRank: store.hplus.monthRank,
    monthPerfectDays: store.hplus.monthPerfectDays,
    perfectWeeks: store.hplus.perfectWeeks,
  };

  // Merge new session activities (most recent first) with demo timeline
  const demoActivities = getDemoActivities();
  const sessionEntries = store.newActivities.map((a, i) => ({
    id: `session-${i}`,
    time: a.loggedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    category: (a.category === 'meal' ? 'meals' : a.category === 'biomarker' ? 'biomarkers' : a.category) as HPlusCategoryKey,
    title: a.label.charAt(0).toUpperCase() + a.label.slice(1),
    subtitle: 'Logged today',
    points: a.hplusAwarded,
    isBiomarker: a.category === 'biomarker',
    value: a.value,
    completed: true,
  }));
  const activities = [...sessionEntries, ...demoActivities];

  // Category breakdown from store
  const categories = store.categories.map(c => ({
    category: c.category as HPlusCategoryKey,
    label: c.label,
    currentPoints: c.current * 2,
    maxPoints: c.hplusMax,
    completionPct: Math.round((c.current / c.max) * 100),
    color: c.color,
    bg: c.accentBg,
    accentBorder: c.accentBg.replace('0.1)', '0.3)'),
  }));

  // Build live "day" analytics from the actual activity log in the store
  function buildLiveDayAnalytics() {
    const allCompleted = activities.filter(a => a.completed);
    // Bucket into 8 hourly slots: 6AM,8AM,10AM,12PM,2PM,4PM,6PM,8PM
    const slotHours = [6, 8, 10, 12, 14, 16, 18, 20];
    const labels = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
    let cumulativeActivity = 0;
    let cumulativeBiomarker = 0;
    const activityPoints: number[] = [];
    const biomarkerPoints: number[] = [];
    const combinedScore: number[] = [];
    for (const slotEnd of slotHours) {
      for (const a of allCompleted) {
        // parse time like "08:00 AM" or "02:30 PM"
        const match = a.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) continue;
        let h = parseInt(match[1] ?? '0', 10);
        const ampm = (match[3] ?? '').toUpperCase();
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        if (h < slotEnd && h >= (slotEnd - 2)) {
          if (a.isBiomarker) cumulativeBiomarker += a.points;
          else cumulativeActivity += a.points;
        }
      }
      activityPoints.push(cumulativeActivity);
      biomarkerPoints.push(cumulativeBiomarker);
      combinedScore.push(cumulativeActivity + cumulativeBiomarker);
    }

    // Dynamic insights based on live data
    const totalLogged = allCompleted.length;
    const sessionCount = store.newActivities.length;
    const remaining = Math.max(0, stats.todayMax - stats.todayPoints);
    const insights = [
      totalLogged === 0
        ? 'Start logging your first action to earn H+ points today.'
        : `You've completed ${totalLogged} health action${totalLogged !== 1 ? 's' : ''} today.`,
      sessionCount > 0
        ? `${sessionCount} new action${sessionCount !== 1 ? 's' : ''} logged this session — great momentum.`
        : 'Log meals, exercise, water and biomarkers to earn points.',
      remaining > 0
        ? `${remaining} more H+ will hit today's ${stats.todayMax}-point daily target.`
        : "You've hit today's daily maximum. Outstanding!",
    ];

    return { period: 'day' as const, labels, activityPoints, biomarkerPoints, combinedScore, insights };
  }

  const staticAnalytics = getAnalyticsData(analyticsPeriod);
  const analytics = analyticsPeriod === 'day' ? buildLiveDayAnalytics() : staticAnalytics;

  // Build calendar with today's live points injected
  const calendarBase = getMonthCalendar();
  const calendar = calendarBase.map(day =>
    day.isToday
      ? { ...day, totalPoints: stats.todayPoints, activityPoints: stats.todayPoints - stats.todayBiomarkerPoints, biomarkerPoints: stats.todayBiomarkerPoints, isPerfect: stats.todayPoints >= stats.todayMax }
      : day
  );

  const achievements = getAchievements();
  const leaderboard = getLeaderboardPreview();
  const referrals = getReferrals();

  const todayPct = (stats.todayPoints / stats.todayMax) * 100;
  const completedActivities = activities.filter((a) => a.completed);
  const pendingActivities = activities.filter((a) => !a.completed);

  return (
    <>
      <style>{`
        /* ── responsive layout utilities ── */
        .hp-r-section-pad { padding: 40px 20px; }
        .hp-r-hero-pad { padding: 36px 20px; }
        .hp-r-inner { width: 100%; }
        .hp-r-stack { display: flex; flex-direction: column; gap: 20px; }
        .hp-r-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .hp-r-65-35 { display: flex; flex-direction: column; gap: 24px; }
        .hp-r-70-30 { display: flex; flex-direction: column; gap: 24px; }
        .hp-r-50-50 { display: flex; flex-direction: column; gap: 24px; }
        .hp-r-4col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .hp-r-3col { display: flex; flex-direction: column; gap: 20px; }
        .hp-r-hero-grid { display: flex; flex-direction: column; gap: 32px; }
        .hp-r-sticky { /* no sticky on mobile */ }
        .hp-r-desktop-only { display: none; }
        .hp-r-mobile-only { display: block; }
        @media (min-width: 1024px) {
          .hp-r-section-pad { padding: 72px 64px; }
          .hp-r-hero-pad { padding: 48px 64px; }
          .hp-r-inner { max-width: 1440px; margin: 0 auto; }
          .hp-r-65-35 { display: grid; grid-template-columns: 65fr 35fr; gap: 48px; align-items: start; }
          .hp-r-70-30 { display: grid; grid-template-columns: 70fr 30fr; gap: 48px; align-items: start; }
          .hp-r-50-50 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
          .hp-r-4col { grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .hp-r-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
          .hp-r-2col { gap: 20px; }
          .hp-r-hero-grid { display: grid; grid-template-columns: 1fr 300px; gap: 56px; align-items: center; }
          .hp-r-sticky { position: sticky; top: 112px; }

          .hp-r-desktop-only { display: block; }
          .hp-r-mobile-only { display: none !important; }
        }

        /* ── shared utilities ── */
        .hp-section {
          padding: 32px 20px;
        }
        .hp-section-dark {
          background: linear-gradient(160deg, #0a1a0d 0%, #111e14 60%, #0c1510 100%);
        }
        .hp-section-surface {
          background: #FAFAF8;
        }
        .hp-section-stone {
          background: #F0EDE6;
        }
        .hp-section-sage {
          background: #EEF3EF;
        }
        .hp-section-white {
          background: #ffffff;
        }

        .hp-eyebrow-sage {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-sage);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .hp-eyebrow-gold {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-gold);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .hp-eyebrow-light {
          font-size: 10px;
          font-weight: 700;
          color: rgba(160,205,168,0.65);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        /* Segmented control */
        .hp-seg-control {
          display: inline-flex;
          background: rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 3px;
          gap: 2px;
        }
        .hp-seg-btn {
          padding: 7px 18px;
          border-radius: 9px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-muted);
          cursor: pointer;
          transition: all 0.18s;
        }
        .hp-seg-btn.active {
          background: #fff;
          color: var(--color-ink);
          box-shadow: 0 1px 6px rgba(0,0,0,0.1);
        }

        /* Timeline line */
        .hp-timeline-line {
          position: absolute;
          left: 19px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, rgba(107,143,113,0.5), rgba(107,143,113,0.08));
        }

        /* Card lift */
        .hp-card-lift {
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .hp-card-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
        }

        /* Desktop layout classes */
        @media (min-width: 1024px) {
          .hp-dt-section {
            padding: 72px 64px;
          }
          .hp-dt-section-bleed {
            margin: 0 -64px;
            padding: 72px 64px;
          }
          .hp-dt-inner {
            max-width: 1440px;
            margin: 0 auto;
          }
          .hp-dt-hero {
            min-height: 620px;
          }
          .hp-dt-65-35 {
            display: grid;
            grid-template-columns: 65fr 35fr;
            gap: 48px;
            align-items: start;
          }
          .hp-dt-50-50 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          .hp-dt-3col {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .hp-dt-4col {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .hp-dt-sticky {
            position: sticky;
            top: 128px;
          }
          .hp-dt-section-padding {
            padding: 72px 64px;
          }
        }

        /* Scrollbar hide */
        .hp-scroll-hide {
          scrollbar-width: none;
        }
        .hp-scroll-hide::-webkit-scrollbar {
          display: none;
        }

        /* Calendar heatmap */
        .hp-cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        @media (min-width: 640px) {
          .hp-cal-grid {
            gap: 8px;
          }
        }

        /* Achievement badge glow pulse */
        @keyframes hp-badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 16px 3px rgba(212,168,67,0.25); }
        }
        .hp-badge-earned {
          animation: hp-badge-glow 3s ease-in-out infinite;
        }

        /* Premium centerpiece breathing */
        @keyframes hp-breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes hp-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.12); }
        }
        @keyframes hp-orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes hp-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hp-centerpiece-breathe {
          animation: hp-breathe 4s ease-in-out infinite;
        }
        .hp-glow-outer {
          animation: hp-glow-pulse 4s ease-in-out infinite;
        }
        .hp-consistency-cell-perfect {
          background: linear-gradient(135deg, #D4A843, #F0C96A) !important;
          box-shadow: 0 2px 8px rgba(212,168,67,0.4);
        }
        .hp-consistency-cell-strong {
          background: rgba(107,143,113,0.45) !important;
        }
        .hp-momentum-card:hover .hp-momentum-icon {
          transform: scale(1.1);
        }
        .hp-momentum-icon {
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* ── Unified responsive page ──────────────────────────────── */}
      <HPlusPageContent
        stats={stats}
        activities={activities}
        completedActivities={completedActivities}
        pendingActivities={pendingActivities}
        analytics={analytics}
        analyticsPeriod={analyticsPeriod}
        setAnalyticsPeriod={setAnalyticsPeriod}
        categories={categories}
        calendar={calendar}
        achievements={achievements}
        leaderboard={leaderboard}
        referrals={referrals}
        todayPct={todayPct}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED RESPONSIVE PAGE
// ─────────────────────────────────────────────────────────────────────────────

type PageProps = {
  stats: HPageStats;
  activities: HPlusActivity[];
  completedActivities: HPlusActivity[];
  pendingActivities: HPlusActivity[];
  analytics: ReturnType<typeof getAnalyticsData>;
  analyticsPeriod: 'day' | 'week' | 'month';
  setAnalyticsPeriod: (p: 'day' | 'week' | 'month') => void;
  categories: HPlusCategoryStats[];
  calendar: ReturnType<typeof getMonthCalendar>;
  achievements: ReturnType<typeof getAchievements>;
  leaderboard: ReturnType<typeof getLeaderboardPreview>;
  referrals: ReturnType<typeof getReferrals>;
  todayPct: number;
};

function HPlusPageContent(props: PageProps) {
  const { stats, activities, completedActivities, pendingActivities, analytics, analyticsPeriod, setAnalyticsPeriod,
    categories, calendar, achievements, leaderboard, referrals, todayPct } = props;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Back nav — sibling of hero, same pattern as Progress/Journey */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 100, height: '56px',
        background: 'rgba(7,19,16,0.92)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
      }}>
        <a href="/today" style={{
          display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
          color: 'rgba(160,205,168,0.82)', minHeight: '44px', paddingRight: '16px',
          fontSize: '14px', fontWeight: 600,
        }}>
          <ChevronLeft size={17} strokeWidth={2.5} />
          Overview
        </a>
      </div>
      <SecHero stats={stats} />
      <SecTodaysJourney stats={stats} activities={activities} completedActivities={completedActivities} todayPct={todayPct} />
      <SecMomentum stats={stats} calendar={calendar} />
      <SecAchievements achievements={achievements} stats={stats} />
      <SecAnalytics analytics={analytics} analyticsPeriod={analyticsPeriod} setAnalyticsPeriod={setAnalyticsPeriod} stats={stats} />
      <SecCategories categories={categories} />
      <SecCommunity leaderboard={leaderboard} />
      <SecReferrals referrals={referrals} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SecHero({ stats }: { stats: HPageStats }) {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #071310 0%, #0d1c10 40%, #0a1a18 70%, #060f10 100%)',
      position: 'relative', overflow: 'hidden',
    }} className="hp-r-hero-pad">
      {/* Glows */}
      <div style={{ position: 'absolute', top: '-120px', right: '5%', width: '600px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '8%', width: '500px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div className="hp-r-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hp-r-hero-grid">

          {/* Left — headline + copy only */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.12)', border: '1px solid rgba(107,143,113,0.25)', borderRadius: '20px', padding: '6px 14px', marginBottom: '28px', alignSelf: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6B8F71' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>H+ Transformation Score</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '20px' }}>
              Every healthy choice<br />
              <span style={{ background: 'linear-gradient(90deg, #A8C5AC, #D4A843)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>compounds.</span>
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', maxWidth: '420px', lineHeight: 1.65 }}>
              Your transformation is built one action at a time. Keep going.
            </p>
          </div>

          {/* Right — score centerpiece */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{
              position: 'relative', width: '220px', height: '220px', borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, rgba(107,143,113,0.18) 0%, rgba(10,26,13,0.85) 60%)',
              border: '1.5px solid rgba(107,143,113,0.2)',
              boxShadow: '0 0 60px rgba(107,143,113,0.12), 0 0 100px rgba(212,168,67,0.06), inset 0 0 60px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'absolute', inset: '10px' }}>
                <CircularScore score={stats.score} max={500} size={200} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: 'clamp(44px,6vw,60px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, textShadow: '0 0 40px rgba(212,168,67,0.3)' }}>
                  <AnimatedCounter target={stats.score} duration={1.8} />
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'linear-gradient(90deg, #A8C5AC, #D4A843)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginTop: '4px' }}>H+ Points</span>
                <div style={{ marginTop: '8px', height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)' }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{stats.monthRank}</span>
              </div>
              <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#D4A843', boxShadow: '0 0 12px rgba(212,168,67,0.6)' }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function SecTodaysJourney({ stats, activities, completedActivities, todayPct }: { stats: HPageStats; activities: HPlusActivity[]; completedActivities: HPlusActivity[]; todayPct: number }) {
  return (
    <section style={{ background: '#FAFAF8' }} className="hp-r-section-pad">
      <div className="hp-r-inner">
        <div className="hp-r-65-35">
          <div>
            <div className="hp-eyebrow-sage">Today's Journey</div>
            <h2 style={{ fontSize: 'clamp(22px,3vw,40px)', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '8px' }}>What should I do next?</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '28px' }}>
              {completedActivities.length} of {activities.length} actions complete · {stats.todayPoints} H+ earned today
            </p>
            <DtActionPath activities={activities} />
          </div>
          <div className="hp-r-sticky">
            <DtCommandCenter stats={stats} todayPct={todayPct} activities={activities} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecMomentum({ stats, calendar }: { stats: HPageStats; calendar: ReturnType<typeof getMonthCalendar> }) {
  const consistencyPct = stats.perfectWeeks > 0 ? Math.round((stats.monthPerfectDays / 19) * 100) : 68;
  const momentumCards = [
    { icon: Flame, label: 'Current Streak', value: stats.streak, unit: 'days', copy: 'Keep the fire burning.', accent: '#D4A843', bg: 'rgba(212,168,67,0.1)', border: 'rgba(212,168,67,0.22)' },
    { icon: Trophy, label: 'Best Streak', value: stats.longestStreak, unit: 'days', copy: 'Your personal record.', accent: '#A8C5AC', bg: 'rgba(107,143,113,0.1)', border: 'rgba(107,143,113,0.22)' },
    { icon: Star, label: 'Perfect Days', value: stats.monthPerfectDays, unit: 'this month', copy: "You're building consistency.", accent: '#D4A843', bg: 'rgba(212,168,67,0.08)', border: 'rgba(212,168,67,0.18)' },
    { icon: TrendingUp, label: 'Consistency', value: consistencyPct, unit: '%', copy: 'Your longest run this month.', accent: '#A8C5AC', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
  ];

  return (
    <section style={{ background: 'linear-gradient(160deg, #0a1a0d 0%, #111e14 55%, #0c1318 100%)', position: 'relative', overflow: 'hidden' }} className="hp-r-section-pad">
      <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '400px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '300px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div className="hp-r-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hp-eyebrow-light">Consistency</div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '28px' }}>Momentum & Consistency</h2>

        <div className="hp-r-4col" style={{ marginBottom: '36px' }}>
          {momentumCards.map((card) => {
            const CIcon = card.icon;
            return (
              <motion.div key={card.label} className="hp-momentum-card hp-card-lift" whileHover={{ y: -4 }} style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: '20px', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${card.bg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div className="hp-momentum-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', background: card.bg, border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CIcon size={18} color={card.accent} strokeWidth={1.8} />
                </div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{card.label}</p>
                <p style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '6px' }}>
                  {card.value}<span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>{card.unit}</span>
                </p>
                <p style={{ fontSize: '12px', color: card.accent, fontWeight: 500 }}>{card.copy}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Consistency Wall */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Consistency Wall</p>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{stats.monthPerfectDays} perfect days in June</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { bg: 'linear-gradient(135deg, #D4A843, #F0C96A)', label: 'Perfect' },
                { bg: 'rgba(107,143,113,0.45)', label: '20+ H+' },
                { bg: 'rgba(255,255,255,0.08)', label: 'Partial' },
              ].map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <DtConsistencyWall calendar={calendar} />
        </div>
      </div>
    </section>
  );
}

function SecAchievements({ achievements, stats }: { achievements: ReturnType<typeof getAchievements>; stats: HPageStats }) {
  return (
    <section style={{ background: '#F0EDE6' }} className="hp-r-section-pad">
      <div className="hp-r-inner">
        <div className="hp-eyebrow-gold">Achievements</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', margin: 0 }}>Achievement Gallery</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '320px' }}>Each milestone is a chapter in your transformation story.</p>
        </div>
        <DtNextAchievementCard achievements={achievements} stats={stats} />
        <div style={{ height: '24px' }} />
        {/* Desktop: 4-col grid. Mobile: swipeable horizontal carousel */}
        <div className="hp-r-desktop-only">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        </div>
        <div className="hp-r-mobile-only">
          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }} className="hp-scroll-hide">
            {achievements.map((a) => (
              <div key={a.id} style={{ flexShrink: 0, width: '220px' }}>
                <AchievementCard achievement={a} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecAnalytics({ analytics, analyticsPeriod, setAnalyticsPeriod, stats }: { analytics: ReturnType<typeof getAnalyticsData>; analyticsPeriod: 'day' | 'week' | 'month'; setAnalyticsPeriod: (p: 'day' | 'week' | 'month') => void; stats: HPageStats }) {
  return (
    <section style={{ background: '#fff' }} className="hp-r-section-pad">
      <div className="hp-r-inner">
        <div className="hp-eyebrow-sage">Analytics</div>
        <div className="hp-r-70-30">
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', margin: 0 }}>Your H+ Trend</h2>
              <div className="hp-seg-control">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button key={p} className={`hp-seg-btn${analyticsPeriod === p ? ' active' : ''}`} onClick={() => setAnalyticsPeriod(p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <DtHeroChart analytics={analytics} />
          </div>
          <div className="hp-r-sticky">
            <DtInsightPanel analytics={analytics} stats={stats} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecCategories({ categories }: { categories: HPlusCategoryStats[] }) {
  return (
    <section style={{ background: '#EEF3EF' }} className="hp-r-section-pad">
      <div className="hp-r-inner">
        <div className="hp-eyebrow-sage">Category Performance</div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '28px' }}>Where your H+ comes from</h2>
        {/* Desktop: 3-col priority groups. Mobile: 2-col grid */}
        <div className="hp-r-desktop-only">
          <DtCategoryPerformance categories={categories} />
        </div>
        <div className="hp-r-mobile-only">
          <div className="hp-r-2col">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.category];
              return (
                <motion.div key={cat.category} whileTap={{ scale: 0.98 }}
                  style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: `1.5px solid ${cat.accentBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <RadialProgress pct={cat.completionPct} color={cat.color} size={56} strokeWidth={5} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={cat.color} strokeWidth={1.8} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.04em', marginBottom: '2px' }}>{cat.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: cat.color, letterSpacing: '-0.02em' }}>{cat.currentPoints}<span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)' }}>/{cat.maxPoints}</span></p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecCommunity({ leaderboard }: { leaderboard: ReturnType<typeof getLeaderboardPreview> }) {
  return (
    <section style={{ background: 'linear-gradient(160deg, #071310 0%, #0d1c10 50%, #060f10 100%)', position: 'relative', overflow: 'hidden' }} className="hp-r-section-pad">
      <div style={{ position: 'absolute', top: '-80px', right: '8%', width: '480px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div className="hp-r-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hp-eyebrow-light">Community</div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '28px' }}>You are not alone in this.</h2>
        <div className="hp-r-50-50">
          <DtFeaturedTransformation />
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>This Month's Leaders</p>
            <LeaderboardPreview leaderboard={leaderboard} dark />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecReferrals({ referrals }: { referrals: ReturnType<typeof getReferrals> }) {
  return (
    <section style={{ background: '#FAFAF8' }} className="hp-r-section-pad">
      <div className="hp-r-inner">
        <DtReferralCelebration referrals={referrals} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function BackHeader() {
  return (
    <div style={{
      position: 'sticky',
      top: '56px',
      height: '56px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 100,
    }}>
      <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--color-sage)', minHeight: '44px', paddingRight: '16px' }}>
        <ChevronLeft size={18} strokeWidth={2.5} />
        <span style={{ fontSize: '14px', fontWeight: 700 }}>Overview</span>
      </a>
    </div>
  );
}

// ─── Achievement card ─────────────────────────────────────────────────────────

function AchievementCard({
  achievement: a,
  dark = false,
}: {
  achievement: ReturnType<typeof getAchievements>[0];
  dark?: boolean;
}) {
  const Icon = ACHIEVEMENT_ICONS[a.iconKey] ?? Star;
  const tier = TIER_COLORS[a.tier] ?? DEFAULT_TIER;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={a.earned ? 'hp-badge-earned hp-card-lift' : 'hp-card-lift'}
      style={{
        background: dark
          ? a.earned
            ? `linear-gradient(145deg, ${tier.bg.replace('0.1)', '0.15)')} , rgba(255,255,255,0.03))`
            : 'rgba(255,255,255,0.04)'
          : a.earned
          ? '#fff'
          : 'rgba(255,255,255,0.5)',
        borderRadius: '16px',
        padding: '20px',
        border: a.earned
          ? `1.5px solid ${tier.ring}`
          : dark
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid var(--color-border)',
        opacity: a.earned ? 1 : 0.55,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {a.earned && (
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${tier.bg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      )}
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: a.earned ? tier.bg : 'rgba(0,0,0,0.06)',
        border: `1.5px solid ${a.earned ? tier.ring : 'transparent'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '14px',
      }}>
        <Icon size={22} color={a.earned ? tier.accent : '#aaa'} strokeWidth={1.8} />
      </div>
      <div style={{
        display: 'inline-block',
        background: a.earned ? tier.bg : 'rgba(0,0,0,0.05)',
        borderRadius: '6px',
        padding: '2px 8px',
        fontSize: '9px',
        fontWeight: 700,
        color: a.earned ? tier.accent : '#aaa',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        {tier.label}
      </div>
      <p style={{ fontSize: '14px', fontWeight: 800, color: dark ? (a.earned ? '#fff' : 'rgba(255,255,255,0.4)') : 'var(--color-ink)', marginBottom: '4px', letterSpacing: '-0.01em' }}>{a.title}</p>
      <p style={{ fontSize: '12px', color: dark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)', lineHeight: 1.4, marginBottom: a.earnedDate ? '8px' : 0 }}>{a.description}</p>
      {a.earnedDate && (
        <p style={{ fontSize: '10px', fontWeight: 600, color: a.earned ? tier.accent : '#aaa', opacity: 0.8 }}>{a.earnedDate}</p>
      )}
    </motion.div>
  );
}

// ─── Leaderboard preview ──────────────────────────────────────────────────────

function LeaderboardPreview({ leaderboard, dark = false }: { leaderboard: ReturnType<typeof getLeaderboardPreview>; dark?: boolean }) {
  const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'var(--color-border)';
  const textColor = dark ? '#fff' : 'var(--color-ink)';
  const mutedColor = dark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)';
  const dividerColor = dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border)';
  // shadow only on light
  const shadow = dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)';
  void cardBg; void shadow;
  const top3 = leaderboard.filter((e) => e.rank <= 3);
  const currentUser = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      borderRadius: '20px',
      border: `1.5px solid ${borderColor}`,
      overflow: 'hidden',
      boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      {top3.map((entry, i) => (
        <div key={entry.rank} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderBottom: i < top3.length - 1 ? `1px solid ${dividerColor}` : `1px dashed ${dividerColor}`,
          background: i === 0 ? 'rgba(212,168,67,0.04)' : 'transparent',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: i === 0 ? 'rgba(212,168,67,0.15)' : i === 1 ? 'rgba(160,173,184,0.15)' : 'rgba(200,134,74,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800,
            color: i === 0 ? '#D4A843' : i === 1 ? '#A0ADB8' : '#C8864A',
          }}>
            {entry.rank}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>{entry.name}</p>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 800, color: textColor, letterSpacing: '-0.02em' }}>{entry.score.toLocaleString()}</p>
          <span style={{ fontSize: '11px', color: mutedColor }}>H+</span>
        </div>
      ))}

      {/* Ellipsis */}
      <div style={{ padding: '10px 20px', textAlign: 'center' }}>
        <span style={{ fontSize: '18px', color: mutedColor, letterSpacing: '4px' }}>···</span>
      </div>

      {/* Current user */}
      {currentUser && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '16px 20px',
          background: 'rgba(107,143,113,0.06)',
          borderTop: '1.5px solid rgba(107,143,113,0.2)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(107,143,113,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, color: 'var(--color-sage)',
          }}>
            {currentUser.rank}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-sage)' }}>You</p>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-sage)', letterSpacing: '-0.02em' }}>{currentUser.score.toLocaleString()}</p>
          <span style={{ fontSize: '11px', color: mutedColor }}>H+</span>
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${dividerColor}` }}>
        <button style={{
          width: '100%',
          padding: '13px',
          background: 'var(--color-sage)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          View Full Leaderboard
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Referral section ─────────────────────────────────────────────────────────

function ReferralSection({
  referrals,
  light = false,
}: {
  referrals: ReturnType<typeof getReferrals>;
  light?: boolean;
}) {
  const textColor = light ? 'var(--color-ink)' : '#fff';
  const mutedColor = light ? 'var(--color-muted)' : 'rgba(255,255,255,0.5)';

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {!light && <div className="hp-eyebrow-gold">Referrals</div>}
      {!light && <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>Invite & Earn H+</h2>}
      {!light && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Share your transformation. Earn premium rewards.</p>}

      {/* Reward tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: light ? '20px' : '24px' }}>
        {[
          { icon: Gift, label: '+1,000 H+', desc: 'When your referral becomes a paid member', accent: '#D4A843', bg: light ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.28)' },
          { icon: Star, label: '+100 H+', desc: 'When your referral reaches 1,000 H+ points', accent: '#A0ADB8', bg: light ? 'rgba(160,173,184,0.08)' : 'rgba(160,173,184,0.1)', border: 'rgba(160,173,184,0.25)' },
        ].map((reward) => {
          const RIcon = reward.icon;
          return (
            <div key={reward.label} style={{
              background: reward.bg,
              border: `1.5px solid ${reward.border}`,
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: light ? reward.bg : `rgba(${reward.accent === '#D4A843' ? '212,168,67' : '160,173,184'},0.18)`,
                border: `1px solid ${reward.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <RIcon size={20} color={reward.accent} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '18px', fontWeight: 900, color: reward.accent, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '3px' }}>{reward.label}</p>
                <p style={{ fontSize: '12px', color: mutedColor, lineHeight: 1.4 }}>{reward.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active referrals */}
      {referrals.length > 0 && (
        <div style={{
          background: light ? '#fff' : 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: light ? '1.5px solid var(--color-border)' : '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: light ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Referrals</p>
          </div>
          {referrals.map((r, i) => {
            const statusColors: Record<string, string> = {
              invited: '#A0ADB8',
              joined: '#6B8F71',
              paid: '#D4A843',
              milestone: '#4A8BBE',
            };
            const statusLabels: Record<string, string> = {
              invited: 'Invited',
              joined: 'Joined',
              paid: '+1,000 H+ earned',
              milestone: '+100 H+ earned',
            };
            return (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderBottom: i < referrals.length - 1 ? (light ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.06)') : 'none',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: (() => {
                    const hex = (statusColors[r.status] ?? '#888888').slice(1);
                    const parts = hex.match(/.{2}/g) ?? ['136','136','136'];
                    return `rgba(${parts.map((h) => parseInt(h, 16)).join(',')},0.15)`;
                  })(),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: statusColors[r.status],
                }}>
                  {r.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>{r.name}</p>
                  <p style={{ fontSize: '11px', color: statusColors[r.status], fontWeight: 600 }}>{statusLabels[r.status]}</p>
                </div>
                {r.pointsEarned > 0 && (
                  <div style={{
                    background: 'rgba(212,168,67,0.12)',
                    border: '1px solid rgba(212,168,67,0.28)',
                    borderRadius: '8px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#D4A843',
                  }}>
                    +{r.pointsEarned.toLocaleString()} H+
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite CTA */}
      <button style={{
        width: '100%',
        padding: '15px',
        background: 'linear-gradient(135deg, #D4A843 0%, #F0C96A 100%)',
        color: '#1a1200',
        border: 'none',
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: 800,
        cursor: 'pointer',
        letterSpacing: '-0.01em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 16px rgba(212,168,67,0.3)',
      }}>
        <Users size={16} strokeWidth={2.5} />
        Invite a Friend
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP-ONLY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function DtActionPath({ activities }: { activities: HPlusActivity[] }) {
  const completed = activities.filter((a) => a.completed);
  const pending = activities.filter((a) => !a.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Completed group */}
      {completed.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '4px' }}>
            Completed · +{completed.reduce((s, a) => s + a.points, 0)} H+ earned
          </p>
          {completed.map((a, i) => {
            const Icon = CATEGORY_ICONS[a.category];
            return (
              <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'linear-gradient(90deg, rgba(107,143,113,0.08) 0%, rgba(107,143,113,0.03) 100%)',
                  border: '1.5px solid rgba(107,143,113,0.2)',
                  borderRadius: '16px', padding: '16px 20px', marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(107,143,113,0.06)',
                }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(107,143,113,0.15)', border: '1px solid rgba(107,143,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#6B8F71" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '2px', textDecoration: 'line-through', textDecorationColor: 'rgba(107,143,113,0.4)' }}>{a.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{a.subtitle} · {a.time}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ background: 'rgba(107,143,113,0.12)', border: '1px solid rgba(107,143,113,0.3)', borderRadius: '10px', padding: '5px 12px', fontSize: '13px', fontWeight: 800, color: '#4A6E50', boxShadow: '0 0 10px rgba(107,143,113,0.15)' }}>
                    +{a.points} H+
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6B8F71, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '5px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff', transform: 'rotate(45deg) translateY(-2px)' }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pending group */}
      {pending.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '4px' }}>
            Up Next · {pending.length} actions
          </p>
          {pending.map((a, i) => {
            const Icon = CATEGORY_ICONS[a.category];
            return (
              <motion.div key={a.id} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: '#fff', border: '1.5px solid var(--color-border)',
                  borderRadius: '16px', padding: '16px 20px', marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(107,143,113,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#6B8F71" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>{a.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{a.subtitle}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ background: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.2)', borderRadius: '10px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)' }}>
                    +{a.points} H+
                  </div>
                  <ChevronRight size={16} color="var(--color-muted)" strokeWidth={2} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DtCommandCenter({ stats, todayPct, activities }: { stats: HPageStats; todayPct: number; activities: HPlusActivity[] }) {
  const done = activities.filter((a) => a.completed).length;
  const total = activities.length;
  const remaining = stats.todayMax - stats.todayPoints;
  const activityH = stats.todayPoints - stats.todayBiomarkerPoints;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0b1d0e 0%, #122018 60%, #0d1a14 100%)',
      borderRadius: '28px', padding: '32px',
      border: '1px solid rgba(107,143,113,0.2)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px' }}>Today's Command Center</p>

        {/* Score + actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'H+ Earned', value: `${stats.todayPoints}`, unit: `/ ${stats.todayMax}`, accent: '#D4A843' },
            { label: 'Actions Done', value: `${done}`, unit: `/ ${total}`, accent: '#A8C5AC' },
            { label: 'Activity H+', value: `${activityH}`, unit: 'pts', accent: '#A8C5AC' },
            { label: 'Biomarker H+', value: `${stats.todayBiomarkerPoints}`, unit: 'pts', accent: '#7B9EC8' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 900, color: s.accent, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}<span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Perfect day progress */}
        <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#D4A843' }}>Perfect Day Progress</p>
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4A843' }}>{stats.todayPoints} / {stats.todayMax}</p>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '8px' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${todayPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #D4A843, #F0C96A)', boxShadow: '0 0 12px rgba(212,168,67,0.4)' }} />
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            {remaining > 0 ? `${remaining} H+ remaining until perfect day` : 'Perfect day achieved!'}
          </p>
        </div>

        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={16} color="#D4A843" strokeWidth={2} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Streak</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#D4A843', letterSpacing: '-0.02em' }}>{stats.streak} days</span>
        </div>

        {/* CTA */}
        <button style={{
          width: '100%', padding: '16px',
          background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)',
          color: '#fff', border: 'none', borderRadius: '16px',
          fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(107,143,113,0.35)',
        }}>
          <Zap size={16} strokeWidth={2.5} />
          Continue Today's Journey
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function DtConsistencyWall({ calendar }: { calendar: ReturnType<typeof getMonthCalendar> }) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const cellStyle = (day: ReturnType<typeof getMonthCalendar>[0]): React.CSSProperties => {
    if (day.isFuture) return { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' };
    if (day.isPerfect) return { background: 'linear-gradient(135deg, #D4A843, #F0C96A)', border: '1px solid rgba(212,168,67,0.5)', boxShadow: '0 2px 10px rgba(212,168,67,0.35)' };
    if (day.totalPoints >= 20) return { background: 'rgba(107,143,113,0.45)', border: '1px solid rgba(107,143,113,0.35)' };
    if (day.totalPoints > 0) return { background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.2)' };
    return { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' };
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
        {weekDays.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', paddingBottom: '4px' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {calendar.map((day) => {
          const dateNum = parseInt(day.date.split('-')[2] ?? '0', 10);
          return (
            <motion.div key={day.date} whileHover={{ scale: 1.08 }}
              title={`Jun ${dateNum}: ${day.totalPoints} H+${day.isPerfect ? ' ✓ Perfect' : ''}`}
              style={{
                aspectRatio: '1', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: day.isToday ? 900 : 600,
                color: day.isPerfect ? '#1a1200' : day.isFuture ? 'rgba(255,255,255,0.15)' : day.totalPoints >= 20 ? '#fff' : day.totalPoints > 0 ? 'rgba(160,205,168,0.8)' : 'rgba(255,255,255,0.2)',
                cursor: 'default', position: 'relative',
                outline: day.isToday ? '2px solid #D4A843' : 'none',
                outlineOffset: '2px',
                ...cellStyle(day),
              }}>
              {dateNum}
              {day.isPerfect && (
                <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#fff', border: '1.5px solid #D4A843' }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DtNextAchievementCard({ achievements, stats }: { achievements: ReturnType<typeof getAchievements>; stats: HPageStats }) {
  const nextUnearned = achievements.find((a) => !a.earned);
  if (!nextUnearned) return null;

  const tier = TIER_COLORS[nextUnearned.tier] ?? DEFAULT_TIER;
  const Icon = ACHIEVEMENT_ICONS[nextUnearned.iconKey] ?? Star;
  // For streak achievements use streak; for points use score; otherwise guess from description
  const isStreakGoal = nextUnearned.title.toLowerCase().includes('streak') || nextUnearned.description.toLowerCase().includes('streak');
  const current = isStreakGoal ? stats.streak : stats.score;
  // Try to extract a number from description like "25 days" or "100 points"
  const numMatch = nextUnearned.description.match(/\d+/);
  const target = numMatch ? parseInt(numMatch[0], 10) : 100;
  const pct = Math.min((current / target) * 100, 100);
  const remaining = Math.max(0, target - current);
  const daysToUnlock = isStreakGoal ? remaining : Math.ceil(remaining / (stats.todayMax * 0.7));

  return (
    <div style={{
      background: `linear-gradient(135deg, ${tier.bg.replace('0.1)', '0.12)')}, rgba(255,255,255,0.02))`,
      border: `1.5px solid ${tier.ring}`,
      borderRadius: '24px', padding: '32px 36px',
      display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center',
      boxShadow: `0 8px 32px ${tier.bg}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-40px', right: '80px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${tier.bg.replace('0.1)', '0.12)')}, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: tier.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Next Achievement</p>
        <h3 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>{nextUnearned.title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>{nextUnearned.description}</p>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>Progress</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: tier.accent }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${tier.accent}, ${tier.ring})` }} />
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          <strong style={{ color: tier.accent }}>{remaining}</strong> {isStreakGoal ? 'days' : 'H+'} remaining ·
          <span style={{ marginLeft: '6px' }}>Projected unlock in ~{daysToUnlock} {isStreakGoal ? 'days' : 'weeks'}</span>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: tier.bg, border: `2px solid ${tier.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${tier.bg}` }}>
          <Icon size={36} color={tier.accent} strokeWidth={1.6} />
        </div>
        <div style={{ background: tier.bg, borderRadius: '8px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, color: tier.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {tier.label}
        </div>
      </div>
    </div>
  );
}

function DtHeroChart({ analytics }: { analytics: ReturnType<typeof getAnalyticsData> }) {
  const peak = Math.max(...analytics.combinedScore, 1);
  const actPeak = Math.max(...analytics.activityPoints, 1);

  return (
    <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        {[
          { color: '#6B8F71', label: 'Activity H+' },
          { color: '#4A8BBE', label: 'Biomarker H+' },
          { color: '#D4A843', label: 'Combined' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Combined area chart */}
      <div style={{ position: 'relative', height: '200px', marginBottom: '12px' }}>
        <svg width="100%" height="200" viewBox={`0 0 ${analytics.combinedScore.length * 60} 200`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-combined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(212,168,67,0.35)" />
              <stop offset="100%" stopColor="rgba(212,168,67,0)" />
            </linearGradient>
            <linearGradient id="chart-activity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(107,143,113,0.3)" />
              <stop offset="100%" stopColor="rgba(107,143,113,0)" />
            </linearGradient>
          </defs>
          {/* Combined area */}
          <path
            d={`M 0 ${200 - (analytics.combinedScore[0]! / peak) * 180} ${analytics.combinedScore.map((v, i) => `L ${i * 60} ${200 - (v / peak) * 180}`).join(' ')} L ${(analytics.combinedScore.length - 1) * 60} 200 L 0 200 Z`}
            fill="url(#chart-combined)" />
          <path
            d={analytics.combinedScore.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * 60} ${200 - (v / peak) * 180}`).join(' ')}
            fill="none" stroke="#D4A843" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Activity area */}
          <path
            d={`M 0 ${200 - (analytics.activityPoints[0]! / actPeak) * 180} ${analytics.activityPoints.map((v, i) => `L ${i * 60} ${200 - (v / actPeak) * 180}`).join(' ')} L ${(analytics.activityPoints.length - 1) * 60} 200 L 0 200 Z`}
            fill="url(#chart-activity)" />
          <path
            d={analytics.activityPoints.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * 60} ${200 - (v / actPeak) * 180}`).join(' ')}
            fill="none" stroke="#6B8F71" strokeWidth="2" strokeLinejoin="round" strokeDasharray="0" />
        </svg>
      </div>

      {/* X labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {analytics.labels.map((l, i) => (
          <span key={i} style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500 }}>{l}</span>
        ))}
      </div>

      {/* Summary stats below */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        {[
          { label: 'Activity H+', value: analytics.activityPoints[analytics.activityPoints.length - 1]!, color: '#6B8F71' },
          { label: 'Biomarker H+', value: analytics.biomarkerPoints[analytics.biomarkerPoints.length - 1]!, color: '#4A8BBE' },
          { label: 'Combined', value: analytics.combinedScore[analytics.combinedScore.length - 1]!, color: '#D4A843' },
        ].map((s) => (
          <div key={s.label}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DtInsightPanel({ analytics, stats }: { analytics: ReturnType<typeof getAnalyticsData>; stats: HPageStats }) {
  const insights = [
    { label: 'Your strongest habit', value: 'Morning routine', icon: Sun, accent: '#D4A843' },
    { label: 'Biggest H+ source', value: 'Meal logging', icon: Utensils, accent: '#6B8F71' },
    { label: 'Growth edge', value: 'Evening wind-down', icon: Moon, accent: '#7B9EC8' },
    { label: 'Potential weekly gain', value: `+${Math.round(stats.todayMax * 2)} H+`, icon: TrendingUp, accent: '#A8C5AC' },
  ];

  void analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Insight Intelligence</p>
      {insights.map((ins) => {
        const IIcon = ins.icon;
        return (
          <div key={ins.label} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `rgba(${ins.accent === '#D4A843' ? '212,168,67' : ins.accent === '#6B8F71' ? '107,143,113' : ins.accent === '#7B9EC8' ? '123,158,200' : '168,197,172'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IIcon size={14} color={ins.accent} strokeWidth={2} />
              </div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{ins.label}</p>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em' }}>{ins.value}</p>
          </div>
        );
      })}
      <div style={{ background: 'linear-gradient(135deg, rgba(107,143,113,0.08), rgba(212,168,67,0.06))', border: '1px solid rgba(107,143,113,0.2)', borderRadius: '16px', padding: '16px 18px', marginTop: '4px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.6, fontWeight: 500 }}>
          {analytics.insights[0]}
        </p>
      </div>
    </div>
  );
}

function DtCategoryPerformance({ categories }: { categories: HPlusCategoryStats[] }) {
  const sorted = [...categories].sort((a, b) => b.completionPct - a.completionPct);
  const strong = sorted.slice(0, 3);
  const growth = sorted.slice(3, 6);
  const quick = sorted.slice(6);

  const renderGroup = (items: typeof categories, labelText: string, labelColor: string, labelBg: string) => (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: labelBg, borderRadius: '12px', padding: '4px 12px', marginBottom: '16px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: labelColor }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: labelColor, letterSpacing: '0.06em' }}>{labelText}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.category];
          return (
            <motion.div key={cat.category} whileHover={{ x: 4 }} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: `1.5px solid ${cat.accentBorder}`, borderRadius: '16px', padding: '14px 18px', cursor: 'default', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <RadialProgress pct={cat.completionPct} color={cat.color} size={52} strokeWidth={5} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={cat.color} strokeWidth={1.8} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '2px' }}>{cat.label}</p>
                <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cat.completionPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '2px', background: cat.color }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '18px', fontWeight: 900, color: cat.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{cat.currentPoints}</p>
                <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>/ {cat.maxPoints}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
      {renderGroup(strong, 'Already Strong', '#6B8F71', 'rgba(107,143,113,0.1)')}
      {renderGroup(growth.length ? growth : sorted.slice(0, 3), 'Growth Opportunities', '#D4A843', 'rgba(212,168,67,0.1)')}
      {renderGroup(quick.length ? quick : sorted.slice(0, 2), 'Quick Wins', '#7B9EC8', 'rgba(123,158,200,0.1)')}
    </div>
  );
}

function DtFeaturedTransformation() {
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(107,143,113,0.12) 0%, rgba(255,255,255,0.04) 100%)',
      border: '1px solid rgba(107,143,113,0.2)',
      borderRadius: '24px', padding: '32px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Featured Transformation</p>

        {/* Member */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(107,143,113,0.4), rgba(212,168,67,0.2))', border: '2px solid rgba(107,143,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>R</span>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>Rajesh K.</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Month 4 · Pune</p>
          </div>
        </div>

        <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '20px' }}>
          "Lost 8kg and my energy is completely transformed."
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {[
            { label: 'H+ Score', value: '2,847' },
            { label: 'Streak', value: '41 days' },
            { label: 'Perfect Days', value: '18' },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(160,205,168,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Achievement chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Movement Master', '30-Day Streak', 'Meal Champion'].map((badge) => (
            <div key={badge} style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#D4A843' }}>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DtReferralCelebration({ referrals }: { referrals: ReturnType<typeof getReferrals> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
      {/* Left — celebration copy */}
      <div>
        <div className="hp-eyebrow-gold">Referrals</div>
        <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Help someone begin<br />
          <span style={{ color: 'var(--color-gold)' }}>their transformation.</span>
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginBottom: '28px', maxWidth: '400px', lineHeight: 1.6 }}>
          You've built something real. Share the journey — and earn meaningful rewards when the people you invite succeed.
        </p>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', border: '1.5px solid var(--color-border)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex' }}>
            {['A', 'B', 'C'].map((l, i) => (
              <div key={l} style={{ width: '32px', height: '32px', borderRadius: '50%', background: `rgba(107,143,113,${0.4 - i * 0.1})`, border: '2px solid #fff', marginLeft: i === 0 ? 0 : '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                {l}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500 }}>
            <strong style={{ color: 'var(--color-ink)' }}>247 members</strong> have joined through referrals this month
          </p>
        </div>

        <button style={{
          padding: '15px 32px',
          background: 'linear-gradient(135deg, #D4A843 0%, #F0C96A 100%)',
          color: '#1a1200', border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          letterSpacing: '-0.01em',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(212,168,67,0.3)',
        }}>
          <Users size={16} strokeWidth={2.5} />
          Share Your Journey
        </button>
      </div>

      {/* Right — reward cards + active referrals */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {[
            { icon: Gift, label: '+1,000 H+', desc: 'When your referral becomes a paid member', accent: '#D4A843', bg: 'rgba(212,168,67,0.07)', border: 'rgba(212,168,67,0.22)' },
            { icon: Star, label: '+100 H+', desc: 'When your referral reaches 1,000 H+ points', accent: '#A0ADB8', bg: 'rgba(160,173,184,0.07)', border: 'rgba(160,173,184,0.22)' },
          ].map((reward) => {
            const RIcon = reward.icon;
            return (
              <div key={reward.label} style={{ background: reward.bg, border: `1.5px solid ${reward.border}`, borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: reward.bg, border: `1px solid ${reward.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RIcon size={20} color={reward.accent} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: reward.accent, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '3px' }}>{reward.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.4 }}>{reward.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {referrals.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your Active Referrals</p>
            </div>
            {referrals.slice(0, 3).map((r, i) => {
              const statusColors: Record<string, string> = { invited: '#A0ADB8', joined: '#6B8F71', paid: '#D4A843', milestone: '#4A8BBE' };
              const statusLabels: Record<string, string> = { invited: 'Invited', joined: 'Joined', paid: '+1,000 H+ earned', milestone: '+100 H+ earned' };
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', borderBottom: i < Math.min(referrals.length, 3) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(107,143,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--color-sage)', flexShrink: 0 }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{r.name}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: statusColors[r.status] }}>{statusLabels[r.status]}</p>
                  </div>
                  {r.pointsEarned > 0 && (
                    <div style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, color: '#D4A843' }}>
                      +{r.pointsEarned.toLocaleString()} H+
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
