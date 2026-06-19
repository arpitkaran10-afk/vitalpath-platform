'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Clock, Calendar, Check,
  Flame, Sparkles, Heart, Zap, Moon, Wind, Droplets,
  Apple, Activity, Brain, Shield, Leaf, Star,
} from 'lucide-react';
import rawNudges from '../../../lib/nudges-normalized.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Nudge {
  id: string;
  health_goal: string;
  habit: string;
  nudge_primary: string | null;
  nudge_followup: string | null;
  trigger_type: 'time' | 'context' | 'interval' | 'user_set';
  schedule_time: string | null;
  recurrence: string;
  default_enabled: boolean;
  user_customizable_time: boolean;
}

// Expanded to cover all trigger types
interface ScheduleState {
  // time / user_set
  time: string;
  days: string[];
  // interval
  intervalMinutes: number;
  activeStart: string;
  activeEnd: string;
  // context
  meals: string[];
  delayMinutes: number;
}

const NUDGES = rawNudges as Nudge[];

// ─── Demo: Priya's pre-selected goals ────────────────────────────────────────

const PRIYA_GOALS = new Set(['Weight Loss', 'Reduce Blood Pressure']);

// ─── All unique health goals ─────────────────────────────────────────────────

const ALL_GOALS: string[] = ['All', ...Array.from(new Set(NUDGES.map(n => n.health_goal))).sort()];

// ─── Category colour system ───────────────────────────────────────────────────

type CategoryTheme = {
  accent: string;
  accentLight: string;
  accentBorder: string;
  icon: React.ReactNode;
  gradient: string;
};

function getCategoryTheme(goal: string): CategoryTheme {
  const themes: Record<string, CategoryTheme> = {
    'Weight Loss': {
      accent: '#D4A843',
      accentLight: 'rgba(212,168,67,0.10)',
      accentBorder: 'rgba(212,168,67,0.22)',
      gradient: 'linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 100%)',
      icon: <Flame size={22} strokeWidth={1.8} style={{ color: '#D4A843' }} />,
    },
    'Reduce Blood Pressure': {
      accent: '#6B8F71',
      accentLight: 'rgba(107,143,113,0.10)',
      accentBorder: 'rgba(107,143,113,0.22)',
      gradient: 'linear-gradient(135deg, rgba(107,143,113,0.12) 0%, rgba(107,143,113,0.04) 100%)',
      icon: <Heart size={22} strokeWidth={1.8} style={{ color: '#6B8F71' }} />,
    },
    'Heart Health': {
      accent: '#C8604A',
      accentLight: 'rgba(200,96,74,0.10)',
      accentBorder: 'rgba(200,96,74,0.22)',
      gradient: 'linear-gradient(135deg, rgba(200,96,74,0.10) 0%, rgba(200,96,74,0.03) 100%)',
      icon: <Heart size={22} strokeWidth={1.8} style={{ color: '#C8604A' }} />,
    },
    'Improve Energy Levels': {
      accent: '#D4A843',
      accentLight: 'rgba(212,168,67,0.10)',
      accentBorder: 'rgba(212,168,67,0.22)',
      gradient: 'linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 100%)',
      icon: <Zap size={22} strokeWidth={1.8} style={{ color: '#D4A843' }} />,
    },
    'Increase Muscle Mass': {
      accent: '#6B8F71',
      accentLight: 'rgba(107,143,113,0.10)',
      accentBorder: 'rgba(107,143,113,0.22)',
      gradient: 'linear-gradient(135deg, rgba(107,143,113,0.12) 0%, rgba(107,143,113,0.04) 100%)',
      icon: <Activity size={22} strokeWidth={1.8} style={{ color: '#6B8F71' }} />,
    },
    'Lower Cholesterol': {
      accent: '#7B9EA3',
      accentLight: 'rgba(123,158,163,0.10)',
      accentBorder: 'rgba(123,158,163,0.22)',
      gradient: 'linear-gradient(135deg, rgba(123,158,163,0.12) 0%, rgba(123,158,163,0.04) 100%)',
      icon: <Shield size={22} strokeWidth={1.8} style={{ color: '#7B9EA3' }} />,
    },
    'Digestive Health': {
      accent: '#8FA86B',
      accentLight: 'rgba(143,168,107,0.10)',
      accentBorder: 'rgba(143,168,107,0.22)',
      gradient: 'linear-gradient(135deg, rgba(143,168,107,0.12) 0%, rgba(143,168,107,0.04) 100%)',
      icon: <Leaf size={22} strokeWidth={1.8} style={{ color: '#8FA86B' }} />,
    },
    'Reduce Fatty Liver': {
      accent: '#A87B4A',
      accentLight: 'rgba(168,123,74,0.10)',
      accentBorder: 'rgba(168,123,74,0.22)',
      gradient: 'linear-gradient(135deg, rgba(168,123,74,0.10) 0%, rgba(168,123,74,0.03) 100%)',
      icon: <Apple size={22} strokeWidth={1.8} style={{ color: '#A87B4A' }} />,
    },
    'Reduce Medication': {
      accent: '#7B9EA3',
      accentLight: 'rgba(123,158,163,0.10)',
      accentBorder: 'rgba(123,158,163,0.22)',
      gradient: 'linear-gradient(135deg, rgba(123,158,163,0.12) 0%, rgba(123,158,163,0.04) 100%)',
      icon: <Brain size={22} strokeWidth={1.8} style={{ color: '#7B9EA3' }} />,
    },
    'Reverse PCOS': {
      accent: '#A87BAE',
      accentLight: 'rgba(168,123,174,0.10)',
      accentBorder: 'rgba(168,123,174,0.22)',
      gradient: 'linear-gradient(135deg, rgba(168,123,174,0.12) 0%, rgba(168,123,174,0.04) 100%)',
      icon: <Moon size={22} strokeWidth={1.8} style={{ color: '#A87BAE' }} />,
    },
    'Skin Health': {
      accent: '#C89A6B',
      accentLight: 'rgba(200,154,107,0.10)',
      accentBorder: 'rgba(200,154,107,0.22)',
      gradient: 'linear-gradient(135deg, rgba(200,154,107,0.12) 0%, rgba(200,154,107,0.04) 100%)',
      icon: <Sparkles size={22} strokeWidth={1.8} style={{ color: '#C89A6B' }} />,
    },
    'Strengthen Immunity': {
      accent: '#6B8F71',
      accentLight: 'rgba(107,143,113,0.10)',
      accentBorder: 'rgba(107,143,113,0.22)',
      gradient: 'linear-gradient(135deg, rgba(107,143,113,0.12) 0%, rgba(107,143,113,0.04) 100%)',
      icon: <Shield size={22} strokeWidth={1.8} style={{ color: '#6B8F71' }} />,
    },
    "Women's Vitality": {
      accent: '#C87BA3',
      accentLight: 'rgba(200,123,163,0.10)',
      accentBorder: 'rgba(200,123,163,0.22)',
      gradient: 'linear-gradient(135deg, rgba(200,123,163,0.12) 0%, rgba(200,123,163,0.04) 100%)',
      icon: <Star size={22} strokeWidth={1.8} style={{ color: '#C87BA3' }} />,
    },
  };
  return themes[goal] ?? {
    accent: '#6B8F71',
    accentLight: 'rgba(107,143,113,0.10)',
    accentBorder: 'rgba(107,143,113,0.22)',
    gradient: 'linear-gradient(135deg, rgba(107,143,113,0.12) 0%, rgba(107,143,113,0.04) 100%)',
    icon: <Leaf size={22} strokeWidth={1.8} style={{ color: '#6B8F71' }} />,
  };
}

// ─── Text cleaning ────────────────────────────────────────────────────────────
// Strips dev/implementation prefixes and normalises outer quotes.

const DEV_ONLY_PATTERNS = [
  /confirmation checkbox/i,
  /^n\/a$/i,
];

// Ordered: longest/most-specific first to avoid partial matches
const DEV_PREFIXES: RegExp[] = [
  /^immediate trigger[^:]*:\s*/i,
  /^time-based reminder[^:]*[:.]\s*/i,
  /^pre-meal reminder:\s*/i,
  /^post-meal reminder:\s*/i,
  /^notification:\s*/i,
  /^countdown:\s*/i,
  /^follow-up:\s*/i,
  /^if [^:]{1,40}:\s*/i,
  /^morning:\s*/i,
  /^evening:\s*/i,
  /^night:\s*/i,
  /^weekly:\s*/i,
  /^streak:\s*/i,
  /^reminder:\s*/i,
  /^trigger:\s*/i,
  /^after:\s*/i,
];

function stripOuterQuotes(s: string): string {
  let r = s;
  // Strip matching outer curly or straight single quotes
  if (
    (r.startsWith('‘') || r.startsWith('’') || r.startsWith("'")) &&
    (r.endsWith('‘') || r.endsWith('’') || r.endsWith("'"))
  ) {
    r = r.slice(1, -1).trim();
  }
  return r;
}

function cleanCoachingText(text: string | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  for (const pat of DEV_ONLY_PATTERNS) {
    if (pat.test(trimmed)) return null;
  }
  // Only take first line for multi-line followup strings
  let cleaned = (trimmed.split('\n')[0] ?? '').trim();
  // Strip dev prefixes (may stack, e.g. "Follow-up: 'Notification: text'")
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of DEV_PREFIXES) {
      const m = cleaned.match(prefix);
      if (m) {
        cleaned = cleaned.slice(m[0].length).trim();
        changed = true;
        break;
      }
    }
  }
  cleaned = stripOuterQuotes(cleaned);
  if (cleaned.length < 4) return null;
  return cleaned;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_ABBR: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
  fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${mStr} ${ampm}`;
}

// Derives badge text from live schedule state — always up-to-date after Save.
function formatScheduleBadge(nudge: Nudge, schedule: ScheduleState): string {
  const { trigger_type, recurrence } = nudge;

  if (trigger_type === 'interval') {
    const freq =
      schedule.intervalMinutes === 60 ? 'Every hour' :
      schedule.intervalMinutes === 90 ? 'Every 90 min' : 'Every 2 hrs';
    return `${freq} · ${formatTime(schedule.activeStart)}–${formatTime(schedule.activeEnd)}`;
  }

  if (trigger_type === 'context') {
    const map: Record<string, string> = {
      post_meal: 'After meals',
      pre_meal: 'Before meals',
      post_workout: 'After workout',
      on_event: 'When triggered',
    };
    const base = map[recurrence] ?? 'Daily reminder';
    if (
      schedule.delayMinutes > 0 &&
      (recurrence === 'post_meal' || recurrence === 'pre_meal' || recurrence === 'post_workout')
    ) {
      return `${base} · +${schedule.delayMinutes} min`;
    }
    return base;
  }

  // time / user_set
  const isWeeklyRec = recurrence.startsWith('weekly:') || recurrence === 'weekly';
  if (isWeeklyRec) {
    const days = schedule.days.length > 0
      ? schedule.days.map(d => DAY_ABBR[d] ?? d).join(', ')
      : 'Select days';
    return `Weekly · ${days} · ${formatTime(schedule.time)}`;
  }
  if (recurrence === 'monthly') return `Monthly · ${formatTime(schedule.time)}`;
  if (recurrence === '3x_week') return `3× a week · ${formatTime(schedule.time)}`;
  return `Daily · ${formatTime(schedule.time)}`;
}

// ─── Inactive notice (shared across all three editors) ────────────────────────

function InactiveNotice() {
  return (
    <div style={{
      background: 'rgba(212,168,67,0.07)',
      border: '1px solid rgba(212,168,67,0.22)',
      borderRadius: '10px',
      padding: '10px 14px',
      marginBottom: '14px',
      fontSize: '12px',
      color: '#8A6210',
      lineHeight: 1.55,
    }}>
      This reminder is currently off. Your schedule will activate when you enable it.
    </div>
  );
}

// ─── Editor chrome (shared wrapper styles) ────────────────────────────────────

const editorWrapStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '18px',
  background: 'rgba(107,143,113,0.05)',
  borderRadius: '14px',
  border: '1px solid rgba(107,143,113,0.15)',
};

const editorLabelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px',
  display: 'block',
};

const editorSubLabelStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600,
  display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em',
};

function EditorActions({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <button
        onClick={onSave}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'var(--color-sage)', color: '#fff',
          border: 'none', borderRadius: '10px', padding: '9px 18px',
          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(107,143,113,0.28)',
        }}
      >
        <Check size={13} strokeWidth={2.5} />
        Save
      </button>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', color: 'var(--color-muted)',
          border: '1.5px solid var(--color-border)', borderRadius: '10px',
          padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}

// ─── Schedule editor: time / user_set nudges ──────────────────────────────────

function TimeScheduleEditor({
  nudge,
  initial,
  enabled,
  onSave,
  onClose,
}: {
  nudge: Nudge;
  initial: ScheduleState;
  enabled: boolean;
  onSave: (s: ScheduleState) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ScheduleState>(initial);
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Show day picker only for genuinely weekly recurrences
  const showDayPicker =
    nudge.recurrence.startsWith('weekly:') ||
    nudge.recurrence === 'weekly' ||
    (nudge.trigger_type === 'user_set' && nudge.recurrence === 'weekly') ||
    (nudge.trigger_type === 'user_set' && nudge.recurrence === '3x_week');

  function toggleDay(d: string) {
    setState(s => ({
      ...s,
      days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d],
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div style={editorWrapStyle}>
        {!enabled && <InactiveNotice />}
        <span style={editorLabelStyle}>Reminder Time</span>

        <div style={{ marginBottom: showDayPicker ? '14px' : '0' }}>
          <label style={editorSubLabelStyle}>Time</label>
          <input
            type="time"
            value={state.time}
            onChange={e => setState(s => ({ ...s, time: e.target.value }))}
            style={{
              fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)',
              background: '#fff', border: '1.5px solid var(--color-border)',
              borderRadius: '10px', padding: '9px 14px',
              outline: 'none', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          />
          {nudge.recurrence === 'daily' && (
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>
              Repeats every day at this time.
            </p>
          )}
        </div>

        {showDayPicker && (
          <div>
            <label style={editorSubLabelStyle}>Days</label>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {DAY_KEYS.map(d => {
                const active = state.days.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      fontSize: '11px', fontWeight: 700,
                      background: active ? 'var(--color-sage)' : '#fff',
                      color: active ? '#fff' : 'var(--color-muted)',
                      border: `1.5px solid ${active ? 'var(--color-sage)' : 'var(--color-border)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: active ? '0 2px 8px rgba(107,143,113,0.30)' : 'none',
                    }}
                  >
                    {DAY_ABBR[d]?.slice(0, 2)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <EditorActions onSave={() => onSave(state)} onClose={onClose} />
      </div>
    </motion.div>
  );
}

// ─── Schedule editor: interval nudges ────────────────────────────────────────

function IntervalScheduleEditor({
  initial,
  enabled,
  onSave,
  onClose,
}: {
  initial: ScheduleState;
  enabled: boolean;
  onSave: (s: ScheduleState) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ScheduleState>(initial);

  const freqOptions = [
    { mins: 60, label: 'Every hour' },
    { mins: 90, label: 'Every 90 minutes' },
    { mins: 120, label: 'Every 2 hours' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div style={editorWrapStyle}>
        {!enabled && <InactiveNotice />}

        <span style={editorLabelStyle}>Reminder Frequency</span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {freqOptions.map(opt => {
            const sel = state.intervalMinutes === opt.mins;
            return (
              <button
                key={opt.mins}
                onClick={() => setState(s => ({ ...s, intervalMinutes: opt.mins }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: sel ? 'rgba(107,143,113,0.10)' : '#fff',
                  border: `1.5px solid ${sel ? 'var(--color-sage)' : 'var(--color-border)'}`,
                  borderRadius: '10px', padding: '10px 14px',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${sel ? 'var(--color-sage)' : 'var(--color-border)'}`,
                  background: sel ? 'var(--color-sage)' : 'transparent',
                  transition: 'all 0.15s',
                }} />
                <span style={{ fontSize: '13px', fontWeight: sel ? 700 : 500, color: sel ? 'var(--color-ink)' : 'var(--color-muted)' }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <label style={editorSubLabelStyle}>Active Hours</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '5px' }}>From</p>
            <input
              type="time"
              value={state.activeStart}
              onChange={e => setState(s => ({ ...s, activeStart: e.target.value }))}
              style={{
                fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)',
                background: '#fff', border: '1.5px solid var(--color-border)',
                borderRadius: '10px', padding: '8px 12px',
                outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
          <span style={{ color: 'var(--color-muted)', fontSize: '13px', paddingTop: '18px' }}>to</span>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '5px' }}>Until</p>
            <input
              type="time"
              value={state.activeEnd}
              onChange={e => setState(s => ({ ...s, activeEnd: e.target.value }))}
              style={{
                fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)',
                background: '#fff', border: '1.5px solid var(--color-border)',
                borderRadius: '10px', padding: '8px 12px',
                outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>
          Reminders will only fire during these hours.
        </p>

        <EditorActions onSave={() => onSave(state)} onClose={onClose} />
      </div>
    </motion.div>
  );
}

// ─── Schedule editor: context nudges ─────────────────────────────────────────

function ContextScheduleEditor({
  nudge,
  initial,
  enabled,
  onSave,
  onClose,
}: {
  nudge: Nudge;
  initial: ScheduleState;
  enabled: boolean;
  onSave: (s: ScheduleState) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ScheduleState>(initial);
  const rec = nudge.recurrence;
  const isMealBased = rec === 'post_meal' || rec === 'pre_meal';
  const isPostWorkout = rec === 'post_workout';
  const isOnEvent = rec === 'on_event';
  const isPost = rec === 'post_meal' || rec === 'post_workout';

  function toggleMeal(meal: string) {
    setState(s => ({
      ...s,
      meals: s.meals.includes(meal)
        ? s.meals.filter(m => m !== meal)
        : [...s.meals, meal],
    }));
  }

  const delayOptions = [
    { mins: 0, label: 'Immediately' },
    { mins: 5, label: '5 minutes' },
    { mins: 10, label: '10 minutes' },
    { mins: 15, label: '15 minutes' },
  ];

  const mealLabels: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div style={editorWrapStyle}>
        {!enabled && <InactiveNotice />}

        {isOnEvent && (
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
            This reminder fires when the relevant event is logged in the app. No additional schedule is needed.
          </p>
        )}

        {isMealBased && (
          <>
            <label style={editorLabelStyle}>
              {rec === 'post_meal' ? 'Trigger After' : 'Trigger Before'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {(['breakfast', 'lunch', 'dinner'] as const).map(meal => {
                const sel = state.meals.includes(meal);
                return (
                  <button
                    key={meal}
                    onClick={() => toggleMeal(meal)}
                    style={{
                      padding: '8px 16px', borderRadius: '22px',
                      fontSize: '12px', fontWeight: 700,
                      background: sel ? 'var(--color-sage)' : '#fff',
                      color: sel ? '#fff' : 'var(--color-muted)',
                      border: `1.5px solid ${sel ? 'var(--color-sage)' : 'var(--color-border)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: sel ? '0 2px 8px rgba(107,143,113,0.28)' : 'none',
                    }}
                  >
                    {mealLabels[meal]}
                  </button>
                );
              })}
            </div>

            <label style={editorLabelStyle}>
              {rec === 'post_meal' ? 'Delay' : 'Lead Time'}
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {delayOptions.map(opt => {
                const sel = state.delayMinutes === opt.mins;
                return (
                  <button
                    key={opt.mins}
                    onClick={() => setState(s => ({ ...s, delayMinutes: opt.mins }))}
                    style={{
                      padding: '7px 14px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 700,
                      background: sel ? 'rgba(107,143,113,0.10)' : '#fff',
                      color: sel ? 'var(--color-sage)' : 'var(--color-muted)',
                      border: `1.5px solid ${sel ? 'var(--color-sage)' : 'var(--color-border)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {isPostWorkout && (
          <>
            <label style={editorLabelStyle}>Delay After Workout</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {delayOptions.map(opt => {
                const sel = state.delayMinutes === opt.mins;
                return (
                  <button
                    key={opt.mins}
                    onClick={() => setState(s => ({ ...s, delayMinutes: opt.mins }))}
                    style={{
                      padding: '7px 14px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 700,
                      background: sel ? 'rgba(107,143,113,0.10)' : '#fff',
                      color: sel ? 'var(--color-sage)' : 'var(--color-muted)',
                      border: `1.5px solid ${sel ? 'var(--color-sage)' : 'var(--color-border)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!isOnEvent && (
          <EditorActions onSave={() => onSave(state)} onClose={onClose} />
        )}
        {isOnEvent && (
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', color: 'var(--color-muted)',
                border: '1.5px solid var(--color-border)', borderRadius: '10px',
                padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Default schedule state factory ──────────────────────────────────────────

function defaultSchedule(nudge: Nudge): ScheduleState {
  const defaultTime = nudge.schedule_time ? (nudge.schedule_time.split(',')[0] ?? '08:00') : '08:00';
  const defaultDays = nudge.recurrence.startsWith('weekly:')
    ? nudge.recurrence.replace('weekly:', '').split(',')
    : [];
  return {
    time: defaultTime,
    days: defaultDays,
    intervalMinutes: 60,
    activeStart: '08:00',
    activeEnd: '20:00',
    meals: ['breakfast', 'lunch', 'dinner'],
    delayMinutes: 0,
  };
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: '46px', height: '26px', borderRadius: '13px',
        background: on ? 'var(--color-sage)' : 'rgba(200,210,202,0.6)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0,
        transition: 'background 0.22s ease',
        boxShadow: on ? '0 2px 8px rgba(107,143,113,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{
        position: 'absolute',
        top: '4px',
        left: on ? '23px' : '4px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 5px rgba(0,0,0,0.20)',
        transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        display: 'block',
      }} />
    </button>
  );
}

// ─── Shared configure button ──────────────────────────────────────────────────

function ConfigureButton({ editing, onClick }: { editing: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: editing ? 'rgba(107,143,113,0.10)' : 'transparent',
        border: `1px solid ${editing ? 'rgba(107,143,113,0.22)' : 'var(--color-border)'}`,
        borderRadius: '9px', padding: '5px 11px',
        fontSize: '11px', fontWeight: 600,
        color: editing ? 'var(--color-sage)' : 'var(--color-muted)',
        cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      <Calendar size={10} strokeWidth={2} />
      Configure
    </button>
  );
}

// ─── Shared editor dispatcher ─────────────────────────────────────────────────

function ScheduleEditorDispatch({
  nudge,
  schedule,
  enabled,
  onSave,
  onClose,
}: {
  nudge: Nudge;
  schedule: ScheduleState;
  enabled: boolean;
  onSave: (s: ScheduleState) => void;
  onClose: () => void;
}) {
  if (nudge.trigger_type === 'interval') {
    return (
      <IntervalScheduleEditor
        initial={schedule}
        enabled={enabled}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }
  if (nudge.trigger_type === 'context') {
    return (
      <ContextScheduleEditor
        nudge={nudge}
        initial={schedule}
        enabled={enabled}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }
  return (
    <TimeScheduleEditor
      nudge={nudge}
      initial={schedule}
      enabled={enabled}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

// ─── NudgeCard ────────────────────────────────────────────────────────────────

function NudgeCard({
  nudge,
  index,
  enabled,
  onToggle,
}: {
  nudge: Nudge;
  index: number;
  enabled: boolean;
  onToggle: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>(() => defaultSchedule(nudge));
  const theme = getCategoryTheme(nudge.health_goal);

  const badge = formatScheduleBadge(nudge, schedule);

  const primaryText = cleanCoachingText(nudge.nudge_primary);
  const followupText = cleanCoachingText(nudge.nudge_followup);
  // Only show followup if it's short enough to be digestible
  const showFollowup = followupText !== null && followupText.length <= 110;

  const statusText =
    !enabled
      ? "Activate to set your reminder schedule."
      : nudge.trigger_type === 'interval'
        ? "Choose how often you'd like reminders."
        : nudge.trigger_type === 'context'
          ? "Choose when this reminder should be triggered."
          : "Choose your reminder schedule.";

  function handleSave(s: ScheduleState) {
    setSchedule(s);
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      className="nudge-card-lift"
      style={{
        background: enabled ? `${theme.gradient}, #fff` : 'rgba(250,250,248,0.8)',
        borderRadius: '20px',
        border: `1.5px solid ${enabled ? theme.accentBorder : 'rgba(232,237,233,0.7)'}`,
        padding: '22px',
        display: 'flex', flexDirection: 'column', gap: '0',
        opacity: enabled ? 1 : 0.58,
        transition: 'opacity 0.22s ease, border-color 0.22s ease, background 0.22s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {enabled && (
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '90px', height: '90px', borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentLight} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Header: icon + category + title + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
          background: enabled ? theme.accentLight : 'rgba(240,243,240,0.8)',
          border: `1px solid ${enabled ? theme.accentBorder : 'rgba(232,237,233,0.6)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.22s, border-color 0.22s',
        }}>
          {theme.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.09em', marginBottom: '4px',
            color: enabled ? theme.accent : 'var(--color-muted)',
            transition: 'color 0.22s',
          }}>
            {nudge.health_goal}
          </p>
          <p style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {nudge.habit}
          </p>
        </div>

        <Toggle on={enabled} onChange={onToggle} />
      </div>

      {/* Primary coaching message */}
      {primaryText && (
        <p style={{
          fontSize: '13px', fontStyle: 'italic',
          color: enabled ? theme.accent : 'var(--color-muted)',
          lineHeight: 1.55, marginBottom: showFollowup ? '8px' : '16px',
          paddingLeft: '60px',
          opacity: enabled ? 0.9 : 0.65,
          transition: 'color 0.22s, opacity 0.22s',
        }}>
          {primaryText}
        </p>
      )}

      {/* Follow-up coaching tip */}
      {showFollowup && (
        <div style={{
          paddingLeft: '60px',
          marginBottom: '14px',
          display: 'flex', alignItems: 'flex-start', gap: '6px',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: theme.accent, opacity: 0.65,
            flexShrink: 0, paddingTop: '2px',
          }}>
            Tip
          </span>
          <p style={{
            fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.55,
            fontStyle: 'italic',
          }}>
            {followupText}
          </p>
        </div>
      )}

      {/* Footer: status chip + badge + configure */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px', paddingLeft: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {/* Active status chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: enabled ? theme.accentLight : 'rgba(232,237,233,0.5)',
            border: `1px solid ${enabled ? theme.accentBorder : 'rgba(232,237,233,0.8)'}`,
            borderRadius: '20px', padding: '4px 10px',
            transition: 'all 0.22s',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: enabled ? theme.accent : '#c8d5ca',
              flexShrink: 0, transition: 'background 0.22s',
            }} />
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
              color: enabled ? theme.accent : 'var(--color-muted)',
              whiteSpace: 'nowrap', transition: 'color 0.22s',
            }}>
              {enabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {/* Live frequency badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            borderRadius: '20px', padding: '4px 10px',
            background: 'rgba(107,143,113,0.06)',
            border: '1px solid rgba(107,143,113,0.12)',
          }}>
            <Clock size={10} strokeWidth={2} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              {badge}
            </span>
          </div>
        </div>

        <ConfigureButton editing={editing} onClick={() => setEditing(e => !e)} />
      </div>

      {/* Helper copy — type-aware */}
      <p style={{
        fontSize: '11px', color: enabled ? theme.accent : 'var(--color-muted)',
        marginTop: '8px', paddingLeft: '60px', fontWeight: 500, opacity: 0.72,
        transition: 'color 0.22s',
      }}>
        {statusText}
      </p>

      {/* Inline schedule editor */}
      <AnimatePresence>
        {editing && (
          <ScheduleEditorDispatch
            key="editor"
            nudge={nudge}
            schedule={schedule}
            enabled={enabled}
            onSave={handleSave}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Featured nudge highlight card ────────────────────────────────────────────

function FeaturedCard({ nudge, enabled, onToggle }: { nudge: Nudge; enabled: boolean; onToggle: () => void }) {
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>(() => defaultSchedule(nudge));
  const theme = getCategoryTheme(nudge.health_goal);
  const primaryText = cleanCoachingText(nudge.nudge_primary);
  const badge = formatScheduleBadge(nudge, schedule);

  function handleSave(s: ScheduleState) {
    setSchedule(s);
    setEditing(false);
  }

  return (
    <div
      className="nudge-featured-card"
      style={{
        background: `linear-gradient(145deg, ${theme.accentLight}, rgba(255,255,255,0.9))`,
        border: `1.5px solid ${theme.accentBorder}`,
        borderRadius: '20px',
        padding: '24px 22px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative', overflow: 'hidden',
        flex: '1 1 0', minWidth: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accentLight} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '52px', height: '52px', borderRadius: '16px',
        background: theme.accentLight, border: `1px solid ${theme.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {theme.icon}
      </div>

      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.accent }}>
        {nudge.health_goal}
      </p>

      <p style={{
        fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)',
        lineHeight: 1.3, marginTop: '-4px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {nudge.habit}
      </p>

      {primaryText && (
        <p style={{
          fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55,
          fontStyle: 'italic',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {primaryText}
        </p>
      )}

      {/* Footer: status + badge + configure + toggle */}
      <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
              color: enabled ? theme.accent : 'var(--color-muted)',
            }}>
              {enabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <span style={{
              fontSize: '10px', color: 'var(--color-muted)', fontWeight: 500,
              background: 'rgba(107,143,113,0.07)', borderRadius: '10px', padding: '2px 7px',
              whiteSpace: 'nowrap',
            }}>
              {badge}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <ConfigureButton editing={editing} onClick={() => setEditing(e => !e)} />
            <Toggle on={enabled} onChange={onToggle} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <ScheduleEditorDispatch
            key="editor"
            nudge={nudge}
            schedule={schedule}
            enabled={enabled}
            onSave={handleSave}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NudgesPage() {
  const [activeGoals, setActiveGoals] = useState<Set<string>>(PRIYA_GOALS);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () => new Set(NUDGES.filter(n => n.default_enabled).map(n => n.id))
  );

  const filtered = useMemo(() => {
    if (activeGoals.size === 0) return NUDGES;
    return NUDGES.filter(n => activeGoals.has(n.health_goal));
  }, [activeGoals]);

  function toggleGoal(goal: string) {
    if (goal === 'All') { setActiveGoals(new Set()); return; }
    setActiveGoals(prev => {
      const next = new Set(prev);
      if (next.has(goal)) next.delete(goal); else next.add(goal);
      return next;
    });
  }

  function toggleNudge(id: string) {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const activeCount = filtered.filter(n => enabledIds.has(n.id)).length;
  const totalActiveCount = NUDGES.filter(n => enabledIds.has(n.id)).length;
  const isAllSelected = activeGoals.size === 0;

  // Diverse recommendations: 1 per goal, prefer enabled + Priya goals, then others.
  // Deliberately NOT based on the current filter so "Recommended" stays stable.
  const featuredNudges = useMemo(() => {
    const seenGoals = new Set<string>();
    const result: Nudge[] = [];

    // Pass 1: enabled nudges from Priya's goals, one per goal
    for (const n of NUDGES) {
      if (result.length >= 3) break;
      if (enabledIds.has(n.id) && PRIYA_GOALS.has(n.health_goal) && !seenGoals.has(n.health_goal)) {
        result.push(n);
        seenGoals.add(n.health_goal);
      }
    }
    // Pass 2: any enabled nudge from a new goal
    for (const n of NUDGES) {
      if (result.length >= 3) break;
      if (enabledIds.has(n.id) && !seenGoals.has(n.health_goal)) {
        result.push(n);
        seenGoals.add(n.health_goal);
      }
    }
    // Pass 3: any nudge from a new goal (fallback)
    for (const n of NUDGES) {
      if (result.length >= 3) break;
      if (!seenGoals.has(n.health_goal)) {
        result.push(n);
        seenGoals.add(n.health_goal);
      }
    }
    return result;
  }, [enabledIds]);

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      <style>{`
        .nudge-mobile-only  { display: block; }
        .nudge-desktop-only { display: none;  }
        @media (min-width: 1024px) {
          .nudge-mobile-only  { display: none !important; }
          .nudge-desktop-only { display: block !important; }
        }
        .nudge-dt-inner       { max-width: 1600px; margin: 0 auto; padding: 0 64px; }
        .nudge-dt-inner-pad   { max-width: 1600px; margin: 0 auto; padding: 56px 64px; }
        .nudge-dt-2col        { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
        .nudge-dt-3col        { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .nudge-pill-row {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .nudge-pill-row::-webkit-scrollbar { display: none; }
        @media (min-width: 1024px) {
          .nudge-card-lift { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
          .nudge-card-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.09); }
          .nudge-featured-card { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
          .nudge-featured-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.10); }
        }
        .nudge-sticky-header {
          position: sticky; top: 56px; z-index: 90;
          background: rgba(13,26,16,0.94);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .nudge-featured-scroll {
          display: flex; gap: 14px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .nudge-featured-scroll::-webkit-scrollbar { display: none; }
        .nudge-featured-scroll > * { flex: 0 0 280px; }
        .nudge-stat-pill { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        @media (min-width: 1024px) {
          .nudge-stat-pill:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(107,143,113,0.20); }
        }
        .nudge-filter-pill { transition: all 0.18s ease; }
        .nudge-filter-pill:hover { transform: translateY(-1px); }
      `}</style>

      {/* ══════════ MOBILE ══════════ */}
      <div className="nudge-mobile-only">

        <div className="nudge-sticky-header" style={{ padding: '0 16px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'rgba(160,205,168,0.85)', fontSize: '14px', fontWeight: 600, minHeight: '44px' }}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Overview
          </a>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.7)', letterSpacing: '0.04em' }}>
            {totalActiveCount} active
          </span>
        </div>

        <div style={{ background: 'linear-gradient(160deg, #0D1A10 0%, #1C2B1E 45%, #2A4030 100%)', padding: '28px 18px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>Your Daily Guidance</p>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '10px' }}>Small actions.<br />Big health wins.</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: '300px', marginBottom: '24px' }}>Personalised nudges designed to help you stay consistent and build healthier habits.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { icon: '🔥', value: '14', label: 'Day Streak' },
              { icon: '✨', value: String(totalActiveCount), label: 'Active' },
              { icon: '💚', value: '87%', label: 'Adherence' },
            ].map(stat => (
              <div key={stat.label} className="nudge-stat-pill" style={{ flex: 1, borderRadius: '14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '3px', fontWeight: 600, letterSpacing: '0.04em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '28px 0 0' }}>
          <div style={{ padding: '0 18px', marginBottom: '14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Recommended</p>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>For You</h2>
          </div>
          <div className="nudge-featured-scroll" style={{ padding: '0 18px 4px' }}>
            {featuredNudges.map(nudge => (
              <FeaturedCard key={nudge.id} nudge={nudge} enabled={enabledIds.has(nudge.id)} onToggle={() => toggleNudge(nudge.id)} />
            ))}
          </div>
        </div>

        <div style={{ padding: '28px 0 0' }}>
          <div style={{ padding: '0 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Filter by goal</p>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>All Nudges</h2>
          </div>
          <div className="nudge-pill-row" style={{ padding: '0 18px 4px' }}>
            {ALL_GOALS.map(goal => {
              const active = goal === 'All' ? isAllSelected : activeGoals.has(goal);
              const isPriya = PRIYA_GOALS.has(goal);
              return (
                <button key={goal} onClick={() => toggleGoal(goal)} className="nudge-filter-pill" style={{ flexShrink: 0, padding: '8px 16px', borderRadius: '22px', fontSize: '12px', fontWeight: 700, background: active ? 'var(--color-sage)' : '#fff', color: active ? '#fff' : 'var(--color-muted)', border: `1.5px solid ${active ? 'var(--color-sage)' : isPriya ? 'rgba(107,143,113,0.30)' : 'var(--color-border)'}`, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: active ? '0 3px 10px rgba(107,143,113,0.28)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {goal}{isPriya && !active && <span style={{ marginLeft: '5px', fontSize: '8px', color: 'var(--color-sage)' }}>●</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '20px 18px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((nudge, i) => (
              <div key={nudge.id}>
                <NudgeCard nudge={nudge} index={i} enabled={enabledIds.has(nudge.id)} onToggle={() => toggleNudge(nudge.id)} />
              </div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '56px 16px', color: 'var(--color-muted)', fontSize: '14px' }}>No nudges for these goals yet.</div>
          )}
        </div>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="nudge-desktop-only">

        <div className="nudge-sticky-header">
          <div className="nudge-dt-inner" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/today" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'rgba(160,205,168,0.85)', fontSize: '14px', fontWeight: 600, minHeight: '44px', transition: 'opacity 0.15s' }} onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.65')} onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}>
              <ChevronLeft size={17} strokeWidth={2.5} />
              Overview
            </a>
            <span style={{ fontSize: '13px', color: 'rgba(160,205,168,0.6)', fontWeight: 500 }}>
              {filtered.length} nudges shown · {activeCount} active
            </span>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0D1A10 0%, #1C2B1E 40%, #2A4030 75%, #1E3828 100%)', paddingTop: '72px', paddingBottom: '64px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', left: '45%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div className="nudge-dt-inner">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '48px' }}>
              <div style={{ maxWidth: '560px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.65)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '14px' }}>Your Daily Guidance</p>
                <h1 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '18px' }}>Small actions.<br />Big health wins.</h1>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: '460px' }}>Personalised nudges designed to help you stay consistent and build healthier habits.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                {[
                  { icon: '🔥', value: '14', label: 'Day Streak' },
                  { icon: '✨', value: String(totalActiveCount), label: 'Active Nudges' },
                  { icon: '💚', value: '87%', label: 'Weekly Adherence' },
                ].map(stat => (
                  <div key={stat.label} className="nudge-stat-pill" style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', padding: '22px 28px', textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '22px', marginBottom: '8px' }}>{stat.icon}</div>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', paddingTop: '56px' }}>
          <div className="nudge-dt-inner">
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Recommended</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>For You</h2>
            </div>
            <div className="nudge-dt-3col">
              {featuredNudges.map(nudge => (
                <FeaturedCard key={nudge.id} nudge={nudge} enabled={enabledIds.has(nudge.id)} onToggle={() => toggleNudge(nudge.id)} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '56px' }}>
          <div className="nudge-dt-inner">
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Filter by Goal</p>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.025em' }}>All Nudges</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500, paddingBottom: '4px' }}>
                {filtered.length} nudges · {activeCount} active
              </p>
            </div>
            <div className="nudge-pill-row" style={{ marginBottom: '40px' }}>
              {ALL_GOALS.map(goal => {
                const active = goal === 'All' ? isAllSelected : activeGoals.has(goal);
                const isPriya = PRIYA_GOALS.has(goal);
                return (
                  <button key={goal} onClick={() => toggleGoal(goal)} className="nudge-filter-pill"
                    style={{ flexShrink: 0, padding: '9px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 700, background: active ? 'var(--color-sage)' : '#fff', color: active ? '#fff' : 'var(--color-muted)', border: `1.5px solid ${active ? 'var(--color-sage)' : isPriya ? 'rgba(107,143,113,0.30)' : 'var(--color-border)'}`, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: active ? '0 4px 14px rgba(107,143,113,0.30)' : '0 1px 4px rgba(0,0,0,0.06)' }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,143,113,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,143,113,0.25)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = isPriya ? 'rgba(107,143,113,0.30)' : 'var(--color-border)'; } }}
                  >
                    {goal}{isPriya && !active && <span style={{ marginLeft: '6px', fontSize: '8px', color: 'var(--color-sage)' }}>●</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="nudge-dt-inner-pad" style={{ paddingTop: '0' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--color-muted)', fontSize: '15px' }}>No nudges for these goals yet.</div>
            ) : (
              <div className="nudge-dt-2col">
                <AnimatePresence mode="popLayout">
                  {filtered.map((nudge, i) => (
                    <div key={nudge.id}>
                      <NudgeCard nudge={nudge} index={i} enabled={enabledIds.has(nudge.id)} onToggle={() => toggleNudge(nudge.id)} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
