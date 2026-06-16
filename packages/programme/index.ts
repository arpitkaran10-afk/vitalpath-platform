import type { ProgrammePhase, ProgrammeMonth } from '@health-coaching/types';

export const PROGRAMME_PHASES: ProgrammePhase[] = [
  {
    month: 1,
    name: 'Awareness & Baseline Correction',
    focus: 'Risk Identification & Nutrition Foundations',
    description: 'Understand your current health baseline and begin building foundational habits.',
    keyInterventions: [
      'Lab review & metabolic risk stratification',
      'Meal structure & protein awareness',
      'Sleep & stress assessment',
      'Step tracking initiation',
    ],
    goals: [
      'Build awareness of current health status',
      'Start meal and habit tracking',
      'Establish basic movement and hydration habits',
      'Define SMART health goals',
    ],
    outcomes: [
      'Baseline labs completed',
      'Risk category assigned',
      'App engagement activated',
      'Initial adherence established',
    ],
  },
  {
    month: 2,
    name: 'Foundation Building',
    focus: 'Physical Activity & Nutrition Consistency',
    description: 'Build structured eating and movement habits with progressive targets.',
    keyInterventions: [
      'Indian Plate Model & protein optimisation',
      'Step progression (6K–8K daily)',
      'Beginner resistance training 2×/week',
      'Sugary drink elimination',
    ],
    goals: [
      'Build structured eating habits',
      'Improve movement consistency',
      'Reduce processed food intake',
      'Improve daily routine adherence',
    ],
    outcomes: [
      'Weight and waist trend improvement',
      'Increased daily step average',
      'Improved meal adherence',
    ],
  },
  {
    month: 3,
    name: 'Metabolic Correction',
    focus: 'Sleep & Glycaemic Management',
    description: 'Optimise sleep quality and blood sugar stability for metabolic health.',
    keyInterventions: [
      'Sleep hygiene protocol & screen curfew',
      'Glycaemic load reduction & meal sequencing',
      'Probiotic & gut health integration',
      'Caffeine timing optimisation',
    ],
    goals: [
      'Improve sleep quality and recovery',
      'Reduce blood sugar spikes',
      'Strengthen gut-health behaviours',
      'Reinforce healthy routines',
    ],
    outcomes: [
      'Better sleep consistency',
      'Improved digestion and energy',
      'Improved FBG/HbA1c trends',
    ],
  },
  {
    month: 4,
    name: 'Optimisation & Integration',
    focus: 'Stress & Mental Wellbeing',
    description: 'Address stress, micronutrient gaps, and consolidate multi-pillar habits.',
    keyInterventions: [
      'Breathwork & mindfulness practices',
      'Cortisol & emotional eating support',
      'Micronutrient optimisation (Vit D, B12, Iron)',
      'Resistance training progression',
    ],
    goals: [
      'Improve emotional regulation',
      'Reduce stress-driven eating',
      'Increase exercise confidence',
      'Consolidate multi-pillar habits',
    ],
    outcomes: [
      'Reduced stress and emotional eating',
      'Improved exercise adherence',
      'Better BP and energy levels',
    ],
  },
  {
    month: 5,
    name: 'Sustainability & Transition',
    focus: 'Gut Health & Behaviour Sustainability',
    description: 'Build independent health management skills and long-term sustainability.',
    keyInterventions: [
      'Probiotic/prebiotic food integration',
      'Relapse prevention planning',
      'Self-monitoring & health literacy',
      'If-then coping strategies',
    ],
    goals: [
      'Build independent health management skills',
      'Improve long-term nutrition sustainability',
      'Develop relapse coping strategies',
    ],
    outcomes: [
      'Improved self-monitoring capability',
      'Higher health literacy',
      'Sustainable routine integration',
    ],
  },
  {
    month: 6,
    name: 'Consolidation & Performance',
    focus: 'Biomarker Tracking & Long-Term Maintenance',
    description: 'Final biomarker review, celebrate progress, and establish a self-managed wellness plan.',
    keyInterventions: [
      'Final biomarker review & comparison',
      'Workplace & social eating strategies',
      'Body composition tracking',
      'Sustainability planning & graduation',
    ],
    goals: [
      'Maintain habits independently',
      'Navigate social/workplace eating confidently',
      'Transition to self-managed wellness',
    ],
    outcomes: [
      'Final biomarker comparison completed',
      'Weight, waist & vitals improvement documented',
      'Programme completion and sustainability plan established',
    ],
  },
];

export const DEFAULT_DAILY_HABITS: Record<ProgrammeMonth, string[]> = {
  1: [
    'Log all meals',
    'Drink 8 glasses of water',
    'Walk 5,000 steps',
    'Sleep 7+ hours',
    'Record your health goal',
  ],
  2: [
    'Follow the Plate Model at lunch',
    'Walk 6,000–8,000 steps',
    'Do beginner resistance training',
    'Avoid sugary drinks',
    'Log meals with protein rating',
  ],
  3: [
    'Screen-free 30 min before bed',
    'Post-meal walk after dinner',
    'No caffeine after 2pm',
    'Eat vegetables before carbs',
    'Log sleep quality',
  ],
  4: [
    '5-min breathing exercise',
    'Walk 8,000+ steps',
    'Resistance training 2×/week',
    'Journal stress triggers',
    'Take prescribed supplements',
  ],
  5: [
    'Include a probiotic food',
    'Plan meals for tomorrow',
    'Practice one coping strategy',
    'Read one nutrition label',
    'Self-monitor without coach prompt',
  ],
  6: [
    'Maintain all core habits',
    'Log workplace/social eating',
    'Track body composition metric',
    'Review sustainability plan',
    'Celebrate a non-scale victory',
  ],
};

export const STEP_GOALS: Record<ProgrammeMonth, number> = {
  1: 5000,
  2: 7000,
  3: 8000,
  4: 8500,
  5: 9000,
  6: 10000,
};

export const SLEEP_GOAL_HOURS = 7.5;

export function getCurrentPhase(month: ProgrammeMonth): ProgrammePhase {
  return PROGRAMME_PHASES[month - 1];
}

export function getMonthFromStartDate(startDate: string): ProgrammeMonth {
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const clamped = Math.min(Math.max(months + 1, 1), 6) as ProgrammeMonth;
  return clamped;
}
