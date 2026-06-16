'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Lock } from 'lucide-react';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_MOMENTS = [
  { id: 1,  day: 1,  label: 'Day 1',   caption: 'Beginning the journey',        src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',  coach: 'We are focusing on awareness and building sustainable foundations. Every journey starts with the courage to begin.' },
  { id: 2,  day: 7,  label: 'Day 7',   caption: 'First week complete',          src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80', coach: 'Seven days in, and already your patterns are becoming clearer. You are showing real commitment.' },
  { id: 3,  day: 14, label: 'Day 14',  caption: 'Building momentum',            src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', coach: 'Consistency is becoming your strength. Two weeks of daily choices are adding up to real change.' },
  { id: 4,  day: 21, label: 'Day 21',  caption: 'Three weeks of consistency',   src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', coach: 'The habits are beginning to feel natural. This is the point where real transformation accelerates.' },
  { id: 5,  day: 28, label: 'Day 28',  caption: 'Month 1 closing strong',       src: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80', coach: 'You have built something real here — a foundation that will support everything that comes next.' },
];

const REEL_MOMENTS = [
  { src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',  caption: 'First healthy breakfast' },
  { src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80',  caption: 'Sunday morning walk' },
  { src: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',     caption: 'Staying hydrated' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',  caption: 'Completed first week' },
  { src: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',  caption: 'First coach session' },
  { src: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400&q=80',  caption: 'Early night in' },
  { src: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',  caption: 'Morning routine set' },
];

const MILESTONES = [
  { icon: '🏆', label: 'First Week Complete',      value: '7 days',      color: 'rgba(212,168,67,0.10)',  border: 'rgba(212,168,67,0.25)',  text: '#C49A26' },
  { icon: '🔥', label: '14-Day Streak',            value: '14 days',     color: 'rgba(200,96,74,0.08)',   border: 'rgba(200,96,74,0.22)',   text: '#C8604A' },
  { icon: '⚖️', label: 'First Kilogram Lost',     value: '−1 kg',       color: 'rgba(107,143,113,0.09)', border: 'rgba(107,143,113,0.22)', text: '#4A6E50' },
  { icon: '🚶', label: '50,000 Steps Achieved',    value: '50k steps',   color: 'rgba(123,104,238,0.08)', border: 'rgba(123,104,238,0.20)', text: '#7B68EE' },
  { icon: '🥗', label: '30 Healthy Meals Logged',  value: '30 meals',    color: 'rgba(107,143,113,0.09)', border: 'rgba(107,143,113,0.22)', text: '#4A6E50' },
  { icon: '😴', label: 'Sleep Goal Reached',       value: '7.5 hrs',     color: 'rgba(90,90,180,0.08)',   border: 'rgba(90,90,180,0.20)',   text: '#5A5AB4' },
];

const CHAPTERS = [
  { month: 1, name: 'Know Your Health',         status: 'done',    summary: 'Completed assessments, baseline labs, and health risk stratification.',     achievements: ['Health assessment ✓', 'Baseline labs ✓', 'Risk profile assigned ✓'],
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80' },
  { month: 2, name: 'Build Healthy Habits',     status: 'active',  summary: 'Building nutrition consistency, daily movement, and hydration habits.',      achievements: ['14-day streak ongoing', '83% habit adherence', 'Step goal improving'],
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80' },
  { month: 3, name: 'Sleep Better, Feel Better',status: 'locked',  summary: 'Sleep optimisation, blood sugar management, and recovery protocols.',        achievements: [],
    img: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=600&q=80' },
  { month: 4, name: 'Stress Less, Feel Better', status: 'locked',  summary: 'Breathwork, mindfulness, emotional eating support, and strength progression.',achievements: [],
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
  { month: 5, name: 'Make It Stick',            status: 'locked',  summary: 'Gut health, health literacy, and relapse prevention.',                       achievements: [],
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { month: 6, name: 'Your New Normal',          status: 'locked',  summary: 'Final biomarker review, graduation planning, and lifetime wellness system.',  achievements: [],
    img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80' },
];

const JOURNEY_MAP = [
  { label: 'Started',             done: true },
  { label: 'Know Your Health',    done: true },
  { label: 'Build Healthy Habits', done: false, active: true },
  { label: 'Sleep Better',        done: false },
  { label: 'Stress Less',         done: false },
  { label: 'Your New Normal',     done: false },
];

// ─── Comparison Slider ────────────────────────────────────────────────────────

function ComparisonSlider({ height = 340 }: { height?: number }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', height: `${height}px`, borderRadius: '20px', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
      onMouseDown={() => { dragging.current = true; }}
      onMouseMove={e => { if (dragging.current) move(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={() => { dragging.current = true; }}
      onTouchMove={e => { move(e.touches[0]!.clientX); }}
      onTouchEnd={() => { dragging.current = false; }}
    >
      {/* Before — Day 1 */}
      <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80" alt="Day 1" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      <div style={{ position: 'absolute', top: '14px', left: '16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Day 1</span>
      </div>

      {/* After — Today, clipped */}
      <div style={{ position: 'absolute', inset: 0, width: `${pos}%`, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80" alt="Today" style={{ position: 'absolute', inset: 0, width: `${10000 / pos}%`, maxWidth: 'none', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', top: '14px', right: '16px', background: 'rgba(107,143,113,0.85)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 12px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Day 14</span>
        </div>
      </div>

      {/* Divider line + handle */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 12px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%,-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.25)', gap: '2px' }}>
        <ChevronLeft size={13} color="var(--color-ink)" strokeWidth={2.5} />
        <ChevronRight size={13} color="var(--color-ink)" strokeWidth={2.5} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JourneyPage() {
  const [uploads, setUploads] = useState<{ id: number; src: string; caption: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const added = Array.from(files).map(f => ({ id: nextId.current++, src: URL.createObjectURL(f), caption: 'New memory' }));
    setUploads(prev => [...prev, ...added]);
    e.target.value = '';
  };

  const deleteUpload = (id: number) => setUploads(prev => prev.filter(u => u.id !== id));
  const updateCaption = (id: number, caption: string) => setUploads(prev => prev.map(u => u.id === id ? { ...u, caption } : u));

  const totalMoments = DEMO_MOMENTS.length + REEL_MOMENTS.length + uploads.length;

  return (
    <>
      <style>{`
        /* ── Dual-render visibility ── */
        .journey-mobile-only  { display: block; }
        .journey-desktop-only { display: none;  }

        @media (min-width: 1024px) {
          .journey-mobile-only  { display: none !important; }
          .journey-desktop-only { display: block !important; }
        }

        /* ── Desktop page shell ── */
        .jdt-page {
          background: #FAFAF8;
          min-height: 100vh;
        }

        /* ── Section bands ── */
        .jdt-section {
          width: 100%;
          position: relative;
        }
        .jdt-section-surface  { background: #FAFAF8; }
        .jdt-section-white    { background: #ffffff; }
        .jdt-section-stone    { background: #F0EDE6; }
        .jdt-section-sage     { background: #EEF3EF; }
        .jdt-section-dark     { background: #0f1e12; }
        .jdt-section-darkforest { background: linear-gradient(160deg, #0d1a0f 0%, #1a2e1d 100%); }
        .jdt-section-premium  { background: linear-gradient(160deg, #090e0a 0%, #162419 40%, #0d1a0f 100%); }

        .jdt-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 72px;
        }
        .jdt-inner-pad {
          max-width: 1600px;
          margin: 0 auto;
          padding: 88px 72px;
        }

        @media (min-width: 1400px) {
          .jdt-inner, .jdt-inner-pad { padding-left: 96px; padding-right: 96px; }
          .jdt-inner-pad { padding-top: 104px; padding-bottom: 104px; }
        }

        /* ── Eyebrow label ── */
        .jdt-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .jdt-eyebrow-sage  { color: var(--color-sage); }
        .jdt-eyebrow-gold  { color: #C49A26; }
        .jdt-eyebrow-light { color: rgba(255,255,255,0.45); }
        .jdt-eyebrow-stone { color: rgba(107,143,113,0.8); }

        /* ── Section headings ── */
        .jdt-h2-dark {
          font-size: 40px;
          font-weight: 900;
          color: var(--color-ink);
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .jdt-h2-light {
          font-size: 40px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        @media (min-width: 1400px) {
          .jdt-h2-dark, .jdt-h2-light { font-size: 48px; }
        }

        /* ── Section 1: Cinematic Hero ── */
        .jdt-hero {
          position: relative;
          height: 720px;
          overflow: hidden;
        }
        @media (min-width: 1400px) { .jdt-hero { height: 780px; } }

        .jdt-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 48px;
          height: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 72px;
          align-items: flex-end;
          padding-bottom: 72px;
        }
        @media (min-width: 1400px) {
          .jdt-hero-grid { padding-left: 96px; padding-right: 96px; padding-bottom: 80px; }
        }

        /* ── Section 2: Timeline + Comparison workspace ── */
        .jdt-timeline-workspace {
          display: grid;
          grid-template-columns: 55fr 45fr;
          gap: 64px;
          align-items: flex-start;
        }
        @media (min-width: 1400px) { .jdt-timeline-workspace { gap: 80px; } }

        .jdt-timeline-sticky {
          position: sticky;
          top: 128px;
        }

        /* ── Section 3: Highlights gallery ── */
        .jdt-highlights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (min-width: 1400px) { .jdt-highlights-grid { gap: 24px; } }

        /* ── Section 4: Memories + Coach workspace ── */
        .jdt-memories-workspace {
          display: grid;
          grid-template-columns: 70fr 30fr;
          gap: 48px;
          align-items: flex-start;
        }
        @media (min-width: 1400px) { .jdt-memories-workspace { gap: 64px; } }

        .jdt-coach-sticky {
          position: sticky;
          top: 128px;
        }

        .jdt-photo-wall {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: 260px 220px;
          gap: 12px;
        }
        .jdt-photo-wall-featured {
          grid-column: 1 / 3;
          grid-row: 1 / 2;
        }

        /* ── Section 5: Chapters gallery ── */
        .jdt-chapters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (min-width: 1400px) { .jdt-chapters-grid { gap: 24px; } }

        /* ── Section 6: Roadmap ── */
        .jdt-roadmap-row {
          display: flex;
          align-items: flex-start;
          gap: 0;
          padding: 56px 0 0;
        }

        /* ── Section 7: Yearbook ── */
        .jdt-yearbook {
          position: relative;
          min-height: 700px;
          overflow: hidden;
        }
        @media (min-width: 1400px) { .jdt-yearbook { min-height: 760px; } }

        .jdt-yearbook-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          height: 100%;
          position: absolute;
          inset: 0;
        }

        .jdt-yearbook-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 700px;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 72px 80px;
        }
        @media (min-width: 1400px) {
          .jdt-yearbook-content { padding-left: 96px; padding-right: 96px; min-height: 760px; }
        }

        /* ── Hover lift on cards ── */
        .jdt-card-lift {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .jdt-card-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.14) !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          MOBILE RENDER  (< 1024px)
      ══════════════════════════════════════════ */}
      <div className="journey-mobile-only">
        <div style={{ background: '#FAFAF8', minHeight: '100vh', paddingBottom: '80px' }}>

          {/* Sticky back nav */}
          <div style={{ position: 'sticky', top: '56px', zIndex: 99, height: '56px', background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
            <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--color-sage)', minHeight: '44px', padding: '0 4px', transition: 'opacity 0.15s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Overview</span>
            </a>
          </div>

          {/* 1. CINEMATIC HERO */}
          <div style={{ position: 'relative', height: '460px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1400&q=80" alt="Transformation" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.82) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,43,30,0.45) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,197,172,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', alignSelf: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0C96A' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>Month 2 · Day 14</span>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Visual Transformation</p>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>Your Transformation<br />Story</h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, marginBottom: '16px' }}>
                  You&apos;ve documented {totalMoments} moments of your journey
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { value: '↓ 3 kg', label: 'Lost' },
                  { value: '↓ 4 cm', label: 'Waist' },
                  { value: '14 days', label: 'Streak' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#A8C5AC', lineHeight: 1, marginBottom: '2px' }}>{s.value}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>&ldquo;Every healthy choice is becoming part of a bigger story.&rdquo;</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '32px 0 0' }}>

            {/* 2. TRANSFORMATION TIMELINE */}
            <div style={{ padding: '0 24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Your Story</p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', marginBottom: '28px' }}>The Journey So Far</h2>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, var(--color-sage) 60%, var(--color-border))', zIndex: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {DEMO_MOMENTS.map((moment, i) => (
                    <motion.div key={moment.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: i < DEMO_MOMENTS.length - 1 ? '28px' : '0', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: i < 3 ? 'var(--color-sage)' : 'rgba(107,143,113,0.15)', border: i < 3 ? 'none' : '2px solid rgba(107,143,113,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i < 3 ? '0 0 0 4px rgba(107,143,113,0.12)' : 'none' }}>
                        {i < 3 ? <svg width="14" height="12" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span style={{ fontSize: '14px' }}>{['📸', '⭐'][i - 3]}</span>}
                      </div>
                      <div style={{ flex: 1, background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                        <div style={{ position: 'relative', height: '200px' }}>
                          <img src={moment.src} alt={moment.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
                          <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>{moment.label}</p>
                            <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{moment.caption}</p>
                          </div>
                        </div>
                        <div style={{ padding: '16px 18px', background: 'rgba(107,143,113,0.04)', borderTop: '1px solid rgba(107,143,113,0.1)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>👩‍⚕️</div>
                          <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.65, fontStyle: 'italic', flex: 1 }}>&ldquo;{moment.coach}&rdquo;</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. COMPARISON SLIDER */}
            <div style={{ padding: '0 24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Comparison</p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', marginBottom: '6px' }}>See The Difference</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '18px' }}>Drag to compare Day 1 with today.</p>
              <ComparisonSlider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                {[
                  { label: 'Weight',     before: '82 kg',    now: '79 kg',     arrow: '↓', color: 'var(--color-sage)' },
                  { label: 'Waist',      before: '94 cm',    now: '90 cm',     arrow: '↓', color: 'var(--color-sage)' },
                  { label: 'Energy',     before: 'Low',      now: 'Improving', arrow: '↑', color: '#C49A26' },
                  { label: 'Confidence', before: 'Starting', now: 'Growing',   arrow: '↑', color: '#C49A26' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{s.label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>{s.before}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: s.color }}>{s.arrow} {s.now}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. JOURNEY HIGHLIGHTS */}
            <div style={{ padding: '0 24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Milestones</p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', marginBottom: '18px' }}>Journey Highlights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {MILESTONES.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, duration: 0.22 }} style={{ background: m.color, border: `1px solid ${m.border}`, borderRadius: '18px', padding: '18px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '26px' }}>{m.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: m.text, letterSpacing: '-0.02em' }}>{m.value}</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.35 }}>{m.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 5. MONTHLY CHAPTERS */}
            <div>
              <div style={{ padding: '0 24px', marginBottom: '18px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Programme</p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>Your Story In Chapters</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {CHAPTERS.map((ch, i) => (
                  <div key={i} style={{ margin: '0 24px', background: ch.status === 'locked' ? 'var(--color-surface)' : '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: ch.status !== 'locked' ? '0 2px 12px rgba(0,0,0,0.06)' : 'none', marginBottom: '10px', opacity: ch.status === 'locked' ? 0.7 : 1, filter: ch.status === 'locked' ? 'grayscale(30%)' : 'none' }}>
                    <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: ch.status !== 'locked' && ch.achievements.length > 0 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '14px', flexShrink: 0, background: ch.status === 'done' ? 'var(--color-sage)' : ch.status === 'active' ? 'rgba(240,201,106,0.15)' : 'var(--color-border)', border: ch.status === 'active' ? '1.5px solid rgba(240,201,106,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ch.status === 'done' ? <svg width="16" height="12" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : ch.status === 'locked' ? <Lock size={14} color="var(--color-muted)" /> : <span style={{ fontSize: '14px' }}>🔄</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.04em' }}>Chapter {ch.month}</p>
                          {ch.status === 'done' && <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(107,143,113,0.12)', color: 'var(--color-sage)', borderRadius: '20px', padding: '1px 7px' }}>Complete</span>}
                          {ch.status === 'active' && <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(240,201,106,0.15)', color: '#C49A26', borderRadius: '20px', padding: '1px 7px' }}>In Progress</span>}
                          {ch.status === 'locked' && <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(0,0,0,0.06)', color: 'var(--color-muted)', borderRadius: '20px', padding: '1px 7px' }}>Locked</span>}
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2 }}>{ch.name}</p>
                      </div>
                    </div>
                    {ch.status !== 'locked' && (
                      <div style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: ch.achievements.length > 0 ? '12px' : '0' }}>{ch.summary}</p>
                        {ch.achievements.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {ch.achievements.map((a, j) => (
                              <span key={j} style={{ fontSize: '11px', fontWeight: 500, background: 'rgba(107,143,113,0.08)', color: 'var(--color-sage)', borderRadius: '20px', padding: '4px 11px', border: '1px solid rgba(107,143,113,0.18)' }}>{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. VISUAL MEMORIES REEL */}
            <div>
              <div style={{ padding: '0 24px', marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Moments</p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>Moments Worth Remembering</h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '4px' }}>
                {REEL_MOMENTS.map((r, i) => (
                  <div key={i} style={{ flexShrink: 0, width: '150px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', position: 'relative', cursor: 'pointer' }}>
                    <img src={r.src} alt={r.caption} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.68) 100%)' }} />
                    <p style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{r.caption}</p>
                  </div>
                ))}
                {uploads.map(u => (
                  <div key={u.id} style={{ flexShrink: 0, width: '150px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', position: 'relative' }}>
                    <img src={u.src} alt={u.caption} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.68) 100%)' }} />
                    <button onClick={() => deleteUpload(u.id)} style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} color="#fff" />
                    </button>
                    {editingId === u.id
                      ? <input autoFocus value={u.caption} onChange={e => updateCaption(u.id, e.target.value)} onBlur={() => setEditingId(null)} style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', padding: '4px 8px', color: '#fff', fontSize: '11px', fontWeight: 600 }} />
                      : <p onClick={() => setEditingId(u.id)} style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.3, cursor: 'text' }}>{u.caption}</p>}
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()} style={{ flexShrink: 0, width: '150px', height: '200px', borderRadius: '18px', border: '2px dashed rgba(107,143,113,0.35)', background: 'rgba(107,143,113,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={20} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)' }}>Add Memory</span>
                </button>
              </div>
            </div>

            {/* 7. TRANSFORMATION MAP */}
            <div style={{ padding: '0 24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Roadmap</p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', marginBottom: '24px' }}>Your Journey At A Glance</h2>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {JOURNEY_MAP.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < JOURNEY_MAP.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: step.active ? '32px' : '24px', height: step.active ? '32px' : '24px', borderRadius: '50%', background: step.done ? 'var(--color-sage)' : step.active ? 'var(--color-ink)' : 'transparent', border: !step.done && !step.active ? '1.5px solid var(--color-border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: step.active ? '0 0 0 4px rgba(28,43,30,0.1)' : 'none', transition: 'all 0.2s' }}>
                        {step.done ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span style={{ fontSize: step.active ? '10px' : '8px', fontWeight: 700, color: step.active ? '#fff' : 'var(--color-muted)' }}>{i + 1}</span>}
                      </div>
                      <span style={{ fontSize: '8px', fontWeight: step.done || step.active ? 700 : 400, color: step.done ? 'var(--color-sage)' : step.active ? 'var(--color-ink)' : 'var(--color-muted)', textAlign: 'center', lineHeight: 1.3, maxWidth: '50px' }}>{step.label}</span>
                    </div>
                    {i < JOURNEY_MAP.length - 1 && (
                      <div style={{ flex: 1, height: '2px', background: step.done ? 'var(--color-sage)' : 'var(--color-border)', margin: '12px 4px 0' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 8. COACH REFLECTION */}
            <div style={{ margin: '0 24px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(28,43,30,0.18)' }}>
              <div style={{ position: 'relative', height: '180px' }}>
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80" alt="Dr. Ananya Rao" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.65) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff' }} />
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Dr. Ananya Rao · Your Health Coach</p>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(155deg, #1C2B1E 0%, #3A5C3E 100%)', padding: '24px' }}>
                <p style={{ fontSize: '16px', color: '#fff', lineHeight: 1.75, fontStyle: 'italic', fontWeight: 400, marginBottom: '20px' }}>
                  &ldquo;Transformation rarely happens all at once. It happens through hundreds of small decisions. Looking back at your journey, you should be proud of how far you&apos;ve already come.&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>👩‍⚕️</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Dr. Ananya Rao</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>Health Coach · VitalPath</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. YEARBOOK FINALE */}
            <div style={{ margin: '0 24px' }}>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '120px 120px', gap: '2px' }}>
                  {[
                    { src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', span: '1 / 2 / 3 / 3' },
                    { src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80', span: 'auto' },
                    { src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80', span: 'auto' },
                    { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', span: 'auto' },
                    { src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', span: 'auto' },
                  ].map((img, i) => (
                    <img key={i} src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', gridArea: img.span !== 'auto' ? img.span : undefined }} />
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.72) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Your Story</p>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>Look How Far You&apos;ve Come</h2>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[`${totalMoments} moments captured`, '14 day streak', '3 kg lost', 'Month 2 of 6'].map((t, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Floating Add Memory FAB */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 150 }}>
            <motion.button onClick={() => fileRef.current?.click()} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} title="Add Memory" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(107,143,113,0.4)' }}>
              <Plus size={22} color="#fff" strokeWidth={2.5} />
            </motion.button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP RENDER  (1024px+)
      ══════════════════════════════════════════ */}
      <div className="journey-desktop-only jdt-page">

        {/* Sticky back nav */}
        <div style={{ position: 'sticky', top: '56px', zIndex: 99, height: '56px', background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 72px' }}>
          <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--color-sage)', minHeight: '44px', padding: '0 4px', transition: 'opacity 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Overview</span>
          </a>
        </div>

        {/* ────────────────────────────────────────
            ACT 1 — YOUR STORY
        ──────────────────────────────────────── */}

        {/* SECTION 1 — CINEMATIC HERO */}
        <div className="jdt-section jdt-hero">
          {/* Background photo */}
          <img
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1800&q=85"
            alt="Transformation"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          {/* Gradient layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.78) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(12,24,14,0.65) 0%, transparent 55%)' }} />
          {/* Ambient glows */}
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: '15%', left: '8%', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 70%)', pointerEvents: 'none' }}
          />
          <motion.div
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            style={{ position: 'absolute', top: '20%', right: '20%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}
          />

          {/* 70 / 30 grid */}
          <div className="jdt-hero-grid">
            {/* LEFT — editorial copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Chapter pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '6px 16px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.1)' }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F0C96A', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>Month 2 · Day 14 · Build Healthy Habits</span>
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>Your Personal Documentary</p>
                <h1 style={{ fontSize: '68px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '18px', textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
                  Your<br />Transformation<br />Story
                </h1>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '520px' }}>
                  You&apos;ve documented <strong style={{ color: '#A8C5AC' }}>{totalMoments} moments</strong> of courage, consistency, and change. This is your story.
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { value: '↓ 3 kg',   label: 'Weight lost',       accent: '#A8C5AC' },
                  { value: '↓ 4 cm',   label: 'Waist reduced',     accent: '#A8C5AC' },
                  { value: '14 days',  label: 'Habit streak',       accent: '#F0C96A' },
                  { value: '23%',      label: 'Programme complete', accent: '#C8AFF0' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '14px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: s.accent, lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>{s.value}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', fontStyle: 'italic', letterSpacing: '0.01em' }}>
                &ldquo;Every healthy choice is becoming part of a bigger story.&rdquo;
              </p>
            </div>

            {/* RIGHT — glassmorphism progress card */}
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.12)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              {/* Header */}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Your Progress</p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Month 2<br /><span style={{ color: '#A8C5AC' }}>of 6</span></p>
              </div>

              {/* Programme ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <motion.circle
                      cx="40" cy="40" r="34"
                      fill="none" stroke="#A8C5AC" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.23) }}
                      transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>23%</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Programme complete</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>42 of 180 days<br />5 months remaining</p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              {/* Stats list */}
              {[
                { label: 'Days completed',   value: '42',          accent: '#A8C5AC' },
                { label: 'Current streak',    value: '14 days',     accent: '#F0C96A' },
                { label: 'Current chapter',   value: 'Build Habits', accent: '#fff' },
                { label: 'Next milestone',    value: 'Day 30',       accent: 'rgba(255,255,255,0.55)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: item.accent }}>{item.value}</span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              {/* Ambient glow pulse inside card */}
              <motion.div
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: '20px', right: '20px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}
              />

              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', lineHeight: 1.6 }}>
                &ldquo;You are on track. Keep building.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            ACT 1 CONT. — THE JOURNEY SO FAR
            Section 2 — Timeline + Comparison
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-section-surface">
          <div className="jdt-inner-pad">
            <div style={{ marginBottom: '56px' }}>
              <p className="jdt-eyebrow jdt-eyebrow-sage">Act I · Your Story</p>
              <h2 className="jdt-h2-dark">The Journey So Far</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginTop: '12px', maxWidth: '480px' }}>Every milestone. Every moment. Documented.</p>
            </div>

            <div className="jdt-timeline-workspace">
              {/* LEFT — Transformation Timeline */}
              <div>
                <div style={{ position: 'relative' }}>
                  {/* Vertical spine */}
                  <div style={{ position: 'absolute', left: '23px', top: '16px', bottom: '16px', width: '2px', background: 'linear-gradient(to bottom, var(--color-sage) 55%, rgba(107,143,113,0.2) 100%)', zIndex: 0, borderRadius: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {DEMO_MOMENTS.map((moment, i) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.35 }}
                        style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', paddingBottom: i < DEMO_MOMENTS.length - 1 ? '32px' : '0', position: 'relative', zIndex: 1 }}
                      >
                        {/* Node */}
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: i < 3 ? 'linear-gradient(135deg, var(--color-sage), var(--color-sage-dark))' : 'rgba(107,143,113,0.12)', border: i < 3 ? 'none' : '2px solid rgba(107,143,113,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i < 3 ? '0 0 0 5px rgba(107,143,113,0.10), 0 4px 16px rgba(107,143,113,0.25)' : 'none' }}>
                          {i < 3
                            ? <svg width="16" height="13" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : <span style={{ fontSize: '16px' }}>{['📸', '⭐'][i - 3]}</span>}
                        </div>
                        {/* Card */}
                        <div className="jdt-card-lift" style={{ flex: 1, background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                          <div style={{ position: 'relative', height: '240px' }}>
                            <img src={moment.src} alt={moment.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.65) 100%)' }} />
                            <div style={{ position: 'absolute', bottom: '18px', left: '20px' }}>
                              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{moment.label}</p>
                              <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{moment.caption}</p>
                            </div>
                          </div>
                          <div style={{ padding: '20px 22px', background: 'rgba(107,143,113,0.03)', borderTop: '1px solid rgba(107,143,113,0.08)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>👩‍⚕️</div>
                            <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>&ldquo;{moment.coach}&rdquo;</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — Comparison Slider (sticky) */}
              <div className="jdt-timeline-sticky">
                <p className="jdt-eyebrow jdt-eyebrow-sage" style={{ marginBottom: '10px' }}>Visual Proof</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: '8px' }}>See The Difference</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px', lineHeight: 1.6 }}>Drag to compare Day 1 with where you are today.</p>

                <ComparisonSlider height={420} />

                {/* Stats below slider */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  {[
                    { label: 'Weight',     before: '82 kg',    now: '79 kg',     arrow: '↓', color: 'var(--color-sage)' },
                    { label: 'Waist',      before: '94 cm',    now: '90 cm',     arrow: '↓', color: 'var(--color-sage)' },
                    { label: 'Energy',     before: 'Low',      now: 'Improving', arrow: '↑', color: '#C49A26' },
                    { label: 'Confidence', before: 'Starting', now: 'Growing',   arrow: '↑', color: '#C49A26' },
                  ].map((s, i) => (
                    <div key={i} className="jdt-card-lift" style={{ background: '#fff', borderRadius: '18px', padding: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{s.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>{s.before}</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.arrow} {s.now}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            ACT 2 — YOUR TRANSFORMATION
            Section 3 — Journey Highlights
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-section-stone">
          <div className="jdt-inner-pad">
            <div style={{ marginBottom: '56px' }}>
              <p className="jdt-eyebrow jdt-eyebrow-sage">Act II · Your Transformation</p>
              <h2 className="jdt-h2-dark">Journey Highlights</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginTop: '12px', maxWidth: '480px' }}>The achievements that mark your progress. Each one earned.</p>
            </div>

            <div className="jdt-highlights-grid">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.32 }}
                  className="jdt-card-lift"
                  style={{ background: '#fff', border: `1px solid ${m.border}`, borderRadius: '24px', padding: '32px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}
                >
                  {/* Tinted bg wash */}
                  <div style={{ position: 'absolute', inset: 0, background: m.color, pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: m.color, border: `1.5px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: `0 4px 16px ${m.border}` }}>
                      <span style={{ fontSize: '32px' }}>{m.icon}</span>
                    </div>
                    {/* Value */}
                    <p style={{ fontSize: '40px', fontWeight: 900, color: m.text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '10px' }}>{m.value}</p>
                    {/* Label */}
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.35 }}>{m.label}</p>
                    <div style={{ marginTop: '20px', height: '3px', borderRadius: '2px', background: m.border, width: '48px' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            ACT 2 CONT.
            Section 4 — Visual Memories + Coach
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-section-sage">
          <div className="jdt-inner-pad">
            <div style={{ marginBottom: '56px' }}>
              <p className="jdt-eyebrow jdt-eyebrow-sage">Moments &amp; Reflections</p>
              <h2 className="jdt-h2-dark">Moments Worth Remembering</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginTop: '12px', maxWidth: '500px' }}>Your journey, captured. Every photo tells a chapter of your story.</p>
            </div>

            <div className="jdt-memories-workspace">
              {/* LEFT — Photo wall + upload */}
              <div>
                {/* Photo wall grid */}
                <div className="jdt-photo-wall">
                  {/* Featured large photo */}
                  <div className="jdt-photo-wall-featured" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }}>
                    <img src={REEL_MOMENTS[0]!.src} alt={REEL_MOMENTS[0]!.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                    <p style={{ position: 'absolute', bottom: '16px', left: '18px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{REEL_MOMENTS[0]!.caption}</p>
                  </div>
                  {/* Remaining photos */}
                  {REEL_MOMENTS.slice(1, 5).map((r, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}>
                      <img src={r.src} alt={r.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.62) 100%)' }} />
                      <p style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{r.caption}</p>
                    </div>
                  ))}
                </div>

                {/* Upload row + user photos */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {uploads.map(u => (
                    <div key={u.id} style={{ width: '140px', height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <img src={u.src} alt={u.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
                      <button onClick={() => deleteUpload(u.id)} style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} color="#fff" />
                      </button>
                      {editingId === u.id
                        ? <input autoFocus value={u.caption} onChange={e => updateCaption(u.id, e.target.value)} onBlur={() => setEditingId(null)} style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', padding: '4px 8px', color: '#fff', fontSize: '11px', fontWeight: 600 }} />
                        : <p onClick={() => setEditingId(u.id)} style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1.3, cursor: 'text' }}>{u.caption}</p>}
                    </div>
                  ))}

                  {/* Add memory button */}
                  <button onClick={() => fileRef.current?.click()} style={{ width: '140px', height: '140px', borderRadius: '16px', border: '2px dashed rgba(107,143,113,0.4)', background: 'rgba(107,143,113,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,143,113,0.10)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,143,113,0.05)'; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={20} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-sage)' }}>Add Memory</span>
                  </button>
                </div>
              </div>

              {/* RIGHT — Coach Reflection (sticky) */}
              <div className="jdt-coach-sticky">
                <div style={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '0 16px 56px rgba(28,43,30,0.22)' }}>
                  {/* Coach photo */}
                  <div style={{ position: 'relative', height: '220px' }}>
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80" alt="Dr. Ananya Rao" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 25%, rgba(0,0,0,0.72) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '18px', left: '22px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff', flexShrink: 0 }} />
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Dr. Ananya Rao · Your Health Coach</p>
                    </div>
                  </div>

                  {/* Quote body */}
                  <div style={{ background: 'linear-gradient(160deg, #1a2e1d 0%, #0f1e12 100%)', padding: '32px 28px' }}>
                    {/* Large quote mark */}
                    <div style={{ fontSize: '72px', lineHeight: 0.7, color: 'rgba(107,143,113,0.35)', fontFamily: 'Georgia, serif', marginBottom: '16px', userSelect: 'none' }}>&ldquo;</div>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, fontStyle: 'italic', fontWeight: 400, marginBottom: '28px' }}>
                      Transformation rarely happens all at once. It happens through hundreds of small decisions. Looking back at your journey, you should be proud of how far you&apos;ve already come.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4A6E50, #A8C5AC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '17px' }}>👩‍⚕️</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Dr. Ananya Rao</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Health Coach · VitalPath</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remaining reel photos */}
                {REEL_MOMENTS.slice(5).map((r, i) => (
                  <div key={i} style={{ marginTop: '12px', borderRadius: '18px', overflow: 'hidden', position: 'relative', height: '140px' }}>
                    <img src={r.src} alt={r.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                    <p style={{ position: 'absolute', bottom: '12px', left: '14px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{r.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            ACT 3 — YOUR JOURNEY
            Section 5 — Monthly Chapters
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-section-darkforest">
          <div className="jdt-inner-pad">
            <div style={{ marginBottom: '56px' }}>
              <p className="jdt-eyebrow jdt-eyebrow-light">Act III · Your Journey</p>
              <h2 className="jdt-h2-light">Your Story In Chapters</h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '12px', maxWidth: '480px' }}>Six chapters. One transformation. This is how the story unfolds.</p>
            </div>

            <div className="jdt-chapters-grid">
              {CHAPTERS.map((ch, i) => {
                const isExpanded = expandedChapter === i;
                const isLocked = ch.status === 'locked';
                return (
                  <div
                    key={i}
                    className="jdt-card-lift"
                    onClick={() => setExpandedChapter(isExpanded ? null : i)}
                    style={{ borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: isLocked ? '1px solid rgba(255,255,255,0.06)' : ch.status === 'active' ? '1.5px solid rgba(240,201,106,0.3)' : '1.5px solid rgba(107,143,113,0.3)', boxShadow: isLocked ? 'none' : ch.status === 'active' ? '0 8px 32px rgba(240,201,106,0.08)' : '0 8px 32px rgba(107,143,113,0.08)', opacity: isLocked ? 0.72 : 1, filter: isLocked ? 'grayscale(35%)' : 'none', transition: 'all 0.2s ease', position: 'relative' }}
                  >
                    {/* Chapter cover image */}
                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                      <img src={ch.img} alt={ch.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block', transition: 'transform 0.5s ease', transform: isExpanded ? 'scale(1.04)' : 'scale(1)' }} />
                      {/* Cinematic overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: isLocked ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.72) 100%)' : 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }} />
                      {/* Status badge */}
                      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                        {ch.status === 'done' && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(107,143,113,0.9)', color: '#fff', borderRadius: '20px', padding: '3px 10px', backdropFilter: 'blur(6px)' }}>✓ Complete</span>
                        )}
                        {ch.status === 'active' && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(212,168,67,0.9)', color: '#fff', borderRadius: '20px', padding: '3px 10px', backdropFilter: 'blur(6px)' }}>● In Progress</span>
                        )}
                        {isLocked && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)', borderRadius: '20px', padding: '3px 10px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={9} /> Locked
                          </span>
                        )}
                      </div>
                      {/* Chapter info */}
                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Chapter {ch.month}</p>
                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{ch.name}</p>
                      </div>
                    </div>

                    {/* Chapter body */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px 18px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: ch.achievements.length > 0 ? '16px' : '0' }}>{ch.summary}</p>

                      <AnimatePresence>
                        {(isExpanded || ch.status !== 'locked') && ch.achievements.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {ch.achievements.map((a, j) => (
                                <span key={j} style={{ fontSize: '11px', fontWeight: 500, background: 'rgba(107,143,113,0.15)', color: '#A8C5AC', borderRadius: '20px', padding: '4px 12px', border: '1px solid rgba(107,143,113,0.25)' }}>{a}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expand hint */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                          {isExpanded ? '↑ Less' : '↓ More'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            Section 6 — Transformation Roadmap
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-section-white">
          <div className="jdt-inner-pad">
            <div style={{ marginBottom: '16px' }}>
              <p className="jdt-eyebrow jdt-eyebrow-sage">Roadmap</p>
              <h2 className="jdt-h2-dark">Your Journey At A Glance</h2>
              <p style={{ fontSize: '16px', color: 'var(--color-muted)', marginTop: '12px' }}>From where you began to where you&apos;re going.</p>
            </div>

            <div className="jdt-roadmap-row">
              {JOURNEY_MAP.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < JOURNEY_MAP.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    {/* Node */}
                    <div style={{ position: 'relative' }}>
                      {step.active && (
                        <motion.div
                          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                          style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', background: 'rgba(28,43,30,0.15)' }}
                        />
                      )}
                      <div style={{ width: step.active ? '56px' : step.done ? '44px' : '36px', height: step.active ? '56px' : step.done ? '44px' : '36px', borderRadius: '50%', background: step.done ? 'linear-gradient(135deg, var(--color-sage), var(--color-sage-dark))' : step.active ? 'var(--color-ink)' : 'transparent', border: !step.done && !step.active ? '2px solid var(--color-border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: step.done ? '0 4px 16px rgba(107,143,113,0.3)' : step.active ? '0 4px 20px rgba(28,43,30,0.25)' : 'none', transition: 'all 0.2s' }}>
                        {step.done
                          ? <svg width="16" height="13" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <span style={{ fontSize: step.active ? '13px' : '11px', fontWeight: 700, color: step.active ? '#fff' : 'var(--color-muted)' }}>{i + 1}</span>}
                      </div>
                    </div>
                    {/* Label */}
                    <span style={{ fontSize: '13px', fontWeight: step.done || step.active ? 700 : 400, color: step.done ? 'var(--color-sage)' : step.active ? 'var(--color-ink)' : 'var(--color-muted)', textAlign: 'center', lineHeight: 1.35, maxWidth: '88px' }}>{step.label}</span>
                    {step.active && (
                      <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(28,43,30,0.08)', color: 'var(--color-ink)', borderRadius: '20px', padding: '3px 10px', letterSpacing: '0.04em' }}>NOW</span>
                    )}
                  </div>
                  {i < JOURNEY_MAP.length - 1 && (
                    <div style={{ flex: 1, height: '3px', background: step.done ? 'linear-gradient(to right, var(--color-sage), var(--color-sage-dark))' : 'var(--color-border)', margin: step.active ? '26px 12px 0' : step.done ? '20px 12px 0' : '16px 12px 0', borderRadius: '2px', transition: 'background 0.3s' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────
            ACT 4 — YOUR FUTURE
            Section 7 — Yearbook Finale
        ──────────────────────────────────────── */}
        <div className="jdt-section jdt-yearbook">
          {/* Full-bleed photo collage */}
          <div className="jdt-yearbook-grid">
            {[
              { src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',   style: { gridColumn: '1', gridRow: '1 / 3' } },
              { src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80', style: { gridColumn: '2', gridRow: '1' } },
              { src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80', style: { gridColumn: '3', gridRow: '1' } },
              { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', style: { gridColumn: '2', gridRow: '2' } },
              { src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80', style: { gridColumn: '3', gridRow: '2' } },
            ].map((img, i) => (
              <img key={i} src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...img.style }} />
            ))}
          </div>

          {/* Gradient overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,10,5,0.15) 0%, rgba(4,10,5,0.55) 50%, rgba(4,10,5,0.90) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(8,20,10,0.6) 0%, transparent 50%)' }} />
          {/* Ambient glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: '10%', left: '15%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}
          />

          {/* Content */}
          <div className="jdt-yearbook-content">
            <p className="jdt-eyebrow jdt-eyebrow-light" style={{ marginBottom: '16px' }}>Act IV · Your Future</p>
            <h2 style={{ fontSize: '72px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '20px', textShadow: '0 4px 40px rgba(0,0,0,0.5)', maxWidth: '720px' }}>
              Look How Far<br />You&apos;ve Come
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', lineHeight: 1.65, maxWidth: '560px' }}>
              {totalMoments} moments documented. A foundation built. The next four chapters of your transformation story are waiting.
            </p>

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
              {[
                { value: `${totalMoments}`,  label: 'moments captured', accent: '#A8C5AC' },
                { value: '14',               label: 'day streak',        accent: '#F0C96A' },
                { value: '3 kg',             label: 'weight lost',       accent: '#A8C5AC' },
                { value: 'Month 2',          label: 'of 6',              accent: 'rgba(255,255,255,0.65)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '14px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: s.accent, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.03em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-sage)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(107,143,113,0.4)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 36px rgba(107,143,113,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(107,143,113,0.4)'; }}
              >
                <Plus size={18} strokeWidth={2.5} />
                Add a Memory
              </button>
              <a
                href="/today"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '16px 28px', fontSize: '15px', fontWeight: 600, backdropFilter: 'blur(8px)', transition: 'background 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.10)'; }}
              >
                Continue Your Journey →
              </a>
            </div>
          </div>
        </div>

        {/* Floating Add Memory FAB */}
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 150 }}>
          <motion.button
            onClick={() => fileRef.current?.click()}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            title="Add Memory"
            style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 24px rgba(107,143,113,0.45)' }}
          >
            <Plus size={24} color="#fff" strokeWidth={2.5} />
          </motion.button>
        </div>

      </div>

      {/* Shared hidden file input — used by both renders */}
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

    </>
  );
}
