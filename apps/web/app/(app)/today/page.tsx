'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Lock,
  CheckCircle2,
  ChevronRight,
  Plus,
  Heart,
  Bookmark,
  BarChart3,
  Moon,
  UtensilsCrossed,
  Footprints,
  Brain,
  FlaskConical,
  Target,
  TrendingUp,
  Zap,
  Share2,
  Download,
  Link2,
  Camera,
  Star,
  Sparkles,
  ArrowRight,
  BookOpen,
  Droplets,
  Scale,
  Dumbbell,
  Activity,
} from 'lucide-react';

// ---- Tab types ----
type TabId = 'overview' | 'month1' | 'month2' | 'month3' | 'month4' | 'month5' | 'month6';

const TABS: { id: TabId; label: string; status: 'completed' | 'active' | 'locked' | null }[] = [
  { id: 'overview', label: 'Overview', status: null },
  { id: 'month1', label: 'Month 1', status: 'completed' },
  { id: 'month2', label: 'Month 2', status: 'active' },
  { id: 'month3', label: 'Month 3', status: 'locked' },
  { id: 'month4', label: 'Month 4', status: 'locked' },
  { id: 'month5', label: 'Month 5', status: 'locked' },
  { id: 'month6', label: 'Month 6', status: 'locked' },
];

// ---- Member health goals ----
const memberGoals = [
  { label: 'Reverse Diabetes', icon: Droplets, accent: '#C8887A', bg: 'rgba(200,136,122,0.14)', glow: 'rgba(200,136,122,0.22)' },
  { label: 'Lose Weight',       icon: Scale,    accent: '#A8C5AC', bg: 'rgba(107,143,113,0.14)', glow: 'rgba(107,143,113,0.20)' },
  { label: 'Build Muscle',      icon: Dumbbell, accent: '#D4A843', bg: 'rgba(212,168,67,0.14)',  glow: 'rgba(212,168,67,0.20)'  },
];

// ---- Mini bar chart (CSS only) ----
function MiniBarChart({ bars, color }: { bars: number[]; color: string }) {
  const max = Math.max(...bars, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
      {bars.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(4, (val / max) * 40)}px`,
            borderRadius: '3px 3px 0 0',
            background: i === bars.length - 1
              ? color
              : val > 0 ? color + '55' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}

// ---- Status Badge ----
function Badge({ label, type }: { label: string; type: 'poor' | 'fair' | 'good' }) {
  const styles = {
    poor: { bg: '#FEE2E2', color: '#DC2626' },
    fair: { bg: '#FEF3C7', color: '#D97706' },
    good: { bg: '#DCFCE7', color: '#16A34A' },
  }[type];
  return (
    <span style={{
      background: styles.bg,
      color: styles.color,
      fontSize: '10px',
      fontWeight: 700,
      borderRadius: '20px',
      padding: '2px 8px',
      letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  );
}

// ---- Metric Card ----
function MetricCard({
  title,
  badge,
  badgeType,
  description,
  bars,
  barColor,
  mainValue,
  comparison,
  comparisonColor,
  encouragement,
}: {
  title: string;
  badge: string;
  badgeType: 'poor' | 'fair' | 'good';
  description: string;
  bars: number[];
  barColor: string;
  mainValue: string;
  comparison: string;
  comparisonColor: string;
  encouragement?: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      minWidth: '200px',
      flex: '1 1 200px',
    }}>
      {/* Header: label + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{title}</span>
        <Badge label={badge} type={badgeType} />
      </div>
      {/* Value — first and largest */}
      <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '2px' }}>
        {mainValue}
      </p>
      <p style={{ fontSize: '12px', color: comparisonColor, fontWeight: 600, marginBottom: '14px' }}>
        {comparison}
      </p>
      {/* Chart */}
      <MiniBarChart bars={bars} color={barColor} />
      {/* Coach guidance */}
      {encouragement && (
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', fontStyle: 'italic', marginTop: '12px', lineHeight: 1.5, paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          {encouragement}
        </p>
      )}
    </div>
  );
}

// ---- Workflow Card ----
function WorkflowCard({
  imgSrc,
  icon: Icon,
  title,
  description,
}: {
  imgSrc: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ height: '100px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={imgSrc}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Icon size={13} color="var(--color-sage)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{title}</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{description}</p>
      </div>
    </div>
  );
}

// ---- Article Card ----
function ArticleCard({
  imgSrc,
  title,
  sources,
}: {
  imgSrc: string;
  title: string;
  sources: string;
}) {
  return (
    <div style={{
      width: '260px',
      flexShrink: 0,
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      cursor: 'pointer',
    }}>
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={imgSrc}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
        />
      </div>
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.5, marginBottom: '12px' }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500 }}>{sources}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Heart size={14} color="var(--color-muted)" />
            <Bookmark size={14} color="var(--color-muted)" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Month 1 Completed Content (existing experience) ----
function Month1CompletedContent() {
  return (
    <>

    {/* ═══════ MOBILE ═══════ */}
    <div className="m1-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--color-surface)' }}>

      {/* ── 1. HERO: Premium completion milestone ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '260px', borderRadius: '20px' }}>
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80"
          alt="Awareness & Baseline Correction — health journey"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
        />
        {/* Layer 1: bottom-up dark vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.75) 100%)' }} />
        {/* Layer 2: forest-green tint */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,43,30,0.75) 0%, rgba(74,110,80,0.45) 100%)' }} />
        {/* Radial glow accents */}
        <div style={{ position: 'absolute', top: '18%', right: '12%', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,197,172,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '28%', left: '6%', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,201,106,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
          {/* Completion badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(240,201,106,0.15)',
              border: '2px solid rgba(240,201,106,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5L9 17.5L20 7" stroke="#F0C96A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#F0C96A', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Month 1 Complete</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>Foundation Set</p>
            </div>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
            Know Your Health
          </h2>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '2px', letterSpacing: '0.01em' }}>Awareness &amp; Baseline Correction</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, maxWidth: '300px' }}>
            You&apos;ve successfully completed the first phase of your health transformation journey.
          </p>

          {/* Completion bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #A8C5AC, #F0C96A)', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8C5AC', flexShrink: 0 }}>30 / 30 days</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── 2. ACHIEVEMENT BADGES ── */}
        <div>
          {/* Section header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>🏆</span>
              <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-ink)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Month 1 Achievements</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.55 }}>
              Small wins create lasting change. Here&apos;s what you accomplished during your first 30 days.
            </p>
          </div>

          {/* Circular achievement badges — single row */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            {[
              { icon: '⚖️', value: '−0.8 kg', label: 'Weight Loss' },
              { icon: '📏', value: '−1 cm',   label: 'Waist' },
              { icon: '🚶', value: '5,000',   label: 'Daily Steps' },
              { icon: '🔬', value: '100%',    label: 'Labs Done' },
            ].map((badge, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                {/* Outer sage-tint ring */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(107,143,113,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {/* Inner white badge surface */}
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    {badge.icon}
                  </div>
                </div>
                {/* Value */}
                <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-sage)', letterSpacing: '-0.02em', lineHeight: 1, textAlign: 'center' as const }}>{badge.value}</p>
                {/* Label */}
                <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', textAlign: 'center' as const, lineHeight: 1.3 }}>{badge.label}</p>
              </div>
            ))}
          </div>

          {/* Coach Insight card */}
          <div style={{
            marginTop: '20px',
            background: 'rgba(107,143,113,0.06)',
            border: '1px solid rgba(107,143,113,0.18)',
            borderRadius: '18px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px' }}>💬</span>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Coach Insight</p>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.7, marginBottom: '14px' }}>
              By completing your baseline assessment and building consistent daily habits, you&apos;ve created the foundation required for meaningful metabolic improvement in the months ahead.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(107,143,113,0.15)' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '13px',
              }}>👩‍⚕️</div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>Dr. Ananya Rao</p>
                <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Your Health Coach</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. MILESTONE TIMELINE: replaces 3 text-heavy sections ── */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          border: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>Your journey this month</p>
          {[
            { icon: '🔬', label: 'Health Assessment Completed',       sub: 'Lab review & metabolic risk stratification' },
            { icon: '🥗', label: 'Nutrition Foundations Established',  sub: 'Meal structure & protein awareness' },
            { icon: '😴', label: 'Sleep Assessment Completed',         sub: 'Sleep & stress baseline captured' },
            { icon: '🚶', label: 'Daily Movement Initiated',           sub: '5,000 steps/day goal activated' },
            { icon: '📋', label: 'Habit Tracking Activated',           sub: 'App engagement & consistency built' },
            { icon: '🎯', label: 'SMART Goals Defined',                sub: 'Personal health targets set' },
            { icon: '✅', label: 'Initial Adherence Established',      sub: 'Foundation for Month 2 confirmed' },
          ].map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
              {/* Vertical connector line */}
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', left: '15px', top: '32px', width: '2px', height: 'calc(100% - 4px)', background: 'rgba(107,143,113,0.2)', zIndex: 0 }} />
              )}
              {/* Icon circle */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(107,143,113,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, zIndex: 1, position: 'relative',
                fontSize: '14px',
              }}>
                {step.icon}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? '16px' : '0', flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>{step.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px', lineHeight: 1.4 }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 4. MONTH SUMMARY: single concise paragraph ── */}
        <div style={{
          background: 'rgba(107,143,113,0.06)',
          border: '1px solid rgba(107,143,113,0.18)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>Month 1 Summary</p>
          <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.7 }}>
            You built awareness of your health status, established foundational habits, completed all baseline assessments, and created the groundwork for long-term transformation. Your risk category has been assigned and your programme is fully personalised.
          </p>
        </div>

        {/* ── View summary button (preserved, refined) ── */}
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', border: '1px solid var(--color-border)',
          borderRadius: '16px', padding: '16px 20px',
          cursor: 'pointer', textAlign: 'left', width: '100%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>View your Month 1 summary</p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Stats, biomarkers &amp; coach notes</p>
          </div>
          <ChevronRight size={18} color="var(--color-muted)" />
        </button>

        {/* ── 6. MONTH 2 TRANSITION: anticipation card ── */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2D3A2E 0%, #4A6E50 100%)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Up next</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Month 2</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '6px 12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8C5AC' }}>Build Healthy Habits</p>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '14px' }}>Your focus areas for the next 30 days</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: '🥗', label: 'Nutrition Consistency' },
                { icon: '🚶', label: '6,000–8,000 Steps' },
                { icon: '💪', label: 'Resistance Training' },
                { icon: '💧', label: 'Hydration Targets' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--color-surface)',
                  borderRadius: '10px', padding: '10px 12px',
                }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. SHARE ACHIEVEMENT: premium, streak-free ── */}
        <div style={{
          background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative rings */}
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '90px', height: '90px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Share your achievement</p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Month 1 Complete 🎉
          </h3>

          {/* Achievement stats — no streak */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { value: '−0.8 kg', label: 'Weight lost' },
              { value: '−1 cm',   label: 'Waist reduced' },
              { value: '100%',    label: 'Labs complete' },
              { value: '30 days', label: 'Foundation built' },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#F0C96A', lineHeight: 1, marginBottom: '3px' }}>{stat.value}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', letterSpacing: '0.02em' }}>
            VitalPath · Month 1 of 6 · Know Your Health
          </p>

          {/* Share buttons — all three preserved */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', background: '#25D366',
              border: 'none', borderRadius: '20px', color: '#fff',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Share2 size={13} />Share to WhatsApp
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '20px', color: '#fff',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Download size={13} />Download
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: '20px', color: 'rgba(255,255,255,0.7)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Link2 size={13} />Copy link
            </button>
          </div>
        </div>

      </div>{/* end padded body */}
    </div>{/* end m1-mobile-only */}

    {/* ═══════ DESKTOP ═══════ */}
    <div className="m1-desktop-only">
      <div className="m1-dt-page">

        {/* ── S1: COMPLETION HERO ── */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '520px' }}>
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1800&q=90"
            alt="Awareness & Baseline Correction — health journey"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(7,18,9,0.90) 0%, rgba(18,40,22,0.75) 45%, rgba(0,0,0,0.20) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 65% at 10% 75%, rgba(107,143,113,0.22) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to bottom, transparent, rgba(7,18,9,0.70))' }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', minHeight: '520px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 80px', gap: '24px', maxWidth: '820px' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(240,201,106,0.14)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '7px 18px', alignSelf: 'flex-start', border: '1px solid rgba(240,201,106,0.30)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9 17.5L20 7" stroke="#F0C96A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F0C96A', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Month 1 Complete · Foundation Set</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
              <h2 style={{ fontSize: '68px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 0.96, marginBottom: '16px', textShadow: '0 4px 40px rgba(0,0,0,0.35)' }}>
                Know Your<br />Health
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '500px', marginBottom: '4px' }}>
                You&apos;ve successfully completed the first phase of your health transformation journey.
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.36)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Awareness &amp; Baseline Correction</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>30 / 30 Days</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#A8C5AC' }}>100% Complete</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #A8C5AC, #F0C96A)', borderRadius: '3px' }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── S2: ACHIEVEMENT WORKSPACE (70/30) ── */}
        <div className="m1-dt-section m1-dt-section-sage">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Month 1 Achievements</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>You earned this.</h3>
            </div>
            <div className="m1-dt-achievement-workspace">
              {/* LEFT 70%: Badges */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '0' }}>
                  {[
                    { icon: '⚖️', value: '−0.8 kg', label: 'Weight Loss' },
                    { icon: '📏', value: '−1 cm',   label: 'Waist' },
                    { icon: '🚶', value: '5,000',   label: 'Daily Steps' },
                    { icon: '🔬', value: '100%',    label: 'Labs Done' },
                  ].map((badge, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                      style={{ background: '#fff', borderRadius: '28px', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 4px 28px rgba(0,0,0,0.06)', border: '1px solid var(--color-border)' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(107,143,113,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                          {badge.icon}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' as const }}>
                        <p style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-sage)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>{badge.value}</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)' }}>{badge.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* RIGHT 30%: Coach insight */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)', borderRadius: '28px', padding: '36px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 40px rgba(28,43,30,0.22)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '16px' }}>💬</span>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.7)', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Coach Insight</p>
                    </div>
                    <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.90)', lineHeight: 1.7, fontWeight: 400 }}>
                      By completing your baseline assessment and building consistent daily habits, you&apos;ve created the foundation required for meaningful metabolic improvement in the months ahead.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '28px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>👩‍⚕️</div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Dr. Ananya Rao</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)' }}>Your Health Coach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S3: JOURNEY REFLECTION (60/40) ── */}
        <div className="m1-dt-section m1-dt-section-white">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Journey Reflection</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>Look how far you came.</h3>
            </div>
            <div className="m1-dt-reflection-workspace">
              {/* LEFT 60%: Milestone Timeline */}
              <div style={{ background: 'var(--color-surface)', borderRadius: '28px', padding: '40px', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '32px' }}>Your journey this month</p>
                {[
                  { icon: '🔬', label: 'Health Assessment Completed',       sub: 'Lab review & metabolic risk stratification' },
                  { icon: '🥗', label: 'Nutrition Foundations Established',  sub: 'Meal structure & protein awareness' },
                  { icon: '😴', label: 'Sleep Assessment Completed',         sub: 'Sleep & stress baseline captured' },
                  { icon: '🚶', label: 'Daily Movement Initiated',           sub: '5,000 steps/day goal activated' },
                  { icon: '📋', label: 'Habit Tracking Activated',           sub: 'App engagement & consistency built' },
                  { icon: '🎯', label: 'SMART Goals Defined',                sub: 'Personal health targets set' },
                  { icon: '✅', label: 'Initial Adherence Established',      sub: 'Foundation for Month 2 confirmed' },
                ].map((step, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                    {i < arr.length - 1 && (
                      <div style={{ position: 'absolute', left: '19px', top: '40px', width: '2px', height: 'calc(100% - 8px)', background: 'rgba(107,143,113,0.18)', zIndex: 0 }} />
                    )}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(107,143,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, position: 'relative', fontSize: '18px' }}>
                      {step.icon}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? '24px' : '0', flex: 1, paddingTop: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>{step.label}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.45 }}>{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* RIGHT 40%: Month Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(107,143,113,0.06)', border: '1px solid rgba(107,143,113,0.18)', borderRadius: '28px', padding: '36px', flex: 1 }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '16px' }}>Month 1 Summary</p>
                  <p style={{ fontSize: '16px', color: 'var(--color-ink)', lineHeight: 1.75 }}>
                    You built awareness of your health status, established foundational habits, completed all baseline assessments, and created the groundwork for long-term transformation. Your risk category has been assigned and your programme is fully personalised.
                  </p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '22px 28px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>View your Month 1 summary</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '3px' }}>Stats, biomarkers &amp; coach notes</p>
                  </div>
                  <ChevronRight size={20} color="var(--color-muted)" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── S4: NEXT CHAPTER ── */}
        <div className="m1-dt-section m1-dt-section-dark">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
              {/* LEFT: transition copy */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '12px' }}>Up Next</p>
                <h3 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '20px' }}>
                  Month 2<br /><span style={{ color: '#A8C5AC' }}>Build Healthy<br />Habits</span>
                </h3>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '460px' }}>
                  Month 1 is complete. The foundation is set. Now we build the daily systems that make your transformation sustainable and lasting.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '400px' }}>
                  {[
                    { icon: '🥗', label: 'Nutrition Consistency' },
                    { icon: '🚶', label: '6,000–8,000 Steps' },
                    { icon: '💪', label: 'Resistance Training' },
                    { icon: '💧', label: 'Hydration Targets' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.10)' }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* RIGHT: visual transition card */}
              <div style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', minHeight: '440px', boxShadow: '0 16px 64px rgba(0,0,0,0.45)' }}>
                <img
                  src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=85"
                  alt="Month 2 — Build Healthy Habits"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Foundation Building</p>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Month 2 is waiting.</p>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.70)', marginTop: '6px' }}>Once you understand your patterns, we begin building sustainable habits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S5: SHARE ACHIEVEMENT ── */}
        <div className="m1-dt-section m1-dt-section-stone">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' as const }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Share Your Achievement</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>Month 1 Complete 🎉</h3>
              <p style={{ fontSize: '17px', color: 'var(--color-muted)', marginTop: '12px' }}>Your foundation is built. Let your people know.</p>
            </div>
            <div style={{ background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)', borderRadius: '32px', padding: '56px', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 64px rgba(28,43,30,0.28)' }}>
              <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div className="m1-dt-share-layout">
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>VitalPath · Month 1 of 6 · Know Your Health</p>
                  <h4 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '28px' }}>Month 1 Complete 🎉</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '36px', maxWidth: '440px' }}>
                    {[
                      { value: '−0.8 kg', label: 'Weight lost' },
                      { value: '−1 cm',   label: 'Waist reduced' },
                      { value: '100%',    label: 'Labs complete' },
                      { value: '30 days', label: 'Foundation built' },
                    ].map((stat, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
                        <p style={{ fontSize: '26px', fontWeight: 900, color: '#F0C96A', lineHeight: 1, marginBottom: '5px' }}>{stat.value}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', fontWeight: 500 }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#25D366', border: 'none', borderRadius: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                      <Share2 size={15} />Share to WhatsApp
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.30)', borderRadius: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                      <Download size={15} />Download
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: '24px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                      <Link2 size={15} />Copy link
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <p style={{ fontSize: '52px', textAlign: 'center' as const, marginBottom: '16px' }}>🏆</p>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textAlign: 'center' as const, marginBottom: '8px' }}>Foundation Built</p>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center' as const, lineHeight: 1.6 }}>You completed the first chapter of your health transformation story.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end m1-dt-page */}
    </div>{/* end m1-desktop-only */}

    </> /* end Month1CompletedContent fragment */
  );
}

// ---- Shared Transformation Story section (appears on all monthly pages) ----
const CHAPTER_STORY_DATA: Record<number, {
  chapterNum: number;
  chapterName: string;
  headline: string;
  copy: string;
  primaryCta: string;
  secondaryCta: string;
  reflectionPrompt: string;
  futureCopy: string;
  mealHeading: string;
}> = {
  1: {
    chapterNum: 1,
    chapterName: 'The Beginning',
    headline: 'Every Success Story Has A Beginning',
    copy: 'You are creating the foundation of your future transformation. Every photo you take today becomes evidence of your courage to start.',
    primaryCta: 'Capture My Day 1 Photo',
    secondaryCta: 'Define My Health Goals',
    reflectionPrompt: 'Why are you starting this journey?',
    futureCopy: 'Imagine yourself six months from now — more energy, better health, more confidence.',
    mealHeading: 'Build Your Success Blueprint',
  },
  2: {
    chapterNum: 2,
    chapterName: 'Building Momentum',
    headline: 'The Change Is Starting To Show',
    copy: 'Small habits repeated daily create extraordinary results. Document this chapter — future you will be grateful you did.',
    primaryCta: "Add This Month's Progress Photo",
    secondaryCta: 'Update My Goals',
    reflectionPrompt: "What's feeling easier today than it did two weeks ago?",
    futureCopy: 'Imagine where another 30 days of consistency could take you.',
    mealHeading: 'Your Nutrition Strategy',
  },
  3: {
    chapterNum: 3,
    chapterName: 'Visible Change',
    headline: "Look How Far You've Come",
    copy: "Compare today's photo to your starting point. The difference may surprise you. Three months of consistency is becoming visible.",
    primaryCta: 'Add Month 3 Progress Photo',
    secondaryCta: 'Review My Goals',
    reflectionPrompt: 'What physical change have you noticed that surprised you most?',
    futureCopy: 'You are halfway to graduation. The best progress is still ahead.',
    mealHeading: 'Refine Your Nutrition Plan',
  },
  4: {
    chapterNum: 4,
    chapterName: 'A New Identity',
    headline: 'Your Consistency Is Becoming Visible',
    copy: 'Others may begin noticing. The most important thing is that you notice. These are not temporary changes — they are becoming who you are.',
    primaryCta: 'Add Month 4 Progress Photo',
    secondaryCta: 'Review My Goals',
    reflectionPrompt: 'What would the person you were four months ago think of who you are today?',
    futureCopy: 'Two months to graduation. Finish what you started.',
    mealHeading: 'Optimise Your Nutrition',
  },
  5: {
    chapterNum: 5,
    chapterName: 'The Breakthrough',
    headline: "You're Building A New Identity",
    copy: "These are no longer temporary changes. They are becoming part of who you are. Five months of evidence that transformation is possible.",
    primaryCta: 'Add Month 5 Progress Photo',
    secondaryCta: 'Review My Goals',
    reflectionPrompt: 'What is the single most important thing this programme has taught you?',
    futureCopy: 'One month to graduation. Make it count.',
    mealHeading: 'Your Long-Term Nutrition Playbook',
  },
  6: {
    chapterNum: 6,
    chapterName: 'Your New Normal',
    headline: 'This Is Your Transformation Story',
    copy: 'Take a moment to appreciate everything you have achieved. Six months of photos, habits and milestones — this is your story.',
    primaryCta: 'Capture Your Graduation Photo',
    secondaryCta: 'Celebrate My Achievement',
    reflectionPrompt: 'What would you tell someone who is just starting their journey?',
    futureCopy: 'You have built a lifetime of healthy habits. This is only the beginning.',
    mealHeading: 'Your Lifelong Nutrition Playbook',
  },
};

// Per-month visual identity for the story header
const STORY_HEADER_DESIGN = {
  1: {
    gradient: 'linear-gradient(148deg, #2A1400 0%, #6B3810 45%, #B07828 100%)',
    glow1: 'radial-gradient(ellipse, rgba(210,168,74,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(176,120,40,0.22) 0%, transparent 60%)',
    accent: 'rgba(255,218,130,0.85)',
    sub: 'rgba(255,200,100,0.58)',
    ringFrom: '#D4A843', ringTo: '#F0C96A',
  },
  2: {
    gradient: 'linear-gradient(148deg, #071710 0%, #163326 45%, #2A5C3C 100%)',
    glow1: 'radial-gradient(ellipse, rgba(78,138,94,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(42,92,60,0.22) 0%, transparent 60%)',
    accent: 'rgba(160,220,175,0.85)',
    sub: 'rgba(140,210,158,0.58)',
    ringFrom: '#4A6E50', ringTo: '#A8C5AC',
  },
  3: {
    gradient: 'linear-gradient(148deg, #040A18 0%, #0E1E38 45%, #1A3660 100%)',
    glow1: 'radial-gradient(ellipse, rgba(60,100,190,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(30,70,145,0.22) 0%, transparent 60%)',
    accent: 'rgba(170,200,255,0.85)',
    sub: 'rgba(150,185,255,0.58)',
    ringFrom: '#3D5F8F', ringTo: '#7B9FCC',
  },
  4: {
    gradient: 'linear-gradient(148deg, #100A22 0%, #281E52 45%, #42357A 100%)',
    glow1: 'radial-gradient(ellipse, rgba(130,112,210,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(100,85,175,0.22) 0%, transparent 60%)',
    accent: 'rgba(210,200,255,0.85)',
    sub: 'rgba(192,182,255,0.58)',
    ringFrom: '#6457A0', ringTo: '#A89FD8',
  },
  5: {
    gradient: 'linear-gradient(148deg, #09110A 0%, #1A2E1C 45%, #2C4C2F 100%)',
    glow1: 'radial-gradient(ellipse, rgba(78,114,82,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(50,90,55,0.22) 0%, transparent 60%)',
    accent: 'rgba(155,205,162,0.85)',
    sub: 'rgba(135,195,145,0.58)',
    ringFrom: '#4A7050', ringTo: '#9BC8A2',
  },
  6: {
    gradient: 'linear-gradient(148deg, #180E00 0%, #402810 45%, #7A5418 100%)',
    glow1: 'radial-gradient(ellipse, rgba(184,132,14,0.38) 0%, transparent 65%)',
    glow2: 'radial-gradient(ellipse, rgba(140,100,20,0.22) 0%, transparent 60%)',
    accent: 'rgba(255,215,110,0.85)',
    sub: 'rgba(255,200,80,0.58)',
    ringFrom: '#A67C2E', ringTo: '#E6C77A',
  },
} as const;

// Per-month journey highlights (milestone achievements)
const STORY_MILESTONES = {
  1: [
    { icon: '⚖️', label: 'Starting weight logged', value: '82 kg' },
    { icon: '🔬', label: 'Health assessment', value: '100%' },
    { icon: '🚶', label: 'First step goal', value: '5,000' },
    { icon: '📋', label: 'Habit tracking', value: 'Active' },
  ],
  2: [
    { icon: '⚖️', label: 'Weight lost', value: '−2.4 kg' },
    { icon: '🚶', label: 'Best step day', value: '7,240' },
    { icon: '🔥', label: 'Consistency streak', value: '14 days' },
    { icon: '😴', label: 'Sleep improving', value: '+35 min' },
  ],
  3: [
    { icon: '😴', label: 'Sleep quality', value: '+45 min' },
    { icon: '🩸', label: 'Blood sugar', value: '↓ Trending' },
    { icon: '🚶', label: 'Post-meal walks', value: 'Consistent' },
    { icon: '🌿', label: 'Gut health', value: 'Improving' },
  ],
  4: [
    { icon: '🧠', label: 'Stress score', value: '↓ Lower' },
    { icon: '💪', label: 'Strength sessions', value: '3×/week' },
    { icon: '📏', label: 'Waist reducing', value: '↓ Trend' },
    { icon: '⚡', label: 'Energy', value: 'Sustained' },
  ],
  5: [
    { icon: '🔄', label: 'Habit consistency', value: '90%+' },
    { icon: '🧭', label: 'Self-monitoring', value: 'Active' },
    { icon: '🌿', label: 'Gut health', value: 'Optimised' },
    { icon: '📖', label: 'Health literacy', value: 'High' },
  ],
  6: [
    { icon: '🏆', label: 'Programme complete', value: '6 months' },
    { icon: '⚖️', label: 'Total weight lost', value: '−6 kg' },
    { icon: '🩸', label: 'Blood sugar', value: 'Normalised' },
    { icon: '❤️', label: 'Lifetime habits', value: 'Built' },
  ],
} as const;

type MonthTransformationStoryProps = {
  monthNum: number;
  uploadedPhotos?: string[];
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef?: React.RefObject<HTMLInputElement | null>;
};

// ─────────────────────────────────────────────────────────────────────────────
// NutritionStrategyCard
// Fixed-height shell — all 3 panels always in DOM, only opacity toggles.
// variant="default" — used in Overview desktop right col, mobile Overview, mobile MTS right col
// variant="month"   — compact, used in desktop month-page MTS right col
// The outer container NEVER resizes when switching tabs.
// ─────────────────────────────────────────────────────────────────────────────
type NutritionMode = 'coach' | 'diy' | 'assigned';

const NS_MEALS = [
  { category: 'Breakfast', name: 'Protein-Packed Poha',          kcal: 420, protein: 22, color: '#D4A843', colorDim: 'rgba(212,168,67,0.16)',   emoji: '🌾' },
  { category: 'Lunch',     name: 'Balanced Dal Bowl',             kcal: 510, protein: 31, color: '#6B8F71', colorDim: 'rgba(107,143,113,0.16)', emoji: '🥣' },
  { category: 'Snack',     name: 'Greek Yogurt & Nuts',           kcal: 180, protein: 14, color: '#C8604A', colorDim: 'rgba(200,96,74,0.16)',   emoji: '🥛' },
  { category: 'Dinner',    name: 'Grilled Paneer Salad',          kcal: 460, protein: 35, color: '#8FA4FF', colorDim: 'rgba(143,164,255,0.16)', emoji: '🥗' },
  { category: 'Weekend',   name: 'Family-Friendly Khichdi Bowl',  kcal: 480, protein: 24, color: '#A8C5AC', colorDim: 'rgba(168,197,172,0.16)', emoji: '🍲' },
];

const NS_MODE_TABS: { id: NutritionMode; label: string }[] = [
  { id: 'coach',    label: 'Coach Supported' },
  { id: 'diy',      label: 'DIY Builder'     },
  { id: 'assigned', label: 'Assigned Plan'   },
];

function NutritionStrategyCard({ variant = 'default' }: { variant?: 'default' | 'month' }) {
  const [mode, setMode] = useState<NutritionMode>('assigned');
  const compact = variant === 'month';

  // Content-zone height: tall enough for Assigned (meal rail + progress + CTAs),
  // so Coach and DIY sit inside the same fixed space.
  const contentH = compact ? '300px' : '360px';
  const bp       = compact ? '12px 14px' : '16px 18px';  // body padding
  const h3sz     = compact ? '14px'      : '18px';
  const copysz   = compact ? '11px'      : '13px';
  const ctasz    = compact ? '11px'      : '13px';
  const ctapy    = compact ? '9px 12px'  : '12px 18px';
  const mealW    = compact ? '130px'     : '152px';
  const imgH     = compact ? '50px'      : '76px';
  const emojiSz  = compact ? '24px'      : '30px';
  const railH    = compact ? '128px'     : '160px';  // fixed rail wrapper height

  return (
    <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .ns-seg { display: flex; background: rgba(255,255,255,0.10); border-radius: 40px; padding: 3px; gap: 2px; }
        .ns-seg-btn {
          flex: 1; border-radius: 36px; border: none; cursor: pointer;
          font-weight: 700; letter-spacing: 0.01em; transition: all 0.20s ease;
          white-space: nowrap; line-height: 1;
        }
        .ns-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 9px; border-radius: 20px; font-size: 9px; font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .ns-meal-rail {
          display: flex; gap: 10px; overflow-x: auto;
          scroll-snap-type: x mandatory; scrollbar-width: none;
          -webkit-overflow-scrolling: touch; height: 100%;
        }
        .ns-meal-rail::-webkit-scrollbar { display: none; }
        .ns-meal-tile {
          border-radius: 14px; overflow: hidden; flex-shrink: 0;
          scroll-snap-align: start; cursor: default;
          transition: transform 0.20s ease, box-shadow 0.20s ease;
          display: flex; flex-direction: column;
        }
        .ns-meal-tile:hover { transform: translateY(-3px); }
        .ns-cta-p {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; border: none; border-radius: 13px;
          font-weight: 700; cursor: pointer; letter-spacing: -0.01em;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .ns-cta-p:hover { transform: translateY(-2px); }
        .ns-cta-g {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; border-radius: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.16s ease;
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.70);
          border: 1px solid rgba(255,255,255,0.14);
        }
        .ns-cta-g:hover { background: rgba(255,255,255,0.13); color: #fff; }
        .ns-pbar-track { height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
        .ns-pbar-fill  { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #6B8F71, #A8C5AC); }
        .ns-assigned-ctas { display: flex; flex-direction: column; gap: 6px; }
        @media (min-width: 1024px) {
          .ns-assigned-ctas { align-items: center; }
          .ns-assigned-ctas .ns-cta-p {
            width: fit-content !important;
            min-width: 240px;
            max-width: 320px;
          }
          .ns-assigned-ctas .ns-cta-g {
            width: fit-content !important;
            min-width: 200px;
            max-width: 280px;
          }
        }
      `}</style>

      {/* ── Fixed-height header (segmented control) ── */}
      <div style={{ background: 'linear-gradient(135deg, #1C2B1E 0%, #0d1a0f 100%)', padding: compact ? '10px 13px 9px' : '13px 16px 11px' }}>
        <p style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(168,197,172,0.52)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '7px' }}>Demo · Nutrition State</p>
        <div className="ns-seg">
          {NS_MODE_TABS.map(t => (
            <button
              key={t.id}
              className="ns-seg-btn"
              onClick={() => setMode(t.id)}
              style={{
                padding: compact ? '5px 7px' : '6px 9px',
                fontSize: compact ? '10px' : '11px',
                background: mode === t.id ? '#fff' : 'transparent',
                color: mode === t.id ? '#1C2B1E' : 'rgba(255,255,255,0.50)',
                boxShadow: mode === t.id ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fixed-height content shell ──
          All 3 panels are always in the DOM.
          position:absolute + opacity swap — the outer div never changes height. */}
      <div style={{ position: 'relative', height: contentH, overflow: 'hidden' }}>

        {/* ── Panel A: Coach Supported ── */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: mode === 'coach' ? 1 : 0,
          pointerEvents: mode === 'coach' ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
          background: 'linear-gradient(148deg, #2A1800 0%, #5C3410 40%, #B07828 100%)',
          padding: bp, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <motion.div animate={{ opacity: [0.14, 0.28, 0.14] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-24px', right: '-24px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,168,67,0.34) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginBottom: '10px' }}>
              {[
                { label: 'Coach Reviewed', color: '#D4A843', bg: 'rgba(212,168,67,0.18)' },
                { label: 'Personalised',   color: '#A8C5AC', bg: 'rgba(168,197,172,0.16)' },
                { label: 'Goal-based',     color: '#F0C96A', bg: 'rgba(240,201,106,0.14)' },
              ].map(b => (
                <span key={b.label} className="ns-badge" style={{ background: b.bg, color: b.color, border: `1px solid ${b.color}28` }}>{b.label}</span>
              ))}
            </div>
            {!compact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(212,168,67,0.42)' }}>
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '1px' }}>Dr. Ananya Rao <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#7FFFA0', verticalAlign: 'middle', marginLeft: '3px' }} /></p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.46)' }}>Certified Health Coach · Online</p>
                </div>
              </div>
            )}
            <h3 style={{ fontSize: h3sz, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.22, marginBottom: '6px' }}>
              {compact ? 'Ready to build your nutrition plan' : 'Your coach is ready to build your nutrition strategy'}
            </h3>
            <p style={{ fontSize: copysz, color: 'rgba(255,255,255,0.55)', lineHeight: 1.58, marginBottom: '0' }}>
              {compact
                ? 'A certified coach will review your goals and biomarkers.'
                : 'A certified health coach will review your goals, biomarkers and lifestyle to create a plan that fits your journey.'}
            </p>
          </div>
          <div>
            <button className="ns-cta-p" style={{ padding: ctapy, fontSize: ctasz, background: 'linear-gradient(135deg, #D4A843 0%, #B07828 100%)', color: '#fff', boxShadow: '0 3px 12px rgba(212,168,67,0.32)', marginBottom: '6px' }}>
              <UtensilsCrossed size={12} strokeWidth={2.5} />
              Request My Meal Plan
            </button>
            <p style={{ textAlign: 'center' as const, fontSize: '9px', color: 'rgba(255,255,255,0.34)' }}>Most members receive their plan within 48 hours.</p>
          </div>
        </div>

        {/* ── Panel B: DIY Builder ── */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: mode === 'diy' ? 1 : 0,
          pointerEvents: mode === 'diy' ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
          background: 'linear-gradient(148deg, #FAF5EC 0%, #F0E6CC 60%, #EDD9B0 100%)',
          padding: bp, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,168,67,0.11) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginBottom: '10px' }}>
              {[
                { label: 'Flexible choices',   color: '#4A6E50', bg: 'rgba(74,110,80,0.10)' },
                { label: 'Indian options',      color: '#B07828', bg: 'rgba(176,120,40,0.10)' },
                { label: 'Goal-aligned',        color: '#6B8F71', bg: 'rgba(107,143,113,0.10)' },
              ].map(b => (
                <span key={b.label} className="ns-badge" style={{ background: b.bg, color: b.color, border: `1px solid ${b.color}26` }}>{b.label}</span>
              ))}
            </div>
            {!compact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.14)', borderRadius: '11px', padding: '10px 12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>🥗</span>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '1px' }}>VitalPath Nutrition Framework</p>
                  <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Guided templates · Indian cuisines · Goal-aligned</p>
                </div>
              </div>
            )}
            <h3 style={{ fontSize: h3sz, fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.22, marginBottom: '6px' }}>
              {compact ? 'Build your own nutrition plan' : 'Build a nutrition plan that works for you'}
            </h3>
            <p style={{ fontSize: copysz, color: 'var(--color-muted)', lineHeight: 1.58 }}>
              {compact
                ? "Use VitalPath's guided framework at your own pace."
                : "Create a personalised plan using VitalPath's guided nutrition framework. Your choices, your pace."}
            </p>
          </div>
          <div>
            <button className="ns-cta-p" style={{ padding: ctapy, fontSize: ctasz, background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)', color: '#fff', boxShadow: '0 3px 12px rgba(107,143,113,0.26)', marginBottom: '6px' }}>
              <UtensilsCrossed size={12} strokeWidth={2.5} />
              Create My Own Meal Plan
            </button>
            <p style={{ textAlign: 'center' as const, fontSize: '9px', color: 'var(--color-muted)' }}>Update your plan anytime as your goals evolve.</p>
          </div>
        </div>

        {/* ── Panel C: Assigned Plan ── */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: mode === 'assigned' ? 1 : 0,
          pointerEvents: mode === 'assigned' ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
          background: 'linear-gradient(160deg, #071710 0%, #0d1f14 55%, #163326 100%)',
          padding: bp, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '9px',
        }}>
          <motion.div animate={{ opacity: [0.16, 0.32, 0.16] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-32px', right: '-32px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,143,113,0.26) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Header row */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <p style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(168,197,172,0.52)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '3px' }}>Active Meal Plan</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: compact ? '15px' : '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.18 }}>Week 3 Nutrition Plan</h3>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#A8C5AC', flexShrink: 0 }}>75% today</span>
            </div>
          </div>
          {/* Meal rail — fixed height, scrolls internally */}
          <div style={{ position: 'relative', height: railH, flexShrink: 0 }}>
            <div className="ns-meal-rail">
              {NS_MEALS.map((meal, i) => (
                <motion.div
                  key={meal.name}
                  className="ns-meal-tile"
                  style={{
                    width: mealW,
                    height: '100%',
                    background: `linear-gradient(160deg, rgba(255,255,255,0.04) 0%, ${meal.colorDim} 100%)`,
                    border: `1px solid ${meal.color}24`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  }}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.20, ease: 'easeOut' }}
                  whileHover={{ y: -3, boxShadow: `0 6px 18px rgba(0,0,0,0.26), 0 0 0 1px ${meal.color}22 inset` }}
                >
                  <div style={{ height: imgH, flexShrink: 0, background: `linear-gradient(148deg, ${meal.color}1A 0%, ${meal.color}07 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${meal.color}14` }}>
                    <span style={{ fontSize: emojiSz, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.24))' }}>{meal.emoji}</span>
                  </div>
                  <div style={{ padding: compact ? '8px 9px 10px' : '9px 10px 11px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '7px', fontWeight: 700, color: meal.color, textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '3px' }}>{meal.category}</p>
                      <p style={{ fontSize: compact ? '10px' : '11px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.26, marginBottom: '6px' }}>{meal.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 5px', textAlign: 'center' as const }}>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: meal.color, lineHeight: 1 }}>{meal.kcal}</p>
                        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.32)', marginTop: '1px' }}>kcal</p>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 5px', textAlign: 'center' as const }}>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#A8C5AC', lineHeight: 1 }}>{meal.protein}g</p>
                        <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.32)', marginTop: '1px' }}>protein</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Right-edge fade — signals more content */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '28px', background: 'linear-gradient(to right, transparent, rgba(6,20,12,0.75))', pointerEvents: 'none' }} />
          </div>
          {/* Progress strip */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.70)' }}>3 of 4 meals followed today</p>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#A8C5AC' }}>75%</span>
            </div>
            <div className="ns-pbar-track">
              <motion.div className="ns-pbar-fill" initial={{ width: '0%' }} animate={{ width: mode === 'assigned' ? '75%' : '0%' }} transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }} />
            </div>
          </div>
          {/* CTAs */}
          <div className="ns-assigned-ctas" style={{ flexShrink: 0 }}>
            <button className="ns-cta-p" style={{ padding: ctapy, fontSize: ctasz, background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)', color: '#fff', boxShadow: '0 3px 10px rgba(107,143,113,0.22)' }}>
              <UtensilsCrossed size={12} strokeWidth={2.5} />
              View Full Meal Plan
            </button>
            <button className="ns-cta-g" style={{ padding: ctapy, fontSize: ctasz }}>
              Request Adjustments
            </button>
          </div>
        </div>

      </div>{/* end fixed-height content shell */}
    </div>
  );
}

function MonthTransformationStory({ monthNum, uploadedPhotos = [], onUpload, fileRef }: MonthTransformationStoryProps) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = fileRef ?? localRef;
  const d = CHAPTER_STORY_DATA[monthNum]!;
  const hd = STORY_HEADER_DESIGN[monthNum as keyof typeof STORY_HEADER_DESIGN]!;
  const milestones = STORY_MILESTONES[monthNum as keyof typeof STORY_MILESTONES]!;

  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const photos = onUpload ? uploadedPhotos : localPhotos;

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpload) { onUpload(e); return; }
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setLocalPhotos(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  // Reel labels keyed by month
  const reelLabels = [
    'Day 1',
    monthNum >= 2 ? 'Month 1' : 'Week 1',
    monthNum >= 3 ? 'Month 2' : 'Week 2',
    monthNum >= 4 ? `Month ${monthNum - 1}` : 'Week 3',
    'Today',
  ];

  const programmeDay = monthNum === 1 ? 12 : monthNum === 2 ? 14 : (monthNum - 1) * 30 + 14;
  const journeyPct = Math.round((programmeDay / 180) * 100);

  return (
    <>
    <style>{`
      .mts-mobile-only { display: flex; flex-direction: column; gap: 20px; padding: 0 24px; margin-top: 8px; }
      .mts-desktop-only { display: none; }
      @media (min-width: 1024px) {
        .mts-mobile-only { display: none !important; }
        .mts-desktop-only { display: block !important; }
        .mts-dt-section {
          background: #EEF3EF;
          padding: 72px 64px;
        }
        .mts-dt-section-inner { max-width: 1400px; margin: 0 auto; }
        .mts-dt-section-header { margin-bottom: 40px; }
        .mts-dt-workspace {
          display: grid;
          grid-template-columns: 70fr 30fr;
          gap: 40px;
          align-items: start;
        }
        .mts-dt-left { display: flex; flex-direction: column; gap: 24px; }
        .mts-dt-right {
          display: flex; flex-direction: column; gap: 20px;
          position: sticky; top: 88px;
        }
        .mts-dt-reel-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .mts-dt-highlights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      }
      @media (min-width: 1400px) {
        .mts-dt-section { padding: 88px 80px; }
        .mts-dt-workspace { gap: 56px; }
      }
    `}</style>

    {/* Hidden file input shared by both renders */}
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="file" accept="image/*" multiple
      style={{ display: 'none' }}
      onChange={handleLocalUpload}
    />

    {/* ═══════ MOBILE ═══════ */}
    <div className="mts-mobile-only">

      {/* ── PART 1: Premium Story Header ── */}
      <div style={{
        borderRadius: '22px', overflow: 'hidden',
        background: hd.gradient,
        padding: '24px 22px 22px',
        position: 'relative',
        boxShadow: '0 4px 28px rgba(0,0,0,0.18)',
      }}>
        {/* Floating glows */}
        <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '190px', height: '160px', background: hd.glow1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-12px', left: '8px', width: '140px', height: '100px', background: hd.glow2, pointerEvents: 'none' }} />

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', position: 'relative' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.11em',
            textTransform: 'uppercase' as const, color: hd.accent,
            background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px',
            padding: '4px 12px',
          }}>
            Your Transformation Story
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: hd.sub,
            background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px',
            padding: '4px 10px',
          }}>
            Chapter {monthNum} of 6
          </span>
        </div>

        {/* Headline */}
        <p style={{
          fontSize: '26px', fontWeight: 900, color: '#fff',
          letterSpacing: '-0.030em', lineHeight: 1.08,
          textShadow: '0 2px 16px rgba(0,0,0,0.22)',
          marginBottom: '10px', position: 'relative',
        }}>
          {d.headline}
        </p>

        {/* Copy */}
        <p style={{
          fontSize: '13px', color: hd.accent,
          lineHeight: 1.65, marginBottom: '20px',
          position: 'relative', maxWidth: '290px',
        }}>
          {d.copy}
        </p>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {[
            { label: 'Photos', value: `${photos.length + 1}` },
            { label: 'Day', value: `${programmeDay}` },
            { label: 'Journey', value: `${journeyPct}%` },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px', padding: '10px 12px', textAlign: 'center' as const,
            }}>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '10px', color: hd.sub, marginTop: '3px', fontWeight: 600, letterSpacing: '0.04em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PART 2: Transformation Story Reel ── */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-border)', padding: '20px 20px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>
          Story Reel
        </p>
        <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em', marginBottom: '16px' }}>
          Write your own inspirational success story.
        </p>

        {/* Scrollable reel */}
        <div style={{
          display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px',
          marginLeft: '-4px', marginRight: '-4px', paddingLeft: '4px', paddingRight: '4px',
          scrollbarWidth: 'none' as const,
        }}>
          {reelLabels.map((label, i) => {
            const isDay1 = i === 0;
            const photoUrl = isDay1 ? null : photos[i - 1] ?? null;
            const isFilled = isDay1 || !!photoUrl;
            const isActive = activeSlot === i;
            const isToday = i === 4;

            return (
              <div
                key={i}
                onClick={() => {
                  setActiveSlot(i);
                  if (!isFilled && !isDay1) ref.current?.click();
                }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', flexShrink: 0, cursor: 'pointer' }}
              >
                {/* Gradient ring wrapper when active */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: isActive ? `linear-gradient(135deg, ${hd.ringFrom} 0%, ${hd.ringTo} 100%)` : 'transparent',
                  padding: isActive ? '3px' : '0',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 4px 16px ${hd.ringFrom}55` : 'none',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    overflow: 'hidden',
                    border: isActive
                      ? '2px solid #fff'
                      : isFilled ? '2px solid rgba(107,143,113,0.28)' : '2px dashed rgba(107,143,113,0.32)',
                    background: isFilled ? 'transparent' : 'rgba(107,143,113,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative' as const,
                  }}>
                    {isDay1 ? (
                      <svg viewBox="0 0 80 80" fill="none" style={{ width: '100%', height: '100%' }}>
                        <rect width="80" height="80" fill="#E8EDE9" />
                        <circle cx="40" cy="30" r="13" fill="#C4C4BC" />
                        <ellipse cx="40" cy="62" rx="20" ry="14" fill="#C4C4BC" />
                      </svg>
                    ) : photoUrl ? (
                      <img src={photoUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : isToday ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Camera size={18} color="var(--color-sage)" strokeWidth={1.5} />
                        <span style={{ fontSize: '8px', color: 'var(--color-sage)', fontWeight: 700 }}>Add</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                        <Plus size={14} color="rgba(107,143,113,0.4)" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                  whiteSpace: 'nowrap' as const, letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
                {/* Future chapter label for empty non-today slots */}
                {!isFilled && !isToday && (
                  <span style={{ fontSize: '9px', color: 'rgba(107,143,113,0.45)', fontWeight: 500, marginTop: '-4px' }}>
                    Future
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PART 3: Add Today's Photo CTA ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <motion.button
          onClick={() => ref.current?.click()}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '18px 24px',
            background: `linear-gradient(135deg, ${hd.ringFrom} 0%, ${hd.ringTo} 100%)`,
            border: 'none', borderRadius: '18px 18px 10px 10px',
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${hd.ringFrom}45`,
          }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={18} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ textAlign: 'left' as const }}>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Add Today&apos;s Photo
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.72)', marginTop: '2px' }}>
              Tap to capture this moment
            </p>
          </div>
        </motion.button>
        <div style={{
          background: 'rgba(107,143,113,0.06)', border: '1px solid rgba(107,143,113,0.14)',
          borderTop: 'none', borderRadius: '0 0 18px 18px',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Sparkles size={12} color="var(--color-sage)" strokeWidth={1.8} />
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
            Future you will thank you for capturing today.
          </p>
        </div>
      </div>

      {/* ── PART 4: Journey Highlights ── */}
      <div>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>
          Journey Highlights
        </p>
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Your achievements so far.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {milestones.map((m, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '18px',
              border: '1px solid var(--color-border)',
              padding: '16px 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{m.icon}</span>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(107,143,113,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="var(--color-sage)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '3px' }}>
                  {m.value}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.35 }}>{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PART 5: View My Complete Journey ── */}
      <a
        href="/journey"
        style={{
          display: 'block', textDecoration: 'none',
          background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(28,43,30,0.20)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        }}
        onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 8px 32px rgba(28,43,30,0.28)'; }}
        onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 4px 24px rgba(28,43,30,0.20)'; }}
      >
        <div style={{ padding: '22px 22px 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(168,197,172,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px', position: 'relative' }}>
            My Transformation Story
          </p>
          <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '8px', position: 'relative' }}>
            View My Complete Journey →
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '16px', position: 'relative', maxWidth: '270px' }}>
            See your full transformation story, milestones, progress photos and achievements in one place.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', position: 'relative' }}>
            {['Photos', 'Milestones', 'Achievements', 'Coach Notes'].map(tag => (
              <span key={tag} style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', borderRadius: '20px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.12)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </a>

      {/* ── Nutrition Strategy Card ── */}
      <NutritionStrategyCard />

      {/* ── Reflection prompt — UNCHANGED ── */}
      <div style={{
        background: 'rgba(107,143,113,0.06)', borderRadius: '18px',
        border: '1px solid rgba(107,143,113,0.16)',
        padding: '18px 20px',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: '8px' }}>Reflection</p>
        <p style={{ fontSize: '14px', color: 'var(--color-ink)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' }}>
          &ldquo;{d.reflectionPrompt}&rdquo;
        </p>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px',
          background: '#fff', color: 'var(--color-ink)',
          border: '1px solid var(--color-border)', borderRadius: '20px',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <BookOpen size={12} strokeWidth={2.5} />
          Write My Reflection
        </button>
      </div>
    </div>{/* end mts-mobile-only */}

    {/* ═══════ DESKTOP ═══════ */}
    <div className="mts-desktop-only">
      <div className="mts-dt-section">
        <div className="mts-dt-section-inner">
          <div className="mts-dt-section-header">
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '4px' }}>Your Documentary</p>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em' }}>My Transformation Story</h2>
          </div>
      <div className="mts-dt-workspace">

        {/* ── LEFT 70%: Story Header + Photo Reel + CTAs ── */}
        <div className="mts-dt-left">

          {/* Story Header — enlarged, cinematic */}
          <div style={{
            borderRadius: '28px', overflow: 'hidden',
            background: hd.gradient,
            padding: '40px 40px 36px',
            position: 'relative',
            boxShadow: '0 12px 48px rgba(0,0,0,0.24)',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '340px', height: '280px', background: hd.glow1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '12px', width: '240px', height: '160px', background: hd.glow2, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: hd.accent, background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '5px 14px' }}>
                  Your Transformation Story
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: hd.sub, background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px', padding: '5px 12px' }}>
                  Chapter {monthNum} of 6
                </span>
              </div>
              <p style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-0.038em', lineHeight: 1.05, textShadow: '0 2px 24px rgba(0,0,0,0.28)', marginBottom: '14px' }}>
                {d.headline}
              </p>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, maxWidth: '560px', marginBottom: '28px' }}>
                {d.copy}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                {[
                  { label: `${photos.length + 1}`, sub: 'Photos captured' },
                  { label: `Day ${programmeDay}`, sub: 'of programme' },
                  { label: `${journeyPct}%`, sub: 'journey complete' },
                ].map((chip, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '14px 20px', backdropFilter: 'blur(8px)' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{chip.label}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{chip.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Reel — dominant, square, visual centrepiece */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '28px', padding: '32px', boxShadow: '0 6px 28px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '3px' }}>Story Reel</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Write your own inspirational success story.</p>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)', flexShrink: 0 }}>Tap any slot to upload</span>
            </div>
            <div className="mts-dt-reel-grid">
              {reelLabels.map((label, i) => {
                const isDay1 = i === 0;
                const photoUrl = isDay1 ? null : photos[i - 1] ?? null;
                const isFilled = isDay1 || !!photoUrl;
                const isActive = activeSlot === i;
                const isToday = i === 4;
                const isEmpty = !isFilled && !isToday && !isDay1;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveSlot(i);
                      if (!isFilled && !isDay1) ref.current?.click();
                    }}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: isActive
                        ? `3px solid ${hd.ringFrom}`
                        : isFilled ? '2px solid transparent' : '2px dashed rgba(107,143,113,0.30)',
                      background: isFilled ? 'transparent' : 'rgba(107,143,113,0.04)',
                      boxShadow: isActive
                        ? `0 0 0 5px ${hd.ringFrom}30, 0 8px 28px rgba(0,0,0,0.12)`
                        : isFilled ? '0 4px 16px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}>
                      {isDay1 ? (
                        <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                          <rect width="100" height="100" fill="#E8EDE9" />
                          <circle cx="50" cy="38" r="17" fill="#C4C4BC" />
                          <ellipse cx="50" cy="76" rx="26" ry="18" fill="#C4C4BC" />
                        </svg>
                      ) : photoUrl ? (
                        <img src={photoUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : isToday ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: `linear-gradient(145deg, ${hd.ringFrom}18 0%, ${hd.ringTo}18 100%)` }}>
                          <Camera size={28} color={hd.ringFrom} strokeWidth={1.5} />
                          <span style={{ fontSize: '11px', color: hd.ringFrom, fontWeight: 700, letterSpacing: '0.04em' }}>Add Today</span>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(107,143,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={16} color="rgba(107,143,113,0.45)" strokeWidth={1.8} />
                          </div>
                          <span style={{ fontSize: '10px', color: 'rgba(107,143,113,0.45)', fontWeight: 600 }}>Future</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <p style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-ink)' : 'var(--color-muted)', whiteSpace: 'nowrap' as const }}>
                        {label}
                      </p>
                      {isEmpty && (
                        <p style={{ fontSize: '10px', color: 'rgba(107,143,113,0.40)', marginTop: '2px', fontStyle: 'italic' }}>Aspiring</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload CTA — premium motivational */}
          <motion.button
            onClick={() => ref.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '22px 28px',
              background: `linear-gradient(135deg, ${hd.ringFrom} 0%, ${hd.ringTo} 100%)`,
              border: 'none', borderRadius: '20px',
              cursor: 'pointer',
              boxShadow: `0 8px 32px ${hd.ringFrom}45`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Camera size={22} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ textAlign: 'left' as const }}>
                <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Capture Today&apos;s Win
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)', marginTop: '3px' }}>
                  Future you will thank you for documenting this moment
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
              <Sparkles size={16} color="rgba(255,255,255,0.75)" strokeWidth={1.8} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Upload</span>
            </div>
          </motion.button>

          {/* Journey CTA */}
          <a
            href="/journey"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '26px 28px',
              background: 'linear-gradient(148deg, #1C2B1E 0%, #2D4A30 100%)',
              borderRadius: '20px', textDecoration: 'none',
              boxShadow: '0 6px 28px rgba(28,43,30,0.22)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 10px 36px rgba(28,43,30,0.32)'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 6px 28px rgba(28,43,30,0.22)'; }}
          >
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.60)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '4px' }}>My Transformation Story</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em' }}>Continue Watching Your Documentary</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                Photos · Milestones · Achievements · Coach Notes
              </p>
            </div>
            <ArrowRight size={22} color="#A8C5AC" />
          </a>
        </div>{/* end mts-dt-left */}

        {/* ── RIGHT 30%: Reflection + Highlights + Meal Plan ── */}
        <div className="mts-dt-right">

          {/* Reflection card */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ height: '4px', background: `linear-gradient(90deg, ${hd.ringFrom}, ${hd.ringTo})` }} />
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(107,143,113,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={17} color="var(--color-sage)" strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '1px' }}>Today&apos;s Reflection</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Journal Prompt</p>
                </div>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', fontStyle: 'italic', lineHeight: 1.55, letterSpacing: '-0.01em', marginBottom: '20px' }}>
                &ldquo;{d.reflectionPrompt}&rdquo;
              </p>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', padding: '13px 18px', background: 'var(--color-surface)', color: 'var(--color-ink)', border: '1.5px solid var(--color-border)', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', justifyContent: 'center', transition: 'border-color 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-sage)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
              >
                <BookOpen size={14} strokeWidth={2} /> Write My Reflection
              </button>
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(107,143,113,0.05)', borderRadius: '12px', border: '1px solid rgba(107,143,113,0.12)' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{d.futureCopy}&rdquo;</p>
              </div>
            </div>
          </div>

          {/* Journey Highlights */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '26px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '3px' }}>Your Progress</p>
            <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Journey Highlights</p>
            <div className="mts-dt-highlights-grid">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'box-shadow 0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(107,143,113,0.14)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>{m.icon}</span>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(107,143,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="var(--color-sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--color-muted)', lineHeight: 1.4 }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Strategy Card — compact on desktop month pages */}
          <NutritionStrategyCard variant="month" />

        </div>{/* end mts-dt-right */}
      </div>{/* end mts-dt-workspace */}
        </div>{/* end mts-dt-section-inner */}
      </div>{/* end mts-dt-section */}
    </div>{/* end mts-desktop-only */}
    </>
  );
}

// ---- Biomarker Progress Showcase ----
const BPS_METRIC_DATA = [
  {
    key: 'Weight',
    label: 'Weight',
    current: 79,
    unit: 'kg',
    change: '−3 kg',
    changeDirection: 'down' as const,
    insight: '3kg lost since starting the programme.',
    values: [82, 81.2, 80.8, 80.1, 79.5, 79],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #071710 0%, #163326 40%, #2A5C3C 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(78,138,94,0.35) 0%, transparent 70%)',
    accent: '#A8C5AC',
    accentDim: 'rgba(168,197,172,0.55)',
    lineColor: '#6DB88A',
    areaStop: 'rgba(109,184,138,0.22)',
  },
  {
    key: 'Blood Pressure',
    label: 'Blood Pressure',
    current: 130,
    unit: 'mmHg',
    change: '−8 mmHg',
    changeDirection: 'down' as const,
    insight: 'Blood pressure is trending toward a healthier range.',
    values: [138, 135, 132, 130, 128, 125],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #0B0E1F 0%, #1A2448 40%, #2C3D7A 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(70,100,200,0.35) 0%, transparent 70%)',
    accent: '#A0B8F0',
    accentDim: 'rgba(160,184,240,0.55)',
    lineColor: '#6A9CF0',
    areaStop: 'rgba(106,156,240,0.22)',
  },
  {
    key: 'Waist',
    label: 'Waist',
    current: 90,
    unit: 'cm',
    change: '−4 cm',
    changeDirection: 'down' as const,
    insight: 'Waist circumference has reduced steadily.',
    values: [94, 93, 92, 91.5, 90.5, 90],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #18090A 0%, #3D1E20 40%, #6B3436 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(180,80,80,0.32) 0%, transparent 70%)',
    accent: '#F0A8A8',
    accentDim: 'rgba(240,168,168,0.55)',
    lineColor: '#E87878',
    areaStop: 'rgba(232,120,120,0.20)',
  },
  {
    key: 'Glucose',
    label: 'Glucose',
    current: 100,
    unit: 'mg/dL',
    change: '−11 mg/dL',
    changeDirection: 'down' as const,
    insight: 'Fasting glucose is approaching the normal range.',
    values: [108, 104, 100, 97, 94, 91],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #100C02 0%, #2E2208 40%, #5C4510 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(212,168,67,0.35) 0%, transparent 70%)',
    accent: '#F0C96A',
    accentDim: 'rgba(240,201,106,0.55)',
    lineColor: '#D4A843',
    areaStop: 'rgba(212,168,67,0.20)',
  },
  {
    key: 'Activity',
    label: 'Activity',
    current: 6800,
    unit: 'steps/day',
    change: '+3,600',
    changeDirection: 'up' as const,
    insight: 'Daily movement has more than doubled since Month 1.',
    values: [3200, 5240, 6800, 7500, 8200, 9000],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #060E0A 0%, #122018 40%, #223A2C 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(90,160,110,0.32) 0%, transparent 70%)',
    accent: '#8FCFA8',
    accentDim: 'rgba(143,207,168,0.55)',
    lineColor: '#5DAE80',
    areaStop: 'rgba(93,174,128,0.20)',
  },
  {
    key: 'Sleep',
    label: 'Sleep',
    current: 7.1,
    unit: 'hrs/night',
    change: '+0.7 hrs',
    changeDirection: 'up' as const,
    insight: 'Sleep duration and quality have steadily improved.',
    values: [6.4, 6.6, 6.9, 7.1, 7.3, 7.6],
    loggedCount: 2,
    gradient: 'linear-gradient(148deg, #080A18 0%, #141C3E 40%, #2A3478 100%)',
    glow: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(100,110,210,0.35) 0%, transparent 70%)',
    accent: '#B8C0F0',
    accentDim: 'rgba(184,192,240,0.55)',
    lineColor: '#8892E8',
    areaStop: 'rgba(136,146,232,0.22)',
  },
] as const;

const BPS_KPI_CHIPS = [
  { label: 'Weight', value: '3 kg', icon: '↓', color: '#A8C5AC', bg: 'rgba(168,197,172,0.12)', border: 'rgba(168,197,172,0.25)' },
  { label: 'Blood Pressure', value: '8 mmHg', icon: '↓', color: '#A0B8F0', bg: 'rgba(160,184,240,0.12)', border: 'rgba(160,184,240,0.25)' },
  { label: 'Waist', value: '4 cm', icon: '↓', color: '#F0A8A8', bg: 'rgba(240,168,168,0.12)', border: 'rgba(240,168,168,0.25)' },
  { label: 'Glucose', value: '11 mg/dL', icon: '↓', color: '#F0C96A', bg: 'rgba(240,201,106,0.12)', border: 'rgba(240,201,106,0.25)' },
];

type BpsMetric = typeof BPS_METRIC_DATA[number];

function BpsChart({ metric, tall }: { metric: BpsMetric; tall?: boolean }) {
  const W = tall ? 320 : 240;
  const H = tall ? 160 : 88;
  const pX = tall ? 16 : 12;
  const pY = tall ? 14 : 10;
  const iW = W - pX * 2;
  const iH = H - pY * 2;
  const vals = [...metric.values] as number[];
  const minV = Math.min(...vals) * 0.985;
  const maxV = Math.max(...vals) * 1.015;
  const range = maxV - minV || 1;
  const pts = vals.map((v, i) => ({
    x: pX + (i / (vals.length - 1)) * iW,
    y: pY + (1 - (v - minV) / range) * iH,
  }));
  const solidPts = pts.slice(0, metric.loggedCount);
  const dashedPts = pts.slice(metric.loggedCount - 1);
  const toLine = (ps: { x: number; y: number }[]) =>
    ps.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = solidPts.length > 1
    ? `M${solidPts[0]!.x},${pY + iH} ` +
      solidPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${solidPts[solidPts.length - 1]!.x},${pY + iH} Z`
    : '';
  const lastSolid = solidPts[solidPts.length - 1];
  const sfx = tall ? 'lg-' : '';
  const gradId = `bps-area-${sfx}${metric.key.replace(/\s+/g, '-').toLowerCase()}`;
  const glowId = `bps-glow-${sfx}${metric.key.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={metric.lineColor} stopOpacity={tall ? 0.42 : 0.28} />
          <stop offset="100%" stopColor={metric.lineColor} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={tall ? 4.5 : 3} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {[0.38, 0.72].map((t, i) => (
        <line key={i} x1={pX} y1={pY + t * iH} x2={pX + iW} y2={pY + t * iH}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
      {dashedPts.length > 1 && (
        <polyline points={toLine(dashedPts)} fill="none" stroke={metric.lineColor}
          strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.26" />
      )}
      {solidPts.length > 1 && (
        <polyline points={toLine(solidPts)} fill="none" stroke={metric.lineColor}
          strokeWidth={tall ? 3 : 2.5} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {lastSolid && (
        <>
          <circle cx={lastSolid.x} cy={lastSolid.y} r={tall ? 16 : 9} fill={metric.lineColor} fillOpacity={tall ? 0.14 : 0.18} />
          <circle cx={lastSolid.x} cy={lastSolid.y} r={tall ? 8 : 5} fill={metric.lineColor} filter={`url(#${glowId})`} />
          <circle cx={lastSolid.x} cy={lastSolid.y} r={tall ? 4.5 : 3} fill="#fff" fillOpacity="0.92" />
        </>
      )}
      {solidPts.slice(0, -1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={tall ? 3.5 : 2.5} fill={metric.lineColor} fillOpacity="0.48" />
      ))}
    </svg>
  );
}

function BiomarkerProgressShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dtTrackRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const targets = [3, 8, 4, 11];
    if (!revealed) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    targets.forEach((target, idx) => {
      let current = 0;
      const step = Math.ceil(target / 18);
      const tick = () => {
        current = Math.min(current + step, target);
        setCounts(prev => { const next = [...prev]; next[idx] = current; return next; });
        if (current < target) timers.push(setTimeout(tick, 48));
      };
      timers.push(setTimeout(tick, idx * 80));
    });
    return () => timers.forEach(clearTimeout);
  }, [revealed]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry && entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Desktop wheel → horizontal scroll on the carousel track */
  useEffect(() => {
    const track = dtTrackRef.current;
    if (!track) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const atLeft = track.scrollLeft <= 0;
      const atRight = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      if ((e.deltaY < 0 && atLeft) || (e.deltaY > 0 && atRight)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY * 1.2;
    };
    track.addEventListener('wheel', onWheel, { passive: false });
    return () => track.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={sectionRef} style={{ background: '#08110A', position: 'relative' }}>
      <style>{`
        /* ── mobile ── */
        .bps-mobile-header { padding: 52px 24px 0; }
        .bps-mobile-chips  { padding: 0 24px; margin-top: 28px; display: flex; flex-wrap: wrap; gap: 10px; }
        .bps-mobile-track  { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
                              padding: 32px 24px 40px; scrollbar-width: none; -ms-overflow-style: none; }
        .bps-mobile-track::-webkit-scrollbar { display: none; }
        .bps-mobile-card   { scroll-snap-align: start; flex-shrink: 0; width: calc(85vw - 32px); max-width: 320px; }
        .bps-card-lift     { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .bps-card-lift:hover { transform: translateY(-4px); }

        /* ── desktop shell (hidden on mobile) ── */
        .bps-dt-shell { display: none; }

        @media (min-width: 1024px) {
          /* hide mobile layers */
          .bps-mobile-header, .bps-mobile-chips, .bps-mobile-track { display: none !important; }

          /* show desktop shell */
          .bps-dt-shell { display: block; padding: 80px 0 80px; }

          /* header + chips — padded inset */
          .bps-dt-header { padding: 0 64px; margin-bottom: 44px; display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
          .bps-dt-chips  { padding: 0 64px; margin-bottom: 40px; display: flex; flex-wrap: wrap; gap: 10px; }

          /* scrollable track — no outer padding so cards bleed toward edges */
          .bps-dt-track {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            padding: 0 64px 8px;
            scrollbar-width: none;
            -ms-overflow-style: none;
            cursor: grab;
          }
          .bps-dt-track:active { cursor: grabbing; }
          .bps-dt-track::-webkit-scrollbar { display: none; }

          /* each card snaps + fixed width giving ~3.2 visible */
          .bps-dt-card {
            scroll-snap-align: start;
            flex-shrink: 0;
            width: clamp(280px, 29vw, 360px);
          }
        }

        @media (min-width: 1400px) {
          .bps-dt-shell    { padding: 96px 0 96px; }
          .bps-dt-header   { padding: 0 96px; }
          .bps-dt-chips    { padding: 0 96px; }
          .bps-dt-track    { padding: 0 96px 8px; gap: 24px; }
          .bps-dt-card     { width: clamp(300px, 27vw, 380px); }
        }
      `}</style>

      {/* ══════════════ MOBILE (untouched) ══════════════ */}

      {/* Mobile header */}
      <div className="bps-mobile-header">
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
          Biomarker Intelligence
        </p>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '10px' }}>
          Proof Your Efforts Are Working
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, maxWidth: '480px' }}>
          Every healthy choice leaves a measurable impact. Here&apos;s how your health is changing.
        </p>
      </div>

      {/* Mobile KPI chips */}
      <div className="bps-mobile-chips">
        {BPS_KPI_CHIPS.map((chip, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: chip.bg, border: `1px solid ${chip.border}`,
            borderRadius: '100px', padding: '9px 18px', backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: chip.color, letterSpacing: '-0.01em' }}>
              {chip.icon} {counts[i] ?? 0}
              {i === 0 ? ' kg' : i === 1 ? ' mmHg' : i === 2 ? ' cm' : ' mg/dL'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="bps-mobile-track">
        {BPS_METRIC_DATA.map((metric) => (
          <div key={metric.key} className="bps-mobile-card">
            <div className="bps-card-lift" style={{
              background: metric.gradient, borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.38)', padding: '28px 24px 22px',
              position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: metric.glow, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: metric.accentDim, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{metric.label}</p>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {metric.current.toLocaleString()}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.40)', marginLeft: '5px' }}>{metric.unit}</span>
                    </p>
                  </div>
                  <div style={{
                    background: metric.changeDirection === 'down' ? 'rgba(100,220,130,0.14)' : 'rgba(100,180,255,0.14)',
                    border: `1px solid ${metric.changeDirection === 'down' ? 'rgba(100,220,130,0.28)' : 'rgba(100,180,255,0.28)'}`,
                    borderRadius: '20px', padding: '5px 12px',
                    fontSize: '12px', fontWeight: 700,
                    color: metric.changeDirection === 'down' ? '#7EEAA0' : '#90C8FF',
                  }}>{metric.change}</div>
                </div>
                <div style={{ marginBottom: '16px', flex: 1 }}><BpsChart metric={metric} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '0 12px' }}>
                  {['M1','M2','M3','M4','M5','M6'].map((m, i) => (
                    <span key={i} style={{ fontSize: '9px', fontWeight: i < metric.loggedCount ? 700 : 400, color: i < metric.loggedCount ? metric.accent : 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>{m}</span>
                  ))}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{metric.insight}&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile final nav card */}
        <div className="bps-mobile-card">
          <a href="/progress" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            height: '100%', minHeight: '300px',
            background: 'linear-gradient(148deg, #071710 0%, #122A18 40%, #1E4028 100%)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.38)',
            padding: '28px 24px 28px', position: 'relative', textDecoration: 'none',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          }}
          onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-4px)'; a.style.boxShadow = '0 16px 56px rgba(0,0,0,0.50)'; }}
          onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 8px 40px rgba(0,0,0,0.38)'; }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 80% 20%, rgba(107,143,113,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '16px' }}>Your Complete Record</p>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '14px' }}>Explore Every Health Trend</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 }}>Dive deeper into your biomarkers, milestones and six-month journey.</p>
              </div>
              <div style={{ marginTop: '32px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, rgba(107,143,113,0.28) 0%, rgba(74,110,80,0.28) 100%)',
                  border: '1px solid rgba(107,143,113,0.38)', borderRadius: '14px', padding: '12px 18px',
                  fontSize: '13px', fontWeight: 700, color: '#A8C5AC', backdropFilter: 'blur(10px)',
                }}>
                  View Progress <ArrowRight size={15} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="bps-dt-shell">

        {/* Header row: headline left, scroll hint right */}
        <div className="bps-dt-header">
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.60)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '14px' }}>
              Biomarker Intelligence
            </p>
            <h2 style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.0, marginBottom: '14px' }}>
              Proof Your Efforts<br />Are Working
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.46)', lineHeight: 1.7, maxWidth: '440px' }}>
              Every healthy choice leaves a measurable impact. See the evidence below.
            </p>
          </div>
          {/* Scroll hint */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.45 }}>
            <div style={{ width: '48px', height: '2px', background: 'rgba(168,197,172,0.5)', borderRadius: '1px' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(168,197,172,0.8)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>SCROLL TO EXPLORE</span>
            <ArrowRight size={14} color="rgba(168,197,172,0.8)" />
          </div>
        </div>

        {/* KPI chips */}
        <div className="bps-dt-chips">
          {BPS_KPI_CHIPS.map((chip, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: chip.bg, border: `1px solid ${chip.border}`,
              borderRadius: '100px', padding: '10px 20px', backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: chip.color, letterSpacing: '-0.01em' }}>
                {chip.icon} {counts[i] ?? 0}
                {i === 0 ? ' kg' : i === 1 ? ' mmHg' : i === 2 ? ' cm' : ' mg/dL'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                {chip.label}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop scrollable carousel */}
        <div className="bps-dt-track" ref={dtTrackRef}>
          {BPS_METRIC_DATA.map((metric) => (
            <div key={metric.key} className="bps-dt-card">
              <div className="bps-card-lift" style={{
                background: metric.gradient,
                borderRadius: '28px', overflow: 'hidden',
                boxShadow: '0 12px 56px rgba(0,0,0,0.48)',
                padding: '32px 28px 28px',
                position: 'relative',
                height: '440px',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Ambient glow */}
                <div style={{ position: 'absolute', inset: 0, background: metric.glow, pointerEvents: 'none' }} />
                {/* Bottom edge fade for depth */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top: label + change badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: metric.accentDim, textTransform: 'uppercase', letterSpacing: '0.13em' }}>
                      {metric.label}
                    </p>
                    <div style={{
                      background: metric.changeDirection === 'down' ? 'rgba(100,220,130,0.13)' : 'rgba(100,180,255,0.13)',
                      border: `1px solid ${metric.changeDirection === 'down' ? 'rgba(100,220,130,0.26)' : 'rgba(100,180,255,0.26)'}`,
                      borderRadius: '20px', padding: '4px 11px',
                      fontSize: '12px', fontWeight: 700,
                      color: metric.changeDirection === 'down' ? '#7EEAA0' : '#90C8FF',
                      whiteSpace: 'nowrap',
                    }}>{metric.change}</div>
                  </div>

                  {/* Value */}
                  <p style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '24px' }}>
                    {metric.current.toLocaleString()}
                    <span style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginLeft: '6px' }}>{metric.unit}</span>
                  </p>

                  {/* Chart — hero element, fills remaining space */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <BpsChart metric={metric} tall />
                  </div>

                  {/* Month axis */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px 16px', marginTop: '4px' }}>
                    {['M1','M2','M3','M4','M5','M6'].map((m, i) => (
                      <span key={i} style={{ fontSize: '10px', fontWeight: i < metric.loggedCount ? 700 : 400, color: i < metric.loggedCount ? metric.accent : 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>{m}</span>
                    ))}
                  </div>

                  {/* Insight */}
                  <div style={{ background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      &ldquo;{metric.insight}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Desktop final card — "Explore Full Progress" */}
          <div className="bps-dt-card">
            <a href="/progress" style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              height: '440px',
              background: 'linear-gradient(160deg, #071710 0%, #0F2318 35%, #183A24 70%, #2A5C3C 100%)',
              borderRadius: '28px', overflow: 'hidden',
              boxShadow: '0 12px 56px rgba(0,0,0,0.48)',
              padding: '36px 32px',
              position: 'relative',
              textDecoration: 'none',
              transition: 'transform 0.24s ease, box-shadow 0.24s ease',
            }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-6px)'; a.style.boxShadow = '0 20px 72px rgba(0,0,0,0.60)'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 12px 56px rgba(0,0,0,0.48)'; }}
            >
              {/* Sage ambient glows */}
              <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '320px', height: '320px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.26) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '240px', height: '240px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

              {/* Large ArrowRight treatment top-right */}
              <div style={{ position: 'absolute', top: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={22} color="#A8C5AC" />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '20px' }}>
                  Your Health Record
                </p>
                <p style={{ fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '20px' }}>
                  Explore Your<br />Complete Progress
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.46)', lineHeight: 1.75, marginBottom: '32px' }}>
                  Every biomarker.<br />Every milestone.<br />Every trend.
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: 'linear-gradient(135deg, rgba(107,143,113,0.32) 0%, rgba(74,110,80,0.24) 100%)',
                  border: '1px solid rgba(168,197,172,0.28)',
                  borderRadius: '16px', padding: '14px 22px',
                  fontSize: '14px', fontWeight: 700, color: '#A8C5AC',
                  backdropFilter: 'blur(12px)',
                }}>
                  View Progress
                  <ArrowRight size={16} />
                </div>
              </div>
            </a>
          </div>
        </div>

      </div>{/* end bps-dt-shell */}
    </div>
  );
}

// ---- Month 1 Active Content (in-progress experience) ----
function Month1ActiveContent() {
  const [missionDone, setMissionDone] = useState([false, false, false, false, false]);

  const JOURNEY = [
    { icon: '🔬', label: 'Health Assessment', sub: 'Risk profile completed',        status: 'done' as const },
    { icon: '🩸', label: 'Baseline Labs',      sub: 'Blood tests received',          status: 'done' as const },
    { icon: '🥗', label: 'Nutrition Discovery', sub: '3 more days of logging',       status: 'active' as const },
    { icon: '😴', label: 'Sleep Assessment',   sub: 'Starts after nutrition',        status: 'upcoming' as const },
    { icon: '🎯', label: 'Goal Setting',       sub: 'With Dr. Ananya · Week 4',      status: 'upcoming' as const },
  ];

  const INSIGHTS = [
    { icon: '🥗', area: 'Nutrition',  text: 'You often skip protein at breakfast.',    tint: 'rgba(107,143,113,0.08)',  border: 'rgba(107,143,113,0.18)', color: 'var(--color-sage)' },
    { icon: '😴', area: 'Sleep',      text: 'Average sleep is 6.4 hours per night.',   tint: 'rgba(123,104,238,0.07)',  border: 'rgba(123,104,238,0.15)', color: '#7B68EE' },
    { icon: '🚶', area: 'Activity',   text: 'You\'re most active on weekends.',         tint: 'rgba(212,168,67,0.07)',   border: 'rgba(212,168,67,0.18)',  color: '#C49A26' },
    { icon: '🧠', area: 'Stress',     text: 'Stress tends to peak in the evenings.',   tint: 'rgba(200,96,74,0.06)',    border: 'rgba(200,96,74,0.15)',   color: 'var(--color-terracotta)' },
  ];

  const MISSION = [
    { icon: '🥗', label: 'Track meals' },
    { icon: '😴', label: 'Track sleep' },
    { icon: '🚶', label: '5,000 steps daily' },
    { icon: '💧', label: 'Stay hydrated' },
    { icon: '🎯', label: 'Define your health goal' },
  ];

  return (
    <>

    {/* ═══════ MOBILE ═══════ */}
    <div className="m1-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--color-surface)' }}>

      {/* ── 1. HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '300px' }}>
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80"
          alt="Month 1 — Awareness & Baseline Correction"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,43,30,0.5) 0%, rgba(74,110,80,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Month 1 · In Progress</span>
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '4px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              Know Your Health
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, marginBottom: '4px' }}>
              Let&apos;s understand your health before we start improving it.
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>Awareness &amp; Baseline Correction</p>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.04em' }}>DAY 12 OF 30</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>40%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.18)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, #A8C5AC, #F0C96A)', borderRadius: '2px' }} />
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 20px', background: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              Continue Journey <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── 2. YOUR HEALTH JOURNEY ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Health Journey</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Building your health picture</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '24px' }}>Five assessments. Each one reveals something new.</p>

          <div style={{ position: 'relative' }}>
            {/* Vertical spine */}
            <div style={{ position: 'absolute', left: '27px', top: '28px', bottom: '28px', width: '2px', background: 'linear-gradient(to bottom, var(--color-sage) 40%, rgba(107,143,113,0.15) 40%)', zIndex: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {JOURNEY.map((step, i) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';
                return (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: i < JOURNEY.length - 1 ? '20px' : '0', position: 'relative', zIndex: 1 }}>
                    {/* Node */}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '18px', flexShrink: 0,
                      background: isDone ? 'var(--color-sage)' : isActive ? '#fff' : '#F5F5F2',
                      border: isDone ? 'none' : isActive ? '2px solid var(--color-sage)' : '1.5px solid var(--color-border)',
                      boxShadow: isActive ? '0 0 0 4px rgba(107,143,113,0.12), 0 4px 16px rgba(107,143,113,0.18)' : isDone ? '0 2px 8px rgba(107,143,113,0.2)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isDone ? '0' : '24px',
                      transition: 'all 0.2s ease',
                    }}>
                      {isDone
                        ? <svg width="22" height="18" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : step.icon}
                    </div>
                    {/* Content */}
                    <div style={{ paddingTop: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: isActive ? 'var(--color-ink)' : isDone ? 'var(--color-ink)' : 'var(--color-muted)', lineHeight: 1.2 }}>
                          {step.label}
                        </p>
                        {isActive && (
                          <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(107,143,113,0.12)', color: 'var(--color-sage)', borderRadius: '20px', padding: '2px 8px', flexShrink: 0 }}>NOW</span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: isActive ? 'var(--color-sage)' : 'var(--color-muted)', fontWeight: isActive ? 600 : 400 }}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>{/* end padded body up to here */}

      {/* ── 3. MY TRANSFORMATION STORY ── */}
      <MonthTransformationStory monthNum={1} />

      {/* ── BIOMARKER PROGRESS SHOWCASE ── */}
      <BiomarkerProgressShowcase />

      <div style={{ padding: '0 24px 0', display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '28px' }}>

        {/* ── 4. WHAT WE'VE LEARNED ABOUT YOU ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Personal Health Story</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>What we&apos;ve learned about you</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '18px' }}>Early patterns from your first 12 days.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {INSIGHTS.map((item, i) => (
              <div key={i} style={{ background: item.tint, border: `1px solid ${item.border}`, borderRadius: '20px', padding: '18px 16px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>{item.area}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.55, fontWeight: 500 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. YOUR STARTING POINT ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Starting Point</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Your baseline numbers</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '18px' }}>We&apos;ll measure all future progress against these.</p>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              {[
                { label: 'Weight',        value: '82',    unit: 'kg',     border: true,  borderRight: true },
                { label: 'Waist',         value: '94',    unit: 'cm',     border: true,  borderRight: false },
                { label: 'Blood Sugar',   value: '108',   unit: 'mg/dL',  border: false, borderRight: true },
                { label: 'Blood Pressure',value: '138/88',unit: 'mmHg',   border: false, borderRight: false },
              ].map((m, i) => (
                <div key={i} style={{
                  padding: '20px 16px',
                  borderBottom: m.border ? '1px solid var(--color-border)' : 'none',
                  borderRight: m.borderRight ? '1px solid var(--color-border)' : 'none',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px' }}>{m.label}</p>
                  <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '3px' }}>{m.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 500 }}>{m.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. YOUR MISSION THIS MONTH ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Month 1 Mission</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Focus on awareness, not perfection.</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '18px' }}>Five simple activities. Each one builds your health picture.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MISSION.map((item, i) => (
              <button
                key={i}
                onClick={() => setMissionDone(prev => prev.map((v, idx) => idx === i ? !v : v))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: missionDone[i] ? 'rgba(107,143,113,0.07)' : '#fff',
                  border: `1px solid ${missionDone[i] ? 'rgba(107,143,113,0.22)' : 'var(--color-border)'}`,
                  borderRadius: '18px', padding: '16px 18px',
                  cursor: 'pointer', textAlign: 'left' as const, width: '100%',
                  transition: 'all 0.15s ease',
                  boxShadow: missionDone[i] ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                  background: missionDone[i] ? 'var(--color-sage)' : 'var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                  transition: 'all 0.15s ease',
                }}>
                  {missionDone[i]
                    ? <svg width="18" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : item.icon}
                </div>
                <p style={{ fontSize: '14px', fontWeight: missionDone[i] ? 400 : 600, color: missionDone[i] ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: missionDone[i] ? 'line-through' : 'none', flex: 1, lineHeight: 1.3 }}>
                  {item.label}
                </p>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', flexShrink: 0 }}>{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. MONTH 2 PREVIEW ── */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <img
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80"
            alt="Month 2 — Foundation Building"
            style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.78) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Coming Next</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '4px' }}>Month 2 · Build Healthy Habits</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '0.01em' }}>Foundation Building</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, marginBottom: '12px' }}>Once we understand your patterns, we begin building sustainable habits.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {['🥗 Nutrition', '🚶 Movement', '💪 Strength', '💧 Hydration'].map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

      </div>{/* end remaining sections */}
    </div>{/* end m1-mobile-only */}

    {/* ═══════ DESKTOP ═══════ */}
    <div className="m1-desktop-only">
      <div className="m1-dt-page">

        {/* ── S1: DISCOVERY HERO WORKSPACE (65/35) ── */}
        <div className="m1-dt-hero-workspace">

          {/* LEFT 65%: Cinematic hero */}
          <div className="m1-dt-hero-left">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1800&q=90"
              alt="Month 1 — Know Your Health"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(7,18,9,0.88) 0%, rgba(15,32,18,0.70) 45%, rgba(0,0,0,0.18) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 10% 72%, rgba(107,143,113,0.20) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px', background: 'linear-gradient(to bottom, transparent, rgba(7,18,9,0.55))' }} />

            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '56px 64px', gap: '20px' }}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '6px 16px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.15)' }}>
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F0C96A' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Month 1 · In Progress</span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                <h2 style={{ fontSize: '60px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 0.97, marginBottom: '14px', textShadow: '0 4px 36px rgba(0,0,0,0.35)' }}>
                  Know Your<br />Health
                </h2>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '460px', marginBottom: '4px' }}>
                  Let&apos;s understand your health before we start improving it.
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.36)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Awareness &amp; Baseline Correction</p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }} style={{ maxWidth: '460px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Day 12 of 30</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#A8C5AC' }}>40%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #6B8F71, #F0C96A)', borderRadius: '3px' }} />
                </div>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#fff', border: 'none', borderRadius: '24px', fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.22)' }}>
                  Continue Journey <ChevronRight size={16} />
                </button>
              </motion.div>
            </div>
          </div>

          {/* RIGHT 35%: Health Journey panel */}
          <div className="m1-dt-hero-right">
            <motion.div animate={{ opacity: [0.15, 0.30, 0.15] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,197,172,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '6px' }}>Your Health Journey</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '32px' }}>Building your<br />health picture.</p>

              {/* Journey steps */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '28px', bottom: '28px', width: '2px', background: 'linear-gradient(to bottom, rgba(168,197,172,0.6) 40%, rgba(168,197,172,0.12) 40%)', zIndex: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {JOURNEY.map((step, i) => {
                    const isDone = step.status === 'done';
                    const isActive = step.status === 'active';
                    return (
                      <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: i < JOURNEY.length - 1 ? '22px' : '0', position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                          background: isDone ? 'rgba(168,197,172,0.25)' : isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                          border: isDone ? '1px solid rgba(168,197,172,0.40)' : isActive ? '1.5px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.10)',
                          boxShadow: isActive ? '0 0 0 4px rgba(255,255,255,0.06)' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: isDone ? '0' : '18px',
                        }}>
                          {isDone
                            ? <svg width="16" height="13" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#A8C5AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : step.icon}
                        </div>
                        <div style={{ paddingTop: '8px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: isDone ? 'rgba(255,255,255,0.70)' : isActive ? '#fff' : 'rgba(255,255,255,0.38)', lineHeight: 1.2 }}>
                              {step.label}
                            </p>
                            {isActive && (
                              <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(168,197,172,0.18)', color: '#A8C5AC', borderRadius: '20px', padding: '2px 8px', flexShrink: 0, border: '1px solid rgba(168,197,172,0.25)' }}>NOW</span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: isActive ? '#A8C5AC' : 'rgba(255,255,255,0.38)', fontWeight: isActive ? 600 : 400 }}>
                            {step.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S1b: MY TRANSFORMATION STORY ── */}
        <MonthTransformationStory monthNum={1} />

        {/* ── S1c: BIOMARKER PROGRESS SHOWCASE ── */}
        <BiomarkerProgressShowcase />

        {/* ── S2: UNDERSTANDING YOU WORKSPACE (50/50) ── */}
        <div className="m1-dt-section m1-dt-section-sage">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Understanding You</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>We are learning about you.</h3>
            </div>
            <div className="m1-dt-discovery-workspace">
              {/* LEFT 50%: What We've Learned */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px' }}>Your Personal Health Story</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>What we&apos;ve learned about you</p>
                <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: '28px' }}>Early patterns from your first 12 days.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {INSIGHTS.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                      style={{ background: item.tint, border: `1px solid ${item.border}`, borderRadius: '24px', padding: '24px 20px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '14px' }}>{item.icon}</div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>{item.area}</p>
                      <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.60, fontWeight: 500 }}>{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* RIGHT 50%: Starting Point */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px' }}>Your Starting Point</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Your baseline numbers</p>
                <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: '28px' }}>We&apos;ll measure all future progress against these.</p>
                <div style={{ background: '#fff', borderRadius: '28px', padding: '0', border: '1px solid var(--color-border)', boxShadow: '0 6px 32px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                    {[
                      { label: 'Weight',         value: '82',     unit: 'kg',    border: true,  borderRight: true },
                      { label: 'Waist',           value: '94',     unit: 'cm',    border: true,  borderRight: false },
                      { label: 'Blood Sugar',     value: '108',    unit: 'mg/dL', border: false, borderRight: true },
                      { label: 'Blood Pressure',  value: '138/88', unit: 'mmHg',  border: false, borderRight: false },
                    ].map((m, i) => (
                      <div key={i} style={{
                        padding: '32px 28px',
                        borderBottom: m.border ? '1px solid var(--color-border)' : 'none',
                        borderRight: m.borderRight ? '1px solid var(--color-border)' : 'none',
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '10px' }}>{m.label}</p>
                        <p style={{ fontSize: '36px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px' }}>{m.value}</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-muted)', fontWeight: 500 }}>{m.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S3: YOUR MONTH 1 MISSION ── */}
        <div className="m1-dt-section m1-dt-section-white">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Your Month 1 Mission</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>Focus on awareness,<br />not perfection.</h3>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginTop: '14px', maxWidth: '560px', lineHeight: 1.6 }}>Five simple activities. Each one builds your health picture and moves you closer to Month 2.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
              {MISSION.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setMissionDone(prev => prev.map((v, idx) => idx === i ? !v : v))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                    background: missionDone[i] ? 'rgba(107,143,113,0.07)' : '#fff',
                    border: `1.5px solid ${missionDone[i] ? 'rgba(107,143,113,0.28)' : 'var(--color-border)'}`,
                    borderRadius: '28px', padding: '32px 24px 28px',
                    cursor: 'pointer', textAlign: 'center' as const, width: '100%',
                    transition: 'all 0.18s ease',
                    boxShadow: missionDone[i] ? '0 2px 16px rgba(107,143,113,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '20px', flexShrink: 0,
                    background: missionDone[i] ? 'var(--color-sage)' : 'var(--color-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', boxShadow: missionDone[i] ? '0 4px 16px rgba(107,143,113,0.28)' : 'none',
                    transition: 'all 0.18s ease',
                  }}>
                    {missionDone[i]
                      ? <svg width="24" height="19" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: missionDone[i] ? 400 : 700, color: missionDone[i] ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: missionDone[i] ? 'line-through' : 'none', lineHeight: 1.3 }}>
                      {item.label}
                    </p>
                    {!missionDone[i] && (
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>Task {i + 1} of {MISSION.length}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── S4: MONTH 2 PREVIEW — Cinematic Transition Banner ── */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '480px' }}>
          <img
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1800&q=90"
            alt="Month 2 — Build Healthy Habits"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(7,18,9,0.92) 0%, rgba(15,32,18,0.78) 40%, rgba(0,0,0,0.30) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 5% 50%, rgba(107,143,113,0.22) 0%, transparent 60%)' }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', minHeight: '480px', display: 'flex', alignItems: 'center', padding: '80px', gap: '80px' }}>
            <div style={{ maxWidth: '560px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.60)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '14px' }}>Coming Next</p>
              <h3 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '18px' }}>
                Month 2<br /><span style={{ color: '#A8C5AC' }}>Build Healthy<br />Habits</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.36)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Foundation Building</p>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, marginBottom: '32px' }}>
                Once we understand your patterns, we begin building the sustainable daily habits that become your new normal.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {['🥗 Nutrition', '🚶 Movement', '💪 Strength', '💧 Hydration'].map((tag, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '24px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.16)' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', borderRadius: '28px', padding: '40px', border: '1px solid rgba(255,255,255,0.14)', maxWidth: '380px', width: '100%' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '10px' }}>Complete Month 1 first</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '16px' }}>Day 12 of 30</p>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, #6B8F71, #F0C96A)', borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>18 days remaining · 60% to unlock</p>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end m1-dt-page */}
    </div>{/* end m1-desktop-only */}

    </> /* end Month1ActiveContent fragment */
  );
}

// ---- Month 1 Content (demo toggle wrapper) ----
function Month1Content() {
  const [demoState, setDemoState] = useState<'active' | 'completed'>('active');

  return (
    <>
    <style>{`
      /* ── Month 1 Dual render ── */
      .m1-mobile-only { display: block; }
      .m1-desktop-only { display: none; }

      @media (min-width: 1024px) {
        .m1-mobile-only { display: none !important; }
        .m1-desktop-only { display: block !important; }

        /* Page container */
        .m1-dt-page { max-width: 1600px; margin: 0 auto; background: var(--color-surface); overflow: hidden; }

        /* Section bands */
        .m1-dt-section { padding: 72px 80px; }
        .m1-dt-section-sage  { background: #EEF3EF; }
        .m1-dt-section-white { background: #ffffff; }
        .m1-dt-section-stone { background: #F0EDE6; }
        .m1-dt-section-dark  { background: #071209; }

        /* Active: Hero workspace (65/35) */
        .m1-dt-hero-workspace { display: grid; grid-template-columns: 65fr 35fr; min-height: 600px; }
        .m1-dt-hero-left  { position: relative; overflow: hidden; }
        .m1-dt-hero-right {
          background: linear-gradient(160deg, #071209 0%, #0f2014 60%, #0a1a0e 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 56px 48px; gap: 0; position: relative; overflow: hidden;
        }

        /* Active: Discovery workspace (50/50) */
        .m1-dt-discovery-workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }

        /* Completed: Achievement workspace (70/30) */
        .m1-dt-achievement-workspace { display: grid; grid-template-columns: 70fr 30fr; gap: 40px; align-items: stretch; }

        /* Completed: Reflection workspace (60/40) */
        .m1-dt-reflection-workspace { display: grid; grid-template-columns: 60fr 40fr; gap: 40px; align-items: start; }

        /* Completed: Share layout (60/40) */
        .m1-dt-share-layout { display: grid; grid-template-columns: 60fr 40fr; gap: 56px; align-items: center; }
      }

      @media (min-width: 1400px) {
        .m1-dt-hero-workspace { min-height: 680px; }
        .m1-dt-section { padding: 88px 96px; }
      }
    `}</style>

    <div>
      {/* Demo toggle */}
      <div style={{ padding: '12px 24px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', flexShrink: 0 }}>Demo View</span>
        <div style={{ display: 'flex', background: 'var(--color-border)', borderRadius: '10px', padding: '2px', gap: '2px' }}>
          {(['active', 'completed'] as const).map(state => (
            <button
              key={state}
              onClick={() => setDemoState(state)}
              style={{
                padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, transition: 'all 0.15s ease',
                background: demoState === state ? '#fff' : 'transparent',
                color: demoState === state ? 'var(--color-ink)' : 'var(--color-muted)',
                boxShadow: demoState === state ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              }}
            >
              {state === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {demoState === 'active' ? <Month1ActiveContent /> : <Month1CompletedContent />}
    </div>
    </>
  );
}

// ---- Month 2 Content ----
function Month2Content() {
  const [goalChecked, setGoalChecked] = useState([true, true, false, false]);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goals = [
    'Build structured eating habits using the Indian Plate Model',
    'Improve movement consistency — walk 6,000–8,000 steps daily',
    'Reduce processed food & eliminate sugary drinks',
    'Improve daily routine adherence',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) urls.push(URL.createObjectURL(file));
    }
    setPhotos(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  // Habit pillars for the habit-building section
  const HABIT_PILLARS = [
    { icon: '🥗', label: 'Nutrition',  micro: 'Building consistency', days: 7,  total: 10 },
    { icon: '🚶', label: 'Movement',   micro: 'Steps increasing',     days: 9,  total: 14 },
    { icon: '💧', label: 'Hydration',  micro: 'On track',             days: 8,  total: 14 },
    { icon: '😴', label: 'Sleep',      micro: 'Improving',            days: 6,  total: 14 },
    { icon: '🔄', label: 'Routine',    micro: 'Becoming automatic',   days: 10, total: 14 },
  ];

  return (
    <>
    <style>{`
      /* ── Dual render ── */
      .m2-mobile-only { display: block; }
      .m2-desktop-only { display: none; }

      @media (min-width: 1024px) {
        .m2-mobile-only { display: none !important; }
        .m2-desktop-only { display: block !important; }

        /* Page container */
        .m2-dt-page { max-width: 1600px; margin: 0 auto; background: var(--color-surface); overflow: hidden; }

        /* Section bands */
        .m2-dt-section { padding: 72px 64px; }
        .m2-dt-section-sage { background: #EEF3EF; }
        .m2-dt-section-white { background: #ffffff; }
        .m2-dt-section-stone { background: #F0EDE6; }
        .m2-dt-section-dark { background: #0d1a0f; }

        /* Hero workspace */
        .m2-dt-hero-workspace { display: grid; grid-template-columns: 70fr 30fr; min-height: 580px; }
        .m2-dt-hero-left { position: relative; overflow: hidden; }
        .m2-dt-hero-right {
          background: linear-gradient(160deg, #071710 0%, #112a18 60%, #0d1f14 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 52px 44px; gap: 28px; position: relative; overflow: hidden;
        }

        /* Story workspace */
        .m2-dt-story-workspace { display: grid; grid-template-columns: 70fr 30fr; gap: 40px; align-items: start; }
        .m2-dt-story-right { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 20px; }

        /* Execution center */
        .m2-dt-exec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }

        /* Results */
        .m2-dt-results-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .m2-dt-wins-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        /* Focus gallery */
        .m2-dt-focus-gallery { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
        .m2-dt-focus-gallery > div { width: unset !important; flex-shrink: unset !important; }
      }

      @media (min-width: 1400px) {
        .m2-dt-hero-workspace { min-height: 660px; }
        .m2-dt-section { padding: 88px 80px; }
      }
    `}</style>

    {/* ═══════ MOBILE ═══════ */}
    <div className="m2-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--color-surface)' }}>

      {/* ── 1. HERO ── */}
      <div className="m2-hero" style={{ position: 'relative', overflow: 'hidden', height: '300px' }}>
        <img
          src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&q=80"
          alt="Foundation Building — daily movement"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.82) 100%)' }} />

        <div className="m2-hero-content" style={{ position: 'relative', zIndex: 1, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Month 2 · In Progress</span>
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '4px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Build Healthy Habits</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: '4px' }}>Create routines that fit naturally into your life.</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>Foundation Building</p>
          </div>
          {/* Progress + consistency score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.04em' }}>DAY 14 OF 30</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(168,197,172,0.2)', borderRadius: '20px', padding: '3px 10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A8C5AC' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8C5AC' }}>83% Consistent</span>
              </div>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.18)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '47%', background: 'linear-gradient(90deg, #A8C5AC, #F0C96A)', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="m2-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── 2. YOUR MOMENTUM ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Momentum</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>You&apos;re moving forward.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { icon: '🚶', value: '+900',  unit: 'daily steps',    bg: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)', val: '#F0C96A', sub: 'rgba(255,255,255,0.65)' },
              { icon: '🥗', value: '82%',   unit: 'meal adherence', bg: 'linear-gradient(135deg, #2D1F1A 0%, #5C3A2D 100%)', val: '#F0A87A', sub: 'rgba(255,255,255,0.65)' },
              { icon: '🔥', value: '14',    unit: 'day streak',     bg: 'linear-gradient(135deg, #1A1F2D 0%, #2D3A5C 100%)', val: '#A8C5F0', sub: 'rgba(255,255,255,0.65)' },
            ].map((card, i) => (
              <div key={i} style={{ flex: 1, background: card.bg, borderRadius: '20px', padding: '18px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{card.icon}</div>
                <p style={{ fontSize: '26px', fontWeight: 800, color: card.val, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{card.value}</p>
                <p style={{ fontSize: '11px', color: card.sub, lineHeight: 1.35 }}>{card.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. MY TRANSFORMATION STORY ── */}
        </div>
      </div>
      <div className="m2-mobile-only">
      <MonthTransformationStory monthNum={2} uploadedPhotos={photos} onUpload={handleFileChange} fileRef={fileInputRef} />
      </div>
      {/* ── BIOMARKER PROGRESS SHOWCASE (mobile Month 2) ── */}
      <div className="m2-mobile-only">
        <BiomarkerProgressShowcase />
      </div>
      <div className="m2-mobile-only" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>

        {/* Desktop: Mission + Habits 2-col */}
        <div className="m2-mission-habits-grid">
        <div>
        {/* ── 4. TODAY'S MISSION ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Today&apos;s Mission</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Three things. That&apos;s it.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '🥗', label: 'Log all meals',      done: true },
              { icon: '🚶', label: 'Reach 7,000 steps',  done: false },
              { icon: '💧', label: 'Drink 2L water',      done: false },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: item.done ? 'rgba(107,143,113,0.07)' : '#fff',
                border: `1px solid ${item.done ? 'rgba(107,143,113,0.2)' : 'var(--color-border)'}`,
                borderRadius: '18px', padding: '18px 20px',
                boxShadow: item.done ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                  background: item.done ? 'var(--color-sage)' : 'var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: item.done ? '0' : '22px',
                }}>
                  {item.done
                    ? <svg width="18" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : item.icon}
                </div>
                <p style={{ fontSize: '15px', fontWeight: item.done ? 400 : 700, color: item.done ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: item.done ? 'line-through' : 'none', flex: 1 }}>
                  {item.label}
                </p>
                {!item.done && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(107,143,113,0.3)', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>

        </div>{/* end mission col */}
        <div>
        {/* ── 4. HABIT PILLARS ── goalChecked state drives completion ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Building Your Habits</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Five pillars. All improving.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HABIT_PILLARS.map((pillar, i) => {
              const pct = Math.round((pillar.days / pillar.total) * 100);
              const isGoalDone = goalChecked[i] ?? false;
              return (
                <button
                  key={i}
                  onClick={() => setGoalChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: isGoalDone ? 'rgba(107,143,113,0.07)' : '#fff',
                    border: `1px solid ${isGoalDone ? 'rgba(107,143,113,0.2)' : 'var(--color-border)'}`,
                    borderRadius: '18px', padding: '16px 18px',
                    cursor: 'pointer', textAlign: 'left' as const, width: '100%',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, background: isGoalDone ? 'var(--color-sage)' : 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isGoalDone ? '0' : '22px', transition: 'all 0.15s ease' }}>
                    {isGoalDone
                      ? <svg width="18" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : pillar.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: isGoalDone ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: isGoalDone ? 'line-through' : 'none' }}>{pillar.label}</p>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-sage)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{pillar.micro} · {pillar.days} of {pillar.total} days</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        </div>{/* end habits col */}
        </div>{/* end mission-habits grid */}

        {/* Desktop: Progress + Focus areas 2-col */}
        <div className="m2-progress-focus-grid">
        <div>
        {/* ── 5. YOUR PROGRESS SO FAR ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Progress So Far</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Everything is moving.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '⚖️', label: 'Weight',    value: '↓ Trending',  sub: 'down this week',    color: 'var(--color-sage)',        bg: 'rgba(107,143,113,0.07)',  border: 'rgba(107,143,113,0.15)' },
              { icon: '📏', label: 'Waist',     value: '↓ Reducing',  sub: 'week on week',      color: 'var(--color-sage)',        bg: 'rgba(107,143,113,0.07)',  border: 'rgba(107,143,113,0.15)' },
              { icon: '⚡', label: 'Energy',    value: '↑ Improving', sub: '83% feel better',   color: '#C49A26',                  bg: 'rgba(212,168,67,0.07)',   border: 'rgba(212,168,67,0.18)' },
              { icon: '🚶', label: 'Movement',  value: '↑ Increasing', sub: '+900 steps/day',   color: 'var(--color-terracotta)',  bg: 'rgba(200,96,74,0.06)',    border: 'rgba(200,96,74,0.15)' },
            ].map((item, i) => (
              <div key={i} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: '20px', padding: '18px 16px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '17px', fontWeight: 800, color: item.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '3px' }}>{item.value}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        </div>{/* end progress left col */}
        <div>
        {/* ── 6. THIS MONTH'S FOCUS AREAS ── horizontal scroll carousel ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>This Month&apos;s Focus</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Five pillars of foundation.</p>
          <div className="m2-focus-carousel" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px' }}>
            {[
              { img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', emoji: '🥗', title: 'Indian Plate',   take: 'Half veg · Quarter protein' },
              { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80', emoji: '🚶', title: 'Daily Movement', take: '6,000 → 8,000 steps' },
              { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', emoji: '💪', title: 'Strength',       take: 'Two sessions a week' },
              { img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',    emoji: '💧', title: 'Hydration',      take: '2–3 litres daily' },
              { img: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&q=80', emoji: '🚫', title: 'Cut Sugar',      take: 'Swap one drink daily' },
            ].map((card, i) => (
              <div key={i} style={{ width: '160px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', position: 'relative', cursor: 'pointer' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.72) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '22px', marginBottom: '6px', display: 'block' }}>{card.emoji}</span>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '4px' }}>{card.title}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{card.take}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. SUCCESS PILLARS ── 2×2 icon grid ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Month 2 Wins Like</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Four signs you&apos;re succeeding.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '⚖️', label: 'Weight Trend',        sub: 'Improving week-on-week' },
              { icon: '🚶', label: 'Movement',             sub: 'Steps increasing daily' },
              { icon: '🍽️', label: 'Meal Consistency',    sub: '3 logs per day' },
              { icon: '🔄', label: 'Daily Routine',        sub: 'Becoming automatic' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' as const }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(107,143,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>{item.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.4 }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. MONTH 3 PREVIEW ── */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', marginTop: '32px' }}>
          <img
            src="https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&q=80"
            alt="Month 3 — Metabolic Correction"
            style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.80) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Coming Next</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '4px' }}>Month 3 · Sleep Better, Feel Better</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '0.01em' }}>Metabolic Correction</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, marginBottom: '12px' }}>Sleep. Recovery. Blood sugar optimisation.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {['😴 Sleep', '🩸 Blood Sugar', '🌿 Gut Health', '⚡ Recovery'].map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        </div>{/* end focus right col */}
        </div>{/* end progress-focus grid */}

      </div>{/* end padded body m2-mobile-only */}

    {/* ═══════ DESKTOP ═══════ */}
    <div className="m2-desktop-only">
      <div className="m2-dt-page">

        {/* ── S1: HERO + MOMENTUM WORKSPACE ── */}
        <div className="m2-dt-hero-workspace">

          {/* LEFT 70%: cinematic hero */}
          <div className="m2-dt-hero-left">
            <img
              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1800&q=90"
              alt="Foundation Building — daily movement"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
            />
            {/* Gradient layers */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(7,23,16,0.88) 0%, rgba(12,32,20,0.72) 40%, rgba(0,0,0,0.28) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 15% 70%, rgba(107,143,113,0.18) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '160px', background: 'linear-gradient(to bottom, transparent, rgba(7,23,16,0.60))' }} />

            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '56px 64px', gap: '20px' }}>
              {/* Status pill */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '6px 16px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.15)' }}>
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F0C96A' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Month 2 · In Progress</span>
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}>
                <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: '12px', textShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
                  Build Healthy<br />Habits
                </h2>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '480px', marginBottom: '4px', fontWeight: 400 }}>
                  Create routines that fit naturally into your life.
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>Foundation Building</p>
              </motion.div>

              {/* Progress bar */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ maxWidth: '480px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Day 14 of 30</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(168,197,172,0.18)', borderRadius: '20px', padding: '4px 12px', border: '1px solid rgba(168,197,172,0.25)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A8C5AC' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#A8C5AC' }}>83% Consistent</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '47%' }} transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #6B8F71, #F0C96A)', borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.40)', marginTop: '7px' }}>47% complete · 16 days remaining</p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT 30%: momentum panel */}
          <div className="m2-dt-hero-right">
            {/* Background glow */}
            <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '6px' }}>Your Momentum</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '32px' }}>You&apos;re moving<br />forward.</p>

              {[
                { icon: '🚶', value: '+900', unit: 'daily steps', bg: 'rgba(107,143,113,0.14)', border: 'rgba(107,143,113,0.28)', val: '#A8C5AC', delay: 0.25 },
                { icon: '🥗', value: '82%', unit: 'meal adherence', bg: 'rgba(200,96,74,0.12)', border: 'rgba(200,96,74,0.22)', val: '#F0A87A', delay: 0.35 },
                { icon: '🔥', value: '14', unit: 'day streak', bg: 'rgba(91,124,250,0.12)', border: 'rgba(91,124,250,0.22)', val: '#A8C5F0', delay: 0.45 },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: card.delay }}
                  style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '20px', padding: '24px 22px', marginBottom: i < 2 ? '12px' : '0', backdropFilter: 'blur(8px)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-16px', right: '-16px', fontSize: '52px', opacity: 0.12, pointerEvents: 'none', lineHeight: 1 }}>{card.icon}</div>
                  <div style={{ position: 'relative' }}>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: card.val, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '6px' }}>{card.value}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{card.unit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── S2: MY TRANSFORMATION STORY ── */}
        <MonthTransformationStory monthNum={2} uploadedPhotos={photos} onUpload={handleFileChange} fileRef={fileInputRef} />

        {/* ── S2b: BIOMARKER PROGRESS SHOWCASE ── */}
        <BiomarkerProgressShowcase />

        {/* ── S3: TODAY'S EXECUTION CENTER ── */}
        <div className="m2-dt-section m2-dt-section-white">
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '4px' }}>Your Daily Work</p>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em' }}>Today&apos;s Execution Center</h2>
          </div>
          <div className="m2-dt-exec-grid">

            {/* LEFT: Today's Mission */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(240,201,106,0.12)', border: '1px solid rgba(240,201,106,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={17} color="#C49A26" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#C49A26', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '1px' }}>Today&apos;s Mission</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Three things. That&apos;s it.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '🥗', label: 'Log all meals', done: true },
                  { icon: '🚶', label: 'Reach 7,000 steps', done: false },
                  { icon: '💧', label: 'Drink 2L water', done: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: item.done ? 'rgba(107,143,113,0.06)' : '#fff', border: `1.5px solid ${item.done ? 'rgba(107,143,113,0.22)' : 'var(--color-border)'}`, borderRadius: '20px', padding: '20px 22px', boxShadow: item.done ? 'none' : '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.15s ease' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '15px', flexShrink: 0, background: item.done ? 'var(--color-sage)' : 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: item.done ? '0' : '24px' }}>
                      {item.done ? <svg width="20" height="16" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : item.icon}
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: item.done ? 400 : 700, color: item.done ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: item.done ? 'line-through' : 'none', flex: 1 }}>{item.label}</p>
                    {item.done
                      ? <CheckCircle2 size={18} color="var(--color-sage)" />
                      : <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(107,143,113,0.28)', flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Building Your Habits */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(107,143,113,0.10)', border: '1px solid rgba(107,143,113,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={17} color="var(--color-sage)" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '1px' }}>Building Your Habits</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Five pillars. All improving.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {HABIT_PILLARS.map((pillar, i) => {
                  const pct = Math.round((pillar.days / pillar.total) * 100);
                  const isGoalDone = goalChecked[i] ?? false;
                  return (
                    <button key={i} onClick={() => setGoalChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', background: isGoalDone ? 'rgba(107,143,113,0.06)' : '#fff', border: `1.5px solid ${isGoalDone ? 'rgba(107,143,113,0.22)' : 'var(--color-border)'}`, borderRadius: '18px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left' as const, width: '100%', transition: 'all 0.15s ease' }}
                      onMouseEnter={e => { if (!isGoalDone) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,143,113,0.30)'; }}
                      onMouseLeave={e => { if (!isGoalDone) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, background: isGoalDone ? 'var(--color-sage)' : 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isGoalDone ? '0' : '22px', transition: 'all 0.15s ease' }}>
                        {isGoalDone ? <svg width="18" height="14" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : pillar.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: isGoalDone ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: isGoalDone ? 'line-through' : 'none' }}>{pillar.label}</p>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-sage)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'var(--color-sage)', borderRadius: '2px' }} />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{pillar.micro} · {pillar.days} of {pillar.total} days</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── S4: RESULTS DASHBOARD ── */}
        <div className="m2-dt-section m2-dt-section-stone">
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '4px' }}>The Evidence</p>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em' }}>Your Results So Far</h2>
          </div>

          {/* Progress metrics — 4-col */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>Your Progress So Far · Everything is moving.</p>
          </div>
          <div className="m2-dt-results-row" style={{ marginBottom: '40px' }}>
            {[
              { icon: '⚖️', label: 'Weight',   value: '↓ Trending',   sub: 'down this week',   color: 'var(--color-sage)',       bg: '#fff', border: 'rgba(107,143,113,0.20)' },
              { icon: '📏', label: 'Waist',    value: '↓ Reducing',   sub: 'week on week',     color: 'var(--color-sage)',       bg: '#fff', border: 'rgba(107,143,113,0.20)' },
              { icon: '⚡', label: 'Energy',   value: '↑ Improving',  sub: '83% feel better',  color: '#C49A26',                 bg: '#fff', border: 'rgba(212,168,67,0.24)' },
              { icon: '🚶', label: 'Movement', value: '↑ Increasing', sub: '+900 steps/day',   color: 'var(--color-terracotta)', bg: '#fff', border: 'rgba(200,96,74,0.20)' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35 }}
                style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: '22px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-3px)'; d.style.boxShadow = '0 10px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(0)'; d.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px' }}>{item.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: item.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px' }}>{item.value}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Wins — 4-col */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>Month 2 Wins Like · Four signs you&apos;re succeeding.</p>
          </div>
          <div className="m2-dt-wins-row">
            {[
              { icon: '⚖️', label: 'Weight Trend',     sub: 'Improving week-on-week' },
              { icon: '🚶', label: 'Movement',          sub: 'Steps increasing daily' },
              { icon: '🍽️', label: 'Meal Consistency', sub: '3 logs per day' },
              { icon: '🔄', label: 'Daily Routine',     sub: 'Becoming automatic' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '22px', padding: '28px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', textAlign: 'center' as const }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(107,143,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 14px' }}>{item.icon}</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '5px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.4 }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── S5: THIS MONTH'S FOCUS ── */}
        <div className="m2-dt-section m2-dt-section-dark">
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '4px' }}>This Month&apos;s Focus</p>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Five pillars of foundation.</h2>
          </div>
          <div className="m2-dt-focus-gallery">
            {[
              { img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', emoji: '🥗', title: 'Indian Plate',   take: 'Half veg · Quarter protein' },
              { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', emoji: '🚶', title: 'Daily Movement', take: '6,000 → 8,000 steps' },
              { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', emoji: '💪', title: 'Strength',       take: 'Two sessions a week' },
              { img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',    emoji: '💧', title: 'Hydration',      take: '2–3 litres daily' },
              { img: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=800&q=80', emoji: '🚫', title: 'Cut Sugar',      take: 'Swap one drink daily' },
            ].map((card, i) => (
              <motion.div key={i} whileHover={{ y: -6, scale: 1.02 }} style={{ borderRadius: '22px', overflow: 'hidden', cursor: 'pointer', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.80) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }}>{card.emoji}</span>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '5px' }}>{card.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>{card.take}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── S6: MONTH 3 PREVIEW ── */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
          <img src="https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=1800&q=90" alt="Month 3 — Sleep Better, Feel Better"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(4,10,24,0.96) 0%, rgba(8,18,40,0.88) 45%, rgba(0,0,0,0.55) 100%)' }} />
          <motion.div animate={{ opacity: [0.12, 0.30, 0.12] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-80px', left: '30%', width: '400px', height: '300px', background: 'radial-gradient(ellipse, rgba(123,104,238,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '80px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '16px' }}>Coming Next</p>
              <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: '16px', textShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
                Month 3<br />
                <span style={{ background: 'linear-gradient(90deg, #fff 50%, rgba(168,145,255,0.80) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sleep Better,<br />Feel Better</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Metabolic Correction</p>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.65, maxWidth: '420px', marginBottom: '28px' }}>
                Sleep. Recovery. Blood sugar optimisation. The habits you are building now unlock this chapter.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {['😴 Sleep', '🩸 Blood Sugar', '🌿 Gut Health', '⚡ Recovery'].map((tag, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.14)' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '36px 40px', backdropFilter: 'blur(16px)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Unlocks In</p>
                <p style={{ fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>16</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>days · Jul 9, 2026</p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', margin: '20px 0' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Complete Month 2<br />to unlock</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>{/* end m2-desktop-only */}
    </>
  );
}

// ---- Future Month Preview Data ----
const FUTURE_MONTH_DATA: Record<number, {
  name: string;
  clinicalName: string;
  tagline: string;
  inspiration: string;
  unlockDate: string;
  daysAway: number;
  img: string;
  accentColor: string;
  accentBg: string;
  themes: { icon: string; label: string }[];
  previewSections: { icon: string; title: string; sub: string }[];
  projectedOutcomes: { icon: string; label: string; value: string }[];
  pillars: { img: string; emoji: string; title: string; take: string }[];
}> = {
  3: {
    name: 'Sleep Better, Feel Better',
    clinicalName: 'Metabolic Correction',
    tagline: 'Better sleep. Better energy. Better blood sugar.',
    inspiration: 'Sleep and blood sugar are the two biggest metabolic levers. Month 3 fixes both.',
    unlockDate: 'Jul 9, 2026',
    daysAway: 28,
    img: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=1200&q=80',
    accentColor: '#7B68EE',
    accentBg: 'rgba(123,104,238,0.08)',
    themes: [
      { icon: '😴', label: 'Sleep' },
      { icon: '🩸', label: 'Blood Sugar' },
      { icon: '🌿', label: 'Gut Health' },
      { icon: '⚡', label: 'Recovery' },
    ],
    previewSections: [
      { icon: '😴', title: 'Sleep Optimisation', sub: 'Screen curfew · Bedtime routine · Sleep quality tracking' },
      { icon: '🩸', title: 'Glycaemic Management', sub: 'Meal sequencing · Post-meal walks · Carb awareness' },
      { icon: '🌿', title: 'Gut Health Protocol', sub: 'Probiotic foods · Fibre targets · Digestion tracking' },
      { icon: '☕', title: 'Recovery Habits', sub: 'Caffeine timing · Stress reduction · Energy optimisation' },
    ],
    projectedOutcomes: [
      { icon: '😴', label: 'Sleep Quality', value: '+45 min/night' },
      { icon: '🩸', label: 'Blood Sugar', value: '↓ Trending' },
      { icon: '⚡', label: 'Energy', value: '↑ Improving' },
      { icon: '🌿', label: 'Digestion', value: 'Improving' },
    ],
    pillars: [
      { img: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&q=80', emoji: '😴', title: 'Sleep Protocol', take: 'Screen-free by 10pm' },
      { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', emoji: '🥗', title: 'Meal Sequencing', take: 'Veg first, carbs last' },
      { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', emoji: '🚶', title: 'Post-Meal Walks', take: '10 min after dinner' },
      { img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', emoji: '🌿', title: 'Gut Health', take: 'Probiotic daily' },
    ],
  },
  4: {
    name: 'Stress Less, Feel Better',
    clinicalName: 'Optimisation & Integration',
    tagline: 'Master stress. Unlock energy. Build confidence.',
    inspiration: 'Month 4 brings your habits together and adds the mental layer that makes them last.',
    unlockDate: 'Aug 9, 2026',
    daysAway: 58,
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    accentColor: '#C49A26',
    accentBg: 'rgba(212,168,67,0.08)',
    themes: [
      { icon: '🧠', label: 'Stress' },
      { icon: '🫁', label: 'Breathwork' },
      { icon: '💪', label: 'Strength' },
      { icon: '🌟', label: 'Wellbeing' },
    ],
    previewSections: [
      { icon: '🫁', title: 'Breathwork & Mindfulness', sub: 'Box breathing · 5-minute daily practice · Cortisol management' },
      { icon: '🧠', title: 'Emotional Eating Support', sub: 'Stress triggers · Coping strategies · Food-mood journaling' },
      { icon: '💊', title: 'Micronutrient Optimisation', sub: 'Vitamin D · B12 · Iron · Magnesium supplementation' },
      { icon: '💪', title: 'Strength Progression', sub: 'From 2 to 3 sessions/week · Progressive overload · Recovery' },
    ],
    projectedOutcomes: [
      { icon: '🧠', label: 'Stress', value: '↓ Managed' },
      { icon: '❤️', label: 'Blood Pressure', value: '↓ Improving' },
      { icon: '💪', label: 'Strength', value: '↑ Progressing' },
      { icon: '⚡', label: 'Energy', value: '↑ Sustained' },
    ],
    pillars: [
      { img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', emoji: '🫁', title: 'Breathwork', take: '5 min before meals' },
      { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', emoji: '💪', title: 'Strength +', take: '3 sessions weekly' },
      { img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', emoji: '📝', title: 'Stress Journal', take: 'Daily trigger log' },
      { img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', emoji: '💊', title: 'Micronutrients', take: 'Personalised stack' },
    ],
  },
  5: {
    name: 'Make It Stick',
    clinicalName: 'Sustainability & Transition',
    tagline: 'Build independence. Make it last forever.',
    inspiration: 'Month 5 is where you learn to run without the coach. The goal is self-sufficiency.',
    unlockDate: 'Sep 9, 2026',
    daysAway: 89,
    img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&q=80',
    accentColor: 'var(--color-sage)',
    accentBg: 'rgba(107,143,113,0.08)',
    themes: [
      { icon: '🌿', label: 'Gut Health' },
      { icon: '📖', label: 'Health Literacy' },
      { icon: '🧭', label: 'Self-Monitoring' },
      { icon: '🔄', label: 'Sustainability' },
    ],
    previewSections: [
      { icon: '🌿', title: 'Gut Health Mastery', sub: 'Probiotic & prebiotic foods · Fibre habits · Digestion fluency' },
      { icon: '📖', title: 'Health Literacy', sub: 'Reading nutrition labels · Understanding biomarkers · Informed choices' },
      { icon: '🧭', title: 'Self-Monitoring', sub: 'Without coach prompts · Pattern recognition · Personal data analysis' },
      { icon: '🔄', title: 'Relapse Prevention', sub: 'If-then strategies · Travel eating · Social situations' },
    ],
    projectedOutcomes: [
      { icon: '🧭', label: 'Independence', value: 'Self-managing' },
      { icon: '📖', label: 'Literacy', value: 'High' },
      { icon: '🔄', label: 'Consistency', value: '90%+ habits' },
      { icon: '🌿', label: 'Gut Health', value: 'Optimised' },
    ],
    pillars: [
      { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', emoji: '🌿', title: 'Gut Protocol', take: 'Probiotic every day' },
      { img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', emoji: '📖', title: 'Health Literacy', take: 'Read labels fluently' },
      { img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80', emoji: '🧭', title: 'Self-Monitor', take: 'No prompts needed' },
      { img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', emoji: '🛡️', title: 'Relapse Prep', take: 'If-then strategies' },
    ],
  },
  6: {
    name: 'Your New Normal',
    clinicalName: 'Consolidation & Performance',
    tagline: 'Your transformation. Complete.',
    inspiration: 'Month 6 is your finish line. Compare where you started to where you stand. This is the moment.',
    unlockDate: 'Oct 9, 2026',
    daysAway: 119,
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
    accentColor: '#F0C96A',
    accentBg: 'rgba(240,201,106,0.08)',
    themes: [
      { icon: '🏆', label: 'Graduation' },
      { icon: '🔬', label: 'Biomarkers' },
      { icon: '🍽️', label: 'Social Eating' },
      { icon: '🎯', label: 'Performance' },
    ],
    previewSections: [
      { icon: '🔬', title: 'Final Biomarker Review', sub: 'FBG · HbA1c · Lipids · Blood Pressure · Waist comparison' },
      { icon: '🍽️', title: 'Social Eating Mastery', sub: 'Restaurants · Travel · Workplace eating · Celebrations' },
      { icon: '📊', title: 'Performance Review', sub: 'Full 6-month progress · Before vs after · Non-scale victories' },
      { icon: '🎓', title: 'Graduation Planning', sub: 'Lifetime wellness plan · Sustainable routines · Next goals' },
    ],
    projectedOutcomes: [
      { icon: '⚖️', label: 'Weight', value: '↓ −5–8 kg' },
      { icon: '📏', label: 'Waist', value: '↓ −6–10 cm' },
      { icon: '🩸', label: 'Blood Sugar', value: 'Normalised' },
      { icon: '❤️', label: 'Blood Pressure', value: 'Improved' },
    ],
    pillars: [
      { img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', emoji: '🔬', title: 'Final Labs', take: 'Complete comparison' },
      { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', emoji: '🍽️', title: 'Social Eating', take: 'Eat anywhere, wisely' },
      { img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80', emoji: '📊', title: 'Progress Review', take: '6-month comparison' },
      { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', emoji: '🎓', title: 'Graduation', take: 'Your lifetime plan' },
    ],
  },
};

function LockedMonthContent({ monthNum }: { monthNum: number }) {
  const d = FUTURE_MONTH_DATA[monthNum];
  if (!d) return null;

  const isMonth6 = monthNum === 6;

  // Per-month desktop color identity
  const DT_PAL: Record<number, { dark: string; mid: string; accent: string; accentRgb: string; text: string; heroGrad: string; heroGlow: string; sectionBg: string }> = {
    3: { dark: '#040A18', mid: '#1A3660', accent: '#4B6B99', accentRgb: '75,107,153', text: '#A8C0E8', heroGrad: 'linear-gradient(115deg, rgba(4,10,24,0.94) 0%, rgba(26,54,96,0.80) 45%, rgba(0,0,0,0.18) 100%)', heroGlow: 'radial-gradient(ellipse 55% 65% at 10% 70%, rgba(75,107,153,0.28) 0%, transparent 65%)', sectionBg: '#F0F2F8' },
    4: { dark: '#100A22', mid: '#42357A', accent: '#6E62AA', accentRgb: '110,98,170', text: '#C8C0F0', heroGrad: 'linear-gradient(115deg, rgba(16,10,34,0.94) 0%, rgba(66,53,122,0.80) 45%, rgba(0,0,0,0.18) 100%)', heroGlow: 'radial-gradient(ellipse 55% 65% at 10% 70%, rgba(110,98,170,0.28) 0%, transparent 65%)', sectionBg: '#F2F0F8' },
    5: { dark: '#0A1509', mid: '#2A4A2E', accent: '#4A7050', accentRgb: '74,112,80',  text: '#A8C5AC', heroGrad: 'linear-gradient(115deg, rgba(10,21,9,0.94) 0%, rgba(42,74,46,0.80) 45%, rgba(0,0,0,0.18) 100%)',  heroGlow: 'radial-gradient(ellipse 55% 65% at 10% 70%, rgba(74,112,80,0.28) 0%, transparent 65%)',   sectionBg: '#EEF3EF' },
    6: { dark: '#18100A', mid: '#4A2E10', accent: '#C49A26', accentRgb: '196,154,38', text: '#F0C96A', heroGrad: 'linear-gradient(115deg, rgba(24,16,10,0.92) 0%, rgba(74,46,16,0.78) 45%, rgba(0,0,0,0.15) 100%)', heroGlow: 'radial-gradient(ellipse 55% 65% at 10% 70%, rgba(196,154,38,0.30) 0%, transparent 65%)', sectionBg: '#F5F0E8' },
  };
  const pal = DT_PAL[monthNum] ?? DT_PAL[3]!;

  // Month 6 hero is full color; others get desaturated
  const heroImgFilter = isMonth6 ? 'brightness(0.78)' : 'grayscale(50%) brightness(0.72)';
  const bodyFilter = isMonth6 ? 'none' : 'grayscale(35%)';
  const bodyOpacity = isMonth6 ? 1 : 0.88;

  return (
    <>
    <style>{`
      /* ── Locked Month Dual render ── */
      .lm-mobile-only { display: block; }
      .lm-desktop-only { display: none; }

      @media (min-width: 1024px) {
        .lm-mobile-only { display: none !important; }
        .lm-desktop-only { display: block !important; }

        .lm-dt-page { max-width: 1600px; margin: 0 auto; background: var(--color-surface); overflow: hidden; }

        /* Section bands */
        .lm-dt-section       { padding: 72px 80px; }
        .lm-dt-section-white { background: #ffffff; }
        .lm-dt-section-stone { background: #F0EDE6; }

        /* S1: Hero workspace (70/30) */
        .lm-dt-hero-workspace { display: grid; grid-template-columns: 70fr 30fr; min-height: 620px; }
        .lm-dt-hero-left  { position: relative; overflow: hidden; }
        .lm-dt-hero-right {
          display: flex; flex-direction: column; justify-content: center;
          padding: 56px 48px; gap: 32px; position: relative; overflow: hidden;
        }

        /* S2: Preview workspace (35/65) */
        .lm-dt-preview-workspace { display: grid; grid-template-columns: 35fr 65fr; gap: 48px; align-items: start; }

        /* S3: Pillars gallery (4-col) */
        .lm-dt-pillars-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

        /* S4: Outcomes row (4-col) */
        .lm-dt-outcomes-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
      }

      @media (min-width: 1400px) {
        .lm-dt-hero-workspace { min-height: 700px; }
        .lm-dt-section { padding: 88px 96px; }
      }
    `}</style>

    {/* ═══════ MOBILE ═══════ */}
    <div className="lm-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--color-surface)' }}>

      {/* ── HERO ── full bleed, desaturated but aspirational ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '280px' }}>
        <img
          src={d.img}
          alt={d.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: heroImgFilter, objectPosition: 'center 40%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.80) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start' }}>
            <Lock size={10} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>Unlocks in {d.daysAway} days · {d.unlockDate}</span>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Month {monthNum}</p>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '4px', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{d.name}</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: '4px' }}>{d.tagline}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.01em' }}>{d.clinicalName}</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            {d.themes.map((t, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY — desaturated preview ── */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', filter: bodyFilter, opacity: bodyOpacity }}>

        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', border: '1px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '15px', color: 'var(--color-ink)', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500 }}>
            &ldquo;{d.inspiration}&rdquo;
          </p>
        </div>

        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Your Month {monthNum} Journey</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>What this chapter contains</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {d.previewSections.map((section, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '18px', padding: '16px 18px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{section.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '3px' }}>{section.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{section.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Focus Areas</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>Pillars of Month {monthNum}</p>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px' }}>
            {d.pillars.map((card, i) => (
              <div key={i} style={{ width: '150px', flexShrink: 0, borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', position: 'relative' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.72) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '20px', marginBottom: '5px', display: 'block' }}>{card.emoji}</span>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '3px' }}>{card.title}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{card.take}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Projected Outcomes</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>What to expect by Month {monthNum} end</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {d.projectedOutcomes.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {isMonth6 && (
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 60%, #2D4A30 100%)', padding: '32px 24px', textAlign: 'center' as const, boxShadow: '0 8px 32px rgba(28,43,30,0.25)' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(240,201,106,0.15)', border: '2px solid rgba(240,201,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', filter: 'blur(1px)' }}>
              <span style={{ fontSize: '48px' }}>🏆</span>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '8px' }}>Your Graduation Journey</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '12px' }}>Programme Complete</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
              Six months. Transformed biomarkers. A sustainable lifetime health system. This is where your journey earns its graduation.
            </p>
          </div>
        )}

      </div>{/* end desaturated body */}

      {/* ── MY TRANSFORMATION STORY — full colour, outside grayscale filter ── */}
      <MonthTransformationStory monthNum={monthNum} />

      {/* ── BIOMARKER PROGRESS SHOWCASE ── */}
      <BiomarkerProgressShowcase />

      {/* ── CTA — full colour, outside grayscale filter ── */}
      <div style={{ padding: '0 24px 40px', marginTop: '32px' }}>
        <div style={{ background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(28,43,30,0.2)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '6px' }}>Keep Building Momentum</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>Complete Month 2 to unlock this chapter.</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>Every habit you build today brings Month {monthNum} closer.</p>
        </div>
      </div>

    </div>{/* end lm-mobile-only */}

    {/* ═══════ DESKTOP ═══════ */}
    <div className="lm-desktop-only">
      <div className="lm-dt-page">

        {/* ── S1: CINEMATIC CHAPTER HERO (70/30) ── */}
        <div className="lm-dt-hero-workspace">

          {/* LEFT 70%: Cinematic hero */}
          <div className="lm-dt-hero-left">
            <img
              src={d.img}
              alt={d.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: heroImgFilter, objectPosition: 'center 40%' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: pal.heroGrad }} />
            <div style={{ position: 'absolute', inset: 0, background: pal.heroGlow }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: `linear-gradient(to bottom, transparent, ${pal.dark}CC)` }} />

            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 80px', gap: '20px' }}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '7px 18px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.16)' }}>
                <Lock size={12} color="rgba(255,255,255,0.80)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.04em' }}>Unlocks in {d.daysAway} days · {d.unlockDate}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12 }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: pal.text, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px', opacity: 0.75 }}>Month {monthNum}</p>
                <h2 style={{ fontSize: isMonth6 ? '72px' : '62px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 0.95, marginBottom: '16px', textShadow: '0 4px 40px rgba(0,0,0,0.40)' }}>
                  {d.name.split(' ').length > 4
                    ? <>{d.name.split(',')[0]}<br />{d.name.split(',')[1] ?? ''}</>
                    : d.name}
                </h2>
                <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.58, maxWidth: '500px', marginBottom: '6px' }}>{d.tagline}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.34)', letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>{d.clinicalName}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.30 }}
                style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {d.themes.map((t, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.16)' }}>
                    {t.icon} {t.label}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* RIGHT 30%: Unlock panel */}
          <div className="lm-dt-hero-right" style={{ background: `linear-gradient(160deg, ${pal.dark} 0%, ${pal.mid}99 100%)` }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle, rgba(${pal.accentRgb},0.18) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, rgba(${pal.accentRgb},0.10) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: `rgba(${pal.accentRgb},0.55)`, textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '8px' }}>Your Future Chapter</p>
              <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '32px' }}>
                {isMonth6 ? 'Your finish\nline awaits.' : 'This chapter\nis waiting.'}
              </p>

              {/* Countdown card */}
              <div style={{ background: `rgba(${pal.accentRgb},0.12)`, border: `1px solid rgba(${pal.accentRgb},0.28)`, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: pal.text, textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '8px', opacity: 0.75 }}>Unlocks in</p>
                <p style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>{d.daysAway}</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>days · {d.unlockDate}</p>
              </div>

              {/* Theme preview strips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {d.themes.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '18px' }}>{t.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.80)' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── S2: CHAPTER PREVIEW WORKSPACE (35/65) ── */}
        <div className="lm-dt-section" style={{ background: pal.sectionBg, filter: bodyFilter, opacity: bodyOpacity }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: pal.accent, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Your Month {monthNum} Journey</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>What this chapter contains.</h3>
            </div>
            <div className="lm-dt-preview-workspace">
              {/* LEFT 35%: Inspiration */}
              <div style={{ position: 'sticky', top: '88px' }}>
                <div style={{ background: `linear-gradient(155deg, ${pal.dark} 0%, ${pal.mid} 100%)`, borderRadius: '28px', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: pal.text, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '20px', opacity: 0.65 }}>Chapter Insight</p>
                  <p style={{ fontSize: '22px', color: '#fff', lineHeight: 1.62, fontStyle: 'italic', fontWeight: 500, marginBottom: '28px' }}>
                    &ldquo;{d.inspiration}&rdquo;
                  </p>
                  <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: `rgba(${pal.accentRgb},0.55)` }} />
                </div>
              </div>
              {/* RIGHT 65%: Preview sections grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {d.previewSections.map((section, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '24px', padding: '28px 24px', border: '1px solid var(--color-border)', boxShadow: '0 3px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{section.icon}</div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px', lineHeight: 1.3 }}>{section.title}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.58 }}>{section.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── S3: TRANSFORMATION PILLARS GALLERY ── */}
        <div className="lm-dt-section lm-dt-section-white" style={{ filter: bodyFilter, opacity: bodyOpacity }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: pal.accent, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Focus Areas</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>Pillars of Month {monthNum}.</h3>
            </div>
            <div className="lm-dt-pillars-gallery">
              {d.pillars.map((card, i) => (
                <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 36px rgba(0,0,0,0.14)', cursor: 'pointer', transition: 'transform 0.22s ease, box-shadow 0.22s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 56px rgba(0,0,0,0.22)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 36px rgba(0,0,0,0.14)'; }}>
                  <img src={card.img} alt={card.title} style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.76) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                    <span style={{ fontSize: '26px', display: 'block', marginBottom: '8px' }}>{card.emoji}</span>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '5px' }}>{card.title}</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>{card.take}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── S4: FUTURE OUTCOMES DASHBOARD ── */}
        <div className="lm-dt-section" style={{ background: pal.sectionBg, filter: bodyFilter, opacity: bodyOpacity }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: pal.accent, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Projected Outcomes</p>
              <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>What to expect by Month {monthNum}.</h3>
              <p style={{ fontSize: '17px', color: 'var(--color-muted)', marginTop: '14px', maxWidth: '560px', lineHeight: 1.65 }}>
                Consistent effort in Month {monthNum} produces measurable results. These are the changes members typically see.
              </p>
            </div>
            <div className="lm-dt-outcomes-row">
              {d.projectedOutcomes.map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '28px', padding: '40px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `rgba(${pal.accentRgb},0.10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '8px' }}>{item.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {isMonth6 && (
              <div style={{ marginTop: '40px', background: `linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 60%, #2D4A30 100%)`, borderRadius: '28px', padding: '56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center', boxShadow: '0 12px 48px rgba(28,43,30,0.30)' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '12px' }}>Your Graduation Journey</p>
                  <h4 style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '18px' }}>Programme<br />Complete.</h4>
                  <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.70, maxWidth: '480px' }}>
                    Six months. Transformed biomarkers. A sustainable lifetime health system. This is where your journey earns its graduation.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(240,201,106,0.15)', border: '2px solid rgba(240,201,106,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'blur(0.5px)' }}>
                    <span style={{ fontSize: '64px' }}>🏆</span>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#F0C96A', textAlign: 'center' as const }}>Your Graduation Awaits</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── S5: MY TRANSFORMATION STORY — full colour ── */}
        <MonthTransformationStory monthNum={monthNum} />

        {/* ── S5b: BIOMARKER PROGRESS SHOWCASE ── */}
        <BiomarkerProgressShowcase />

        {/* ── S6: KEEP BUILDING MOMENTUM — Cinematic CTA ── */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '440px' }}>
          <img
            src={d.img}
            alt={d.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: heroImgFilter, objectPosition: 'center 40%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${pal.dark}F0 0%, ${pal.dark}CC 50%, rgba(0,0,0,0.30) 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, background: pal.heroGlow }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', minHeight: '440px', display: 'flex', alignItems: 'center', padding: '80px', gap: '80px' }}>
            <div style={{ maxWidth: '620px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: pal.text, textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '14px', opacity: 0.75 }}>Keep Building Momentum</p>
              <h3 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '20px' }}>
                Complete Month 2 to<br /><span style={{ color: pal.text }}>unlock this chapter.</span>
              </h3>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.68, marginBottom: '36px', maxWidth: '520px' }}>
                Every habit you build today brings Month {monthNum} closer. The work you do now is the foundation for everything that follows.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: `rgba(${pal.accentRgb},0.18)`, border: `1px solid rgba(${pal.accentRgb},0.35)`, borderRadius: '16px', padding: '16px 24px' }}>
                <Lock size={16} color={pal.text} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: pal.text }}>Unlocks in {d.daysAway} days · {d.unlockDate}</span>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end lm-dt-page */}
    </div>{/* end lm-desktop-only */}

    </> /* end LockedMonthContent fragment */
  );
}

// ---- Journey Indicator ----
const PHASE_DATA = [
  {
    num: 1, label: 'Discover', icon: '🔬', status: 'completed' as const,
    journeyLabel: 'Discover',
    tagline: 'Know Yourself.',
    title: 'Know Your Health',
    focus: ['Health assessment', 'Nutrition foundations', 'Habit tracking'],
    outcome: 'Discover your patterns and build your starting point.',
    tiles: [
      { icon: '🔬', label: 'Health Assessment', desc: 'Understand your baseline' },
      { icon: '🩺', label: 'Baseline Labs',      desc: 'Know your numbers' },
      { icon: '🍽', label: 'Nutrition Insights', desc: 'Discover your eating patterns' },
      { icon: '🎯', label: 'Goal Setting',        desc: 'Define what success looks like' },
    ],
  },
  {
    num: 2, label: 'Build', icon: '🚶', status: 'active' as const,
    journeyLabel: 'Build',
    tagline: 'Small Habits. Big Changes.',

    title: 'Build Healthy Habits',
    focus: ['Nutrition consistency', 'Daily movement', 'Strength training', 'Hydration'],
    outcome: 'Create routines that fit naturally into your life.',
    tiles: [
      { icon: '🍽', label: 'Better Nutrition',   desc: 'Build a healthier plate' },
      { icon: '🚶', label: 'Daily Movement',      desc: 'Move more throughout the day' },
      { icon: '💪', label: 'Strength Training',   desc: 'Build strength gradually' },
      { icon: '💧', label: 'Hydration',           desc: 'Support energy and recovery' },
    ],
  },
  {
    num: 3, label: 'Restore', icon: '😴', status: 'locked' as const,
    journeyLabel: 'Restore',
    tagline: 'Sleep Better. Recover Better.',
    title: 'Sleep Better, Feel Better',
    focus: ['Sleep optimisation', 'Blood sugar management', 'Recovery'],
    outcome: 'Improve sleep, energy and blood sugar balance.',
    tiles: [
      { icon: '🌙', label: 'Better Sleep',         desc: 'Optimise your sleep quality' },
      { icon: '⚡', label: 'More Energy',           desc: 'Feel energised every day' },
      { icon: '🩸', label: 'Blood Sugar Support',  desc: 'Balance your energy levels' },
      { icon: '🔄', label: 'Recovery',             desc: 'Help your body heal and reset' },
    ],
  },
  {
    num: 4, label: 'Balance', icon: '🧠', status: 'locked' as const,
    journeyLabel: 'Balance',
    tagline: 'Calmer Mind. Better Health.',
    title: 'Stress Less, Feel Better',
    focus: ['Stress management', 'Mental wellbeing', 'Lifestyle integration'],
    outcome: 'Build resilience and feel more in control.',
    tiles: [
      { icon: '🧠', label: 'Stress Management', desc: 'Build calm into your routine' },
      { icon: '🧘', label: 'Mindfulness',        desc: 'Stay present and grounded' },
      { icon: '❤️', label: 'Emotional Health',   desc: 'Nurture your inner wellbeing' },
      { icon: '⚖️', label: 'Life Balance',       desc: 'Find harmony in your day' },
    ],
  },
  {
    num: 5, label: 'Sustain', icon: '🌿', status: 'locked' as const,
    journeyLabel: 'Sustain',
    tagline: 'Make Healthy Living Automatic.',
    title: 'Make It Stick',
    focus: ['Gut health', 'Behaviour reinforcement', 'Long-term habit design'],
    outcome: 'Turn healthy choices into lasting habits.',
    tiles: [
      { icon: '🌱', label: 'Gut Health',       desc: 'Nourish from the inside out' },
      { icon: '🥗', label: 'Healthy Choices',  desc: 'Make better choices effortlessly' },
      { icon: '🚶', label: 'Active Living',     desc: 'Movement as a lifestyle' },
      { icon: '🔁', label: 'Consistency',       desc: 'Turn habits into identity' },
    ],
  },
  {
    num: 6, label: 'Thrive', icon: '🏆', status: 'locked' as const,
    journeyLabel: 'Thrive',
    tagline: 'Your New Normal Starts Here.',
    title: 'Your New Normal',
    focus: ['Biomarker tracking', 'Advanced coaching', 'Future planning'],
    outcome: 'Celebrate your progress and prepare for life beyond the programme.',
    tiles: [
      { icon: '🏆', label: 'Long-Term Success', desc: 'Sustain your transformation' },
      { icon: '📊', label: 'Better Biomarkers', desc: 'See your health data improve' },
      { icon: '❤️', label: 'Better Health',     desc: 'Live your best life' },
      { icon: '🚀', label: 'Graduation',         desc: 'Celebrate how far you\'ve come' },
    ],
  },
];

const MONTH_THEMES = {
  1: { gradFrom: '#B78A3C', gradTo: '#E0B766', accent: '#B78A3C', tileBorder: 'rgba(183,138,60,0.18)',  iconBg: 'rgba(183,138,60,0.13)' },
  2: { gradFrom: '#29543A', gradTo: '#74A57F', accent: '#3A6B4C', tileBorder: 'rgba(58,107,76,0.18)',   iconBg: 'rgba(58,107,76,0.12)'  },
  3: { gradFrom: '#22324A', gradTo: '#4B6B99', accent: '#3D5F8F', tileBorder: 'rgba(75,107,153,0.18)', iconBg: 'rgba(75,107,153,0.12)' },
  4: { gradFrom: '#4A3D7A', gradTo: '#7D73B3', accent: '#6457A0', tileBorder: 'rgba(125,115,179,0.18)', iconBg: 'rgba(125,115,179,0.12)' },
  5: { gradFrom: '#39553C', gradTo: '#7FA084', accent: '#4A7050', tileBorder: 'rgba(74,112,80,0.18)',   iconBg: 'rgba(74,112,80,0.12)'  },
  6: { gradFrom: '#A67C2E', gradTo: '#E6C77A', accent: '#A67C2E', tileBorder: 'rgba(166,124,46,0.18)', iconBg: 'rgba(166,124,46,0.13)' },
} as const;

function JourneyIndicator({ dark = false }: { dark?: boolean }) {
  const [selectedPhase, setSelectedPhase] = useState(2);
  const phase = PHASE_DATA[selectedPhase - 1]!;

  const nodeColor = (status: 'completed' | 'active' | 'locked', selected: boolean) => {
    if (selected) return dark ? '#F0C96A' : 'var(--color-ink)';
    if (status === 'completed') return 'var(--color-sage)';
    if (status === 'active') return dark ? '#F0C96A' : 'var(--color-ink)';
    return 'transparent';
  };

  const statusLabel = (status: 'completed' | 'active' | 'locked') => {
    if (status === 'completed') return { text: 'Completed', bg: 'rgba(107,143,113,0.15)', color: 'var(--color-sage)' };
    if (status === 'active') return { text: 'In Progress', bg: 'rgba(240,201,106,0.15)', color: '#C49A26' };
    return { text: 'Locked', bg: 'rgba(0,0,0,0.06)', color: 'var(--color-muted)' };
  };

  return (
    <div>
      {/* Stepper row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {PHASE_DATA.map((step, i) => {
          const isSelected = selectedPhase === step.num;
          const bgColor = nodeColor(step.status, isSelected);
          return (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
              <button
                onClick={() => setSelectedPhase(step.num)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0',
                }}
              >
                <div style={{
                  width: isSelected ? '30px' : step.status === 'active' ? '28px' : '22px',
                  height: isSelected ? '30px' : step.status === 'active' ? '28px' : '22px',
                  borderRadius: '50%',
                  background: bgColor,
                  border: step.status === 'locked' && !isSelected
                    ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}`
                    : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: isSelected
                    ? dark ? '0 0 0 3px rgba(240,201,106,0.25)' : '0 0 0 3px rgba(28,43,30,0.12)'
                    : step.status === 'active' ? '0 0 0 3px rgba(28,43,30,0.10)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {step.status === 'completed'
                    ? <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span style={{
                        fontSize: isSelected || step.status === 'active' ? '11px' : '9px',
                        fontWeight: 700,
                        color: isSelected
                          ? dark ? '#1C2B1E' : '#fff'
                          : step.status === 'active' ? '#fff' : dark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)',
                      }}>{step.num}</span>
                  }
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: isSelected || step.status === 'active' ? 700 : 400,
                  color: isSelected
                    ? dark ? '#F0C96A' : 'var(--color-ink)'
                    : step.status === 'completed' ? 'var(--color-sage)'
                    : step.status === 'active' ? dark ? '#F0C96A' : 'var(--color-ink)'
                    : dark ? 'rgba(255,255,255,0.35)' : 'var(--color-muted)',
                  whiteSpace: 'nowrap' as const,
                  letterSpacing: '0.01em',
                }}>
                  {step.label}
                </span>
              </button>
              {i < 5 && (
                <div style={{
                  flex: 1,
                  height: '1.5px',
                  background: step.status === 'completed'
                    ? 'var(--color-sage)'
                    : dark ? 'rgba(255,255,255,0.12)' : 'var(--color-border)',
                  margin: '0 4px',
                  marginBottom: '16px',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter card — AnimatePresence for content swap */}
      <AnimatePresence mode="wait">
        {(() => {
          const theme = MONTH_THEMES[phase.num as keyof typeof MONTH_THEMES];
          const statusInfo = statusLabel(phase.status);

          type ChapterDesign = {
            heroGradient: string;
            glow1: string;
            glow2: string;
            glow3: string;
            iconBg: string;
            IconComponent: React.ElementType;
            iconColor: string;
            taglineColor: string;
          };

          const CHAPTER_DESIGNS: Record<number, ChapterDesign> = {
            1: {
              heroGradient: 'linear-gradient(148deg, #2A1400 0%, #6B3810 32%, #B07828 68%, #D4A84A 100%)',
              glow1: 'radial-gradient(ellipse, rgba(210,168,74,0.42) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(176,120,40,0.24) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(255,215,100,0.13) 0%, transparent 70%)',
              iconBg: 'rgba(210,168,74,0.22)',
              IconComponent: Sparkles,
              iconColor: 'rgba(255,225,150,0.92)',
              taglineColor: 'rgba(255,218,130,0.72)',
            },
            2: {
              heroGradient: 'linear-gradient(148deg, #071710 0%, #163326 32%, #2A5C3C 68%, #4E8A5E 100%)',
              glow1: 'radial-gradient(ellipse, rgba(78,138,94,0.40) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(42,92,60,0.22) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(140,210,158,0.11) 0%, transparent 70%)',
              iconBg: 'rgba(78,138,94,0.22)',
              IconComponent: TrendingUp,
              iconColor: 'rgba(160,220,175,0.92)',
              taglineColor: 'rgba(145,212,165,0.70)',
            },
            3: {
              heroGradient: 'linear-gradient(148deg, #040A18 0%, #0E1E38 32%, #1A3660 68%, #2E5490 100%)',
              glow1: 'radial-gradient(ellipse, rgba(60,100,190,0.40) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(30,70,145,0.22) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(160,190,255,0.11) 0%, transparent 70%)',
              iconBg: 'rgba(60,100,190,0.22)',
              IconComponent: Moon,
              iconColor: 'rgba(170,200,255,0.92)',
              taglineColor: 'rgba(152,192,255,0.70)',
            },
            4: {
              heroGradient: 'linear-gradient(148deg, #100A22 0%, #281E52 32%, #42357A 68%, #6E62AA 100%)',
              glow1: 'radial-gradient(ellipse, rgba(130,112,210,0.40) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(100,85,175,0.22) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(210,195,255,0.11) 0%, transparent 70%)',
              iconBg: 'rgba(130,112,210,0.22)',
              IconComponent: Brain,
              iconColor: 'rgba(210,200,255,0.92)',
              taglineColor: 'rgba(198,188,255,0.70)',
            },
            5: {
              heroGradient: 'linear-gradient(148deg, #09110A 0%, #1A2E1C 32%, #2C4C2F 68%, #4E7252 100%)',
              glow1: 'radial-gradient(ellipse, rgba(78,114,82,0.40) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(50,90,55,0.22) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(130,190,140,0.11) 0%, transparent 70%)',
              iconBg: 'rgba(78,114,82,0.22)',
              IconComponent: Target,
              iconColor: 'rgba(155,205,162,0.92)',
              taglineColor: 'rgba(142,198,152,0.70)',
            },
            6: {
              heroGradient: 'linear-gradient(148deg, #180E00 0%, #402810 32%, #7A5418 68%, #B8840E 100%)',
              glow1: 'radial-gradient(ellipse, rgba(184,132,14,0.42) 0%, transparent 65%)',
              glow2: 'radial-gradient(ellipse, rgba(140,100,20,0.24) 0%, transparent 60%)',
              glow3: 'radial-gradient(ellipse, rgba(255,210,80,0.13) 0%, transparent 70%)',
              iconBg: 'rgba(184,132,14,0.22)',
              IconComponent: Star,
              iconColor: 'rgba(255,215,110,0.92)',
              taglineColor: 'rgba(255,210,96,0.72)',
            },
          };

          const cd = CHAPTER_DESIGNS[phase.num as keyof typeof CHAPTER_DESIGNS] ?? CHAPTER_DESIGNS[1]!;

          return (
            <motion.div
              key={selectedPhase}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.30, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                marginTop: '16px',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: dark
                  ? 'none'
                  : '0 4px 6px rgba(0,0,0,0.05), 0 14px 36px rgba(0,0,0,0.12), 0 28px 60px rgba(0,0,0,0.07)',
                border: dark ? '1px solid rgba(255,255,255,0.10)' : 'none',
              }}
            >
              {/* ── Hero gradient section ── */}
              <div style={{
                position: 'relative',
                background: cd.heroGradient,
                padding: '24px 22px 30px',
                overflow: 'hidden',
              }}>
                {/* Floating glow — top right */}
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: '-28px', right: '-28px',
                    width: '210px', height: '210px',
                    background: cd.glow1,
                    pointerEvents: 'none',
                  }}
                />
                {/* Floating glow — bottom left */}
                <motion.div
                  animate={{ y: [0, 8, 0], opacity: [0.4, 0.72, 0.4] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  style={{
                    position: 'absolute', bottom: '-18px', left: '10px',
                    width: '160px', height: '110px',
                    background: cd.glow2,
                    pointerEvents: 'none',
                  }}
                />
                {/* Ambient glow — centre */}
                <motion.div
                  animate={{ opacity: [0.3, 0.55, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: '220px', height: '140px',
                    background: cd.glow3,
                    pointerEvents: 'none',
                  }}
                />

                {/* Top row: month badge + status badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '22px', position: 'relative', zIndex: 1,
                }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.13em', textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.52)',
                    background: 'rgba(0,0,0,0.26)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.11)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                  }}>
                    Month {phase.num} of 6
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '10px', fontWeight: 700,
                    background: 'rgba(0,0,0,0.26)',
                    color: 'rgba(255,255,255,0.90)',
                    borderRadius: '20px', padding: '4px 12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.11)',
                  }}>
                    {phase.status === 'active' && (
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7FFFA0', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    {statusInfo.text}
                  </span>
                </div>

                {/* Chapter icon */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: cd.iconBg,
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                  position: 'relative', zIndex: 1,
                }}>
                  <cd.IconComponent size={22} color={cd.iconColor} strokeWidth={1.6} />
                </div>

                {/* Eyebrow */}
                <p style={{
                  fontSize: '10px', fontWeight: 700,
                  color: cd.taglineColor,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase' as const,
                  marginBottom: '8px',
                  position: 'relative', zIndex: 1,
                }}>
                  Chapter {phase.num} · {phase.journeyLabel}
                </p>

                {/* Chapter TITLE — visual hero */}
                <p style={{
                  fontSize: '30px', fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.06,
                  color: '#fff',
                  textShadow: '0 2px 18px rgba(0,0,0,0.24)',
                  marginBottom: '12px',
                  position: 'relative', zIndex: 1,
                }}>
                  {phase.title}
                </p>

                {/* Inspirational tagline */}
                <p style={{
                  fontSize: '13px', fontWeight: 400,
                  color: cd.taglineColor,
                  lineHeight: 1.60,
                  letterSpacing: '0.01em',
                  maxWidth: '270px',
                  position: 'relative', zIndex: 1,
                }}>
                  {phase.tagline}
                </p>
              </div>

              {/* ── Focus pills strip ── */}
              <div style={{
                background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : theme.tileBorder}`,
                padding: '16px 20px 18px',
              }}>
                <p style={{
                  fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.10em', textTransform: 'uppercase' as const,
                  color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.30)',
                  marginBottom: '11px',
                }}>
                  Your Focus This Chapter
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px' }}>
                  {phase.tiles.map((tile) => (
                    <div key={tile.label} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: dark ? 'rgba(255,255,255,0.07)' : theme.iconBg,
                      border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : theme.tileBorder}`,
                      borderRadius: '20px',
                      padding: '6px 12px',
                    }}>
                      <span style={{ fontSize: '14px', lineHeight: 1 }}>{tile.icon}</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: dark ? 'rgba(255,255,255,0.72)' : theme.accent,
                        letterSpacing: '0.01em',
                      }}>
                        {tile.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ---- Transformation Journey (Overview sub-section) ----
const DEMO_JOURNEY_PHOTOS = [
  { day: 1,  label: 'Day 1',   src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', caption: 'Starting the journey' },
  { day: 7,  label: 'Day 7',   src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80', caption: 'First week complete' },
  { day: 14, label: 'Day 14',  src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', caption: 'Two weeks in' },
];

const JOURNEY_MILESTONES = [
  { icon: '🏆', label: 'First Week Complete',    value: '7 days',       color: 'rgba(212,168,67,0.10)',  border: 'rgba(212,168,67,0.22)',  text: '#C49A26' },
  { icon: '🔥', label: '14-Day Streak',          value: '14 days',      color: 'rgba(200,96,74,0.08)',   border: 'rgba(200,96,74,0.20)',   text: 'var(--color-terracotta)' },
  { icon: '⚖️', label: 'First Kilogram Lost',   value: '−1.2 kg',      color: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.20)', text: 'var(--color-sage)' },
  { icon: '🚶', label: '50,000 Steps This Month', value: '50k steps',   color: 'rgba(123,104,238,0.08)', border: 'rgba(123,104,238,0.18)', text: '#7B68EE' },
];

function TransformationJourney() {
  const [uploads, setUploads] = useState<{ day: number; src: string }[]>([]);
  const [activeIdx, setActiveIdx] = useState(2); // default: most recent demo photo
  const fileRef = useRef<HTMLInputElement>(null);

  const allPhotos = [
    ...DEMO_JOURNEY_PHOTOS,
    ...uploads.map((u, i) => ({ day: 14 + i + 1, label: `Day ${14 + i + 1}`, src: u.src, caption: 'Today' })),
  ];
  const active = allPhotos[activeIdx] ?? allPhotos[allPhotos.length - 1]!;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDay = 14 + uploads.length + 1;
    const newUploads = Array.from(files).map((f, i) => ({ day: newDay + i, src: URL.createObjectURL(f) }));
    setUploads(prev => [...prev, ...newUploads]);
    setActiveIdx(allPhotos.length + newUploads.length - 1);
    e.target.value = '';
  };

  // Timeline: fixed 7 slots — Day 1, Month 1–6
  const timelineSlots = [
    { key: 'day1',    label: 'Day 1',    photoIdx: 0,    hasPhoto: allPhotos.length > 0,  uploadable: true  },
    { key: 'month1',  label: 'Month 1',  photoIdx: 1,    hasPhoto: allPhotos.length > 1,  uploadable: false },
    { key: 'month2',  label: 'Month 2',  photoIdx: 2,    hasPhoto: allPhotos.length > 2,  uploadable: true  },
    { key: 'month3',  label: 'Month 3',  photoIdx: null, hasPhoto: false,                 uploadable: false },
    { key: 'month4',  label: 'Month 4',  photoIdx: null, hasPhoto: false,                 uploadable: false },
    { key: 'month5',  label: 'Month 5',  photoIdx: null, hasPhoto: false,                 uploadable: false },
    { key: 'month6',  label: 'Month 6',  photoIdx: null, hasPhoto: false,                 uploadable: false },
  ];

  const futureOutcomes = [
    { icon: '⚡', label: 'Better Energy',     sub: 'Wake up ready to go' },
    { icon: '🌙', label: 'Improved Sleep',    sub: 'Rest that actually restores' },
    { icon: '⚖️', label: 'Healthier Weight', sub: 'Sustainable, not a crash' },
    { icon: '🔁', label: 'Stronger Habits',   sub: 'Choices that feel automatic' },
  ];

  return (
    <div>
      {/* ── SECTION 1: Cinematic Hero ── */}
      <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        {/* Background image — animated swap */}
        <AnimatePresence mode="wait">
          <motion.img
            key={active.src}
            src={active.src}
            alt={active.caption}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
          />
        </AnimatePresence>
        {/* Gradient layers */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.82) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,43,30,0.30) 0%, transparent 60%)' }} />

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 26px' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sparkles size={11} color="#F0C96A" />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0C96A', textTransform: 'uppercase' as const, letterSpacing: '0.11em' }}>
              Your Transformation
            </span>
          </div>
          {/* Hero headline */}
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '8px', textShadow: '0 1px 16px rgba(0,0,0,0.3)' }}>
            Your Success Story<br />Starts Here
          </h2>
          {/* Supporting copy */}
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, marginBottom: '18px', maxWidth: '280px' }}>
            Imagine yourself 6 months from now — more energy, better health, more confidence. The story you write today becomes the success story you celebrate tomorrow.
          </p>
          {/* CTAs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 18px',
                background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)',
                color: '#fff', border: 'none', borderRadius: '22px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(107,143,113,0.45)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 6px 20px rgba(107,143,113,0.55)'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 4px 16px rgba(107,143,113,0.45)'; }}
            >
              <Camera size={14} strokeWidth={2.5} />
              Capture Today's Win
            </button>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 18px',
                background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '22px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.24)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.16)'; }}
            >
              <Star size={14} strokeWidth={2.5} />
              Define My Goals
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Success Blueprint ── */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {/* Card header strip */}
          <div style={{
            padding: '18px 20px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '3px' }}>
                Your Success Blueprint
              </p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
                Define what success looks like.
              </p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212,168,67,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={18} color="#C49A26" />
            </div>
          </div>
          {/* Empty state */}
          <div style={{ padding: '24px 20px', textAlign: 'center' as const }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(107,143,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <BookOpen size={22} color="var(--color-sage)" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
              You haven&apos;t created your health blueprint yet.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '240px', margin: '0 auto 20px' }}>
              Set your goal, your target date, and the reason that will keep you going.
            </p>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '12px 22px',
              background: 'var(--color-ink)', color: '#fff',
              border: 'none', borderRadius: '22px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(28,43,30,0.18)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              <ArrowRight size={14} strokeWidth={2.5} />
              Create My Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Transformation Timeline ── */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '20px 20px 18px' }}>
          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '3px' }}>Visual Story</p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Transformation Timeline</p>
          </div>

          {/* Timeline row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '4px', gap: '0' }}>
            {timelineSlots.map((slot, i) => {
              const photo = slot.photoIdx !== null ? allPhotos[slot.photoIdx] : null;
              const isActiveSlot = slot.photoIdx === activeIdx;
              const isFilled = slot.hasPhoto && photo;
              return (
                <div key={slot.key} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                  {/* Connector */}
                  {i > 0 && (
                    <div style={{
                      width: '22px', height: '2px', marginTop: '34px', flexShrink: 0,
                      background: timelineSlots[i - 1]!.hasPhoto && isFilled
                        ? 'var(--color-sage)'
                        : 'var(--color-border)',
                    }} />
                  )}
                  <button
                    onClick={() => {
                      if (isFilled && slot.photoIdx !== null) setActiveIdx(slot.photoIdx);
                      else if (slot.uploadable) fileRef.current?.click();
                    }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', background: 'transparent', border: 'none', cursor: isFilled || slot.uploadable ? 'pointer' : 'default', padding: '0 2px' }}
                  >
                    {/* Circle */}
                    <div style={{
                      width: '68px', height: '68px', borderRadius: '50%', flexShrink: 0,
                      overflow: isFilled ? 'hidden' : 'visible',
                      border: isActiveSlot
                        ? '2.5px solid var(--color-sage)'
                        : isFilled ? '2px solid var(--color-sage-light)'
                        : slot.uploadable ? '2px dashed rgba(107,143,113,0.45)'
                        : '2px dashed var(--color-border)',
                      boxShadow: isActiveSlot ? '0 0 0 4px rgba(107,143,113,0.14)' : 'none',
                      background: isFilled ? 'transparent' : slot.uploadable ? 'rgba(107,143,113,0.05)' : 'rgba(0,0,0,0.025)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}>
                      {isFilled && photo ? (
                        <img src={photo.src} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : slot.uploadable ? (
                        <Camera size={20} color="var(--color-sage)" strokeWidth={1.5} />
                      ) : (
                        <Lock size={16} color="var(--color-border)" strokeWidth={1.5} />
                      )}
                      {/* Active ring label */}
                      {isActiveSlot && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-sage)', borderRadius: '20px', padding: '1px 6px' }}>
                          <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff' }}>NOW</span>
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: '9px', fontWeight: isActiveSlot ? 700 : 500,
                      color: isActiveSlot ? 'var(--color-sage)' : isFilled ? 'var(--color-ink)' : 'var(--color-muted)',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {slot.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic', lineHeight: 1.6, marginTop: '14px' }}>
            The changes may feel small today, but they become powerful when you look back.
          </p>
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px',
                background: 'var(--color-sage)', color: '#fff',
                border: 'none', borderRadius: '999px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(107,143,113,0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 6px 20px rgba(107,143,113,0.50)'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 4px 16px rgba(107,143,113,0.35)'; }}
            >
              <Camera size={14} strokeWidth={2.5} />
              Capture Today's Win
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Future Self Preview ── */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{
          borderRadius: '24px', overflow: 'hidden',
          background: 'linear-gradient(150deg, #22324A 0%, #2D4B72 100%)',
          padding: '22px 22px 20px',
          boxShadow: '0 4px 28px rgba(34,50,74,0.28)',
          position: 'relative',
        }}>
          {/* Orb */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(91,124,250,0.14)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <Sparkles size={12} color="#8FA4FF" />
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(143,164,255,0.80)', textTransform: 'uppercase' as const, letterSpacing: '0.11em' }}>
                Meet Your Future Self
              </p>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '6px' }}>
              Stay consistent and see<br />what becomes possible.
            </p>
            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '23%', background: 'linear-gradient(90deg, #5B7CFA 0%, #8FA4FF 100%)', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>23% complete</span>
            </div>
            {/* Outcomes grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              {futureOutcomes.map((o, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.25 }}
                  style={{
                    background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '13px 12px',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <span style={{ fontSize: '20px', display: 'block', marginBottom: '7px' }}>{o.icon}</span>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '2px' }}>{o.label}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{o.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: Journey Destination Card ── */}
      <div style={{ padding: '16px 24px 28px' }}>
        <a
          href="/journey"
          style={{
            display: 'block',
            background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
            borderRadius: '24px', padding: '24px 22px',
            textDecoration: 'none',
            boxShadow: '0 6px 32px rgba(28,43,30,0.22)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 10px 40px rgba(28,43,30,0.30)'; }}
          onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 6px 32px rgba(28,43,30,0.22)'; }}
        >
          {/* Orb */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(107,143,113,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <BookOpen size={12} color="rgba(168,197,172,0.80)" />
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(168,197,172,0.80)', textTransform: 'uppercase' as const, letterSpacing: '0.11em' }}>
                My Transformation Story
              </p>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '10px' }}>
              View My Complete<br />Journey
            </p>
            {/* Feature list */}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px', marginBottom: '20px' }}>
              {['Photos', 'Milestones', 'Achievements', 'Coach Notes'].map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)',
                  borderRadius: '20px', padding: '4px 10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            {/* CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                fontSize: '14px', fontWeight: 700, color: '#fff',
              }}>
                Enter your journey
                <ArrowRight size={16} color="#A8C5AC" />
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {allPhotos.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.20)', marginLeft: i > 0 ? '-8px' : '0' }}>
                    <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// ---- Journey Indicator — Desktop premium variant (desktop-only, mobile JourneyIndicator unchanged) ----
function JourneyIndicatorDesktop({ selectedPhase, onPhaseChange }: { selectedPhase: number; onPhaseChange: (n: number) => void }) {
  const phase = PHASE_DATA[selectedPhase - 1]!;

  const statusLabel = (status: 'completed' | 'active' | 'locked') => {
    if (status === 'completed') return { text: 'Completed' };
    if (status === 'active') return { text: 'In Progress' };
    return { text: 'Locked' };
  };

  type ChapterDesign = {
    heroGradient: string; glow1: string; glow2: string; glow3: string;
    iconBg: string; IconComponent: React.ElementType; iconColor: string; taglineColor: string;
  };
  const CHAPTER_DESIGNS_DT: Record<number, ChapterDesign> = {
    1: { heroGradient: 'linear-gradient(148deg, #2A1400 0%, #6B3810 32%, #B07828 68%, #D4A84A 100%)', glow1: 'radial-gradient(ellipse, rgba(210,168,74,0.45) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(176,120,40,0.26) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(255,215,100,0.14) 0%, transparent 70%)', iconBg: 'rgba(210,168,74,0.22)', IconComponent: Sparkles, iconColor: 'rgba(255,225,150,0.92)', taglineColor: 'rgba(255,218,130,0.72)' },
    2: { heroGradient: 'linear-gradient(148deg, #071710 0%, #163326 32%, #2A5C3C 68%, #4E8A5E 100%)', glow1: 'radial-gradient(ellipse, rgba(78,138,94,0.44) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(42,92,60,0.24) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(140,210,158,0.12) 0%, transparent 70%)', iconBg: 'rgba(78,138,94,0.22)', IconComponent: TrendingUp, iconColor: 'rgba(160,220,175,0.92)', taglineColor: 'rgba(145,212,165,0.70)' },
    3: { heroGradient: 'linear-gradient(148deg, #040A18 0%, #0E1E38 32%, #1A3660 68%, #2E5490 100%)', glow1: 'radial-gradient(ellipse, rgba(60,100,190,0.44) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(30,70,145,0.24) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(160,190,255,0.12) 0%, transparent 70%)', iconBg: 'rgba(60,100,190,0.22)', IconComponent: Moon, iconColor: 'rgba(170,200,255,0.92)', taglineColor: 'rgba(152,192,255,0.70)' },
    4: { heroGradient: 'linear-gradient(148deg, #100A22 0%, #281E52 32%, #42357A 68%, #6E62AA 100%)', glow1: 'radial-gradient(ellipse, rgba(130,112,210,0.44) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(100,85,175,0.24) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(210,195,255,0.12) 0%, transparent 70%)', iconBg: 'rgba(130,112,210,0.22)', IconComponent: Brain, iconColor: 'rgba(210,200,255,0.92)', taglineColor: 'rgba(198,188,255,0.70)' },
    5: { heroGradient: 'linear-gradient(148deg, #09110A 0%, #1A2E1C 32%, #2C4C2F 68%, #4E7252 100%)', glow1: 'radial-gradient(ellipse, rgba(78,114,82,0.44) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(50,90,55,0.24) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(130,190,140,0.12) 0%, transparent 70%)', iconBg: 'rgba(78,114,82,0.22)', IconComponent: Target, iconColor: 'rgba(155,205,162,0.92)', taglineColor: 'rgba(142,198,152,0.70)' },
    6: { heroGradient: 'linear-gradient(148deg, #180E00 0%, #402810 32%, #7A5418 68%, #B8840E 100%)', glow1: 'radial-gradient(ellipse, rgba(184,132,14,0.45) 0%, transparent 65%)', glow2: 'radial-gradient(ellipse, rgba(140,100,20,0.26) 0%, transparent 60%)', glow3: 'radial-gradient(ellipse, rgba(255,210,80,0.14) 0%, transparent 70%)', iconBg: 'rgba(184,132,14,0.22)', IconComponent: Star, iconColor: 'rgba(255,215,110,0.92)', taglineColor: 'rgba(255,210,96,0.72)' },
  };
  const cd = CHAPTER_DESIGNS_DT[phase.num as keyof typeof CHAPTER_DESIGNS_DT] ?? CHAPTER_DESIGNS_DT[1]!;
  const theme = MONTH_THEMES[phase.num as keyof typeof MONTH_THEMES];
  const statusInfo = statusLabel(phase.status);

  return (
    <div>
      {/* ── Premium stepper ── */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {PHASE_DATA.map((step, i) => {
          const isSel = selectedPhase === step.num;
          const isComp = step.status === 'completed';
          const isAct = step.status === 'active';
          const isLock = step.status === 'locked';
          return (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
              <button
                onClick={() => onPhaseChange(step.num)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >
                <motion.div
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    width: isSel ? '44px' : isComp || isAct ? '34px' : '28px',
                    height: isSel ? '44px' : isComp || isAct ? '34px' : '28px',
                    borderRadius: '50%',
                    background: isSel ? 'var(--color-ink)' : isComp ? 'var(--color-sage)' : isAct ? 'var(--color-ink)' : 'transparent',
                    border: isLock && !isSel ? '2px solid var(--color-border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: isSel
                      ? '0 0 0 6px rgba(28,43,30,0.09), 0 4px 18px rgba(28,43,30,0.24)'
                      : isAct && !isSel ? '0 0 0 4px rgba(28,43,30,0.07)' : 'none',
                    transition: 'all 0.22s ease',
                  }}
                >
                  {isComp
                    ? <svg width="12" height="9" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span style={{ fontSize: isSel ? '14px' : '10px', fontWeight: 800, color: isSel || isAct ? '#fff' : 'var(--color-muted)' }}>{step.num}</span>
                  }
                </motion.div>
                <span style={{
                  fontSize: '10px', fontWeight: isSel || isAct ? 700 : 500,
                  color: isSel ? 'var(--color-ink)' : isComp ? 'var(--color-sage)' : isAct ? 'var(--color-ink)' : 'var(--color-muted)',
                  letterSpacing: '0.02em', whiteSpace: 'nowrap' as const,
                }}>{step.label}</span>
              </button>
              {i < 5 && (
                <div style={{
                  flex: 1, marginBottom: '26px', margin: '0 6px 26px',
                  height: isComp ? '2.5px' : '2px', borderRadius: '2px',
                  background: isComp
                    ? 'linear-gradient(90deg, var(--color-sage), var(--color-sage-light))'
                    : 'var(--color-border)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Chapter card — premium desktop sizing ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPhase}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.97 }}
          transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            marginTop: '22px',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 6px 14px rgba(0,0,0,0.07), 0 24px 56px rgba(0,0,0,0.17), 0 48px 88px rgba(0,0,0,0.07)',
          }}
        >
          {/* Hero — taller on desktop */}
          <div style={{
            position: 'relative',
            background: cd.heroGradient,
            padding: '40px 40px 48px',
            overflow: 'hidden',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <motion.div animate={{ y: [0, -14, 0], opacity: [0.55, 1, 0.55] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-44px', right: '-44px', width: '340px', height: '340px', background: cd.glow1, pointerEvents: 'none' }} />
            <motion.div animate={{ y: [0, 10, 0], opacity: [0.38, 0.70, 0.38] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{ position: 'absolute', bottom: '-28px', left: '20px', width: '260px', height: '180px', background: cd.glow2, pointerEvents: 'none' }} />
            <motion.div animate={{ opacity: [0.22, 0.48, 0.22] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '380px', height: '240px', background: cd.glow3, pointerEvents: 'none' }} />

            {/* Top badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.52)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '5px 14px' }}>
                Month {phase.num} of 6
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.90)', borderRadius: '20px', padding: '5px 14px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {phase.status === 'active' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7FFFA0', flexShrink: 0, display: 'inline-block' }} />}
                {statusInfo.text}
              </span>
            </div>

            {/* Bottom content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: cd.iconBg, border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <cd.IconComponent size={30} color={cd.iconColor} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: cd.taglineColor, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>
                Chapter {phase.num} · {phase.journeyLabel}
              </p>
              <p style={{ fontSize: '44px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#fff', textShadow: '0 2px 28px rgba(0,0,0,0.30)', marginBottom: '16px' }}>
                {phase.title}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 400, color: cd.taglineColor, lineHeight: 1.68, letterSpacing: '0.01em', maxWidth: '400px' }}>
                {phase.tagline}
              </p>
            </div>
          </div>

          {/* Focus pills */}
          <div style={{ background: '#fff', borderTop: `1px solid ${theme.tileBorder}`, padding: '22px 40px 28px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' as const, color: 'rgba(0,0,0,0.26)', marginBottom: '14px' }}>
              Your Focus This Chapter
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '9px' }}>
              {phase.tiles.map(tile => (
                <div key={tile.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: theme.iconBg, border: `1px solid ${theme.tileBorder}`, borderRadius: '24px', padding: '9px 18px' }}>
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{tile.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: theme.accent, letterSpacing: '0.01em' }}>{tile.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---- Overview Content ----
function OverviewContent() {
  const [dtJourneyPhase, setDtJourneyPhase] = useState(2);
  const [dtStoryPhotos, setDtStoryPhotos] = useState<string[]>([]);
  const [dtStoryActiveSlot, setDtStoryActiveSlot] = useState(2);
  const dtStoryRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState('Fitness');
  const [showSetup, setShowSetup] = useState(true);
  const [habitsChecked, setHabitsChecked] = useState([false, false, false, false, false]);

  const handleDtStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setDtStoryPhotos(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  const filters = ['Fitness', 'Nutrition', 'Sleep', 'Stress', 'Gut Health'];

  const habits = [
    'Follow the Plate Model at lunch',
    'Walk 6,000–8,000 steps',
    'Do beginner resistance training',
    'Avoid sugary drinks',
    'Log meals with protein rating',
  ];

  const allHabitsDone = habitsChecked.every(Boolean);

  const questions = [
    'How can I hit 7,000 steps without a gym?',
    'What does the Indian Plate Model mean for me?',
    'How does sleep affect my metabolism?',
    'What are the best probiotic foods to add this month?',
  ];

  // Principle 1: time-based greeting
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const daySubtitle =
    day === 1 ? "New week, fresh start. Let's build on last week's momentum." :
    day === 3 ? "Halfway through the week — you're doing great." :
    day === 5 ? "Strong finish to the week ahead." :
    "Every small step counts. Let's make today count.";

  return (
    <div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.25) } 50% { box-shadow: 0 0 0 6px rgba(107,143,113,0) } }

        /* Mobile: show mobile layout, hide desktop */
        .ov-mobile-only { display: flex; flex-direction: column; gap: 0; }
        .ov-desktop-only { display: none; }

        /* Mobile-only spacing between JourneyIndicator and TransformationJourney */
        @media (max-width: 1023px) {
          .ov-s2-journey { padding-bottom: 28px !important; }
        }

        /* Desktop: hide mobile layout, show desktop */
        @media (min-width: 1024px) {
          .ov-mobile-only { display: none !important; }
          .ov-desktop-only { display: block !important; }
        }

        /* Desktop internals */
        @media (min-width: 1024px) {
          .ov-dt-page { max-width: 1600px; margin: 0 auto; }

          /* ── HERO: full-width cinematic ── */
          .ov-dt-hero {
            height: 560px;
            position: relative;
            overflow: hidden;
            border-radius: 0 0 24px 24px;
          }
          .ov-dt-hero-inner {
            display: flex;
            height: 100%;
            align-items: stretch;
            position: relative;
            z-index: 1;
          }
          .ov-dt-hero-left {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 0 64px 60px 64px;
            gap: 18px;
            max-width: 760px;
          }

          /* Full-width body */
          .ov-dt-body { display: block; padding: 0 48px; }
          .ov-dt-main { display: flex; flex-direction: column; gap: 0; min-width: 0; }
          .ov-dt-section { margin: 0 -48px; padding: 72px 48px; }
          .ov-dt-section-warm { background: #EEF3EF; }
          .ov-dt-section-dark { background: #1A2B1C; }
          .ov-dt-section-white { background: #ffffff; }
          .ov-dt-section-stone { background: #F0EDE6; }
          .ov-dt-bleed { margin: 0 -48px; }
          /* Metric grid inside main */
          .ov-dt-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .ov-dt-metrics > * { min-width: 0; flex: unset; width: unset; }
          /* Programme split: habits | toolkit */
          .ov-dt-prog-split { display: grid; grid-template-columns: 55fr 45fr; gap: 24px; align-items: start; }
          /* Stories grid */
          .ov-dt-stories-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          /* Topics + Discover split */
          .ov-dt-topics-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
          /* Article cards grid */
          .ov-dt-articles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .ov-dt-articles > * { width: unset !important; }
        }
        @media (min-width: 1400px) {
          .ov-dt-hero { height: 620px; }
          .ov-dt-hero-left { padding: 0 80px 72px 80px; max-width: 840px; }
          .ov-dt-body { padding: 72px 64px 0 64px; }
          .ov-dt-section { margin: 0 -64px; padding: 80px 64px; }
          .ov-dt-bleed { margin: 0 -64px; }
        }

        @keyframes float-card { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes progress-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.3); } 50% { box-shadow: 0 0 16px 4px rgba(107,143,113,0.15); } }

        /* ── Journey Workspace desktop grid ── */
        @media (min-width: 1024px) {
          .ov-dt-journey-workspace {
            display: grid;
            grid-template-columns: 65fr 35fr;
            gap: 32px;
            align-items: start;
          }
          .ov-dt-journey-left {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .ov-dt-journey-right {
            position: sticky;
            top: 88px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          /* ── Story Section desktop grid (70/30) ── */
          .ov-dt-story-workspace {
            display: grid;
            grid-template-columns: 70fr 30fr;
            gap: 28px;
            align-items: start;
          }
          .ov-dt-story-left {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .ov-dt-story-right {
            position: sticky;
            top: 88px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          /* ── Health Command Center grids ── */
          .ov-dt-cmd-toolkit-full { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
          .ov-dt-cmd-row1 {
            display: grid;
            grid-template-columns: 60fr 40fr;
            gap: 24px;
            align-items: start;
            margin-bottom: 24px;
          }
          .ov-dt-cmd-row2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
          .ov-dt-cmd-snapshot {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .ov-dt-cmd-toolkit {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT — unchanged, hidden ≥1024px
      ══════════════════════════════════════ */}
      <div className="ov-mobile-only">

      {/* ── Desktop placeholder (keeps ov-page ref harmless) ── */}
      <div className="ov-page" style={{ display: 'none' }} />

      {/* S1: Hero — cinematic full-width split */}
      <div className="ov-hero" style={{
        position: 'relative',
        height: '290px',
        overflow: 'hidden',
      }}>
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80"
          alt="Wellness background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Two-layer gradient: bottom-up dark + subtle top tint */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)' }} />
        {/* Desktop right-side gradient for snapshot panel */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Shared inner wrapper — mobile: contents, desktop: grid split */}
        <div className="ov-hero-split-inner" style={{ position: 'relative', zIndex: 1, height: '100%' }}>

          {/* LEFT: greeting + context */}
          <div className="ov-hero-left-col" style={{
            position: 'relative',
            zIndex: 1,
            padding: '28px 28px 24px',
            color: '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '6px',
          }}>
            {/* Programme context pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start', marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A', animation: 'pulseRing 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>Day 14 of 30 · Build Healthy Habits</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
              {greeting}, Priya
            </h1>
            <p className="ov-hero-subtitle" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0, maxWidth: '320px' }}>
              {daySubtitle}
            </p>
            {/* Health Goals row */}
            <div style={{ marginTop: '10px', marginBottom: '2px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Your Health Goal</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Goal 1: Reverse Diabetes */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '999px',
                    padding: '5px 12px 5px 6px',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(200,96,74,0.22)', border: '1px solid rgba(200,96,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}
                  >🔥</motion.div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Reverse Diabetes</span>
                </motion.div>
                {/* Goal 2: Lose Weight */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '999px',
                    padding: '5px 12px 5px 6px',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(107,143,113,0.22)', border: '1px solid rgba(107,143,113,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}
                  >⚖️</motion.div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Lose Weight</span>
                </motion.div>
              </div>
            </div>
            {/* Inline month progress bar */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', maxWidth: '200px' }}>
                <div style={{ height: '100%', width: '47%', background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', letterSpacing: '0.02em' }}>47% of Month 2 complete</p>
            </div>
          </div>

          {/* RIGHT: desktop-only transformation snapshot panel */}
          <div className="ov-hero-right-panel" style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '32px 40px 32px 32px',
            gap: '16px',
          }}>
            {/* Panel heading */}
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Your snapshot</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Month 2 · Day 14</p>
            </div>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: '14', unit: 'day streak', color: '#F0C96A' },
                { value: '82%', unit: 'habit score', color: '#A8C5AC' },
                { value: '−1.2 kg', unit: 'lost so far', color: '#A8C5AC' },
                { value: '23%', unit: 'programme', color: 'rgba(255,255,255,0.7)' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                }}>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.unit}</p>
                </div>
              ))}
            </div>
            {/* Subtle encouragement */}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic' }}>
              You are actively becoming a healthier version of yourself.
            </p>
          </div>

        </div>{/* end ov-hero-split-inner */}
      </div>

      {/* ── Desktop body wrapper ── */}
      <div className="ov-body" style={{ padding: '0' }}>

      {/* S2: Journey Roadmap — full width, premium breathing room */}
      <div className="ov-s2-journey" style={{ padding: '20px 28px 0', background: 'var(--color-surface)' }}>
        <JourneyIndicator />
      </div>

      {/* S3: Transformation Story 70% | Journey Snapshot 30% */}
      <div className="ov-s3-grid">

        {/* LEFT: Transformation Journey (full component, no change) */}
        <div>
          <TransformationJourney />
        </div>

        {/* RIGHT: Journey Snapshot — desktop only, replaces old sidebar */}
        <div className="ov-s3-snapshot" style={{
          display: 'none',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px 40px 28px 0',
          alignSelf: 'start',
          position: 'sticky',
          top: '112px',
        }}>
          {/* Coach card */}
          <div style={{
            background: 'linear-gradient(160deg, #1C2B1E 0%, #2A4030 100%)',
            borderRadius: '24px', padding: '24px 22px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(28,43,30,0.22)',
          }}>
            <div style={{ position: 'absolute', top: '-24px', right: '-16px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '14px' }}>Your Coach</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(168,197,172,0.30)' }}>
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#4ADE80', border: '2px solid #1C2B1E' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Dr. Ananya Rao</p>
                <p style={{ fontSize: '11px', color: 'rgba(168,197,172,0.7)' }}>Next session: Thu Jun 12</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '16px' }}>
              &ldquo;Your consistency this week is exceptional. Keep building on it.&rdquo;
            </p>
            <a href="/coach/message" style={{
              display: 'block', padding: '11px',
              background: 'rgba(107,143,113,0.22)', border: '1px solid rgba(107,143,113,0.3)',
              borderRadius: '14px', color: '#A8C5AC', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', textAlign: 'center' as const,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(107,143,113,0.32)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(107,143,113,0.22)'; }}
            >Message Coach</a>
          </div>

          {/* Programme progress */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '14px' }}>Momentum</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '🔥 Day Streak', value: '14 days', bar: 47, color: 'var(--color-gold)' },
                { label: '✅ Habit Score', value: '82%', bar: 82, color: 'var(--color-sage)' },
                { label: '⚖️ Lost So Far', value: '3 kg', bar: 60, color: 'var(--color-terracotta)' },
                { label: '🚶 Steps Today', value: '5,240', bar: 74, color: '#7B68EE' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink)', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: s.color }}>{s.value}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.bar}%`, background: s.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next milestone */}
          <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '16px', padding: '16px 18px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#C49A26', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>Next Milestone</p>
            <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '4px' }}>Complete Month 2</p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>16 days remaining · Keep your 14-day streak alive</p>
          </div>

          {/* View complete journey */}
          <a href="/journey" style={{
            display: 'block', textDecoration: 'none',
            background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
            borderRadius: '20px', padding: '20px 18px',
            boxShadow: '0 4px 20px rgba(28,43,30,0.20)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 8px 32px rgba(28,43,30,0.30)'; }}
          onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 4px 20px rgba(28,43,30,0.20)'; }}
          >
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(168,197,172,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>My Transformation Story</p>
            <p style={{ fontSize: '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>View Your Complete Journey →</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Photos · Milestones · Achievements · Coach Notes</p>
          </a>
        </div>

      </div>{/* end S3 grid */}

      {/* BiomarkerProgressShowcase — mobile only, after TransformationJourney */}
      <BiomarkerProgressShowcase />

      {/* Nutrition Strategy — mobile Overview, after biomarkers, before Today's Focus */}
      <div style={{ padding: '20px 24px 0' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '10px' }}>Your Nutrition</p>
        <NutritionStrategyCard />
      </div>

      {/* S4: Momentum Row — Today's Focus | Coach Message (desktop 50/50) */}
      <div className="ov-s4-grid" style={{ padding: '0' }}>
        <div>

      {/* Section B: Today's Focus */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)',
          borderRadius: '20px',
          padding: '22px 24px',
          boxShadow: '0 4px 24px rgba(28,43,30,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <Target size={14} color="#F0C96A" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0C96A', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                  Your focus for today
                </span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Hit 7,000 steps before dinner
              </p>
              {/* Progress bar */}
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ height: '100%', width: '74%', background: 'linear-gradient(90deg, #D4A843 0%, #F0C96A 100%)', borderRadius: '3px' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>74% · 1,760 steps to go</p>
            </div>
            {/* Step count */}
            <div style={{ textAlign: 'center' as const, flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 16px' }}>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#F0C96A', letterSpacing: '-0.03em', lineHeight: 1 }}>5,240</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontWeight: 500 }}>/ 7,000 steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Finish setting up */}
      {showSetup && (
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{
            background: 'rgba(212,168,67,0.06)',
            border: '1px solid rgba(212,168,67,0.25)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '2px' }}>
                One last thing to unlock your full journey
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Upload your baseline labs so Dr. Ananya can personalise your insights
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '8px 16px', background: 'var(--color-ink)', color: '#fff',
                border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>
                <Plus size={11} /> Upload labs
              </button>
              <button onClick={() => setShowSetup(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-muted)', fontSize: '16px', lineHeight: 1 }}>×</button>
            </div>
          </div>
        </div>
      )}

        </div>{/* end S4 focus left col */}

        {/* S4 RIGHT: Coach Message (desktop) */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            background: 'linear-gradient(160deg, #1C2B1E 0%, #2A4030 100%)',
            borderRadius: '24px', padding: '28px 26px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(28,43,30,0.20)',
            height: '100%', boxSizing: 'border-box' as const,
          }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '18px' }}>Message from your coach</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(168,197,172,0.35)' }}>
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#4ADE80', border: '2px solid #1C2B1E' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Dr. Ananya Rao</p>
                  <p style={{ fontSize: '12px', color: 'rgba(168,197,172,0.7)' }}>Your Health Coach · Available now</p>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, marginBottom: '22px' }}>
                Priya, I noticed you haven&apos;t logged lunch the past 3 days. Try setting a midday reminder — even a quick log takes 30 seconds and keeps your streak alive 💚
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="/coach/message" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '11px 22px',
                  background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)',
                  color: '#fff', border: 'none', borderRadius: '22px',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(107,143,113,0.40)',
                }}>
                  Reply to Dr. Ananya <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>{/* end S4 grid */}

      {/* S5: Performance 65% | Insights 35% */}
      <div className="ov-s5-grid" style={{ padding: '0' }}>
        <div>

      {/* Section D: Health Overview */}
      <div className="ov-mobile-metrics" style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Your performance today</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
              Health Overview
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', paddingBottom: '2px' }}>Updated just now</span>
        </div>

        <div className="ov-metrics-carousel" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          <MetricCard
            title="Steps"
            badge="Poor"
            badgeType="poor"
            description="You're 1,760 steps away from today's goal — a 15-min walk will get you there"
            bars={[3, 5, 4, 6, 5, 3, 5]}
            barColor="var(--color-terracotta)"
            mainValue="5,240 steps"
            comparison="−1,760 vs goal"
            comparisonColor="#DC2626"
            encouragement="A short walk after lunch would close this gap"
          />
          <MetricCard
            title="Sleep"
            badge="Fair"
            badgeType="fair"
            description="You were 1 hour short last night. An earlier bedtime tonight will help"
            bars={[7, 6, 8, 7, 6, 7, 6]}
            barColor="#7B68EE"
            mainValue="6.5 hrs"
            comparison="−1 hr vs target"
            comparisonColor="#D97706"
            encouragement="Try a 10pm screen curfew tonight"
          />
          <MetricCard
            title="Nutrition"
            badge="Good"
            badgeType="good"
            description="Great start! Lunch and dinner still to log"
            bars={[3, 2, 3, 3, 2, 3, 1]}
            barColor="var(--color-sage)"
            mainValue="1/3 meals"
            comparison="+2 meals to log today"
            comparisonColor="#16A34A"
            encouragement="You're on a roll — keep it going at lunch!"
          />
          {/* View Your Progress nav card */}
          <a
            href="/progress"
            style={{
              minWidth: '200px',
              flex: '0 0 200px',
              background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(28,43,30,0.18)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168,197,172,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#A8C5AC" />
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>
                View Your Progress
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                Track biomarker improvements, health metrics and transformation milestones.
              </p>
            </div>
          </a>
        </div>
      </div>

        </div>{/* end S5 left (Health Overview) */}

        {/* S5 RIGHT: Personal Patterns — desktop only */}
        <div style={{ padding: '28px 0 0' }}>
          <div style={{ padding: '0 24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Insights from your data</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Your Patterns</h2>
          </div>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '😴', color: 'var(--color-sage)', label: 'Sleep correlation', insight: 'You sleep 45 min longer on days you walk 7,000+ steps' },
              { icon: '⚡', color: '#D4A843', label: 'Best days', insight: 'Your best logged days are Tuesdays and Thursdays' },
              { icon: '🥗', color: 'var(--color-terracotta)', label: 'Nutrition pattern', insight: 'You log meals more consistently when you prep the night before' },
              { icon: '🔥', color: '#7B68EE', label: 'Streak insight', insight: 'Your streak never broke on days you logged before 9am' },
            ].map((p, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '16px 18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: p.color, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }}>{p.label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.55 }}>{p.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>{/* end S5 right (Patterns) */}

      </div>{/* end S5 grid */}

      {/* Section D2: Personal Patterns — mobile only */}
      <div className="ov-mobile-patterns" style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Discovered from your data</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Your personal patterns</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(107,143,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={16} color="var(--color-sage)" />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }}>Sleep correlation</p>
              <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.5, fontWeight: 500 }}>
                You sleep <strong>45 min longer</strong> on days you walk 7,000+ steps
              </p>
            </div>
          </div>
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={16} color="#D4A843" />
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#D4A843', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }}>Best days</p>
              <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.5, fontWeight: 500 }}>
                Your <strong>best logged days</strong> are Tuesdays and Thursdays
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* S6: Programme Workspace 60% | Toolkit 40% */}
      <div className="ov-s6-outer">
      <div className="ov-prog-community-grid" style={{ padding: '0' }}>
        <div>

      {/* Section E: Programme Workflows */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Month 2 · Build Healthy Habits</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Your Health Programme
            </h2>
            {/* Principle 9: social proof */}
            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              👥 <strong style={{ color: 'var(--color-sage)' }}>847 members</strong> are on Month 2 this week
            </p>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '8px 16px',
            border: '1.5px solid var(--color-border)',
            borderRadius: '20px',
            background: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-ink)',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Plus size={12} />
            Log activity
          </button>
        </div>

        {/* Desktop inner split: habits LEFT, toolkit RIGHT */}
        <div className="ov-prog-inner-split">

          {/* Habits card */}
          <div>
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>Today&apos;s Habits</p>
              <span style={{
                background: 'rgba(212,168,67,0.1)',
                color: '#C49A26',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '20px',
                padding: '4px 12px',
              }}>
                🔥 14-day streak
              </span>
            </div>

            {/* All done celebration banner */}
            {allHabitsDone && (
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #16A34A',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '14px',
                animation: 'slideDown 0.3s ease',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>
                  You crushed it today! All habits done. 🎉
                </p>
                <p style={{ fontSize: '12px', color: '#16A34A', lineHeight: 1.4 }}>
                  That&apos;s 15 days in a row. You&apos;re building something real.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {habits.map((habit, i) => (
                <button
                  key={i}
                  onClick={() => setHabitsChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${habitsChecked[i] ? 'var(--color-sage)' : 'var(--color-border)'}`,
                    background: habitsChecked[i] ? 'var(--color-sage)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}>
                    {habitsChecked[i] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: habitsChecked[i] ? 'var(--color-muted)' : 'var(--color-ink)',
                    textDecoration: habitsChecked[i] ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}>
                    {habit}
                  </span>
                </button>
              ))}
            </div>
          </div>
          </div>{/* end habits left */}

          {/* Workflow toolkit right */}
          <div>
          <div className="ov-workflow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80"
              icon={CheckCircle2}
              title="Habit Tracker"
              description="Log your daily habits and build lasting routines"
            />
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
              icon={UtensilsCrossed}
              title="Meal Logger"
              description="Track meals using the Indian Plate Model"
            />
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80"
              icon={Footprints}
              title="Steps & Activity"
              description="Monitor daily movement and active minutes"
            />
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&q=80"
              icon={Moon}
              title="Sleep Tracker"
              description="Analyse sleep quality and recovery each night"
            />
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80"
              icon={Brain}
              title="Mindfulness"
              description="Daily breathing exercises and stress management"
            />
            <WorkflowCard
              imgSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80"
              icon={FlaskConical}
              title="Progress & Labs"
              description="Track biomarkers and review lab results over time"
            />
          </div>
          </div>{/* end toolkit right */}

        </div>{/* end ov-prog-inner-split */}
      </div>

        </div>{/* end programme left col */}

        {/* RIGHT: Member Success Stories (desktop) */}
        <div style={{ padding: '28px 0 0' }}>
          <div style={{ padding: '0 24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>People like you</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Member Wins</h2>
          </div>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80', name: 'Meera S.', badge: 'Month 3 ✓', headline: 'Lost 4kg and reversed pre-diabetes in 3 months', stats: '−4 kg · −5 cm waist · HbA1c 5.6' },
              { img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', name: 'Rajesh K.', badge: 'Month 6 ✓', headline: 'Completed 6 months — lost 8kg and came off medication', stats: '−8 kg · BP 120/80 · Off meds' },
              { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', name: 'Sunita P.', badge: 'Month 2 ✓', headline: 'Two weeks in and already sleeping better', stats: '+1.2 hrs sleep · 7k steps · 14-day streak' },
            ].map((story, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'stretch', height: '100px',
              }}>
                <img src={story.img} alt={story.name} style={{ width: '90px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(22,163,74,0.85)', borderRadius: '20px', padding: '2px 7px' }}>{story.badge}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>{story.name}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.4, marginBottom: '4px', fontWeight: 600 }}>{story.headline}</p>
                  <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>{story.stats}</p>
                </div>
              </div>
            ))}
            <a href="/community" style={{
              display: 'block', padding: '12px',
              background: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)',
              borderRadius: '14px', color: '#A8C5AC',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const,
            }}>View All Stories →</a>
          </div>
        </div>{/* end community right col — hidden on desktop */}
      </div>{/* end prog-community grid */}
      </div>{/* end S6 outer */}

      {/* S8: Discover + Education — desktop 50/50 */}
      <div className="ov-s8-grid" style={{ padding: '0' }}>
        <div>

      {/* Section F: Explore Health Topics */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Guided learning</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Explore Health Topics</h2>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: '20px',
                border: `1.5px solid ${activeFilter === f ? 'var(--color-ink)' : 'var(--color-border)'}`,
                background: activeFilter === f ? 'var(--color-ink)' : '#fff',
                color: activeFilter === f ? '#fff' : 'var(--color-ink)',
                fontSize: '13px',
                fontWeight: activeFilter === f ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {questions.map((q, i) => (
            <button
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: i === 0 ? '12px 12px 4px 4px' : i === questions.length - 1 ? '4px 4px 12px 12px' : '4px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                marginBottom: i < questions.length - 1 ? '2px' : '0',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--color-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BarChart3 size={13} color="var(--color-sage)" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.4 }}>{q}</span>
              <ChevronRight size={14} color="var(--color-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

        </div>{/* end S8 topics left col */}

        {/* S8 RIGHT: Discover articles (desktop) */}
        <div style={{ padding: '28px 0 0' }}>
          <div style={{ padding: '0 24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Editorial</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>Discover</h2>
          </div>
          <div className="ov-articles-wrap" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', padding: '0 24px' }}>
            <ArticleCard
              imgSrc="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80"
              title="Why walking after meals helps blood sugar"
              sources="4 sources"
            />
            <ArticleCard
              imgSrc="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
              title="The Indian Plate Model explained"
              sources="6 sources"
            />
          </div>
        </div>{/* end S8 right col */}
      </div>{/* end S8 grid */}

      </div>{/* end ov-body desktop wrapper */}

      {/* Member Success Stories — mobile only (hidden on desktop where grid version shows above) */}
      <div className="ov-mobile-stories" style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>People like you</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Member Success Stories</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {[
            {
              img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
              name: 'Meera S.',
              badge: 'Month 3 ✓',
              headline: 'Lost 4kg and reversed pre-diabetes in 3 months',
              stats: [{ label: '−4 kg', sub: 'weight' }, { label: '−5 cm', sub: 'waist' }, { label: '5.6', sub: 'HbA1c' }],
            },
            {
              img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
              name: 'Rajesh K.',
              badge: 'Month 6 ✓',
              headline: 'Completed 6 months — lost 8kg and came off medication',
              stats: [{ label: '−8 kg', sub: 'weight' }, { label: '120/80', sub: 'BP' }, { label: 'Off meds', sub: '' }],
            },
            {
              img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
              name: 'Sunita P.',
              badge: 'Month 2 ✓',
              headline: 'Two weeks in and already sleeping better',
              stats: [{ label: '+1.2 hrs', sub: 'sleep' }, { label: '7k steps', sub: 'daily' }, { label: '14 day', sub: 'streak' }],
            },
          ].map((story, i) => (
            <div key={i} style={{
              width: '280px',
              flexShrink: 0,
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            }}>
              <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
                <span style={{
                  position: 'absolute', bottom: '10px', left: '12px',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  background: 'rgba(22,163,74,0.85)', borderRadius: '20px', padding: '2px 8px',
                }}>
                  {story.badge}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>{story.name}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.45, marginBottom: '12px' }}>
                  {story.headline}
                </p>
                {/* Outcome pills */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {story.stats.map((s, j) => (
                    <div key={j} style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '8px', padding: '5px 8px', textAlign: 'center' as const }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-sage)', lineHeight: 1 }}>{s.label}</p>
                      {s.sub && <p style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>{s.sub}</p>}
                    </div>
                  ))}
                </div>
                <a href="/community" style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600, textDecoration: 'none' }}>
                  Read story →
                </a>
              </div>
            </div>
          ))}
          {/* View All Stories nav card */}
          <a
            href="/community"
            style={{
              width: '280px',
              flexShrink: 0,
              background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(28,43,30,0.18)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168,197,172,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#A8C5AC" />
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>
                View All Stories
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                See how members like you are transforming their health.
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Desktop-only: Member Success Stories showcase (large format) */}
      <div className="ov-dt-stories-section" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>People like you</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>Member Success Stories</h2>
          <a href="/community" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-sage)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px' }}>
            View All Stories <ArrowRight size={14} />
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80', name: 'Meera S.', badge: 'Month 3 ✓', headline: 'Lost 4kg and reversed pre-diabetes in 3 months', stats: [{ label: '−4 kg', sub: 'weight' }, { label: '−5 cm', sub: 'waist' }, { label: '5.6', sub: 'HbA1c' }] },
            { img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', name: 'Rajesh K.', badge: 'Month 6 ✓', headline: 'Completed 6 months — lost 8kg and came off medication', stats: [{ label: '−8 kg', sub: 'weight' }, { label: '120/80', sub: 'BP' }, { label: 'Off meds', sub: '' }] },
            { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', name: 'Sunita P.', badge: 'Month 2 ✓', headline: 'Two weeks in and already sleeping better', stats: [{ label: '+1.2 hrs', sub: 'sleep' }, { label: '7k steps', sub: 'daily' }, { label: '14 day', sub: 'streak' }] },
          ].map((story, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid var(--color-border)',
              borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-3px)'; d.style.boxShadow = '0 12px 36px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(0)'; d.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
            >
              <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
                <span style={{
                  position: 'absolute', bottom: '12px', left: '14px',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  background: 'rgba(22,163,74,0.90)', borderRadius: '20px', padding: '3px 10px',
                }}>{story.badge}</span>
              </div>
              <div style={{ padding: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>{story.name}</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.45, marginBottom: '14px' }}>{story.headline}</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {story.stats.map((s, j) => (
                    <div key={j} style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center' as const }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-sage)', lineHeight: 1 }}>{s.label}</p>
                      {s.sub && <p style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>{s.sub}</p>}
                    </div>
                  ))}
                </div>
                <a href="/community" style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 700, textDecoration: 'none' }}>Read story →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* S9: Journey Celebration Footer — celebration */}
      <div className="ov-footer-outer" style={{ padding: '32px 24px 40px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1C2B1E 0%, #2D4A30 100%)',
          borderRadius: '24px',
          padding: '28px 24px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,201,106,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Desktop inner grid */}
          <div className="ov-footer-inner-grid" style={{ position: 'relative' }}>

            {/* Left: roadmap + stats */}
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your transformation</p>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px' }}>Your Journey</h3>
              <div style={{ marginBottom: '24px' }}>
                <JourneyIndicator dark />
              </div>
              <div style={{ display: 'flex', gap: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#F0C96A', letterSpacing: '-0.02em', lineHeight: 1 }}>42</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>of 180 days</p>
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#A8C5AC', letterSpacing: '-0.02em', lineHeight: 1 }}>23%</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>programme complete</p>
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>14</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>day streak</p>
                </div>
              </div>
            </div>

            {/* Right (desktop only): encouragement + CTAs */}
            <div className="ov-footer-cta-col" style={{
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
            }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Keep going</p>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}>
                  You&apos;re making<br />real progress.
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '24px' }}>
                  138 days to go. Every habit you build today is a brick in the foundation of your healthiest self.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="/journey" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)', borderRadius: '16px',
                  textDecoration: 'none', color: '#fff',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.10)'; }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>View Your Complete Journey</span>
                  <ArrowRight size={16} color="rgba(168,197,172,0.80)" />
                </a>
                <a href="/progress" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px',
                  textDecoration: 'none', color: 'rgba(255,255,255,0.75)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>View Your Progress</span>
                  <ArrowRight size={16} color="rgba(255,255,255,0.45)" />
                </a>
              </div>
            </div>

          </div>{/* end footer-inner-grid */}
        </div>
      </div>

      </div>{/* end ov-mobile-only */}

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT — 75/25, hidden <1024px
      ══════════════════════════════════════ */}
      <div className="ov-desktop-only">
        <div className="ov-dt-page">

          {/* ── HERO: cinematic 3-zone ── */}
          <div className="ov-dt-hero">
            {/* Photography layer */}
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1800&q=90"
              alt="Health transformation"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
            />
            {/* Layer 1: dark forest cinematic gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(12,22,13,0.92) 0%, rgba(20,36,22,0.80) 38%, rgba(8,14,9,0.50) 68%, rgba(0,0,0,0.20) 100%)' }} />
            {/* Layer 2: radial glow — warm sage bloom from left */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 20% 60%, rgba(107,143,113,0.18) 0%, transparent 65%)' }} />
            {/* Layer 3: vignette */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.40) 100%)' }} />
            {/* Bottom fade for momentum strip overlap */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(250,250,248,0.10))' }} />

            <div className="ov-dt-hero-inner">

              {/* ── HERO CONTENT — full-width cinematic ── */}
              <div className="ov-dt-hero-left">

                {/* Programme chapter pill */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', padding: '6px 16px 6px 8px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(240,201,106,0.22)', borderRadius: '16px', padding: '3px 8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A', animation: 'pulseRing 2s infinite' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0C96A', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Chapter 2</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.01em' }}>Build Healthy Habits</span>
                </motion.div>

                {/* ── YOUR HEALTH GOAL capsule ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.20 }}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column' as const,
                    gap: '12px',
                    background: 'rgba(8,18,10,0.52)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '24px',
                    padding: '16px 20px',
                    alignSelf: 'flex-start',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.07)',
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                  }}
                >
                  {/* Subtle warm glow behind capsule */}
                  <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />

                  {/* Label */}
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(212,168,67,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', margin: 0, position: 'relative' }}>
                    Your Health Goal
                  </p>

                  {/* Goal chips row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', position: 'relative' }}>
                    {memberGoals.map((goal) => {
                      const Icon = goal.icon;
                      return (
                        <div
                          key={goal.label}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: goal.bg,
                            border: `1px solid ${goal.accent}28`,
                            borderRadius: '999px',
                            padding: '6px 14px 6px 6px',
                            boxShadow: `0 0 14px ${goal.glow}`,
                          }}
                        >
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: `${goal.accent}22`,
                            border: `1px solid ${goal.accent}35`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Icon size={13} color={goal.accent} strokeWidth={2.2} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.005em', whiteSpace: 'nowrap' as const }}>
                            {goal.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Impact microcopy */}
                  <p style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, maxWidth: '480px', margin: 0, position: 'relative' }}>
                    Every habit completed this month moves you closer to reversing diabetes.
                  </p>
                </motion.div>

                {/* Dominant greeting */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.30 }}
                  style={{ fontSize: '60px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1.0, margin: 0, textShadow: '0 4px 32px rgba(0,0,0,0.30)' }}
                >
                  {greeting},<br />
                  <span style={{ background: 'linear-gradient(90deg, #fff 60%, rgba(168,197,172,0.85) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Priya</span>
                </motion.h1>

                {/* Day subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.42 }}
                  style={{ fontSize: '17px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.65, maxWidth: '420px', margin: 0, fontWeight: 400 }}
                >
                  {daySubtitle}
                </motion.p>

                {/* Month progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.54 }}
                  style={{ maxWidth: '360px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.50)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>Month 2 Progress</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.70)', fontWeight: 700 }}>Day 14 of 30</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px', overflow: 'hidden', animation: 'progress-glow 3s ease infinite' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '47%' }}
                      transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #6B8F71, #F0C96A)', borderRadius: '3px' }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>47% complete · 16 days remaining</p>
                </motion.div>

              </div>

            </div>
          </div>

          {/* ── BODY ── */}
          <div className="ov-dt-body">

            {/* ════════════════════════════════
                LEFT MAIN COLUMN (75%)
            ════════════════════════════════ */}
            <main className="ov-dt-main">

              {/* 1+2. Journey Workspace — 65/35 grid */}
              <section className="ov-dt-section">
                <div style={{ marginBottom: '32px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your Transformation Roadmap</p>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>Your Journey Experience</h2>
                </div>

                <div className="ov-dt-journey-workspace">

                  {/* LEFT 65%: Journey Indicator + Chapter Card */}
                  <div className="ov-dt-journey-left">
                    <JourneyIndicatorDesktop selectedPhase={dtJourneyPhase} onPhaseChange={setDtJourneyPhase} />
                  </div>

                  {/* RIGHT 35%: Today at a glance */}
                  <div className="ov-dt-journey-right">

                    {/* Card 1: Today's Habits */}
                    <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ padding: '20px 22px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '2px' }}>Today</p>
                            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Your Habits</p>
                          </div>
                          <span style={{ background: 'rgba(212,168,67,0.10)', color: '#C49A26', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '4px 11px' }}>🔥 14-day streak</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {habits.map((habit, i) => (
                            <button
                              key={i}
                              onClick={() => setHabitsChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: habitsChecked[i] ? 'rgba(107,143,113,0.04)' : 'transparent',
                                border: 'none', cursor: 'pointer', textAlign: 'left' as const,
                                padding: '11px 0',
                                borderBottom: i < habits.length - 1 ? '1px solid var(--color-border)' : 'none',
                                transition: 'background 0.15s ease', width: '100%',
                              }}
                            >
                              <div style={{
                                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                border: `2px solid ${habitsChecked[i] ? 'var(--color-sage)' : 'var(--color-border)'}`,
                                background: habitsChecked[i] ? 'var(--color-sage)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'border-color 0.18s ease, background 0.18s ease',
                              }}>
                                {habitsChecked[i] && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: habitsChecked[i] ? 400 : 500, color: habitsChecked[i] ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: habitsChecked[i] ? 'line-through' : 'none', flex: 1, lineHeight: 1.3 }}>{habit}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Progress footer */}
                      <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{habitsChecked.filter(Boolean).length} of {habits.length} done</span>
                        <div style={{ width: '80px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(habitsChecked.filter(Boolean).length / habits.length) * 100}%`, background: 'var(--color-sage)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Health Snapshot */}
                    <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '22px', padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '2px' }}>Right Now</p>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>Health Snapshot</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { label: 'Steps Today', value: '5,240', target: '7,000', pct: 74, color: '#7B68EE', icon: '🚶' },
                          { label: 'Weight', value: '68.8 kg', target: '−1.2 kg', pct: 60, color: 'var(--color-terracotta)', icon: '⚖️' },
                          { label: 'HbA1c', value: '5.8%', target: 'Target <5.7', pct: 85, color: 'var(--color-sage)', icon: '🩸' },
                          { label: 'Blood Pressure', value: '118/76', target: 'Normal', pct: 100, color: '#C49A26', icon: '❤️' },
                        ].map((m, i) => (
                          <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '14px 14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '15px', lineHeight: 1 }}>{m.icon}</span>
                              <p style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: 500 }}>{m.target}</p>
                            </div>
                            <p style={{ fontSize: '18px', fontWeight: 900, color: m.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{m.value}</p>
                            <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginBottom: '8px' }}>{m.label}</p>
                            <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                                style={{ height: '100%', background: m.color, borderRadius: '2px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>{/* end journey right */}
                </div>{/* end journey workspace grid */}

                {/* Personal Patterns — full-width row below the grid (avoids blank gap under JourneyIndicator) */}
                <div style={{ marginTop: '24px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '22px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '2px' }}>From your data</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>Your Patterns</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { icon: '😴', accent: 'var(--color-sage)', bg: 'rgba(107,143,113,0.08)', category: 'Sleep', headline: 'Movement improves your sleep', insight: 'You sleep 45 min longer on days you walk 7,000+ steps.', stat: '+45 min' },
                      { icon: '🔥', accent: '#7B68EE', bg: 'rgba(123,104,238,0.08)', category: 'Streaks', headline: 'Morning logging protects streaks', insight: 'Your streak has never broken on days you logged before 9am.', stat: '0 breaks' },
                    ].map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: p.bg, borderRadius: '14px', padding: '14px' }}>
                        <div style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{p.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: p.accent, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>{p.category}</p>
                            <p style={{ fontSize: '13px', fontWeight: 900, color: p.accent, letterSpacing: '-0.02em' }}>{p.stat}</p>
                          </div>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '3px', lineHeight: 1.3 }}>{p.headline}</p>
                          <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{p.insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

              {/* 3. My Transformation Story — desktop documentary layout */}
              <section className="ov-dt-section ov-dt-section-warm">
                {/* Hidden file input for desktop story */}
                <input ref={dtStoryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleDtStoryUpload} />

                {/* Section header */}
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your Documentary</p>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '4px' }}>My Transformation Story</h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>Document this chapter — future you will be grateful you did.</p>
                </div>

                {(() => {
                  const monthNum = 2;
                  const d = CHAPTER_STORY_DATA[monthNum]!;
                  const hd = STORY_HEADER_DESIGN[monthNum as keyof typeof STORY_HEADER_DESIGN]!;
                  const milestones = STORY_MILESTONES[monthNum as keyof typeof STORY_MILESTONES]!;
                  const reelLabels = ['Day 1', 'Month 1', 'Month 2', 'Month 3', 'Today'];
                  const programmeDay = 14;
                  const journeyPct = 8;

                  return (
                    <>
                    <div className="ov-dt-story-workspace">

                      {/* LEFT 70%: Cinematic header + Photo Reel + CTA */}
                      <div className="ov-dt-story-left">

                        {/* Cinematic story header */}
                        <div style={{
                          borderRadius: '28px 28px 0 0',
                          overflow: 'hidden',
                          background: hd.gradient,
                          padding: '52px 48px 56px',
                          position: 'relative',
                          minHeight: '340px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}>
                          {/* Three layered glows */}
                          <motion.div
                            animate={{ y: [0, -16, 0], opacity: [0.45, 0.85, 0.45] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', top: '-60px', right: '-60px', width: '380px', height: '320px', background: hd.glow1, pointerEvents: 'none' }}
                          />
                          <motion.div
                            animate={{ y: [0, 12, 0], opacity: [0.30, 0.62, 0.30] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                            style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '300px', height: '200px', background: hd.glow2, pointerEvents: 'none' }}
                          />
                          <motion.div
                            animate={{ opacity: [0.18, 0.40, 0.18] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            style={{ position: 'absolute', top: '40%', left: '35%', width: '320px', height: '200px', background: hd.glow1, pointerEvents: 'none' }}
                          />

                          {/* Top row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                              textTransform: 'uppercase' as const, color: hd.accent,
                              background: 'rgba(0,0,0,0.26)', backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.13)', borderRadius: '22px',
                              padding: '6px 16px',
                            }}>
                              Your Transformation Story
                            </span>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, color: hd.sub,
                              background: 'rgba(0,0,0,0.26)', backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.11)', borderRadius: '22px',
                              padding: '6px 14px',
                            }}>
                              Chapter {monthNum} of 6
                            </span>
                          </div>

                          {/* Main content */}
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{
                              fontSize: '48px', fontWeight: 900, color: '#fff',
                              letterSpacing: '-0.045em', lineHeight: 1.02,
                              textShadow: '0 4px 32px rgba(0,0,0,0.35)',
                              marginBottom: '20px',
                            }}>
                              {d.headline}
                            </p>
                            <p style={{
                              fontSize: '16px', color: hd.accent,
                              lineHeight: 1.72, maxWidth: '520px',
                              marginBottom: '36px',
                            }}>
                              {d.copy}
                            </p>
                            {/* Stats row */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                              {[
                                { label: 'Photos captured', value: `${dtStoryPhotos.length + 1}` },
                                { label: 'Programme day', value: `${programmeDay}` },
                                { label: 'Journey progress', value: `${journeyPct}%` },
                                { label: 'Consistency streak', value: '14 days' },
                              ].map(stat => (
                                <div key={stat.label} style={{
                                  flex: 1,
                                  background: 'rgba(0,0,0,0.26)', backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  borderRadius: '16px', padding: '14px 16px', textAlign: 'center' as const,
                                }}>
                                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px' }}>{stat.value}</p>
                                  <p style={{ fontSize: '10px', color: hd.sub, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.3 }}>{stat.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Photo Reel — premium timeline presentation */}
                        <div style={{
                          background: '#fff',
                          borderLeft: '1px solid var(--color-border)',
                          borderRight: '1px solid var(--color-border)',
                          padding: '36px 48px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px' }}>Visual Timeline</p>
                              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>Your Transformation Reel</p>
                            </div>
                            <button
                              onClick={() => dtStoryRef.current?.click()}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '7px',
                                padding: '10px 18px',
                                background: 'rgba(107,143,113,0.08)', color: 'var(--color-sage)',
                                border: '1.5px solid rgba(107,143,113,0.24)', borderRadius: '22px',
                                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,143,113,0.14)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,143,113,0.08)'; }}
                            >
                              <Camera size={14} strokeWidth={2} />
                              Add Photo
                            </button>
                          </div>

                          {/* 5-slot reel — large format */}
                          <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                            {reelLabels.map((label, i) => {
                              const isDay1 = i === 0;
                              const photoUrl = isDay1 ? null : dtStoryPhotos[i - 1] ?? null;
                              const isFilled = isDay1 || !!photoUrl;
                              const isActive = dtStoryActiveSlot === i;
                              const isToday = i === 4;
                              const isLast = i === reelLabels.length - 1;

                              return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                  {/* Connector line between slots */}
                                  {i > 0 && (
                                    <div style={{
                                      position: 'absolute', top: '75px', left: '-1px', width: '2px', bottom: 0,
                                      background: isFilled ? `linear-gradient(to bottom, ${hd.ringFrom}66, transparent)` : 'var(--color-border)',
                                      zIndex: 0,
                                    }} />
                                  )}
                                  <button
                                    onClick={() => {
                                      setDtStoryActiveSlot(i);
                                      if (!isFilled && !isDay1) dtStoryRef.current?.click();
                                    }}
                                    style={{
                                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                                      gap: '0', background: 'transparent', border: 'none',
                                      cursor: isFilled || isDay1 || isToday ? 'pointer' : 'default',
                                      padding: '0',
                                      paddingLeft: i === 0 ? '0' : '12px',
                                      paddingRight: isLast ? '0' : '12px',
                                      flex: 1,
                                    }}
                                  >
                                    {/* Large photo circle */}
                                    <div style={{
                                      width: '100%', paddingBottom: '100%',
                                      position: 'relative', borderRadius: '20px',
                                      overflow: 'hidden',
                                      outline: isActive ? `3px solid ${hd.ringFrom}` : isFilled ? '2px solid rgba(107,143,113,0.28)' : '2px dashed rgba(107,143,113,0.28)',
                                      outlineOffset: isActive ? '3px' : '0',
                                      boxShadow: isActive ? `0 8px 32px ${hd.ringFrom}40` : isFilled ? '0 4px 16px rgba(0,0,0,0.10)' : 'none',
                                      transition: 'all 0.22s ease',
                                      background: isFilled ? '#f0f0ee' : 'rgba(107,143,113,0.04)',
                                    }}>
                                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isDay1 ? (
                                          <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
                                            <rect width="100" height="100" fill="#E8EDE9" />
                                            <circle cx="50" cy="38" r="16" fill="#C4C4BC" />
                                            <ellipse cx="50" cy="78" rx="25" ry="18" fill="#C4C4BC" />
                                          </svg>
                                        ) : photoUrl ? (
                                          <img src={photoUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : isToday ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <Camera size={28} color="var(--color-sage)" strokeWidth={1.5} />
                                            <span style={{ fontSize: '11px', color: 'var(--color-sage)', fontWeight: 700 }}>Add Today</span>
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <Lock size={18} color="rgba(107,143,113,0.35)" strokeWidth={1.5} />
                                            <span style={{ fontSize: '10px', color: 'rgba(107,143,113,0.45)', fontWeight: 500 }}>Future</span>
                                          </div>
                                        )}
                                      </div>
                                      {/* Active badge */}
                                      {isActive && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: hd.ringFrom, borderRadius: '20px', padding: '2px 8px' }}>
                                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>NOW</span>
                                        </div>
                                      )}
                                    </div>
                                    {/* Label below */}
                                    <div style={{ marginTop: '12px', textAlign: 'center' as const }}>
                                      <p style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-ink)' : isFilled ? 'var(--color-ink)' : 'var(--color-muted)', letterSpacing: '0.01em' }}>
                                        {label}
                                      </p>
                                      <p style={{ fontSize: '10px', color: isActive ? hd.ringFrom : 'var(--color-muted)', marginTop: '2px', fontWeight: isActive ? 600 : 400 }}>
                                        {isDay1 ? 'Start' : isFilled ? 'Captured ✓' : isToday ? 'Tap to add' : 'Unlocks soon'}
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Motivational quote */}
                          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(107,143,113,0.05)', border: '1px solid rgba(107,143,113,0.12)', borderRadius: '14px', padding: '14px 18px' }}>
                            <Sparkles size={15} color="var(--color-sage)" strokeWidth={1.8} />
                            <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic', lineHeight: 1.55 }}>
                              The changes may feel small today, but they become powerful when you look back. Future you will be grateful you captured this moment.
                            </p>
                          </div>
                        </div>

                        {/* Premium photo CTA strip */}
                        <motion.button
                          onClick={() => dtStoryRef.current?.click()}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '28px 48px',
                            background: `linear-gradient(135deg, ${hd.ringFrom} 0%, ${hd.ringTo} 100%)`,
                            border: 'none', cursor: 'pointer',
                            boxShadow: `0 6px 32px ${hd.ringFrom}50`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Camera size={24} color="#fff" strokeWidth={1.8} />
                            </div>
                            <div style={{ textAlign: 'left' as const }}>
                              <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '4px' }}>
                                Capture Today&apos;s Win
                              </p>
                              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                                {d.primaryCta} · Every photo tells your story
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '16px', padding: '12px 22px', flexShrink: 0 }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Add Photo</span>
                            <ArrowRight size={16} color="rgba(255,255,255,0.85)" />
                          </div>
                        </motion.button>

                        {/* Journey CTA — cinematic conclusion */}
                        <a
                          href="/journey"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #1C2B1E 0%, #2D4A30 100%)',
                            borderRadius: '0 0 28px 28px',
                            padding: '28px 48px',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 8px 40px rgba(28,43,30,0.28)',
                            transition: 'box-shadow 0.20s ease',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 56px rgba(28,43,30,0.42)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 40px rgba(28,43,30,0.28)'; }}
                        >
                          <motion.div
                            animate={{ y: [0, -8, 0], opacity: [0.22, 0.48, 0.22] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', top: '-30px', right: '60px', width: '200px', height: '160px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.22) 0%, transparent 70%)', pointerEvents: 'none' }}
                          />
                          <motion.div
                            animate={{ opacity: [0.10, 0.24, 0.10] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                            style={{ position: 'absolute', bottom: '-10px', left: '15%', width: '160px', height: '100px', background: 'radial-gradient(ellipse, rgba(240,201,106,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}
                          />
                          <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <BookOpen size={14} color="rgba(168,197,172,0.70)" />
                              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>My Transformation Story</p>
                            </div>
                            <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1, textShadow: '0 2px 18px rgba(0,0,0,0.24)' }}>
                              Continue Watching<br />Your Documentary
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', padding: '14px 24px', flexShrink: 0, position: 'relative', transition: 'background 0.15s ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.17)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.10)'; }}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const }}>Enter Your Journey</span>
                            <ArrowRight size={18} color="#A8C5AC" />
                          </div>
                        </a>

                      </div>{/* end story left */}

                      {/* RIGHT 30%: Reflection + Highlights + Future Self */}
                      <div className="ov-dt-story-right">

                        {/* Reflection journal card */}
                        <div style={{
                          background: '#fff',
                          border: '1px solid var(--color-border)',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        }}>
                          {/* Top accent */}
                          <div style={{ height: '3px', background: `linear-gradient(90deg, ${hd.ringFrom}, ${hd.ringTo})` }} />
                          <div style={{ padding: '28px 26px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(107,143,113,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <BookOpen size={18} color="var(--color-sage)" strokeWidth={1.8} />
                              </div>
                              <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '1px' }}>Today&apos;s Reflection</p>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Journal Prompt</p>
                              </div>
                            </div>
                            <p style={{
                              fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)',
                              fontStyle: 'italic', lineHeight: 1.55,
                              letterSpacing: '-0.01em',
                              marginBottom: '10px',
                            }}>
                              &ldquo;{d.reflectionPrompt}&rdquo;
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                              Take a moment. Your honest reflection is one of the most powerful tools in your transformation.
                            </p>
                            <button style={{
                              display: 'inline-flex', alignItems: 'center', gap: '8px',
                              width: '100%', padding: '13px 18px',
                              background: 'var(--color-surface)', color: 'var(--color-ink)',
                              border: '1.5px solid var(--color-border)', borderRadius: '16px',
                              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                              justifyContent: 'center',
                              transition: 'border-color 0.15s ease, background 0.15s ease',
                            }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#fff'; b.style.borderColor = 'var(--color-sage)'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--color-surface)'; b.style.borderColor = 'var(--color-border)'; }}
                            >
                              <BookOpen size={14} strokeWidth={2} />
                              Write My Reflection
                            </button>

                            {/* Future copy */}
                            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(107,143,113,0.05)', borderRadius: '14px', border: '1px solid rgba(107,143,113,0.12)' }}>
                              <p style={{ fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.65, fontStyle: 'italic' }}>
                                &ldquo;{d.futureCopy}&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Journey Highlights — achievement tiles */}
                        <div style={{
                          background: '#fff',
                          border: '1px solid var(--color-border)',
                          borderRadius: '24px',
                          padding: '26px 24px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '4px' }}>Your Progress</p>
                          <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '20px' }}>Journey Highlights</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {milestones.map((m, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.3 }}
                                style={{
                                  background: 'var(--color-surface)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '18px',
                                  padding: '18px 16px',
                                  display: 'flex', flexDirection: 'column', gap: '10px',
                                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                                }}
                                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 4px 16px rgba(107,143,113,0.14)'; d.style.borderColor = 'rgba(107,143,113,0.28)'; }}
                                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = 'none'; d.style.borderColor = 'var(--color-border)'; }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '26px', lineHeight: 1 }}>{m.icon}</span>
                                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(107,143,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--color-sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{m.value}</p>
                                  <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.4 }}>{m.label}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                      </div>{/* end story right */}
                    </div>

                    {/* Future Self Preview + Meal Plan — 2-col row below the story grid (avoids blank gap under story left) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>

                      {/* Future Self Preview */}
                      <div style={{
                        borderRadius: '24px', overflow: 'hidden',
                        background: 'linear-gradient(150deg, #22324A 0%, #2D4B72 100%)',
                        boxShadow: '0 6px 28px rgba(34,50,74,0.28)',
                        padding: '28px 28px',
                        position: 'relative',
                      }}>
                        <motion.div
                          animate={{ opacity: [0.14, 0.34, 0.14] }}
                          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(91,124,250,0.18)', pointerEvents: 'none' }}
                        />
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Sparkles size={14} color="#8FA4FF" strokeWidth={1.8} />
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(143,164,255,0.85)', textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Future Self</p>
                          </div>
                          <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: '10px' }}>
                            Stay consistent —<br />see what&apos;s possible.
                          </p>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '20px' }}>
                            {d.futureCopy}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '23%' }}
                                transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #5B7CFA, #8FA4FF)', borderRadius: '2px' }}
                              />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>23% complete</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                            {[
                              { icon: '⚡', label: 'Better Energy', sub: 'Wake up ready' },
                              { icon: '🌙', label: 'Deeper Sleep', sub: 'Rest & restore' },
                              { icon: '⚖️', label: 'Healthier Weight', sub: 'Sustainable' },
                              { icon: '🔁', label: 'Stronger Habits', sub: 'Automatic choices' },
                            ].map((o, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.09, duration: 0.28 }}
                                style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 12px', border: '1px solid rgba(255,255,255,0.09)' }}
                              >
                                <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{o.icon}</span>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '2px' }}>{o.label}</p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)', lineHeight: 1.3 }}>{o.sub}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Nutrition Strategy Card */}
                      <NutritionStrategyCard />

                    </div>{/* end below-story row */}
                    </>
                  );
                })()}
              </section>

              {/* 3b. Biomarker Progress Showcase */}
              <div className="ov-dt-bleed">
                <BiomarkerProgressShowcase />
              </div>

              {/* 4. Today's Focus + Toolkit */}
              <section className="ov-dt-section ov-dt-section-dark">
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.70)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your Daily Operations</p>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Health Command Center</h2>
                </div>

                {/* Today's Focus — full width cinematic card */}
                <div style={{
                  background: 'linear-gradient(135deg, #1C2B1E 0%, #243D28 55%, #3A5C3E 100%)',
                  borderRadius: '24px',
                  padding: '40px 44px',
                  boxShadow: '0 8px 40px rgba(28,43,30,0.24)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '48px',
                  alignItems: 'center',
                }}>
                  {/* Ambient glows */}
                  <motion.div animate={{ opacity: [0.18, 0.40, 0.18] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: '-40px', right: '20%', width: '280px', height: '200px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.20) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <motion.div animate={{ opacity: [0.10, 0.22, 0.10] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    style={{ position: 'absolute', bottom: '-20px', left: '40%', width: '200px', height: '140px', background: 'radial-gradient(ellipse, rgba(240,201,106,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

                  {/* Left: goal + progress + actions */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(240,201,106,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={15} color="#F0C96A" strokeWidth={2} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#F0C96A', textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Today&apos;s Mission</span>
                    </div>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-0.03em', textShadow: '0 2px 20px rgba(0,0,0,0.22)' }}>
                      Hit 7,000 steps<br />before dinner
                    </p>
                    <div style={{ marginBottom: '22px', maxWidth: '480px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '9px' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#F0C96A' }}>74% · 1,760 to go</span>
                      </div>
                      <div style={{ height: '7px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                          style={{ height: '100%', background: 'linear-gradient(90deg, #D4A843 0%, #F0C96A 100%)', borderRadius: '4px', boxShadow: '0 0 12px rgba(240,201,106,0.40)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const }}>
                      <button style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)',
                        color: '#fff', border: 'none', borderRadius: '16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(107,143,113,0.40)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 6px 22px rgba(107,143,113,0.52)'; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 4px 16px rgba(107,143,113,0.40)'; }}
                      >
                        <Footprints size={14} strokeWidth={2} /> Log Steps
                      </button>
                      <button style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                        background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.80)',
                        border: '1px solid rgba(255,255,255,0.14)', borderRadius: '16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
                      >
                        <Plus size={14} /> Log Activity
                      </button>
                      <a href="/progress" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 600, color: 'rgba(168,197,172,0.75)',
                        textDecoration: 'none', transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(168,197,172,1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(168,197,172,0.75)'; }}
                      >
                        View health report <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>

                  {/* Right: live step counter */}
                  <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' as const, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px', padding: '28px 32px', flexShrink: 0 }}>
                    <p style={{ fontSize: '56px', fontWeight: 900, color: '#F0C96A', letterSpacing: '-0.05em', lineHeight: 1 }}>5,240</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', fontWeight: 600 }}>of 7,000 steps</p>
                  </div>
                </div>

                {/* Setup banner */}
                {showSetup && (
                  <div style={{ marginBottom: '20px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '16px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '3px' }}>One last thing to unlock your full journey</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>Upload your baseline labs so Dr. Ananya can personalise your insights</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 18px', background: 'var(--color-ink)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={12} /> Upload labs
                      </button>
                      <button onClick={() => setShowSetup(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-muted)', fontSize: '18px', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                )}

                {/* Toolkit — full width 6-col */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.60)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Your Tools</p>
                </div>
                <div className="ov-dt-cmd-toolkit-full">
                  {[
                    { imgSrc: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80', icon: CheckCircle2, title: 'Habit Tracker', tag: 'Daily' },
                    { imgSrc: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80', icon: UtensilsCrossed, title: 'Meal Logger', tag: 'Nutrition' },
                    { imgSrc: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80', icon: Footprints, title: 'Steps & Activity', tag: 'Movement' },
                    { imgSrc: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=600&q=80', icon: Moon, title: 'Sleep Tracker', tag: 'Recovery' },
                    { imgSrc: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80', icon: Brain, title: 'Mindfulness', tag: 'Mental' },
                    { imgSrc: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80', icon: FlaskConical, title: 'Progress & Labs', tag: 'Biomarkers' },
                  ].map((card, i) => (
                    <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 14px 40px rgba(0,0,0,0.40)' }}
                      style={{ borderRadius: '18px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 2px 12px rgba(0,0,0,0.20)' }}>
                      <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
                        <img src={card.imgSrc} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.60) 100%)' }} />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(6px)', borderRadius: '8px', padding: '3px 8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{card.tag}</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <card.icon size={14} color="#fff" strokeWidth={2} />
                        </div>
                      </div>
                      <div style={{ padding: '13px 14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{card.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 6+7. Learn & Discover */}
              <section className="ov-dt-section ov-dt-section-white">
                {/* Chapter heading */}
                <div style={{ marginBottom: '36px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Knowledge is transformation</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>Learn &amp; Discover</h2>
                    <a href="/community" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-sage)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', paddingBottom: '3px' }}>
                      All Stories <ArrowRight size={13} />
                    </a>
                  </div>
                </div>

                {/* ── FEATURED STORY ── */}
                {(() => {
                  const featured = { img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1400&q=90', name: 'Meera S.', location: 'Bangalore · Month 3', badge: 'Month 3 ✓', headline: 'Lost 4kg and reversed pre-diabetes in 3 months', quote: 'I stopped thinking of healthy eating as a sacrifice. The Indian Plate Model made it feel like home — just better.', stats: [{ label: '−4 kg', sub: 'weight lost' }, { label: '−5 cm', sub: 'waist reduction' }, { label: '5.6', sub: 'HbA1c (normalised)' }, { label: '3 months', sub: 'of consistency' }] };
                  return (
                    <a href="/community" style={{ display: 'block', textDecoration: 'none', marginBottom: '32px' }}>
                      <div style={{
                        borderRadius: '28px', overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                        background: '#111',
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        minHeight: '380px',
                        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
                      }}
                      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 16px 56px rgba(0,0,0,0.22)'; d.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 8px 40px rgba(0,0,0,0.14)'; d.style.transform = 'translateY(0)'; }}
                      >
                        {/* Left: photo */}
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img src={featured.img} alt={featured.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.60) 100%)' }} />
                          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(22,163,74,0.90)', borderRadius: '20px', padding: '4px 12px' }}>{featured.badge}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.80)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 12px' }}>Featured Story</span>
                          </div>
                        </div>
                        {/* Right: story content */}
                        <div style={{ background: 'linear-gradient(150deg, #1a1a1a 0%, #111 100%)', padding: '44px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '8px' }}>{featured.location}</p>
                            <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '24px' }}>{featured.headline}</p>
                            <div style={{ borderLeft: '3px solid var(--color-sage)', paddingLeft: '18px', marginBottom: '32px' }}>
                              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.70, fontStyle: 'italic' }}>
                                &ldquo;{featured.quote}&rdquo;
                              </p>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)', marginTop: '12px' }}>— {featured.name}</p>
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
                              {featured.stats.map((s, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '14px', padding: '14px 10px', textAlign: 'center' as const }}>
                                  <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-sage)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px' }}>{s.label}</p>
                                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.3 }}>{s.sub}</p>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.20)', border: '1px solid rgba(107,143,113,0.30)', borderRadius: '14px', padding: '11px 20px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#A8C5AC' }}>Read full story</span>
                              <ArrowRight size={14} color="#A8C5AC" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })()}

                {/* ── SUPPORTING STORIES 2-col grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                  {[
                    { img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', name: 'Rajesh K.', location: 'Mumbai · Month 6', badge: 'Month 6 ✓', headline: 'Completed 6 months — lost 8kg and came off medication', stats: [{ label: '−8 kg', sub: 'weight' }, { label: '120/80', sub: 'BP' }, { label: 'Off meds', sub: '' }] },
                    { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', name: 'Sunita P.', location: 'Pune · Month 2', badge: 'Month 2 ✓', headline: 'Two weeks in and already sleeping better than I have in years', stats: [{ label: '+1.2 hrs', sub: 'sleep' }, { label: '7k steps', sub: 'daily' }, { label: '14 days', sub: 'streak' }] },
                  ].map((story, i) => (
                    <a key={i} href="/community" style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        background: '#fff', border: '1px solid var(--color-border)',
                        borderRadius: '24px', overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                        transition: 'transform 0.20s ease, box-shadow 0.20s ease',
                      }}
                      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-4px)'; d.style.boxShadow = '0 14px 40px rgba(0,0,0,0.13)'; }}
                      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(0)'; d.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
                      >
                        <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                          <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
                          <div style={{ position: 'absolute', bottom: '14px', left: '16px', display: 'flex', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(22,163,74,0.90)', borderRadius: '20px', padding: '3px 10px' }}>{story.badge}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '3px 10px' }}>{story.location}</span>
                          </div>
                        </div>
                        <div style={{ padding: '22px 22px 20px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '8px' }}>{story.name}</p>
                          <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.45, marginBottom: '18px', letterSpacing: '-0.01em' }}>{story.headline}</p>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                            {story.stats.map((s, j) => (
                              <div key={j} style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '12px', padding: '8px 12px', textAlign: 'center' as const }}>
                                <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-sage)', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.label}</p>
                                {s.sub && <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '3px' }}>{s.sub}</p>}
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-sage)', fontWeight: 700 }}>Read story</span>
                            <ArrowRight size={13} color="var(--color-sage)" />
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* ── TOPIC FILTERS + ARTICLE GRID ── */}
                {/* Topics header */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '4px' }}>Guided learning</p>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>Explore Health Topics</h3>
                </div>

                {/* Large filter pills */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const, marginBottom: '28px' }}>
                  {filters.map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '24px',
                        border: `2px solid ${activeFilter === f ? 'var(--color-ink)' : 'var(--color-border)'}`,
                        background: activeFilter === f ? 'var(--color-ink)' : '#fff',
                        color: activeFilter === f ? '#fff' : 'var(--color-ink)',
                        fontSize: '14px',
                        fontWeight: activeFilter === f ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeFilter === f ? '0 4px 16px rgba(28,43,30,0.18)' : 'none',
                        letterSpacing: activeFilter === f ? '-0.01em' : '0',
                      }}
                      onMouseEnter={e => { if (activeFilter !== f) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-ink)'; b.style.background = 'rgba(28,43,30,0.04)'; } }}
                      onMouseLeave={e => { if (activeFilter !== f) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-border)'; b.style.background = '#fff'; } }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Question rows + Article grid side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

                  {/* Questions */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '12px', letterSpacing: '0.01em' }}>
                      Popular questions in <span style={{ color: 'var(--color-ink)' }}>{activeFilter}</span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {questions.map((q, i) => (
                        <button
                          key={i}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '16px 18px',
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: i === 0 ? '16px 16px 4px 4px' : i === questions.length - 1 ? '4px 4px 16px 16px' : '4px',
                            cursor: 'pointer', textAlign: 'left' as const, width: '100%',
                            marginBottom: i < questions.length - 1 ? '2px' : '0',
                            transition: 'background 0.15s ease, border-color 0.15s ease',
                          }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(107,143,113,0.04)'; b.style.borderColor = 'rgba(107,143,113,0.28)'; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#fff'; b.style.borderColor = 'var(--color-border)'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-warm)', border: '1px solid rgba(212,168,67,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BarChart3 size={15} color="var(--color-sage)" />
                          </div>
                          <span style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.4, flex: 1 }}>{q}</span>
                          <ChevronRight size={16} color="var(--color-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editorial articles — premium presentation */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '12px', letterSpacing: '0.01em' }}>From the editorial team</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { imgSrc: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', title: 'Why walking after meals helps blood sugar', sources: '4 sources', tag: 'Movement', readTime: '4 min read' },
                        { imgSrc: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', title: 'The Indian Plate Model explained', sources: '6 sources', tag: 'Nutrition', readTime: '5 min read' },
                        { imgSrc: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&q=80', title: 'Sleep and metabolic health: what the research says', sources: '8 sources', tag: 'Sleep', readTime: '7 min read' },
                      ].map((article, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex', gap: '16px', alignItems: 'flex-start',
                            background: '#fff', border: '1px solid var(--color-border)',
                            borderRadius: '18px', padding: '16px', cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
                          }}
                          onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; d.style.borderColor = 'rgba(107,143,113,0.28)'; d.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; d.style.borderColor = 'var(--color-border)'; d.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ width: '88px', height: '88px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={article.imgSrc} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', background: 'rgba(107,143,113,0.10)', borderRadius: '20px', padding: '2px 9px' }}>{article.tag}</span>
                              <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>{article.readTime}</span>
                            </div>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.45, marginBottom: '8px', letterSpacing: '-0.01em' }}>{article.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500 }}>{article.sources}</span>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <Heart size={15} color="var(--color-muted)" strokeWidth={1.5} />
                                <Bookmark size={15} color="var(--color-muted)" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>

              {/* 8. Your Journey So Far */}
              <section className="ov-dt-section ov-dt-section-stone">
                <div style={{
                  borderRadius: '32px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'linear-gradient(148deg, #0E1A0F 0%, #1C2B1E 35%, #243D28 68%, #3A5C3E 100%)',
                  boxShadow: '0 12px 56px rgba(28,43,30,0.32)',
                }}>
                  {/* Layered atmospheric glows */}
                  <motion.div
                    animate={{ opacity: [0.18, 0.38, 0.18], y: [0, -16, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: '-80px', right: '-60px', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.24) 0%, transparent 65%)', pointerEvents: 'none' }}
                  />
                  <motion.div
                    animate={{ opacity: [0.10, 0.22, 0.10] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                    style={{ position: 'absolute', bottom: '-40px', left: '15%', width: '380px', height: '260px', background: 'radial-gradient(ellipse, rgba(240,201,106,0.14) 0%, transparent 70%)', pointerEvents: 'none' }}
                  />
                  <motion.div
                    animate={{ opacity: [0.08, 0.18, 0.08] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    style={{ position: 'absolute', top: '40%', left: '-40px', width: '300px', height: '200px', background: 'radial-gradient(ellipse, rgba(168,197,172,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}
                  />

                  {/* Top accent strip */}
                  <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent 0%, rgba(168,197,172,0.35) 30%, rgba(240,201,106,0.45) 60%, transparent 100%)' }} />

                  <div style={{ padding: '56px 56px 52px', position: 'relative' }}>

                    {/* Chapter heading */}
                    <div style={{ marginBottom: '52px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '8px' }}>Closing Chapter</p>
                      <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 2px 28px rgba(0,0,0,0.25)' }}>
                        Your Journey So Far
                      </h2>
                    </div>

                    {/* Main 3-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', marginBottom: '52px' }}>

                      {/* Col 1: Big stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.50)', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Programme Progress</p>
                        {[
                          { value: '42', label: 'days completed', sub: 'of 180 total', color: '#F0C96A' },
                          { value: '23%', label: 'programme complete', sub: '138 days remaining', color: '#A8C5AC' },
                          { value: '14', label: 'day streak', sub: 'consecutive habits', color: '#fff' },
                          { value: '−1.2 kg', label: 'weight progress', sub: 'since Day 1', color: 'rgba(168,197,172,0.85)' },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.35 }}
                            style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}
                          >
                            <p style={{ fontSize: i === 0 ? '52px' : '40px', fontWeight: 900, color: stat.color, letterSpacing: '-0.05em', lineHeight: 1, flexShrink: 0 }}>{stat.value}</p>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{stat.label}</p>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{stat.sub}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Col 2: Visual roadmap */}
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.50)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '28px' }}>Your Roadmap</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {[
                            { num: 1, label: 'Discover', title: 'Know Your Health', status: 'completed' as const, detail: 'Baseline & awareness' },
                            { num: 2, label: 'Build', title: 'Build Healthy Habits', status: 'active' as const, detail: 'Day 14 of 30 · 47%' },
                            { num: 3, label: 'Restore', title: 'Sleep Better', status: 'locked' as const, detail: 'Unlocks Jul 9' },
                            { num: 4, label: 'Balance', title: 'Stress Less', status: 'locked' as const, detail: 'Unlocks Aug 9' },
                            { num: 5, label: 'Sustain', title: 'Make It Stick', status: 'locked' as const, detail: 'Unlocks Sep 9' },
                            { num: 6, label: 'Thrive', title: 'Your New Normal', status: 'locked' as const, detail: 'Unlocks Oct 9' },
                          ].map((phase, i) => {
                            const isComp = phase.status === 'completed';
                            const isAct = phase.status === 'active';
                            return (
                              <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: i < 5 ? '16px' : '0', position: 'relative' }}>
                                {/* Vertical connector */}
                                {i < 5 && (
                                  <div style={{
                                    position: 'absolute', left: '17px', top: '36px', bottom: '-4px', width: '2px',
                                    background: isComp ? 'rgba(107,143,113,0.60)' : 'rgba(255,255,255,0.08)',
                                  }} />
                                )}
                                {/* Node */}
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                  background: isComp ? 'var(--color-sage)' : isAct ? '#fff' : 'rgba(255,255,255,0.07)',
                                  border: isComp ? 'none' : isAct ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: isAct ? '0 0 0 5px rgba(255,255,255,0.10), 0 4px 16px rgba(0,0,0,0.22)' : isComp ? '0 0 0 4px rgba(107,143,113,0.18)' : 'none',
                                  transition: 'all 0.2s ease',
                                  zIndex: 1,
                                }}>
                                  {isComp
                                    ? <svg width="13" height="10" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    : <span style={{ fontSize: '12px', fontWeight: 800, color: isAct ? 'var(--color-ink)' : 'rgba(255,255,255,0.28)' }}>{phase.num}</span>
                                  }
                                </div>
                                {/* Text */}
                                <div style={{ paddingTop: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: isAct ? 800 : isComp ? 700 : 500, color: isAct ? '#fff' : isComp ? 'rgba(168,197,172,0.90)' : 'rgba(255,255,255,0.32)', letterSpacing: isAct ? '-0.01em' : '0' }}>{phase.title}</p>
                                    {isAct && <span style={{ fontSize: '9px', fontWeight: 700, color: '#7FFFA0', background: 'rgba(127,255,160,0.14)', borderRadius: '20px', padding: '2px 7px', border: '1px solid rgba(127,255,160,0.22)' }}>NOW</span>}
                                    {isComp && <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-sage)', background: 'rgba(107,143,113,0.15)', borderRadius: '20px', padding: '2px 7px' }}>✓</span>}
                                  </div>
                                  <p style={{ fontSize: '11px', color: isAct ? 'rgba(255,255,255,0.50)' : isComp ? 'rgba(168,197,172,0.45)' : 'rgba(255,255,255,0.20)' }}>{phase.detail}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Col 3: Motivation + CTAs */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.50)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '20px' }}>Keep Going</p>
                          <p style={{ fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '18px', textShadow: '0 2px 24px rgba(0,0,0,0.22)' }}>
                            You&apos;re building<br />something real.
                          </p>
                          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.72, marginBottom: '32px' }}>
                            138 days remain. Every habit you complete today is compounding into the healthiest version of yourself. This is what transformation looks like in action.
                          </p>
                          {/* Mini milestone highlight */}
                          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '18px', padding: '18px 20px', marginBottom: '28px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '10px' }}>Your next milestone</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(240,201,106,0.15)', border: '1px solid rgba(240,201,106,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Star size={18} color="#F0C96A" strokeWidth={1.6} />
                              </div>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Complete Month 2</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.40)', marginTop: '2px' }}>16 days remaining · unlocks Sleep Chapter</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTAs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <a
                            href="/journey"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '18px 22px',
                              background: 'linear-gradient(135deg, rgba(107,143,113,0.28) 0%, rgba(74,110,80,0.22) 100%)',
                              border: '1px solid rgba(107,143,113,0.38)',
                              borderRadius: '18px', textDecoration: 'none', color: '#fff',
                              transition: 'background 0.18s ease, box-shadow 0.18s ease',
                              boxShadow: '0 4px 20px rgba(28,43,30,0.20)',
                            }}
                            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'linear-gradient(135deg, rgba(107,143,113,0.40) 0%, rgba(74,110,80,0.32) 100%)'; a.style.boxShadow = '0 8px 32px rgba(28,43,30,0.36)'; }}
                            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'linear-gradient(135deg, rgba(107,143,113,0.28) 0%, rgba(74,110,80,0.22) 100%)'; a.style.boxShadow = '0 4px 20px rgba(28,43,30,0.20)'; }}
                          >
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>View My Complete Journey</p>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Photos · Milestones · Achievements</p>
                            </div>
                            <ArrowRight size={18} color="rgba(168,197,172,0.80)" />
                          </a>
                          <a
                            href="/progress"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '15px 22px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                              borderRadius: '18px', textDecoration: 'none', color: 'rgba(255,255,255,0.72)',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.10)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>View Biomarker Progress</span>
                            <ArrowRight size={16} color="rgba(255,255,255,0.38)" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom separator + programme progress bar */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Programme completion</p>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.70)' }}>42 of 180 days · 23%</p>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '23%' }}
                          transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
                          style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage) 0%, #A8C5AC 60%, #F0C96A 100%)', borderRadius: '3px', boxShadow: '0 0 12px rgba(168,197,172,0.35)' }}
                        />
                      </div>
                      {/* 6 segment labels */}
                      <div style={{ display: 'flex', marginTop: '10px' }}>
                        {['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'].map((m, i) => (
                          <div key={i} style={{ flex: 1, textAlign: 'center' as const }}>
                            <p style={{ fontSize: '9px', fontWeight: i <= 1 ? 700 : 500, color: i === 0 ? 'var(--color-sage)' : i === 1 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)', letterSpacing: '0.02em' }}>{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </section>

            </main>


          </div>{/* end ov-dt-body */}
        </div>{/* end ov-dt-page */}
      </div>{/* end ov-desktop-only */}
    </div>
  );
}

// ---- Inner page (needs Suspense for useSearchParams) ----

// ---- Inner page (needs Suspense for useSearchParams) ----
function TodayPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  useEffect(() => {
    const t = searchParams.get('tab') as TabId;
    if (t) setActiveTab(t);
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewContent />;
      case 'month1': return <Month1Content />;
      case 'month2': return <Month2Content />;
      case 'month3': return <LockedMonthContent monthNum={3} />;
      case 'month4': return <LockedMonthContent monthNum={4} />;
      case 'month5': return <LockedMonthContent monthNum={5} />;
      case 'month6': return <LockedMonthContent monthNum={6} />;
      default: return <OverviewContent />;
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        position: 'sticky',
        top: '56px',
        background: 'rgba(250,250,248,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 20px',
        zIndex: 99,
        display: 'flex',
        gap: '0',
        overflowX: 'auto',
        scrollbarWidth: 'none' as const,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '13px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-sage)' : '2px solid transparent',
                marginBottom: '-1px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--color-sage)' : 'var(--color-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
              {tab.status === 'completed' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
              )}
              {tab.status === 'active' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0 }} />
              )}
              {tab.status === 'locked' && (
                <Lock size={9} color="var(--color-muted)" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {renderContent()}
    </div>
  );
}

// ---- Main Page ----
export default function TodayPage() {
  return (
    <Suspense fallback={<div />}>
      <TodayPageInner />
    </Suspense>
  );
}
