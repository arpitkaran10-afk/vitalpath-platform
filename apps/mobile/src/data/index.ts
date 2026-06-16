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
  category: 'nutrition' | 'activity' | 'sleep' | 'stress' | 'gut';
  name: string;
  completed: boolean;
  streak: number;
}

export interface MetricEntry {
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendLabel: string;
  status: 'good' | 'fair' | 'poor';
  chartData: number[];
}

export interface StoryMember {
  id: string;
  name: string;
  age: number;
  month: ProgrammeMonth;
  headline: string;
  outcomes: string[];
  body: string;
  initials: string;
  color: string;
}

export const PROGRAMME_PHASES: ProgrammePhase[] = [
  {
    month: 1,
    name: 'Awareness & Baseline',
    focus: 'Risk Identification & Nutrition Foundations',
    description: 'Establish your health baseline and build awareness of key risk factors.',
    keyInterventions: ['Comprehensive risk assessment', 'Indian Plate Model introduction', 'Sleep & stress baseline', 'Step tracking setup'],
    goals: ['Log meals for 21 days', 'Walk 5,000 steps daily', 'Sleep 7+ hours, 5 nights/week', 'Complete baseline labs'],
    outcomes: ['Personalized risk profile', 'Nutrition awareness', 'Movement baseline', 'Improved sleep awareness'],
  },
  {
    month: 2,
    name: 'Foundation Building',
    focus: 'Physical Activity & Nutrition Consistency',
    description: 'Build sustainable habits around movement, nutrition, and recovery.',
    keyInterventions: ['Activity progression', 'Protein & fibre focus', 'Beginner resistance training', 'Meal timing'],
    goals: ['Walk 7,000 steps daily', 'Resistance train 2x/week', 'Eat 25g fibre daily', 'Reduce refined carbs by 30%'],
    outcomes: ['Improved stamina', 'Better satiety', 'Muscle tone improvement', 'Stable energy levels'],
  },
  {
    month: 3,
    name: 'Metabolic Correction',
    focus: 'Sleep, Glucose & Gut Health',
    description: 'Tackle underlying metabolic dysfunction with targeted interventions.',
    keyInterventions: ['Sleep hygiene protocol', 'Glycaemic management', 'Gut microbiome support', 'Caffeine optimization'],
    goals: ['Achieve 7.5 hrs sleep', 'Walk 8,000 steps daily', 'Add 2 fermented foods/week', 'Limit caffeine after 2pm'],
    outcomes: ['Better glucose control', 'Improved digestion', 'Higher energy', 'Reduced inflammation'],
  },
  {
    month: 4,
    name: 'Optimisation',
    focus: 'Stress, Micronutrients & Strength',
    description: 'Fine-tune your health with targeted micronutrient and stress strategies.',
    keyInterventions: ['Stress management tools', 'Micronutrient audit', 'Progressive resistance training', 'Mindfulness practice'],
    goals: ['Meditate 10 min daily', 'Walk 8,500 steps daily', 'Resistance train 3x/week', 'Address micronutrient gaps'],
    outcomes: ['Reduced cortisol', 'Optimal vitamin levels', 'Strength gains', 'Mental clarity'],
  },
  {
    month: 5,
    name: 'Sustainability',
    focus: 'Relapse Prevention & Self-Monitoring',
    description: 'Build resilience and self-monitoring skills for long-term success.',
    keyInterventions: ['Relapse prevention planning', 'Self-monitoring techniques', 'Health literacy building', 'Behavior sustainability'],
    goals: ['Walk 9,000 steps daily', 'Handle 2 challenging situations', 'Teach one habit to a family member', 'Plan for social eating'],
    outcomes: ['Long-term habit retention', 'Emotional regulation', 'Family health influence', 'Social confidence'],
  },
  {
    month: 6,
    name: 'Consolidation',
    focus: 'Performance & Final Review',
    description: 'Celebrate your transformation and plan your ongoing health journey.',
    keyInterventions: ['Final biomarker review', 'Social eating strategies', 'Workplace health plan', '12-month wellness roadmap'],
    goals: ['Walk 10,000 steps daily', 'Complete final labs', 'Create wellness plan', 'Share your story'],
    outcomes: ['Full health transformation', 'Sustainable lifestyle', 'Reduced disease risk', 'Empowered health management'],
  },
];

export const STEP_GOALS: Record<ProgrammeMonth, number> = {
  1: 5000, 2: 7000, 3: 8000, 4: 8500, 5: 9000, 6: 10000,
};

export const TODAY_HABITS: HabitEntry[] = [
  { id: '1', category: 'nutrition', name: 'Eat protein with every meal', completed: true, streak: 14 },
  { id: '2', category: 'activity', name: 'Walk 7,000 steps', completed: true, streak: 8 },
  { id: '3', category: 'nutrition', name: 'Fill half your plate with vegetables', completed: false, streak: 3 },
  { id: '4', category: 'sleep', name: 'Sleep by 10:30 PM', completed: false, streak: 5 },
  { id: '5', category: 'gut', name: 'Eat one fermented food', completed: true, streak: 2 },
  { id: '6', category: 'stress', name: 'Mindfulness for 10 minutes', completed: false, streak: 0 },
];

export const TODAY_METRICS: MetricEntry[] = [
  {
    label: 'Steps',
    value: '6,842',
    unit: 'steps',
    trend: 'up',
    trendLabel: '+12% this week',
    status: 'good',
    chartData: [4200, 5100, 6000, 5800, 7100, 6500, 6842],
  },
  {
    label: 'Sleep',
    value: '7.2',
    unit: 'hrs',
    trend: 'up',
    trendLabel: '+0.5 hrs avg',
    status: 'good',
    chartData: [6.5, 6.8, 7.0, 6.2, 7.5, 7.3, 7.2],
  },
  {
    label: 'Nutrition',
    value: '3/5',
    unit: 'habits',
    trend: 'stable',
    trendLabel: 'On track',
    status: 'fair',
    chartData: [2, 3, 4, 3, 5, 3, 3],
  },
];

export const PROGRESS_METRICS = [
  {
    key: 'weight',
    label: 'Weight',
    unit: 'kg',
    current: '82.4',
    baseline: '88.0',
    target: '75.0',
    change: '-5.6',
    data: [88, 87.2, 86.1, 85.0, 83.8, 82.4],
  },
  {
    key: 'waist',
    label: 'Waist',
    unit: 'cm',
    current: '94',
    baseline: '102',
    target: '88',
    change: '-8',
    data: [102, 100, 98, 97, 95, 94],
  },
  {
    key: 'glucose',
    label: 'Blood Glucose',
    unit: 'mg/dL',
    current: '118',
    baseline: '134',
    target: '100',
    change: '-16',
    data: [134, 130, 126, 124, 120, 118],
  },
  {
    key: 'bp',
    label: 'Blood Pressure',
    unit: 'mmHg',
    current: '128/84',
    baseline: '142/92',
    target: '120/80',
    change: '-14/-8',
    data: [142, 138, 135, 133, 130, 128],
  },
];

export const COMMUNITY_STORIES: StoryMember[] = [
  {
    id: '1',
    name: 'Priya S.',
    age: 42,
    month: 2,
    headline: 'Lost 6kg and reversed pre-diabetes in just 2 months',
    outcomes: ['Lost 6.2 kg', 'HbA1c: 6.1 → 5.4', 'Energy +40%'],
    body: 'I was skeptical at first, but VitalPath\'s systematic approach changed everything. The daily habit tracking made me realize how small changes compound over time. My doctor is amazed at my blood work.',
    initials: 'PS',
    color: '#1B6CA8',
  },
  {
    id: '2',
    name: 'Rahul M.',
    age: 51,
    month: 3,
    headline: 'Blood pressure normalized after years of medication',
    outcomes: ['BP: 142/92 → 124/80', 'Reduced meds by 50%', 'Walking 9,000 steps daily'],
    body: 'My cardiologist was the one who recommended VitalPath. After 3 months, my BP is the best it\'s been in a decade. The coach check-ins kept me accountable when I wanted to give up.',
    initials: 'RM',
    color: '#00897B',
  },
  {
    id: '3',
    name: 'Deepa K.',
    age: 38,
    month: 1,
    headline: 'Finally sleeping 8 hours and feeling like myself again',
    outcomes: ['Sleep: 5.5 → 8 hrs', 'Stress score -35%', 'Lost 3.5 kg'],
    body: 'Sleep was always my weakness. The Month 1 sleep protocol felt simple but had a huge impact. Within two weeks I was falling asleep faster and waking up refreshed for the first time in years.',
    initials: 'DK',
    color: '#F57C00',
  },
  {
    id: '4',
    name: 'Amit B.',
    age: 46,
    month: 2,
    headline: 'Dropped 8kg and my cholesterol is now in the healthy range',
    outcomes: ['Lost 8.1 kg', 'LDL: 168 → 124', 'Steps avg: 9,200/day'],
    body: 'The Indian Plate Model was a revelation. I didn\'t realize how poorly I was eating until I tracked it. The small tweaks VitalPath suggested for Indian food made this sustainable for my lifestyle.',
    initials: 'AB',
    color: '#7B1FA2',
  },
  {
    id: '5',
    name: 'Sunita R.',
    age: 55,
    month: 3,
    headline: 'Managing type 2 diabetes with diet and exercise alone',
    outcomes: ['HbA1c: 7.8 → 6.2', 'Off Metformin', 'Glucose stable all day'],
    body: 'When Dr. Rao said I might be able to reduce my diabetes medication, I didn\'t believe it. Six months later, my endocrinologist has taken me off Metformin. VitalPath gave me my life back.',
    initials: 'SR',
    color: '#C62828',
  },
];

export const MEMBER_PROFILE = {
  name: 'Arjun Sharma',
  age: 44,
  email: 'arjun.sharma@example.com',
  currentMonth: 2 as ProgrammeMonth,
  startDate: '2026-01-10',
  riskCategory: 'moderate' as RiskCategory,
  coach: 'Dr. Ananya Rao',
  nextSession: 'Thu, Jun 12 at 6:00 PM',
  completionPercent: 67,
  streakDays: 14,
};

export const CATEGORY_COLORS: Record<string, string> = {
  nutrition: '#1B6CA8',
  activity: '#00897B',
  sleep: '#7B1FA2',
  stress: '#F57C00',
  gut: '#C62828',
};

export const CATEGORY_ICONS: Record<string, string> = {
  nutrition: '🥗',
  activity: '🏃',
  sleep: '😴',
  stress: '🧘',
  gut: '🌿',
};
