'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Droplets,
  Target, Leaf, ChefHat, Activity, Sun, Wind, Moon,
  Star, ArrowRight, CheckCircle2, Zap, Sparkles,
} from 'lucide-react';

const HAS_COACHING = true;
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const MEMBER = {
  name: 'Priya', day: 14, totalDays: 180,
  streak: 14, weeklyAdherence: 72,
  goal: 'Lose Weight', condition: 'Prediabetes',
  preference: 'Vegetarian', cuisine: 'Maharashtrian',
  totalActivities: 10,
};

const MOTIVATION_QUOTES = [
  'Small actions repeated consistently create extraordinary results.',
  'Every healthy choice today moves you closer to the life you want.',
  'You are building the strongest version of yourself — one day at a time.',
  'Progress is not always visible. But it is always happening.',
];

const WEEK_DAYS = [
  { label: 'Mon', done: true }, { label: 'Tue', done: true }, { label: 'Wed', active: true },
  { label: 'Thu', done: false }, { label: 'Fri', done: false }, { label: 'Sat', done: false }, { label: 'Sun', done: false },
];

// ── Meal data with real photography ──────────────────────────────────────────

interface MealOption {
  name: string; kcal: number; protein: number; fibre: number;
  desc: string; tag: string; img: string;
}

const BREAKFAST_MEALS: MealOption[] = [
  {
    name: 'Moong Dal Chilla',
    kcal: 320, protein: 22, fibre: 6, tag: 'High Protein',
    desc: 'High-protein savoury pancake designed to keep you full and energised all morning.',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  },
  {
    name: 'Poha with Sprouts',
    kcal: 290, protein: 14, fibre: 5, tag: 'Light & Easy',
    desc: 'Light, easily digestible and rich in iron. A classic morning reset for sustained focus.',
    img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  },
  {
    name: 'Besan Chilla',
    kcal: 310, protein: 18, fibre: 5, tag: 'Glucose Friendly',
    desc: 'Gram flour pancake that provides steady energy and helps manage blood sugar through the morning.',
    img: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80',
  },
];

const LUNCH_MEALS: MealOption[] = [
  {
    name: 'Jowar Bhakri with Dal',
    kcal: 480, protein: 24, fibre: 9, tag: 'Balanced',
    desc: 'Ancient grain paired with protein-rich dal. Keeps you full and energised through the afternoon.',
    img: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&q=80',
  },
  {
    name: 'Millet Khichdi',
    kcal: 440, protein: 20, fibre: 8, tag: 'Low GI',
    desc: 'One-pot nourishment with complex carbs and plant protein. Comfort food that loves you back.',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  },
  {
    name: 'Bajra Roti & Sabzi',
    kcal: 420, protein: 18, fibre: 10, tag: 'High Fibre',
    desc: 'Pearl millet flatbread with seasonal vegetables. High fibre, deeply satisfying, traditionally rooted.',
    img: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&q=80',
  },
];

const DINNER_MEALS: MealOption[] = [
  {
    name: 'Mixed Dal & Vegetables',
    kcal: 350, protein: 18, fibre: 7, tag: 'Light',
    desc: 'Light, protein-forward dinner that supports overnight recovery and wakes you up refreshed.',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  },
  {
    name: 'Palak Dal',
    kcal: 320, protein: 16, fibre: 8, tag: 'Iron Rich',
    desc: 'Iron and protein-rich spinach lentil soup. Deeply nourishing and ideal for evening recovery.',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
  },
  {
    name: 'Zunka Bhakri',
    kcal: 360, protein: 14, fibre: 6, tag: 'Traditional',
    desc: 'Traditional Maharashtrian dry-spiced chickpea flour dish with millet roti. Comforting and familiar.',
    img: 'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=600&q=80',
  },
];

interface SnackOption {
  name: string; kcal: number; protein: number; desc: string; img: string;
}

const SNACK_OPTIONS: SnackOption[] = [
  {
    name: 'Roasted Chana', kcal: 160, protein: 8,
    desc: 'High-protein legume snack. Crunchy, satisfying, and perfect for glucose stability.',
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80',
  },
  {
    name: 'Makhana (Fox Nuts)', kcal: 140, protein: 5,
    desc: 'Ancient Indian superfood. Low calorie, rich in antioxidants and magnesium.',
    img: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2a?w=600&q=80',
  },
  {
    name: 'Cucumber & Lime', kcal: 40, protein: 1,
    desc: 'Hydrating, refreshing, virtually zero-calorie. Ideal for afternoon glucose control.',
    img: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&q=80',
  },
];

// ── Recommendation data with real photography ─────────────────────────────────

interface RecOption {
  title: string; benefits: string[]; detail: string; img: string;
}

const REC_HYDRATION_MORNING: RecOption[] = [
  {
    title: 'Lukewarm Water + Lemon + Fenugreek',
    benefits: ['Hydration', 'Digestion', 'Blood Sugar Support'],
    detail: 'Fenugreek seeds soaked overnight help regulate morning glucose levels — especially beneficial for managing prediabetes.',
    img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
  },
  {
    title: 'Warm Jeera (Cumin) Water',
    benefits: ['Metabolism Boost', 'Digestion', 'Anti-Bloating'],
    detail: 'Cumin is a digestive powerhouse. A warm glass before eating activates enzymes and sets your gut up for the day.',
    img: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=600&q=80',
  },
  {
    title: 'Plain Warm Water + Turmeric',
    benefits: ['Anti-Inflammatory', 'Liver Support', 'Immunity'],
    detail: 'Curcumin in turmeric reduces systemic inflammation. Starting your day with this creates a cumulative effect over weeks.',
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80',
  },
];

const REC_WALK_MORNING: RecOption[] = [
  {
    title: '15 Minute Morning Walk',
    benefits: ['Glucose Management', 'Mental Clarity', 'Energy Boost'],
    detail: 'Morning movement activates your metabolism and lowers post-sleep glucose levels. Even 15 minutes creates measurable impact.',
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
  },
  {
    title: 'Morning Sun Exposure Walk',
    benefits: ['Vitamin D', 'Circadian Reset', 'Mood Lift'],
    detail: 'Early sunlight sets your circadian rhythm, improving sleep quality tonight and energy levels throughout today.',
    img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=600&q=80',
  },
];

const REC_MID_MORNING: RecOption[] = [
  {
    title: 'Maharashtrian Buttermilk (Taak)',
    benefits: ['Gut Health', 'Hydration', 'Probiotics'],
    detail: 'Traditional Maharashtrian buttermilk is probiotic-rich and supports digestion throughout the morning.',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
  },
  {
    title: 'Green Tea',
    benefits: ['Antioxidants', 'Metabolism', 'Sustained Energy'],
    detail: 'The L-theanine in green tea provides calm, focused energy without the glucose spike of coffee.',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
  },
  {
    title: 'Coconut Water',
    benefits: ['Electrolytes', 'Hydration', 'Natural Sugars'],
    detail: 'Natural electrolytes replenish what was lost overnight and keep energy stable through the morning.',
    img: 'https://images.unsplash.com/photo-1523362289600-a70b4a2ae7c4?w=600&q=80',
  },
];

const REC_WALK_AFTERNOON: RecOption[] = [
  {
    title: '10–15 Minute Post-Lunch Walk',
    benefits: ['Glucose Control', 'Digestion', 'Alertness'],
    detail: 'Research shows a 10-minute walk after meals reduces blood sugar spikes by up to 30%. One of the highest-impact daily habits.',
    img: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80',
  },
  {
    title: 'Light Stretching & Standing',
    benefits: ['Circulation', 'Posture', 'Glucose Response'],
    detail: 'If you cannot walk outside, 10 minutes of gentle movement or standing reduces post-meal glucose effectively.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  },
];

const REC_WALK_EVENING: RecOption[] = [
  {
    title: '20–30 Minute Evening Walk',
    benefits: ['Calorie Burn', 'Stress Relief', 'Sleep Quality'],
    detail: 'Evening walks reduce cortisol, improve mood, and set you up for deeper, more restorative sleep.',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  },
  {
    title: 'Park or Nature Walk',
    benefits: ['Mental Health', 'Cortisol Reduction', 'Grounding'],
    detail: 'Green spaces amplify the stress-reducing effects of walking. Even 20 minutes in nature measurably lowers cortisol.',
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  },
];

const REC_DETOX: RecOption[] = [
  {
    title: 'Haldi Milk (Golden Milk)',
    benefits: ['Anti-Inflammatory', 'Recovery', 'Sleep Quality'],
    detail: "Turmeric's curcumin content reduces overnight inflammation. A deeply nourishing Maharashtrian evening ritual.",
    img: 'https://images.unsplash.com/photo-1634141510639-d691d86f47be?w=600&q=80',
  },
  {
    title: 'Methi Water (Fenugreek)',
    benefits: ['Blood Sugar', 'Overnight Recovery', 'Digestion'],
    detail: 'Fenugreek water taken before bed has been shown to lower fasting glucose levels the following morning.',
    img: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=600&q=80',
  },
  {
    title: 'Chamomile or Ashwagandha Tea',
    benefits: ['Relaxation', 'Cortisol Reduction', 'Deep Sleep'],
    detail: 'Adaptogenic herbs calm the nervous system and lower cortisol, enabling deeper, more restorative sleep.',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
  },
];

// ── Timeline event type ───────────────────────────────────────────────────────

interface TimelineEvent {
  id: string; time: string;
  category: 'hydration' | 'movement' | 'meal' | 'ritual' | 'detox';
  sectionTitle: string; supporting: string; microMotivation?: string;
  special?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recs?: RecOption[];
  icon: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function DailyPlanPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [selectedMeals, setSelectedMeals] = useState<Record<string, number>>({});
  const [selectedRecs, setSelectedRecs] = useState<Record<string, number>>({});

  const completedCount = Object.values(completed).filter(Boolean).length;
  const quote = MOTIVATION_QUOTES[MEMBER.day % MOTIVATION_QUOTES.length]!;
  const markComplete = (id: string) => setCompleted(p => ({ ...p, [id]: !p[id] }));

  const events: TimelineEvent[] = [
    {
      id: 'hydration', time: '07:00 AM', category: 'hydration',
      sectionTitle: 'Morning Reset',
      supporting: 'Start your day with hydration and digestive support before anything else.',
      microMotivation: "You're building healthy habits one choice at a time.",
      icon: <Droplets size={16} strokeWidth={2.5} />,
      recs: REC_HYDRATION_MORNING,
    },
    {
      id: 'walk1', time: '07:30 AM', category: 'movement',
      sectionTitle: 'Movement Break',
      supporting: 'A short walk helps improve glucose response and keeps your energy steady all morning.',
      microMotivation: 'Movement is medicine.',
      icon: <Activity size={16} strokeWidth={2.5} />,
      recs: REC_WALK_MORNING,
    },
    {
      id: 'breakfast', time: '09:15 AM', category: 'meal',
      sectionTitle: 'Start Your Day Strong',
      supporting: 'Choose one nourishing breakfast to fuel your morning.',
      microMotivation: 'Strong nutrition choices create lasting energy.',
      icon: <Sun size={16} strokeWidth={2.5} />,
      special: 'breakfast',
    },
    {
      id: 'mid-morning', time: '11:30 AM', category: 'hydration',
      sectionTitle: 'Midmorning Nourishment',
      supporting: 'Keep your energy stable and digestion active before lunch.',
      icon: <Leaf size={16} strokeWidth={2.5} />,
      recs: REC_MID_MORNING,
    },
    {
      id: 'lunch', time: '01:00 PM', category: 'meal',
      sectionTitle: 'Fuel Your Afternoon',
      supporting: 'Your midday meal is your energy foundation. Choose wisely.',
      microMotivation: 'Great start. Momentum matters.',
      icon: <ChefHat size={16} strokeWidth={2.5} />,
      special: 'lunch',
    },
    {
      id: 'walk2', time: '02:00 PM', category: 'movement',
      sectionTitle: 'Post-Lunch Movement',
      supporting: 'A gentle walk after lunch significantly improves glucose metabolism.',
      microMotivation: "You're building consistency.",
      icon: <Activity size={16} strokeWidth={2.5} />,
      recs: REC_WALK_AFTERNOON,
    },
    {
      id: 'snack', time: '04:30 PM', category: 'meal',
      sectionTitle: 'Energy Boost',
      supporting: 'A smart snack prevents afternoon energy crashes.',
      icon: <Zap size={16} strokeWidth={2.5} />,
      special: 'snack',
    },
    {
      id: 'evening-walk', time: '06:00 PM', category: 'movement',
      sectionTitle: 'Evening Movement',
      supporting: 'Your final walk of the day builds the foundation of your transformation.',
      icon: <Wind size={16} strokeWidth={2.5} />,
      recs: REC_WALK_EVENING,
    },
    {
      id: 'dinner', time: '07:30 PM', category: 'meal',
      sectionTitle: 'Finish Strong',
      supporting: 'A light, nourishing dinner supports overnight recovery.',
      microMotivation: 'Another step completed.',
      icon: <Moon size={16} strokeWidth={2.5} />,
      special: 'dinner',
    },
    {
      id: 'detox', time: '09:00 PM', category: 'detox',
      sectionTitle: 'Wind Down & Recover',
      supporting: 'Prepare your body and mind for deep, restorative rest.',
      icon: <Star size={16} strokeWidth={2.5} />,
      recs: REC_DETOX,
    },
  ];

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: '80px' }}>
      <style>{`
        /* ── Visibility ── */
        .daily-mobile-only  { display: block; }
        .daily-desktop-only { display: none; }
        @media (min-width: 1024px) {
          .daily-mobile-only  { display: none !important; }
          .daily-desktop-only { display: block !important; }
        }

        /* ── Sticky back header ── */
        .dp-sticky-header {
          position: sticky; top: 56px; z-index: 99; height: 56px;
          display: flex; align-items: center;
          background: rgba(9,18,11,0.92);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0 20px;
        }
        @media (min-width: 1024px) { .dp-sticky-header { padding: 0 64px; } }

        /* ── Layout ── */
        .dp-inner     { max-width: 1600px; margin: 0 auto; padding: 0 20px; }
        .dp-inner-pad { padding-top: 72px; padding-bottom: 72px; }
        @media (min-width: 1024px) {
          .dp-inner     { padding: 0 64px; }
          .dp-inner-pad { padding-top: 88px; padding-bottom: 88px; }
        }

        /* ── Sections ── */
        .dp-section-darkforest { background: linear-gradient(155deg, #0a1a0e 0%, #0f2415 50%, #071710 100%); }

        /* ── Profile grid ── */
        .dp-profile-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        @media (min-width: 768px) { .dp-profile-grid { grid-template-columns: repeat(4,1fr); } }

        /* ── Hero ── */
        .dp-hero { position: relative; overflow: hidden; }
        /* ── Timeline ── */
        .dp-timeline { position: relative; }
        .dp-timeline::before {
          content: ''; position: absolute; left: 22px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #6B8F71 55%, rgba(107,143,113,0.15) 100%);
        }
        @media (min-width: 1024px) { .dp-timeline::before { left: 26px; } }
        .dp-tl-event { position: relative; padding-left: 62px; margin-bottom: 32px; }
        @media (min-width: 1024px) { .dp-tl-event { padding-left: 70px; margin-bottom: 40px; } }
        .dp-tl-dot {
          position: absolute; left: 0; top: 14px;
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        @media (min-width: 1024px) { .dp-tl-dot { width: 54px; height: 54px; } }
        .dp-event-card {
          background: #fff; border: 1px solid var(--color-border);
          border-radius: 22px; overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .dp-event-body { padding: 22px 22px 0; }
        @media (min-width: 1024px) { .dp-event-body { padding: 26px 28px 0; } }
        .dp-event-footer { padding: 14px 22px 22px; }
        @media (min-width: 1024px) { .dp-event-footer { padding: 14px 28px 24px; } }

        /* ── Carousel wrapper ── */
        .dp-rail-wrap { position: relative; margin: 16px 0 0; }
        .dp-rail {
          display: flex; gap: 12px;
          overflow-x: auto; overflow-y: visible;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; padding: 4px 22px 16px;
          margin: 0 -22px;
        }
        @media (min-width: 1024px) {
          .dp-rail { padding: 4px 28px 16px; margin: 0 -28px; gap: 14px; }
        }
        .dp-rail::-webkit-scrollbar { display: none; }
        .dp-rail-arrows {
          display: none;
          position: absolute; top: -38px; right: 0;
          gap: 6px;
        }
        @media (min-width: 1024px) { .dp-rail-arrows { display: flex; } }
        .dp-arrow-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(107,143,113,0.1); border: 1px solid rgba(107,143,113,0.25);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--color-sage);
          transition: all 0.18s ease;
        }
        .dp-arrow-btn:hover { background: rgba(107,143,113,0.2); transform: scale(1.08); }

        /* ── Rec card (image-first) ── */
        .dp-rec-card {
          flex-shrink: 0; width: 252px; border-radius: 18px;
          border: 1.5px solid var(--color-border); overflow: hidden;
          background: #fff; cursor: pointer;
          scroll-snap-align: start;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        @media (min-width: 1024px) { .dp-rec-card { width: 296px; } }
        .dp-rec-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.1);
        }
        .dp-rec-card:hover .dp-rec-img { transform: scale(1.03); }
        .dp-rec-card.selected {
          border-color: #6B8F71;
          box-shadow: 0 0 0 1px rgba(107,143,113,0.22), 0 8px 28px rgba(107,143,113,0.14);
        }
        .dp-rec-img-wrap { height: 158px; overflow: hidden; position: relative; flex-shrink: 0; background: #e8ede9; }
        @media (min-width: 1024px) { .dp-rec-img-wrap { height: 178px; } }
        .dp-rec-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }

        /* ── Meal card (image-first, wider) ── */
        .dp-meal-card {
          flex-shrink: 0; width: 262px; border-radius: 18px;
          border: 1.5px solid var(--color-border); overflow: hidden;
          background: #fff; cursor: pointer;
          scroll-snap-align: start;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        @media (min-width: 1024px) { .dp-meal-card { width: 308px; } }
        .dp-meal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.1);
        }
        .dp-meal-card:hover .dp-meal-img { transform: scale(1.03); }
        .dp-meal-card.selected {
          border-color: #6B8F71;
          box-shadow: 0 0 0 1px rgba(107,143,113,0.22), 0 8px 28px rgba(107,143,113,0.14);
        }
        .dp-meal-img-wrap { height: 170px; overflow: hidden; position: relative; background: #e8ede9; }
        @media (min-width: 1024px) { .dp-meal-img-wrap { height: 192px; } }
        .dp-meal-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }

        /* ── Snack card ── */
        .dp-snack-card {
          flex-shrink: 0; width: 200px; border-radius: 16px;
          border: 1.5px solid var(--color-border); overflow: hidden;
          background: #fff; cursor: pointer; scroll-snap-align: start;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        @media (min-width: 1024px) { .dp-snack-card { width: 230px; } }
        .dp-snack-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.09); }
        .dp-snack-card:hover .dp-snack-img { transform: scale(1.04); }
        .dp-snack-card.selected {
          border-color: #6B8F71;
          box-shadow: 0 0 0 1px rgba(107,143,113,0.22), 0 6px 22px rgba(107,143,113,0.13);
        }
        .dp-snack-img-wrap { height: 130px; overflow: hidden; position: relative; background: #e8ede9; }
        .dp-snack-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }

        /* ── Shared card content ── */
        .dp-card-body { padding: 13px 14px 16px; }
        @media (min-width: 1024px) { .dp-card-body { padding: 15px 16px 18px; } }
        .dp-tag {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 8px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #4A6E50; background: rgba(107,143,113,0.12);
          padding: 3px 8px; border-radius: 20px; margin-bottom: 7px;
        }
        .dp-img-badge {
          position: absolute; top: 10px; right: 10px;
          width: 26px; height: 26px; border-radius: 50%;
          background: #6B8F71; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .dp-img-tag {
          position: absolute; bottom: 8px; left: 10px;
          font-size: 8px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: #fff; background: rgba(0,0,0,0.42); backdrop-filter: blur(6px);
          padding: 3px 8px; border-radius: 20px;
        }
        .dp-selected-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; color: #6B8F71;
          background: rgba(107,143,113,0.1); border: 1px solid rgba(107,143,113,0.25);
          padding: 4px 10px; border-radius: 20px; margin-top: 8px;
        }
        .dp-choose-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 50px; border: none; cursor: pointer;
          font-weight: 700; font-size: 11px; margin-top: 10px;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #6B8F71, #4A6E50); color: #fff;
          box-shadow: 0 2px 8px rgba(107,143,113,0.22);
        }
        .dp-choose-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(107,143,113,0.32); }

        /* ── Complete button ── */
        .dp-complete-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 50px; border: none; cursor: pointer;
          font-weight: 700; font-size: 12px; letter-spacing: -0.01em; transition: all 0.2s ease;
        }
        .dp-complete-btn.done {
          background: rgba(107,143,113,0.1); color: #6B8F71; border: 1px solid rgba(107,143,113,0.28);
        }
        .dp-complete-btn.undone {
          background: linear-gradient(135deg, #6B8F71, #4A6E50); color: #fff;
          box-shadow: 0 3px 12px rgba(107,143,113,0.28);
        }
        .dp-complete-btn.undone:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(107,143,113,0.36); }

        /* ── Why strip ── */
        .dp-why-strip {
          background: rgba(107,143,113,0.05); border: 1px solid rgba(107,143,113,0.14);
          border-radius: 14px; padding: 16px 18px; margin-top: 14px;
        }

        /* ── Micro-motivation ── */
        .dp-micro {
          margin-top: 12px; padding: 10px 14px;
          background: rgba(107,143,113,0.06); border-left: 3px solid #6B8F71; border-radius: 0 10px 10px 0;
        }

        /* ── Week pill ── */
        .dp-week-pill {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 10px 14px; border-radius: 14px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.02em; min-width: 42px; border: 1px solid transparent;
        }

        /* ── Eyebrow ── */
        .dp-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-sage); margin-bottom: 6px; }
        .dp-eyebrow-light { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(160,205,168,0.65); margin-bottom: 6px; }

        /* ── Benefits row ── */
        .dp-benefit { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 700; color: #4A6E50; background: rgba(107,143,113,0.1); padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── AI Disclaimer ── */
        .dp-ai-wrap {
          padding: 48px 24px 0;
        }
        @media (min-width: 1024px) {
          .dp-ai-wrap { padding: 64px 64px 0; }
        }
        .dp-ai-card {
          max-width: 720px;
          margin: 0 auto;
          background: #FAFAF5;
          border: 1.5px solid rgba(107,143,113,0.22);
          border-radius: 22px;
          padding: 28px 28px 32px;
          box-shadow: 0 2px 18px rgba(107,143,113,0.08), 0 0 0 1px rgba(107,143,113,0.06);
          text-align: center;
        }
        @media (min-width: 768px) {
          .dp-ai-card { padding: 36px 40px 40px; border-radius: 24px; }
        }
        .dp-ai-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(107,143,113,0.1); border: 1px solid rgba(107,143,113,0.25);
          border-radius: 20px; padding: 5px 12px; margin-bottom: 18px;
          font-size: 10px; font-weight: 700; color: #4A6E50;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .dp-ai-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 14px 32px; height: 52px; border: none; border-radius: 50px; cursor: pointer;
          font-weight: 700; font-size: 14px; letter-spacing: -0.01em;
          background: linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%);
          color: #fff; text-decoration: none;
          box-shadow: 0 4px 16px rgba(107,143,113,0.3);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          white-space: nowrap;
        }
        .dp-ai-cta:hover { transform: translateY(-2px); box-shadow: 0 7px 22px rgba(107,143,113,0.38); }
        @media (max-width: 640px) {
          .dp-ai-cta { width: 100%; height: 54px; }
        }
      `}</style>

      {/* ── Sticky back header ── */}
      <div className="dp-sticky-header">
        <Link href="/today" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(160,205,168,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          <ChevronLeft size={17} strokeWidth={2.5} />Overview
        </Link>
        <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Day {MEMBER.day} · Your Personalised Plan
        </span>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="daily-mobile-only">
        <MobileHero quote={quote} />
        <section style={{ background: '#FAF5EC', padding: '52px 0' }}>
          <div style={{ padding: '0 24px' }}>
            <p className="dp-eyebrow">Personalised For You</p>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: '8px' }}>Built Around You</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>Every recommendation was selected based on your unique health profile.</p>
            <ProfileCards />
          </div>
        </section>
        <section style={{ background: '#fff', padding: '52px 0 40px' }}>
          <div style={{ padding: '0 24px' }}>
            <p className="dp-eyebrow">Today's Journey</p>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: '6px' }}>Today's Journey</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '36px' }}>One step at a time. Complete each activity and keep building momentum.</p>
            <Timeline events={events} completed={completed} selectedMeals={selectedMeals} selectedRecs={selectedRecs}
              onComplete={markComplete} onSelectMeal={(id, i) => setSelectedMeals(p => ({ ...p, [id]: i }))}
              onSelectRec={(id, i) => setSelectedRecs(p => ({ ...p, [id]: i }))} />
          </div>
        </section>
        <WeeklyMomentum />
        <AiDisclaimer />
        <ClosingSection completedCount={completedCount} />
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="daily-desktop-only">
        <DesktopHero quote={quote} />
        <section style={{ background: '#FAF5EC' }}>
          <div className="dp-inner dp-inner-pad">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <p className="dp-eyebrow">Personalised For You</p>
                <h2 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>Built Around You</h2>
                <p style={{ fontSize: '17px', color: 'var(--color-muted)', lineHeight: 1.65, maxWidth: '420px' }}>
                  Every recommendation below was selected based on your unique health profile. Your coach has prepared today specifically for you.
                </p>
              </div>
              <ProfileCards desktop />
            </div>
          </div>
        </section>
        <section style={{ background: '#fff' }}>
          <div className="dp-inner dp-inner-pad">
            <div style={{ marginBottom: '56px' }}>
              <p className="dp-eyebrow">Today's Journey</p>
              <h2 style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px' }}>Today's Journey</h2>
              <p style={{ fontSize: '17px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '480px' }}>One step at a time. Complete each activity and keep building momentum.</p>
            </div>
            <Timeline events={events} completed={completed} selectedMeals={selectedMeals} selectedRecs={selectedRecs}
              onComplete={markComplete} onSelectMeal={(id, i) => setSelectedMeals(p => ({ ...p, [id]: i }))}
              onSelectRec={(id, i) => setSelectedRecs(p => ({ ...p, [id]: i }))} desktop />
          </div>
        </section>
        <WeeklyMomentum desktop />
        <AiDisclaimer desktop />
        <ClosingSection completedCount={completedCount} desktop />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function MobileHero({ quote }: { quote: string }) {
  return (
    <div className="dp-hero">
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=85" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(175deg, rgba(6,16,9,0.72) 0%, rgba(9,22,13,0.82) 55%, rgba(4,12,7,0.94) 100%)' }} />
      </div>
      <motion.div animate={{ opacity: [0.12, 0.24, 0.12] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-40px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,143,113,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: '40px 24px 44px' }}>
        <p className="dp-eyebrow-light" style={{ marginBottom: '12px' }}>Day {MEMBER.day} of {MEMBER.totalDays}</p>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '6px' }}>Good Morning,<br />{MEMBER.name}</h1>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(160,205,168,0.85)', marginBottom: '4px' }}>Your Personalised Daily Meal & Exercise Plan</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', marginBottom: '28px' }}>Generated from: Maharashtrian Weight Loss Blueprint</p>
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>"{quote}"</p>
        </div>
      </div>
    </div>
  );
}

function DesktopHero({ quote }: { quote: string }) {
  return (
    <div className="dp-hero">
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=85" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(4,12,7,0.93) 0%, rgba(7,18,10,0.82) 50%, rgba(6,15,9,0.6) 100%)' }} />
      </div>
      <motion.div animate={{ opacity: [0.1, 0.22, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,143,113,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div className="dp-inner" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '64px 64px' }}>
        <div style={{ maxWidth: '760px' }}>
          <p className="dp-eyebrow-light" style={{ marginBottom: '14px' }}>Day {MEMBER.day} of {MEMBER.totalDays}</p>
          <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '10px' }}>Good Morning,<br />{MEMBER.name}</h1>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(160,205,168,0.9)', marginBottom: '4px' }}>Your Personalised Daily Meal & Exercise Plan</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '36px' }}>Generated from: Maharashtrian Weight Loss Blueprint</p>
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '18px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '520px' }}>
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(255,255,255,0.78)', lineHeight: 1.65 }}>"{quote}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE CARDS
// ─────────────────────────────────────────────────────────────────────────────

const PROFILE_CARDS = [
  { icon: <Target size={18} strokeWidth={2} />, label: 'Goal', value: 'Lose Weight', desc: 'Focused on high-protein meals and sustainable calorie control.', color: '#6B8F71', bg: 'rgba(107,143,113,0.08)', border: 'rgba(107,143,113,0.18)' },
  { icon: <Activity size={18} strokeWidth={2} />, label: 'Condition', value: 'Prediabetes', desc: 'Designed to support healthy glucose regulation.', color: '#C8604A', bg: 'rgba(200,96,74,0.07)', border: 'rgba(200,96,74,0.18)' },
  { icon: <Leaf size={18} strokeWidth={2} />, label: 'Preference', value: 'Vegetarian', desc: 'Plant-based proteins, dairy and wholegrains throughout.', color: '#4A6E50', bg: 'rgba(74,110,80,0.08)', border: 'rgba(74,110,80,0.18)' },
  { icon: <ChefHat size={18} strokeWidth={2} />, label: 'Cuisine', value: 'Maharashtrian', desc: 'Familiar, accessible regional ingredients you already love.', color: '#B07828', bg: 'rgba(176,120,40,0.08)', border: 'rgba(176,120,40,0.18)' },
];

function ProfileCards({ desktop }: { desktop?: boolean }) {
  return (
    <div className="dp-profile-grid" style={desktop ? { gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' } : undefined}>
      {PROFILE_CARDS.map(card => (
        <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '18px', padding: '18px 16px', transition: 'transform 0.22s ease', cursor: 'default' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: card.color }}>
            {card.icon}
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: card.color }}>{card.label}</span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>{card.value}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────

function RecommendationCarousel({ children, label }: { children: React.ReactNode; label?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollBy = useCallback((dir: -1 | 1) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  }, []);

  return (
    <div className="dp-rail-wrap">
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '22px', marginBottom: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          <div className="dp-rail-arrows">
            <button className="dp-arrow-btn" onClick={() => scrollBy(-1)} aria-label="Scroll left"><ChevronLeft size={14} strokeWidth={2.5} /></button>
            <button className="dp-arrow-btn" onClick={() => scrollBy(1)} aria-label="Scroll right"><ChevronRight size={14} strokeWidth={2.5} /></button>
          </div>
        </div>
      )}
      {!label && (
        <div className="dp-rail-arrows" style={{ position: 'absolute', top: '-38px', right: '0' }}>
          <button className="dp-arrow-btn" onClick={() => scrollBy(-1)} aria-label="Scroll left"><ChevronLeft size={14} strokeWidth={2.5} /></button>
          <button className="dp-arrow-btn" onClick={() => scrollBy(1)} aria-label="Scroll right"><ChevronRight size={14} strokeWidth={2.5} /></button>
        </div>
      )}
      <div className="dp-rail" ref={railRef}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION CARD — image-first (hydration, movement, recovery)
// ─────────────────────────────────────────────────────────────────────────────

function RecCard({ rec, selected, onSelect }: { rec: RecOption; selected: boolean; onSelect: () => void }) {
  return (
    <div className={`dp-rec-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div className="dp-rec-img-wrap">
        <img className="dp-rec-img" src={rec.img} alt={rec.title} />
        {selected && (
          <motion.div className="dp-img-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 380 }}>
            <Check size={13} strokeWidth={3} color="#fff" />
          </motion.div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%)' }} />
      </div>
      <div className="dp-card-body">
        <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '8px' }}>{rec.title}</p>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {rec.benefits.map(b => <span key={b} className="dp-benefit"><Check size={8} strokeWidth={3} /> {b}</span>)}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.55 }}>{rec.detail}</p>
        {selected ? (
          <div className="dp-selected-pill"><Check size={10} strokeWidth={3} /> Selected For Today</div>
        ) : (
          <button className="dp-choose-btn" onClick={e => { e.stopPropagation(); onSelect(); }}>Choose This</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEAL OPTION CARD — image-first, taller
// ─────────────────────────────────────────────────────────────────────────────

function MealCard({ meal, selected, onSelect }: { meal: MealOption; selected: boolean; onSelect: () => void }) {
  return (
    <div className={`dp-meal-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div className="dp-meal-img-wrap">
        <img className="dp-meal-img" src={meal.img} alt={meal.name} />
        {selected && (
          <motion.div className="dp-img-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 380 }}>
            <Check size={13} strokeWidth={3} color="#fff" />
          </motion.div>
        )}
        <div className="dp-img-tag">{meal.tag}</div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)' }} />
      </div>
      <div className="dp-card-body">
        <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>{meal.name}</p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '7px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)' }}>{meal.kcal} kcal</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B8F71' }}>{meal.protein}g protein</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)' }}>{meal.fibre}g fibre</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '2px' }}>{meal.desc}</p>
        {selected ? (
          <div className="dp-selected-pill"><Check size={10} strokeWidth={3} /> Selected For Today</div>
        ) : (
          <button className="dp-choose-btn" onClick={e => { e.stopPropagation(); onSelect(); }}>Choose This Meal</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SNACK CARD — image-first, compact
// ─────────────────────────────────────────────────────────────────────────────

function SnackCard({ snack, selected, onSelect }: { snack: SnackOption; selected: boolean; onSelect: () => void }) {
  return (
    <div className={`dp-snack-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div className="dp-snack-img-wrap">
        <img className="dp-snack-img" src={snack.img} alt={snack.name} />
        {selected && (
          <motion.div className="dp-img-badge" style={{ width: '22px', height: '22px' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 380 }}>
            <Check size={11} strokeWidth={3} color="#fff" />
          </motion.div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 55%)' }} />
      </div>
      <div className="dp-card-body">
        <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em', marginBottom: '4px' }}>{snack.name}</p>
        <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>{snack.kcal} kcal · {snack.protein}g protein</p>
        <p style={{ fontSize: '10px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{snack.desc}</p>
        {selected && <div className="dp-selected-pill" style={{ fontSize: '9px' }}><Check size={9} strokeWidth={3} /> Selected</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineProps {
  events: TimelineEvent[];
  completed: Record<string, boolean>;
  selectedMeals: Record<string, number>;
  selectedRecs: Record<string, number>;
  onComplete: (id: string) => void;
  onSelectMeal: (id: string, idx: number) => void;
  onSelectRec: (id: string, idx: number) => void;
  desktop?: boolean;
}

function Timeline({ events, completed, selectedMeals, selectedRecs, onComplete, onSelectMeal, onSelectRec }: TimelineProps) {
  return (
    <div id="timeline" className="dp-timeline">
      {events.map((event, i) => (
        <TLEvent key={event.id} event={event} isCompleted={!!completed[event.id]}
          selectedMealIdx={selectedMeals[event.id] ?? -1} selectedRecIdx={selectedRecs[event.id] ?? -1}
          onComplete={() => onComplete(event.id)}
          onSelectMeal={idx => onSelectMeal(event.id, idx)}
          onSelectRec={idx => onSelectRec(event.id, idx)} />
      ))}
    </div>
  );
}

function TLEvent({ event, isCompleted, selectedMealIdx, selectedRecIdx, onComplete, onSelectMeal, onSelectRec }: {
  event: TimelineEvent; isCompleted: boolean;
  selectedMealIdx: number; selectedRecIdx: number;
  onComplete: () => void; onSelectMeal: (i: number) => void; onSelectRec: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const dotBg = isCompleted ? '#6B8F71'
    : event.category === 'movement' ? 'linear-gradient(135deg, #D4A843, #B07828)'
    : event.category === 'detox'    ? 'linear-gradient(135deg, #3A2A6E, #5B3FA0)'
    : event.category === 'meal'     ? 'linear-gradient(135deg, #1C2B1E, #3A5C3E)'
    : 'linear-gradient(135deg, #0d3040, #1a5c78)';

  const mealOptions = event.special === 'breakfast' ? BREAKFAST_MEALS
    : event.special === 'lunch' ? LUNCH_MEALS
    : event.special === 'dinner' ? DINNER_MEALS
    : event.special === 'snack' ? null : null;

  return (
    <motion.div ref={ref} className="dp-tl-event"
      initial={{ opacity: 0, x: -14 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}>

      {/* Dot */}
      <div className="dp-tl-dot" style={{ background: dotBg, color: '#fff', boxShadow: isCompleted ? '0 0 0 4px rgba(107,143,113,0.2)' : 'none' }}>
        {isCompleted ? <Check size={16} strokeWidth={3} /> : event.icon}
      </div>

      {/* Card */}
      <div className="dp-event-card">
        <div className="dp-event-body">
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{event.time}</p>
          <h3 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: '5px' }}>{event.sectionTitle}</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: '4px' }}>{event.supporting}</p>
        </div>

        {/* Meal carousels */}
        {event.special === 'snack' && (
          <div style={{ padding: '0 22px' }}>
            <RecommendationCarousel>
              {SNACK_OPTIONS.map((s, i) => (
                <SnackCard key={s.name} snack={s} selected={selectedMealIdx === i} onSelect={() => onSelectMeal(i)} />
              ))}
            </RecommendationCarousel>
          </div>
        )}
        {mealOptions && (
          <div style={{ padding: '0 22px' }}>
            <RecommendationCarousel>
              {mealOptions.map((m, i) => (
                <MealCard key={m.name} meal={m} selected={selectedMealIdx === i} onSelect={() => onSelectMeal(i)} />
              ))}
            </RecommendationCarousel>
          </div>
        )}

        {/* Non-meal recommendation carousels */}
        {event.recs && (
          <div style={{ padding: '0 22px' }}>
            <RecommendationCarousel>
              {event.recs.map((r, i) => (
                <RecCard key={r.title} rec={r} selected={selectedRecIdx === i} onSelect={() => onSelectRec(i)} />
              ))}
            </RecommendationCarousel>
          </div>
        )}

        {/* Why strip — after main meals */}
        {(event.special === 'breakfast' || event.special === 'lunch' || event.special === 'dinner') && (
          <div style={{ padding: '0 22px' }}><WhyStrip /></div>
        )}

        {/* Micro-motivation */}
        {isCompleted && event.microMotivation && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ margin: '0 22px' }}>
            <div className="dp-micro">
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--color-sage)', fontWeight: 600 }}>"{event.microMotivation}"</p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="dp-event-footer">
          <button className={`dp-complete-btn ${isCompleted ? 'done' : 'undone'}`} onClick={onComplete}>
            {isCompleted ? <><CheckCircle2 size={14} strokeWidth={2.5} /> Completed</> : <><Check size={14} strokeWidth={2.5} /> Mark Complete</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHY STRIP
// ─────────────────────────────────────────────────────────────────────────────

function WhyStrip() {
  return (
    <div className="dp-why-strip">
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Why This Supports Your Goal</p>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: '10px' }}>
        Because you're working toward <strong style={{ color: 'var(--color-ink)' }}>Lose Weight</strong>, managing <strong style={{ color: 'var(--color-ink)' }}>Prediabetes</strong>, and following <strong style={{ color: 'var(--color-ink)' }}>Vegetarian Maharashtrian</strong> nutrition, this meal was selected because it offers:
      </p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['Higher protein', 'Better satiety', 'Lower glycemic impact', 'Familiar regional ingredients'].map(b => (
          <span key={b} className="dp-benefit"><Check size={9} strokeWidth={3} /> {b}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY MOMENTUM
// ─────────────────────────────────────────────────────────────────────────────

function WeeklyMomentum({ desktop }: { desktop?: boolean }) {
  return (
    <section style={{ background: '#EEF3EF', padding: desktop ? undefined : '52px 0' }}>
      <div className={desktop ? 'dp-inner dp-inner-pad' : undefined} style={!desktop ? { padding: '52px 24px' } : undefined}>
        <p className="dp-eyebrow">This Week</p>
        <h2 style={{ fontSize: desktop ? '40px' : '26px', fontWeight: 900, color: 'var(--color-ink)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '8px' }}>Your Momentum This Week</h2>
        <p style={{ fontSize: desktop ? '16px' : '13px', color: 'var(--color-muted)', marginBottom: '32px', maxWidth: '400px', lineHeight: 1.6 }}>Consistency is the engine of transformation. Every day you show up counts.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {WEEK_DAYS.map(day => (
            <div key={day.label} className="dp-week-pill" style={{ background: day.done ? 'linear-gradient(135deg, #6B8F71, #4A6E50)' : day.active ? 'linear-gradient(135deg, #D4A843, #B07828)' : 'rgba(255,255,255,0.6)', color: day.done || day.active ? '#fff' : 'var(--color-muted)', border: `1px solid ${day.done ? 'rgba(107,143,113,0.3)' : day.active ? 'rgba(212,168,67,0.4)' : 'var(--color-border)'}`, boxShadow: day.active ? '0 4px 16px rgba(212,168,67,0.24)' : 'none' }}>
              <span style={{ fontSize: '18px' }}>{day.done ? '✓' : day.active ? '⚡' : '·'}</span>
              <span>{day.label}</span>
              {day.active && <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>Active</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '28px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>Weekly Adherence Goal</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-sage)' }}>{MEMBER.weeklyAdherence}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(107,143,113,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div initial={{ width: '0%' }} whileInView={{ width: `${MEMBER.weeklyAdherence}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #6B8F71, #A8C5AC)', borderRadius: '3px' }} />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>Target: 80% · You're 8% away from this week's goal.</p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSING SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ClosingSection({ completedCount, desktop }: { completedCount: number; desktop?: boolean }) {
  return (
    <section className="dp-section-darkforest" style={{ padding: desktop ? '96px 0' : '64px 0', position: 'relative', overflow: 'hidden' }}>
      <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,143,113,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <motion.div animate={{ opacity: [0.08, 0.16, 0.08] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,168,67,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div className="dp-inner" style={{ position: 'relative', textAlign: 'center' }}>
        <p className="dp-eyebrow-light" style={{ textAlign: 'center', marginBottom: '16px' }}>Keep Going</p>
        <h2 style={{ fontSize: desktop ? '48px' : '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: '560px', margin: '0 auto 16px' }}>
          You're not trying to be perfect.<br /><span style={{ color: '#A8C5AC' }}>You're building a healthier future.</span>
        </h2>
        <p style={{ fontSize: desktop ? '16px' : '14px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, maxWidth: '380px', margin: '0 auto 40px' }}>
          One day at a time. Every healthy choice compounds into the transformation you're working toward.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: desktop ? '40px' : '20px', flexWrap: 'wrap', marginBottom: '44px' }}>
          {[
            { label: 'Current Streak', value: `${MEMBER.streak} days` },
            { label: 'Weekly Adherence', value: `${MEMBER.weeklyAdherence}%` },
            { label: 'Month Progress', value: `Day ${MEMBER.day}` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: desktop ? '36px' : '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,197,172,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <Link href="/today" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: desktop ? '16px 36px' : '14px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', color: '#fff', fontWeight: 700, fontSize: desktop ? '15px' : '14px', letterSpacing: '-0.01em', textDecoration: 'none', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }}>
          Return to My Journey <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI DISCLAIMER
// ─────────────────────────────────────────────────────────────────────────────

function AiDisclaimer({ desktop }: { desktop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const ctaLabel = HAS_COACHING ? 'Connect with Your Coach' : 'Learn About Coach Support';
  const ctaHref  = HAS_COACHING ? '/coach/message' : '/today';

  return (
    <section ref={ref} style={{ background: '#fff' }}>
      <motion.div
        className="dp-ai-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dp-ai-card">
          {/* Badge */}
          <div className="dp-ai-badge">
            <Sparkles size={11} strokeWidth={2.5} />
            AI Generated Nutrition Plan
          </div>

          {/* Headline */}
          <h3 style={{
            fontSize: desktop ? '22px' : '19px',
            fontWeight: 900,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.22,
            marginBottom: '10px',
          }}>
            Want more personalised recommendations?
          </h3>

          {/* Disclaimer copy */}
          <p style={{
            fontSize: '13px',
            color: 'var(--color-muted)',
            lineHeight: 1.65,
            maxWidth: '520px',
            margin: '0 auto 24px',
          }}>
            This health plan was generated using TGHC's AI-powered nutrition engine. For a more personalised meal plan tailored to your medical history, preferences, and goals, connect with a TGHC health coach.
          </p>

          {/* CTA */}
          <a href={ctaHref} className="dp-ai-cta">
            {ctaLabel} <ArrowRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
