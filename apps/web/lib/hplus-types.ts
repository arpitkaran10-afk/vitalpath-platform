// H+ Points engine — types and configuration
// All scoring rules live here so Phase 2 logging integrations use the same config

export const HPLUS_CONFIG = {
  startingScore: 100,
  pointsPerActivity: 2,
  biomarkerPointsPerEntry: 2,
  biomarkerCapMode: 'outside_daily_cap' as const,
  dailyMaxPoints: 30,
  dailyCaps: {
    meals: 14,
    exercise: 6,
    sleep: 2,
    sunlight: 2,
    water: 2,
    meditation: 2,
    medication: 2,
    mood: 2,
  } as const,
  referralPaidMemberBonus: 1000,
  referralMilestoneBonus: 100,
} as const;

export type HPlusCategoryKey =
  | 'meals'
  | 'exercise'
  | 'sleep'
  | 'sunlight'
  | 'water'
  | 'meditation'
  | 'medication'
  | 'mood'
  | 'biomarkers';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface HPlusActivity {
  id: string;
  time: string;           // "08:00 AM"
  category: HPlusCategoryKey;
  title: string;
  subtitle: string;
  points: number;
  isBiomarker: boolean;
  value?: string;         // e.g. "103 mg/dL"
  completed: boolean;
}

export interface HPlusDaySummary {
  date: string;           // "YYYY-MM-DD"
  totalPoints: number;
  activityPoints: number;
  biomarkerPoints: number;
  isPerfect: boolean;
  isFuture: boolean;
  isToday: boolean;
}

export interface HPlusCategoryStats {
  category: HPlusCategoryKey;
  label: string;
  currentPoints: number;
  maxPoints: number;
  completionPct: number;
  color: string;
  bg: string;
  accentBorder: string;
}

export interface HPlusAchievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  tier: AchievementTier;
  iconKey: string;
}

export interface HPlusLeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isCurrentUser: boolean;
  delta?: number;
}

export interface HPlusAnalyticsData {
  period: 'day' | 'week' | 'month';
  labels: string[];
  activityPoints: number[];
  biomarkerPoints: number[];
  combinedScore: number[];
  insights: string[];
}

export interface HPlusReferral {
  id: string;
  name: string;
  status: 'invited' | 'joined' | 'paid' | 'milestone';
  pointsEarned: number;
  joinedDate?: string;
}

export interface HPlusCurrentStats {
  score: number;
  streak: number;
  longestStreak: number;
  todayPoints: number;
  todayMax: number;
  todayBiomarkerPoints: number;
  monthRank: string;
  monthPerfectDays: number;
  perfectWeeks: number;
}
