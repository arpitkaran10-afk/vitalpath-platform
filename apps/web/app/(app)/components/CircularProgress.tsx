'use client';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
}

export default function CircularProgress({
  value,
  max,
  size = 200,
  strokeWidth = 14,
  label,
  sublabel,
  color = 'var(--color-sage)',
  trackColor = 'var(--color-border)',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease',
          }}
        />
      </svg>
      {/* Center content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {label && (
          <div style={{ fontSize: size * 0.14, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{ fontSize: size * 0.07, color: 'var(--color-muted)', marginTop: '4px', fontWeight: 500 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
