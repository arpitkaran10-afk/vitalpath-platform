'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';

// ─── Programme state ──────────────────────────────────────────────────────────

type ProgramStatus = 'not_started' | 'active';

// Active-member context (used when status === 'active')
const ACTIVE_MONTH_NUM = 2;
const ACTIVE_MONTH_ROUTE = '/today?tab=month2';
const ACTIVE_DAY = 14;
const ACTIVE_DAYS_TOTAL = 30;
const ACTIVE_PCT = 47;
const ACTIVE_DAYS_REMAINING = ACTIVE_DAYS_TOTAL - ACTIVE_DAY;

// ─── Programme months ─────────────────────────────────────────────────────────

const MONTHS = [
  {
    num: 1,
    theme: 'Discover',
    title: 'Know Your Health',
    description: 'Uncover your baseline. Understand your risks. Build the awareness that makes everything else possible.',
    accent: '#6B8F71',
    accentLight: 'rgba(107,143,113,0.12)',
    gradient: 'linear-gradient(135deg, #1C2B1E 0%, #2E4830 100%)',
    dotColor: '#A0CDA8',
    checkpoints: ['Review your biomarkers', 'Understand your health risks', 'Establish movement baseline', 'Set meaningful health goals'],
  },
  {
    num: 2,
    theme: 'Build',
    title: 'Build Healthy Habits',
    description: 'Turn awareness into action. Layer in daily nutrition, movement, and hydration habits that compound over time.',
    accent: '#D4A843',
    accentLight: 'rgba(212,168,67,0.12)',
    gradient: 'linear-gradient(135deg, #2A2010 0%, #3D3018 100%)',
    dotColor: '#E8C870',
    checkpoints: ['Establish meal timing', 'Daily movement routine', 'Hydration protocol', 'Habit tracking system'],
  },
  {
    num: 3,
    theme: 'Restore',
    title: 'Sleep Better, Feel Better',
    description: 'Sleep is the foundation of recovery and resilience. This month, you reclaim the quality rest your body needs.',
    accent: '#7B9EA3',
    accentLight: 'rgba(123,158,163,0.12)',
    gradient: 'linear-gradient(135deg, #0E1E2A 0%, #1A3040 100%)',
    dotColor: '#9EC8D0',
    checkpoints: ['Sleep quality assessment', 'Evening wind-down routine', 'Sleep environment optimisation', 'Recovery tracking'],
  },
  {
    num: 4,
    theme: 'Balance',
    title: 'Stress Less, Feel Better',
    description: 'Chronic stress quietly undermines every health goal. This month, you build real tools to manage it.',
    accent: '#A87BAE',
    accentLight: 'rgba(168,123,174,0.12)',
    gradient: 'linear-gradient(135deg, #1E0E2A 0%, #2E1840 100%)',
    dotColor: '#C898D0',
    checkpoints: ['Stress trigger identification', 'Breathing & mindfulness', 'Work-life boundaries', 'Nervous system regulation'],
  },
  {
    num: 5,
    theme: 'Sustain',
    title: 'Make Healthy Living Stick',
    description: 'Good habits only work if they last. This month is about reinforcing your systems so they become second nature.',
    accent: '#C8604A',
    accentLight: 'rgba(200,96,74,0.12)',
    gradient: 'linear-gradient(135deg, #2A1010 0%, #3D1E18 100%)',
    dotColor: '#E08070',
    checkpoints: ['Habit sustainability review', 'Overcoming obstacles', 'Social support activation', 'Long-term commitment'],
  },
  {
    num: 6,
    theme: 'Thrive',
    title: 'Your New Normal',
    description: 'You\'ve built the foundation. Now you live it. This is your life after VitalPath — confident, resilient, healthier.',
    accent: '#D4A843',
    accentLight: 'rgba(212,168,67,0.12)',
    gradient: 'linear-gradient(135deg, #1E1800 0%, #2E2808 100%)',
    dotColor: '#F0C84A',
    checkpoints: ['Biomarker review', 'Six-month transformation story', 'Future health roadmap', 'Lifelong habits certified'],
  },
];

// ─── Outcomes ─────────────────────────────────────────────────────────────────

const OUTCOMES = [
  { icon: '⚡', label: 'More Energy', sub: 'Feel vitality throughout the day' },
  { icon: '😴', label: 'Better Sleep', sub: 'Deeper, more restorative rest' },
  { icon: '🥗', label: 'Healthier Eating', sub: 'Habits that actually stick' },
  { icon: '🧘', label: 'Reduced Stress', sub: 'Real tools, lasting calm' },
  { icon: '❤️', label: 'Better Heart Health', sub: 'Improved key biomarkers' },
  { icon: '📈', label: 'Measurable Progress', sub: 'Data that shows your change' },
  { icon: '💪', label: 'Greater Confidence', sub: 'Pride in your transformation' },
  { icon: '🛡️', label: 'Stronger Immunity', sub: 'A body built to recover' },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🩺', label: 'Personal Health Assessment', sub: 'Your unique risk profile, understood.' },
  { icon: '🥗', label: 'Personalised Nutrition Guidance', sub: 'A plan built around your biology.' },
  { icon: '📊', label: 'Biomarker Tracking', sub: 'Watch your numbers move in the right direction.' },
  { icon: '😴', label: 'Sleep Optimisation', sub: 'Science-backed strategies for deeper rest.' },
  { icon: '🧘', label: 'Stress Management', sub: 'Tools that work in real life.' },
  { icon: '🏃', label: 'Activity Coaching', sub: 'Movement matched to your fitness level.' },
  { icon: '👩‍⚕️', label: 'Expert Coach Support', sub: 'Guidance from qualified health professionals.' },
  { icon: '📈', label: 'Progress Reviews', sub: 'Regular check-ins that keep you on track.' },
];

// ─── Why people succeed ───────────────────────────────────────────────────────

const REASONS = [
  { icon: '✓', label: 'Personalised Guidance', sub: 'No generic advice. Everything is tailored to you.' },
  { icon: '✓', label: 'Expert Coaching', sub: 'Qualified professionals in your corner, every step.' },
  { icon: '✓', label: 'Small Sustainable Changes', sub: 'Habits that fit your life, not disrupt it.' },
  { icon: '✓', label: 'Progress You Can Measure', sub: 'Real data tracking real improvement.' },
  { icon: '✓', label: 'Accountability & Support', sub: 'Someone always there when it gets hard.' },
];

// ─── Month 1 checkpoints ──────────────────────────────────────────────────────

const MONTH1_ITEMS = [
  'Review your biomarkers and health baseline',
  'Understand your personal health risks',
  'Build awareness of current habits',
  'Establish movement and hydration routines',
  'Set meaningful, personalised health goals',
  'Begin your transformation journey',
];

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.52, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── NOT_STARTED experience ───────────────────────────────────────────────────

function NotStartedOverview() {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      <style>{`
        /* ── Dual render ── */
        .ns-mobile { display: block; }
        .ns-desktop { display: none; }
        @media (min-width: 1024px) {
          .ns-mobile { display: none !important; }
          .ns-desktop { display: block !important; }
        }

        /* ── Desktop layout ── */
        .ns-dt-inner { max-width: 1200px; margin: 0 auto; padding: 0 64px; }
        .ns-dt-section { padding: 96px 0; }
        .ns-dt-section-sm { padding: 72px 0; }

        /* ── Outcome grid ── */
        .ns-outcome-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 640px) {
          .ns-outcome-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .ns-outcome-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; }
        }

        /* ── Feature grid ── */
        .ns-feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 768px) {
          .ns-feature-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .ns-feature-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }

        /* ── Roadmap connector ── */
        .ns-roadmap-line {
          width: 2px; height: 40px;
          background: linear-gradient(to bottom, rgba(107,143,113,0.35), rgba(107,143,113,0.1));
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .ns-roadmap-line { height: 32px; }
        }

        /* ── CTA button ── */
        .ns-cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--color-sage); color: #fff;
          border: none; border-radius: 14px; padding: 16px 28px;
          font-size: 16px; font-weight: 800; cursor: pointer;
          box-shadow: 0 4px 20px rgba(107,143,113,0.38);
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .ns-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(107,143,113,0.45);
        }
        .ns-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(255,255,255,0.22); border-radius: 14px;
          padding: 15px 24px; font-size: 15px; font-weight: 700;
          cursor: pointer; text-decoration: none;
          transition: all 0.18s ease;
        }
        .ns-cta-secondary:hover {
          border-color: rgba(255,255,255,0.45);
          color: #fff;
        }

        /* ── Reasons grid ── */
        .ns-reasons-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) {
          .ns-reasons-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ns-reasons-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }

        /* ── Story panels ── */
        .ns-story-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 768px) {
          .ns-story-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(155deg, #0A1A0C 0%, #1C2B1E 35%, #2A4030 70%, #1A3022 100%)',
        position: 'relative', overflow: 'hidden',
        padding: '96px 20px 80px',
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '-80px', right: '-40px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.16) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '35%', width: '300px', height: '250px', background: 'radial-gradient(ellipse, rgba(160,205,168,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.30)',
              borderRadius: '24px', padding: '7px 16px', marginBottom: '28px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A0CDA8', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
                6-Month Preventive Health Programme
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(32px, 5vw, 58px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-0.035em', lineHeight: 1.06,
              marginBottom: '22px',
            }}
          >
            A healthier, happier version<br />of you starts here.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'rgba(255,255,255,0.58)', lineHeight: 1.65,
              maxWidth: '600px', margin: '0 auto 40px',
            }}
          >
            Over the next 6 months you&apos;ll uncover hidden health risks, build healthier habits, improve key biomarkers and create lasting change with expert guidance.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '14px', justifyContent: 'center', alignItems: 'center' }}
          >
            <a href="/today?tab=month1" className="ns-cta-primary">
              Start My Transformation
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            <a href="#roadmap" className="ns-cta-secondary">
              Explore The Journey
              <ChevronRight size={16} strokeWidth={2.5} />
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ display: 'flex', gap: '28px', justifyContent: 'center', marginTop: '52px', flexWrap: 'wrap' as const }}
          >
            {[
              { value: '6', label: 'Month Programme' },
              { value: '180+', label: 'Guided Days' },
              { value: '5', label: 'Health Domains' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' as const }}>
                <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.42)', fontWeight: 600, marginTop: '4px', letterSpacing: '0.04em' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — WHAT COULD CHANGE IN 6 MONTHS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center' as const, marginBottom: '52px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>
                Possible Outcomes
              </p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: '520px', margin: '0 auto' }}>
                What could change in 6 months?
              </h2>
            </div>
          </FadeIn>

          <div className="ns-outcome-grid">
            {OUTCOMES.map((o, i) => (
              <FadeIn key={o.label} delay={i * 0.05}>
                <div style={{
                  background: 'linear-gradient(145deg, #F6FAF6 0%, #EEF5EF 100%)',
                  border: '1.5px solid rgba(107,143,113,0.14)',
                  borderRadius: '18px', padding: '24px 20px',
                  textAlign: 'center' as const,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(107,143,113,0.14)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px', lineHeight: 1 }}>{o.icon}</div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em', marginBottom: '5px' }}>{o.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{o.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <p style={{ textAlign: 'center' as const, fontSize: '12px', color: 'var(--color-muted)', marginTop: '28px', fontStyle: 'italic' }}>
              Results vary by individual. These outcomes reflect sustained programme participation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — YOUR TRANSFORMATION ROADMAP
      ══════════════════════════════════════════ */}
      <section id="roadmap" style={{ background: 'var(--color-surface)', padding: '80px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center' as const, marginBottom: '56px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>
                Your Journey
              </p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Your Transformation Roadmap
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.65, maxWidth: '480px', margin: '14px auto 0' }}>
                Six purposeful months, each building on the last. Your journey to lasting health.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0' }}>
            {MONTHS.map((m, i) => {
              const isExpanded = expandedMonth === m.num;
              const isLast = i === MONTHS.length - 1;
              return (
                <FadeIn key={m.num} delay={i * 0.06}>
                  <div>
                    {/* Month card */}
                    <button
                      onClick={() => setExpandedMonth(isExpanded ? null : m.num)}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left' as const, padding: '0',
                      }}
                    >
                      <div style={{
                        background: isExpanded
                          ? m.gradient
                          : 'linear-gradient(135deg, #fff 0%, #F8FAF8 100%)',
                        border: `1.5px solid ${isExpanded ? 'transparent' : 'rgba(107,143,113,0.14)'}`,
                        borderRadius: '20px', padding: '22px 24px',
                        display: 'flex', alignItems: 'center', gap: '18px',
                        transition: 'all 0.28s ease',
                        boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.22)' : '0 1px 4px rgba(0,0,0,0.04)',
                      }}>
                        {/* Month number badge */}
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                          background: isExpanded ? 'rgba(255,255,255,0.12)' : m.accentLight,
                          border: `1.5px solid ${isExpanded ? 'rgba(255,255,255,0.18)' : `rgba(${m.accent.replace('#','').match(/.{2}/g)?.map(h=>parseInt(h,16)).join(',')},0.25)`}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const,
                        }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: isExpanded ? 'rgba(255,255,255,0.55)' : 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, lineHeight: 1 }}>M{m.num}</p>
                          <p style={{ fontSize: '16px', fontWeight: 900, color: isExpanded ? '#fff' : m.accent, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.num}</p>
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '3px', color: isExpanded ? (m.dotColor) : m.accent }}>
                            {m.theme}
                          </p>
                          <p style={{ fontSize: '17px', fontWeight: 800, color: isExpanded ? '#fff' : 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                            {m.title}
                          </p>
                        </div>

                        {/* Chevron */}
                        <div style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease', flexShrink: 0 }}>
                          <ChevronRight size={18} strokeWidth={2.5} color={isExpanded ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)'} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.26, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          background: `${m.gradient.replace('linear-gradient(135deg,', 'linear-gradient(145deg,').replace('100%)', '100%)').replace('0%', '0%').replace('100%)', '100%)')}`,
                          borderRadius: '0 0 20px 20px', padding: '0 24px 22px',
                          marginTop: '-8px', borderTop: 'none',
                          border: 'none',
                        }}>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, marginBottom: '16px', paddingTop: '4px' }}>
                            {m.description}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '9px' }}>
                            {m.checkpoints.map(cp => (
                              <div key={cp} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                                  background: 'rgba(255,255,255,0.12)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <Check size={11} strokeWidth={2.5} color="rgba(255,255,255,0.8)" />
                                </div>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500, lineHeight: 1.4 }}>{cp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Connector line between months */}
                    {!isLast && (
                      <div className="ns-roadmap-line" />
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — WHAT YOU'LL RECEIVE
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center' as const, marginBottom: '52px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>Included in your programme</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                What you&apos;ll receive
              </h2>
            </div>
          </FadeIn>

          <div className="ns-feature-grid">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.label} delay={i * 0.04}>
                <div style={{
                  background: '#fff', border: '1.5px solid var(--color-border)',
                  borderRadius: '18px', padding: '24px 20px',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(107,143,113,0.12)'; el.style.borderColor = 'rgba(107,143,113,0.25)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = 'var(--color-border)'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '14px', lineHeight: 1 }}>{f.icon}</div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '6px', lineHeight: 1.3 }}>{f.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55 }}>{f.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — YOUR TRANSFORMATION STORY
      ══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(160deg, #0D1A10 0%, #1C2B1E 50%, #2A4030 100%)',
        padding: '80px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: 'center' as const, marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>Your transformation story</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '14px' }}>
                One day you&apos;ll look back and<br />see how far you&apos;ve come.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto' }}>
                Every transformation starts exactly where you are right now.
              </p>
            </div>
          </FadeIn>

          <div className="ns-story-grid">
            {[
              {
                label: 'Today',
                subtitle: 'Where your journey begins',
                description: 'You take the first step. You arrive with questions, uncertainty — and potential waiting to be unlocked.',
                icon: '🌱',
                bg: 'rgba(255,255,255,0.06)',
                border: 'rgba(255,255,255,0.10)',
              },
              {
                label: 'Month 3',
                subtitle: 'Momentum building',
                description: 'You feel the difference in your sleep, your energy, your relationship with food. The habits are taking root.',
                icon: '🌿',
                bg: 'rgba(107,143,113,0.12)',
                border: 'rgba(107,143,113,0.22)',
              },
              {
                label: 'Month 6',
                subtitle: 'Your new normal',
                description: 'Better biomarkers. Deeper sleep. A body that feels capable. A life transformed by small, consistent choices.',
                icon: '🌳',
                bg: 'rgba(212,168,67,0.10)',
                border: 'rgba(212,168,67,0.20)',
              },
            ].map((stage, i) => (
              <FadeIn key={stage.label} delay={i * 0.08}>
                <div style={{
                  background: stage.bg, border: `1.5px solid ${stage.border}`,
                  borderRadius: '20px', padding: '28px 22px',
                  display: 'flex', flexDirection: 'column' as const, gap: '12px',
                }}>
                  <div style={{ fontSize: '36px', lineHeight: 1 }}>{stage.icon}</div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>{stage.label}</p>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{stage.subtitle}</p>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65 }}>{stage.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — WHY PEOPLE SUCCEED
      ══════════════════════════════════════════ */}
      <section style={{ background: 'var(--color-surface)', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center' as const, marginBottom: '52px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '10px' }}>Why it works</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Why people succeed
              </h2>
            </div>
          </FadeIn>

          <div className="ns-reasons-grid">
            {REASONS.map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.06}>
                <div style={{
                  background: 'linear-gradient(145deg, #F6FAF6 0%, #EEF5EF 100%)',
                  border: '1.5px solid rgba(107,143,113,0.14)',
                  borderRadius: '18px', padding: '26px 22px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(107,143,113,0.14)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '11px',
                    background: 'var(--color-sage)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px',
                  }}>
                    <Check size={16} strokeWidth={2.8} color="#fff" />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em', marginBottom: '7px' }}>{r.label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6 }}>{r.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — YOUR FIRST MONTH
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{
              background: 'linear-gradient(145deg, #1C2B1E 0%, #2E4830 60%, #3A5C3E 100%)',
              borderRadius: '24px', padding: '44px 36px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.20)', border: '1px solid rgba(107,143,113,0.30)', borderRadius: '24px', padding: '7px 14px', marginBottom: '22px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Month 1 · Discover</span>
              </div>

              <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '10px' }}>
                Know Your Health
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '28px', maxWidth: '480px' }}>
                Your first month is about building the foundation. You&apos;ll understand exactly where you are so we can create a plan that&apos;s genuinely yours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '11px', marginBottom: '32px' }}>
                {MONTH1_ITEMS.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: 'rgba(107,143,113,0.28)', border: '1px solid rgba(160,205,168,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={2.5} color="rgba(160,205,168,0.9)" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.45 }}>{item}</p>
                  </div>
                ))}
              </div>

              <a href="/today?tab=month1" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#fff', color: 'var(--color-ink)',
                borderRadius: '12px', padding: '14px 24px',
                fontWeight: 800, fontSize: '15px', textDecoration: 'none',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
              >
                Begin Month 1
                <ArrowRight size={16} strokeWidth={2.5} />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — FINAL CONVERSION CTA
      ══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(155deg, #0A1A0C 0%, #1C2B1E 40%, #2A4030 80%, #1A3022 100%)',
        padding: '96px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <FadeIn>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' as const, position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.14em', marginBottom: '20px' }}>
              Begin Today
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '18px' }}>
              The best investment you can make is in your future health.
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
              Small actions, guided consistently over time, create extraordinary change.
            </p>
            <a href="/today?tab=month1" className="ns-cta-primary" style={{ fontSize: '17px', padding: '18px 36px' }}>
              Start My Transformation
              <ArrowRight size={20} strokeWidth={2.5} />
            </a>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}

// ─── ACTIVE: Continue Journey banner injected below month progress ─────────────

function ContinueJourneyBanner() {
  const monthLabel = `Month ${ACTIVE_MONTH_NUM}`;
  return (
    <div style={{ padding: '0 20px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: 'linear-gradient(135deg, #1C2B1E 0%, #2E4830 60%, #3A5C3E 100%)',
          borderRadius: '20px', padding: '22px 22px',
          position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(107,143,113,0.20)',
        }}
      >
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          {/* Progress ring placeholder */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
            background: 'conic-gradient(rgba(160,205,168,0.85) 0% 47%, rgba(255,255,255,0.08) 47% 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 0 5px #1C2B1E',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>{ACTIVE_PCT}%</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>
              {monthLabel} · In Progress
            </p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '3px' }}>
              Day {ACTIVE_DAY} of {ACTIVE_DAYS_TOTAL}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.4 }}>
              {ACTIVE_PCT}% complete · {ACTIVE_DAYS_REMAINING} days remaining
            </p>
          </div>

          <a
            href={ACTIVE_MONTH_ROUTE}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '12px', padding: '11px 18px',
              fontSize: '13px', fontWeight: 800, color: '#fff',
              textDecoration: 'none', whiteSpace: 'nowrap' as const,
              transition: 'background 0.18s, border-color 0.18s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.18)'; el.style.borderColor = 'rgba(255,255,255,0.30)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.12)'; el.style.borderColor = 'rgba(255,255,255,0.18)'; }}
          >
            Continue Journey
            <ChevronRight size={15} strokeWidth={2.5} />
          </a>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '16px', height: '4px', background: 'rgba(255,255,255,0.10)', borderRadius: '2px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ACTIVE_PCT}%` }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, rgba(107,143,113,0.9), rgba(160,205,168,0.8))', borderRadius: '2px' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [status, setStatus] = useState<ProgramStatus>('not_started');

  const toggle = (
    <div style={{
      position: 'fixed', top: '64px', right: '16px', zIndex: 500,
      background: '#1C2B1E',
      border: '1px solid rgba(107,143,113,0.40)',
      borderRadius: '12px',
      padding: '6px',
      display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.40)',
    }}>
      <span style={{
        fontSize: '9px', fontWeight: 700, color: 'rgba(160,205,168,0.50)',
        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        paddingLeft: '6px', paddingRight: '2px', whiteSpace: 'nowrap' as const,
      }}>
        Preview
      </span>
      {(['not_started', 'active'] as const).map(s => (
        <button
          key={s}
          onClick={() => setStatus(s)}
          style={{
            padding: '6px 12px', borderRadius: '8px', border: 'none',
            background: status === s ? 'var(--color-sage)' : 'transparent',
            color: status === s ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap' as const,
          }}
        >
          {s === 'not_started' ? 'Not Started' : 'Active'}
        </button>
      ))}
    </div>
  );

  if (status === 'not_started') {
    return (
      <>
        {toggle}
        <NotStartedOverview />
      </>
    );
  }

  // ACTIVE: render the today page in month2 view with the banner injected.
  // The today page owns the tab experience; this page surfaces the primary CTA.
  return (
    <>
      {toggle}
      <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
        <ContinueJourneyBanner />
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: '#fff', borderRadius: '18px',
          border: '1.5px solid var(--color-border)', padding: '28px 24px',
          textAlign: 'center' as const,
        }}>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Your full programme dashboard is on the Overview page.
          </p>
          <a
            href="/today"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--color-sage)', color: '#fff',
              borderRadius: '12px', padding: '13px 24px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}
          >
            Go to My Dashboard
            <ArrowRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
