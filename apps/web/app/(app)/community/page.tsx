'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type FilterType = 'All' | 'Month 1' | 'Month 2' | 'Month 3+' | 'Similar to me';

interface Story {
  id: number;
  name: string;
  month: number;
  monthLabel: string;
  img: string;
  headline: string;
  stats: string;
  body: string;
}

const STORIES: Story[] = [
  {
    id: 1,
    name: 'Meera S.',
    month: 3,
    monthLabel: 'Month 3 ✓',
    img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    headline: 'Lost 4kg and reversed pre-diabetes in 3 months',
    stats: '−4 kg  ·  −5 cm  ·  HbA1c: 5.6',
    body: 'I joined VitalPath after my doctor flagged elevated blood sugar. In three months of following the Indian Plate Model and hitting 8,000 steps daily, my HbA1c dropped from 6.1 to 5.6. The programme taught me that small, consistent changes — not crash diets — are what actually work. I feel like I have my energy back.',
  },
  {
    id: 2,
    name: 'Rajesh K.',
    month: 6,
    monthLabel: 'Month 6 ✓',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    headline: 'Completed the full 6 months — here\'s what changed',
    stats: '−8 kg  ·  BP 120/80  ·  off medication',
    body: 'Six months ago I was on blood pressure medication and felt exhausted by 3pm every day. Today I\'m off medication, down 8kg, and my doctor called my latest lab results "remarkable". The breathing exercises and sleep protocol were the biggest game changers for me — things I never expected to make a difference.',
  },
  {
    id: 3,
    name: 'Sunita P.',
    month: 2,
    monthLabel: 'Month 2 ✓',
    img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    headline: 'Two weeks in and already sleeping better',
    stats: '+1.2 hrs sleep  ·  7,000 steps streak',
    body: 'I was skeptical at first — how much could really change in two weeks? But cutting out the late-night screen time and walking after dinner has transformed my sleep. I\'m now getting a consistent 7.5 hours and waking up without an alarm. The step streak is also keeping me motivated in a way I didn\'t expect.',
  },
  {
    id: 4,
    name: 'Arjun M.',
    month: 4,
    monthLabel: 'Month 4 ✓',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    headline: 'Breathwork changed how I handle work stress',
    stats: 'Stress score −40%  ·  no emotional eating',
    body: 'As a startup founder, stress eating was a real problem for me. The breathwork protocol in Month 4 seemed almost too simple — just 5 minutes of box breathing before meals. But over four weeks, my relationship with food completely changed. I\'m making decisions from hunger, not anxiety. My team says I seem calmer too.',
  },
  {
    id: 5,
    name: 'Preethi R.',
    month: 5,
    monthLabel: 'Month 5 ✓',
    img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    headline: 'I now read nutrition labels without thinking',
    stats: '90% meal adherence  ·  self-managing',
    body: 'Month 5 is when it all clicked for me. The health literacy module taught me to decode nutrition labels in seconds and the habit stacking technique made healthy choices automatic. I went from checking with my coach on every meal decision to feeling genuinely confident in my own choices. The programme is working.',
  },
  {
    id: 6,
    name: 'Vikram D.',
    month: 6,
    monthLabel: 'Month 6 ✓',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    headline: 'Before/after: 6 months of Foundation to Performance',
    stats: '−10 kg  ·  −8 cm waist  ·  FBG normal',
    body: 'My before photo was taken on Day 1 feeling hopeless about my health. My after photo was taken on Day 180 feeling genuinely proud. The metabolic correction in Month 3 was the turning point — once my sleep and glucose stabilised, everything else accelerated. If you\'re in Month 2 reading this: keep going. It compounds.',
  },
];

/* ── Desktop-only story card for the 3-column gallery ── */
function DesktopStoryCard({ story, expanded, onToggle }: { story: Story; expanded: boolean; onToggle: () => void }) {
  const monthColour = story.month >= 6 ? '#D4A843'
    : story.month >= 3 ? '#6B8F71'
    : '#4A90D9';
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        border: expanded ? '1.5px solid var(--color-sage)' : '1px solid var(--color-border)',
        boxShadow: expanded ? '0 8px 40px rgba(107,143,113,0.12)' : '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = expanded ? '0 8px 40px rgba(107,143,113,0.12)' : '0 2px 12px rgba(0,0,0,0.05)'; }}
    >
      {/* Image */}
      <div style={{ height: '240px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
          onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ''}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)', pointerEvents: 'none' }} />
        {/* Month badge */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', background: monthColour, borderRadius: '20px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{story.monthLabel}</span>
        </div>
        {/* Name at bottom of image */}
        <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{story.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>{story.stats}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.35, letterSpacing: '-0.01em', marginBottom: '12px' }}>
          {story.headline}
        </p>

        {/* Expanded: mini case study */}
        {expanded && (
          <div style={{ marginBottom: '16px' }}>
            {/* Quote pull */}
            <div style={{ borderLeft: '3px solid var(--color-sage)', paddingLeft: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--color-ink)', lineHeight: 1.7, margin: 0 }}>
                &ldquo;{story.body}&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {story.stats.split('·').map((s, i) => (
                <span key={i} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', background: 'rgba(107,143,113,0.08)', borderRadius: '20px', padding: '4px 10px', whiteSpace: 'nowrap' as const }}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-sage)', fontSize: '13px', fontWeight: 700, marginTop: 'auto' }}
        >
          {expanded ? 'Close story ↑' : 'Read story →'}
        </button>
      </div>
    </div>
  );
}

function StoryCard({ story, expanded, onToggle }: { story: Story; expanded: boolean; onToggle: () => void }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <img
          src={story.img}
          alt={story.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{story.name}</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#16A34A',
            background: '#DCFCE7',
            borderRadius: '20px',
            padding: '2px 8px',
          }}>
            {story.monthLabel}
          </span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.4, marginBottom: '6px' }}>
          {story.headline}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '12px' }}>
          {story.stats}
        </p>

        {expanded && (
          <p style={{
            fontSize: '13px',
            color: 'var(--color-ink)',
            lineHeight: 1.6,
            marginBottom: '12px',
            padding: '12px',
            background: '#FAFAF8',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}>
            {story.body}
          </p>
        )}

        <button
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--color-sage)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {expanded ? 'Close story ↑' : 'Read story →'}
        </button>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const filters: FilterType[] = ['All', 'Month 1', 'Month 2', 'Month 3+', 'Similar to me'];

  const filteredStories = STORIES.filter(story => {
    if (activeFilter === 'All' || activeFilter === 'Similar to me') return true;
    if (activeFilter === 'Month 1') return story.month === 1;
    if (activeFilter === 'Month 2') return story.month === 2;
    if (activeFilter === 'Month 3+') return story.month >= 3;
    return true;
  });

  const featured = STORIES[1]!; // Rajesh K. — strongest transformation

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        .community-mobile-only { display: block; }
        .community-desktop-only { display: none; }
        @media (min-width: 1024px) {
          .community-mobile-only { display: none !important; }
          .community-desktop-only { display: block !important; }
        }
        .cm-inner { max-width: 1600px; margin: 0 auto; padding: 0 64px; }
        .cm-inner-pad { max-width: 1600px; margin: 0 auto; padding: 72px 64px; }
        .cm-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .cm-65-35 { display: grid; grid-template-columns: 65fr 35fr; gap: 56px; align-items: start; }
        .cm-card-base { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .cm-card-base:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important; }
      `}</style>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <div className="community-desktop-only">

        {/* ── Sticky back nav ── */}
        <div style={{
          position: 'sticky', top: '56px', zIndex: 99, height: '56px',
          background: 'rgba(13,26,16,0.92)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', padding: '0 64px',
        }}>
          <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'rgba(160,205,168,0.85)', minHeight: '44px', fontSize: '14px', fontWeight: 600, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.65'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          >
            <ChevronLeft size={17} strokeWidth={2.5} />
            Overview
          </a>
        </div>

        {/* ── ACT 1: COMMUNITY HERO ── dark cinematic */}
        <div style={{ background: 'linear-gradient(155deg, #0d1a10 0%, #162212 55%, #0c1318 100%)', minHeight: '600px', display: 'flex', alignItems: 'flex-end', position: 'relative', overflow: 'hidden' }}>
          {/* Glows */}
          <div style={{ position: 'absolute', top: '-40px', right: '10%', width: '320px', height: '260px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '8%', width: '260px', height: '200px', background: 'radial-gradient(ellipse, rgba(195,163,96,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20%', left: '40%', width: '200px', height: '160px', background: 'radial-gradient(ellipse, rgba(100,80,190,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="cm-inner-pad" style={{ width: '100%', paddingTop: '80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'end' }}>
              {/* Left — headline */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.28)', borderRadius: '20px', padding: '6px 14px', marginBottom: '28px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(160,205,168,0.85)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Your Programme Cohort</span>
                </div>
                <h1 style={{ fontSize: '60px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 0.98, marginBottom: '24px' }}>
                  People like you<br />
                  <span style={{ color: 'rgba(160,205,168,0.82)' }}>are succeeding.</span>
                </h1>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, maxWidth: '480px', marginBottom: '40px' }}>
                  847 members have walked this same programme. Every story below is a real person who felt exactly where you are now.
                </p>
                {/* Filter row inside hero */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Filter by stage</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                    {filters.map(f => {
                      const isA = f === activeFilter;
                      return (
                        <button key={f} onClick={() => setActiveFilter(f)} style={{
                          padding: '10px 20px', borderRadius: '24px',
                          border: `1.5px solid ${isA ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                          background: isA ? '#fff' : 'rgba(255,255,255,0.07)',
                          color: isA ? 'var(--color-ink)' : 'rgba(255,255,255,0.75)',
                          fontSize: '13px', fontWeight: isA ? 700 : 400,
                          cursor: 'pointer', whiteSpace: 'nowrap' as const,
                          transition: 'all 0.15s',
                        }}>
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right — impact stats */}
              <div style={{ paddingBottom: '4px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '32px' }}>Community Impact</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {[
                    { stat: '847', label: 'Members in your cohort', sub: 'Currently active on the programme' },
                    { stat: '94%', label: 'Report meaningful improvement', sub: 'Across all tracked biomarkers' },
                    { stat: '6 months', label: 'Full programme span', sub: 'From baseline to peak performance' },
                  ].map(s => (
                    <div key={s.stat} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <p style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, minWidth: '90px' }}>{s.stat}</p>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.82)', marginBottom: '3px' }}>{s.label}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACT 2: FEATURED TRANSFORMATION ── warm stone */}
        <div style={{ background: '#F0EDE6' }}>
          <div className="cm-inner-pad">
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Featured Transformation</p>
              <h2 style={{ fontSize: '40px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', margin: 0 }}>Member Story</h2>
            </div>
            <div className="cm-65-35">
              {/* Left — cinematic story */}
              <div>
                <div className="cm-card-base" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                  {/* Image */}
                  <div style={{ height: '420px', position: 'relative', overflow: 'hidden' }}>
                    <img src={featured.img} alt={featured.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#D4A843', borderRadius: '20px', padding: '5px 12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{featured.monthLabel}</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{featured.name}</p>
                      <p style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{featured.headline}</p>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ background: '#fff', padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const, marginBottom: '24px' }}>
                      {featured.stats.split('·').map((s, i) => (
                        <span key={i} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage)', background: 'rgba(107,143,113,0.08)', borderRadius: '20px', padding: '5px 12px' }}>{s.trim()}</span>
                      ))}
                    </div>
                    {expandedStory === featured.id ? (
                      <div>
                        <div style={{ borderLeft: '3px solid var(--color-sage)', paddingLeft: '20px', marginBottom: '20px' }}>
                          <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'var(--color-ink)', lineHeight: 1.75 }}>&ldquo;{featured.body}&rdquo;</p>
                        </div>
                        <button onClick={() => setExpandedStory(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-sage)', fontSize: '13px', fontWeight: 700 }}>
                          Close story ↑
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setExpandedStory(featured.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', background: 'var(--color-ink)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                      >
                        Read Full Story <ChevronRight size={15} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — sticky supporting panel */}
              <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Quote card */}
                <div style={{ background: 'linear-gradient(145deg, #1a2e1c 0%, #243824 100%)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(107,143,113,0.2)' }}>
                  <div style={{ width: '40px', height: '28px', marginBottom: '16px' }}>
                    <svg viewBox="0 0 40 28" fill="none" style={{ width: '100%', height: '100%' }}>
                      <text x="0" y="28" fontSize="40" fontWeight="900" fill="rgba(160,205,168,0.25)">&ldquo;</text>
                    </svg>
                  </div>
                  <p style={{ fontSize: '16px', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: '20px' }}>
                    &ldquo;The breathing exercises and sleep protocol were the biggest game changers — things I never expected to make a difference.&rdquo;
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(160,205,168,0.6)' }}>— {featured.name}</p>
                </div>

                {/* Journey summary */}
                <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Journey Summary</p>
                  {[
                    { label: 'Duration', value: '6 months complete' },
                    { label: 'Weight lost', value: '8 kg' },
                    { label: 'Key result', value: 'Off medication' },
                    { label: 'Blood pressure', value: '120/80 mmHg' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACT 3: MEMBER SUCCESS GALLERY ── white editorial */}
        <div style={{ background: '#fff' }}>
          <div className="cm-inner-pad">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
                  {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                  {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
                </p>
                <h2 style={{ fontSize: '40px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', margin: 0 }}>Member Success Stories</h2>
              </div>
              {/* Inline filter chips */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {filters.map(f => {
                  const isA = f === activeFilter;
                  return (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{
                      padding: '8px 16px', borderRadius: '20px',
                      border: `1.5px solid ${isA ? 'var(--color-ink)' : 'var(--color-border)'}`,
                      background: isA ? 'var(--color-ink)' : '#fff',
                      color: isA ? '#fff' : 'var(--color-ink)',
                      fontSize: '12px', fontWeight: isA ? 700 : 400,
                      cursor: 'pointer', whiteSpace: 'nowrap' as const, transition: 'all 0.15s',
                    }}>
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredStories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
                <p style={{ fontSize: '18px', fontWeight: 600 }}>No stories match this filter yet.</p>
              </div>
            ) : (
              <div className="cm-3col">
                {filteredStories.map(story => (
                  <DesktopStoryCard
                    key={story.id}
                    story={story}
                    expanded={expandedStory === story.id}
                    onToggle={() => setExpandedStory(prev => prev === story.id ? null : story.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ACT 4: YOU ARE NOT ALONE ── dark inspirational finale */}
        <div style={{ background: 'linear-gradient(155deg, #0d1a10 0%, #111e18 55%, #0c1218 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', left: '25%', width: '300px', height: '240px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '20%', width: '240px', height: '190px', background: 'radial-gradient(ellipse, rgba(195,163,96,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="cm-inner-pad">
            <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.28)', borderRadius: '20px', padding: '6px 16px', marginBottom: '32px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(160,205,168,0.85)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Month 2 · Foundation Building</span>
              </div>
              <h2 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '24px' }}>
                You are not alone<br />
                <span style={{ color: 'rgba(160,205,168,0.78)' }}>in this journey.</span>
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: '48px', maxWidth: '560px', margin: '0 auto 48px' }}>
                847 members are walking this same programme right now. Every person above felt uncertain at Month 2. Every single one kept going.
              </p>
              <a href="/today" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 36px', background: '#fff', border: 'none', borderRadius: '14px', color: 'var(--color-ink)', fontSize: '16px', fontWeight: 800, textDecoration: 'none', letterSpacing: '-0.01em', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
              >
                Keep going <ChevronRight size={18} strokeWidth={2.5} />
              </a>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>Back to your programme overview</p>
            </div>
          </div>
        </div>

      </div>{/* end community-desktop-only */}

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT (unchanged)
      ══════════════════════════════════════════ */}
      <div className="community-mobile-only" style={{ paddingBottom: '32px' }}>

        {/* Sticky back nav */}
        <div style={{
          position: 'sticky',
          top: '56px',
          zIndex: 99,
          height: '56px',
          background: 'rgba(250,250,248,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
        }}>
          <a
            href="/today"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: 'var(--color-sage)',
              minHeight: '44px',
              padding: '0 4px',
              opacity: 1,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Overview</span>
          </a>
        </div>

        {/* Page title */}
        <div style={{ padding: '24px 24px 0' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Community Stories
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>
            Stories from your programme cohort
          </p>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
            {filters.map(f => {
              const isActive = f === activeFilter;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `1.5px solid ${isActive ? 'var(--color-ink)' : 'var(--color-border)'}`,
                    background: isActive ? 'var(--color-ink)' : '#fff',
                    color: isActive ? '#fff' : 'var(--color-ink)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stories grid */}
        <div style={{
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          {filteredStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              expanded={expandedStory === story.id}
              onToggle={() => setExpandedStory(prev => prev === story.id ? null : story.id)}
            />
          ))}
        </div>

        {/* Inspiration banner */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2A3E2C 0%, #4A6E50 100%)',
            borderRadius: '16px',
            padding: '28px 24px',
            color: '#fff',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Your story starts now
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '20px' }}>
              In Month 2, you&apos;re building the foundation.<br />
              847 members before you took this same step.
            </p>
            <a
              href="/today"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Keep going →
            </a>
          </div>
        </div>

      </div>{/* end community-mobile-only */}
    </div>
  );
}
