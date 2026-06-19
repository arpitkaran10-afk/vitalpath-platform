'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useHPlusStore, logActivity } from '../../../lib/hplus-store';
import type { ActivityCategory, HPlusEngineState, CategoryProgress } from '../../../lib/hplus-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import NutritionBlueprintWizard, { type BlueprintData, generateMeals, generatePlanTitle } from '../components/NutritionBlueprintWizard';
import {
  Lock,
  LockOpen,
  CheckCircle2,
  ChevronLeft,
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
  Bell,
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
  badge,
}: {
  imgSrc: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
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
        {badge && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '20px', padding: '3px 9px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '0.01em' }}>{badge}</span>
          </div>
        )}
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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const compact = variant === 'month';

  const handleBlueprintComplete = (data: BlueprintData) => {
    setBlueprint(data);
    setWizardOpen(false);
    setMode('assigned');
  };

  const activeMeals = blueprint ? generateMeals(blueprint) : NS_MEALS;
  const planTitle = blueprint ? generatePlanTitle(blueprint) : 'Week 3 Nutrition Plan';

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
            <button className="ns-cta-p" onClick={() => setWizardOpen(true)} style={{ padding: ctapy, fontSize: ctasz, background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)', color: '#fff', boxShadow: '0 3px 12px rgba(107,143,113,0.26)', marginBottom: '6px' }}>
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
              <div>
                <h3 style={{ fontSize: compact ? '15px' : '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.18 }}>{planTitle}</h3>
                {blueprint && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.28)', fontSize: '8px', fontWeight: 700, color: '#A8C5AC', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                    Generated from your Nutrition Blueprint
                  </span>
                )}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#A8C5AC', flexShrink: 0 }}>75% today</span>
            </div>
          </div>
          {/* Meal rail — fixed height, scrolls internally */}
          <div style={{ position: 'relative', height: railH, flexShrink: 0 }}>
            <div className="ns-meal-rail">
              {activeMeals.map((meal, i) => (
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
            <a href="/daily-plan" className="ns-cta-p" style={{ padding: ctapy, fontSize: ctasz, background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)', color: '#fff', boxShadow: '0 3px 10px rgba(107,143,113,0.22)', textDecoration: 'none' }}>
              <UtensilsCrossed size={12} strokeWidth={2.5} />
              View Full Meal Plan
            </a>
            <button className="ns-cta-g" style={{ padding: ctapy, fontSize: ctasz }}>
              Request Adjustments
            </button>
          </div>
        </div>

      </div>{/* end fixed-height content shell */}

      {wizardOpen && (
        <NutritionBlueprintWizard
          onComplete={handleBlueprintComplete}
          onClose={() => setWizardOpen(false)}
        />
      )}
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

// ---- Month 1 Discovery Journey ----

type DiscoveryInsight = {
  icon: string;
  label: string;
  text: string;
  type: 'Opportunity' | 'Priority' | 'Goal' | 'Habit Pattern' | 'Strength' | 'Blueprint';
  color: string;
  bg: string;
  border: string;
};


const DISCOVERY_MISSIONS = [
  {
    id: 0,
    title: 'Understand Your Health',
    description: 'Discover what your baseline health markers reveal about your current health.',
    cta: 'Review Health Report',
    insightPreview: 'Unlock 3 health marker insights',
    time: '5 min',
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(7,28,14,0.82) 0%, rgba(107,143,113,0.40) 100%)',
    accent: '#A8C5AC',
    accentBg: 'rgba(168,197,172,0.18)',
    locked: false,
    insights: [
      { icon: '🩸', label: 'Blood Sugar', text: 'Blood sugar needs attention', type: 'Opportunity', color: '#C8604A', bg: 'rgba(200,96,74,0.08)', border: 'rgba(200,96,74,0.18)' },
      { icon: '❤️', label: 'Blood Pressure', text: 'Blood pressure should be monitored', type: 'Priority', color: '#7B68EE', bg: 'rgba(123,104,238,0.07)', border: 'rgba(123,104,238,0.16)' },
      { icon: '📊', label: 'Metabolic Risk', text: 'Moderate metabolic risk identified', type: 'Opportunity', color: '#C8604A', bg: 'rgba(200,96,74,0.06)', border: 'rgba(200,96,74,0.14)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 1,
    title: 'Know Your Risks',
    description: 'Learn the key health risks influencing your future wellbeing.',
    cta: 'View Risk Profile',
    insightPreview: 'Reveal your priority health risks',
    time: '4 min',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(28,10,10,0.82) 0%, rgba(200,96,74,0.40) 100%)',
    accent: '#E8907E',
    accentBg: 'rgba(200,96,74,0.18)',
    locked: false,
    insights: [
      { icon: '🔥', label: 'Biggest Impact', text: 'Weight management could have the biggest impact on your health', type: 'Priority', color: '#C8604A', bg: 'rgba(200,96,74,0.08)', border: 'rgba(200,96,74,0.18)' },
      { icon: '📈', label: 'Metabolic Health', text: 'Metabolic health is your highest priority area', type: 'Priority', color: '#C49A26', bg: 'rgba(212,168,67,0.08)', border: 'rgba(212,168,67,0.18)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 2,
    title: 'Build Your Health Goals',
    description: 'Define what success looks like six months from now.',
    cta: 'Set My Goals',
    insightPreview: 'Discover your personal health goals',
    time: '6 min',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(10,18,28,0.82) 0%, rgba(74,110,80,0.42) 100%)',
    accent: '#A8C5AC',
    accentBg: 'rgba(107,143,113,0.18)',
    locked: false,
    insights: [
      { icon: '🎯', label: 'Goal', text: 'Reverse diabetes', type: 'Goal', color: '#4A6E50', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
      { icon: '⚖️', label: 'Goal', text: 'Lose weight', type: 'Goal', color: '#4A6E50', bg: 'rgba(107,143,113,0.07)', border: 'rgba(107,143,113,0.16)' },
      { icon: '🚶', label: 'Goal', text: 'Improve daily activity', type: 'Goal', color: '#4A6E50', bg: 'rgba(107,143,113,0.07)', border: 'rgba(107,143,113,0.16)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 3,
    title: 'Discover Your Nutrition Patterns',
    description: 'Understand how your eating habits affect energy, weight and blood sugar.',
    cta: 'Explore Nutrition Patterns',
    insightPreview: 'Unlock 3 personalised nutrition insights',
    time: '8 min',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(20,12,4,0.82) 0%, rgba(212,168,67,0.40) 100%)',
    accent: '#F0C96A',
    accentBg: 'rgba(212,168,67,0.18)',
    locked: false,
    insights: [
      { icon: '🥗', label: 'Nutrition', text: 'Protein intake below target', type: 'Opportunity', color: '#4A6E50', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
      { icon: '🌾', label: 'Nutrition', text: 'Fibre intake needs improvement', type: 'Habit Pattern', color: '#C49A26', bg: 'rgba(212,168,67,0.07)', border: 'rgba(212,168,67,0.18)' },
      { icon: '🍪', label: 'Habit Pattern', text: 'Afternoon snacking is a common challenge', type: 'Habit Pattern', color: '#C8604A', bg: 'rgba(200,96,74,0.06)', border: 'rgba(200,96,74,0.14)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 4,
    title: 'Understand Your Sleep',
    description: 'Identify habits that affect recovery and daily energy.',
    cta: 'Explore Sleep Patterns',
    insightPreview: 'Unlock sleep and recovery findings',
    time: '5 min',
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(4,10,24,0.85) 0%, rgba(46,84,144,0.42) 100%)',
    accent: '#A8C0E8',
    accentBg: 'rgba(70,120,200,0.18)',
    locked: false,
    insights: [
      { icon: '😴', label: 'Sleep', text: 'Sleep duration below target', type: 'Opportunity', color: '#7B68EE', bg: 'rgba(123,104,238,0.07)', border: 'rgba(123,104,238,0.15)' },
      { icon: '🌙', label: 'Sleep Rhythm', text: 'Bedtime consistency needs improvement', type: 'Habit Pattern', color: '#7B68EE', bg: 'rgba(123,104,238,0.07)', border: 'rgba(123,104,238,0.15)' },
      { icon: '⚡', label: 'Recovery', text: 'Better recovery could improve energy', type: 'Strength', color: '#2E8B8B', bg: 'rgba(46,139,139,0.07)', border: 'rgba(46,139,139,0.16)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 5,
    title: 'Stress & Recovery Check',
    description: 'Understand how stress influences your health and habits.',
    cta: 'Reveal Stress Patterns',
    insightPreview: 'Reveal your stress patterns',
    time: '5 min',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(16,10,34,0.85) 0%, rgba(110,98,170,0.42) 100%)',
    accent: '#C8C0F0',
    accentBg: 'rgba(110,98,170,0.18)',
    locked: false,
    insights: [
      { icon: '🧠', label: 'Stress Trigger', text: 'Work appears to be your biggest stress trigger', type: 'Opportunity', color: '#7B68EE', bg: 'rgba(110,98,170,0.08)', border: 'rgba(110,98,170,0.18)' },
      { icon: '🍽', label: 'Habit Pattern', text: 'Stress may influence your food choices', type: 'Habit Pattern', color: '#C8604A', bg: 'rgba(200,96,74,0.06)', border: 'rgba(200,96,74,0.14)' },
      { icon: '🌿', label: 'Recovery', text: 'Recovery opportunities identified', type: 'Strength', color: '#2E8B8B', bg: 'rgba(46,139,139,0.07)', border: 'rgba(46,139,139,0.16)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 6,
    title: 'Gut Health Check',
    description: 'Discover behaviours that support digestion and long-term metabolic health.',
    cta: 'Explore Gut Health',
    insightPreview: 'Discover your gut health patterns',
    time: '6 min',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(8,20,8,0.82) 0%, rgba(74,140,80,0.40) 100%)',
    accent: '#A8C5AC',
    accentBg: 'rgba(107,143,113,0.18)',
    locked: false,
    insights: [
      { icon: '🌱', label: 'Gut Health', text: 'Fibre diversity can improve', type: 'Opportunity', color: '#4A6E50', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
      { icon: '💧', label: 'Hydration', text: 'Hydration may support digestion', type: 'Habit Pattern', color: '#5BA4CF', bg: 'rgba(91,164,207,0.07)', border: 'rgba(91,164,207,0.16)' },
      { icon: '🥬', label: 'Opportunity', text: 'Gut health opportunity identified', type: 'Opportunity', color: '#4A6E50', bg: 'rgba(107,143,113,0.07)', border: 'rgba(107,143,113,0.16)' },
    ] as DiscoveryInsight[],
  },
  {
    id: 7,
    title: 'Your Personal Health Blueprint',
    description: 'Your personalised health strategy generated from everything you\'ve discovered.',
    cta: 'Generate My Blueprint',
    insightPreview: 'Generate your complete health blueprint',
    time: '2 min',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    gradient: 'linear-gradient(160deg, rgba(24,16,0,0.90) 0%, rgba(184,132,14,0.50) 100%)',
    accent: '#F0C96A',
    accentBg: 'rgba(212,168,67,0.22)',
    locked: true,
    insights: [
      { icon: '🏆', label: 'Your Health Blueprint', text: 'Your personalised health strategy is ready', type: 'Blueprint', color: '#B8840E', bg: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.28)' },
      { icon: '1️⃣', label: 'Top Priority', text: 'Improve Sleep', type: 'Priority', color: '#7B68EE', bg: 'rgba(123,104,238,0.07)', border: 'rgba(123,104,238,0.16)' },
      { icon: '2️⃣', label: 'Priority', text: 'Improve Nutrition', type: 'Priority', color: '#4A6E50', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
      { icon: '3️⃣', label: 'Priority', text: 'Increase Activity', type: 'Priority', color: '#C49A26', bg: 'rgba(212,168,67,0.07)', border: 'rgba(212,168,67,0.18)' },
    ] as DiscoveryInsight[],
  },
];

function DiscoveryJourneySection({ done, onToggle }: { done: boolean[]; onToggle: (i: number) => void }) {
  const completedCount = done.filter(Boolean).length;
  const total = DISCOVERY_MISSIONS.length;
  const pct = Math.round((completedCount / total) * 100);
  const allPreviousDone = done.slice(0, total - 1).every(Boolean);

  return (
    <div style={{ background: '#fff' }}>

      {/* ── Section Header ── */}
      <div style={{ padding: '40px 24px 24px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '6px' }}>
          MONTH 1 · DISCOVERY
        </p>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '8px' }}>
          Your Month 1 Discovery Journey
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Over the next few weeks you&apos;ll uncover the factors shaping your health today and build the foundation for lasting change.
        </p>

        {/* Health Story progress */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px 18px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-ink)' }}>Your Health Story</p>
            <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{pct}<span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)' }}>% Discovered</span></p>
          </div>
          <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage), #F0C96A)', borderRadius: '3px' }}
            />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.4 }}>Every discovery helps us build a clearer picture of your health.</p>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div style={{ overflowX: 'auto', paddingBottom: '32px', scrollSnapType: 'x mandatory' }}>
        <div style={{ display: 'flex', gap: '14px', padding: '4px 24px' }}>
          {DISCOVERY_MISSIONS.map((mission, i) => {
            const isCompleted = done[i];
            const isLocked = mission.locked && !allPreviousDone;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                style={{
                  width: '260px', flexShrink: 0, borderRadius: '24px', overflow: 'hidden',
                  position: 'relative', scrollSnapAlign: 'start',
                  boxShadow: isLocked ? '0 2px 16px rgba(0,0,0,0.08)' : isCompleted ? '0 4px 24px rgba(107,143,113,0.18)' : '0 4px 20px rgba(0,0,0,0.10)',
                  border: isCompleted ? '1.5px solid rgba(107,143,113,0.30)' : '1px solid rgba(0,0,0,0.06)',
                  filter: isLocked ? 'grayscale(0.5) brightness(0.82)' : 'none',
                  cursor: isLocked ? 'default' : 'pointer',
                }}
              >
                {/* Card image */}
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <img
                    src={mission.img}
                    alt={mission.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: mission.gradient }} />

                  {/* Time badge */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '3px 10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{mission.time}</span>
                  </div>

                  {/* Completion badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--color-sage)', borderRadius: '20px', padding: '3px 9px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 12px rgba(107,143,113,0.40)' }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>Discovered</span>
                    </motion.div>
                  )}

                  {/* Lock icon */}
                  {isLocked && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={12} strokeWidth={2.5} color="#fff" />
                    </div>
                  )}

                  {/* Mission label */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '14px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: mission.accent, textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Mission {i + 1}</p>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 16px 18px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{mission.title}</h3>

                  {/* Insight preview strip */}
                  {!isCompleted && !isLocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: mission.accentBg, borderRadius: '8px', padding: '6px 10px' }}>
                      <Sparkles size={10} color={mission.accent} strokeWidth={2.5} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: mission.accent, lineHeight: 1.3 }}>{mission.insightPreview}</span>
                    </div>
                  )}

                  {/* Unlocked insights */}
                  {isCompleted && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {mission.insights.slice(0, 2).map((ins, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: ins.bg, borderRadius: '8px', padding: '5px 9px', border: `1px solid ${ins.border}` }}>
                          <span style={{ fontSize: '13px' }}>{ins.icon}</span>
                          <span style={{ fontSize: '11px', fontWeight: 500, color: ins.color, lineHeight: 1.3 }}>{ins.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => !isLocked && onToggle(i)}
                    style={{
                      marginTop: '2px',
                      padding: '9px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      fontSize: '12px', fontWeight: 700,
                      background: isCompleted ? 'rgba(107,143,113,0.10)' : isLocked ? 'var(--color-border)' : mission.accentBg,
                      color: isCompleted ? 'var(--color-sage)' : isLocked ? 'var(--color-muted)' : mission.accent,
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}
                  >
                    {isLocked ? (
                      <><Lock size={11} strokeWidth={2.5} /> Complete missions first</>
                    ) : isCompleted ? (
                      <><svg width="11" height="9" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> Insights Unlocked</>
                    ) : (
                      <>{mission.cta} <ArrowRight size={11} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Desktop Discovery Journey (cinematic card carousel)
function DiscoveryJourneySectionDesktop({ done, onToggle }: { done: boolean[]; onToggle: (i: number) => void }) {
  const completedCount = done.filter(Boolean).length;
  const total = DISCOVERY_MISSIONS.length;
  const pct = Math.round((completedCount / total) * 100);
  const allPreviousDone = done.slice(0, total - 1).every(Boolean);

  return (
    <div className="m1-dt-discovery-journey">
      <div className="m1-dt-dj-inner">

        {/* Header + Health Story Progress */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', gap: '60px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '8px' }}>
              MONTH 1 · DISCOVERY
            </p>
            <h2 style={{ fontSize: '44px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '12px' }}>
              Your Month 1 Discovery Journey
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '520px' }}>
              Over the next few weeks you&apos;ll uncover the factors shaping your health today and build the foundation for lasting change.
            </p>
          </div>

          {/* Your Health Story progress widget */}
          <div style={{ flexShrink: 0, width: '280px', background: 'var(--color-surface)', borderRadius: '20px', padding: '24px 26px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>Your Health Story</p>
            <p style={{ fontSize: '36px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '12px' }}>
              {pct}<span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-muted)' }}>% Discovered</span>
            </p>
            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage), #F0C96A)', borderRadius: '3px' }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>Every discovery helps us build a clearer picture of your health.</p>
          </div>
        </div>

        {/* Cinematic carousel */}
        <div className="m1-dt-dj-carousel">
          {DISCOVERY_MISSIONS.map((mission, i) => {
            const isCompleted = done[i];
            const isLocked = mission.locked && !allPreviousDone;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="m1-dt-dj-card"
                style={{
                  border: isCompleted ? '1.5px solid rgba(107,143,113,0.32)' : '1px solid rgba(0,0,0,0.07)',
                  filter: isLocked ? 'grayscale(0.45) brightness(0.80)' : 'none',
                  cursor: isLocked ? 'default' : 'pointer',
                  boxShadow: isLocked ? 'none' : isCompleted ? '0 8px 40px rgba(107,143,113,0.16)' : '0 6px 28px rgba(0,0,0,0.09)',
                }}
              >
                {/* Image area */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                  <img
                    src={mission.img}
                    alt={mission.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', transition: 'transform 0.4s ease' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: mission.gradient }} />

                  {/* Top badges */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '4px 11px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{mission.time}</span>
                    </div>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        style={{ background: 'var(--color-sage)', borderRadius: '20px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 16px rgba(107,143,113,0.45)' }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>Discovered</span>
                      </motion.div>
                    )}
                    {isLocked && (
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={12} strokeWidth={2.5} color="#fff" />
                      </div>
                    )}
                  </div>

                  {/* Mission label */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: mission.accent, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
                      Mission {i + 1}
                    </p>
                  </div>

                  {/* Premium glow for blueprint card */}
                  {mission.id === 7 && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.55, 0.3] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 70%, rgba(212,168,67,0.28) 0%, transparent 70%)', pointerEvents: 'none' }}
                    />
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px 20px 22px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                    {mission.title}
                  </h3>

                  {/* Insight preview — shown before completion */}
                  {!isCompleted && !isLocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: mission.accentBg, borderRadius: '10px', padding: '7px 11px' }}>
                      <Sparkles size={11} color={mission.accent} strokeWidth={2.5} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: mission.accent, lineHeight: 1.35 }}>{mission.insightPreview}</span>
                    </div>
                  )}

                  {/* Unlocked insights — revealed after completion */}
                  {isCompleted && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                      >
                        {mission.insights.map((ins, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', background: ins.bg, borderRadius: '9px', padding: '6px 10px', border: `1px solid ${ins.border}` }}>
                            <span style={{ fontSize: '13px', lineHeight: 1, marginTop: '1px' }}>{ins.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 500, color: ins.color, lineHeight: 1.4 }}>{ins.text}</span>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}

                  <button
                    onClick={() => !isLocked && onToggle(i)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      fontSize: '12px', fontWeight: 700,
                      background: isCompleted ? 'rgba(107,143,113,0.08)' : isLocked ? 'var(--color-border)' : mission.accentBg,
                      color: isCompleted ? 'var(--color-sage)' : isLocked ? 'var(--color-muted)' : mission.accent,
                      transition: 'all 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      marginTop: 'auto',
                    }}
                  >
                    {isLocked ? (
                      <><Lock size={11} strokeWidth={2.5} /> Complete missions first</>
                    ) : isCompleted ? (
                      <><svg width="11" height="9" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> Insights Unlocked</>
                    ) : (
                      <>{mission.cta} <ArrowRight size={11} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Month 1 Active Content (in-progress experience) ----
function Month1ActiveContent() {
  const [discoveryDone, setDiscoveryDone] = useState(Array(DISCOVERY_MISSIONS.length).fill(false) as boolean[]);
  const handleDiscoveryToggle = (i: number) => {
    const mission = DISCOVERY_MISSIONS[i];
    if (mission && !mission.locked) {
      setDiscoveryDone(prev => prev.map((v, idx) => idx === i ? !v : v));
    }
  };

  const JOURNEY = [
    { icon: '🔬', label: 'Health Assessment', sub: 'Risk profile completed',        status: 'done' as const },
    { icon: '🩸', label: 'Baseline Labs',      sub: 'Blood tests received',          status: 'done' as const },
    { icon: '🥗', label: 'Nutrition Discovery', sub: '3 more days of logging',       status: 'active' as const },
    { icon: '😴', label: 'Sleep Assessment',   sub: 'Starts after nutrition',        status: 'upcoming' as const },
    { icon: '🎯', label: 'Goal Setting',       sub: 'With Dr. Ananya · Week 4',      status: 'upcoming' as const },
  ];

  // Collect all unlocked insights from completed missions
  const unlockedInsights = DISCOVERY_MISSIONS.flatMap((m, i) => discoveryDone[i] ? m.insights.map(ins => ({ ...ins, missionTitle: m.title })) : []);


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

      {/* ── 2b. YOUR MONTH 1 DISCOVERY JOURNEY ── */}
      <DiscoveryJourneySection done={discoveryDone} onToggle={handleDiscoveryToggle} />

      {/* ── 3. MY TRANSFORMATION STORY ── */}
      <MonthTransformationStory monthNum={1} />

      {/* ── 3b. DAILY OPERATIONS ── */}
      <DailyOperationsSection monthNum={1} />

      {/* ── BIOMARKER PROGRESS SHOWCASE ── */}
      <BiomarkerProgressShowcase />

      <div style={{ padding: '0 24px 0', display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '28px' }}>

        {/* ── 4. INSIGHTS YOU'VE UNLOCKED ── */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>Insights You&apos;ve Unlocked</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Your health story so far</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '18px' }}>Every discovery mission reveals something unique about your health.</p>
          {unlockedInsights.length === 0 ? (
            <div style={{ background: 'var(--color-surface)', border: '1.5px dashed var(--color-border)', borderRadius: '20px', padding: '28px 20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>Your insights are waiting</p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55 }}>Complete a discovery mission above to reveal your first personalised health insight.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unlockedInsights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                >
                  <div style={{ fontSize: '22px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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

        {/* ── 5. MONTH 2 PREVIEW ── */}
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

        {/* ── S1b: YOUR MONTH 1 DISCOVERY JOURNEY ── */}
        <DiscoveryJourneySectionDesktop done={discoveryDone} onToggle={handleDiscoveryToggle} />

        {/* ── S1c: MY TRANSFORMATION STORY ── */}
        <MonthTransformationStory monthNum={1} />

        {/* ── S1d: DAILY OPERATIONS ── */}
        <DailyOperationsSection monthNum={1} />

        {/* ── S1e: BIOMARKER PROGRESS SHOWCASE ── */}
        <BiomarkerProgressShowcase />

        {/* ── S2: INSIGHTS YOU'VE UNLOCKED ── */}
        <div className="m1-dt-section m1-dt-section-sage">
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', gap: '40px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '8px' }}>Insights You&apos;ve Unlocked</p>
                <h3 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: '12px' }}>Your health story,<br />as it unfolds.</h3>
                <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '520px' }}>Every discovery mission reveals something unique about your health. These insights will help shape your personalised transformation journey.</p>
              </div>
              {/* Starting Point quick stats */}
              <div style={{ flexShrink: 0, display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Weight', value: '82', unit: 'kg' },
                  { label: 'Blood Sugar', value: '108', unit: 'mg/dL' },
                  { label: 'Blood Pressure', value: '138/88', unit: 'mmHg' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '18px', padding: '20px 22px', border: '1px solid var(--color-border)', textAlign: 'center' as const, minWidth: '110px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' }}>{m.label}</p>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '3px' }}>{m.value}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{m.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state */}
            {unlockedInsights.length === 0 && (
              <div style={{ background: '#fff', border: '1.5px dashed var(--color-border)', borderRadius: '28px', padding: '60px 40px', textAlign: 'center' as const, maxWidth: '560px', margin: '0 auto' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '10px', letterSpacing: '-0.02em' }}>Your insights are waiting</p>
                <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6 }}>Complete a discovery mission above to reveal your first personalised health insight.</p>
              </div>
            )}

            {/* Insight grid — mixed sizes for visual hierarchy */}
            {unlockedInsights.length > 0 && (() => {
              const featured = unlockedInsights[0]!;
              return (
              <div className="m1-dt-insights-grid">
                {/* Featured large insight — first unlocked */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="m1-dt-insight-featured"
                  style={{ background: featured.bg, border: `1.5px solid ${featured.border}` }}
                >
                  <p style={{ fontSize: '10px', fontWeight: 700, color: featured.color, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '12px' }}>Biggest Opportunity</p>
                  <p style={{ fontSize: '28px', lineHeight: 1, marginBottom: '16px' }}>{featured.icon}</p>
                  <h4 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '10px' }}>{featured.text}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6 }}>Discovered from: {featured.missionTitle}</p>
                  <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: featured.color, borderRadius: '20px', padding: '6px 14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>✦ New Insight Unlocked</span>
                  </div>
                </motion.div>

                {/* Remaining insight cards */}
                {unlockedInsights.slice(1).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                    className="m1-dt-insight-card"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px', lineHeight: 1 }}>{item.icon}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '0.10em', background: `${item.color}18`, padding: '3px 8px', borderRadius: '20px' }}>{item.type}</span>
                    </div>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: item.color, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.45 }}>{item.text}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>{item.missionTitle}</p>
                  </motion.div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>

        {/* ── S3: MONTH 2 PREVIEW — Cinematic Transition Banner ── */}
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

        /* Insights grid — masonry-style mixed sizes */
        .m1-dt-insights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: auto;
          gap: 20px;
          align-items: start;
        }
        .m1-dt-insight-featured {
          grid-column: span 2;
          border-radius: 28px;
          padding: 36px 32px 32px;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .m1-dt-insight-featured:hover { transform: translateY(-3px); box-shadow: 0 12px 48px rgba(0,0,0,0.10); }
        .m1-dt-insight-card {
          border-radius: 24px;
          padding: 24px 22px;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .m1-dt-insight-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

        /* Discovery Journey section */
        .m1-dt-discovery-journey { background: #ffffff; }
        .m1-dt-dj-inner { max-width: 1600px; margin: 0 auto; padding: 80px 80px 72px; }
        .m1-dt-dj-carousel {
          display: flex; gap: 20px;
          overflow-x: auto; padding-bottom: 8px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; scrollbar-color: var(--color-border) transparent;
        }
        .m1-dt-dj-carousel::-webkit-scrollbar { height: 4px; }
        .m1-dt-dj-carousel::-webkit-scrollbar-track { background: transparent; }
        .m1-dt-dj-carousel::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
        .m1-dt-dj-card {
          flex-shrink: 0; width: 320px; border-radius: 20px; overflow: hidden;
          background: #fff; scroll-snap-align: start;
          display: flex; flex-direction: column;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .m1-dt-dj-card:hover { transform: translateY(-4px); }

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
        .m1-dt-dj-inner { padding: 96px 96px 88px; }
        .m1-dt-dj-card { width: 360px; }
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
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        /* Foundations workspace — 65/35 */
        .m2-dt-foundations-workspace { display: grid; grid-template-columns: 65fr 35fr; gap: 32px; align-items: start; }
        .m2-dt-foundations-right { display: flex; flex-direction: column; gap: 20px; }
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
      {/* ── DAILY OPERATIONS (mobile Month 2) ── */}
      <div className="m2-mobile-only">
        <DailyOperationsSection monthNum={2} />
      </div>
      {/* ── BIOMARKER PROGRESS SHOWCASE (mobile Month 2) ── */}
      <div className="m2-mobile-only">
        <BiomarkerProgressShowcase />
      </div>

      {/* ── 4 + 5. FOUNDATIONS + MONTH 3 PREVIEW (mobile) ── */}
      <div className="m2-mobile-only" style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px' }}>Month 2 · Foundations</p>
          <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '4px' }}>Your Foundations Are Taking Shape</p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.55 }}>Consistency is building confidence.</p>
        </div>

        {/* Strongest Foundation card */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 6px 24px rgba(0,0,0,0.16)' }}>
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85" alt="Daily Movement"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,18,10,0.94) 0%, rgba(0,0,0,0) 55%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '8px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(168,197,172,0.70)', textTransform: 'uppercase' as const, letterSpacing: '0.14em' }}>Your Strongest Foundation</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(107,143,113,0.25)', backdropFilter: 'blur(10px)', borderRadius: '18px', padding: '4px 11px', border: '1px solid rgba(168,197,172,0.28)', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '13px' }}>🚶</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Daily Movement</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25 }}>Movement is becoming part of your routine.</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['14 day consistency', '82% adherence'].map((pill, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>{pill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* This Week's Focus */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: '#C49A26', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>This Week&apos;s Focus</p>
            <span style={{ fontSize: '20px' }}>🥚</span>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Protein At Breakfast</p>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55 }}>Adding protein early in the day can improve satiety, energy and recovery.</p>
        </div>

        {/* Coach Insight */}
        <div style={{ background: 'rgba(107,143,113,0.06)', border: '1px solid rgba(107,143,113,0.16)', borderRadius: '18px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(107,143,113,0.30)' }}>
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Dr. Ananya Rao</p>
              <p style={{ fontSize: '11px', color: 'var(--color-sage)' }}>Your Health Coach</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;You&apos;ve built excellent momentum with activity. Now let&apos;s focus on meal consistency.&rdquo;
          </p>
        </div>

        {/* Month 3 Preview */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
          <img src="https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&q=80" alt="Month 3 — Metabolic Correction"
            style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.80) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Coming Next</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '4px' }}>Month 3 · Sleep Better, Feel Better</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Metabolic Correction</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, marginBottom: '12px' }}>Sleep. Recovery. Blood sugar optimisation.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {['😴 Sleep', '🩸 Blood Sugar', '🌿 Gut Health', '⚡ Recovery'].map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: '8px' }} />
      </div>

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

              {/* ── Continue Journey CTA ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
                style={{ marginTop: '22px' }}
              >
                <a
                  href="/today?tab=month2"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '9px',
                    background: '#fff', color: '#1C2B1E',
                    borderRadius: '12px', padding: '13px 22px',
                    fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.24)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)'; }}
                >
                  Continue Journey
                  <ChevronRight size={15} strokeWidth={2.5} />
                </a>
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

        {/* ── S2c: DAILY OPERATIONS ── */}
        <DailyOperationsSection monthNum={2} />

        {/* ── S2b: BIOMARKER PROGRESS SHOWCASE ── */}
        <BiomarkerProgressShowcase />

        {/* ── S3: YOUR FOUNDATIONS ARE TAKING SHAPE ── */}
        <div style={{ background: '#EEF3EF', padding: '56px 64px' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

            {/* Compact section header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '36px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '6px' }}>Month 2 · Foundations</p>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.05 }}>
                  Your Foundations Are Taking Shape
                </h2>
              </div>
            </div>

            {/* 65 / 35 workspace */}
            <div className="m2-dt-foundations-workspace">

              {/* LEFT 65%: Cinematic Foundation Card — compact height */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', minHeight: '360px', boxShadow: '0 8px 36px rgba(0,0,0,0.18)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=90"
                  alt="Daily Movement"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(7,23,16,0.50) 0%, rgba(5,16,10,0.18) 45%, rgba(0,0,0,0.02) 70%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,18,10,0.94) 0%, rgba(0,0,0,0) 52%)' }} />

                <div style={{ position: 'relative', zIndex: 1, height: '100%', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '36px 40px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.16em', marginBottom: '10px' }}>Your Strongest Foundation</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(107,143,113,0.22)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '6px 14px', border: '1px solid rgba(168,197,172,0.26)', marginBottom: '14px', alignSelf: 'flex-start' }}>
                    <span style={{ fontSize: '16px' }}>🚶</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Daily Movement</span>
                  </div>
                  <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>
                    Movement is becoming part of your routine.
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: '420px', marginBottom: '18px' }}>
                    Small actions repeated consistently are creating lasting change.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '18px' }}>
                    {['14 day consistency', '82% adherence', '+900 steps/day'].map((pill, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.14)' }}>{pill}</span>
                    ))}
                  </div>
                  <button style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)', borderRadius: '14px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                    View Habit Progress <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>

              {/* RIGHT 35%: Coach Insight + This Week's Focus */}
              <div className="m2-dt-foundations-right">

                {/* Coach Insight */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16, duration: 0.42 }}
                  style={{ background: 'linear-gradient(135deg, rgba(107,143,113,0.08) 0%, rgba(107,143,113,0.04) 100%)', borderRadius: '22px', padding: '26px', border: '1px solid rgba(107,143,113,0.18)', flex: 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(107,143,113,0.32)' }}>
                      <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)' }}>Dr. Ananya Rao</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-sage)', fontWeight: 500 }}>Your Health Coach</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    &ldquo;You&apos;ve built excellent momentum with activity. Now let&apos;s focus on meal consistency to strengthen your foundation.&rdquo;
                  </p>
                </motion.div>

                {/* This Week's Focus */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.26, duration: 0.42 }}
                  style={{ background: '#fff', borderRadius: '22px', padding: '26px', border: '1px solid var(--color-border)', boxShadow: '0 3px 18px rgba(0,0,0,0.06)', flex: 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#C49A26', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>This Week&apos;s Focus</p>
                      <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Protein At Breakfast</h4>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(196,154,38,0.10)', border: '1px solid rgba(196,154,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🥚</div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                    Adding protein early in the day improves satiety, energy and metabolic recovery.
                  </p>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(196,154,38,0.09)', border: '1px solid rgba(196,154,38,0.20)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: '#C49A26', cursor: 'pointer' }}>
                    Learn Why <ArrowRight size={11} />
                  </button>
                </motion.div>

              </div>
            </div>
          </div>
        </div>

        {/* ── S4: MONTH 3 PREVIEW ── */}
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

      {/* ── DAILY OPERATIONS ── */}
      <DailyOperationsSection monthNum={monthNum} />

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

        {/* ── S5c: DAILY OPERATIONS ── */}
        <DailyOperationsSection monthNum={monthNum} />

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
          {/* Hero */}
          <div style={{
            position: 'relative',
            background: cd.heroGradient,
            padding: '32px 36px 36px',
            overflow: 'hidden',
            minHeight: '240px',
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
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: cd.iconBg, border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <cd.IconComponent size={24} color={cd.iconColor} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: cd.taglineColor, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                Chapter {phase.num} · {phase.journeyLabel}
              </p>
              <p style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.30)', marginBottom: '12px' }}>
                {phase.title}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 400, color: cd.taglineColor, lineHeight: 1.6, letterSpacing: '0.01em', maxWidth: '380px' }}>
                {phase.tagline}
              </p>
            </div>
          </div>

          {/* Focus pills */}
          <div style={{ background: '#fff', borderTop: `1px solid ${theme.tileBorder}`, padding: '18px 36px 22px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' as const, color: 'rgba(0,0,0,0.26)', marginBottom: '12px' }}>
              Your Focus This Chapter
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
              {phase.tiles.map(tile => (
                <div key={tile.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: theme.iconBg, border: `1px solid ${theme.tileBorder}`, borderRadius: '24px', padding: '7px 15px' }}>
                  <span style={{ fontSize: '14px', lineHeight: 1 }}>{tile.icon}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY ENGINE — types from hplus-store (imported at top of file)
// ─────────────────────────────────────────────────────────────────────────────

// Assigned meal plan for today (Phase 2: fetch from API)
interface MealPlanEntry {
  name: string;
  items: string[];
  time: string;
  badge?: 'recommended' | 'coach-selected';
  tags?: ('protein' | 'fiber' | 'balanced')[];
  img?: string;
}

const TODAYS_MEAL_PLAN: Record<string, MealPlanEntry> = {
  breakfast: {
    name: 'Breakfast', items: ['Chole Curry', '2 Millet Rotis'], time: '8:00 AM',
    badge: 'recommended', tags: ['protein', 'fiber'],
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
  },
  snack1:    {
    name: 'Morning Snack', items: ['Soaked Walnuts', 'Almonds (10)'], time: '11:00 AM',
    badge: 'coach-selected', tags: ['protein'],
    img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80',
  },
  lunch:     {
    name: 'Lunch', items: ['Dal Khichdi', 'Raita', 'Salad'], time: '1:00 PM',
    badge: 'recommended', tags: ['balanced', 'fiber'],
    img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80',
  },
  snack2:    {
    name: 'Evening Snack', items: ['Greek Yogurt', 'Cucumber Slices'], time: '4:30 PM',
    badge: 'coach-selected', tags: ['protein'],
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  },
  dinner:    {
    name: 'Dinner', items: ['Grilled Paneer', 'Brown Rice', 'Stir-fried Veggies'], time: '7:30 PM',
    badge: 'recommended', tags: ['protein', 'balanced'],
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
  },
};

const NEXT_MEAL_KEY = 'lunch'; // Phase 2: compute from current time

// Meal history — last 20 logged (Phase 2: fetch from API / localStorage)
interface MealHistoryEntry {
  name: string;
  lastLogged: string; // display string
  slot: string;
}
const MEAL_HISTORY: MealHistoryEntry[] = [
  { name: 'Pumpkin Thepla + Mint Chutney',         lastLogged: 'Yesterday',   slot: 'breakfast' },
  { name: 'Vegetable Upma + Flax Seeds',            lastLogged: '2 days ago',  slot: 'breakfast' },
  { name: 'Curd + Sprouts Thalipeeth',              lastLogged: '3 days ago',  slot: 'lunch' },
  { name: 'Moong Dal Chilla + Green Chutney',       lastLogged: '3 days ago',  slot: 'breakfast' },
  { name: 'Palak Soup + Multigrain Bread',          lastLogged: '4 days ago',  slot: 'dinner' },
  { name: 'Paneer Bhurji + 2 Rotis',               lastLogged: '4 days ago',  slot: 'dinner' },
  { name: 'Methi Paratha + Pickle',                 lastLogged: '5 days ago',  slot: 'breakfast' },
  { name: 'Chickpea Salad Bowl',                   lastLogged: '5 days ago',  slot: 'lunch' },
  { name: 'Rajma Chawal + Salad',                  lastLogged: '6 days ago',  slot: 'lunch' },
  { name: 'Masoor Dal + Brown Rice + Sabzi',        lastLogged: '6 days ago',  slot: 'dinner' },
  { name: 'Banana + Peanut Butter',                lastLogged: '1 week ago',  slot: 'snack1' },
  { name: 'Oats Porridge + Berries',               lastLogged: '1 week ago',  slot: 'breakfast' },
  { name: 'Kadhi + Rice',                          lastLogged: '1 week ago',  slot: 'lunch' },
  { name: 'Sprouts Chaat',                         lastLogged: '8 days ago',  slot: 'snack2' },
  { name: 'Egg White Omelette + Toast',            lastLogged: '9 days ago',  slot: 'breakfast' },
  { name: 'Vegetable Pulao + Raita',               lastLogged: '10 days ago', slot: 'dinner' },
  { name: 'Mixed Nuts + Dark Chocolate',           lastLogged: '10 days ago', slot: 'snack2' },
  { name: 'Sambar + Idli (2)',                     lastLogged: '11 days ago', slot: 'breakfast' },
  { name: 'Grilled Chicken + Quinoa',              lastLogged: '11 days ago', slot: 'dinner' },
  { name: 'Poha + Coconut Chutney',                lastLogged: '12 days ago', slot: 'breakfast' },
];

// Meal slot config
interface MealSlotConfig {
  label: string;
  emoji: string;
  time: string;
  accent: string;
  bg: string;
  border: string;
  img: string;
}
const MEAL_SLOTS: Record<string, MealSlotConfig> = {
  breakfast: {
    label: 'Breakfast', emoji: '🌅', time: '7–9 AM',
    accent: '#D4A843', bg: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.35)',
    img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&q=80',
  },
  snack1: {
    label: 'Morning Snack', emoji: '🌿', time: '10–11 AM',
    accent: '#6B8F71', bg: 'rgba(107,143,113,0.12)', border: 'rgba(107,143,113,0.35)',
    img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300&q=80',
  },
  lunch: {
    label: 'Lunch', emoji: '☀️', time: '12–2 PM',
    accent: '#E8A030', bg: 'rgba(232,160,48,0.12)', border: 'rgba(232,160,48,0.35)',
    img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=300&q=80',
  },
  snack2: {
    label: 'Evening Snack', emoji: '🍵', time: '4–5 PM',
    accent: '#A87BB0', bg: 'rgba(168,123,176,0.12)', border: 'rgba(168,123,176,0.35)',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80',
  },
  dinner: {
    label: 'Dinner', emoji: '🌙', time: '7–9 PM',
    accent: '#7B8FC8', bg: 'rgba(123,143,200,0.12)', border: 'rgba(123,143,200,0.35)',
    img: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=80',
  },
};

// Coaching messages per adherence level
const ADHERENCE_MESSAGES: Record<string, string> = {
  exact:   'Consistent meals are strongly linked to improved glucose control.',
  mostly:  'Staying close to your plan supports steady metabolic improvement.',
  changes: 'Every mindful choice — even modified — builds the habit.',
  custom:  'Logging what you actually eat gives your coach the full picture.',
};

// Points per adherence level
const ADHERENCE_POINTS: Record<string, number> = {
  exact: 2, mostly: 2, changes: 1, custom: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTION LOGGING MODAL
// ─────────────────────────────────────────────────────────────────────────────

type MealAdherenceLevel = 'exact' | 'mostly' | 'changes' | 'custom';
type MealChangeTag = 'different-protein' | 'different-carb' | 'different-veg' | 'added-item' | 'removed-item' | 'other';

type LoggingSheet =
  | { type: 'closed' }
  | {
      type: 'meal';
      step: 'slot-select' | 'plan-meal' | 'history-meal' | 'custom-meal' | 'adherence' | 'adherence-changes' | 'portion' | 'components' | 'success';
      selectedSlot?: string;
      selectedMeal?: string;       // key into TODAYS_MEAL_PLAN
      historyMeal?: string;        // name string from MEAL_HISTORY
      customMealName?: string;
      customPortion?: string;      // '25' | '50' | '75' | '100' | custom string
      customUnit?: string;
      adherenceLevel?: MealAdherenceLevel;
      changeTags?: MealChangeTag[];
      portionPct?: number;         // 25 | 50 | 75 | 100
      skippedComponents?: string[];
      logDate?: string;            // ISO date 'YYYY-MM-DD'
      logTime?: string;            // 'HH:MM' 24h
      notes?: string;
      earnedPoints?: number;
      altDescription?: string;     // legacy compat
    }
  | { type: 'exercise'; step: 'pick' | 'duration' | 'intensity' | 'reflection' | 'success'; activity?: string; duration?: number; intensity?: string; feeling?: string }
  | { type: 'water'; step: 'pick' | 'context' | 'success'; amount?: number; context?: string }
  | { type: 'sleep'; step: 'bedtime' | 'waketime' | 'quality' | 'interruptions' | 'sunlight-prompt' | 'success'; bedtime?: string; waketime?: string; quality?: string; interruptions?: number; morningLight?: boolean }
  | { type: 'sunlight'; step: 'pick' | 'success'; minutes?: number }
  | { type: 'meditation'; step: 'pick' | 'log-duration' | 'feeling' | 'session-prep' | 'active' | 'post-feeling' | 'success'; minutes?: number; feeling?: string; postFeeling?: string; sessionType?: 'log' | 'live' }
  | { type: 'mood'; step: 'pick' | 'influences' | 'reflection' | 'success'; mood?: number; moodLabel?: string; influences?: string[] }
  | { type: 'biomarker'; step: 'pick' | 'glucose-context' | 'glucose-value' | 'bp-entry' | 'weight-value' | 'weight-timing' | 'waist-value' | 'success'; metric?: string; value?: string; value2?: string; context?: string; timing?: string };

interface ActionLoggingModalProps {
  sheet: LoggingSheet;
  setSheet: React.Dispatch<React.SetStateAction<LoggingSheet>>;
  hplus: HPlusEngineState;
  setHplus: React.Dispatch<React.SetStateAction<HPlusEngineState>>;
  categoryProgress: CategoryProgress[];
  setCategoryProgress: React.Dispatch<React.SetStateAction<CategoryProgress[]>>;
  onLogged: (cat: ActivityCategory, points: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION LOGGING MODAL — premium cinematic modal experience
// ─────────────────────────────────────────────────────────────────────────────

// Card images for the carousel
const ACTION_CARD_IMAGES: Record<ActivityCategory | 'nudges', string> = {
  meal:       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
  exercise:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
  water:      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=85',
  sleep:      'https://images.unsplash.com/photo-1631157769375-b15a86e0eb64?w=800&q=85',
  sunlight:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85',
  meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=85',
  mood:       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=85',
  biomarker:  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=85',
  nudges:     'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85',
};

// Exercise activity images
const EXERCISE_IMAGES: Record<string, string> = {
  Walk:       'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
  Strength:   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  Yoga:       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
  Cardio:     'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80',
  Sports:     'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  Cycling:    'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&q=80',
  Swimming:   'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
  Stretching: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
};

// Biomarker images
const BIOMARKER_IMAGES: Record<string, string> = {
  glucose:  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  bp:       'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&q=80',
  weight:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  waist:    'https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=600&q=80',
};

const ENCOURAGEMENTS = [
  'Consistency builds transformation.',
  'Every healthy choice compounds.',
  'Small actions. Big transformation.',
  'You\'re building real momentum.',
  'Keep going. It\'s working.',
  'Progress is a daily practice.',
];

function ActionLoggingModal({ sheet, setSheet, hplus, setHplus, categoryProgress, setCategoryProgress, onLogged }: ActionLoggingModalProps) {
  const [bioValue, setBioValue] = useState('');
  const [bioValue2, setBioValue2] = useState('');
  const [bioNotes, setBioNotes] = useState('');
  // Numeric state for premium ± selectors (biomarkers)
  const [bioNumVal, setBioNumVal] = useState(700);   // stored as ×10 for one decimal: 700 = 70.0 kg
  const [bioNum2Val, setBioNum2Val] = useState(800);  // same — waist cm ×1, glucose mg/dL ×1, bp ×1
  const bioLPRef = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>(null);
  const bioLP2Ref = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>(null);
  const [customMealName, setCustomMealName] = useState('');
  const [customUnit, setCustomUnit] = useState('Bowl');
  const [customPortion, setCustomPortion] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const [selectedChangeTags, setSelectedChangeTags] = useState<MealChangeTag[]>([]);
  const [skippedComponents, setSkippedComponents] = useState<string[]>([]);
  const [moodInfluences, setMoodInfluences] = useState<string[]>([]);
  const [moodReflection, setMoodReflection] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [waterGlasses, setWaterGlasses] = useState(1);
  const [sunlightMinutes, setSunlightMinutes] = useState(10);
  const sunlightLongPressRef = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>(null);
  const [meditationMinutes, setMeditationMinutes] = useState(10);
  const [meditationSecsLeft, setMeditationSecsLeft] = useState(600);
  const [meditationPaused, setMeditationPaused] = useState(false);
  const [meditationPromptIdx, setMeditationPromptIdx] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const meditationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meditationBreathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meditationLongPressRef = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartVal = useRef<number>(30);
  const [sleepBedtime, setSleepBedtime] = useState('10:30 PM');
  const [sleepWaketime, setSleepWaketime] = useState('6:30 AM');
  const bedtimeInputRef = useRef<HTMLInputElement>(null);
  const waketimeInputRef = useRef<HTMLInputElement>(null);
  // logDate: ISO string 'YYYY-MM-DD', defaults to today
  const [logDate, setLogDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  // logTime: 'HH:MM' (24h, for native <input type="time">)
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  });
  const isOpen = sheet.type !== 'closed';

  const close = () => {
    setSheet({ type: 'closed' });
    setBioValue('');
    setBioValue2('');
    setBioNotes('');
    setBioNumVal(700);
    setBioNum2Val(800);
    if (bioLPRef.current) { clearInterval(bioLPRef.current as unknown as ReturnType<typeof setInterval>); clearTimeout(bioLPRef.current as unknown as ReturnType<typeof setTimeout>); bioLPRef.current = null; }
    if (bioLP2Ref.current) { clearInterval(bioLP2Ref.current as unknown as ReturnType<typeof setInterval>); clearTimeout(bioLP2Ref.current as unknown as ReturnType<typeof setTimeout>); bioLP2Ref.current = null; }
    setCustomMealName('');
    setCustomUnit('Bowl');
    setCustomPortion('');
    setMealNotes('');
    setSelectedChangeTags([]);
    setSkippedComponents([]);
    setMoodInfluences([]);
    setMoodReflection('');
    setSleepBedtime('10:30 PM');
    setSleepWaketime('6:30 AM');
    setExerciseDuration(30);
    setWaterGlasses(1);
    setSunlightMinutes(10);
    setMeditationMinutes(10);
    setMeditationSecsLeft(600);
    setMeditationPaused(false);
    setMeditationPromptIdx(0);
    setBreathPhase('inhale');
    if (meditationTimerRef.current) { clearInterval(meditationTimerRef.current); meditationTimerRef.current = null; }
    if (meditationBreathRef.current) { clearInterval(meditationBreathRef.current); meditationBreathRef.current = null; }
    const now = new Date();
    setLogDate(now.toISOString().slice(0, 10));
    setLogTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  };

  const awardPoints = (cat: ActivityCategory, pts: number, label?: string, value?: string) => {
    onLogged(cat, pts);
    void setHplus; void setCategoryProgress;
    void label; void value;
  };

  if (!isOpen) return null;

  const encouragement = ENCOURAGEMENTS[hplus.score % ENCOURAGEMENTS.length] ?? ENCOURAGEMENTS[0];

  // ─── SHARED FRAMEWORK COMPONENTS ─────────────────────────────────────────

  // StepIndicator — unified progress bar used by every flow
  const StepIndicator = ({ current, total, accentColor }: { current: number; total: number; accentColor?: string }) => {
    const accent = accentColor ?? '#6B8F71';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px 0' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < current ? accent : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
        ))}
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginLeft: '6px', flexShrink: 0 }}>
          {current}/{total}
        </span>
      </div>
    );
  };

  // HeroImageBand — persistent hero used on every step of every flow
  const HeroImageBand = ({ imgSrc, label, sublabel, accentColor, coachNote }: { imgSrc: string; label: string; sublabel?: string; accentColor?: string; coachNote?: string }) => (
    <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={imgSrc} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(8,18,12,0.82) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '18px', left: '28px', right: '28px' }}>
        {sublabel && <p style={{ fontSize: '10px', fontWeight: 700, color: accentColor ? `${accentColor}CC` : 'rgba(168,197,172,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>{sublabel}</p>}
        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>{label}</h3>
        {coachNote && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', lineHeight: 1.4, fontStyle: 'italic' }}>{coachNote}</p>}
      </div>
    </div>
  );

  // ── ActivityDateTimeSelector — universal date/time picker for every logging flow ──
  // Helpers: format ISO date for display, compute today/yesterday ISO strings
  const todayISO = (() => { const d = new Date(); return d.toISOString().slice(0, 10); })();
  const yesterdayISO = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })();
  const formatDateDisplay = (iso: string) => {
    const [y, mo, day] = iso.split('-').map(Number);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[(mo ?? 1) - 1]} ${day}, ${y}`;
  };
  const formatTimeDisplay = (hhmm: string) => {
    const [hStr, mStr] = hhmm.split(':');
    const h = parseInt(hStr ?? '0');
    const m = mStr ?? '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // LastLoggedBar — shows historical context only (not KPI counts or targets)
  const LastLoggedBar = ({ text }: { text: string }) => (
    <div style={{ padding: '10px 24px 0' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>{text}</p>
    </div>
  );

  // ActivityDateTimeSelector — two pill selectors: date + time
  const ActivityDateTimeSelector = () => (
    <div style={{ display: 'flex', gap: '8px', padding: '12px 24px 0' }}>
      {/* Date selector */}
      <div style={{ position: 'relative', flex: 1 }}>
        <label style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', overflow: 'hidden' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <rect x="1" y="2.5" width="11" height="9.5" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1"/>
            <path d="M4 1v3M9 1v3M1 6h11" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', flex: 1 }}>
            {logDate === todayISO ? 'Today' : logDate === yesterdayISO ? 'Yesterday' : formatDateDisplay(logDate)}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
            <path d="M2 3.5l3 3 3-3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {/* Native date input — hidden but drives the picker */}
          <input
            type="date"
            value={logDate}
            max={todayISO}
            onChange={e => setLogDate(e.target.value || todayISO)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </label>
      </div>
      {/* Time selector */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <label style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', overflow: 'hidden' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1"/>
            <path d="M6.5 3.5V6.5l2 1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' as const }}>
            {formatTimeDisplay(logTime)}
          </span>
          <input
            type="time"
            value={logTime}
            onChange={e => setLogTime(e.target.value || logTime)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </label>
      </div>
    </div>
  );

  // Keep SharedDateTimeBar as alias for backward compat with meal steps that use it
  const SharedDateTimeBar = () => <ActivityDateTimeSelector />;
  void LastLoggedBar; // used selectively

  // SuccessScreen — unified richly-tailored success experience
  const SuccessScreen = ({
    points, label, subtitle, details,
  }: {
    points: number;
    label?: string;
    subtitle?: string;
    details?: Array<{ icon: string; label: string; value: string }>;
  }) => {
    useEffect(() => {
      const t = setTimeout(close, 3200);
      return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div style={{ position: 'relative', minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px 36px', textAlign: 'center' as const, overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 300 }}
          style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(107,143,113,0.28) 0%, rgba(107,143,113,0.1) 100%)', border: '1.5px solid rgba(107,143,113,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px', position: 'relative', zIndex: 1, boxShadow: '0 0 48px rgba(107,143,113,0.35)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#6B8F71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.38 }} style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {label && <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>✓ {label}</p>}

          {/* Tailored detail rows */}
          {details && details.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' as const, marginBottom: '20px' }}>
              {details.map((d, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '10px 16px', minWidth: '80px' }}>
                  <p style={{ fontSize: '18px', margin: '0 0 2px', lineHeight: 1 }}>{d.icon}</p>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{d.value}</p>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.label}</p>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: '52px', fontWeight: 900, color: '#D4A843', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '6px' }}>+{points} H+</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            {hplus.score - points}&thinsp;<span style={{ color: 'rgba(255,255,255,0.28)' }}>→</span>&thinsp;<span style={{ color: '#D4A843' }}>{hplus.score}</span>
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '20px', padding: '5px 14px', marginBottom: subtitle ? '18px' : '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(212,168,67,0.9)' }}>🔥 {hplus.streak}-day streak</span>
          </div>
          {subtitle && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '380px', margin: '0 auto' }}>&ldquo;{subtitle}&rdquo;</p>}
        </motion.div>
      </div>
    );
  };

  // ── renderContent by type ──────────────────────────────────────────────────
  const renderContent = () => {
    // ─── MEAL ─────────────────────────────────────────────────────────────────
    if (sheet.type === 'meal') {

      // Meal flow uses ActivityDateTimeSelector — backStep navigation is now handled by the unified modal header
      const DateTimeBar = (_props: { backStep?: string }) => <ActivityDateTimeSelector />;

      // ── Success ──────────────────────────────────────────────────────────────
      if (sheet.step === 'success') {
        const loggedMeal = sheet.selectedMeal ? TODAYS_MEAL_PLAN[sheet.selectedMeal] : undefined;
        const histMeal = sheet.historyMeal;
        const customName = sheet.customMealName;
        const mealLabel = loggedMeal ? loggedMeal.name : histMeal ?? customName ?? 'Meal';
        const adherence = sheet.adherenceLevel;
        const pts = sheet.earnedPoints ?? 2;
        const dateStr = sheet.logDate
          ? (sheet.logDate === todayISO ? 'Today' : sheet.logDate === yesterdayISO ? 'Yesterday' : formatDateDisplay(sheet.logDate))
          : 'Today';
        const timeStr = sheet.logTime ? formatTimeDisplay(sheet.logTime) : formatTimeDisplay(logTime);
        const coachMsg = adherence ? ADHERENCE_MESSAGES[adherence] : ADHERENCE_MESSAGES.exact;
        const adherenceLabel: Record<string, string> = {
          exact: 'Followed as planned', mostly: 'Mostly followed',
          changes: 'Modified', custom: 'Custom meal',
        };
        const slotCfg = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;

        const MealSuccessScreen = () => {
          useEffect(() => {
            const t = setTimeout(close, 3200);
            return () => clearTimeout(t);
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);

          return (
            <div style={{ position: 'relative', minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' as const, overflow: 'hidden' }}>
              {/* Glows */}
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

              {/* Check */}
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(107,143,113,0.28) 0%, rgba(107,143,113,0.1) 100%)', border: '1.5px solid rgba(107,143,113,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative', zIndex: 1, boxShadow: '0 0 48px rgba(107,143,113,0.3)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#6B8F71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.38 }} style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {/* Slot + meal name */}
                {slotCfg && (
                  <p style={{ fontSize: '11px', fontWeight: 700, color: slotCfg.accent, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px', opacity: 0.85 }}>
                    {slotCfg.emoji} {slotCfg.label}
                  </p>
                )}
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em' }}>{mealLabel} logged</p>
                {/* Date/time + adherence row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{dateStr} · {timeStr}</span>
                  {adherence && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: adherence === 'exact' || adherence === 'mostly' ? '#A8C5AC' : '#D4A843', background: adherence === 'exact' || adherence === 'mostly' ? 'rgba(107,143,113,0.18)' : 'rgba(212,168,67,0.14)', border: `1px solid ${adherence === 'exact' || adherence === 'mostly' ? 'rgba(107,143,113,0.35)' : 'rgba(212,168,67,0.3)'}`, borderRadius: '12px', padding: '2px 9px' }}>
                      {adherenceLabel[adherence]}
                    </span>
                  )}
                </div>

                {/* Points */}
                <p style={{ fontSize: '44px', fontWeight: 900, color: '#D4A843', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '6px' }}>+{pts} H+</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  {hplus.score - pts}&thinsp;<span style={{ color: 'rgba(255,255,255,0.28)' }}>→</span>&thinsp;<span style={{ color: '#D4A843' }}>{hplus.score}</span>
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '20px', padding: '4px 12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(212,168,67,0.9)' }}>🔥 {hplus.streak}-day streak</span>
                </div>

                {/* Coaching insight */}
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '320px', margin: '0 auto' }}>
                  &ldquo;{coachMsg}&rdquo;
                </p>
              </motion.div>
            </div>
          );
        };

        return <MealSuccessScreen />;
      }

      // ── Step: Slot select ────────────────────────────────────────────────────
      if (sheet.step === 'slot-select') {
        const slotKeys = Object.keys(MEAL_SLOTS);
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.meal} label="What did you eat?" sublabel="Log Nutrition" coachNote="Every logged meal builds your coach's understanding of your patterns." />
            <StepIndicator current={1} total={5} accentColor="#D4A843" />
            <ActivityDateTimeSelector />

            {/* Meal slot cards — horizontal scroll */}
            <div style={{ padding: '8px 24px 4px', overflowX: 'auto', scrollbarWidth: 'none' as const, WebkitOverflowScrolling: 'touch' as const } as React.CSSProperties}>
              <div style={{ display: 'flex', gap: '10px', paddingBottom: '4px', width: 'max-content' }}>
                {slotKeys.map(key => {
                  const slot = MEAL_SLOTS[key]!;
                  const isNext = key === NEXT_MEAL_KEY;
                  return (
                    <motion.button key={key}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSheet({ type: 'meal', step: 'plan-meal', selectedSlot: key, logDate, logTime })}
                      style={{ width: '100px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      {/* Image */}
                      <div style={{ position: 'relative', height: '72px', borderRadius: '14px', overflow: 'hidden', border: isNext ? `2px solid ${slot.accent}` : '1.5px solid rgba(255,255,255,0.1)', boxShadow: isNext ? `0 0 16px ${slot.accent}44` : 'none' }}>
                        <img src={slot.img} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%)' }} />
                        <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '18px', lineHeight: 1 }}>{slot.emoji}</span>
                        {isNext && (
                          <div style={{ position: 'absolute', top: '5px', right: '5px', background: slot.accent, borderRadius: '8px', padding: '1px 5px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#000' }}>NEXT</span>
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <p style={{ fontSize: '11px', fontWeight: 700, color: isNext ? slot.accent : 'rgba(255,255,255,0.7)', marginTop: '6px', marginBottom: '1px', textAlign: 'center' as const }}>{slot.label}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', textAlign: 'center' as const, fontWeight: 500 }}>{slot.time}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '4px 24px 24px' }}>
              <button onClick={() => setSheet({ type: 'meal', step: 'custom-meal', selectedSlot: undefined, logDate, logTime })}
                style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                + Log a custom meal
              </button>
            </div>
          </>
        );
      }

      // ── Step: Plan meal (from your plan) ──────────────────────────────────────
      if (sheet.step === 'plan-meal' && sheet.selectedSlot) {
        const slot = MEAL_SLOTS[sheet.selectedSlot]!;
        const planMeal = TODAYS_MEAL_PLAN[sheet.selectedSlot];
        const historyForSlot = MEAL_HISTORY.filter(h => h.slot === sheet.selectedSlot).slice(0, 5);

        return (
          <>
            <HeroImageBand imgSrc={slot.img} label={`${slot.emoji} ${slot.label}`} sublabel={slot.time} accentColor={slot.accent} />
            <StepIndicator current={2} total={5} accentColor={slot.accent} />
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* From Your Plan */}
              {planMeal && (
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>From Your Plan</p>
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSkippedComponents([]); setSheet({ type: 'meal', step: 'adherence', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedSlot, logDate, logTime }); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '12px', background: slot.bg, border: `1.5px solid ${slot.border}`, borderRadius: '18px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' as const, boxShadow: `0 0 24px ${slot.accent}18` }}>
                    {/* Mini food image */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={planMeal.img ?? slot.img} alt={planMeal.items[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                        {planMeal.badge && (
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: '8px',
                            background: planMeal.badge === 'coach-selected' ? 'rgba(212,168,67,0.18)' : 'rgba(107,143,113,0.18)',
                            color: planMeal.badge === 'coach-selected' ? '#D4A843' : '#A8C5AC',
                          }}>
                            {planMeal.badge === 'coach-selected' ? 'Coach Selected' : 'Recommended'}
                          </span>
                        )}
                        {planMeal.tags?.map(t => (
                          <span key={t} style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.38)', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', padding: '1px 6px' }}>
                            {t === 'protein' ? '💪 Protein' : t === 'fiber' ? '🌾 Fiber' : '⚖️ Balanced'}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                        {planMeal.items.map((item, i) => (
                          <span key={i} style={{ fontSize: '14px', fontWeight: 600, color: '#fff', opacity: 0.9, lineHeight: 1.4 }}>
                            {item}{i < planMeal.items.length - 1 ? <span style={{ opacity: 0.35, marginLeft: '4px', marginRight: '4px' }}>·</span> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.35 }}>
                      <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>
              )}

              {/* From History */}
              {historyForSlot.length > 0 && (
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px', marginTop: '4px' }}>More From Your History</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {historyForSlot.map((h, i) => (
                      <motion.button key={i}
                        whileHover={{ scale: 1.012 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSheet({ type: 'meal', step: 'portion', selectedSlot: sheet.selectedSlot, historyMeal: h.name, logDate, logTime, adherenceLevel: 'custom', earnedPoints: 1 })}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '11px 14px', cursor: 'pointer', textAlign: 'left' as const }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/><path d="M7 4.5V7l1.5 1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0, marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{h.name}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', margin: 0, fontWeight: 500 }}>Last logged {h.lastLogged}</p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.25 }}>
                          <path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom meal option */}
              <button
                onClick={() => setSheet({ type: 'meal', step: 'custom-meal', selectedSlot: sheet.selectedSlot, logDate, logTime })}
                style={{ marginTop: '4px', padding: '12px', background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: '14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                + Something else
              </button>
            </div>
          </>
        );
      }

      // ── Step: Adherence capture ───────────────────────────────────────────────
      if (sheet.step === 'adherence' && sheet.selectedMeal) {
        const planMeal = TODAYS_MEAL_PLAN[sheet.selectedMeal]!;
        const slot = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;
        const adherenceOptions: { level: MealAdherenceLevel; label: string; sublabel: string; icon: string; accent: string; bg: string; border: string }[] = [
          { level: 'exact',   label: 'Exactly as planned',  sublabel: 'Every item as assigned',     icon: '✓', accent: '#6B8F71', bg: 'rgba(107,143,113,0.14)', border: 'rgba(107,143,113,0.38)' },
          { level: 'mostly',  label: 'Mostly followed',     sublabel: 'Minor swaps or portions',    icon: '≈', accent: '#A8C5AC', bg: 'rgba(168,197,172,0.1)',  border: 'rgba(168,197,172,0.28)' },
          { level: 'changes', label: 'Made a few changes',  sublabel: 'Different items but similar',icon: '~', accent: '#D4A843', bg: 'rgba(212,168,67,0.1)',  border: 'rgba(212,168,67,0.28)' },
          { level: 'custom',  label: 'Ate something different', sublabel: 'Completely different meal', icon: '≠', accent: '#C8604A', bg: 'rgba(200,96,74,0.1)', border: 'rgba(200,96,74,0.25)' },
        ];

        return (
          <>
            <HeroImageBand imgSrc={slot?.img ?? ACTION_CARD_IMAGES.meal} label="How closely did you follow?" sublabel={`${slot?.emoji ?? ''} ${slot?.label ?? 'Meal'} · Adherence`} accentColor={slot?.accent} coachNote={planMeal.items.join(' · ')} />
            <StepIndicator current={3} total={5} accentColor={slot?.accent} />
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {adherenceOptions.map(opt => (
                <motion.button key={opt.level}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (opt.level === 'custom') {
                      setSheet({ type: 'meal', step: 'custom-meal', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedMeal, logDate, logTime });
                    } else if (opt.level === 'changes') {
                      setSelectedChangeTags([]);
                      setSheet({ type: 'meal', step: 'adherence-changes', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedMeal, adherenceLevel: 'changes', logDate, logTime });
                    } else {
                      setSheet({ type: 'meal', step: 'components', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedMeal, adherenceLevel: opt.level, logDate, logTime, earnedPoints: ADHERENCE_POINTS[opt.level] });
                    }
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', background: opt.bg, border: `1.5px solid ${opt.border}`, borderRadius: '16px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' as const }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: opt.accent, flexShrink: 0 }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, marginBottom: '2px' }}>{opt.label}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0, fontWeight: 500 }}>{opt.sublabel}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                    <path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </>
        );
      }

      // ── Step: Adherence changes (what changed) ────────────────────────────────
      if (sheet.step === 'adherence-changes' && sheet.selectedMeal) {
        const changeTags: { id: MealChangeTag; label: string }[] = [
          { id: 'different-protein', label: 'Different protein' },
          { id: 'different-carb',    label: 'Different carb' },
          { id: 'different-veg',     label: 'Different vegetables' },
          { id: 'added-item',        label: 'Added an item' },
          { id: 'removed-item',      label: 'Removed an item' },
          { id: 'other',             label: 'Other' },
        ];
        const canSubmit = selectedChangeTags.length > 0;
        const slot2 = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;

        return (
          <>
            <HeroImageBand imgSrc={slot2?.img ?? ACTION_CARD_IMAGES.meal} label="What changed?" sublabel="Meal Modifications" accentColor={slot2?.accent} coachNote="This helps your coach understand your real eating patterns." />
            <StepIndicator current={3} total={5} accentColor={slot2?.accent} />
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '20px' }}>
                {changeTags.map(t => {
                  const active = selectedChangeTags.includes(t.id);
                  return (
                    <motion.button key={t.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedChangeTags(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                      style={{ padding: '10px 16px', borderRadius: '24px', border: `1.5px solid ${active ? 'rgba(212,168,67,0.6)' : 'rgba(255,255,255,0.12)'}`, background: active ? 'rgba(212,168,67,0.16)' : 'rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 700, color: active ? '#D4A843' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {active ? '✓ ' : ''}{t.label}
                    </motion.button>
                  );
                })}
              </div>
              <button
                disabled={!canSubmit}
                onClick={() => setSheet({ type: 'meal', step: 'components', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedMeal, adherenceLevel: 'changes', changeTags: selectedChangeTags, logDate, logTime, earnedPoints: ADHERENCE_POINTS.changes })}
                style={{ width: '100%', padding: '15px', background: canSubmit ? 'linear-gradient(135deg, #4A6E50 0%, #2D4A30 100%)' : 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', letterSpacing: '-0.01em', transition: 'background 0.2s' }}>
                Continue
              </button>
            </div>
          </>
        );
      }

      // ── Step: Components (check off items) ────────────────────────────────────
      if (sheet.step === 'components' && sheet.selectedMeal) {
        const planMeal = TODAYS_MEAL_PLAN[sheet.selectedMeal]!;
        const slot = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;

        return (
          <>
            <HeroImageBand imgSrc={slot?.img ?? ACTION_CARD_IMAGES.meal} label="What did you eat?" sublabel={`${slot?.emoji ?? ''} ${slot?.label ?? 'Meal'} · Items`} accentColor={slot?.accent} coachNote="Deselect anything you skipped." />
            <StepIndicator current={4} total={5} accentColor={slot?.accent} />
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {planMeal.items.map((item, i) => {
                const isSkipped = skippedComponents.includes(item);
                return (
                  <motion.button key={i}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSkippedComponents(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: isSkipped ? 'rgba(255,255,255,0.03)' : (slot?.bg ?? 'rgba(107,143,113,0.12)'), border: `1.5px solid ${isSkipped ? 'rgba(255,255,255,0.07)' : (slot?.border ?? 'rgba(107,143,113,0.32)')}`, borderRadius: '14px', padding: '13px 16px', cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `1.5px solid ${isSkipped ? 'rgba(255,255,255,0.15)' : (slot?.accent ?? '#6B8F71')}`, background: isSkipped ? 'transparent' : (slot?.bg ?? 'rgba(107,143,113,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {!isSkipped && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3L11 1" stroke={slot?.accent ?? '#6B8F71'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: isSkipped ? 'rgba(255,255,255,0.3)' : '#fff', margin: 0, textDecoration: isSkipped ? 'line-through' : 'none', transition: 'all 0.15s' }}>{item}</p>
                  </motion.button>
                );
              })}
            </div>
            <div style={{ padding: '8px 24px 28px' }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSheet({ type: 'meal', step: 'portion', selectedSlot: sheet.selectedSlot, selectedMeal: sheet.selectedMeal, adherenceLevel: sheet.adherenceLevel, changeTags: sheet.changeTags, skippedComponents, logDate, logTime, earnedPoints: sheet.earnedPoints })}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
                Next → Portion
              </motion.button>
            </div>
          </>
        );
      }

      // ── Step: Portion ─────────────────────────────────────────────────────────
      if (sheet.step === 'portion') {
        const mealName = sheet.selectedMeal ? (TODAYS_MEAL_PLAN[sheet.selectedMeal]?.items[0] ?? 'this meal') : (sheet.historyMeal ?? sheet.customMealName ?? 'this meal');
        const slot = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;
        const portionOptions = [
          { pct: 25, label: '¼', sub: 'Quarter' },
          { pct: 50, label: '½', sub: 'Half' },
          { pct: 75, label: '¾', sub: 'Three quarters' },
          { pct: 100, label: 'Full', sub: 'Complete' },
        ];
        const selected = sheet.portionPct ?? null;
        const canGoBack = sheet.selectedMeal ? 'components' : 'plan-meal';

        return (
          <>
            <HeroImageBand imgSrc={slot?.img ?? ACTION_CARD_IMAGES.meal} label="How much did you eat?" sublabel={`${slot?.emoji ?? ''} ${mealName}`} accentColor={slot?.accent} />
            <StepIndicator current={5} total={5} accentColor={slot?.accent} />
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 24px' }}>
              {/* Visual portion chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {portionOptions.map(p => {
                  const isSelected = selected === p.pct;
                  return (
                    <motion.button key={p.pct}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSheet({ ...sheet, portionPct: p.pct } as never)}
                      style={{ padding: '18px 8px 14px', background: isSelected ? (slot?.bg ?? 'rgba(107,143,113,0.2)') : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isSelected ? (slot?.accent ?? '#6B8F71') : 'rgba(255,255,255,0.1)'}`, borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.15s', boxShadow: isSelected ? `0 0 16px ${slot?.accent ?? '#6B8F71'}33` : 'none' }}>
                      {/* Visual fill bar */}
                      <div style={{ width: '32px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', marginBottom: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.pct}%`, height: '100%', background: isSelected ? (slot?.accent ?? '#6B8F71') : 'rgba(255,255,255,0.25)', borderRadius: '3px', transition: 'width 0.2s' }} />
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: isSelected ? (slot?.accent ?? '#A8C5AC') : 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>{p.label}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}>{p.sub}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Optional notes */}
              <input
                type="text"
                value={mealNotes}
                onChange={e => setMealNotes(e.target.value)}
                placeholder="Notes (optional)..."
                style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '13px', background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' as const, color: '#fff', fontFamily: 'inherit', marginBottom: '14px' }}
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={selected === null}
                onClick={() => {
                  if (selected === null) return;
                  const pts = sheet.earnedPoints ?? ADHERENCE_POINTS[sheet.adherenceLevel ?? 'custom'] ?? 1;
                  awardPoints('meal', pts);
                  setSheet({ ...sheet, step: 'success', portionPct: selected, notes: mealNotes || undefined, earnedPoints: pts, logDate, logTime });
                }}
                style={{ width: '100%', padding: '15px', background: selected !== null ? 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: selected !== null ? 'pointer' : 'default', letterSpacing: '-0.01em', transition: 'background 0.2s' }}>
                {selected !== null ? `Log Meal · +${sheet.earnedPoints ?? 1} H+` : 'Select a portion to continue'}
              </motion.button>
            </div>
          </>
        );
      }

      // ── Step: Custom meal ─────────────────────────────────────────────────────
      if (sheet.step === 'custom-meal') {
        const slot = sheet.selectedSlot ? MEAL_SLOTS[sheet.selectedSlot] : undefined;
        const SERVING_UNITS = ['Bowl', 'Plate', 'Glass', 'Cup', 'Piece', 'Tablespoon', 'Teaspoon'];
        const PORTION_CHIPS = ['25%', '50%', '75%', '100%'];
        const canSubmit = customMealName.trim().length > 0;

        return (
          <>
            <div style={{ padding: '20px 24px 6px' }}>
              {slot && <p style={{ fontSize: '10px', fontWeight: 700, color: slot.accent, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '2px' }}>{slot.emoji} {slot.label}</p>}
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 4px' }}>What did you have?</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: 0, fontWeight: 500 }}>Describe your meal</p>
            </div>
            <ActivityDateTimeSelector />
            <div style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Meal name */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Meal name</p>
                <input
                  autoFocus
                  type="text"
                  value={customMealName}
                  onChange={e => setCustomMealName(e.target.value)}
                  placeholder="e.g. Paneer Bhurji, Masala Dosa…"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '14px', border: `1.5px solid ${customMealName.trim() ? 'rgba(107,143,113,0.45)' : 'rgba(255,255,255,0.12)'}`, fontSize: '14px', background: 'rgba(255,255,255,0.06)', outline: 'none', boxSizing: 'border-box' as const, color: '#fff', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                />
              </div>

              {/* Portion consumed */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Portion consumed</p>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                  {PORTION_CHIPS.map(c => {
                    const isActive = customPortion === c;
                    return (
                      <button key={c} onClick={() => setCustomPortion(isActive ? '' : c)}
                        style={{ padding: '8px 16px', borderRadius: '24px', border: `1.5px solid ${isActive ? 'rgba(107,143,113,0.6)' : 'rgba(255,255,255,0.12)'}`, background: isActive ? 'rgba(107,143,113,0.2)' : 'rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 700, color: isActive ? '#A8C5AC' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <input type="text" value={customPortion.endsWith('%') ? '' : customPortion} onChange={e => setCustomPortion(e.target.value)}
                  placeholder="Or enter custom amount…"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '13px', background: 'rgba(255,255,255,0.04)', outline: 'none', boxSizing: 'border-box' as const, color: '#fff', fontFamily: 'inherit' }} />
              </div>

              {/* Serving size */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Serving size</p>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' as const }}>
                  {SERVING_UNITS.map(u => {
                    const isActive = customUnit === u;
                    return (
                      <button key={u} onClick={() => setCustomUnit(u)}
                        style={{ padding: '7px 14px', borderRadius: '20px', border: `1.5px solid ${isActive ? 'rgba(212,168,67,0.55)' : 'rgba(255,255,255,0.1)'}`, background: isActive ? 'rgba(212,168,67,0.14)' : 'rgba(255,255,255,0.04)', fontSize: '12px', fontWeight: 700, color: isActive ? '#D4A843' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {u}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <input type="text" value={mealNotes} onChange={e => setMealNotes(e.target.value)}
                placeholder="Notes (optional)…"
                style={{ padding: '11px 14px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '13px', background: 'rgba(255,255,255,0.04)', outline: 'none', color: '#fff', fontFamily: 'inherit' }} />

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={!canSubmit}
                onClick={() => {
                  awardPoints('meal', 1);
                  setSheet({ type: 'meal', step: 'success', selectedSlot: sheet.selectedSlot, customMealName: customMealName.trim(), customPortion, customUnit, notes: mealNotes || undefined, logDate, logTime, adherenceLevel: 'custom', earnedPoints: 1 });
                }}
                style={{ width: '100%', padding: '15px', background: canSubmit ? 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)' : 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', letterSpacing: '-0.01em', transition: 'background 0.2s' }}>
                Log Custom Meal · +1 H+
              </motion.button>
            </div>
          </>
        );
      }

      // ── Default / fallback: go to slot select ─────────────────────────────────
      return null;
    }

    // ─── EXERCISE ──────────────────────────────────────────────────────────────
    if (sheet.type === 'exercise') {
      const ACTIVITIES_EX_ICONS: Record<string, string> = {
        Walk: '🚶', Running: '🏃', Cycling: '🚴', Strength: '🏋', Yoga: '🧘', Swimming: '🏊', Sports: '⚽', Stretching: '✨',
      };

      if (sheet.step === 'success') {
        return <SuccessScreen points={2} label="Workout Logged"
          details={[
            sheet.activity ? { icon: ACTIVITIES_EX_ICONS[sheet.activity] ?? '🏃', label: 'Activity', value: sheet.activity } : null,
            sheet.duration ? { icon: '⏱', label: 'Duration', value: `${sheet.duration} min` } : null,
            sheet.intensity ? { icon: '⚡', label: 'Intensity', value: sheet.intensity.charAt(0).toUpperCase() + sheet.intensity.slice(1) } : null,
          ].filter(Boolean) as Array<{ icon: string; label: string; value: string }>}
          subtitle="Consistent movement is one of the strongest predictors of metabolic improvement." />;
      }

      if (sheet.step === 'reflection' && sheet.activity && sheet.duration) {
        const FEELINGS = [
          { emoji: '😊', label: 'Energising', val: 'energising' },
          { emoji: '🙂', label: 'Good', val: 'good' },
          { emoji: '😅', label: 'Challenging', val: 'challenging' },
          { emoji: '🔥', label: 'Very Hard', val: 'very-hard' },
        ];
        return (
          <>
            <HeroImageBand imgSrc={EXERCISE_IMAGES[sheet.activity] ?? ACTION_CARD_IMAGES.exercise} label="How did it feel?" sublabel={`${sheet.activity} · ${sheet.duration} min · ${sheet.intensity ?? ''}`} />
            <StepIndicator current={4} total={4} accentColor="#6B8F71" />
            <SharedDateTimeBar />
            <div style={{ padding: '20px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>Reflection helps your coach understand your recovery needs.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {FEELINGS.map(f => {
                  const isSel = sheet.feeling === f.val;
                  return (
                    <motion.button key={f.val} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                      onClick={() => setSheet({ ...sheet, feeling: f.val })}
                      style={{ padding: '22px 12px 18px', background: isSel ? 'rgba(107,143,113,0.2)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isSel ? 'rgba(107,143,113,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: isSel ? '0 0 20px rgba(107,143,113,0.25)' : 'none', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '36px', lineHeight: 1 }}>{f.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isSel ? '#A8C5AC' : 'rgba(255,255,255,0.5)' }}>{f.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => { awardPoints('exercise', 2); setSheet({ ...sheet, step: 'success' }); }}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4A6E50 0%, #2D4A30 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(74,143,80,0.35)' }}>
                Log Workout · +2 H+
              </motion.button>
            </div>
          </>
        );
      }

      if (sheet.step === 'intensity' && sheet.activity && (sheet.duration !== undefined)) {
        const INTENSITIES = [
          { label: 'Easy', sub: 'Light effort, conversational', val: 'easy', color: '#6B8F71', bg: 'rgba(107,143,113,0.12)', border: 'rgba(107,143,113,0.35)' },
          { label: 'Moderate', sub: 'Steady pace, some effort', val: 'moderate', color: '#D4A843', bg: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.35)' },
          { label: 'Vigorous', sub: 'Hard effort, limited talk', val: 'vigorous', color: '#E87040', bg: 'rgba(232,112,64,0.12)', border: 'rgba(232,112,64,0.35)' },
          { label: 'Athletic', sub: 'Max effort, peak output', val: 'athletic', color: '#C8604A', bg: 'rgba(200,96,74,0.14)', border: 'rgba(200,96,74,0.4)' },
        ];
        return (
          <>
            <HeroImageBand imgSrc={EXERCISE_IMAGES[sheet.activity] ?? ACTION_CARD_IMAGES.exercise} label="Intensity" sublabel={`${sheet.activity} · ${sheet.duration} min`} />
            <StepIndicator current={3} total={4} accentColor="#6B8F71" />
            <SharedDateTimeBar />
            <div style={{ padding: '16px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '18px' }}>How hard did you push yourself?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {INTENSITIES.map(i => (
                  <motion.button key={i.val} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSheet({ ...sheet, step: 'reflection', intensity: i.val })}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: i.bg, border: `1.5px solid ${i.border}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'left' as const }}>
                    <div style={{ width: '8px', height: '40px', borderRadius: '4px', background: i.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '2px' }}>{i.label}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{i.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                      <path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      if (sheet.step === 'duration' && sheet.activity) {
        const actImg = EXERCISE_IMAGES[sheet.activity] ?? ACTION_CARD_IMAGES.exercise;
        const QUICK_DURATIONS = [
          { mins: 15, label: '15', sub: 'Quick' },
          { mins: 20, label: '20', sub: 'Short' },
          { mins: 30, label: '30', sub: 'Standard' },
          { mins: 45, label: '45', sub: 'Solid' },
          { mins: 60, label: '60', sub: 'Long' },
          { mins: 90, label: '90', sub: 'Epic' },
        ];
        const getDurationEncouragement = (mins: number) => {
          if (mins < 15) return 'Small steps create big changes.';
          if (mins < 30) return 'Great consistency.';
          if (mins < 60) return 'Excellent work.';
          return "You're building real momentum.";
        };
        const clampDuration = (v: number) => Math.min(180, Math.max(1, v));
        // Long-press: fires after 500ms hold, then repeats at 120ms — never double-fires with onClick
        const startLongPress = (delta: number) => {
          if (longPressRef.current) return;
          const timeout = setTimeout(() => {
            longPressRef.current = setInterval(() => {
              setExerciseDuration(v => clampDuration(v + delta));
            }, 120);
          }, 500);
          // Store timeout id in ref so stopLongPress can clear it
          (longPressRef as React.MutableRefObject<ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null>).current = timeout as unknown as ReturnType<typeof setInterval>;
        };
        const stopLongPress = () => {
          if (longPressRef.current) { clearInterval(longPressRef.current); clearTimeout(longPressRef.current as unknown as ReturnType<typeof setTimeout>); longPressRef.current = null; }
        };
        const handleDragStart = (e: React.PointerEvent) => {
          dragStartY.current = e.clientY;
          dragStartVal.current = exerciseDuration;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        };
        const handleDragMove = (e: React.PointerEvent) => {
          if (dragStartY.current === null) return;
          const delta = Math.round((dragStartY.current - e.clientY) / 4);
          setExerciseDuration(clampDuration(dragStartVal.current + delta));
        };
        const handleDragEnd = () => { dragStartY.current = null; };
        return (
          <>
            <HeroImageBand imgSrc={actImg} label={sheet.activity} sublabel="Log Exercise" />
            <StepIndicator current={2} total={4} accentColor="#6B8F71" />
            <SharedDateTimeBar />
            <div style={{ padding: '16px 20px 28px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', paddingLeft: '2px' }}>How long did you exercise?</p>

              {/* ── Premium duration selector ── */}
              <div style={{ background: 'linear-gradient(135deg, rgba(107,143,113,0.14) 0%, rgba(168,197,172,0.08) 100%)', border: '1.5px solid rgba(107,143,113,0.28)', borderRadius: '24px', padding: '24px 20px 20px', marginBottom: '16px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, textAlign: 'center' as const, marginBottom: '16px' }}>Duration</p>

                {/* Draggable number */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', marginBottom: '24px', cursor: 'ns-resize', userSelect: 'none' as const }}
                  onPointerDown={handleDragStart}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}>
                  <motion.span
                    key={exerciseDuration}
                    initial={{ opacity: 0.6, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ fontSize: '80px', fontWeight: 900, color: '#A8C5AC', letterSpacing: '-0.04em', lineHeight: 1, display: 'block' }}>
                    {exerciseDuration}
                  </motion.span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>minutes</span>
                </div>

                {/* − / + buttons — onClick for exact ±1, long-press to accelerate */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginBottom: '20px' }}>
                  {([{ delta: -1, label: '−' }, { delta: 1, label: '+' }] as const).map(btn => (
                    <motion.button
                      key={btn.label}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setExerciseDuration(v => clampDuration(v + btn.delta))}
                      onPointerDown={() => startLongPress(btn.delta)}
                      onPointerUp={stopLongPress}
                      onPointerLeave={stopLongPress}
                      onPointerCancel={stopLongPress}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', background: btn.delta > 0 ? 'linear-gradient(135deg, rgba(107,143,113,0.30) 0%, rgba(107,143,113,0.14) 100%)' : 'linear-gradient(135deg, rgba(107,143,113,0.18) 0%, rgba(107,143,113,0.08) 100%)', border: `2px solid ${btn.delta > 0 ? 'rgba(107,143,113,0.55)' : 'rgba(107,143,113,0.35)'}`, cursor: 'pointer', fontSize: '32px', fontWeight: 300, color: '#A8C5AC', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btn.delta > 0 ? '0 2px 16px rgba(107,143,113,0.25)' : '0 2px 8px rgba(0,0,0,0.2)', lineHeight: 1 }}>
                      {btn.label}
                    </motion.button>
                  ))}
                </div>

                {/* Encouragement */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={getDurationEncouragement(exerciseDuration)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    style={{ textAlign: 'center' as const, fontSize: '12px', color: 'rgba(168,197,172,0.65)', fontStyle: 'italic', margin: 0 }}>
                    "{getDurationEncouragement(exerciseDuration)}"
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Confirm with custom duration */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSheet({ ...sheet, step: 'intensity', duration: exerciseDuration })}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6B8F71 0%, #4e7254 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', marginBottom: '12px', boxShadow: '0 4px 16px rgba(107,143,113,0.4)' }}>
                Confirm {exerciseDuration} min →
              </motion.button>

              {/* Quick-select cards */}
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, textAlign: 'center' as const, marginBottom: '10px' }}>Quick select</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '7px', marginBottom: '12px' }}>
                {QUICK_DURATIONS.map(d => {
                  const isSel = exerciseDuration === d.mins;
                  return (
                    <motion.button key={d.mins} whileTap={{ scale: 0.93 }}
                      onClick={() => { setExerciseDuration(d.mins); setSheet({ ...sheet, step: 'intensity', duration: d.mins }); }}
                      style={{ padding: '12px 4px 10px', background: isSel ? 'rgba(107,143,113,0.22)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${isSel ? 'rgba(107,143,113,0.55)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', boxShadow: isSel ? '0 0 12px rgba(107,143,113,0.25)' : 'none', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: isSel ? '#A8C5AC' : 'rgba(255,255,255,0.55)', letterSpacing: '-0.03em' }}>{d.label}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.22)' }}>min</span>
                    </motion.button>
                  );
                })}
              </div>

              <button onClick={() => setSheet({ type: 'exercise', step: 'pick' })}
                style={{ width: '100%', padding: '11px', background: 'transparent', color: 'rgba(255,255,255,0.3)', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                ← Change activity
              </button>
            </div>
          </>
        );
      }

      // Step 1 — Pick activity
      const ACTIVITIES_EX = [
        { id: 'Walk', icon: '🚶', sub: 'Any pace, any distance' },
        { id: 'Running', icon: '🏃', sub: 'Cardio & endurance' },
        { id: 'Cycling', icon: '🚴', sub: 'Road, trail or indoor' },
        { id: 'Strength', icon: '🏋', sub: 'Weights & resistance' },
        { id: 'Yoga', icon: '🧘', sub: 'Mobility & mindfulness' },
        { id: 'Swimming', icon: '🏊', sub: 'Full-body low impact' },
        { id: 'Sports', icon: '⚽', sub: 'Team or individual' },
        { id: 'Stretching', icon: '✨', sub: 'Flexibility & recovery' },
      ];
      const exImg: Record<string, string> = { ...EXERCISE_IMAGES, Running: EXERCISE_IMAGES.Cardio ?? ACTION_CARD_IMAGES.exercise };
      return (
        <>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={ACTION_CARD_IMAGES.exercise} alt="Exercise" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(8,18,12,0.88) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Log Exercise</p>
              <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>Every workout is an investment in your future self.</h3>
            </div>
          </div>
          <StepIndicator current={1} total={4} accentColor="#6B8F71" />
          <ActivityDateTimeSelector />
          <div style={{ padding: '12px 20px 28px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', paddingLeft: '4px' }}>What did you do?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {ACTIVITIES_EX.map(a => (
                <motion.button key={a.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setSheet({ type: 'exercise', step: 'duration', activity: a.id })}
                  style={{ padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', textAlign: 'left' as const }}>
                  <div style={{ position: 'relative', height: '80px', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                    <img src={exImg[a.id] ?? ACTION_CARD_IMAGES.exercise} alt={a.id} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', margin: 0 }}>{a.icon} {a.id}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{a.sub}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      );
    }

    // ─── WATER ─────────────────────────────────────────────────────────────────
    if (sheet.type === 'water') {

      if (sheet.step === 'success') {
        const amountLabel = sheet.amount ? (sheet.amount >= 1000 ? `${sheet.amount/1000}L` : `${sheet.amount}ml`) : '';
        return <SuccessScreen points={2} label="Hydration Logged"
          details={[
            amountLabel ? { icon: '💧', label: 'Amount', value: amountLabel } : null,
            sheet.context ? { icon: '🕐', label: 'When', value: sheet.context.charAt(0).toUpperCase() + sheet.context.slice(1) } : null,
          ].filter(Boolean) as Array<{ icon: string; label: string; value: string }>}
          subtitle="Staying hydrated improves focus, metabolism, and cellular repair throughout the day." />;
      }

      if (sheet.step === 'context' && sheet.amount) {
        const contexts = [
          { label: 'Morning', icon: '🌅', val: 'morning' },
          { label: 'Afternoon', icon: '☀️', val: 'afternoon' },
          { label: 'Evening', icon: '🌙', val: 'evening' },
          { label: 'During Exercise', icon: '⚡', val: 'exercise' },
        ];
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.water} label="When was this?" sublabel={`Hydration · ${sheet.amount >= 1000 ? `${sheet.amount/1000}L` : `${sheet.amount}ml`}`} accentColor="#5BA8CC" />
            <StepIndicator current={2} total={2} accentColor="#5BA8CC" />
            <SharedDateTimeBar />
            <div style={{ padding: '20px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '18px' }}>Optional — helps track your hydration pattern.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {contexts.map(c => {
                  const isSel = sheet.context === c.val;
                  return (
                    <motion.button key={c.val} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={() => { awardPoints('water', 2); setSheet({ ...sheet, step: 'success', context: c.val }); }}
                      style={{ padding: '20px 12px', background: isSel ? 'rgba(91,168,204,0.18)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isSel ? 'rgba(91,168,204,0.55)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '28px', lineHeight: 1 }}>{c.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isSel ? '#7BC8E8' : 'rgba(255,255,255,0.6)' }}>{c.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <button onClick={() => { awardPoints('water', 2); setSheet({ ...sheet, step: 'success' }); }}
                style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Skip · Log now
              </button>
            </div>
          </>
        );
      }

      // Step 1 — Hydration counter
      const HYDRATION_GOAL = 10;
      const getHydrationMsg = (g: number) => {
        if (g <= 2) return 'Good start.';
        if (g <= 5) return 'Keep the momentum going.';
        if (g <= 8) return 'Hydration supports energy and focus.';
        return 'Excellent hydration today.';
      };
      const mlVal = waterGlasses * 250;
      const mlLabel = mlVal >= 1000 ? `${(mlVal / 1000).toFixed(1).replace('.0', '')}L` : `${mlVal} ml`;
      return (
        <>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={ACTION_CARD_IMAGES.water} alt="Water" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 50%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(4,14,26,0.9) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(123,200,232,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Hydration</p>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>Hydration powers every system in your body.</h3>
            </div>
          </div>
          <StepIndicator current={1} total={2} accentColor="#5BA8CC" />
          <ActivityDateTimeSelector />
          <div style={{ padding: '16px 20px 28px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', paddingLeft: '2px' }}>How much water did you drink?</p>

            {/* ── Premium hydration counter ── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(91,168,204,0.14) 0%, rgba(123,200,232,0.07) 100%)', border: '1.5px solid rgba(91,168,204,0.28)', borderRadius: '24px', padding: '24px 20px 22px', marginBottom: '16px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>

              {/* Subtle water ripple orb */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.13, 0.06] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,168,204,0.8) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Counter value */}
              <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '8px' }}>
                <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '4px' }}>💧</div>
                <motion.span
                  key={waterGlasses}
                  initial={{ opacity: 0.5, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ display: 'block', fontSize: '48px', fontWeight: 900, color: '#7BC8E8', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  {waterGlasses} {waterGlasses === 1 ? 'Glass' : 'Glasses'}
                </motion.span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={mlLabel}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(123,200,232,0.55)', marginTop: '2px' }}>
                    ~{mlLabel}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* − / + buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setWaterGlasses(v => Math.max(1, v - 1))}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(91,168,204,0.18) 0%, rgba(91,168,204,0.08) 100%)', border: '2px solid rgba(91,168,204,0.40)', cursor: 'pointer', fontSize: '28px', fontWeight: 900, color: '#7BC8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                  −
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setWaterGlasses(v => Math.min(20, v + 1))}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(91,168,204,0.30) 0%, rgba(91,168,204,0.14) 100%)', border: '2px solid rgba(91,168,204,0.55)', cursor: 'pointer', fontSize: '28px', fontWeight: 900, color: '#7BC8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(91,168,204,0.25)' }}>
                  +
                </motion.button>
              </div>

              {/* Hydration progress */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, textAlign: 'center' as const, marginBottom: '10px' }}>Today's Hydration</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' as const, marginBottom: '6px' }}>
                  {Array.from({ length: HYDRATION_GOAL }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{ opacity: i < waterGlasses ? 1 : 0.22, scale: i < waterGlasses ? 1 : 0.82 }}
                      transition={{ duration: 0.2, delay: i < waterGlasses ? i * 0.03 : 0 }}
                      style={{ fontSize: '18px', lineHeight: 1 }}>
                      💧
                    </motion.div>
                  ))}
                </div>
                <p style={{ textAlign: 'center' as const, fontSize: '11px', fontWeight: 700, color: 'rgba(123,200,232,0.45)', margin: 0 }}>
                  {waterGlasses} / {HYDRATION_GOAL} glasses today
                </p>
              </div>

              {/* Motivational message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={getHydrationMsg(waterGlasses)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{ textAlign: 'center' as const, fontSize: '12px', color: 'rgba(123,200,232,0.6)', fontStyle: 'italic', margin: 0 }}>
                  "{getHydrationMsg(waterGlasses)}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Confirm */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSheet({ type: 'water', step: 'context', amount: mlVal })}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3a7fa8 0%, #2a5f82 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 16px rgba(91,168,204,0.35)' }}>
              Log {waterGlasses} {waterGlasses === 1 ? 'Glass' : 'Glasses'} ({mlLabel}) →
            </motion.button>
          </div>
        </>
      );
    }

    // ─── SLEEP ─────────────────────────────────────────────────────────────────
    if (sheet.type === 'sleep') {

      const calcSleepHours = (bed: string, wake: string) => {
        const parse = (t: string) => {
          const [time, period] = t.split(' ');
          const [h, m] = (time ?? '').split(':').map(Number);
          let hrs = (h ?? 0) % 12;
          if (period === 'PM') hrs += 12;
          return hrs * 60 + (m ?? 0);
        };
        let diff = parse(wake) - parse(bed);
        if (diff < 0) diff += 1440;
        return (diff / 60).toFixed(1);
      };

      if (sheet.step === 'success') {
        const hrs = sheet.bedtime && sheet.waketime ? calcSleepHours(sheet.bedtime, sheet.waketime) : null;
        return <SuccessScreen points={2} label="Sleep Logged"
          details={[
            hrs ? { icon: '😴', label: 'Duration', value: `${hrs}h` } : null,
            sheet.quality ? { icon: sheet.quality === 'excellent' ? '⭐' : sheet.quality === 'good' ? '🙂' : sheet.quality === 'fair' ? '😐' : '😣', label: 'Quality', value: sheet.quality.charAt(0).toUpperCase() + sheet.quality.slice(1) } : null,
            sheet.morningLight !== undefined ? { icon: sheet.morningLight ? '☀️' : '🌥', label: 'Sunlight', value: sheet.morningLight ? 'Yes' : 'No' } : null,
          ].filter(Boolean) as Array<{ icon: string; label: string; value: string }>}
          subtitle={sheet.morningLight ? 'Morning sunlight helps regulate circadian rhythm and improve metabolic health.' : 'Great days start with great nights. Consistent sleep times build powerful metabolic rhythms.'} />;
      }

      if (sheet.step === 'sunlight-prompt') {
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.sunlight} label="Morning Sunlight?" sublabel="Sleep · Step 4" />
            <StepIndicator current={4} total={4} accentColor="#7B8FC8" />
            <SharedDateTimeBar />
            <div style={{ padding: '16px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>Morning light exposure anchors your circadian rhythm and improves sleep quality over time.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[{ label: 'Yes, got sunlight', icon: '☀️', val: true }, { label: 'No, stayed inside', icon: '🌥', val: false }].map(opt => (
                  <motion.button key={String(opt.val)} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { awardPoints('sleep', 2); setSheet({ ...sheet, step: 'success', morningLight: opt.val }); }}
                    style={{ padding: '28px 12px', background: opt.val ? 'rgba(232,160,48,0.12)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${opt.val ? 'rgba(232,160,48,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '36px', lineHeight: 1 }}>{opt.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: opt.val ? '#F0C060' : 'rgba(255,255,255,0.55)' }}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => { awardPoints('sleep', 2); setSheet({ ...sheet, step: 'success' }); }}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Skip this question
              </button>
            </div>
          </>
        );
      }

      if (sheet.step === 'interruptions' && sheet.quality) {
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.sleep} label="Interruptions" sublabel="Sleep · Step 3" />
            <StepIndicator current={3} total={4} accentColor="#7B8FC8" />
            <SharedDateTimeBar />
            <div style={{ padding: '14px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>How many times did you wake during the night?</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {[{ label: '0', sub: 'None' }, { label: '1', sub: 'Once' }, { label: '2', sub: 'Twice' }, { label: '3+', sub: 'Often' }].map(opt => {
                  const isSel = sheet.interruptions === parseInt(opt.label);
                  return (
                    <motion.button key={opt.label} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} style={{ flex: 1, padding: '20px 0 16px', background: isSel ? 'rgba(123,143,200,0.2)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isSel ? 'rgba(123,143,200,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: isSel ? '0 0 16px rgba(123,143,200,0.25)' : 'none', transition: 'all 0.15s' }}
                      onClick={() => setSheet({ ...sheet, step: 'sunlight-prompt', interruptions: parseInt(opt.label) })}>
                      <span style={{ fontSize: '26px', fontWeight: 900, color: isSel ? '#8FA8D8' : 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>{opt.label}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>{opt.sub}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </>
        );
      }

      if (sheet.step === 'quality' && sheet.waketime) {
        const QUALITY_OPTIONS = [
          { emoji: '😴', label: 'Excellent', sub: 'Woke up refreshed', val: 'excellent', color: '#6B8F71', bg: 'rgba(107,143,113,0.14)', border: 'rgba(107,143,113,0.38)' },
          { emoji: '🙂', label: 'Good', sub: 'Reasonably rested', val: 'good', color: '#A8C5AC', bg: 'rgba(168,197,172,0.1)', border: 'rgba(168,197,172,0.28)' },
          { emoji: '😐', label: 'Fair', sub: 'Some tiredness', val: 'fair', color: '#D4A843', bg: 'rgba(212,168,67,0.1)', border: 'rgba(212,168,67,0.28)' },
          { emoji: '😣', label: 'Poor', sub: 'Quite restless', val: 'poor', color: '#C8604A', bg: 'rgba(200,96,74,0.1)', border: 'rgba(200,96,74,0.28)' },
        ];
        const hrs = sheet.bedtime ? calcSleepHours(sheet.bedtime, sheet.waketime) : null;
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.sleep} label="Sleep Quality" sublabel={hrs ? `${hrs}h of sleep` : 'Sleep · Step 2'} />
            <StepIndicator current={2} total={4} accentColor="#7B8FC8" />
            <SharedDateTimeBar />
            <div style={{ padding: '14px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '18px' }}>How would you rate last night&apos;s sleep?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {QUALITY_OPTIONS.map(q => (
                  <motion.button key={q.val} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSheet({ ...sheet, step: 'interruptions', quality: q.val })}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: q.bg, border: `1.5px solid ${q.border}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'left' as const }}>
                    <span style={{ fontSize: '28px', lineHeight: 1 }}>{q.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '2px' }}>{q.label}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{q.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                      <path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      // Step 1 — Bedtime + Wake Time combined
      {
        // Convert 12h display string "10:30 PM" → "22:30" for <input type="time">
        const to24 = (display: string) => {
          const [time, period] = display.split(' ');
          const [hStr, mStr] = (time ?? '').split(':');
          let h = parseInt(hStr ?? '0');
          const m = parseInt(mStr ?? '0');
          if (period === 'AM' && h === 12) h = 0;
          if (period === 'PM' && h !== 12) h += 12;
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };
        // Convert "22:30" → "10:30 PM"
        const to12 = (hhmm: string) => {
          const [hStr, mStr] = hhmm.split(':');
          let h = parseInt(hStr ?? '0');
          const m = parseInt(mStr ?? '0');
          const period = h >= 12 ? 'PM' : 'AM';
          if (h > 12) h -= 12;
          if (h === 0) h = 12;
          return `${h}:${String(m).padStart(2, '0')} ${period}`;
        };
        const sleepMins = (() => {
          const parse = (t: string) => {
            const [time, period] = t.split(' ');
            const [h, m] = (time ?? '').split(':').map(Number);
            let hrs = (h ?? 0) % 12;
            if (period === 'PM') hrs += 12;
            return hrs * 60 + (m ?? 0);
          };
          let diff = parse(sleepWaketime) - parse(sleepBedtime);
          if (diff < 0) diff += 1440;
          return diff;
        })();
        const sleepHrsDisplay = `${Math.floor(sleepMins / 60)}h ${sleepMins % 60 > 0 ? `${sleepMins % 60}m` : ''}`.trim();
        const getSleepMsg = (mins: number) => {
          if (mins < 360) return 'Your body may need more recovery.';
          if (mins < 420) return 'A good foundation. Aim a little higher.';
          if (mins < 540) return 'Excellent sleep duration.';
          return 'Great recovery opportunity.';
        };
        return (
          <>
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={ACTION_CARD_IMAGES.sleep} alt="Sleep" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(4,8,18,0.92) 100%)' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(143,168,216,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Log Sleep</p>
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>Great days start with great nights.</h3>
              </div>
            </div>
            <StepIndicator current={1} total={4} accentColor="#7B8FC8" />
            <LastLoggedBar text="Sleep is typically logged in the morning for the previous night — you can adjust the date below." />
            <ActivityDateTimeSelector />
            <div style={{ padding: '12px 20px 28px' }}>

              {/* Hidden time inputs — positioned off-screen so they never intercept pointer events on the card */}
              <input
                ref={bedtimeInputRef}
                type="time"
                value={to24(sleepBedtime)}
                onChange={e => { if (e.target.value) setSleepBedtime(to12(e.target.value)); }}
                style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', top: 0, left: 0 }}
              />
              <input
                ref={waketimeInputRef}
                type="time"
                value={to24(sleepWaketime)}
                onChange={e => { if (e.target.value) setSleepWaketime(to12(e.target.value)); }}
                style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', top: 0, left: 0 }}
              />

              {/* Bedtime selector card */}
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(143,168,216,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '8px', paddingLeft: '2px' }}>Bedtime</p>
              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 4px 28px rgba(143,168,216,0.22)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = bedtimeInputRef.current;
                  if (!el) return;
                  if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                    (el as HTMLInputElement & { showPicker: () => void }).showPicker();
                  } else {
                    el.focus();
                    el.click();
                  }
                }}
                style={{ width: '100%', background: 'linear-gradient(135deg, rgba(58,74,122,0.28) 0%, rgba(43,55,100,0.16) 100%)', border: '1.5px solid rgba(143,168,216,0.30)', borderRadius: '20px', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer', marginBottom: '12px', transition: 'border-color 0.15s' }}>
                <span style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0 }}>🌙</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={sleepBedtime}
                    initial={{ opacity: 0.6, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    style={{ fontSize: '36px', fontWeight: 900, color: '#8FA8D8', letterSpacing: '-0.03em', lineHeight: 1, flex: 1, textAlign: 'left' as const }}>
                    {sleepBedtime}
                  </motion.span>
                </AnimatePresence>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                  <path d="M4 7l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              {/* Wake time selector card */}
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(232,160,48,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '8px', paddingLeft: '2px' }}>Wake Time</p>
              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 4px 28px rgba(232,160,48,0.18)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = waketimeInputRef.current;
                  if (!el) return;
                  if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                    (el as HTMLInputElement & { showPicker: () => void }).showPicker();
                  } else {
                    el.focus();
                    el.click();
                  }
                }}
                style={{ width: '100%', background: 'linear-gradient(135deg, rgba(100,80,32,0.28) 0%, rgba(80,60,20,0.16) 100%)', border: '1.5px solid rgba(232,160,48,0.30)', borderRadius: '20px', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)', cursor: 'pointer', marginBottom: '20px', transition: 'border-color 0.15s' }}>
                <span style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0 }}>☀️</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={sleepWaketime}
                    initial={{ opacity: 0.6, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    style={{ fontSize: '36px', fontWeight: 900, color: '#F0C060', letterSpacing: '-0.03em', lineHeight: 1, flex: 1, textAlign: 'left' as const }}>
                    {sleepWaketime}
                  </motion.span>
                </AnimatePresence>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                  <path d="M4 7l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              {/* Sleep duration summary card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(28,43,30,0.60) 0%, rgba(20,30,55,0.60) 100%)', border: '1.5px solid rgba(143,168,216,0.18)', borderRadius: '20px', padding: '18px 20px', marginBottom: '20px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Estimated Sleep</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={sleepHrsDisplay}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontSize: '42px', fontWeight: 900, color: '#8FA8D8', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {sleepHrsDisplay}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={getSleepMsg(sleepMins)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    style={{ fontSize: '13px', color: 'rgba(143,168,216,0.65)', fontStyle: 'italic', margin: 0 }}>
                    {getSleepMsg(sleepMins)}
                  </motion.p>
                </AnimatePresence>
              </div>

              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => setSheet({ type: 'sleep', step: 'quality', bedtime: sleepBedtime, waketime: sleepWaketime })}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #3A4A7A 0%, #1E2A5A 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(58,74,122,0.4)' }}>
                Next → Sleep Quality
              </motion.button>
            </div>
          </>
        );
      }
    }

    // ─── SUNLIGHT ──────────────────────────────────────────────────────────────
    if (sheet.type === 'sunlight') {
      if (sheet.step === 'success') return <SuccessScreen points={2} label="Sunlight Logged"
        subtitle="Morning light anchors your circadian rhythm, supporting better sleep, mood, and metabolic health." />;

      const clampSun = (v: number) => Math.min(120, Math.max(1, v));
      const startSunLongPress = (delta: number) => {
        if (sunlightLongPressRef.current) return;
        const timeout = setTimeout(() => {
          sunlightLongPressRef.current = setInterval(() => {
            setSunlightMinutes(v => clampSun(v + delta));
          }, 120);
        }, 500);
        sunlightLongPressRef.current = timeout as unknown as ReturnType<typeof setInterval>;
      };
      const stopSunLongPress = () => {
        if (sunlightLongPressRef.current) {
          clearInterval(sunlightLongPressRef.current as unknown as ReturnType<typeof setInterval>);
          clearTimeout(sunlightLongPressRef.current as unknown as ReturnType<typeof setTimeout>);
          sunlightLongPressRef.current = null;
        }
      };
      const getSunMsg = (m: number) => {
        if (m <= 5)  return 'A little light is better than none.';
        if (m <= 10) return 'Good start. Morning light helps regulate your body clock.';
        if (m <= 20) return 'Excellent. You\'re supporting healthy sleep, energy and metabolism.';
        return 'Optimal morning light achieved.';
      };

      return (
        <>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={ACTION_CARD_IMAGES.sunlight} alt="Sunlight" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(12,10,4,0.88) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(240,192,96,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Morning Light</p>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>Natural light is one of the most powerful health anchors.</h3>
            </div>
          </div>
          <div style={{ padding: '16px 20px 28px' }}>

            {/* ── Benefit reinforcement card ── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(100,72,8,0.38) 0%, rgba(60,44,8,0.22) 100%)', border: '1.5px solid rgba(232,160,48,0.28)', borderRadius: '20px', padding: '18px 20px', marginBottom: '16px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
              {/* ambient warm glow */}
              <motion.div animate={{ opacity: [0.10, 0.22, 0.10] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,192,96,0.9) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(240,192,96,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Today's Sunlight</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '22px' }}>☀️</span>
                  <AnimatePresence mode="wait">
                    <motion.span key={sunlightMinutes}
                      initial={{ opacity: 0.6, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      style={{ fontSize: '28px', fontWeight: 900, color: '#F0C060', letterSpacing: '-0.03em' }}>
                      {sunlightMinutes} minutes
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Supports</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                  {['Energy', 'Sleep Quality', 'Circadian Rhythm'].map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#F0C060" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Premium duration selector ── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(100,72,8,0.22) 0%, rgba(40,28,4,0.16) 100%)', border: '1.5px solid rgba(232,160,48,0.24)', borderRadius: '24px', padding: '24px 20px 20px', marginBottom: '16px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              {/* Breathing amber glow behind the number */}
              <motion.div animate={{ scale: [1, 1.14, 1], opacity: [0.07, 0.16, 0.07] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,192,96,0.9) 0%, transparent 68%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '24px' }}>
                <AnimatePresence mode="wait">
                  <motion.span key={sunlightMinutes}
                    initial={{ opacity: 0.5, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ display: 'block', fontSize: '80px', fontWeight: 900, color: '#F0C060', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {sunlightMinutes}
                  </motion.span>
                </AnimatePresence>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: '4px', display: 'block' }}>minutes</span>
              </div>

              {/* − / + buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginBottom: '20px' }}>
                {([{ delta: -1, label: '−' }, { delta: 1, label: '+' }] as const).map(btn => (
                  <motion.button key={btn.label}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setSunlightMinutes(v => clampSun(v + btn.delta))}
                    onPointerDown={() => startSunLongPress(btn.delta)}
                    onPointerUp={stopSunLongPress}
                    onPointerLeave={stopSunLongPress}
                    onPointerCancel={stopSunLongPress}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', background: btn.delta > 0 ? 'linear-gradient(135deg, rgba(232,160,48,0.30) 0%, rgba(232,160,48,0.14) 100%)' : 'linear-gradient(135deg, rgba(232,160,48,0.18) 0%, rgba(232,160,48,0.08) 100%)', border: `2px solid ${btn.delta > 0 ? 'rgba(232,160,48,0.55)' : 'rgba(232,160,48,0.30)'}`, cursor: 'pointer', fontSize: '32px', fontWeight: 300, color: '#F0C060', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btn.delta > 0 ? '0 2px 16px rgba(232,160,48,0.22)' : '0 2px 8px rgba(0,0,0,0.2)', lineHeight: 1 }}>
                    {btn.label}
                  </motion.button>
                ))}
              </div>

              {/* Coaching message */}
              <AnimatePresence mode="wait">
                <motion.p key={getSunMsg(sunlightMinutes)}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{ textAlign: 'center' as const, fontSize: '12px', color: 'rgba(240,192,96,0.65)', fontStyle: 'italic', margin: 0 }}>
                  "{getSunMsg(sunlightMinutes)}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Log button */}
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => { awardPoints('sunlight', 2); setSheet({ type: 'sunlight', step: 'success', minutes: sunlightMinutes }); }}
              style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #B8860B 0%, #8B6508 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(184,134,11,0.40)' }}>
              Log {sunlightMinutes} min of Sunlight →
            </motion.button>
          </div>
        </>
      );
    }

    // ─── MEDITATION ────────────────────────────────────────────────────────────
    if (sheet.type === 'meditation') {

      // ── Shared helpers ──────────────────────────────────────────────────────
      const MED_PURPLE = '#C090D0';
      const MED_ACCENT = 'rgba(192,144,208,';
      const clampMed = (v: number) => Math.min(120, Math.max(1, v));
      const startMedLongPress = (delta: number) => {
        if (meditationLongPressRef.current) return;
        const t = setTimeout(() => {
          meditationLongPressRef.current = setInterval(() => setMeditationMinutes(v => clampMed(v + delta)), 120);
        }, 500);
        meditationLongPressRef.current = t as unknown as ReturnType<typeof setInterval>;
      };
      const stopMedLongPress = () => {
        if (meditationLongPressRef.current) {
          clearInterval(meditationLongPressRef.current as unknown as ReturnType<typeof setInterval>);
          clearTimeout(meditationLongPressRef.current as unknown as ReturnType<typeof setTimeout>);
          meditationLongPressRef.current = null;
        }
      };
      const MedHero = () => (
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={ACTION_CARD_IMAGES.meditation} alt="Meditation" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(8,4,18,0.9) 100%)' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.8)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Mindfulness</p>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>A quiet mind is the foundation of clear action.</h3>
          </div>
        </div>
      );
      const MedDurationSelector = () => (
        <div style={{ background: `linear-gradient(135deg, rgba(80,40,100,0.22) 0%, rgba(40,20,60,0.16) 100%)`, border: `1.5px solid ${MED_ACCENT}0.24)`, borderRadius: '24px', padding: '24px 20px 20px', marginBottom: '16px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 32px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ scale: [1, 1.14, 1], opacity: [0.06, 0.14, 0.06] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${MED_ACCENT}0.8) 0%, transparent 68%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '24px' }}>
            <AnimatePresence mode="wait">
              <motion.span key={meditationMinutes} initial={{ opacity: 0.5, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                style={{ display: 'block', fontSize: '80px', fontWeight: 900, color: MED_PURPLE, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {meditationMinutes}
              </motion.span>
            </AnimatePresence>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: '4px', display: 'block' }}>minutes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px' }}>
            {([{ delta: -1, label: '−' }, { delta: 1, label: '+' }] as const).map(btn => (
              <motion.button key={btn.label} whileTap={{ scale: 0.88 }}
                onClick={() => setMeditationMinutes(v => clampMed(v + btn.delta))}
                onPointerDown={() => startMedLongPress(btn.delta)}
                onPointerUp={stopMedLongPress} onPointerLeave={stopMedLongPress} onPointerCancel={stopMedLongPress}
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: btn.delta > 0 ? `linear-gradient(135deg, ${MED_ACCENT}0.30) 0%, ${MED_ACCENT}0.14) 100%)` : `linear-gradient(135deg, ${MED_ACCENT}0.18) 0%, ${MED_ACCENT}0.08) 100%)`, border: `2px solid ${btn.delta > 0 ? MED_ACCENT + '0.55)' : MED_ACCENT + '0.30)'}`, cursor: 'pointer', fontSize: '32px', fontWeight: 300, color: MED_PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btn.delta > 0 ? `0 2px 16px ${MED_ACCENT}0.22)` : '0 2px 8px rgba(0,0,0,0.2)', lineHeight: 1 }}>
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>
      );

      // ── SUCCESS ──────────────────────────────────────────────────────────────
      if (sheet.step === 'success') {
        const feelingEmojis: Record<string, string> = { overwhelmed: '😵', stressed: '😰', distracted: '⚡', tired: '😴', good: '😊' };
        const postEmojis: Record<string, string> = { sad: '😔', neutral: '😐', okay: '🙂', calm: '😌', great: '😁' };
        return (
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '32px 24px 40px', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glow */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${MED_ACCENT}0.7) 0%, transparent 68%)`, pointerEvents: 'none' }} />
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ position: 'relative', fontSize: '52px', marginBottom: '16px' }}>✨</motion.div>
            <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {sheet.sessionType === 'live' ? 'Session Complete' : 'Meditation Logged'}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }}
              style={{ fontSize: '15px', color: MED_PURPLE, fontWeight: 700, marginBottom: '24px' }}>
              {sheet.minutes} minutes completed
            </motion.p>
            {sheet.feeling && sheet.postFeeling && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
                style={{ background: `linear-gradient(135deg, rgba(80,40,100,0.30) 0%, rgba(40,20,60,0.20) 100%)`, border: `1.5px solid ${MED_ACCENT}0.25)`, borderRadius: '20px', padding: '18px 24px', marginBottom: '20px', width: '100%' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.45)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Mood Shift</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '36px' }}>{feelingEmojis[sheet.feeling] ?? '😊'}</span>
                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none"><path d="M2 6h24M20 2l6 4-6 4" stroke={MED_PURPLE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: '36px' }}>{postEmojis[sheet.postFeeling] ?? '😌'}</span>
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
              style={{ background: `linear-gradient(135deg, rgba(80,40,100,0.20) 0%, rgba(40,20,60,0.12) 100%)`, border: `1.5px solid ${MED_ACCENT}0.18)`, borderRadius: '16px', padding: '14px 20px', marginBottom: '24px', width: '100%' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                Taking a mindful pause supports focus, emotional resilience and recovery.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55, duration: 0.35 }}
              style={{ background: `linear-gradient(135deg, ${MED_ACCENT}0.22) 0%, ${MED_ACCENT}0.10) 100%)`, border: `1.5px solid ${MED_ACCENT}0.35)`, borderRadius: '50px', padding: '8px 20px', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🌿</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: MED_PURPLE }}>+4 H+</span>
            </motion.div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={close}
              style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, #6B3D8A 0%, #4A2268 100%)`, border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: `0 4px 20px ${MED_ACCENT}0.35)` }}>
              Done
            </motion.button>
          </div>
        );
      }

      // ── POST-SESSION REFLECTION ───────────────────────────────────────────────
      if (sheet.step === 'post-feeling') {
        const postOpts = [
          { key: 'sad',     emoji: '😔', label: 'Still heavy' },
          { key: 'neutral', emoji: '😐', label: 'About the same' },
          { key: 'okay',    emoji: '🙂', label: 'A little better' },
          { key: 'calm',    emoji: '😌', label: 'Calm' },
          { key: 'great',   emoji: '😁', label: 'Great' },
        ];
        return (
          <>
            <MedHero />
            <div style={{ padding: '24px 20px 32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.5)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Reflection</p>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.2 }}>How do you feel now?</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                {postOpts.map(opt => (
                  <motion.button key={opt.key} whileTap={{ scale: 0.90 }} whileHover={{ y: -3 }}
                    onClick={() => { awardPoints('meditation', 4); setSheet({ ...sheet, step: 'success', postFeeling: opt.key }); }}
                    style={{ flex: 1, padding: '18px 4px 14px', background: `${MED_ACCENT}0.08)`, border: `1.5px solid ${MED_ACCENT}0.22)`, borderRadius: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '28px', lineHeight: 1 }}>{opt.emoji}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textAlign: 'center' as const }}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      // ── ACTIVE SESSION ────────────────────────────────────────────────────────
      if (sheet.step === 'active') {
        const totalSecs = (sheet.minutes ?? meditationMinutes) * 60;
        const secsLeft = meditationSecsLeft;
        const elapsed = totalSecs - secsLeft;
        const pct = Math.min(1, elapsed / totalSecs);
        const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0');
        const ss = String(secsLeft % 60).padStart(2, '0');
        const PROMPTS = [
          'Your only task is to breathe.',
          'Notice your thoughts. Let them pass.',
          'Return your attention to the present moment.',
          "You're creating space between stimulus and response.",
          'There is nowhere to be but here.',
          'Breathe in calm. Breathe out tension.',
        ];
        // Start timer + breath cycle on mount via a layout effect substitute:
        // We use an inline effect keyed to step === 'active'
        if (meditationTimerRef.current === null && !meditationPaused && secsLeft > 0) {
          meditationTimerRef.current = setInterval(() => {
            setMeditationSecsLeft(s => {
              if (s <= 1) {
                clearInterval(meditationTimerRef.current!);
                meditationTimerRef.current = null;
                return 0;
              }
              return s - 1;
            });
            setMeditationPromptIdx(i => i); // tick — prompts change on elapsed thresholds
          }, 1000);
          meditationBreathRef.current = setInterval(() => {
            setBreathPhase(p => p === 'inhale' ? 'exhale' : 'inhale');
          }, 4000);
        }
        // Auto-advance when timer hits zero
        if (secsLeft === 0 && sheet.step === 'active') {
          // Will be picked up next render — guard with a timeout call to avoid setState-in-render
          setTimeout(() => setSheet(s => s.type === 'meditation' && s.step === 'active' ? { ...s, step: 'post-feeling' } : s), 800);
        }
        const promptIdx = Math.min(PROMPTS.length - 1, Math.floor(elapsed / 120));
        const breathScale = breathPhase === 'inhale' ? 1.18 : 0.88;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', minHeight: '520px', background: 'linear-gradient(180deg, #0A0618 0%, #130A22 50%, #0E0818 100%)', padding: '28px 24px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient layers */}
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.14, 0.06] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', width: '320px', height: '320px', borderRadius: '50%', background: `radial-gradient(circle, ${MED_ACCENT}0.65) 0%, transparent 68%)`, pointerEvents: 'none' }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{ position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', width: '420px', height: '420px', borderRadius: '50%', background: `radial-gradient(circle, rgba(80,40,140,0.7) 0%, transparent 68%)`, pointerEvents: 'none' }} />

            {/* Session title */}
            <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '8px', width: '100%' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.45)`, letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>🌿 Calm The Mind</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', margin: 0 }}>Breathe naturally</p>
            </div>

            {/* Breathing circle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0 20px', flexShrink: 0 }}>
              <motion.div
                animate={{ scale: breathScale, opacity: breathPhase === 'inhale' ? 0.22 : 0.12 }}
                transition={{ duration: 3.8, ease: 'easeInOut' }}
                style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${MED_ACCENT}0.7) 0%, transparent 70%)` }} />
              <motion.div
                animate={{ scale: breathScale }}
                transition={{ duration: 3.8, ease: 'easeInOut' }}
                style={{ width: '130px', height: '130px', borderRadius: '50%', border: `1.5px solid ${MED_ACCENT}0.35)`, background: `radial-gradient(circle, ${MED_ACCENT}0.12) 0%, rgba(20,10,35,0.8) 65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.p key={breathPhase}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: '13px', fontWeight: 700, color: `${MED_ACCENT}0.7)`, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' as const }}>
                    {breathPhase === 'inhale' ? 'Inhale' : 'Exhale'}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Timer */}
            <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '16px' }}>
              <motion.p key={`${mm}:${ss}`}
                initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                {mm}:{ss}
              </motion.p>
              {/* Progress arc (simple bar) */}
              <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', margin: '10px auto 0', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${MED_ACCENT}0.5), ${MED_PURPLE})`, borderRadius: '2px' }} />
              </div>
            </div>

            {/* Gentle prompt */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', marginBottom: '24px' }}>
              <AnimatePresence mode="wait">
                <motion.p key={promptIdx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.7 }}
                  style={{ textAlign: 'center' as const, fontSize: '15px', color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  "{PROMPTS[promptIdx]}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <motion.button whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (meditationPaused) {
                    setMeditationPaused(false);
                    // timer restarts next render because ref is null
                  } else {
                    setMeditationPaused(true);
                    if (meditationTimerRef.current) { clearInterval(meditationTimerRef.current); meditationTimerRef.current = null; }
                    if (meditationBreathRef.current) { clearInterval(meditationBreathRef.current); meditationBreathRef.current = null; }
                  }
                }}
                style={{ flex: 1, padding: '14px', background: `${MED_ACCENT}0.10)`, border: `1.5px solid ${MED_ACCENT}0.22)`, borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: MED_PURPLE }}>
                {meditationPaused ? '▶ Resume' : '⏸ Pause'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (meditationTimerRef.current) { clearInterval(meditationTimerRef.current); meditationTimerRef.current = null; }
                  if (meditationBreathRef.current) { clearInterval(meditationBreathRef.current); meditationBreathRef.current = null; }
                  const elapsed = totalSecs - secsLeft;
                  const completedMins = Math.max(1, Math.round(elapsed / 60));
                  setSheet({ ...sheet, step: 'post-feeling', minutes: completedMins });
                }}
                style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                End Session
              </motion.button>
            </div>
          </div>
        );
      }

      // ── SESSION PREP (Path B step 2) ─────────────────────────────────────────
      if (sheet.step === 'session-prep') {
        const feelingData: Record<string, { title: string; desc: string; duration: string }> = {
          overwhelmed: { title: 'Ground & Release',    desc: 'A gentle session to settle scattered energy and restore a sense of calm.', duration: '8–12 minutes' },
          stressed:    { title: 'Calm The Mind',       desc: 'Short mindfulness to reduce mental tension and restore focus.',            duration: '10–15 minutes' },
          distracted:  { title: 'Return To Now',       desc: 'Bring your attention back to the present moment, one breath at a time.',  duration: '5–10 minutes' },
          tired:       { title: 'Restorative Rest',    desc: 'A moment of stillness that supports gentle mental recovery.',             duration: '10–20 minutes' },
          good:        { title: 'Deepen The Stillness', desc: 'Build on your positive state with a deepening presence practice.',       duration: '15–20 minutes' },
        };
        const rec = (feelingData[sheet.feeling ?? 'stressed'] ?? feelingData.stressed)!;
        return (
          <>
            <MedHero />
            <div style={{ padding: '16px 20px 28px' }}>
              {/* Recommendation card */}
              <div style={{ background: `linear-gradient(135deg, rgba(80,40,100,0.28) 0%, rgba(40,20,60,0.18) 100%)`, border: `1.5px solid ${MED_ACCENT}0.28)`, borderRadius: '20px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                <motion.div animate={{ opacity: [0.06, 0.14, 0.06] }} transition={{ duration: 4, repeat: Infinity }}
                  style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${MED_ACCENT}0.8) 0%, transparent 68%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.5)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>🌿 Recommended</p>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>{rec.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px', lineHeight: 1.5 }}>{rec.desc}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${MED_ACCENT}0.12)`, border: `1px solid ${MED_ACCENT}0.22)`, borderRadius: '50px', padding: '5px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: MED_PURPLE }}>Recommended: {rec.duration}</span>
                  </div>
                </div>
              </div>
              {/* Duration selector */}
              <MedDurationSelector />
              {/* Begin CTA */}
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const secs = meditationMinutes * 60;
                  setMeditationSecsLeft(secs);
                  setMeditationPaused(false);
                  setBreathPhase('inhale');
                  setMeditationPromptIdx(0);
                  if (meditationTimerRef.current) { clearInterval(meditationTimerRef.current); meditationTimerRef.current = null; }
                  if (meditationBreathRef.current) { clearInterval(meditationBreathRef.current); meditationBreathRef.current = null; }
                  setSheet({ ...sheet, step: 'active', minutes: meditationMinutes, sessionType: 'live' });
                }}
                style={{ width: '100%', padding: '16px', background: `linear-gradient(135deg, #6B3D8A 0%, #4A2268 100%)`, border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: `0 4px 20px ${MED_ACCENT}0.35)` }}>
                ▶ Begin Session
              </motion.button>
            </div>
          </>
        );
      }

      // ── HOW ARE YOU FEELING (Path B step 1) ─────────────────────────────────
      if (sheet.step === 'feeling') {
        const FEELINGS = [
          { key: 'overwhelmed', emoji: '😵', label: 'Overwhelmed',  sub: "Let's create space to settle." },
          { key: 'stressed',    emoji: '😰', label: 'Stressed',     sub: "Let's create a little space." },
          { key: 'distracted',  emoji: '⚡', label: 'Distracted',   sub: 'Bring your attention back to the present.' },
          { key: 'tired',       emoji: '😴', label: 'Tired',        sub: 'A moment of stillness can help.' },
          { key: 'good',        emoji: '😊', label: 'Feeling Good', sub: 'Deepen what is already here.' },
        ];
        return (
          <>
            <MedHero />
            <div style={{ padding: '16px 20px 28px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.5)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Mindfulness Check-In</p>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.2 }}>How are you feeling right now?</h3>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                {FEELINGS.map(f => (
                  <motion.button key={f.key} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSheet({ ...sheet, step: 'session-prep', feeling: f.key })}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: `${MED_ACCENT}0.08)`, border: `1.5px solid ${MED_ACCENT}0.20)`, borderRadius: '18px', cursor: 'pointer', textAlign: 'left' as const }}>
                    <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{f.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '2px' }}>{f.label}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0, fontStyle: 'italic' }}>{f.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.28 }}>
                      <path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      // ── LOG DURATION (Path A) ────────────────────────────────────────────────
      if (sheet.step === 'log-duration') {
        return (
          <>
            <MedHero />
            <div style={{ padding: '16px 20px 28px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', paddingLeft: '2px' }}>How long did you meditate?</p>
              <MedDurationSelector />
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { awardPoints('meditation', 4); setSheet({ ...sheet, step: 'success', minutes: meditationMinutes, sessionType: 'log' }); }}
                style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, #6B3D8A 0%, #4A2268 100%)`, border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: `0 4px 20px ${MED_ACCENT}0.35)` }}>
                Log {meditationMinutes} min of Meditation →
              </motion.button>
            </div>
          </>
        );
      }

      // ── MINDFULNESS CHECK-IN (pick) ──────────────────────────────────────────
      return (
        <>
          <MedHero />
          <div style={{ padding: '16px 20px 28px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: `${MED_ACCENT}0.5)`, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Mindfulness Check-In</p>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.2 }}>Have you already meditated today?</h3>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
              <motion.button whileHover={{ y: -3, boxShadow: `0 8px 28px ${MED_ACCENT}0.20)` }} whileTap={{ scale: 0.98 }}
                onClick={() => setSheet({ ...sheet, step: 'log-duration', sessionType: 'log' })}
                style={{ width: '100%', padding: '22px 20px', background: `linear-gradient(135deg, rgba(80,40,100,0.28) 0%, rgba(40,20,60,0.18) 100%)`, border: `1.5px solid ${MED_ACCENT}0.30)`, borderRadius: '20px', cursor: 'pointer', textAlign: 'left' as const, boxShadow: `0 2px 20px rgba(0,0,0,0.2)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${MED_ACCENT}0.16)`, border: `1.5px solid ${MED_ACCENT}0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke={MED_PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '3px' }}>I Already Meditated</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', margin: 0 }}>Log a session you've completed.</p>
                  </div>
                </div>
              </motion.button>
              <motion.button whileHover={{ y: -3, boxShadow: `0 8px 28px ${MED_ACCENT}0.28)` }} whileTap={{ scale: 0.98 }}
                onClick={() => setSheet({ ...sheet, step: 'feeling', sessionType: 'live' })}
                style={{ width: '100%', padding: '22px 20px', background: `linear-gradient(135deg, rgba(100,50,130,0.36) 0%, rgba(60,28,85,0.24) 100%)`, border: `1.5px solid ${MED_ACCENT}0.40)`, borderRadius: '20px', cursor: 'pointer', textAlign: 'left' as const, boxShadow: `0 4px 24px ${MED_ACCENT}0.14)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${MED_ACCENT}0.22)`, border: `1.5px solid ${MED_ACCENT}0.40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '24px' }}>
                    🧘
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0, marginBottom: '3px' }}>I'd Like To Meditate Now</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', margin: 0 }}>Take a mindful moment right now.</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </>
      );
    }

    // ─── MOOD ─────────────────────────────────────────────────────────────────
    if (sheet.type === 'mood') {

      if (sheet.step === 'success') {
        const moodEmoji = [undefined,'😣','😔','😐','🙂','😁'][sheet.mood ?? 3] ?? '🙂';
        return <SuccessScreen points={2} label="Mood Logged"
          details={[
            sheet.moodLabel ? { icon: moodEmoji, label: 'Mood', value: sheet.moodLabel } : null,
            sheet.influences && sheet.influences.length > 0 ? { icon: '🔍', label: 'Influences', value: sheet.influences.slice(0, 2).join(', ') } : null,
          ].filter(Boolean) as Array<{ icon: string; label: string; value: string }>}
          subtitle="Emotional awareness is one of the strongest foundations of sustainable behaviour change." />;
      }

      if (sheet.step === 'reflection' && sheet.mood) {
        const prompts = ["What contributed most to this feeling?", "What are you grateful for today?", "What would make tomorrow better?"];
        const prompt = prompts[(sheet.mood - 1) % prompts.length] ?? prompts[0];
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.mood} label="Reflection" sublabel={`Mood · ${sheet.moodLabel ?? ''}`} />
            <StepIndicator current={3} total={3} accentColor="#A8C5AC" />
            <SharedDateTimeBar />
            <div style={{ padding: '14px 24px 32px' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', fontStyle: 'italic' }}>&ldquo;{prompt}&rdquo;</p>
              <textarea value={moodReflection} onChange={e => setMoodReflection(e.target.value)}
                placeholder="Optional — share your thoughts..."
                rows={4}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '14px', background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' as const, color: '#fff', fontFamily: 'inherit', resize: 'none' as const, lineHeight: 1.6 }} />
              <motion.button whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4A6E50 0%, #2D4A30 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', marginTop: '16px', boxShadow: '0 4px 20px rgba(74,143,80,0.3)' }}
                onClick={() => { awardPoints('mood', 2); setSheet({ ...sheet, step: 'success' }); }}>
                Log Mood · +2 H+
              </motion.button>
              <button onClick={() => { awardPoints('mood', 2); setSheet({ ...sheet, step: 'success' }); }}
                style={{ width: '100%', padding: '11px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                Skip reflection
              </button>
            </div>
          </>
        );
      }

      if (sheet.step === 'influences' && sheet.mood) {
        const INFLUENCE_CHIPS = ['Work', 'Family', 'Health', 'Sleep', 'Exercise', 'Food', 'Relationships', 'Finances', 'Travel', 'Self Care', 'Other'];
        return (
          <>
            <HeroImageBand imgSrc={ACTION_CARD_IMAGES.mood} label="What influenced this?" sublabel={`Mood · ${sheet.moodLabel ?? ''}`} />
            <StepIndicator current={2} total={3} accentColor="#A8C5AC" />
            <SharedDateTimeBar />
            <div style={{ padding: '14px 24px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '18px' }}>Select all that apply. This helps your coach understand patterns.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '24px' }}>
                {INFLUENCE_CHIPS.map(chip => {
                  const isActive = moodInfluences.includes(chip);
                  return (
                    <motion.button key={chip} whileTap={{ scale: 0.94 }}
                      onClick={() => setMoodInfluences(prev => prev.includes(chip) ? prev.filter(x => x !== chip) : [...prev, chip])}
                      style={{ padding: '10px 16px', borderRadius: '24px', border: `1.5px solid ${isActive ? 'rgba(168,197,172,0.6)' : 'rgba(255,255,255,0.12)'}`, background: isActive ? 'rgba(107,143,113,0.18)' : 'rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 700, color: isActive ? '#A8C5AC' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {isActive ? '✓ ' : ''}{chip}
                    </motion.button>
                  );
                })}
              </div>
              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => setSheet({ ...sheet, step: 'reflection', influences: moodInfluences })}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4A6E50 0%, #2D4A30 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
                Next → Reflection
              </motion.button>
              <button onClick={() => { awardPoints('mood', 2); setSheet({ ...sheet, step: 'success' }); }}
                style={{ width: '100%', padding: '11px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                Skip — log now
              </button>
            </div>
          </>
        );
      }

      // Step 1 — How are you feeling?
      const MOODS_FULL = [
        { emoji: '😁', label: 'Great', sub: 'Feeling on top', val: 5 },
        { emoji: '🙂', label: 'Good', sub: 'Positive energy', val: 4 },
        { emoji: '😐', label: 'Okay', sub: 'Getting through', val: 3 },
        { emoji: '😔', label: 'Low', sub: 'Feeling flat', val: 2 },
        { emoji: '😣', label: 'Stressed', sub: 'Overwhelmed', val: 1 },
        { emoji: '😡', label: 'Frustrated', sub: 'On edge', val: 0 },
      ];
      return (
        <>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={ACTION_CARD_IMAGES.mood} alt="Mood" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(8,4,18,0.9) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Mood Check-in</p>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>Understanding how you feel is the first step to improving it.</h3>
            </div>
          </div>
          <StepIndicator current={1} total={3} accentColor="#A8C5AC" />
          <ActivityDateTimeSelector />
          <div style={{ padding: '14px 24px 32px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '18px' }}>How are you feeling right now?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {MOODS_FULL.map(m => (
                <motion.button key={m.val} whileHover={{ y: -4, scale: 1.04 }} whileTap={{ scale: 0.93 }}
                  onClick={() => setSheet({ type: 'mood', step: 'influences', mood: m.val, moodLabel: m.label })}
                  style={{ padding: '22px 8px 16px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '36px', lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{m.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>{m.sub}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      );
    }

    // ─── BIOMARKER ─────────────────────────────────────────────────────────────
    if (sheet.type === 'biomarker') {
      const METRICS = [
        { id: 'weight',  label: 'Weight',         icon: '⚖️',  unit: 'kg',    color: '#6B8F71', accent: 'rgba(107,143,113,', lastVal: '70.4 kg',  lastDelta: '↓ 2.8 kg since Month 1', lastAge: '3 days ago',  story: 'Every reading helps reveal your long-term trend.' },
        { id: 'waist',   label: 'Waist',           icon: '📏', unit: 'cm',    color: '#D4A843', accent: 'rgba(212,168,67,',  lastVal: '90 cm',    lastDelta: '↓ 4 cm since Month 1',   lastAge: '1 week ago',  story: 'Small changes often reflect meaningful metabolic improvements.' },
        { id: 'bp',      label: 'Blood Pressure',  icon: '❤️', unit: 'mmHg',  color: '#C8604A', accent: 'rgba(200,96,74,',   lastVal: '118 / 76', lastDelta: 'Healthy range',           lastAge: '3 days ago',  story: 'Monitoring regularly helps you understand what works.' },
        { id: 'glucose', label: 'Blood Glucose',   icon: '🩸', unit: 'mg/dL', color: '#4A8BBE', accent: 'rgba(74,139,190,',  lastVal: '94 mg/dL', lastDelta: 'Improving steadily',      lastAge: '1 week ago',  story: 'Consistency reveals patterns that matter.' },
      ];
      const currentMetric = METRICS.find(x => x.id === sheet.metric);

      // ── Shared long-press factory ─────────────────────────────────────────
      const makeLongPress = (ref: React.MutableRefObject<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>, setter: React.Dispatch<React.SetStateAction<number>>, delta: number, min: number, max: number) => ({
        onClick: () => setter(v => Math.min(max, Math.max(min, v + delta))),
        onPointerDown: () => {
          if (ref.current) return;
          const t = setTimeout(() => {
            ref.current = setInterval(() => setter(v => Math.min(max, Math.max(min, v + delta))), 100);
          }, 500);
          ref.current = t as unknown as ReturnType<typeof setInterval>;
        },
        onPointerUp: () => { if (ref.current) { clearInterval(ref.current as unknown as ReturnType<typeof setInterval>); clearTimeout(ref.current as unknown as ReturnType<typeof setTimeout>); ref.current = null; } },
        onPointerLeave: () => { if (ref.current) { clearInterval(ref.current as unknown as ReturnType<typeof setInterval>); clearTimeout(ref.current as unknown as ReturnType<typeof setTimeout>); ref.current = null; } },
        onPointerCancel: () => { if (ref.current) { clearInterval(ref.current as unknown as ReturnType<typeof setInterval>); clearTimeout(ref.current as unknown as ReturnType<typeof setTimeout>); ref.current = null; } },
      });

      // ── Metric selector widget ─────────────────────────────────────────────
      // val is stored ×10 for weight (one decimal), ×1 for others
      const MetricSelector = ({ val, setVal, lpRef, unit, isDecimal, accentRgb }: {
        val: number; setVal: React.Dispatch<React.SetStateAction<number>>;
        lpRef: React.MutableRefObject<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>;
        unit: string; isDecimal?: boolean; accentRgb: string;
      }) => {
        const displayVal = isDecimal ? (val / 10).toFixed(1) : String(val);
        const c = `rgba(${accentRgb},`;
        return (
          <div style={{ background: `linear-gradient(135deg, ${c}0.16) 0%, ${c}0.08) 100%)`, border: `1.5px solid ${c}0.28)`, borderRadius: '24px', padding: '24px 20px 20px', marginBottom: '16px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${c}0.7) 0%, transparent 68%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', textAlign: 'center' as const, marginBottom: '24px' }}>
              <AnimatePresence mode="wait">
                <motion.span key={displayVal} initial={{ opacity: 0.5, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.09 }}
                  style={{ display: 'block', fontSize: '72px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {displayVal}
                </motion.span>
              </AnimatePresence>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: '4px', display: 'block' }}>{unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {[{ d: isDecimal ? -1 : -1, label: '−' }, { d: isDecimal ? 1 : 1, label: '+' }].map(btn => (
                <motion.button key={btn.label} whileTap={{ scale: 0.88 }}
                  {...makeLongPress(lpRef, setVal, btn.d, isDecimal ? 300 : 1, isDecimal ? 2000 : 999)}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: btn.d > 0 ? `linear-gradient(135deg, ${c}0.28) 0%, ${c}0.14) 100%)` : `linear-gradient(135deg, ${c}0.16) 0%, ${c}0.08) 100%)`, border: `2px solid ${btn.d > 0 ? c + '0.50)' : c + '0.28)'}`, cursor: 'pointer', fontSize: '32px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: btn.d > 0 ? `0 2px 16px ${c}0.20)` : '0 2px 8px rgba(0,0,0,0.2)', lineHeight: 1 }}>
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        );
      };

      // ── SUCCESS ──────────────────────────────────────────────────────────────
      if (sheet.step === 'success') {
        const m = currentMetric;
        const readingLine = sheet.metric === 'bp'
          ? `${sheet.value} / ${sheet.value2} mmHg`
          : sheet.metric === 'weight'  ? `${sheet.value} kg`
          : sheet.metric === 'waist'   ? `${sheet.value} cm`
          : sheet.metric === 'glucose' ? `${sheet.value} mg/dL` : sheet.value ?? '';
        const prevDelta = m?.lastDelta ?? '';
        return (
          <div style={{ padding: '32px 24px 40px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
            <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.06, 0.16, 0.06] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle, ${m?.accent ?? 'rgba(107,143,113,'}0.7) 0%, transparent 68%)`, pointerEvents: 'none' }} />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '20px', background: `linear-gradient(135deg, ${m?.accent ?? 'rgba(107,143,113,'}0.30) 0%, ${m?.accent ?? 'rgba(107,143,113,'}0.14) 100%)`, border: `1.5px solid ${m?.accent ?? 'rgba(107,143,113,'}0.40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px', boxShadow: `0 4px 20px ${m?.accent ?? 'rgba(107,143,113,'}0.25)` }}>
              {m?.icon ?? '📊'}
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
              style={{ fontSize: '10px', fontWeight: 700, color: m?.color ?? '#6B8F71', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
              Reading Saved
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.35 }}
              style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>
              {readingLine}
            </motion.h2>
            {prevDelta && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26, duration: 0.35 }}
                style={{ fontSize: '14px', fontWeight: 700, color: m?.color ?? '#6B8F71', marginBottom: '20px' }}>
                {prevDelta}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.35 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px', padding: '14px 20px', marginBottom: '20px', width: '100%' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {m?.story ?? 'Tracking your health consistently helps reveal trends that aren\'t visible day to day.'}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.44, duration: 0.3 }}
              style={{ background: `linear-gradient(135deg, ${m?.accent ?? 'rgba(107,143,113,'}0.22) 0%, ${m?.accent ?? 'rgba(107,143,113,'}0.10) 100%)`, border: `1.5px solid ${m?.accent ?? 'rgba(107,143,113,'}0.35)`, borderRadius: '50px', padding: '8px 20px', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>✓</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: m?.color ?? '#6B8F71' }}>+2 H+</span>
            </motion.div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={close}
              style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${m?.color ?? '#6B8F71'} 0%, ${m?.color ?? '#4a6e50'}99 100%)`, border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              Done
            </motion.button>
          </div>
        );
      }

      // ── GLUCOSE CONTEXT ───────────────────────────────────────────────────────
      if (sheet.step === 'glucose-context') {
        const ctxOpts = [
          { label: 'Fasting',       sub: 'Morning, before eating',  val: 'fasting',       icon: '🌙' },
          { label: 'Post Breakfast', sub: '1–2h after breakfast',   val: 'post-breakfast', icon: '🌅' },
          { label: 'Post Lunch',    sub: '1–2h after lunch',        val: 'post-lunch',     icon: '☀️' },
          { label: 'Post Dinner',   sub: '1–2h after dinner',       val: 'post-dinner',    icon: '🌙' },
          { label: 'Random',        sub: 'Spot check',              val: 'random',         icon: '⚡' },
        ];
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.glucose ?? ACTION_CARD_IMAGES.biomarker} label="Blood Glucose" sublabel="When did you measure?" accentColor="#4A8BBE" />
            <div style={{ padding: '16px 20px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', marginBottom: '16px' }}>Context determines what your reading means.</p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {ctxOpts.map(c => (
                  <motion.button key={c.val} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setBioNumVal(94); setSheet({ ...sheet, step: 'glucose-value', context: c.val }); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', background: 'rgba(74,139,190,0.10)', border: '1.5px solid rgba(74,139,190,0.26)', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' as const }}>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, marginBottom: '1px' }}>{c.label}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>{c.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.28 }}><path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      // ── GLUCOSE VALUE ─────────────────────────────────────────────────────────
      if (sheet.step === 'glucose-value') {
        const glucMsg = bioNumVal < 70  ? "Below normal range. Consider eating something." :
                        bioNumVal <= 100 ? "Normal fasting range. Great reading." :
                        bioNumVal <= 140 ? "Slightly elevated. Continue your habits." :
                                           "Above target. Monitor and stay consistent.";
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.glucose ?? ACTION_CARD_IMAGES.biomarker} label="Blood Glucose" sublabel={`${sheet.context?.replace('-', ' ') ?? 'Reading'}`} accentColor="#4A8BBE" />
            <div style={{ padding: '16px 20px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', flex: 1 }}>Consistency reveals patterns that matter.</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(74,139,190,0.7)', background: 'rgba(74,139,190,0.12)', borderRadius: '50px', padding: '3px 10px', flexShrink: 0 }}>Last: 98 mg/dL</span>
              </div>
              <MetricSelector val={bioNumVal} setVal={setBioNumVal} lpRef={bioLPRef} unit="mg/dL" isDecimal={false} accentRgb="74,139,190" />
              <AnimatePresence mode="wait">
                <motion.div key={glucMsg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ background: 'rgba(74,139,190,0.10)', border: '1px solid rgba(74,139,190,0.22)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0, fontStyle: 'italic' }}>{glucMsg}</p>
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { awardPoints('biomarker', 2); setSheet({ type: 'biomarker', step: 'success', metric: 'glucose', value: String(bioNumVal), context: sheet.context }); }}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #3A6A9E 0%, #1E4A7E 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(58,106,158,0.38)' }}>
                Save {bioNumVal} mg/dL →
              </motion.button>
            </div>
          </>
        );
      }

      // ── BLOOD PRESSURE (single screen) ───────────────────────────────────────
      if (sheet.step === 'bp-entry') {
        const sys = bioNumVal;  // stored direct (not ×10)
        const dia = bioNum2Val;
        const bpInterp = sys < 120 && dia < 80  ? { label: 'Normal Range',      color: '#6B8F71', msg: 'Healthy reading. Well within target.' } :
                          sys < 130 && dia < 80  ? { label: 'Slightly Elevated', color: '#D4A843', msg: 'Worth monitoring. Continue your lifestyle habits.' } :
                          sys < 140 || dia < 90  ? { label: 'Above Normal',      color: '#C8604A', msg: 'Continue working with your care plan.' } :
                                                   { label: 'High',              color: '#C8604A', msg: 'Speak with your care team. Keep tracking.' };
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.bp ?? ACTION_CARD_IMAGES.biomarker} label="Blood Pressure" sublabel="Today's Reading" accentColor="#C8604A" />
            <div style={{ padding: '16px 20px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', flex: 1 }}>Monitoring regularly helps you understand what works.</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(200,96,74,0.7)', background: 'rgba(200,96,74,0.12)', borderRadius: '50px', padding: '3px 10px', flexShrink: 0 }}>Last: 118/76</span>
              </div>

              {/* Live preview */}
              <div style={{ textAlign: 'center' as const, marginBottom: '14px' }}>
                <AnimatePresence mode="wait">
                  <motion.span key={`${sys}/${dia}`} initial={{ opacity: 0.6, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.1 }}
                    style={{ fontSize: '48px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>
                    {sys} <span style={{ opacity: 0.4, fontWeight: 300 }}>/</span> {dia}
                  </motion.span>
                </AnimatePresence>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>mmHg</p>
              </div>

              {/* Two selectors side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {/* Systolic */}
                <div style={{ background: 'rgba(200,96,74,0.12)', border: '1.5px solid rgba(200,96,74,0.26)', borderRadius: '20px', padding: '16px 12px', textAlign: 'center' as const }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(200,96,74,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Systolic</p>
                  <AnimatePresence mode="wait">
                    <motion.span key={sys} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.09 }}
                      style={{ display: 'block', fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '12px' }}>
                      {sys}
                    </motion.span>
                  </AnimatePresence>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {[{ d: -1, l: '−' }, { d: 1, l: '+' }].map(b => (
                      <motion.button key={b.l} whileTap={{ scale: 0.88 }}
                        {...makeLongPress(bioLPRef, setBioNumVal, b.d, 60, 200)}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', background: b.d > 0 ? 'rgba(200,96,74,0.28)' : 'rgba(200,96,74,0.14)', border: `2px solid ${b.d > 0 ? 'rgba(200,96,74,0.50)' : 'rgba(200,96,74,0.28)'}`, cursor: 'pointer', fontSize: '22px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {b.l}
                      </motion.button>
                    ))}
                  </div>
                </div>
                {/* Diastolic */}
                <div style={{ background: 'rgba(200,96,74,0.12)', border: '1.5px solid rgba(200,96,74,0.26)', borderRadius: '20px', padding: '16px 12px', textAlign: 'center' as const }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(200,96,74,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Diastolic</p>
                  <AnimatePresence mode="wait">
                    <motion.span key={dia} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.09 }}
                      style={{ display: 'block', fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '12px' }}>
                      {dia}
                    </motion.span>
                  </AnimatePresence>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {[{ d: -1, l: '−' }, { d: 1, l: '+' }].map(b => (
                      <motion.button key={b.l} whileTap={{ scale: 0.88 }}
                        {...makeLongPress(bioLP2Ref, setBioNum2Val, b.d, 40, 140)}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', background: b.d > 0 ? 'rgba(200,96,74,0.28)' : 'rgba(200,96,74,0.14)', border: `2px solid ${b.d > 0 ? 'rgba(200,96,74,0.50)' : 'rgba(200,96,74,0.28)'}`, cursor: 'pointer', fontSize: '22px', fontWeight: 300, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {b.l}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <AnimatePresence mode="wait">
                <motion.div key={bpInterp.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: bpInterp.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: bpInterp.color, margin: 0, marginBottom: '2px' }}>{bpInterp.label}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{bpInterp.msg}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { awardPoints('biomarker', 2); setSheet({ type: 'biomarker', step: 'success', metric: 'bp', value: String(sys), value2: String(dia) }); }}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #9E3A2A 0%, #7E1E0E 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(200,96,74,0.32)' }}>
                Save {sys} / {dia} mmHg →
              </motion.button>
            </div>
          </>
        );
      }

      // ── WEIGHT VALUE ──────────────────────────────────────────────────────────
      if (sheet.step === 'weight-value') {
        const weightKg = (bioNumVal / 10).toFixed(1);
        const diff = (bioNumVal / 10 - 70.4).toFixed(1);
        const diffNum = parseFloat(diff);
        const weightMsg = diffNum < -0.1 ? "You're moving in the right direction." :
                          diffNum > 0.1  ? "One measurement never defines your journey." :
                                           "Consistency creates lasting results.";
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.weight ?? ACTION_CARD_IMAGES.biomarker} label="Weight" sublabel="Today's Reading" accentColor="#6B8F71" />
            <div style={{ padding: '16px 20px 28px' }}>
              {/* Last reading context */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1, background: 'rgba(107,143,113,0.10)', border: '1px solid rgba(107,143,113,0.22)', borderRadius: '14px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Last Reading</p>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#A8C5AC', letterSpacing: '-0.02em', margin: 0 }}>70.4 kg</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' }}>3 days ago</p>
                </div>
                <div style={{ flex: 1, background: 'rgba(107,143,113,0.10)', border: '1px solid rgba(107,143,113,0.22)', borderRadius: '14px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Change</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={diff} initial={{ opacity: 0.6, y: -3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
                      style={{ fontSize: '20px', fontWeight: 900, color: diffNum < 0 ? '#A8C5AC' : diffNum > 0 ? '#C8604A' : 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em', margin: 0 }}>
                      {diffNum > 0 ? `+${diff}` : diff} kg
                    </motion.p>
                  </AnimatePresence>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' }}>vs last reading</p>
                </div>
              </div>
              <MetricSelector val={bioNumVal} setVal={setBioNumVal} lpRef={bioLPRef} unit="kg" isDecimal={true} accentRgb="107,143,113" />
              <AnimatePresence mode="wait">
                <motion.div key={weightMsg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                  style={{ background: 'rgba(107,143,113,0.09)', border: '1px solid rgba(107,143,113,0.20)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)', margin: 0, fontStyle: 'italic' }}>{weightMsg}</p>
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSheet({ ...sheet, step: 'weight-timing', value: weightKg })}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #4A6E50 0%, #2D4A30 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(74,110,80,0.32)' }}>
                Save {weightKg} kg →
              </motion.button>
            </div>
          </>
        );
      }

      // ── WEIGHT TIMING ─────────────────────────────────────────────────────────
      if (sheet.step === 'weight-timing' && sheet.value) {
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.weight ?? ACTION_CARD_IMAGES.biomarker} label={`${sheet.value} kg`} sublabel="When did you weigh?" accentColor="#6B8F71" />
            <div style={{ padding: '20px 20px 32px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', marginBottom: '16px' }}>Morning (fasted) gives the most consistent readings over time.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'Morning', sub: 'Fasted, after waking', icon: '🌅', val: 'morning' }, { label: 'Evening', sub: 'End of day', icon: '🌙', val: 'evening' }].map(t => (
                  <motion.button key={t.val} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { awardPoints('biomarker', 2); setSheet({ type: 'biomarker', step: 'success', metric: 'weight', value: sheet.value, timing: t.val }); }}
                    style={{ padding: '28px 12px 22px', background: 'rgba(107,143,113,0.12)', border: '1.5px solid rgba(107,143,113,0.28)', borderRadius: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>{t.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#A8C5AC' }}>{t.label}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{t.sub}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        );
      }

      // ── WAIST VALUE ───────────────────────────────────────────────────────────
      if (sheet.step === 'waist-value') {
        const diff = bioNumVal - 90;
        const waistMsg = diff < 0 ? "Moving in the right direction. Waist reduction often reflects deeper metabolic improvements." :
                         diff > 0 ? "One measurement is just one data point. Stay consistent." :
                                    "Holding steady. Small changes often reflect meaningful metabolic improvements.";
        return (
          <>
            <HeroImageBand imgSrc={BIOMARKER_IMAGES.waist ?? ACTION_CARD_IMAGES.biomarker} label="Waist" sublabel="Circumference" accentColor="#D4A843" />
            <div style={{ padding: '16px 20px 28px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1, background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '14px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(212,168,67,0.55)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Last Reading</p>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#F0C060', letterSpacing: '-0.02em', margin: 0 }}>90 cm</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' }}>1 week ago</p>
                </div>
                <div style={{ flex: 1, background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '14px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(212,168,67,0.55)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Change</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={diff} initial={{ opacity: 0.6, y: -3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
                      style={{ fontSize: '20px', fontWeight: 900, color: diff < 0 ? '#A8C5AC' : diff > 0 ? '#C8604A' : 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em', margin: 0 }}>
                      {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff} cm
                    </motion.p>
                  </AnimatePresence>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' }}>vs last reading</p>
                </div>
              </div>
              <MetricSelector val={bioNumVal} setVal={setBioNumVal} lpRef={bioLPRef} unit="cm" isDecimal={false} accentRgb="212,168,67" />
              {/* Measure tip */}
              <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.18)', borderRadius: '14px', padding: '12px 16px', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>📍</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', margin: 0, lineHeight: 1.5 }}>Measure at your natural waist, just above the navel. Exhale gently before reading.</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={waistMsg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                  style={{ background: 'rgba(212,168,67,0.09)', border: '1px solid rgba(212,168,67,0.20)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)', margin: 0, fontStyle: 'italic' }}>{waistMsg}</p>
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => { awardPoints('biomarker', 2); setSheet({ type: 'biomarker', step: 'success', metric: 'waist', value: String(bioNumVal) }); }}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #8A6E20 0%, #6A4E00 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(138,110,32,0.35)' }}>
                Save {bioNumVal} cm →
              </motion.button>
            </div>
          </>
        );
      }

      // ── BIOMARKER HUB (pick) ──────────────────────────────────────────────────
      return (
        <>
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={ACTION_CARD_IMAGES.biomarker} alt="Biomarkers" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(4,12,18,0.92) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(143,168,216,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Health Measurements</p>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>Track the numbers that tell your transformation story.</h3>
            </div>
          </div>
          <ActivityDateTimeSelector />
          <div style={{ padding: '12px 20px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
              {METRICS.map((m, i) => (
                <motion.button key={m.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.28 }}
                  whileHover={{ y: -2, boxShadow: `0 8px 28px ${m.accent}0.18)` }} whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setBioValue(''); setBioValue2('');
                    if (m.id === 'weight')  { setBioNumVal(704); setSheet({ type: 'biomarker', step: 'weight-value',   metric: m.id }); }
                    else if (m.id === 'waist')   { setBioNumVal(90);  setSheet({ type: 'biomarker', step: 'waist-value',    metric: m.id }); }
                    else if (m.id === 'bp')      { setBioNumVal(120); setBioNum2Val(80); setSheet({ type: 'biomarker', step: 'bp-entry', metric: m.id }); }
                    else if (m.id === 'glucose') { setBioNumVal(94);  setSheet({ type: 'biomarker', step: 'glucose-context', metric: m.id }); }
                  }}
                  style={{ width: '100%', padding: '16px 18px', background: `linear-gradient(135deg, ${m.accent}0.16) 0%, ${m.accent}0.08) 100%)`, border: `1.5px solid ${m.accent}0.28)`, borderRadius: '20px', cursor: 'pointer', textAlign: 'left' as const, boxShadow: `0 2px 16px rgba(0,0,0,0.2)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${m.accent}0.18)`, border: `1.5px solid ${m.accent}0.32)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {m.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{m.lastVal}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: m.color, background: `${m.accent}0.14)`, borderRadius: '50px', padding: '2px 8px', flexShrink: 0 }}>{m.lastDelta}</span>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.32)', margin: 0, letterSpacing: '0.04em' }}>{m.label} · {m.lastAge}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: m.color, background: `${m.accent}0.14)`, border: `1px solid ${m.accent}0.28)`, borderRadius: '50px', padding: '4px 10px', whiteSpace: 'nowrap' as const }}>Update</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.25 }}><path d="M5 3.5l3.5 3.5L5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const MODAL_TITLES: Record<string, string> = {
    meal: 'Meal', exercise: 'Exercise', water: 'Water', sleep: 'Sleep',
    sunlight: 'Sunlight', meditation: 'Meditation', mood: 'Mood', biomarker: 'Biomarkers',
  };

  const isSuccess = 'step' in sheet && (sheet as { step: string }).step === 'success';

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div key="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={close}
        style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(4,10,6,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

      {/* Modal panel */}
      <motion.div key="modal-panel"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', inset: 0, zIndex: 501, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', pointerEvents: 'none',
        }}
      >
        <div style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: '760px',
          background: 'linear-gradient(160deg, #0a1a0d 0%, #0e1c10 50%, #0c1318 100%)',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Unified modal header — always visible except on success */}
          {!isSuccess && (() => {
            const sheetWithStep = sheet as { step?: string; type: string };
            const currentStep = sheetWithStep.step ?? '';
            // Back destinations per flow
            const backMap: Record<string, Record<string, string>> = {
              meal: {
                'plan-meal': 'slot-select', 'adherence': 'plan-meal', 'adherence-changes': 'adherence',
                'components': 'adherence', 'portion': 'components', 'custom-meal': 'slot-select',
              },
              exercise: { duration: 'pick', intensity: 'duration', reflection: 'intensity' },
              water: { context: 'pick' },
              sleep: { quality: 'bedtime', interruptions: 'quality', 'sunlight-prompt': 'interruptions' },
              meditation: { 'log-duration': 'pick', feeling: 'pick', 'session-prep': 'feeling', 'post-feeling': 'active' },
              mood: { influences: 'pick', reflection: 'influences' },
              biomarker: {
                'glucose-context': 'pick', 'glucose-value': 'glucose-context',
                'bp-entry': 'pick',
                'weight-value': 'pick', 'weight-timing': 'weight-value',
                'waist-value': 'pick',
              },
            };
            const entrySteps: Record<string, string> = {
              meal: 'slot-select', exercise: 'pick', water: 'pick', sleep: 'bedtime',
              sunlight: 'pick', meditation: 'pick', mood: 'pick', biomarker: 'pick',
            };
            const backStep = backMap[sheet.type]?.[currentStep];
            const isEntry = currentStep === (entrySteps[sheet.type] ?? '') || !currentStep;
            // Points available for this category
            const catProgress = categoryProgress.find(c => {
              const k = c.category;
              return k === sheet.type || (k === 'meals' && sheet.type === 'meal') || (k === 'biomarkers' && sheet.type === 'biomarker');
            });
            const earnedSoFar = (catProgress?.current ?? 0) * 2;
            const capForCat = catProgress?.hplusMax ?? 2;
            const remainingPts = Math.max(0, capForCat - earnedSoFar);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px 12px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Back / close */}
                {!isEntry && backStep ? (
                  <button onClick={() => setSheet({ ...sheet, step: backStep as never } as never)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '16px', flexShrink: 0 }}>
                    ‹
                  </button>
                ) : (
                  <button onClick={close}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '18px', flexShrink: 0 }}>
                    ×
                  </button>
                )}
                {/* Activity label */}
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, flex: 1 }}>
                  {MODAL_TITLES[sheet.type] ?? sheet.type}
                </span>
                {/* H+ reward pill */}
                {remainingPts > 0 ? (
                  <div style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.28)', borderRadius: '20px', padding: '4px 12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#D4A843' }}>+{remainingPts} H+ available</span>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(107,143,113,0.1)', border: '1px solid rgba(107,143,113,0.25)', borderRadius: '20px', padding: '4px 12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#A8C5AC' }}>✓ Cap reached</span>
                  </div>
                )}
                {/* Close when navigating mid-flow */}
                {!isEntry && (
                  <button onClick={close}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '15px', flexShrink: 0 }}>
                    ×
                  </button>
                )}
              </div>
            );
          })()}

          {/* Scrollable content */}
          <div style={{ overflowY: 'auto', scrollbarWidth: 'none' as const, flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${sheet.type}-${('step' in sheet && sheet) ? (sheet as { step: string }).step : ''}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EARN TODAY'S H+ CAROUSEL — 9 premium cinematic action cards
// ─────────────────────────────────────────────────────────────────────────────

interface EarnCarouselProps {
  categoryProgress: CategoryProgress[];
  hplus: HPlusEngineState;
  onOpen: (sheet: LoggingSheet) => void;
  loggedToday: Set<string>;
}

function EarnTodayCarousel({ categoryProgress, hplus, onOpen, loggedToday }: EarnCarouselProps) {
  const todayPct = Math.round((hplus.todayPoints / hplus.todayMax) * 100);

  const cards: Array<{
    id: string;
    label: string;
    sublabel: string;
    imgSrc: string;
    status: string;
    statusDone: boolean;
    action: () => void;
    isNudges?: boolean;
  }> = [
    ...categoryProgress.map(cat => {
      const isDone = cat.current >= cat.max;
      const singularKey = cat.category === 'meals' ? 'meal' : cat.category === 'biomarkers' ? 'biomarker' : cat.category;
      const hasLogged = loggedToday.has(singularKey);
      const earned = cat.current * 2;
      const statusText = isDone ? 'Completed' : hasLogged ? `${earned}/${cat.hplusMax} H+` : `${cat.hplusMax} H+ available`;
      return {
        id: cat.category,
        label: cat.label,
        sublabel: isDone ? 'Done for today' : 'Tap to log',
        imgSrc: ACTION_CARD_IMAGES[(cat.category === 'meals' ? 'meal' : cat.category === 'biomarkers' ? 'biomarker' : cat.category) as ActivityCategory] ?? ACTION_CARD_IMAGES.meal,
        status: statusText,
        statusDone: isDone,
        action: () => {
          // store uses plural keys; modal uses singular — match both
          const c = cat.category;
          if (c === 'meals' || c === 'meal') onOpen({ type: 'meal', step: 'slot-select' });
          else if (c === 'exercise') onOpen({ type: 'exercise', step: 'pick' });
          else if (c === 'water') onOpen({ type: 'water', step: 'pick' });
          else if (c === 'sleep') onOpen({ type: 'sleep', step: 'bedtime' });
          else if (c === 'sunlight') onOpen({ type: 'sunlight', step: 'pick' });
          else if (c === 'meditation') onOpen({ type: 'meditation', step: 'pick' });
          else if (c === 'mood') onOpen({ type: 'mood', step: 'pick' });
          else if (c === 'biomarkers' || c === 'biomarker') onOpen({ type: 'biomarker', step: 'pick' });
        },
      };
    }),
    {
      id: 'nudges',
      label: 'Daily Nudges',
      sublabel: 'Your reminders',
      imgSrc: ACTION_CARD_IMAGES.nudges,
      status: '3 active',
      statusDone: false,
      action: () => { window.location.href = '/nudges'; },
      isNudges: true,
    },
  ];

  return (
    <div>
      {/* Section header + H+ progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.60)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>Today&apos;s H+ · {hplus.streak}-day streak 🔥</p>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Earn Today&apos;s H+</h3>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
            <p style={{ fontSize: '22px', fontWeight: 900, color: '#D4A843', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>{hplus.todayPoints}<span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>/{hplus.todayMax}</span></p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>H+ today</p>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${todayPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage), #D4A843)', borderRadius: '2px', boxShadow: '0 0 8px rgba(212,168,67,0.4)' }} />
        </div>
      </div>

      {/* Cinematic card carousel — horizontal scroll */}
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' as const, WebkitOverflowScrolling: 'touch' as const, marginLeft: '-1px', paddingLeft: '1px' } as React.CSSProperties}>
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
            whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.60)' }}
            whileTap={{ scale: 0.97 }}
            onClick={card.action}
            style={{
              flexShrink: 0,
              width: '200px',
              height: '250px',
              padding: 0,
              border: 'none',
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative' as const,
              background: '#111',
              boxShadow: card.statusDone
                ? '0 4px 24px rgba(107,143,113,0.25), 0 0 0 1.5px rgba(107,143,113,0.4)'
                : '0 4px 20px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Full-bleed image */}
            <img
              src={card.imgSrc}
              alt={card.label}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'block', transition: 'transform 0.5s ease', transform: 'scale(1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
            />

            {/* Cinematic gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(4,12,6,0.55) 45%, rgba(4,12,6,0.90) 100%)' }} />

            {/* Completion overlay */}
            {card.statusDone && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(107,143,113,0.12)' }} />
            )}

            {/* Status pill — top right */}
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: card.statusDone ? 'rgba(107,143,113,0.85)' : 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(8px)',
              border: card.statusDone ? '1px solid rgba(168,205,172,0.4)' : '1px solid rgba(255,255,255,0.14)',
              borderRadius: '20px', padding: '4px 10px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: card.statusDone ? '#fff' : 'rgba(255,255,255,0.85)', letterSpacing: '0.02em', whiteSpace: 'nowrap' as const }}>
                {card.statusDone ? '✓ Done' : card.status}
              </span>
            </div>

            {/* Bottom content */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px 18px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '4px', letterSpacing: '0.04em' }}>{card.sublabel}</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: card.isNudges ? 0 : '10px' }}>{card.label}</p>
              {!card.isNudges && !card.statusDone && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(212,168,67,0.18)', border: '1px solid rgba(212,168,67,0.35)',
                  borderRadius: '12px', padding: '5px 10px',
                }}>
                  <Zap size={10} color="#D4A843" fill="#D4A843" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#D4A843' }}>+2 H+</span>
                </div>
              )}
              {card.statusDone && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(107,143,113,0.2)', border: '1px solid rgba(107,143,113,0.4)', borderRadius: '12px', padding: '5px 10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8C5AC' }}>Completed</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY OPERATIONS SECTION — premium execution layer for all monthly pages
// ─────────────────────────────────────────────────────────────────────────────

function DailyOperationsSection({ monthNum }: { monthNum: number }) {
  const storeSnap = useHPlusStore();
  const hplus = storeSnap.hplus;
  const categories = storeSnap.categories;
  const loggedToday = storeSnap.loggedToday;

  const setHplus: React.Dispatch<React.SetStateAction<HPlusEngineState>> = () => {};
  const setCategoryProgress: React.Dispatch<React.SetStateAction<CategoryProgress[]>> = () => {};

  const [sheet, setSheet] = useState<LoggingSheet>({ type: 'closed' });

  const todayPct = Math.round((hplus.todayPoints / hplus.todayMax) * 100);
  const completedCount = categories.filter(c => c.current >= c.max).length;
  const totalCount = categories.length;

  const CHECKLIST = [
    { label: 'Meals logged',         key: 'meals',       done: (categories.find(c => c.category === 'meals')?.current ?? 0) > 0 },
    { label: 'Water goal reached',   key: 'water',       done: (categories.find(c => c.category === 'water')?.current ?? 0) >= (categories.find(c => c.category === 'water')?.max ?? 1) },
    { label: 'Mood check-in',        key: 'mood',        done: (categories.find(c => c.category === 'mood')?.current ?? 0) > 0 },
    { label: 'Sleep logged',         key: 'sleep',       done: (categories.find(c => c.category === 'sleep')?.current ?? 0) > 0 },
    { label: 'Biomarkers pending',   key: 'biomarkers',  done: (categories.find(c => c.category === 'biomarkers')?.current ?? 0) >= (categories.find(c => c.category === 'biomarkers')?.max ?? 5) },
  ];

  return (
    <>
      <style>{`
        .dos-mobile-only { display: block; }
        .dos-desktop-only { display: none; }

        @keyframes dos-ring-fill { from { stroke-dashoffset: 226; } to { stroke-dashoffset: var(--dos-ring-offset); } }
        @keyframes dos-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dos-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.30); }
          50% { box-shadow: 0 0 0 8px rgba(107,143,113,0); }
        }

        @media (min-width: 1024px) {
          .dos-mobile-only { display: none !important; }
          .dos-desktop-only { display: block !important; }

          .dos-dt-section {
            background: #EEF3EF;
            padding: 72px 64px;
          }
          .dos-dt-inner { max-width: 1400px; margin: 0 auto; }
          .dos-dt-workspace {
            display: grid;
            grid-template-columns: 70fr 30fr;
            gap: 32px;
            align-items: start;
          }
          .dos-dt-left { display: flex; flex-direction: column; gap: 0; min-width: 0; overflow: hidden; }
          .dos-dt-right { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 20px; }
        }
        @media (min-width: 1400px) {
          .dos-dt-section { padding: 88px 80px; }
          .dos-dt-workspace { gap: 40px; }
        }
      `}</style>

      {/* ── Action logging modal ── */}
      {sheet.type !== 'closed' && (
        <ActionLoggingModal
          sheet={sheet}
          setSheet={setSheet}
          hplus={hplus}
          setHplus={setHplus}
          categoryProgress={categories}
          setCategoryProgress={setCategoryProgress}
          onLogged={() => {}}
        />
      )}

      {/* ═══════ MOBILE ═══════ */}
      <div className="dos-mobile-only" style={{ padding: '0 24px 32px', background: '#EEF3EF', marginTop: '0' }}>
        {/* Section eyebrow */}
        <div style={{ paddingTop: '28px', marginBottom: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '5px' }}>Your Daily Operations</p>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '6px' }}>Complete Today&apos;s Journey</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.55 }}>Every action today moves you closer to your health goals.</p>
        </div>

        {/* Mission Status Card — mobile first */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(145deg, #0d1a10 0%, #162318 100%)',
            borderRadius: '24px',
            padding: '24px 22px',
            marginBottom: '16px',
            boxShadow: '0 8px 40px rgba(13,26,16,0.28)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '180px', height: '150px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '3px' }}>Mission Status</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Today&apos;s Progress</p>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{ fontSize: '11px', color: '#D4A843', fontWeight: 700, marginBottom: '2px' }}>+{hplus.todayPoints} H+ earned</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>today</p>
            </div>
          </div>

          {/* Progress ring + counter row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {/* SVG ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <motion.circle
                  cx="44" cy="44" r="36"
                  fill="none"
                  stroke="url(#dos-m-ring-grad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="226"
                  initial={{ strokeDashoffset: 226 }}
                  animate={{ strokeDashoffset: 226 - (226 * todayPct / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="dos-m-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6B8F71" />
                    <stop offset="100%" stopColor="#D4A843" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{completedCount}</p>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.40)', fontWeight: 600, letterSpacing: '0.04em' }}>/ {totalCount}</p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', marginBottom: '3px' }}>Daily Actions</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.4 }}>
                {completedCount === 0 ? 'Ready to start' : completedCount < totalCount ? `${totalCount - completedCount} actions remaining` : 'All actions complete!'}
              </p>
              {/* Progress bar */}
              <div style={{ marginTop: '10px', height: '3px', background: 'rgba(255,255,255,0.10)', borderRadius: '2px', overflow: 'hidden', width: '140px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todayPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage), #D4A843)', borderRadius: '2px' }}
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CHECKLIST.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, background: item.done ? 'var(--color-sage)' : 'rgba(255,255,255,0.08)', border: item.done ? 'none' : '1.5px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: '12px', fontWeight: item.done ? 500 : 600, color: item.done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.80)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak card — mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: '#fff',
            border: '1.5px solid var(--color-border)',
            borderRadius: '20px',
            padding: '18px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(212,168,67,0.10)', border: '1.5px solid rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>🔥</div>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>{hplus.streak} Day Streak</p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.4, marginTop: '3px' }}>You&apos;ve completed a healthy action every day for {hplus.streak} days.</p>
          </div>
        </motion.div>

        {/* Earn Today Carousel — mobile */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1a10 0%, #162318 100%)',
          borderRadius: '24px',
          padding: '24px 22px',
          boxShadow: '0 8px 40px rgba(13,26,16,0.28)',
        }}>
          <EarnTodayCarousel
            categoryProgress={categories}
            hplus={hplus}
            onOpen={setSheet}
            loggedToday={loggedToday}
          />
        </div>
      </div>

      {/* ═══════ DESKTOP ═══════ */}
      <div className="dos-desktop-only">
        <div className="dos-dt-section">
          <div className="dos-dt-inner">

            {/* Section header */}
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '8px' }}>Your Daily Operations</p>
              <h2 style={{ fontSize: '44px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '12px' }}>Complete Today&apos;s Journey</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '600px' }}>
                Every action you complete today moves you closer to your health goals.<br />
                Small daily wins create lasting transformation.
              </p>
            </div>

            <div className="dos-dt-workspace">

              {/* LEFT 70% — Carousel */}
              <div className="dos-dt-left">
                <div style={{
                  background: 'linear-gradient(145deg, #0d1a10 0%, #162318 100%)',
                  borderRadius: '28px',
                  padding: '36px 40px',
                  boxShadow: '0 16px 64px rgba(13,26,16,0.30)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Ambient glow top-right */}
                  <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '320px', height: '240px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  {/* Ambient glow bottom-left */}
                  <div style={{ position: 'absolute', bottom: '-40px', left: '20px', width: '200px', height: '160px', background: 'radial-gradient(ellipse, rgba(212,168,67,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />

                  <div style={{ position: 'relative' }}>
                    <EarnTodayCarousel
                      categoryProgress={categories}
                      hplus={hplus}
                      onOpen={setSheet}
                      loggedToday={loggedToday}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT 30% — Mission Status */}
              <div className="dos-dt-right">

                {/* Mission Status Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55 }}
                  style={{
                    background: 'linear-gradient(145deg, #0d1a10 0%, #162318 100%)',
                    borderRadius: '24px',
                    padding: '28px 26px',
                    boxShadow: '0 12px 48px rgba(13,26,16,0.28)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Ambient glow */}
                  <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '200px', height: '150px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.20) 0%, transparent 70%)', pointerEvents: 'none' }} />

                  {/* Header */}
                  <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.55)', textTransform: 'uppercase' as const, letterSpacing: '0.13em', marginBottom: '4px' }}>Mission Status</p>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Today&apos;s Progress</p>
                  </div>

                  {/* Progress ring — centred */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                        <motion.circle
                          cx="60" cy="60" r="50"
                          fill="none"
                          stroke="url(#dos-dt-ring-grad)"
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray="314"
                          initial={{ strokeDashoffset: 314 }}
                          animate={{ strokeDashoffset: 314 - (314 * todayPct / 100) }}
                          transition={{ duration: 1.4, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="dos-dt-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6B8F71" />
                            <stop offset="100%" stopColor="#D4A843" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <p style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                          {completedCount}<span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>/{totalCount}</span>
                        </p>
                        <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', textAlign: 'center' as const }}>Daily Actions<br />Completed</p>
                      </div>
                    </div>

                    {/* H+ today */}
                    <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,168,67,0.14)', border: '1px solid rgba(212,168,67,0.28)', borderRadius: '20px', padding: '6px 14px' }}>
                      <Zap size={12} color="#D4A843" fill="#D4A843" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#D4A843' }}>+{hplus.todayPoints} H+ earned today</span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {CHECKLIST.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: item.done ? 'var(--color-sage)' : 'rgba(255,255,255,0.07)', border: item.done ? 'none' : '1.5px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: item.done ? 'dos-pulse-ring 2.5s ease-in-out infinite' : 'none' }}>
                          {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: item.done ? 400 : 600, color: item.done ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.82)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Daily Streak card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  style={{
                    background: '#fff',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '20px',
                    padding: '22px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '17px', background: 'rgba(212,168,67,0.10)', border: '1.5px solid rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '24px' }}>🔥</div>
                    <div>
                      <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{hplus.streak} Day Streak</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                        You have completed at least one healthy action every day for the last {hplus.streak} days.
                      </p>
                    </div>
                  </div>

                  {/* Streak bar */}
                  <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((hplus.streak / 30) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-sage), #D4A843)', borderRadius: '3px' }}
                    />
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '6px', fontWeight: 600 }}>{hplus.streak} / 30 days this month</p>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Overview Content ----
function OverviewContent({ overviewState = 'active', setOverviewState }: { overviewState?: OverviewState; setOverviewState?: (s: OverviewState) => void }) {
  const isPreStarted = overviewState === 'pre_started';
  const [dtJourneyPhase, setDtJourneyPhase] = useState(isPreStarted ? 1 : 2);
  const [dtStoryPhotos, setDtStoryPhotos] = useState<string[]>([]);
  const [dtStoryActiveSlot, setDtStoryActiveSlot] = useState(2);
  const dtStoryRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState('Fitness');
  const [showSetup, setShowSetup] = useState(true);
  const [habitsChecked, setHabitsChecked] = useState([false, false, false, false, false]);
  const [toolsPage, setToolsPage] = useState(0);
  const directionRef = useRef(1);
  const TOOLS_PER_PAGE = 4;
  const TOTAL_TOOLS = 7;
  const totalToolsPages = Math.ceil(TOTAL_TOOLS / TOOLS_PER_PAGE);

  // ── Action logging engine — reads from shared store ──────────────────────
  const storeSnap = useHPlusStore();
  const hplus = storeSnap.hplus;
  const categoryProgress = storeSnap.categories;
  const loggedToday = storeSnap.loggedToday;

  // setHplus / setCategoryProgress are no longer used directly —
  // ActionLoggingModal writes through logActivity() instead.
  // These shims satisfy the modal prop types without local state.
  const setHplus: React.Dispatch<React.SetStateAction<HPlusEngineState>> = () => {};
  const setCategoryProgress: React.Dispatch<React.SetStateAction<CategoryProgress[]>> = () => {};

  const [sheet, setSheet] = useState<LoggingSheet>({ type: 'closed' });

  const onLogged = (cat: ActivityCategory, pts: number) => {
    logActivity(cat, pts, cat);
  };

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

      {/* ── Pre-Started / Active demo toggle ── */}
      {setOverviewState && (
        <div style={{
          position: 'fixed', top: '66px', right: '16px', zIndex: 200,
          display: 'flex', background: 'rgba(28,43,30,0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(107,143,113,0.28)', borderRadius: '22px', padding: '3px', gap: '2px',
        }}>
          {(['pre_started', 'active'] as OverviewState[]).map(s => (
            <button
              key={s}
              onClick={() => setOverviewState(s)}
              style={{
                padding: '5px 13px', borderRadius: '18px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em',
                background: overviewState === s ? 'linear-gradient(135deg, #6B8F71, #4A6E50)' : 'transparent',
                color: overviewState === s ? '#fff' : 'rgba(168,197,172,0.6)',
                transition: 'all 0.18s ease',
              }}
            >
              {s === 'pre_started' ? 'PRE-STARTED' : 'ACTIVE'}
            </button>
          ))}
        </div>
      )}

      {/* ── Action Logging Modal ── */}
      {sheet.type !== 'closed' && (
        <ActionLoggingModal
          sheet={sheet}
          setSheet={setSheet}
          hplus={hplus}
          setHplus={setHplus}
          categoryProgress={categoryProgress}
          setCategoryProgress={setCategoryProgress}
          onLogged={onLogged}
        />
      )}

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
            grid-template-rows: auto auto;
            gap: 28px 32px;
            align-items: start;
          }
          .ov-dt-journey-left {
            display: flex;
            flex-direction: column;
            gap: 24px;
            grid-column: 1;
            grid-row: 1 / 3;
          }
          .ov-dt-journey-right-top {
            grid-column: 2;
            grid-row: 1;
          }
          .ov-dt-journey-right-bottom {
            grid-column: 2;
            grid-row: 2;
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

        /* ── Your-Tools carousel (yt-*) ── desktop only */
        @media (min-width: 1024px) {
          .yt-carousel-outer {
            position: relative;
            overflow: hidden;
          }
          .yt-carousel-track {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .yt-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid var(--color-border);
            box-shadow: 0 2px 12px rgba(0,0,0,0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-muted);
            transition: color 0.15s, box-shadow 0.15s;
            z-index: 2;
          }
          .yt-arrow:hover { color: var(--color-sage); box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
          .yt-arrow-prev { left: -20px; }
          .yt-arrow-next { right: -20px; }
          .yt-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 18px;
          }
          .yt-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--color-border);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: background 0.2s;
          }
          .yt-dot-active { background: var(--color-sage); }
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
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPreStarted ? '#A8C5AC' : '#F0C96A', animation: 'pulseRing 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>
                {isPreStarted ? 'Personalised for you · 6-Month Programme' : 'Day 14 of 30 · Build Healthy Habits'}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
              {isPreStarted ? 'Your health transformation starts today.' : `${greeting}, Priya`}
            </h1>
            <p className="ov-hero-subtitle" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0, maxWidth: '320px' }}>
              {isPreStarted
                ? "Over the next 6 months you’ll work alongside your coach to improve your habits, biomarkers, energy and long-term health."
                : daySubtitle}
            </p>
            {/* Health Goals row */}
            <div style={{ marginTop: '10px', marginBottom: '2px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Your Health Goals</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', padding: '5px 12px 5px 6px' }}
                >
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(200,96,74,0.22)', border: '1px solid rgba(200,96,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>🔥</motion.div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Reverse Diabetes</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', padding: '5px 12px 5px 6px' }}
                >
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(107,143,113,0.22)', border: '1px solid rgba(107,143,113,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>⚖️</motion.div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Lose Weight</span>
                </motion.div>
              </div>
            </div>
            {/* Progress indicator or programme stats */}
            {isPreStarted ? (
              <div style={{ marginTop: '10px', display: 'flex', gap: '12px' }}>
                {[{ v: '6 Months', l: 'Programme' }, { v: '180 Days', l: 'Journey' }, { v: 'Dr. Ananya', l: 'Your Coach' }].map(s => (
                  <div key={s.l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#A8C5AC', letterSpacing: '-0.01em', lineHeight: 1 }}>{s.v}</p>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontWeight: 500 }}>{s.l}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', maxWidth: '200px' }}>
                  <div style={{ height: '100%', width: '47%', background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', letterSpacing: '0.02em' }}>47% of Month 2 complete</p>
              </div>
            )}
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

      {/* ── Mobile: pre-started CTA strip below hero ── */}
      {isPreStarted && (
        <div style={{ padding: '16px 20px 0', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/today?tab=month1" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '13px 18px', background: 'linear-gradient(135deg, var(--color-sage), var(--color-sage-dark))',
              color: '#fff', borderRadius: '14px', fontWeight: 800, fontSize: '14px',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(107,143,113,0.35)', letterSpacing: '-0.01em',
            }}>
              Start Month 1 <ArrowRight size={15} strokeWidth={2.5} />
            </a>
            <button
              onClick={() => { const el = document.getElementById('ov-ps-journey'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{
                padding: '13px 18px', background: 'transparent', border: '1.5px solid var(--color-border)',
                borderRadius: '14px', color: 'var(--color-ink)', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Explore Journey
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop body wrapper ── */}
      <div className="ov-body" style={{ padding: '0' }}>

      {/* S2: Journey Roadmap — full width, premium breathing room */}
      <div id="ov-ps-journey" className="ov-s2-journey" style={{ padding: '20px 28px 0', background: 'var(--color-surface)' }}>
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

      {/* Section B: Today's Focus / What Day 1 Looks Like */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)',
          borderRadius: '20px', padding: '22px 24px',
          boxShadow: '0 4px 24px rgba(28,43,30,0.18)',
        }}>
          {isPreStarted ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <Target size={14} color="#A8C5AC" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#A8C5AC', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>What Day 1 Looks Like</span>
              </div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: '16px', letterSpacing: '-0.02em' }}>Your first day is about understanding your health — not perfecting it.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Complete your baseline health assessment',
                  'Review your biomarker report with Dr. Ananya',
                  'Define your top 3 health priorities',
                  'Log your first meal and sleep',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(168,197,172,0.20)', border: '1.5px solid rgba(168,197,172,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#A8C5AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '14px', fontStyle: 'italic' }}>Your coach will guide you through each step.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <Target size={14} color="#F0C96A" />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0C96A', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Your focus for today</span>
                </div>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>Hit 7,000 steps before dinner</p>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: '74%', background: 'linear-gradient(90deg, #D4A843 0%, #F0C96A 100%)', borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>74% · 1,760 steps to go</p>
              </div>
              <div style={{ textAlign: 'center' as const, flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 16px' }}>
                <p style={{ fontSize: '26px', fontWeight: 800, color: '#F0C96A', letterSpacing: '-0.03em', lineHeight: 1 }}>5,240</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontWeight: 500 }}>/ 7,000 steps</p>
              </div>
            </div>
          )}
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
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '18px' }}>{isPreStarted ? 'A welcome from your coach' : 'Message from your coach'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(168,197,172,0.35)' }}>
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80" alt="Dr. Ananya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#4ADE80', border: '2px solid #1C2B1E' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Dr. Ananya Rao</p>
                  <p style={{ fontSize: '12px', color: 'rgba(168,197,172,0.7)' }}>{isPreStarted ? 'Your Health Coach · Ready to begin' : 'Your Health Coach · Available now'}</p>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, marginBottom: '22px' }}>
                {isPreStarted
                  ? <>Hi Priya. I&apos;m genuinely excited to guide you through this journey. We&apos;ll take it one step at a time and build habits that last a lifetime. Ready when you are 💚</>
                  : <>Priya, I noticed you haven&apos;t logged lunch the past 3 days. Try setting a midday reminder — even a quick log takes 30 seconds and keeps your streak alive 💚</>}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href={isPreStarted ? '/today?tab=month1' : '/coach/message'} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '11px 22px',
                  background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)',
                  color: '#fff', border: 'none', borderRadius: '22px',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(107,143,113,0.40)',
                }}>
                  {isPreStarted ? <>Start Month 1 <ArrowRight size={14} /></> : <>Reply to Dr. Ananya <ArrowRight size={14} /></>}
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
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>{isPreStarted ? 'What we track together' : 'Your performance today'}</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
              {isPreStarted ? 'Health Pillars' : 'Health Overview'}
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
          {/* Daily Plan nav card */}
          <a
            href="/daily-plan"
            style={{
              minWidth: '200px',
              flex: '0 0 200px',
              background: 'linear-gradient(155deg, #0d2018 0%, #163826 100%)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(13,32,24,0.22)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              border: '1px solid rgba(107,143,113,0.2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(107,143,113,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UtensilsCrossed size={18} color="#A8C5AC" />
              </div>
              <ChevronRight size={16} color="rgba(168,197,172,0.5)" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>
                Today&apos;s Meal & Exercise Plan
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                Your full personalised daily journey — meals, movement, and recovery.
              </p>
            </div>
          </a>
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
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>{isPreStarted ? 'What we help you discover' : 'Discovered from your data'}</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{isPreStarted ? 'Your Health Patterns' : 'Your personal patterns'}</h2>
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

      {/* Section E: Complete Today's Journey */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>{isPreStarted ? 'Preview' : 'Month 2 · Build Healthy Habits'}</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {isPreStarted ? 'Your Daily Coaching Experience' : 'Complete Today\'s Journey'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              {isPreStarted
                ? <>Every day you&apos;ll log actions across these 8 pillars to earn H+ points and build momentum.</>
                : <>👥 <strong style={{ color: 'var(--color-sage)' }}>847 members</strong> logged actions today</>}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '20px', padding: '6px 12px', flexShrink: 0 }}>
            <Zap size={12} color="#D4A843" fill="#D4A843" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#D4A843' }}>{hplus.score} H+</span>
          </div>
        </div>

        {/* Desktop inner split: habits LEFT, actions RIGHT */}
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

          {/* ── Earn Today's H+ carousel ── */}
          <div>
            <EarnTodayCarousel
              categoryProgress={categoryProgress}
              hplus={hplus}
              onOpen={s => setSheet(s)}
              loggedToday={loggedToday}
            />
          </div>

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
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>{isPreStarted ? 'They started exactly where you are' : 'People like you'}</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{isPreStarted ? 'People Who Made It' : 'Member Success Stories'}</h2>
          </div>
        </div>
        {isPreStarted && (
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '16px' }}>People who started exactly where you are today — and completed their transformation.</p>
        )}
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
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>{isPreStarted ? 'They started exactly where you are' : 'People like you'}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: isPreStarted ? '10px' : '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>{isPreStarted ? 'People Who Made It' : 'Member Success Stories'}</h2>
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

      {/* S9: Journey Celebration Footer / Pre-Started conversion CTA */}
      <div className="ov-footer-outer" style={{ padding: '32px 24px 40px' }}>
        {isPreStarted ? (
          /* ── PRE-STARTED: final conversion card ── */
          <div style={{
            background: 'linear-gradient(135deg, #071310 0%, #0d1c10 50%, #071310 100%)',
            borderRadius: '24px', padding: '36px 28px',
            color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(7,19,16,0.40)',
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>You&apos;re Ready to Begin</p>
              <h3 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '14px' }}>
                You&apos;re ready to begin.
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, marginBottom: '28px', maxWidth: '420px' }}>
                Your first chapter starts with understanding your health, building awareness and creating the foundation for lasting change.
              </p>
              <a
                href="/today?tab=month1"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  padding: '16px 28px',
                  background: 'linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%)',
                  color: '#fff', border: 'none', borderRadius: '16px',
                  fontSize: '16px', fontWeight: 800, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 6px 28px rgba(107,143,113,0.50)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 10px 36px rgba(107,143,113,0.60)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 6px 28px rgba(107,143,113,0.50)'; }}
              >
                Start Month 1 — Know Your Health
                <ArrowRight size={17} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        ) : (
          /* ── ACTIVE: existing celebration footer ── */
          <div style={{
            background: 'linear-gradient(135deg, #1C2B1E 0%, #2D4A30 100%)',
            borderRadius: '24px', padding: '28px 24px', color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,201,106,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="ov-footer-inner-grid" style={{ position: 'relative' }}>
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
              <div className="ov-footer-cta-col" style={{ display: 'none', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Keep going</p>
                  <p style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}>You&apos;re making<br />real progress.</p>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '24px' }}>138 days to go. Every habit you build today is a brick in the foundation of your healthiest self.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { href: '/daily-plan', label: "Today's Meal & Exercise Plan", bg: 'linear-gradient(135deg, rgba(107,143,113,0.22), rgba(74,110,80,0.18))', border: 'rgba(107,143,113,0.35)', color: '#fff', hoverBg: 'linear-gradient(135deg, rgba(107,143,113,0.32), rgba(74,110,80,0.26))' },
                    { href: '/journey', label: 'View Your Complete Journey', bg: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.18)', color: '#fff', hoverBg: 'rgba(255,255,255,0.16)' },
                    { href: '/progress', label: 'View Your Progress', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)', hoverBg: 'rgba(255,255,255,0.10)' },
                  ].map(link => (
                    <a key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: link.bg, border: `1px solid ${link.border}`, borderRadius: '16px', textDecoration: 'none', color: link.color, transition: 'background 0.15s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = link.hoverBg; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = link.bg; }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{link.label}</span>
                      <ArrowRight size={16} color="rgba(168,197,172,0.80)" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isPreStarted ? 'rgba(168,197,172,0.20)' : 'rgba(240,201,106,0.22)', borderRadius: '16px', padding: '3px 8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPreStarted ? '#A8C5AC' : '#F0C96A', animation: 'pulseRing 2s infinite' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isPreStarted ? '#A8C5AC' : '#F0C96A', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{isPreStarted ? 'Enrolled' : 'Chapter 2'}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.01em' }}>{isPreStarted ? 'Ready to begin your transformation' : 'Build Healthy Habits'}</span>
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

                {/* Dominant headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.30 }}
                  style={{ fontSize: '60px', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1.0, margin: 0, textShadow: '0 4px 32px rgba(0,0,0,0.30)' }}
                >
                  {isPreStarted ? (
                    <>Your health<br /><span style={{ background: 'linear-gradient(90deg, #A8C5AC 0%, #fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>transformation</span><br />starts today.</>
                  ) : (
                    <>{greeting},<br /><span style={{ background: 'linear-gradient(90deg, #fff 60%, rgba(168,197,172,0.85) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Priya</span></>
                  )}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.42 }}
                  style={{ fontSize: '17px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.65, maxWidth: '420px', margin: 0, fontWeight: 400 }}
                >
                  {isPreStarted
                    ? "Over the next 6 months you’ll work alongside your coach to improve your habits, biomarkers, energy and long-term health."
                    : daySubtitle}
                </motion.p>

                {/* Progress bar or programme stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.54 }}
                  style={{ maxWidth: '360px' }}
                >
                  {isPreStarted ? (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      {[{ v: '6 Months', l: 'Programme' }, { v: '180 Days', l: 'Journey' }, { v: 'Dr. Ananya', l: 'Your Coach' }].map(s => (
                        <div key={s.l} style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '10px 14px' }}>
                          <p style={{ fontSize: '15px', fontWeight: 800, color: '#A8C5AC', letterSpacing: '-0.01em', lineHeight: 1 }}>{s.v}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: 500 }}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </motion.div>

                {/* Desktop hero CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.6, ease: 'easeOut' }}
                  style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}
                >
                  {isPreStarted ? (
                    <>
                      <a
                        href="/today?tab=month1"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '9px',
                          background: 'linear-gradient(135deg, #6B8F71, #4A6E50)', color: '#fff',
                          borderRadius: '12px', padding: '13px 24px',
                          fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                          letterSpacing: '-0.01em',
                          boxShadow: '0 4px 20px rgba(107,143,113,0.45)',
                          transition: 'transform 0.18s, box-shadow 0.18s',
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 28px rgba(107,143,113,0.60)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 20px rgba(107,143,113,0.45)'; }}
                      >
                        Start Month 1 <ArrowRight size={15} strokeWidth={2.5} />
                      </a>
                      <button
                        onClick={() => { const el = document.getElementById('ov-ps-journey'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
                          color: 'rgba(255,255,255,0.85)', borderRadius: '12px', padding: '13px 22px',
                          fontSize: '14px', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
                        }}
                      >
                        Explore My Journey
                      </button>
                    </>
                  ) : (
                    <a
                      href="/today?tab=month2"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '9px',
                        background: '#fff', color: '#1C2B1E',
                        borderRadius: '12px', padding: '13px 24px',
                        fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                        letterSpacing: '-0.01em',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.20)',
                        transition: 'transform 0.18s, box-shadow 0.18s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.28)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.20)'; }}
                    >
                      Continue Journey
                      <ChevronRight size={15} strokeWidth={2.5} />
                    </a>
                  )}
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
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>{isPreStarted ? 'Your Transformation Blueprint' : 'Your Transformation Roadmap'}</p>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>{isPreStarted ? 'Your 6-Month Journey' : 'Your Journey Experience'}</h2>
                </div>

                <div className="ov-dt-journey-workspace">

                  {/* LEFT col (rows 1+2): Chapter card → Your Patterns */}
                  <div className="ov-dt-journey-left">
                    <JourneyIndicatorDesktop selectedPhase={dtJourneyPhase} onPhaseChange={setDtJourneyPhase} />

                    {/* Your Patterns — sits directly below chapter card in left column */}
                    <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '22px', padding: '22px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '2px' }}>{isPreStarted ? 'What we help you discover' : 'From your data'}</p>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '18px' }}>{isPreStarted ? 'Your Health Patterns' : 'Your Patterns'}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { icon: '😴', accent: 'var(--color-sage)', bg: 'rgba(107,143,113,0.07)', border: 'rgba(107,143,113,0.14)', category: 'Sleep', headline: 'Movement improves your sleep', insight: 'You sleep 45 min longer on days you walk 7,000+ steps.', stat: '+45 min' },
                          { icon: '🔥', accent: '#7B68EE', bg: 'rgba(123,104,238,0.07)', border: 'rgba(123,104,238,0.14)', category: 'Streaks', headline: 'Morning logging protects streaks', insight: 'Your streak has never broken on days you logged before 9am.', stat: '0 breaks' },
                          { icon: '🥗', accent: '#B07828', bg: 'rgba(176,120,40,0.07)', border: 'rgba(176,120,40,0.14)', category: 'Nutrition', headline: 'Protein-first breakfasts improve consistency', insight: 'You log all 3 meals 4× more often on days with a high-protein breakfast.', stat: '+4 days' },
                          { icon: '🚶', accent: '#C8604A', bg: 'rgba(200,96,74,0.07)', border: 'rgba(200,96,74,0.14)', category: 'Movement', headline: 'Afternoon walks are your highest-step sessions', insight: 'Walks between 3–5pm average 1,850 more steps than your morning walks.', stat: '+1,850 steps' },
                        ].map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: p.bg, border: `1px solid ${p.border}`, borderRadius: '16px', padding: '16px 16px' }}>
                            <div style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{p.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: p.accent, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>{p.category}</p>
                                <p style={{ fontSize: '14px', fontWeight: 900, color: p.accent, letterSpacing: '-0.02em' }}>{p.stat}</p>
                              </div>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '4px', lineHeight: 1.3 }}>{p.headline}</p>
                              <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55 }}>{p.insight}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT top: Your Habits */}
                  <div className="ov-dt-journey-right-top">
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
                      <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{habitsChecked.filter(Boolean).length} of {habits.length} done</span>
                        <div style={{ width: '80px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(habitsChecked.filter(Boolean).length / habits.length) * 100}%`, background: 'var(--color-sage)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT bottom: Health Snapshot */}
                  <div className="ov-dt-journey-right-bottom">
                    <div style={{ background: 'linear-gradient(155deg, #071710 0%, #0d1f14 60%, #163326 100%)', border: '1px solid rgba(107,143,113,0.18)', borderRadius: '22px', padding: '24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.14)' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '2px' }}>Right Now</p>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '22px' }}>Health Snapshot</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Steps Today', value: '5,240', sub: 'of 7,000 goal', pct: 74, color: '#8B7EF8', dimColor: 'rgba(139,126,248,0.15)', icon: '🚶' },
                          { label: 'Weight', value: '68.8 kg', sub: '−1.2 kg this month', pct: 60, color: '#E87A6A', dimColor: 'rgba(232,122,106,0.15)', icon: '⚖️' },
                          { label: 'HbA1c', value: '5.8%', sub: 'Target < 5.7%', pct: 85, color: '#6B8F71', dimColor: 'rgba(107,143,113,0.15)', icon: '🩸' },
                          { label: 'Blood Pressure', value: '118/76', sub: 'Normal range ✓', pct: 100, color: '#D4A843', dimColor: 'rgba(212,168,67,0.15)', icon: '❤️' },
                        ].map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: m.dimColor, borderRadius: '14px', padding: '13px 16px' }}>
                            <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{m.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <p style={{ fontSize: '22px', fontWeight: 900, color: m.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', fontWeight: 500 }}>{m.label}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                                    style={{ height: '100%', background: m.color, borderRadius: '2px' }} />
                                </div>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', flexShrink: 0 }}>{m.sub}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>{/* end journey workspace grid */}

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

              {/* 4. Today's Focus + Complete Today's Journey */}
              <section className="ov-dt-section ov-dt-section-dark">
                <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.70)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your Daily Operations</p>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Complete Today&apos;s Journey</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.28)', borderRadius: '20px', padding: '7px 14px' }}>
                    <Zap size={14} color="#D4A843" fill="#D4A843" />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#D4A843' }}>{hplus.score} H+</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>· {hplus.streak}-day streak 🔥</span>
                  </div>
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
                  <div style={{
                    marginBottom: '20px', borderRadius: '18px', padding: '18px 24px',
                    display: 'flex', alignItems: 'center', gap: '20px',
                    background: 'linear-gradient(135deg, rgba(212,168,67,0.14) 0%, rgba(176,120,40,0.10) 60%, rgba(212,168,67,0.07) 100%)',
                    border: '1px solid rgba(212,168,67,0.32)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Subtle radial highlight behind text */}
                    <div style={{ position: 'absolute', left: '-20px', top: '-20px', width: '200px', height: '120px', background: 'radial-gradient(ellipse, rgba(212,168,67,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0, position: 'relative' }}>🧪</span>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAF8', letterSpacing: '-0.01em', marginBottom: '3px' }}>
                        One last thing to unlock your full journey
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(196,218,200,0.80)', lineHeight: 1.55 }}>
                        Upload your baseline labs so Dr. Ananya can personalise your insights and recommendations.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center', position: 'relative' }}>
                      <button style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #D4A843 0%, #B07828 100%)',
                        color: '#fff', border: 'none', borderRadius: '22px',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 3px 12px rgba(212,168,67,0.36), 0 1px 0 rgba(255,255,255,0.12) inset',
                        letterSpacing: '-0.01em',
                        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                      }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 5px 18px rgba(212,168,67,0.48), 0 1px 0 rgba(255,255,255,0.12) inset'; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = ''; b.style.boxShadow = '0 3px 12px rgba(212,168,67,0.36), 0 1px 0 rgba(255,255,255,0.12) inset'; }}
                      >
                        <Plus size={13} strokeWidth={2.5} /> Upload Labs
                      </button>
                      <button onClick={() => setShowSetup(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}>
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Earn Today's H+ carousel ── */}
                <EarnTodayCarousel
                  categoryProgress={categoryProgress}
                  hplus={hplus}
                  onOpen={s => setSheet(s)}
                  loggedToday={loggedToday}
                />
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
                        borderRadius: '24px', overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                        background: '#111',
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        minHeight: '260px',
                        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
                      }}
                      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 16px 56px rgba(0,0,0,0.22)'; d.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = '0 8px 40px rgba(0,0,0,0.14)'; d.style.transform = 'translateY(0)'; }}
                      >
                        {/* Left: photo */}
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img src={featured.img} alt={featured.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform 0.6s ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.60) 100%)' }} />
                          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(22,163,74,0.90)', borderRadius: '20px', padding: '4px 12px' }}>{featured.badge}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.80)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 12px' }}>Featured Story</span>
                          </div>
                        </div>
                        {/* Right: story content */}
                        <div style={{ background: 'linear-gradient(150deg, #1a1a1a 0%, #111 100%)', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.10em', marginBottom: '6px' }}>{featured.location}</p>
                            <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.18 }}>{featured.headline}</p>
                          </div>
                          <div style={{ borderLeft: '3px solid var(--color-sage)', paddingLeft: '14px' }}>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.58, fontStyle: 'italic' }}>
                              &ldquo;{featured.quote}&rdquo;
                            </p>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', marginTop: '8px' }}>— {featured.name}</p>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {featured.stats.map((s, i) => (
                              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' as const }}>
                                <p style={{ fontSize: '17px', fontWeight: 900, color: 'var(--color-sage)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{s.label}</p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.3 }}>{s.sub}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.20)', border: '1px solid rgba(107,143,113,0.30)', borderRadius: '12px', padding: '9px 18px' }}>
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
                            href="/daily-plan"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '18px 22px',
                              background: 'linear-gradient(135deg, rgba(107,143,113,0.32) 0%, rgba(74,110,80,0.26) 100%)',
                              border: '1px solid rgba(107,143,113,0.42)',
                              borderRadius: '18px', textDecoration: 'none', color: '#fff',
                              transition: 'background 0.18s ease, box-shadow 0.18s ease',
                              boxShadow: '0 4px 20px rgba(13,32,24,0.22)',
                            }}
                            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'linear-gradient(135deg, rgba(107,143,113,0.46) 0%, rgba(74,110,80,0.38) 100%)'; }}
                            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'linear-gradient(135deg, rgba(107,143,113,0.32) 0%, rgba(74,110,80,0.26) 100%)'; }}
                          >
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>Today&apos;s Meal &amp; Exercise Plan</p>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.48)' }}>Meals · Movement · Recovery</p>
                            </div>
                            <ArrowRight size={18} color="rgba(168,197,172,0.85)" />
                          </a>
                          <a
                            href="/journey"
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
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '1px' }}>View My Complete Journey</p>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>Photos · Milestones · Achievements</p>
                            </div>
                            <ArrowRight size={16} color="rgba(255,255,255,0.38)" />
                          </a>
                          <a
                            href="/progress"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '15px 22px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '18px', textDecoration: 'none', color: 'rgba(255,255,255,0.55)',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>View Biomarker Progress</span>
                            <ArrowRight size={16} color="rgba(255,255,255,0.30)" />
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
type OverviewState = 'pre_started' | 'active';

function TodayPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'overview';
  const initialOverviewState = (searchParams.get('state') === 'pre_started' ? 'pre_started' : 'active') as OverviewState;
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [overviewState, setOverviewState] = useState<OverviewState>(initialOverviewState);
  useEffect(() => {
    const t = searchParams.get('tab') as TabId;
    if (t) setActiveTab(t);
    const s = searchParams.get('state');
    if (s === 'pre_started') setOverviewState('pre_started');
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewContent overviewState={overviewState} setOverviewState={setOverviewState} />;
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
                borderBottom: isActive ? '2.5px solid var(--color-sage)' : '2.5px solid transparent',
                marginBottom: '-1px',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 400,
                color: isActive ? 'var(--color-sage)' : 'var(--color-muted)',
                letterSpacing: isActive ? '-0.01em' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
              {tab.status === 'completed' && (
                <LockOpen size={11} color="rgba(107,143,113,0.45)" strokeWidth={2} style={{ flexShrink: 0 }} />
              )}
              {tab.status === 'active' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--color-sage)',
                  boxShadow: '0 2px 8px rgba(107,143,113,0.40)',
                  flexShrink: 0,
                }}>
                  <LockOpen size={12} color="#fff" strokeWidth={2.5} />
                </span>
              )}
              {tab.status === 'locked' && (
                <Lock size={9} color="rgba(107,143,113,0.30)" strokeWidth={1.8} />
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
