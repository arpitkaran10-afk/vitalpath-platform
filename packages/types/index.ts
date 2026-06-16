export type RiskCategory = 'low' | 'moderate' | 'high';

export type ProgrammeMonth = 1 | 2 | 3 | 4 | 5 | 6;

export interface ProgrammePhase {
  month: ProgrammeMonth;
  name: string;
  focus: string;
  description: string;
  keyInterventions: string[];
  goals: string[];
  outcomes: string[];
}

export interface HabitEntry {
  id: string;
  date: string; // ISO date string
  category: 'nutrition' | 'activity' | 'sleep' | 'stress' | 'gut';
  name: string;
  completed: boolean;
  notes?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  proteinRating: 1 | 2 | 3 | 4 | 5;
  fibreRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface StepEntry {
  id: string;
  date: string;
  steps: number;
  goal: number;
  activeMinutes?: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string; // HH:MM
  wakeTime: string; // HH:MM
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  currentMonth: ProgrammeMonth;
  startDate: string;
  riskCategory: RiskCategory;
}

export interface DailyLog {
  date: string;
  habits: HabitEntry[];
  meals: MealEntry[];
  steps?: StepEntry;
  sleep?: SleepEntry;
}
