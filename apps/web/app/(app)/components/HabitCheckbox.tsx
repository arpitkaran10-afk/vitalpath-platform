'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface HabitCheckboxProps {
  label: string;
  initialChecked?: boolean;
  category?: string;
  streak?: number;
  onChange?: (checked: boolean) => void;
}

export default function HabitCheckbox({
  label,
  initialChecked = false,
  category,
  streak = 0,
  onChange,
}: HabitCheckboxProps) {
  const [checked, setChecked] = useState(initialChecked);
  const [animating, setAnimating] = useState(false);

  const handleToggle = () => {
    const next = !checked;
    setChecked(next);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    onChange?.(next);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        width: '100%',
        background: checked ? 'rgba(107,143,113,0.08)' : 'var(--color-card)',
        border: `1.5px solid ${checked ? 'var(--color-sage-light)' : 'var(--color-border)'}`,
        borderRadius: '14px',
        padding: '14px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.25s ease',
        transform: animating ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {/* Checkbox */}
      <span style={{
        width: '24px',
        height: '24px',
        borderRadius: '8px',
        border: `2px solid ${checked ? 'var(--color-sage)' : 'var(--color-border)'}`,
        background: checked ? 'var(--color-sage)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        transform: animating && checked ? 'scale(1.2)' : 'scale(1)',
      }}>
        {checked && (
          <Check size={14} color="#fff" strokeWidth={3} />
        )}
      </span>

      {/* Text */}
      <span style={{ flex: 1 }}>
        <span style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          color: checked ? 'var(--color-muted)' : 'var(--color-ink)',
          textDecoration: checked ? 'line-through' : 'none',
          transition: 'all 0.2s ease',
        }}>
          {label}
        </span>
        {category && (
          <span style={{
            fontSize: '11px',
            color: 'var(--color-sage)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            {category}
          </span>
        )}
      </span>

      {/* Streak */}
      {streak > 0 && (
        <span style={{
          fontSize: '12px',
          color: 'var(--color-gold)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          flexShrink: 0,
        }}>
          🔥 {streak}
        </span>
      )}
    </button>
  );
}
