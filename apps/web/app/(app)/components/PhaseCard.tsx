'use client';

interface PhaseCardProps {
  month: number;
  phaseName: string;
  dayInPhase: number;
  totalDays: number;
}

export default function PhaseCard({ month, phaseName, dayInPhase, totalDays }: PhaseCardProps) {
  const progress = Math.round((dayInPhase / totalDays) * 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)',
      borderRadius: '20px',
      padding: '20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circle */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        right: '30px',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '4px 12px',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Month {month}
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' }}>
          {phaseName}
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '16px' }}>
          Day {dayInPhase} of {totalDays} · {progress}% complete
        </p>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            transition: 'width 0.6s ease',
          }} />
        </div>

        <p style={{ fontSize: '12px', opacity: 0.75, marginTop: '8px' }}>
          {totalDays - dayInPhase} days left in this phase
        </p>
      </div>
    </div>
  );
}
