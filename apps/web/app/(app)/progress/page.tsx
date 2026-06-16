'use client';

import { useState, useRef } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';

type MetricKey = 'Weight' | 'Waist' | 'Glucose' | 'Blood Pressure' | 'Cholesterol' | 'Activity';

const METRICS: MetricKey[] = ['Weight', 'Waist', 'Glucose', 'Blood Pressure', 'Cholesterol', 'Activity'];

const METRIC_DATA: Record<MetricKey, {
  unit: string;
  values: number[];
  reference: string;
  trend: string;
  phaseName: (m: number) => string;
}> = {
  Weight: {
    unit: 'kg',
    values: [82, 81.2, 80.8, 80.1, 79.5, 79.0],
    reference: 'Target: 76 kg',
    trend: '↓ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
  Waist: {
    unit: 'cm',
    values: [94, 93, 92, 91.5, 90.5, 90],
    reference: 'Target: < 88 cm',
    trend: '↓ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
  Glucose: {
    unit: 'mg/dL',
    values: [108, 104, 100, 97, 94, 91],
    reference: 'Reference: < 100 mg/dL',
    trend: '↓ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
  'Blood Pressure': {
    unit: 'mmHg',
    values: [138, 135, 132, 130, 128, 125],
    reference: 'Target: < 120 mmHg',
    trend: '↓ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
  Cholesterol: {
    unit: 'mg/dL',
    values: [210, 205, 200, 196, 192, 188],
    reference: 'Reference: < 200 mg/dL',
    trend: '↓ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
  Activity: {
    unit: 'steps/day',
    values: [3200, 5240, 6800, 7500, 8200, 9000],
    reference: 'Target: 8,000+ steps',
    trend: '↑ improving',
    phaseName: (m) => m === 1 ? 'Awareness' : m === 2 ? 'Foundation' : `Month ${m}`,
  },
};

const MONTH_DATE_RANGES = [
  'May 9 – Jun 8',
  'Jun 9 – Jul 8',
  'Jul 9 – Aug 8',
  'Aug 9 – Sep 8',
  'Sep 9 – Oct 8',
  'Oct 9 – Nov 8',
];

interface Photo {
  url: string;
  month: number;
}

function LineChart({ values, loggedCount }: { values: number[]; loggedCount: number }) {
  const width = 300;
  const height = 120;
  const padX = 28;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const minVal = Math.min(...values) * 0.995;
  const maxVal = Math.max(...values) * 1.005;
  const range = maxVal - minVal || 1;

  const pts = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * innerW;
    const y = padY + (1 - (v - minVal) / range) * innerH;
    return { x, y };
  });

  const solidPts = pts.slice(0, loggedCount);
  const dashedPts = pts.slice(loggedCount - 1);

  const toPolyline = (points: { x: number; y: number }[]) =>
    points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t, i) => (
        <line
          key={i}
          x1={padX}
          y1={padY + t * innerH}
          x2={padX + innerW}
          y2={padY + t * innerH}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
      ))}

      {/* Dashed future line */}
      {dashedPts.length > 1 && (
        <polyline
          points={toPolyline(dashedPts)}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeOpacity="0.35"
        />
      )}

      {/* Solid logged line */}
      {solidPts.length > 1 && (
        <polyline
          points={toPolyline(solidPts)}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Dots */}
      {pts.map((p, i) => {
        const logged = i < loggedCount;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={logged ? 5 : 4}
            fill={logged ? 'var(--color-sage)' : '#fff'}
            stroke={logged ? '#fff' : 'var(--color-sage)'}
            strokeWidth="2"
            strokeOpacity={logged ? 1 : 0.35}
            fillOpacity={logged ? 1 : 0.35}
          />
        );
      })}

      {/* Month labels */}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={height - 2}
          textAnchor="middle"
          fontSize="9"
          fill={i < loggedCount ? 'var(--color-ink)' : 'var(--color-muted)'}
          fillOpacity={i < loggedCount ? 1 : 0.5}
        >
          M{i + 1}
        </text>
      ))}
    </svg>
  );
}

function LineChartLarge({ values, loggedCount }: { values: number[]; loggedCount: number }) {
  const W = 760, H = 280, pX = 44, pY = 24, labelH = 22;
  const iW = W - pX * 2, iH = H - pY * 2 - labelH;
  const minV = Math.min(...values) * 0.991, maxV = Math.max(...values) * 1.009;
  const range = maxV - minV || 1;
  const pts = values.map((v, i) => ({
    x: pX + (i / (values.length - 1)) * iW,
    y: pY + (1 - (v - minV) / range) * iH,
    v,
  }));
  const solidPts = pts.slice(0, loggedCount);
  const dashedPts = pts.slice(loggedCount - 1);
  const toLine = (ps: typeof pts) => ps.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = solidPts.length > 1
    ? `M${solidPts[0]!.x},${pY + iH} ` + solidPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${solidPts[solidPts.length - 1]!.x},${pY + iH} Z`
    : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="pdtArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B8F71" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6B8F71" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pX} y1={pY + t * iH} x2={pX + iW} y2={pY + t * iH} stroke="#E8EDE9" strokeWidth="1" />
      ))}
      {areaPath && <path d={areaPath} fill="url(#pdtArea)" />}
      {dashedPts.length > 1 && (
        <polyline points={toLine(dashedPts)} fill="none" stroke="#6B8F71" strokeWidth="2" strokeDasharray="6 5" strokeOpacity="0.4" />
      )}
      {solidPts.length > 1 && (
        <polyline points={toLine(solidPts)} fill="none" stroke="#6B8F71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {pts.map((p, i) => i < loggedCount && (
        <text key={`v${i}`} x={p.x} y={p.y - 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="#6B8F71">{p.v}</text>
      ))}
      {pts.map((p, i) => {
        const logged = i < loggedCount;
        return (
          <circle key={i} cx={p.x} cy={p.y} r={logged ? 7 : 5}
            fill={logged ? '#6B8F71' : '#fff'} stroke={logged ? '#fff' : '#6B8F71'}
            strokeWidth="2.5" strokeOpacity={logged ? 1 : 0.4} fillOpacity={logged ? 1 : 0.35} />
        );
      })}
      {pts.map((p, i) => (
        <text key={`l${i}`} x={p.x} y={H - 4} textAnchor="middle" fontSize="11"
          fill={i < loggedCount ? '#1C2B1E' : '#6B7B6E'}
          fillOpacity={i < loggedCount ? 0.8 : 0.4}
          fontWeight={i < loggedCount ? 600 : 400}>
          M{i + 1}
        </text>
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('Weight');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metric = METRIC_DATA[activeMetric];
  const loggedCount = 2; // Month 1 and 2 logged
  const currentValue = metric.values[loggedCount - 1] ?? metric.values[0] ?? 0;
  const previousValue = metric.values[0] ?? 0;
  const change = currentValue - previousValue;
  const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) newPhotos.push({ url: URL.createObjectURL(file), month: 2 });
    }
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        .pg-mobile-only { display: block; }
        .pg-desktop-only { display: none; }
        @media (min-width: 1024px) {
          .pg-mobile-only { display: none !important; }
          .pg-desktop-only { display: block !important; }
        }
        .pg-dt-section { width: 100%; }
        .pg-dt-inner { max-width: 1600px; margin: 0 auto; padding: 0 64px; }
        .pg-dt-inner-pad { max-width: 1600px; margin: 0 auto; padding: 72px 64px; }
        .pg-dt-65-35 { display: grid; grid-template-columns: 65fr 35fr; gap: 48px; align-items: start; }
        .pg-dt-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .pg-dt-photo-wall { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .pg-dt-metric-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
        .pg-dt-card-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .pg-dt-card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      `}</style>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <div className="pg-desktop-only">
        {/* ── Sticky back nav ── */}
        <div style={{
          position: 'sticky', top: '56px', zIndex: 99, height: '56px',
          background: 'rgba(13,26,16,0.92)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', padding: '0 64px',
        }}>
          <a href="/today" style={{
            display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
            color: 'rgba(160,205,168,0.85)', minHeight: '44px',
            fontSize: '14px', fontWeight: 600,
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.65'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          >
            <ChevronLeft size={17} strokeWidth={2.5} />
            Overview
          </a>
        </div>

        {/* ── S1: HERO ── dark forest, 580px */}
        <div className="pg-dt-section" style={{
          background: 'linear-gradient(155deg, #0d1a10 0%, #162212 50%, #0c1318 100%)',
          minHeight: '580px', display: 'flex', alignItems: 'flex-end', position: 'relative', overflow: 'hidden',
        }}>
          {/* Glows */}
          <div style={{ position: 'absolute', top: '-60px', right: '8%', width: '360px', height: '280px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '12%', width: '280px', height: '220px', background: 'radial-gradient(ellipse, rgba(195,163,96,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div className="pg-dt-inner-pad" style={{ width: '100%', paddingTop: '80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'end' }}>
              {/* Left */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.28)', borderRadius: '20px', padding: '6px 14px', marginBottom: '24px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(160,205,168,0.85)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Month 2 of 6 · Day 14</span>
                </div>
                <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '20px' }}>
                  Your Health<br />
                  <span style={{ color: 'rgba(160,205,168,0.85)' }}>Progress Report</span>
                </h1>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '460px', marginBottom: '36px' }}>
                  Foundation Building phase. You are on track. Every data point tells your story.
                </p>
                {/* Stat row */}
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Weight Change', value: '−3.0 kg', sub: 'since Month 1' },
                    { label: 'Programme', value: '28%', sub: 'complete' },
                    { label: 'Day Streak', value: '14', sub: 'consecutive days' },
                  ].map(s => (
                    <div key={s.label}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</p>
                      <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right — journey stepper */}
              <div style={{ paddingBottom: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>Your 6-Month Journey</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '12px' }}>
                  {[1,2,3,4,5,6].map((m, i) => {
                    const done = m < 2, active = m === 2;
                    const c = done ? '#6B8F71' : active ? '#D4A843' : 'rgba(255,255,255,0.12)';
                    return (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{m}</span>
                        </div>
                        {i < 5 && <div style={{ flex: 1, height: '2px', background: m < 2 ? '#6B8F71' : 'rgba(255,255,255,0.1)' }} />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {['Awareness','Foundation','Metabolic','Optimise','Sustain','Perform'].map((label, i) => (
                    <span key={i} style={{ fontSize: '9px', color: i < 2 ? 'rgba(160,205,168,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: i === 1 ? 700 : 400, textAlign: 'center', flex: 1 }}>{label}</span>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Programme completion</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4A843' }}>28%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '28%', background: 'linear-gradient(90deg, #6B8F71, #D4A843)', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S2: METRIC INTELLIGENCE WORKSPACE ── white */}
        <div className="pg-dt-section" style={{ background: '#ffffff' }}>
          <div className="pg-dt-inner-pad">
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Biomarker Intelligence</p>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '0' }}>Metric Analysis</h2>
            </div>
            {/* Metric tabs */}
            <div className="pg-dt-metric-tabs" style={{ marginBottom: '32px' }}>
              {METRICS.map(m => {
                const isA = m === activeMetric;
                return (
                  <button key={m} onClick={() => setActiveMetric(m)} style={{
                    padding: '10px 20px', borderRadius: '24px',
                    border: `1.5px solid ${isA ? 'var(--color-ink)' : 'var(--color-border)'}`,
                    background: isA ? 'var(--color-ink)' : '#fff',
                    color: isA ? '#fff' : 'var(--color-ink)',
                    fontSize: '13px', fontWeight: isA ? 700 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap' as const,
                    transition: 'all 0.15s',
                  }}>
                    {m}
                  </button>
                );
              })}
            </div>
            {/* 65/35 workspace */}
            <div className="pg-dt-65-35">
              {/* Chart side */}
              <div>
                <div style={{ background: '#FAFAF8', borderRadius: '20px', padding: '32px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>{activeMetric}</p>
                      <p style={{ fontSize: '52px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {currentValue.toLocaleString()}
                        <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-muted)', marginLeft: '6px' }}>{metric.unit}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(107,143,113,0.1)', border: '1px solid rgba(107,143,113,0.18)', borderRadius: '20px', padding: '8px 16px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-sage)' }}>{changeStr}</span>
                        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{metric.unit}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>vs Month 1 start</p>
                    </div>
                  </div>
                  <LineChartLarge values={metric.values} loggedCount={loggedCount} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '3px', background: 'var(--color-sage)', borderRadius: '2px' }} />
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Logged</span>
                      <div style={{ width: '28px', height: '3px', background: 'var(--color-sage)', borderRadius: '2px', opacity: 0.35, marginLeft: '12px', borderTop: '2px dashed' }} />
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Projected</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-sage)' }}>{metric.trend}</span>
                  </div>
                </div>
              </div>
              {/* Insights panel */}
              <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'linear-gradient(145deg, #f0f7f1 0%, #e6f0e8 100%)', borderRadius: '20px', padding: '28px', border: '1.5px solid rgba(107,143,113,0.22)' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Metric Snapshot</p>
                  {[
                    { label: 'Current', value: `${currentValue.toLocaleString()} ${metric.unit}` },
                    { label: 'Target', value: metric.reference.replace('Target: ', '').replace('Reference: ', '') },
                    { label: 'Trend', value: metric.trend },
                    { label: 'Change', value: `${changeStr} ${metric.unit}` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid rgba(107,143,113,0.12)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ background: 'var(--color-sage)', borderRadius: '12px', padding: '14px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '2px' }}>At this rate</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>On track for Month 6 target</p>
                  </div>
                </div>
                {/* Progress to target */}
                <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Months Logged</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {metric.values.map((v, i) => {
                      const logged = i < loggedCount;
                      return (
                        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ height: '4px', background: logged ? 'var(--color-sage)' : 'var(--color-border)', borderRadius: '2px', marginBottom: '6px' }} />
                          <span style={{ fontSize: '10px', color: logged ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: logged ? 600 : 400 }}>M{i+1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '12px' }}>{loggedCount} of 6 months recorded</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── S3: TRANSFORMATION DASHBOARD ── warm stone */}
        <div className="pg-dt-section" style={{ background: '#F0EDE6' }}>
          <div className="pg-dt-inner-pad">
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Month by Month</p>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Transformation Dashboard</h2>
            </div>
            <div className="pg-dt-3col">
              {/* Month 1 — completed */}
              <div className="pg-dt-card-lift" style={{ background: 'linear-gradient(135deg, #2A3E2C 0%, #4A6E50 100%)', borderRadius: '20px', padding: '28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-24px', right: '-16px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>1</span>
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 10px', fontWeight: 700 }}>✓ Complete</span>
                </div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Awareness &amp; Baseline</p>
                <p style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>Know Your Health</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>{MONTH_DATE_RANGES[0]}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{activeMetric} at start</p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: '#F0C96A', letterSpacing: '-0.02em' }}>{(metric.values[0] ?? 0).toLocaleString()}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{metric.unit}</p>
                </div>
              </div>

              {/* Month 2 — active */}
              <div className="pg-dt-card-lift" style={{ background: '#fff', border: '2px solid var(--color-sage)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-24px', right: '-16px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-sage)' }}>2</span>
                  </div>
                  <span style={{ fontSize: '10px', background: '#FFF3CD', color: '#D97706', borderRadius: '20px', padding: '4px 10px', fontWeight: 700 }}>● Active</span>
                </div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Foundation Building</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Build Healthy Habits</p>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '16px' }}>{MONTH_DATE_RANGES[1]} · Day 14 of 30</p>
                <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ height: '100%', width: '47%', background: 'var(--color-sage)', borderRadius: '3px' }} />
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '4px' }}>{activeMetric} now</p>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-sage)', letterSpacing: '-0.02em' }}>{(metric.values[1] ?? 0).toLocaleString()}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>{metric.unit}</p>
                </div>
              </div>

              {/* Months 3–6 locked */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[3,4,5,6].map(m => (
                  <div key={m} style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.65 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)' }}>{m}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '2px' }}>
                        {m === 3 ? 'Sleep Better' : m === 4 ? 'Stress Less' : m === 5 ? 'Make It Stick' : 'Your New Normal'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{MONTH_DATE_RANGES[m-1]}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-muted)', background: 'var(--color-border)', borderRadius: '20px', padding: '3px 8px', flexShrink: 0 }}>Locked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── S4: VISUAL TRANSFORMATION ── sage tint */}
        <div className="pg-dt-section" style={{ background: '#EEF3EF' }}>
          <div className="pg-dt-inner-pad">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Visual Transformation</p>
                <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Your Progress Story</h2>
              </div>
              <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 22px', background: 'var(--color-sage)', border: 'none', borderRadius: '24px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={15} />
                Add Photo
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} multiple />
            <div className="pg-dt-photo-wall">
              {/* Month 1 placeholder */}
              <div className="pg-dt-card-lift" style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', background: '#D5D5CE' }}>
                <svg viewBox="0 0 100 133" style={{ width: '100%', height: '100%' }} fill="none">
                  <rect width="100" height="133" fill="#C8C8C0" />
                  <circle cx="50" cy="40" r="20" fill="#9A9A90" />
                  <ellipse cx="50" cy="100" rx="30" ry="25" fill="#9A9A90" />
                </svg>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 16px 16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Month 1</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>May 9, 2026</p>
                </div>
              </div>
              {/* Month 2 placeholder */}
              <div className="pg-dt-card-lift" style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', background: '#D0D8D0' }}>
                <svg viewBox="0 0 100 133" style={{ width: '100%', height: '100%' }} fill="none">
                  <rect width="100" height="133" fill="#C0CCC0" />
                  <circle cx="50" cy="40" r="20" fill="#8A9A8A" />
                  <ellipse cx="50" cy="100" rx="29" ry="24" fill="#8A9A8A" />
                </svg>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 16px 16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Month 2</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Jun 9, 2026</p>
                </div>
              </div>
              {/* Uploaded photos */}
              {photos.map((photo, i) => (
                <div key={i} className="pg-dt-card-lift" style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src={photo.url} alt={`Progress ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 16px 16px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Month {photo.month}</p>
                  </div>
                </div>
              ))}
              {/* Add card */}
              <button onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '3/4', borderRadius: '16px', border: '2px dashed rgba(107,143,113,0.3)', background: 'rgba(107,143,113,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,143,113,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,143,113,0.3)'}
              >
                <Plus size={28} color="var(--color-sage)" />
                <span style={{ fontSize: '13px', color: 'var(--color-sage)', fontWeight: 600 }}>Add photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── S5: FUTURE TRAJECTORY ── dark gradient */}
        <div className="pg-dt-section" style={{ background: 'linear-gradient(155deg, #0d1a10 0%, #111e18 50%, #0c1218 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '30%', width: '300px', height: '240px', background: 'radial-gradient(ellipse, rgba(107,143,113,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="pg-dt-inner-pad">
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Projected Outcome</p>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Your Future Trajectory</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
              {METRICS.slice(0, 3).map(mk => {
                const md = METRIC_DATA[mk];
                const curr = md.values[loggedCount - 1] ?? md.values[0] ?? 0;
                const proj = md.values[md.values.length - 1] ?? curr;
                return (
                  <div key={mk} className="pg-dt-card-lift" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '24px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{mk}</p>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Current</p>
                        <p style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{curr.toLocaleString()}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{md.unit}</p>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                      <div>
                        <p style={{ fontSize: '11px', color: 'rgba(160,205,168,0.55)', marginBottom: '3px' }}>Month 6</p>
                        <p style={{ fontSize: '24px', fontWeight: 800, color: 'rgba(160,205,168,0.85)', letterSpacing: '-0.02em' }}>{proj.toLocaleString()}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{md.unit}</p>
                      </div>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(loggedCount / 6) * 100}%`, background: 'linear-gradient(90deg, #6B8F71, #A8C5AC)', borderRadius: '2px' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>{md.trend}</p>
                  </div>
                );
              })}
            </div>
            {/* Community CTA */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>See how others transformed</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Thousands of members on the same journey.</p>
              </div>
              <a href="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(107,143,113,0.2)', border: '1px solid rgba(107,143,113,0.3)', borderRadius: '24px', textDecoration: 'none', color: 'rgba(160,205,168,0.9)', fontSize: '14px', fontWeight: 700, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(107,143,113,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(107,143,113,0.2)'}
              >
                See what others achieved →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT (unchanged)
      ══════════════════════════════════════════ */}
      <div className="pg-mobile-only">

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
          Your Progress
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>
          Month 2 of 6 · Day 14
        </p>

        {/* 6-month journey bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map((m, i) => {
            const isCompleted = m < 2;
            const isActive = m === 2;
            const dotColor = isCompleted ? 'var(--color-sage)' : isActive ? '#D97706' : 'var(--color-border)';
            return (
              <div key={m} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 'none' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: dotColor,
                  border: `2px solid ${dotColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  position: 'relative',
                }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff' }}>{m}</span>
                </div>
                {i < 5 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: isCompleted ? 'var(--color-sage)' : 'var(--color-border)',
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {['Awareness', 'Foundation', 'Metabolic', 'Optimise', 'Sustain', 'Perform'].map((label, i) => (
            <span key={i} style={{ fontSize: '8px', color: i < 2 ? 'var(--color-sage)' : 'var(--color-muted)', fontWeight: i === 1 ? 700 : 400, textAlign: 'center', flex: 1 }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Metric selector tabs */}
      <div style={{ padding: '16px 24px 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
          {METRICS.map(m => {
            const isActive = m === activeMetric;
            return (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
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
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active metric card */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>{activeMetric}</p>
              <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {currentValue.toLocaleString()}
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)', marginLeft: '4px' }}>{metric.unit}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-sage)',
                background: 'rgba(107,143,113,0.1)',
                borderRadius: '20px',
                padding: '4px 10px',
              }}>
                {changeStr} {metric.unit}
              </span>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>vs Month 1 start</p>
            </div>
          </div>

          <LineChart values={metric.values} loggedCount={loggedCount} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600 }}>
              Your trend: {metric.trend}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
              {metric.reference}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly summary cards */}
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '14px' }}>
          Month by Month
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Month 1 — completed */}
          <div style={{
            background: 'linear-gradient(135deg, #2A3E2C 0%, #4A6E50 100%)',
            borderRadius: '14px',
            padding: '18px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>1</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700 }}>Awareness &amp; Baseline</p>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 8px' }}>✓ Done</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.75 }}>{MONTH_DATE_RANGES[0]}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#F0C96A' }}>
                {activeMetric === 'Activity'
                  ? `${(metric.values[0] ?? 0).toLocaleString()}`
                  : `${metric.values[0] ?? 0}`}
              </p>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>start {metric.unit}</p>
            </div>
          </div>

          {/* Month 2 — active */}
          <div style={{
            background: '#fff',
            border: '1.5px solid var(--color-sage)',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(107,143,113,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-sage)' }}>2</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>Foundation Building</p>
                <span style={{ fontSize: '10px', background: '#FFF3CD', color: '#D97706', borderRadius: '20px', padding: '2px 8px', fontWeight: 700 }}>Active</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{MONTH_DATE_RANGES[1]} · Day 14 of 30</p>
              {/* Progress bar */}
              <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ height: '100%', width: '47%', background: 'var(--color-sage)', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-sage)' }}>
                {activeMetric === 'Activity'
                  ? `${(metric.values[1] ?? 0).toLocaleString()}`
                  : `${metric.values[1] ?? 0}`}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--color-muted)' }}>current {metric.unit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Photos */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Progress Photos
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              background: 'var(--color-sage)',
              border: 'none',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            Add photo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {/* Month 1 placeholder */}
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: '#D5D5CE' }}>
            <svg viewBox="0 0 100 133" style={{ width: '100%', height: '100%' }} fill="none">
              <rect width="100" height="133" fill="#C8C8C0" />
              <circle cx="50" cy="40" r="20" fill="#9A9A90" />
              <ellipse cx="50" cy="100" rx="30" ry="25" fill="#9A9A90" />
            </svg>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 12px',
            }}>
              <p style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>Month 1</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>May 9, 2026</p>
            </div>
          </div>

          {/* Month 2 placeholder */}
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: '#D0D8D0' }}>
            <svg viewBox="0 0 100 133" style={{ width: '100%', height: '100%' }} fill="none">
              <rect width="100" height="133" fill="#C0CCC0" />
              <circle cx="50" cy="40" r="20" fill="#8A9A8A" />
              <ellipse cx="50" cy="100" rx="29" ry="24" fill="#8A9A8A" />
            </svg>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 12px',
            }}>
              <p style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>Month 2</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Jun 9, 2026</p>
            </div>
          </div>

          {/* Uploaded photos */}
          {photos.map((photo, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: '#E5E5E0' }}>
              <img src={photo.url} alt={`Progress ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.6)',
                padding: '8px 12px',
              }}>
                <p style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>Month {photo.month}</p>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              aspectRatio: '3/4',
              borderRadius: '12px',
              border: '2px dashed var(--color-border)',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Plus size={24} color="var(--color-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500 }}>Add photo</span>
          </button>
        </div>
      </div>

      {/* Success stories teaser */}
      <div style={{ padding: '24px' }}>
        <a
          href="/community"
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'var(--color-sage)',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            padding: '12px',
            border: '1px solid rgba(107,143,113,0.3)',
            borderRadius: '12px',
            background: 'rgba(107,143,113,0.05)',
          }}
        >
          See what others achieved →
        </a>
      </div>

      </div>{/* end pg-mobile-only */}
    </div>
  );
}
