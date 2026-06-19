// H+ Points — demo data layer
// Phase 2: replace these functions with real logging API calls

import {
  HPLUS_CONFIG,
  HPlusActivity,
  HPlusDaySummary,
  HPlusCategoryStats,
  HPlusAchievement,
  HPlusLeaderboardEntry,
  HPlusAnalyticsData,
  HPlusReferral,
  HPlusCurrentStats,
} from './hplus-types';

// ─── Current member stats ─────────────────────────────────────────────────────

export function getCurrentStats(): HPlusCurrentStats {
  return {
    score: 428,
    streak: 14,
    longestStreak: 21,
    todayPoints: 20,
    todayMax: HPLUS_CONFIG.dailyMaxPoints,
    todayBiomarkerPoints: 4,
    monthRank: 'Top 12%',
    monthPerfectDays: 18,
    perfectWeeks: 3,
  };
}

// ─── Today's activity timeline ────────────────────────────────────────────────

export function getTodayActivities(): HPlusActivity[] {
  return [
    {
      id: 'a1',
      time: '06:30 AM',
      category: 'sunlight',
      title: 'Morning Sunlight',
      subtitle: '10 min outdoor walk',
      points: 2,
      isBiomarker: false,
      completed: true,
    },
    {
      id: 'a2',
      time: '08:00 AM',
      category: 'meals',
      title: 'Energy Boost',
      subtitle: 'Soaked Walnut + Almonds',
      points: 2,
      isBiomarker: false,
      completed: true,
    },
    {
      id: 'a3',
      time: '09:00 AM',
      category: 'meals',
      title: 'Breakfast',
      subtitle: 'Millet Roti + Chole',
      points: 2,
      isBiomarker: false,
      completed: true,
    },
    {
      id: 'a4',
      time: '11:07 AM',
      category: 'biomarkers',
      title: 'Blood Glucose',
      subtitle: '103 mg/dL',
      value: '103 mg/dL',
      points: 2,
      isBiomarker: true,
      completed: true,
    },
    {
      id: 'a5',
      time: '11:07 AM',
      category: 'biomarkers',
      title: 'Blood Pressure',
      subtitle: '119/79 mmHg',
      value: '119/79',
      points: 2,
      isBiomarker: true,
      completed: true,
    },
    {
      id: 'a6',
      time: '11:11 AM',
      category: 'exercise',
      title: 'Gym',
      subtitle: '25 minutes strength training',
      points: 2,
      isBiomarker: false,
      completed: true,
    },
    {
      id: 'a7',
      time: '12:00 PM',
      category: 'water',
      title: 'Water Intake',
      subtitle: '500 ml',
      points: 2,
      isBiomarker: false,
      completed: true,
    },
    {
      id: 'a8',
      time: '01:30 PM',
      category: 'meals',
      title: 'Lunch',
      subtitle: 'Dal Khichdi + Raita',
      points: 2,
      isBiomarker: false,
      completed: false,
    },
    {
      id: 'a9',
      time: '04:00 PM',
      category: 'meditation',
      title: 'Afternoon Meditation',
      subtitle: '10 min guided session',
      points: 2,
      isBiomarker: false,
      completed: false,
    },
    {
      id: 'a10',
      time: '07:00 PM',
      category: 'medication',
      title: 'Evening Medication',
      subtitle: 'Metformin 500mg',
      points: 2,
      isBiomarker: false,
      completed: false,
    },
  ];
}

// ─── Analytics data ───────────────────────────────────────────────────────────

export function getAnalyticsData(period: 'day' | 'week' | 'month'): HPlusAnalyticsData {
  if (period === 'day') {
    return {
      period: 'day',
      labels: ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
      activityPoints: [2, 4, 6, 10, 12, 12, 12, 12],
      biomarkerPoints: [0, 0, 4, 4, 4, 4, 4, 4],
      combinedScore: [2, 4, 10, 14, 16, 16, 16, 16],
      insights: [
        'Your most active period is 10–11 AM.',
        'Logging biomarkers before noon is your strongest habit.',
        '4 more points and you hit today\'s 30 H+ target.',
      ],
    };
  }

  if (period === 'week') {
    return {
      period: 'week',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      activityPoints: [24, 28, 30, 26, 30, 18, 20],
      biomarkerPoints: [4, 4, 6, 4, 6, 2, 4],
      combinedScore: [28, 32, 36, 30, 36, 20, 24],
      insights: [
        'You earn 38% more points on weekdays.',
        'Wednesday and Friday are your strongest days.',
        'Weekend consistency is your next growth opportunity.',
      ],
    };
  }

  return {
    period: 'month',
    labels: ['Jun 1', 'Jun 5', 'Jun 9', 'Jun 13', 'Jun 17', 'Jun 21', 'Jun 25', 'Jun 30'],
    activityPoints: [20, 22, 28, 30, 26, 30, 28, 20],
    biomarkerPoints: [2, 4, 4, 6, 4, 6, 4, 4],
    combinedScore: [22, 26, 32, 36, 30, 36, 32, 24],
    insights: [
      'Most of your points come from meal consistency.',
      'Blood glucose logging is your most consistent biomarker habit.',
      'You had 18 perfect 30-point days this month.',
    ],
  };
}

// ─── Category breakdown ───────────────────────────────────────────────────────

export function getCategoryBreakdown(): HPlusCategoryStats[] {
  return [
    {
      category: 'meals',
      label: 'Meals',
      currentPoints: 6,
      maxPoints: 14,
      completionPct: 43,
      color: '#D4A843',
      bg: 'rgba(212,168,67,0.1)',
      accentBorder: 'rgba(212,168,67,0.3)',
    },
    {
      category: 'exercise',
      label: 'Exercise',
      currentPoints: 2,
      maxPoints: 6,
      completionPct: 33,
      color: '#6B8F71',
      bg: 'rgba(107,143,113,0.1)',
      accentBorder: 'rgba(107,143,113,0.3)',
    },
    {
      category: 'sleep',
      label: 'Sleep',
      currentPoints: 2,
      maxPoints: 2,
      completionPct: 100,
      color: '#7B8FC8',
      bg: 'rgba(123,143,200,0.1)',
      accentBorder: 'rgba(123,143,200,0.3)',
    },
    {
      category: 'sunlight',
      label: 'Sunlight',
      currentPoints: 2,
      maxPoints: 2,
      completionPct: 100,
      color: '#E8A030',
      bg: 'rgba(232,160,48,0.1)',
      accentBorder: 'rgba(232,160,48,0.3)',
    },
    {
      category: 'water',
      label: 'Water',
      currentPoints: 2,
      maxPoints: 2,
      completionPct: 100,
      color: '#5BA8CC',
      bg: 'rgba(91,168,204,0.1)',
      accentBorder: 'rgba(91,168,204,0.3)',
    },
    {
      category: 'meditation',
      label: 'Meditation',
      currentPoints: 0,
      maxPoints: 2,
      completionPct: 0,
      color: '#A87BB0',
      bg: 'rgba(168,123,176,0.1)',
      accentBorder: 'rgba(168,123,176,0.3)',
    },
    {
      category: 'medication',
      label: 'Medication',
      currentPoints: 0,
      maxPoints: 2,
      completionPct: 0,
      color: '#C8604A',
      bg: 'rgba(200,96,74,0.1)',
      accentBorder: 'rgba(200,96,74,0.3)',
    },
    {
      category: 'mood',
      label: 'Mood',
      currentPoints: 0,
      maxPoints: 2,
      completionPct: 0,
      color: '#70A870',
      bg: 'rgba(112,168,112,0.1)',
      accentBorder: 'rgba(112,168,112,0.3)',
    },
    {
      category: 'biomarkers',
      label: 'Biomarkers',
      currentPoints: 4,
      maxPoints: 10,
      completionPct: 40,
      color: '#4A8BBE',
      bg: 'rgba(74,139,190,0.1)',
      accentBorder: 'rgba(74,139,190,0.3)',
    },
  ];
}

// ─── Monthly calendar ─────────────────────────────────────────────────────────

export function getMonthCalendar(): HPlusDaySummary[] {
  const today = 18; // demo: June 18
  const days: HPlusDaySummary[] = [];

  const perfectDays = new Set([1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17]);
  const partialDays = new Set([3, 10]);

  for (let d = 1; d <= 30; d++) {
    const isPerfect = perfectDays.has(d);
    const isPartial = partialDays.has(d);
    const isFuture = d > today;
    const isToday = d === today;

    days.push({
      date: `2026-06-${String(d).padStart(2, '0')}`,
      totalPoints: isFuture ? 0 : isPerfect ? 30 : isPartial ? 16 : isToday ? 20 : 0,
      activityPoints: isFuture ? 0 : isPerfect ? 24 : isPartial ? 12 : isToday ? 16 : 0,
      biomarkerPoints: isFuture ? 0 : isPerfect ? 6 : isPartial ? 4 : isToday ? 4 : 0,
      isPerfect: !isFuture && isPerfect,
      isFuture,
      isToday,
    });
  }

  return days;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function getAchievements(): HPlusAchievement[] {
  return [
    {
      id: 'first100',
      title: 'First 100',
      description: 'Reached 100 H+ points',
      earned: true,
      earnedDate: 'Jun 3, 2026',
      tier: 'bronze',
      iconKey: 'star',
    },
    {
      id: 'streak7',
      title: '7-Day Streak',
      description: 'Logged activity 7 days in a row',
      earned: true,
      earnedDate: 'Jun 8, 2026',
      tier: 'silver',
      iconKey: 'flame',
    },
    {
      id: 'biomarkers10',
      title: 'Biomarker Champion',
      description: 'Logged biomarkers 10 times',
      earned: true,
      earnedDate: 'Jun 11, 2026',
      tier: 'silver',
      iconKey: 'activity',
    },
    {
      id: 'perfect30',
      title: 'Perfect Day',
      description: 'Scored 30 H+ in a single day',
      earned: true,
      earnedDate: 'Jun 9, 2026',
      tier: 'gold',
      iconKey: 'sun',
    },
    {
      id: 'streak14',
      title: '14-Day Streak',
      description: 'Logged activity 14 days in a row',
      earned: true,
      earnedDate: 'Jun 18, 2026',
      tier: 'gold',
      iconKey: 'zap',
    },
    {
      id: 'monthchampion',
      title: 'Month Champion',
      description: '18 perfect days in a calendar month',
      earned: false,
      tier: 'platinum',
      iconKey: 'trophy',
    },
    {
      id: 'streak21',
      title: '21-Day Streak',
      description: 'The habit formation milestone',
      earned: false,
      tier: 'platinum',
      iconKey: 'crown',
    },
    {
      id: 'referral1',
      title: 'Health Ambassador',
      description: 'Referred someone who became a member',
      earned: false,
      tier: 'gold',
      iconKey: 'users',
    },
  ];
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function getLeaderboardPreview(): HPlusLeaderboardEntry[] {
  return [
    { rank: 1, name: 'Rajesh K.', score: 612, isCurrentUser: false, delta: 3 },
    { rank: 2, name: 'Priya S.', score: 588, isCurrentUser: false, delta: -1 },
    { rank: 3, name: 'Meera R.', score: 571, isCurrentUser: false, delta: 0 },
    { rank: 12, name: 'You', score: 428, isCurrentUser: true, delta: 2 },
  ];
}

// ─── Referrals ────────────────────────────────────────────────────────────────

export function getReferrals(): HPlusReferral[] {
  return [
    {
      id: 'r1',
      name: 'Anita M.',
      status: 'milestone',
      pointsEarned: 100,
      joinedDate: 'Jun 5, 2026',
    },
    {
      id: 'r2',
      name: 'Vikram T.',
      status: 'paid',
      pointsEarned: 1000,
      joinedDate: 'May 28, 2026',
    },
    {
      id: 'r3',
      name: 'Sunita L.',
      status: 'joined',
      pointsEarned: 0,
      joinedDate: 'Jun 14, 2026',
    },
  ];
}
