'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface UserInfo {
  fullName: string;
  dob: string;
  gender: string;
  height: string;
  weight: string;
  waist: string;
}

interface OnboardingState {
  step: Step;
  userInfo: UserInfo;
  selectedGoals: string[];
  supportStyle: 'coach' | 'self_guided' | null;
  selectedConditions: string[];
  otherCondition: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const GOAL_CATEGORIES = [
  {
    label: 'Weight & Metabolic Health',
    goals: ['Lose Weight', 'Reduce Body Fat', 'Improve Blood Sugar Control', 'Reverse Fatty Liver'],
  },
  {
    label: 'Heart Health',
    goals: ['Lower Blood Pressure', 'Improve Cholesterol Levels', 'Improve Heart Health'],
  },
  {
    label: 'Energy & Performance',
    goals: ['Improve Energy Levels', 'Increase Muscle Mass', 'Increase Daily Physical Activity', 'Maintain Overall Fitness', 'Enhance Flexibility & Mobility', 'Improve Posture'],
  },
  {
    label: 'Mind & Recovery',
    goals: ['Improve Sleep Quality', 'Manage Stress Levels', 'Improve Mental Health', 'Enhance Focus & Concentration'],
  },
  {
    label: 'Lifestyle & Wellbeing',
    goals: ['Improve Hydration Habits', 'Build Healthy Eating Habits', 'Improve Digestive Health', 'Improve Kidney Health', 'Improve Vitality & Overall Wellbeing', 'Boost Immunity', 'Support Hormonal Balance', "Improve Women's Health", 'Reduce Medications'],
  },
];

const CONDITIONS = [
  'Diabetes', 'Prediabetes', 'Hypertension', 'Fatty Liver',
  'High Cholesterol', 'Thyroid Disorder', 'PCOS', 'Heart Disease',
  'Obesity', 'Other Health Condition', 'None',
];

const JOURNEY_MONTHS = [
  { num: 1, title: 'Know Your Health' },
  { num: 2, title: 'Build Healthy Habits' },
  { num: 3, title: 'Sleep Better, Feel Better' },
  { num: 4, title: 'Stress Less, Feel Better' },
  { num: 5, title: 'Make It Stick' },
  { num: 6, title: 'Thrive' },
];

// ── Hero photos ────────────────────────────────────────────────────────────────
// Screen 1: woman in golden wheat field, warm afternoon light, peaceful
const PHOTO_WELCOME = 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1400&q=80';
// Screen 5: morning light through forest canopy on a quiet path
const PHOTO_JOURNEY = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80';

// ── Shared primitives ──────────────────────────────────────────────────────────

// Two warm variants — 'amber' for photo screens, 'forest' for form screens
function AmbientGlow({ variant = 'forest' }: { variant?: 'forest' | 'amber' }) {
  const c = variant === 'amber'
    ? { a: 'rgba(160,120,50,0.10)', b: 'rgba(107,143,113,0.10)', c: 'rgba(212,168,67,0.07)' }
    : { a: 'rgba(107,143,113,0.13)', b: 'rgba(80,110,60,0.09)', c: 'rgba(180,140,60,0.06)' };
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', borderRadius: '50%', background: `radial-gradient(circle, ${c.a} 0%, transparent 65%)` }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${c.b} 0%, transparent 65%)` }} />
      <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40vw', height: '30vw', maxWidth: '500px', maxHeight: '400px', background: `radial-gradient(ellipse, ${c.c} 0%, transparent 70%)` }} />
    </div>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const pct = ((step - 1) / 5) * 100;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '3px', background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ height: '100%', background: 'linear-gradient(90deg, #7A9E82 0%, #B8D0BB 100%)' }}
      />
    </div>
  );
}

function StepHeader({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '20px', padding: '9px 15px', color: 'rgba(255,255,255,0.62)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ChevronLeft size={14} strokeWidth={2.5} />Back
        </button>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.05em' }}>
        Step {step} of 5
      </div>
    </div>
  );
}

// In-flow CTA — no fixed positioning
function CtaButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div style={{ paddingTop: '36px', paddingBottom: '56px' }}>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.012, y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.978 } : {}}
        style={{
          width: '100%', maxWidth: '480px',
          padding: '18px 32px',
          background: disabled
            ? 'rgba(255,255,255,0.07)'
            : 'linear-gradient(135deg, #7A9E82 0%, #4A6E50 100%)',
          border: 'none', borderRadius: '16px',
          color: disabled ? 'rgba(255,255,255,0.20)' : '#fff',
          fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          cursor: disabled ? 'default' : 'pointer',
          boxShadow: disabled ? 'none' : '0 6px 28px rgba(107,143,113,0.30), 0 2px 8px rgba(0,0,0,0.16)',
          transition: 'background 0.22s ease, box-shadow 0.22s ease, color 0.22s ease',
        }}
      >
        {label}
        <ArrowRight size={18} strokeWidth={2} />
      </motion.button>
    </div>
  );
}

// ── Screen 1 — Welcome ─────────────────────────────────────────────────────────

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: '#060b07', // dark fallback while photo loads
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Background lifestyle photo — slow cinematic reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('${PHOTO_WELCOME}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      />

      {/* Layered overlay — graduated warm dark */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(4,8,5,0.42) 0%, rgba(4,8,5,0.64) 50%, rgba(4,8,5,0.92) 100%)',
      }} />
      {/* Warm amber horizon glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'radial-gradient(ellipse at 50% 38%, rgba(200,150,60,0.09) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 32px',
        maxWidth: '560px', width: '100%', textAlign: 'center',
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: '20px', padding: '6px 14px', marginBottom: '36px',
          }}
        >
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4A843', opacity: 0.80 }} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(212,168,67,0.78)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            Your 6-Month Transformation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(38px, 6.4vw, 72px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.035em',
            lineHeight: 1.06,
            marginBottom: '28px',
            textShadow: '0 2px 40px rgba(0,0,0,0.55)',
            textAlign: 'center',
          }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>
            Your health{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C8D8C0 0%, #8AB590 42%, #D4A843 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>transformation</span>
          </span>
          <span style={{ display: 'block' }}>starts <span style={{
            background: 'linear-gradient(135deg, #C8D8C0 0%, #8AB590 42%, #D4A843 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>today.</span></span>
        </motion.h1>

        {/* Supporting copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.90, duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: 'rgba(255,248,235,0.62)',
            lineHeight: 1.80,
            marginBottom: '52px',
            textAlign: 'center',
            textShadow: '0 1px 16px rgba(0,0,0,0.60)',
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}
        >
          <span style={{ display: 'block' }}>Over the next 6 months, we'll help you build healthier habits,</span>
          <span style={{ display: 'block' }}>improve your biomarkers, and create lasting change.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.08, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ width: '100%', maxWidth: '360px', paddingBottom: '56px' }}
        >
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '19px 32px',
              background: 'linear-gradient(135deg, #7A9E82 0%, #4A6E50 100%)',
              border: 'none', borderRadius: '16px',
              color: '#fff', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(107,143,113,0.38), 0 2px 12px rgba(0,0,0,0.28)',
            }}
          >
            Let's Get Started <ArrowRight size={18} strokeWidth={2} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Screen 2 — Your Information ───────────────────────────────────────────────

function Screen2({ data, onChange, onNext }: {
  data: UserInfo;
  onChange: (d: UserInfo) => void;
  onNext: () => void;
}) {
  const canContinue = data.fullName.trim().length > 1 && data.dob && data.gender;

  // Warmer glass card surfaces — no cold white
  const cardStyle = {
    background: 'rgba(255,250,238,0.05)',
    border: '1px solid rgba(255,248,230,0.09)',
    borderRadius: '16px',
    padding: '18px 22px',
    backdropFilter: 'blur(10px)',
  };

  const labelStyle = {
    fontSize: '10px', fontWeight: 700,
    color: 'rgba(175,205,180,0.62)',
    letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    display: 'block', marginBottom: '9px',
  };

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    fontSize: '17px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em',
    colorScheme: 'dark' as const,
  };

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.06 + 0.06 * i, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as any } });

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(160deg, #090c09 0%, #0d110a 50%, #090c09 100%)' }}>
      <AmbientGlow variant="forest" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '520px', margin: '0 auto', padding: '96px 24px 0' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(175,205,180,0.58)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '11px' }}>About You</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '11px' }}>Your Information</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,248,225,0.44)', lineHeight: 1.68, marginBottom: '36px' }}>
            We'd love to know a little about you.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <motion.div {...stagger(0)} style={cardStyle}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={data.fullName} onChange={e => onChange({ ...data, fullName: e.target.value })} placeholder="Your full name" style={inputStyle} />
          </motion.div>

          <motion.div {...stagger(1)} style={cardStyle}>
            <label style={labelStyle}>Date of Birth</label>
            <input type="date" value={data.dob} onChange={e => onChange({ ...data, dob: e.target.value })} style={inputStyle} />
          </motion.div>

          <motion.div {...stagger(2)} style={cardStyle}>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(opt => (
                <button
                  key={opt}
                  onClick={() => onChange({ ...data, gender: opt })}
                  style={{
                    padding: '8px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                    border: data.gender === opt ? '1.5px solid rgba(122,158,130,0.75)' : '1.5px solid rgba(255,248,225,0.12)',
                    background: data.gender === opt ? 'rgba(122,158,130,0.20)' : 'transparent',
                    color: data.gender === opt ? '#B8D0BB' : 'rgba(255,248,225,0.50)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: data.gender === opt ? '0 0 12px rgba(107,143,113,0.18)' : 'none',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div {...stagger(3)} style={cardStyle}>
            <label style={labelStyle}>Height</label>
            <input type="text" value={data.height} onChange={e => onChange({ ...data, height: e.target.value })} placeholder="e.g. 170 cm" style={inputStyle} />
          </motion.div>

          <motion.div {...stagger(4)} style={cardStyle}>
            <label style={labelStyle}>Weight</label>
            <input type="text" value={data.weight} onChange={e => onChange({ ...data, weight: e.target.value })} placeholder="e.g. 72 kg" style={inputStyle} />
          </motion.div>

          <motion.div {...stagger(5)} style={cardStyle}>
            <label style={labelStyle}>Waist Circumference</label>
            <input type="text" value={data.waist} onChange={e => onChange({ ...data, waist: e.target.value })} placeholder="e.g. 82 cm" style={inputStyle} />
          </motion.div>
        </div>

        <CtaButton label="Continue" onClick={onNext} disabled={!canContinue} />
      </div>
    </div>
  );
}

// ── Screen 3 — Goals ──────────────────────────────────────────────────────────

function Screen3({ selected, onToggle, onNext }: {
  selected: string[];
  onToggle: (g: string) => void;
  onNext: () => void;
}) {
  const canContinue = selected.length > 0;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(160deg, #090c09 0%, #0d110a 50%, #090c09 100%)' }}>
      <AmbientGlow variant="forest" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '620px', margin: '0 auto', padding: '96px 24px 0' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(175,205,180,0.58)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '11px' }}>Your Goals</p>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '11px' }}>
            What would you like to improve?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,248,225,0.44)', lineHeight: 1.68, marginBottom: '18px' }}>
            Pick up to 3. You can always adjust these later.
          </p>

          {/* Dot counter */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '32px' }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  background: i < selected.length ? 'linear-gradient(135deg, #7A9E82, #B8D0BB)' : 'rgba(255,255,255,0.12)',
                  boxShadow: i < selected.length ? '0 0 10px rgba(107,143,113,0.55)' : 'none',
                }}
                transition={{ duration: 0.22 }}
                style={{ width: '10px', height: '10px', borderRadius: '50%' }}
              />
            ))}
            <span style={{ fontSize: '12px', color: 'rgba(255,248,225,0.30)', marginLeft: '3px' }}>
              {selected.length} / 3 selected
            </span>
          </div>
        </motion.div>

        {GOAL_CATEGORIES.map((cat, ci) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * ci, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ marginBottom: '28px' }}
          >
            <p style={{
              fontSize: '10px', fontWeight: 700,
              color: 'rgba(210,168,67,0.65)',
              letterSpacing: '0.10em', textTransform: 'uppercase',
              marginBottom: '13px', paddingLeft: '2px',
            }}>
              {cat.label}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
              {cat.goals.map(goal => {
                const isSelected = selected.includes(goal);
                const isMaxed = selected.length >= 3 && !isSelected;
                return (
                  <motion.button
                    key={goal}
                    onClick={() => !isMaxed && onToggle(goal)}
                    whileTap={!isMaxed ? { scale: 0.94 } : {}}
                    style={{
                      padding: '11px 18px', borderRadius: '24px',
                      fontSize: '13px', fontWeight: 600,
                      border: isSelected
                        ? '1.5px solid rgba(122,158,130,0.80)'
                        : '1.5px solid rgba(255,248,225,0.10)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(122,158,130,0.28) 0%, rgba(74,110,80,0.18) 100%)'
                        : 'rgba(255,250,238,0.04)',
                      color: isSelected ? '#C0D8C4' : isMaxed ? 'rgba(255,248,225,0.20)' : 'rgba(255,248,225,0.58)',
                      cursor: isMaxed ? 'default' : 'pointer',
                      opacity: isMaxed ? 0.40 : 1,
                      transition: 'all 0.16s ease',
                      boxShadow: isSelected
                        ? '0 0 22px rgba(107,143,113,0.30), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : 'none',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 550, damping: 20 }}>
                          <Check size={12} strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {goal}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        <CtaButton label="Continue" onClick={onNext} disabled={!canContinue} />
      </div>
    </div>
  );
}

// ── Screen 4 — Support Style ──────────────────────────────────────────────────

function Screen4({ selected, onSelect, onNext }: {
  selected: 'coach' | 'self_guided' | null;
  onSelect: (v: 'coach' | 'self_guided') => void;
  onNext: () => void;
}) {
  const CARDS = [
    {
      id: 'coach' as const,
      icon: '👩‍⚕️',
      title: 'Work with a TGHC Coach',
      description: 'Receive personalised guidance, accountability, and support from a dedicated health coach throughout your transformation journey.',
      bullets: [
        'Personalised health guidance',
        'Regular progress reviews',
        'Habit accountability support',
        'Expert answers to your questions',
        'Ongoing motivation and encouragement',
      ],
      footer: "Ideal if you'd like expert support along the way.",
    },
    {
      id: 'self_guided' as const,
      icon: '🌱',
      title: 'Self-Guided with TGHC Tools',
      description: 'Follow the programme independently using TGHC\'s tools, trackers, educational content, nudges, and DIY health plans.',
      bullets: [
        'Full programme access',
        'DIY meal and lifestyle plans',
        'Progress tracking and insights',
        'Habit reminders and nudges',
        'Learn and move at your own pace',
      ],
      footer: 'Ideal if you enjoy managing your own journey.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(160deg, #090c09 0%, #0d110a 50%, #090c09 100%)' }}>
      <AmbientGlow variant="forest" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '960px', margin: '0 auto', padding: '96px 24px 0' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: '44px' }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(175,205,180,0.58)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '11px' }}>
            Your Support System
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '13px' }}>
            How would you like to be<br />supported on your journey?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,248,225,0.44)', lineHeight: 1.68, maxWidth: '560px' }}>
            Choose the level of guidance that feels right for you. Whether you prefer expert coaching or a more independent approach, you'll still receive the complete VitalPath transformation experience.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {CARDS.map((card, i) => {
            const isSelected = selected === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + 0.10 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => onSelect(card.id)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  position: 'relative',
                  background: isSelected
                    ? 'linear-gradient(148deg, rgba(122,158,130,0.16) 0%, rgba(74,110,80,0.10) 100%)'
                    : 'rgba(255,250,238,0.04)',
                  border: isSelected
                    ? '1.5px solid rgba(122,158,130,0.70)'
                    : '1.5px solid rgba(255,248,225,0.09)',
                  borderRadius: '24px',
                  padding: '32px 30px 28px',
                  cursor: 'pointer',
                  transition: 'background 0.22s ease, border-color 0.22s ease',
                  boxShadow: isSelected
                    ? '0 0 40px rgba(107,143,113,0.18), 0 8px 32px rgba(0,0,0,0.22)'
                    : '0 4px 20px rgba(0,0,0,0.16)',
                }}
              >
                {/* Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      style={{
                        position: 'absolute', top: '20px', right: '20px',
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7A9E82, #4A6E50)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(107,143,113,0.50)',
                      }}
                    >
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div style={{ fontSize: '40px', marginBottom: '20px', lineHeight: 1 }}>{card.icon}</div>

                {/* Title */}
                <h3 style={{
                  fontSize: '20px', fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '12px',
                }}>
                  {card.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '14px', color: 'rgba(255,248,225,0.54)',
                  lineHeight: 1.70, marginBottom: '24px',
                }}>
                  {card.description}
                </p>

                {/* Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {card.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                        background: isSelected ? 'rgba(122,158,130,0.28)' : 'rgba(255,248,225,0.07)',
                        border: isSelected ? '1px solid rgba(122,158,130,0.45)' : '1px solid rgba(255,248,225,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.22s ease',
                      }}>
                        <Check size={9} color={isSelected ? '#B8D0BB' : 'rgba(255,248,225,0.28)'} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(255,248,225,0.64)', lineHeight: 1.55 }}>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Footer label */}
                <div style={{
                  borderTop: '1px solid rgba(255,248,225,0.07)',
                  paddingTop: '18px',
                }}>
                  <p style={{
                    fontSize: '12px', color: isSelected ? 'rgba(184,208,187,0.72)' : 'rgba(255,248,225,0.32)',
                    lineHeight: 1.55, fontStyle: 'normal', transition: 'color 0.22s ease',
                  }}>
                    {card.footer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '14px',
            background: 'rgba(255,250,238,0.03)',
            border: '1px solid rgba(255,248,225,0.07)',
            borderRadius: '16px',
            padding: '18px 22px',
            marginBottom: '8px',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={15} color="rgba(212,168,67,0.75)" strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,248,225,0.72)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Both options include the complete 6-month VitalPath programme.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,248,225,0.38)', lineHeight: 1.60 }}>
              Your choice simply determines how much support you'd like along the way.
            </p>
          </div>
        </motion.div>

        <CtaButton label="Continue" onClick={onNext} disabled={selected === null} />
      </div>
    </div>
  );
}

// ── Screen 5 — Conditions ─────────────────────────────────────────────────────

function Screen5({ selected, otherCondition, onToggle, onOtherChange, onNext }: {
  selected: string[];
  otherCondition: string;
  onToggle: (c: string) => void;
  onOtherChange: (v: string) => void;
  onNext: () => void;
}) {
  const showOtherInput = selected.includes('Other Health Condition');

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(160deg, #090c09 0%, #0d110a 50%, #090c09 100%)' }}>
      <AmbientGlow variant="forest" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '560px', margin: '0 auto', padding: '96px 24px 0' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(175,205,180,0.58)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '11px' }}>Health Baseline</p>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '13px' }}>
            Your body.<br />Your baseline.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,248,225,0.44)', lineHeight: 1.68, marginBottom: '36px' }}>
            Do you currently have any diagnosed health conditions? Select all that apply.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {CONDITIONS.map((cond, i) => {
            const isSelected = selected.includes(cond);
            const isNone = cond === 'None';
            const selectedBorder = isNone ? 'rgba(210,168,67,0.70)' : 'rgba(122,158,130,0.70)';
            const selectedBg = isNone ? 'rgba(210,168,67,0.14)' : 'rgba(122,158,130,0.16)';
            const selectedColor = isNone ? '#D4A843' : '#B8D0BB';
            const selectedGlow = isNone ? 'rgba(210,168,67,0.20)' : 'rgba(107,143,113,0.22)';
            return (
              <motion.button
                key={cond}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.45 }}
                onClick={() => onToggle(cond)}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '13px 20px', borderRadius: '28px',
                  fontSize: '14px', fontWeight: 600,
                  border: isSelected ? `1.5px solid ${selectedBorder}` : '1.5px solid rgba(255,248,225,0.10)',
                  background: isSelected ? selectedBg : 'rgba(255,250,238,0.04)',
                  color: isSelected ? selectedColor : 'rgba(255,248,225,0.56)',
                  cursor: 'pointer', transition: 'all 0.16s ease',
                  boxShadow: isSelected ? `0 0 18px ${selectedGlow}` : 'none',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 550, damping: 20 }}>
                      <Check size={13} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {cond}
              </motion.button>
            );
          })}
        </div>

        {/* Other condition text input */}
        <AnimatePresence>
          {showOtherInput && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ background: 'rgba(255,250,238,0.05)', border: '1px solid rgba(122,158,130,0.28)', borderRadius: '14px', padding: '15px 20px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(175,205,180,0.62)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '9px' }}>
                  Please specify
                </label>
                <input
                  type="text"
                  value={otherCondition}
                  onChange={e => onOtherChange(e.target.value)}
                  placeholder="e.g. Asthma, Sleep Apnea, Arthritis…"
                  autoFocus
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CtaButton label="Continue" onClick={onNext} />
      </div>
    </div>
  );
}

// ── Screen 6 — You're All Set ─────────────────────────────────────────────────

function Screen6({ goals, onBegin }: { goals: string[]; onBegin: () => void }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#050c07' }}>

      {/* Background photo — top 55vh, fades to dark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '58vh',
          backgroundImage: `url('${PHOTO_JOURNEY}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          zIndex: 0,
        }}
      >
        {/* Graduated overlay — lighter at top, solid dark at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(4,10,5,0.42) 0%, rgba(4,10,5,0.72) 55%, rgba(4,10,5,1) 100%)',
        }} />
        {/* Warm center glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 55%, rgba(180,140,60,0.06) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* Content — floats over/below photo */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px', margin: '0 auto', padding: '88px 24px 0' }}>

        {/* Success badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.60 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.7, type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            width: '68px', height: '68px', borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(122,158,130,0.30) 0%, rgba(74,110,80,0.20) 100%)',
            border: '1.5px solid rgba(122,158,130,0.48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 0 36px rgba(107,143,113,0.25)',
          }}
        >
          <Check size={30} color="#B8D0BB" strokeWidth={2.5} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(175,205,180,0.58)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '11px' }}>You're Ready</p>
          <h2 style={{ fontSize: 'clamp(34px, 6vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '14px', textShadow: '0 2px 16px rgba(0,0,0,0.28)' }}>
            You're all set.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,248,225,0.48)', lineHeight: 1.70, marginBottom: '38px', maxWidth: '360px' }}>
            Your personalised 6-month transformation journey is ready to begin.
          </p>
        </motion.div>

        {/* Health Goals card */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              background: 'linear-gradient(148deg, rgba(122,158,130,0.12) 0%, rgba(74,110,80,0.07) 100%)',
              border: '1px solid rgba(122,158,130,0.22)',
              borderRadius: '20px', padding: '24px 26px',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(175,205,180,0.62)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Your Health Goals
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {goals.map((g, i) => (
                <motion.div
                  key={g}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.50 + 0.10 * i, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7A9E82, #4A6E50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 14px rgba(107,143,113,0.40)',
                  }}>
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,252,240,0.88)', letterSpacing: '-0.01em' }}>
                    {g}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Journey roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.60, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            background: 'rgba(255,250,238,0.03)',
            border: '1px solid rgba(255,248,225,0.07)',
            borderRadius: '20px', padding: '24px 26px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(210,168,67,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '7px' }}>
            Your 6-Month Transformation Journey
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,248,225,0.34)', lineHeight: 1.58, marginBottom: '24px' }}>
            Each month builds on the last, creating sustainable health improvements that last.
          </p>

          <div style={{ position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(107,143,113,0.30) 15%, rgba(107,143,113,0.30) 85%, transparent)', zIndex: 0 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', position: 'relative', zIndex: 1 }}>
              {JOURNEY_MONTHS.map((m, i) => (
                <motion.div
                  key={m.num}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.66 + 0.06 * i, duration: 0.45 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg, #7A9E82, #4A6E50)' : 'rgba(255,250,238,0.05)',
                    border: i === 0 ? '1.5px solid rgba(122,158,130,0.65)' : '1px solid rgba(255,248,225,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: i === 0 ? '0 0 20px rgba(107,143,113,0.50)' : 'none',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: i === 0 ? '#fff' : 'rgba(255,248,225,0.24)' }}>{m.num}</span>
                  </div>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: i === 0 ? 'rgba(185,215,190,0.85)' : 'rgba(255,248,225,0.22)', textAlign: 'center', lineHeight: 1.35, letterSpacing: '0.01em' }}>
                    {m.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Begin CTA */}
        <div style={{ paddingTop: '32px', paddingBottom: '60px' }}>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.92, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onBegin}
            whileHover={{ scale: 1.012, y: -2 }}
            whileTap={{ scale: 0.978 }}
            style={{
              width: '100%', maxWidth: '480px', padding: '19px 32px',
              background: 'linear-gradient(135deg, #7A9E82 0%, #4A6E50 100%)',
              border: 'none', borderRadius: '16px',
              color: '#fff', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 8px 36px rgba(107,143,113,0.46), 0 2px 8px rgba(0,0,0,0.24)',
            }}
          >
            Begin Month 1 <ArrowRight size={18} strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Main orchestrator ──────────────────────────────────────────────────────────

const INITIAL_USER_INFO: UserInfo = { fullName: '', dob: '', gender: '', height: '', weight: '', waist: '' };

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    step: 1, userInfo: INITIAL_USER_INFO, selectedGoals: [], supportStyle: null, selectedConditions: [], otherCondition: '',
  });

  function goTo(step: Step) {
    setState(s => ({ ...s, step }));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function toggleGoal(goal: string) {
    setState(s => {
      const next = s.selectedGoals.includes(goal)
        ? s.selectedGoals.filter(g => g !== goal)
        : s.selectedGoals.length < 3 ? [...s.selectedGoals, goal] : s.selectedGoals;
      return { ...s, selectedGoals: next };
    });
  }

  function toggleCondition(cond: string) {
    setState(s => {
      if (cond === 'None') {
        return { ...s, selectedConditions: s.selectedConditions.includes('None') ? [] : ['None'], otherCondition: '' };
      }
      const withoutNone = s.selectedConditions.filter(c => c !== 'None');
      const next = withoutNone.includes(cond)
        ? withoutNone.filter(c => c !== cond)
        : [...withoutNone, cond];
      return { ...s, selectedConditions: next };
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060b07' }}>
      <ProgressBar step={state.step} />

      {state.step > 1 && state.step < 6 && (
        <StepHeader step={state.step} onBack={() => goTo((state.step - 1) as Step)} />
      )}

      {/* Calm pure-opacity fade between screens — no lateral slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: 'easeInOut' }}
        >
          {state.step === 1 && <Screen1 onNext={() => goTo(2)} />}
          {state.step === 2 && (
            <Screen2
              data={state.userInfo}
              onChange={userInfo => setState(s => ({ ...s, userInfo }))}
              onNext={() => goTo(3)}
            />
          )}
          {state.step === 3 && (
            <Screen3
              selected={state.selectedGoals}
              onToggle={toggleGoal}
              onNext={() => goTo(4)}
            />
          )}
          {state.step === 4 && (
            <Screen4
              selected={state.supportStyle}
              onSelect={v => setState(s => ({ ...s, supportStyle: v }))}
              onNext={() => goTo(5)}
            />
          )}
          {state.step === 5 && (
            <Screen5
              selected={state.selectedConditions}
              otherCondition={state.otherCondition}
              onToggle={toggleCondition}
              onOtherChange={v => setState(s => ({ ...s, otherCondition: v }))}
              onNext={() => goTo(6)}
            />
          )}
          {state.step === 6 && (
            <Screen6
              goals={state.selectedGoals}
              onBegin={() => router.push('/today?tab=overview&state=pre_started')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
