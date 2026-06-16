'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeft,
} from 'lucide-react';

// ─── Shared sub-components (copied from today/page.tsx) ───────────────────────

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

function MetricCard({
  title, badge, badgeType, bars, barColor, mainValue, comparison, comparisonColor, encouragement,
}: {
  title: string; badge: string; badgeType: 'poor' | 'fair' | 'good';
  bars: number[]; barColor: string; mainValue: string;
  comparison: string; comparisonColor: string; encouragement?: string;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--color-border)',
      borderRadius: '20px', padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', minWidth: '180px', flex: '1 1 180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{title}</span>
        <Badge label={badge} type={badgeType} />
      </div>
      <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '2px' }}>{mainValue}</p>
      <p style={{ fontSize: '12px', color: comparisonColor, fontWeight: 600, marginBottom: '14px' }}>{comparison}</p>
      <MiniBarChart bars={bars} color={barColor} />
      {encouragement && (
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', fontStyle: 'italic', marginTop: '12px', lineHeight: 1.5, paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          {encouragement}
        </p>
      )}
    </div>
  );
}

const PHASE_DATA = [
  { num: 1, label: 'Awareness', icon: '🔬', status: 'completed' as const, title: 'Know Your Health', focus: ['Health assessment', 'Nutrition foundations', 'Habit tracking'], outcome: 'Discover your patterns and build your starting point.' },
  { num: 2, label: 'Habits', icon: '🚶', status: 'active' as const, title: 'Build Healthy Habits', focus: ['Nutrition consistency', 'Daily movement', 'Strength training', 'Hydration'], outcome: 'Create routines that fit naturally into your life.' },
  { num: 3, label: 'Sleep', icon: '😴', status: 'locked' as const, title: 'Sleep Better, Feel Better', focus: ['Sleep optimisation', 'Blood sugar management', 'Recovery'], outcome: 'Improve sleep, energy and blood sugar balance.' },
  { num: 4, label: 'Stress', icon: '🧠', status: 'locked' as const, title: 'Stress Less, Feel Better', focus: ['Stress management', 'Mental wellbeing', 'Lifestyle integration'], outcome: 'Build resilience and feel more in control.' },
  { num: 5, label: 'Sustain', icon: '🌿', status: 'locked' as const, title: 'Make It Stick', focus: ['Gut health', 'Behaviour reinforcement', 'Long-term habit design'], outcome: 'Turn healthy choices into lasting habits.' },
  { num: 6, label: 'Thrive', icon: '🏆', status: 'locked' as const, title: 'Your New Normal', focus: ['Biomarker tracking', 'Advanced coaching', 'Future planning'], outcome: 'Celebrate your progress and prepare for life beyond the programme.' },
];

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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {PHASE_DATA.map((step, i) => {
          const isSelected = selectedPhase === step.num;
          const bgColor = nodeColor(step.status, isSelected);
          return (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
              <button
                onClick={() => setSelectedPhase(step.num)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0' }}
              >
                <div style={{
                  width: isSelected ? '30px' : step.status === 'active' ? '28px' : '22px',
                  height: isSelected ? '30px' : step.status === 'active' ? '28px' : '22px',
                  borderRadius: '50%', background: bgColor,
                  border: step.status === 'locked' && !isSelected ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: isSelected ? dark ? '0 0 0 3px rgba(240,201,106,0.25)' : '0 0 0 3px rgba(28,43,30,0.12)' : step.status === 'active' ? '0 0 0 3px rgba(28,43,30,0.10)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {step.status === 'completed'
                    ? <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <span style={{ fontSize: isSelected || step.status === 'active' ? '11px' : '9px', fontWeight: 700, color: isSelected ? dark ? '#1C2B1E' : '#fff' : step.status === 'active' ? '#fff' : dark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)' }}>{step.num}</span>
                  }
                </div>
                <span style={{ fontSize: '9px', fontWeight: isSelected || step.status === 'active' ? 700 : 400, color: isSelected ? dark ? '#F0C96A' : 'var(--color-ink)' : step.status === 'completed' ? 'var(--color-sage)' : step.status === 'active' ? dark ? '#F0C96A' : 'var(--color-ink)' : dark ? 'rgba(255,255,255,0.35)' : 'var(--color-muted)', whiteSpace: 'nowrap' as const, letterSpacing: '0.01em' }}>
                  {step.label}
                </span>
              </button>
              {i < 5 && (
                <div style={{ flex: 1, height: '1.5px', background: step.status === 'completed' ? 'var(--color-sage)' : dark ? 'rgba(255,255,255,0.12)' : 'var(--color-border)', margin: '0 4px', marginBottom: '16px' }} />
              )}
            </div>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPhase}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ marginTop: '14px', background: dark ? 'rgba(255,255,255,0.07)' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid var(--color-border)', borderRadius: '16px', padding: '16px 18px', boxShadow: dark ? 'none' : '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(107,143,113,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{phase.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>Month {phase.num}</p>
                {(() => { const s = statusLabel(phase.status); return <span style={{ fontSize: '9px', fontWeight: 700, background: s.bg, color: s.color, borderRadius: '20px', padding: '2px 7px' }}>{s.text}</span>; })()}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: dark ? '#fff' : 'var(--color-ink)', lineHeight: 1.3 }}>{phase.title}</p>
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '7px' }}>Focus</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
              {phase.focus.map((f) => <span key={f} style={{ fontSize: '11px', fontWeight: 500, background: dark ? 'rgba(168,197,172,0.12)' : 'rgba(107,143,113,0.08)', color: dark ? '#A8C5AC' : 'var(--color-sage)', border: dark ? '1px solid rgba(168,197,172,0.2)' : '1px solid rgba(107,143,113,0.18)', borderRadius: '20px', padding: '4px 11px' }}>{f}</span>)}
            </div>
          </div>
          <div style={{ paddingTop: '10px', borderTop: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '4px' }}>Outcome</p>
            <p style={{ fontSize: '13px', color: dark ? 'rgba(255,255,255,0.8)' : 'var(--color-ink)', lineHeight: 1.55, fontStyle: 'italic' }}>{phase.outcome}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── VERSION A — Current Overview (exact replica) ─────────────────────────────

function VersionA() {
  const [activeFilter, setActiveFilter] = useState('Fitness');
  const [showSetup, setShowSetup] = useState(true);
  const [habitsChecked, setHabitsChecked] = useState([false, false, false, false, false]);

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

  const hour = new Date().getHours();
  const day = new Date().getDay();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const daySubtitle =
    day === 1 ? "New week, fresh start. Let's build on last week's momentum." :
    day === 3 ? "Halfway through the week — you're doing great." :
    day === 5 ? "Strong finish to the week ahead." :
    "Every small step counts. Let's make today count.";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <style>{`@keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.25) } 50% { box-shadow: 0 0 0 6px rgba(107,143,113,0) } } @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }`}</style>

      {/* 1. Hero */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80" alt="Wellness" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '28px 28px 24px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A', animation: 'pulseRing 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>Day 14 of 30 · Build Healthy Habits</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>{greeting}, Priya</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0, maxWidth: '320px' }}>{daySubtitle}</p>
          <div style={{ marginTop: '6px' }}>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', maxWidth: '200px' }}>
              <div style={{ height: '100%', width: '47%', background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', letterSpacing: '0.02em' }}>47% of Month 2 complete</p>
          </div>
        </div>
      </div>

      {/* 2. Journey Timeline */}
      <div style={{ padding: '20px 28px 0', background: 'var(--color-surface)' }}>
        <JourneyIndicator />
      </div>

      {/* 3. Today's Focus */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ background: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 4px 24px rgba(28,43,30,0.18)' }}>
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
        </div>
      </div>

      {/* 4. Setup nudge */}
      {showSetup && (
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '2px' }}>One last thing to unlock your full journey</p>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>Upload your baseline labs so Dr. Ananya can personalise your insights</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: 'var(--color-ink)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={11} /> Upload labs
              </button>
              <button onClick={() => setShowSetup(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-muted)', fontSize: '16px', lineHeight: 1 }}>×</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Health Overview */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Today at a glance</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Health Overview</h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', paddingBottom: '2px' }}>Updated just now</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          <MetricCard title="Steps" badge="Poor" badgeType="poor" bars={[3,5,4,6,5,3,5]} barColor="var(--color-terracotta)" mainValue="5,240 steps" comparison="−1,760 vs goal" comparisonColor="#DC2626" encouragement="A short walk after lunch would close this gap" />
          <MetricCard title="Sleep" badge="Fair" badgeType="fair" bars={[7,6,8,7,6,7,6]} barColor="#7B68EE" mainValue="6.5 hrs" comparison="−1 hr vs target" comparisonColor="#D97706" encouragement="Try a 10pm screen curfew tonight" />
          <MetricCard title="Nutrition" badge="Good" badgeType="good" bars={[3,2,3,3,2,3,1]} barColor="var(--color-sage)" mainValue="1/3 meals" comparison="+2 meals to log today" comparisonColor="#16A34A" encouragement="You're on a roll — keep it going at lunch!" />
        </div>
      </div>

      {/* 6. Personal Patterns */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Discovered from your data</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Your personal patterns</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: <TrendingUp size={16} color="var(--color-sage)" />, bg: 'rgba(107,143,113,0.1)', label: 'Sleep correlation', labelColor: 'var(--color-sage)', text: <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.5, fontWeight: 500 }}>You sleep <strong>45 min longer</strong> on days you walk 7,000+ steps</p> },
            { icon: <Zap size={16} color="#D4A843" />, bg: 'rgba(212,168,67,0.1)', label: 'Best days', labelColor: '#D4A843', text: <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.5, fontWeight: 500 }}>Your <strong>best logged days</strong> are Tuesdays and Thursdays</p> },
          ].map((p, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.icon}</div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: p.labelColor, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }}>{p.label}</p>
                {p.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Health Programme */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Month 2 · Build Healthy Habits</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Your Health Programme</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>👥 <strong style={{ color: 'var(--color-sage)' }}>847 members</strong> are on Month 2 this week</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', border: '1.5px solid var(--color-border)', borderRadius: '20px', background: '#fff', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Plus size={12} />Log activity
          </button>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '20px', marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>Today&apos;s Habits</p>
            <span style={{ background: 'rgba(212,168,67,0.1)', color: '#C49A26', fontSize: '12px', fontWeight: 700, borderRadius: '20px', padding: '4px 12px' }}>🔥 14-day streak</span>
          </div>
          {allHabitsDone && (
            <div style={{ background: '#DCFCE7', border: '1px solid #16A34A', borderRadius: '12px', padding: '16px', marginBottom: '14px', animation: 'slideDown 0.3s ease' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>You crushed it today! All habits done. 🎉</p>
              <p style={{ fontSize: '12px', color: '#16A34A', lineHeight: 1.4 }}>That&apos;s 15 days in a row. You&apos;re building something real.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habits.map((habit, i) => (
              <button key={i} onClick={() => setHabitsChecked(prev => prev.map((v, idx) => idx === i ? !v : v))} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${habitsChecked[i] ? 'var(--color-sage)' : 'var(--color-border)'}`, background: habitsChecked[i] ? 'var(--color-sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                  {habitsChecked[i] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: '13px', color: habitsChecked[i] ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: habitsChecked[i] ? 'line-through' : 'none', lineHeight: 1.4 }}>{habit}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80', Icon: CheckCircle2, title: 'Habit Tracker', desc: 'Log your daily habits and build lasting routines' },
            { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', Icon: UtensilsCrossed, title: 'Meal Logger', desc: 'Track meals using the Indian Plate Model' },
            { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', Icon: Footprints, title: 'Steps & Activity', desc: 'Monitor daily movement and active minutes' },
            { img: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&q=80', Icon: Moon, title: 'Sleep Tracker', desc: 'Analyse sleep quality and recovery each night' },
            { img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', Icon: Brain, title: 'Mindfulness', desc: 'Daily breathing exercises and stress management' },
            { img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', Icon: FlaskConical, title: 'Progress & Labs', desc: 'Track biomarkers and review lab results over time' },
          ].map(({ img, Icon, title, desc }, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              <div style={{ height: '100px', overflow: 'hidden', position: 'relative' }}>
                <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Icon size={13} color="var(--color-sage)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{title}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Explore Health Topics */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Guided learning</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Explore Health Topics</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${activeFilter === f ? 'var(--color-ink)' : 'var(--color-border)'}`, background: activeFilter === f ? 'var(--color-ink)' : '#fff', color: activeFilter === f ? '#fff' : 'var(--color-ink)', fontSize: '13px', fontWeight: activeFilter === f ? 600 : 400, cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {questions.map((q, i) => (
            <button key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: i === 0 ? '12px 12px 4px 4px' : i === questions.length - 1 ? '4px 4px 12px 12px' : '4px', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: i < questions.length - 1 ? '2px' : '0' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--color-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BarChart3 size={13} color="var(--color-sage)" /></div>
              <span style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.4 }}>{q}</span>
              <ChevronRight size={14} color="var(--color-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* 9. Member Success Stories */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>People like you</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Member Success Stories</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80', name: 'Meera S.', badge: 'Month 3 ✓', headline: 'Lost 4kg and reversed pre-diabetes in 3 months', stats: [{ label: '−4 kg', sub: 'weight' }, { label: '−5 cm', sub: 'waist' }, { label: '5.6', sub: 'HbA1c' }] },
            { img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', name: 'Rajesh K.', badge: 'Month 6 ✓', headline: 'Completed 6 months — lost 8kg and came off medication', stats: [{ label: '−8 kg', sub: 'weight' }, { label: '120/80', sub: 'BP' }, { label: 'Off meds', sub: '' }] },
            { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', name: 'Sunita P.', badge: 'Month 2 ✓', headline: 'Two weeks in and already sleeping better', stats: [{ label: '+1.2 hrs', sub: 'sleep' }, { label: '7k steps', sub: 'daily' }, { label: '14 day', sub: 'streak' }] },
          ].map((story, i) => (
            <div key={i} style={{ width: '280px', flexShrink: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
                <span style={{ position: 'absolute', bottom: '10px', left: '12px', fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(22,163,74,0.85)', borderRadius: '20px', padding: '2px 8px' }}>{story.badge}</span>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>{story.name}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.45, marginBottom: '12px' }}>{story.headline}</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {story.stats.map((s, j) => <div key={j} style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '8px', padding: '5px 8px', textAlign: 'center' as const }}><p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-sage)', lineHeight: 1 }}>{s.label}</p>{s.sub && <p style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>{s.sub}</p>}</div>)}
                </div>
                <a href="/community" style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600, textDecoration: 'none' }}>Read story →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Discover Articles */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Editorial</p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Discover</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', title: 'Why walking after meals helps blood sugar', sources: '4 sources' },
            { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', title: 'The Indian Plate Model explained', sources: '6 sources' },
            { img: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&q=80', title: 'Sleep and metabolic health: what the research says', sources: '8 sources' },
          ].map((a, i) => (
            <div key={i} style={{ width: '260px', flexShrink: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              <div style={{ height: '160px', overflow: 'hidden' }}><img src={a.img} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.5, marginBottom: '12px' }}>{a.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500 }}>{a.sources}</span>
                  <div style={{ display: 'flex', gap: '10px' }}><Heart size={14} color="var(--color-muted)" /><Bookmark size={14} color="var(--color-muted)" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 11. Coach Message */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>DA</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)' }}>Dr. Ananya · Your Coach</p>
              <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Just now</p>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.6 }}>Priya, I noticed you haven&apos;t logged lunch the past 3 days. Try setting a midday reminder — even a quick log takes 30 seconds and keeps your streak alive 💚</p>
          </div>
        </div>
      </div>

      {/* 12. Journey Summary */}
      <div style={{ padding: '32px 24px 40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1C2B1E 0%, #2D4A30 100%)', borderRadius: '24px', padding: '28px 24px', color: '#fff' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your transformation</p>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px' }}>Your Journey</h3>
          <div style={{ marginBottom: '24px' }}><JourneyIndicator dark /></div>
          <div style={{ display: 'flex', gap: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div><p style={{ fontSize: '22px', fontWeight: 800, color: '#F0C96A', letterSpacing: '-0.02em', lineHeight: 1 }}>42</p><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>of 180 days</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: 800, color: '#A8C5AC', letterSpacing: '-0.02em', lineHeight: 1 }}>23%</p><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>programme complete</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>14</p><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>day streak</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VERSION B — Redesigned Journey Hub ───────────────────────────────────────

function VersionB() {
  const [habitsChecked, setHabitsChecked] = useState([false, false, false, false, false]);

  const habits = [
    'Follow the Plate Model at lunch',
    'Walk 6,000–8,000 steps',
    'Do beginner resistance training',
    'Avoid sugary drinks',
    'Log meals with protein rating',
  ];
  const allHabitsDone = habitsChecked.every(Boolean);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <style>{`@keyframes pulseRingB { 0%,100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.25) } 50% { box-shadow: 0 0 0 6px rgba(107,143,113,0) } } @keyframes slideDownB { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }`}</style>

      {/* ── 1. HERO ── */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80" alt="Wellness" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.80) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '28px 28px 24px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A', animation: 'pulseRingB 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>Day 14 of 30 · Build Healthy Habits</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>{greeting}, Priya</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0 }}>You&apos;re 14 days into your transformation. Keep going.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', width: '140px' }}>
                <div style={{ height: '100%', width: '47%', background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>47% of Month 2</p>
            </div>
            <div style={{ background: 'rgba(240,201,106,0.2)', borderRadius: '10px', padding: '5px 12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#F0C96A' }}>🔥 14-day streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. INTERACTIVE PROGRAMME TIMELINE ── */}
      <div style={{ padding: '20px 24px 0', background: 'var(--color-surface)' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '12px' }}>Your 6-Month Programme</p>
        <JourneyIndicator />
      </div>

      {/* ── 3. TRANSFORMATION JOURNEY (emotional centerpiece) ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ background: 'linear-gradient(160deg, #1C2B1E 0%, #3A5C3E 60%, #2D4A30 100%)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(28,43,30,0.25)' }}>
          {/* Header */}
          <div style={{ padding: '22px 24px 0' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' }}>Your transformation</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>Your Transformation Journey</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>See how far you&apos;ve already come</p>
          </div>

          {/* Photo timeline */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '16px' }}>
              {/* Day 1 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                  <svg viewBox="0 0 100 133" style={{ width: '100%', height: '100%' }} fill="none"><rect width="100" height="133" fill="rgba(255,255,255,0.06)" /><circle cx="50" cy="44" r="18" fill="rgba(255,255,255,0.12)" /><ellipse cx="50" cy="105" rx="28" ry="22" fill="rgba(255,255,255,0.12)" /></svg>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '5px 8px' }}><p style={{ fontSize: '9px', color: '#fff', fontWeight: 700 }}>DAY 1</p></div>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', textAlign: 'center' as const, fontWeight: 500 }}>Start</p>
              </div>

              {/* Journey line */}
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '24px' }}>
                <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, rgba(168,197,172,0.4), rgba(240,201,106,0.8))', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translate(50%,-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#F0C96A', boxShadow: '0 0 0 3px rgba(240,201,106,0.3)' }} />
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', letterSpacing: '0.02em' }}>14 days of progress</p>
              </div>

              {/* Today */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(240,201,106,0.5)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Plus size={22} color="rgba(240,201,106,0.8)" />
                    <span style={{ fontSize: '10px', color: 'rgba(240,201,106,0.8)', fontWeight: 600 }}>Add photo</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '5px 8px' }}><p style={{ fontSize: '9px', color: '#F0C96A', fontWeight: 700 }}>TODAY</p></div>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', textAlign: 'center' as const, fontWeight: 500 }}>Day 14</p>
              </div>
            </div>

            {/* Transformation stats */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[
                { icon: '⚖️', value: '▼ 3 kg', label: 'Weight' },
                { icon: '📏', value: '▼ 4 cm', label: 'Waist' },
                { icon: '🔥', value: '14 days', label: 'Streak' },
              ].map((stat, i) => (
                <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 10px', textAlign: 'center' as const }}>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{stat.icon}</p>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#F0C96A', lineHeight: 1, marginBottom: '3px' }}>{stat.value}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <button style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              View Full Journey <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. TODAY'S FOCUS ── */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ background: 'linear-gradient(135deg, #1C2B1E 0%, #3A5C3E 100%)', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 4px 24px rgba(28,43,30,0.18)' }}>
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
        </div>
      </div>

      {/* ── 5. HEALTH SNAPSHOT (merged Health Overview + Personal Patterns) ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Your health this week</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Health Snapshot</h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', paddingBottom: '2px' }}>Updated just now</span>
        </div>

        {/* Metrics row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          {[
            { icon: '🚶', label: 'Steps', value: '5,240', target: '7,000', pct: 74, color: '#DC2626', badge: 'Below goal' },
            { icon: '😴', label: 'Sleep', value: '6.5h', target: '7.5h', pct: 87, color: '#D97706', badge: 'Fair' },
            { icon: '🥗', label: 'Nutrition', value: '1/3', target: 'meals', pct: 33, color: '#16A34A', badge: 'On track' },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '18px', marginBottom: '6px' }}>{m.icon}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '2px' }}>{m.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>{m.value}</p>
              <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '10px', color: m.color, fontWeight: 600 }}>{m.badge}</p>
            </div>
          ))}
        </div>

        {/* Coach Insight — personalized */}
        <div style={{ background: 'rgba(107,143,113,0.06)', border: '1px solid rgba(107,143,113,0.18)', borderRadius: '18px', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px' }}>👩‍⚕️</div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>Dr. Ananya</p>
              <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Coach Insight</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.65 }}>
            Priya, on days you walk 7,000+ steps you sleep <strong>45 min longer</strong>. You&apos;re 1,760 steps away from triggering that tonight.
          </p>
        </div>
      </div>

      {/* ── 6. PROGRAMME ACTIONS ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '3px' }}>Month 2 · Foundation</p>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Programme Actions</h2>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: '1.5px solid var(--color-border)', borderRadius: '20px', background: '#fff', fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Plus size={12} />Log
          </button>
        </div>

        {/* Today's Habits */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '18px 20px', marginBottom: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>Today&apos;s Habits</p>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{habitsChecked.filter(Boolean).length}/{habits.length} done</span>
          </div>
          {allHabitsDone && (
            <div style={{ background: '#DCFCE7', border: '1px solid #16A34A', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', animation: 'slideDownB 0.3s ease' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>All done — incredible day! 🎉</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {habits.map((habit, i) => (
              <button key={i} onClick={() => setHabitsChecked(prev => prev.map((v, idx) => idx === i ? !v : v))} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${habitsChecked[i] ? 'var(--color-sage)' : 'var(--color-border)'}`, background: habitsChecked[i] ? 'var(--color-sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                  {habitsChecked[i] && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: '13px', color: habitsChecked[i] ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: habitsChecked[i] ? 'line-through' : 'none', lineHeight: 1.4 }}>{habit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { icon: UtensilsCrossed, label: 'Log meal', color: 'var(--color-sage)' },
            { icon: Footprints, label: 'Log steps', color: 'var(--color-terracotta)' },
            { icon: Moon, label: 'Log sleep', color: '#7B68EE' },
          ].map(({ icon: Icon, label, color }, i) => (
            <button key={i} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <Icon size={20} color={color} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 7. PROGRESS HIGHLIGHTS ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>📈 Progress Highlights</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Since Day 1 of your journey</p>
          </div>
          <button style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '2px' }}>
            View Full Journey <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {[
            { icon: '⚖️', metric: 'Weight', value: '▼ 3 kg', sub: 'since day 1', trend: [70.5, 70.2, 69.8, 69.5, 69.2], color: 'var(--color-sage)' },
            { icon: '📏', metric: 'Waist', value: '▼ 4 cm', sub: 'since day 1', trend: [36, 35.6, 35.2, 34.8, 34.5], color: 'var(--color-terracotta)' },
            { icon: '🩸', metric: 'Blood Sugar', value: 'Improving', sub: 'fasting trend ↓', trend: [110, 108, 106, 104, 102], color: '#7B68EE' },
            { icon: '💪', metric: 'Momentum', value: '14 days', sub: 'current streak', trend: [4, 6, 8, 10, 14], color: '#D4A843' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{item.metric}</span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: item.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '2px' }}>{item.value}</p>
              <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginBottom: '10px' }}>{item.sub}</p>
              <MiniBarChart bars={item.trend} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. PEOPLE LIKE YOU (compact) ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>👥 People Like You</h2>
          <button style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ChevronRight size={13} />
          </button>
        </div>

        {/* Community Snapshot */}
        <div style={{ background: 'rgba(107,143,113,0.06)', border: '1px solid rgba(107,143,113,0.15)', borderRadius: '18px', padding: '16px 18px', marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Community Snapshot</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ value: '847', label: 'on Month 2' }, { value: '73%', label: 'hit steps goal' }, { value: '4.2 kg', label: 'avg. Month 2 loss' }].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' as const }}>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-sage)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Member Story */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: '90px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80" alt="Meera" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div style={{ padding: '14px 16px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(22,163,74,0.1)', color: '#16A34A', borderRadius: '20px', padding: '2px 8px' }}>Month 3 ✓</span>
                <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Meera S.</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.4, marginBottom: '8px' }}>Lost 4kg and reversed pre-diabetes in 3 months</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[{ v: '−4 kg', s: 'weight' }, { v: '−5 cm', s: 'waist' }, { v: '5.6', s: 'HbA1c' }].map((s, j) => (
                  <div key={j} style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '8px', padding: '4px 8px', textAlign: 'center' as const }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-sage)', lineHeight: 1 }}>{s.v}</p>
                    <p style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '1px' }}>{s.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Member Results */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '10px' }}>Members similar to you at Day 14</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ v: '−2.8 kg', s: 'avg. weight' }, { v: '−3.2 cm', s: 'avg. waist' }, { v: '89%', s: 'habit rate' }].map((s, j) => (
              <div key={j} style={{ flex: 1, background: 'var(--color-surface)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' as const }}>
                <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-sage)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</p>
                <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.3 }}>{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. COACH MESSAGE ── */}
      <div style={{ padding: '28px 24px 40px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>DA</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)' }}>Dr. Ananya · Your Coach</p>
              <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Just now</p>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1.6 }}>
              Priya, I noticed you haven&apos;t logged lunch the past 3 days. Try setting a midday reminder — even a quick log takes 30 seconds and keeps your streak alive 💚
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── IA METRICS ───────────────────────────────────────────────────────────────

const IA_DATA = {
  a: {
    label: 'Version A · Current',
    sections: 10,
    scrollDepth: '~4,200px',
    density: 'High',
    densityColor: '#DC2626',
    sectionList: ['Hero', 'Journey Timeline', "Today's Focus", 'Health Overview', 'Personal Patterns', 'Health Programme', 'Explore Health Topics', 'Success Stories', 'Discover Articles', 'Coach Message', 'Journey Summary'],
  },
  b: {
    label: 'Version B · Redesigned',
    sections: 9,
    scrollDepth: '~3,000px',
    density: 'Focused',
    densityColor: '#16A34A',
    sectionList: ['Hero', 'Programme Timeline', 'Transformation Journey', "Today's Focus", 'Health Snapshot', 'Programme Actions', 'Progress Highlights', 'People Like You', 'Coach Message'],
  },
};

function IAMetrics() {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', padding: '16px 20px' }}>
      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>Information Architecture Comparison</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        {Object.values(IA_DATA).map((v, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--color-surface)', borderRadius: '14px', padding: '12px 14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>{v.label}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: '11px', background: '#F0F0EC', borderRadius: '8px', padding: '4px 8px', color: 'var(--color-muted)' }}>
                <strong style={{ color: 'var(--color-ink)' }}>{v.sections}</strong> sections
              </span>
              <span style={{ fontSize: '11px', background: '#F0F0EC', borderRadius: '8px', padding: '4px 8px', color: 'var(--color-muted)' }}>
                <strong style={{ color: 'var(--color-ink)' }}>{v.scrollDepth}</strong>
              </span>
              <span style={{ fontSize: '11px', background: '#F0F0EC', borderRadius: '8px', padding: '4px 8px' }}>
                <strong style={{ color: v.densityColor }}>{v.density}</strong>
              </span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {v.sectionList.map((s, j) => (
                <p key={j} style={{ fontSize: '10px', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--color-sage)', fontWeight: 600 }}>{j + 1}.</span> {s}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPARISON PAGE ─────────────────────────────────────────────────────

export default function ComparePage() {
  const [mobileTab, setMobileTab] = useState<'a' | 'b'>('a');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: '12px', height: '52px',
      }}>
        <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Back
        </a>
        <div style={{ flex: 1, textAlign: 'center' as const }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Overview Comparison</p>
          <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>A/B Prototype</p>
        </div>
        {/* Mobile tab switcher */}
        <div style={{ display: 'flex', background: 'var(--color-border)', borderRadius: '10px', padding: '2px', gap: '2px' }} className="mobile-switcher">
          {(['a', 'b'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: mobileTab === tab ? '#fff' : 'transparent',
                color: mobileTab === tab ? 'var(--color-ink)' : 'var(--color-muted)',
                boxShadow: mobileTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'a' ? 'Current' : 'Redesigned'}
            </button>
          ))}
        </div>
      </div>

      {/* IA metrics strip */}
      <IAMetrics />

      {/* Side-by-side labels (desktop) */}
      <div className="compare-desktop-labels" style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--color-border)' }}>
        {[
          { tag: 'A', label: 'Current Overview', desc: 'Existing implementation — baseline for comparison' },
          { tag: 'B', label: 'Redesigned Journey Hub', desc: 'Emotionally-led, transformation-first information architecture' },
        ].map((v, i) => (
          <div key={i} style={{ background: i === 0 ? '#fff' : 'rgba(107,143,113,0.04)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: i === 0 ? 'var(--color-border)' : 'rgba(107,143,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: i === 0 ? 'var(--color-muted)' : 'var(--color-sage)', flexShrink: 0 }}>{v.tag}</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{v.label}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <style>{`
        @media (min-width: 900px) {
          .compare-grid { display: grid !important; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--color-border); }
          .compare-col-a, .compare-col-b { display: block !important; }
          .mobile-switcher { display: none !important; }
          .compare-mobile-only { display: none !important; }
          .compare-desktop-labels { display: grid !important; }
        }
        @media (max-width: 899px) {
          .compare-col-a { display: ${mobileTab === 'a' ? 'block' : 'none'}; }
          .compare-col-b { display: ${mobileTab === 'b' ? 'block' : 'none'}; }
        }
      `}</style>

      <div className="compare-grid" style={{ display: 'block' }}>
        {/* Version A */}
        <div className="compare-col-a" style={{ background: '#fff', minHeight: '100vh' }}>
          {/* Mobile label */}
          <div className="compare-mobile-only" style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--color-muted)' }}>A</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Current Overview</p>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Existing implementation</p>
            </div>
          </div>
          <VersionA />
        </div>

        {/* Version B */}
        <div className="compare-col-b" style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
          {/* Mobile label */}
          <div className="compare-mobile-only" style={{ padding: '12px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(107,143,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--color-sage)' }}>B</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>Redesigned Journey Hub</p>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Transformation-first IA</p>
            </div>
          </div>
          <VersionB />
        </div>
      </div>
    </div>
  );
}
