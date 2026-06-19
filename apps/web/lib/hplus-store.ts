// H+ shared in-memory store
// Module-level singleton — survives Next.js client-side navigation within a session.
// Phase 2: replace with API calls. The listener pattern means components re-render
// automatically when any other component writes.

import { useState, useEffect } from 'react';
import { HPLUS_CONFIG } from './hplus-types';
import type { HPlusCategoryKey } from './hplus-types';

// ─── Internal types ───────────────────────────────────────────────────────────

// ActivityCategory: singular keys used by the Today page logging modal
export type ActivityCategory =
  | 'meal' | 'exercise' | 'water' | 'sleep' | 'sunlight'
  | 'meditation' | 'mood' | 'biomarker';

export interface HPlusEngineState {
  score: number;
  todayPoints: number;
  todayMax: number;
  streak: number;
  longestStreak: number;
  monthPerfectDays: number;
  perfectWeeks: number;
  monthRank: string;
}

export interface CategoryProgress {
  category: string;       // plural key matching HPlusCategoryKey (e.g. 'meals')
  emoji: string;
  label: string;
  current: number;
  max: number;
  hplusMax: number;
  color: string;
  accentBg: string;
}

// Logged action written by the modal
export interface LoggedActivity {
  id: string;
  category: ActivityCategory;
  label: string;
  value?: string;
  loggedAt: Date;
  hplusAwarded: number;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_HPLUS: HPlusEngineState = {
  score: 428,
  todayPoints: 20,
  todayMax: HPLUS_CONFIG.dailyMaxPoints,
  streak: 14,
  longestStreak: 21,
  monthPerfectDays: 18,
  perfectWeeks: 3,
  monthRank: 'Top 12%',
};

const INITIAL_CATEGORIES: CategoryProgress[] = [
  { category: 'meals',       emoji: '🍳', label: 'Meal',       current: 3, max: 7,  hplusMax: 14, color: '#D4A843', accentBg: 'rgba(212,168,67,0.1)' },
  { category: 'exercise',    emoji: '🏃', label: 'Exercise',   current: 1, max: 3,  hplusMax: 6,  color: '#6B8F71', accentBg: 'rgba(107,143,113,0.1)' },
  { category: 'water',       emoji: '💧', label: 'Water',      current: 0, max: 1,  hplusMax: 2,  color: '#5BA8CC', accentBg: 'rgba(91,168,204,0.1)' },
  { category: 'sleep',       emoji: '😴', label: 'Sleep',      current: 1, max: 1,  hplusMax: 2,  color: '#7B8FC8', accentBg: 'rgba(123,143,200,0.1)' },
  { category: 'sunlight',    emoji: '☀️', label: 'Sunlight',   current: 1, max: 1,  hplusMax: 2,  color: '#E8A030', accentBg: 'rgba(232,160,48,0.1)' },
  { category: 'meditation',  emoji: '🧘', label: 'Meditation', current: 0, max: 1,  hplusMax: 2,  color: '#A87BB0', accentBg: 'rgba(168,123,176,0.1)' },
  { category: 'mood',        emoji: '😊', label: 'Mood',       current: 0, max: 1,  hplusMax: 2,  color: '#70A870', accentBg: 'rgba(112,168,112,0.1)' },
  { category: 'biomarkers',  emoji: '🩸', label: 'Biomarkers', current: 2, max: 5,  hplusMax: 10, color: '#4A8BBE', accentBg: 'rgba(74,139,190,0.1)' },
];

// ─── Store shape ──────────────────────────────────────────────────────────────

interface HPlusStore {
  hplus: HPlusEngineState;
  categories: CategoryProgress[];
  loggedToday: Set<string>;
  newActivities: LoggedActivity[];   // activities logged this session (prepended to demo timeline on H+ page)
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'hplus_session_state';

function loadPersistedState(): Partial<HPlusStore> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      hplus: HPlusEngineState;
      categories: CategoryProgress[];
      loggedToday: string[];
      newActivities: Array<Omit<LoggedActivity, 'loggedAt'> & { loggedAt: string }>;
    };
    return {
      hplus: parsed.hplus,
      categories: parsed.categories,
      loggedToday: new Set(parsed.loggedToday),
      newActivities: parsed.newActivities.map(a => ({ ...a, loggedAt: new Date(a.loggedAt) })),
    };
  } catch {
    return null;
  }
}

function persistState(s: HPlusStore) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      hplus: s.hplus,
      categories: s.categories,
      loggedToday: Array.from(s.loggedToday),
      newActivities: s.newActivities.map(a => ({ ...a, loggedAt: a.loggedAt.toISOString() })),
    }));
  } catch {
    // sessionStorage unavailable (private mode, quota exceeded) — silently ignore
  }
}

const persisted = loadPersistedState();

let state: HPlusStore = persisted
  ? {
      hplus: persisted.hplus ?? { ...INITIAL_HPLUS },
      categories: persisted.categories ?? INITIAL_CATEGORIES.map(c => ({ ...c })),
      loggedToday: persisted.loggedToday ?? new Set(),
      newActivities: persisted.newActivities ?? [],
    }
  : {
      hplus: { ...INITIAL_HPLUS },
      categories: INITIAL_CATEGORIES.map(c => ({ ...c })),
      loggedToday: new Set(),
      newActivities: [],
    };

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  persistState(state);
  listeners.forEach(fn => fn());
}

// ─── Public write API ─────────────────────────────────────────────────────────

export function logActivity(category: ActivityCategory, points: number, label: string, value?: string) {
  const catKey = toStoreCatKey(category);

  state = {
    ...state,
    hplus: {
      ...state.hplus,
      score: state.hplus.score + points,
      todayPoints: Math.min(state.hplus.todayPoints + points, state.hplus.todayMax),
    },
    categories: state.categories.map(c =>
      c.category === catKey
        ? { ...c, current: Math.min(c.current + 1, c.max) }
        : c
    ),
    loggedToday: new Set([...state.loggedToday, category]),
    newActivities: [
      ...state.newActivities,
      { id: `${category}-${state.newActivities.length}`, category, label, value, loggedAt: new Date(), hplusAwarded: points },
    ],
  };

  notify();
}

// Map singular (modal) keys → plural (store/H+ page) keys
function toStoreCatKey(cat: ActivityCategory): HPlusCategoryKey {
  const map: Partial<Record<ActivityCategory, HPlusCategoryKey>> = {
    meal:      'meals',
    biomarker: 'biomarkers',
  };
  return map[cat] ?? (cat as HPlusCategoryKey);
}

// ─── Public read API ──────────────────────────────────────────────────────────

export function getState(): Readonly<HPlusStore> {
  return state;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─── React hook ───────────────────────────────────────────────────────────────

export function useHPlusStore() {
  const [snap, setSnap] = useState<HPlusStore>(() => ({ ...getState() }));

  useEffect(() => {
    setSnap({ ...getState() });
    const unsub = subscribe(() => setSnap({ ...getState() }));
    return unsub;
  }, []);

  return snap;
}
