'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search, ChevronLeft, CheckCircle2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BlueprintData {
  goal: string;
  conditions: string[];
  symptoms: string[];
  dietPreference: string;
  culinaryPreference: string;
  nutritionPlanCreated: boolean;
  nutritionBlueprintCompleted: boolean;
  generatedPlan: {
    goal: string;
    conditions: string[];
    symptoms: string[];
    dietPreference: string;
    culinaryPreference: string;
  };
}

export interface NsMeal {
  category: string;
  name: string;
  kcal: number;
  protein: number;
  color: string;
  colorDim: string;
  emoji: string;
}

// ── Option data ────────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { label: 'Lose Weight',              emoji: '⚖️', desc: 'Sustainable fat loss through nutrition' },
  { label: "Improve Women's Health",   emoji: '🌸', desc: 'Hormonal balance & reproductive wellness' },
  { label: 'Improve Digestive Health', emoji: '🌿', desc: 'Gut microbiome & digestive comfort' },
  { label: 'Increase Muscle Mass',     emoji: '💪', desc: 'Build strength with targeted nutrition' },
  { label: 'Improve Energy Levels',    emoji: '⚡', desc: 'Sustained energy throughout the day' },
  { label: 'Improve Skin Health',      emoji: '✨', desc: 'Nourish your skin from within' },
  { label: 'Improve Mental Health',    emoji: '🧠', desc: 'Mood, cognition & mental clarity' },
  { label: 'Immune Health',            emoji: '🛡️', desc: 'Strengthen your immune defences' },
  { label: 'Improve Kidney Health',    emoji: '💧', desc: 'Kidney-protective nutrition plan' },
  { label: 'Improve Geriatric Health', emoji: '🌱', desc: 'Healthy ageing & longevity nutrition' },
  { label: 'Manage Diabetes',          emoji: '🩺', desc: 'Blood sugar management through food' },
  { label: 'Improve Heart Health',     emoji: '❤️', desc: 'Cardiovascular-protective eating plan' },
];

const CONDITION_OPTIONS = [
  'Type 2 Diabetes / Prediabetes',
  'Type 1 Diabetes',
  'Hypertension',
  'Heart Disorders (Coronary Artery Disease (CAD) / Heart Arrhythmias / Heart Failure / Heart Valve Disease / Pericardial Disease / Cardiomyopathy / Congenital Heart Disease)',
  'Obesity or Overweight',
  'High Waist Circumference or Belly Fat',
  'Endometriosis',
  'PCOS / PCOD',
  "Thyroid Disorders (Hypothyroidism / Hyperthyroidism / Hashimoto's Disease / Grave's Disease / Goiter)",
  'High cholesterol or high lipids or high triglycerides (hypercholesterolemia / dyslipidemia / hypertriglyceridemia)',
  'Kidney disorders (high serum creatinine / urine microalbumin)',
  'Fatty Liver',
  'Gastrointestinal Disorder (Inflammatory bowel disease / Irritable Bowl Syndrome / Celiac Disease / GERD / Acid Reflux / SIBO)',
  'Mental Health Disorder (Clinical Depression / Anxiety Disorder / Schizophrenia / Bipolar Disorder / Dementia / OCD / PTSD)',
  'Other',
  'None',
];

const SYMPTOM_OPTIONS = [
  'Extreme Thirst',
  'Frequent Urination',
  'Vision problems',
  'Dry & itchy skin',
  'Low energy / Tiredness',
  'Hypoglycemia',
  'Confusion / Brain Fog',
  'Anxiety',
  'Mood Swings',
  'Numbness / Tingling in Hands or Feet',
  'Lightheadedness / Fainting',
  'Shortness of Breath',
  'Nosebleeds',
  'Heart Palpitations',
  'Hunger Pangs',
  'Irregular Menstrual Cycle',
  'Acne',
  'Hirsutism',
  'Thinning of Hair',
  'Stress',
  'Constipation',
  'Acidity',
  'Bloating',
  'Flatulence / Gas',
  'Other',
  'None',
];

const DIET_OPTIONS = [
  { label: 'Vegetarian',     emoji: '🥗', desc: 'Plant-based proteins, dairy & eggs' },
  { label: 'Non-Vegetarian', emoji: '🍗', desc: 'Includes poultry, fish, meat & eggs' },
];

const CUISINE_OPTIONS = [
  'South Indian (Tamil / Telugu / Kannada / Andhra / Kerala)',
  'North Indian (Punjab / Haryana / Delhi / J&K)',
  'East Indian (Bengali / Oriya / Assamese)',
  'Gujarati',
  'Rajasthani',
  'Maharashtrian',
  'Goan',
  'West Indian (Gujarati / Rajasthani / Maharashtrian / Goan)',
  'Kerala',
  'Tamil Nadu',
  'Telangana',
  'Karnataka',
  'Andhra Pradesh',
  'Bihari',
  'Odia',
  'Jharkhand',
  'Bengali',
  'Kashmiri',
  'Himachali',
  'Punjabi',
  'Haryanvi',
  'Mughalai',
];

const GENERATION_ITEMS = [
  'Analysing health goal',
  'Reviewing medical profile',
  'Evaluating symptoms',
  'Matching nutrition protocols',
  'Personalising cuisine framework',
  'Creating weekly meal plan',
];

// ── Meal data ──────────────────────────────────────────────────────────────────

const C = {
  BF: { color: '#D4A843', dim: 'rgba(212,168,67,0.16)' },
  LU: { color: '#6B8F71', dim: 'rgba(107,143,113,0.16)' },
  SN: { color: '#C8604A', dim: 'rgba(200,96,74,0.16)' },
  DN: { color: '#8FA4FF', dim: 'rgba(143,164,255,0.16)' },
  WE: { color: '#A8C5AC', dim: 'rgba(168,197,172,0.16)' },
};

function m(cat: 'BF'|'LU'|'SN'|'DN'|'WE', name: string, kcal: number, protein: number, emoji: string): NsMeal {
  return { category: { BF: 'Breakfast', LU: 'Lunch', SN: 'Snack', DN: 'Dinner', WE: 'Weekend' }[cat], name, kcal, protein, color: C[cat].color, colorDim: C[cat].dim, emoji };
}

const MEAL_DB: Record<string, NsMeal[]> = {
  'South Indian-veg': [
    m('BF', 'Pesarattu with Green Chutney', 320, 18, '🌿'),
    m('LU', 'Sambar with Millet Rice', 480, 22, '🍲'),
    m('SN', 'Roasted Peanuts & Coconut Water', 160, 8, '🥜'),
    m('DN', 'Rasam with Steamed Vegetables', 280, 12, '🥗'),
    m('WE', 'Kozhukattai with Coconut Filling', 350, 10, '🥥'),
  ],
  'South Indian-nonveg': [
    m('BF', 'Egg Dosa with Sambar', 380, 22, '🥚'),
    m('LU', 'Fish Curry with Brown Rice', 520, 34, '🐟'),
    m('SN', 'Boiled Egg & Sprouts', 180, 14, '🌱'),
    m('DN', 'Grilled Pomfret with Rasam', 340, 28, '🐠'),
    m('WE', 'Chettinad Chicken (light)', 440, 36, '🍗'),
  ],
  'North Indian-veg': [
    m('BF', 'Besan Chilla with Mint Chutney', 310, 16, '🫓'),
    m('LU', 'Millet Roti with Dal Tadka', 490, 24, '🫙'),
    m('SN', 'Roasted Chana & Dates', 190, 9, '🫘'),
    m('DN', 'Palak Dal with Quinoa', 390, 22, '🥬'),
    m('WE', 'Rajma Chawal (portion-controlled)', 520, 26, '🍛'),
  ],
  'North Indian-nonveg': [
    m('BF', 'Egg Paratha with Yogurt', 420, 24, '🥚'),
    m('LU', 'Chicken Dal with Millet Roti', 550, 38, '🍗'),
    m('SN', 'Boiled Chicken & Sprouts', 200, 18, '🌱'),
    m('DN', 'Tandoori Chicken with Salad', 360, 34, '🍖'),
    m('WE', 'Mutton Shorba with Brown Rice', 480, 32, '🍲'),
  ],
  'Maharashtrian-veg': [
    m('BF', 'Poha with Sprouts', 340, 14, '🌾'),
    m('LU', 'Jowar Bhakri with Vegetable Sabzi', 460, 18, '🥙'),
    m('SN', 'Roasted Chana', 170, 9, '🫘'),
    m('DN', 'Mixed Dal and Vegetables', 350, 18, '🥣'),
    m('WE', 'Zunka Bhakri', 410, 16, '🫓'),
  ],
  'Maharashtrian-nonveg': [
    m('BF', 'Egg Bhurji with Bhakri', 390, 22, '🥚'),
    m('LU', 'Kombdi Vade (light chicken curry)', 520, 32, '🍗'),
    m('SN', 'Boiled Egg with Cucumber', 160, 12, '🥒'),
    m('DN', 'Fish Ambti with Brown Rice', 440, 28, '🐟'),
    m('WE', 'Mutton Kolhapuri (portion-controlled)', 490, 34, '🍖'),
  ],
  'Gujarati-veg': [
    m('BF', 'Thepla with Curd', 320, 12, '🫓'),
    m('LU', 'Dal Dhokli', 460, 20, '🫙'),
    m('SN', 'Makhana (Fox Nuts)', 150, 6, '⚪'),
    m('DN', 'Khichdi with Kadhi', 380, 16, '🍲'),
    m('WE', 'Handvo (Savoury Cake)', 350, 14, '🟤'),
  ],
  'Rajasthani-veg': [
    m('BF', 'Bajra Roti with Ghee', 310, 10, '🫓'),
    m('LU', 'Dal Baati Churma (light)', 520, 20, '🟤'),
    m('SN', 'Roasted Moong', 180, 10, '🫘'),
    m('DN', 'Gatte ki Sabzi with Millet', 400, 16, '🥙'),
    m('WE', 'Ker Sangri with Bajra Roti', 360, 14, '🌵'),
  ],
  'Bengali-veg': [
    m('BF', 'Muri with Mixed Vegetables', 280, 8, '🍿'),
    m('LU', 'Shukto with Steamed Rice', 420, 16, '🥗'),
    m('SN', 'Ghugni (Spiced Chickpeas)', 200, 10, '🫘'),
    m('DN', 'Moong Dal with Steamed Rice', 380, 18, '🫙'),
    m('WE', 'Cholar Dal with Luchi', 480, 18, '🍛'),
  ],
  'Bengali-nonveg': [
    m('BF', 'Egg Curry with Steamed Rice', 400, 22, '🥚'),
    m('LU', 'Machher Jhol with Rice', 510, 32, '🐟'),
    m('SN', 'Boiled Egg with Sprouts', 180, 14, '🌱'),
    m('DN', 'Shorshe Bata Maach', 420, 30, '🐠'),
    m('WE', 'Chicken Kosha (light)', 490, 36, '🍗'),
  ],
  'Kerala-veg': [
    m('BF', 'Puttu with Kadala Curry', 390, 18, '🥢'),
    m('LU', 'Sambar & Avial with Brown Rice', 470, 20, '🥗'),
    m('SN', 'Baked Banana Chips', 180, 2, '🍌'),
    m('DN', 'Vegetable Stew with Appam', 340, 10, '🥣'),
    m('WE', 'Vegetable Kerala Biryani', 480, 16, '🍛'),
  ],
  'Kerala-nonveg': [
    m('BF', 'Egg Appam with Coconut Milk', 380, 18, '🥚'),
    m('LU', 'Kerala Fish Curry with Brown Rice', 520, 34, '🐟'),
    m('SN', 'Boiled Prawns with Lime', 160, 16, '🦐'),
    m('DN', 'Meen Moilee with Appam', 440, 30, '🐠'),
    m('WE', 'Kerala Chicken Biryani (light)', 510, 36, '🍗'),
  ],
  'Mughalai-nonveg': [
    m('BF', 'Egg Paratha with Raita', 420, 22, '🥚'),
    m('LU', 'Chicken Yakhni Pulao', 530, 34, '🍛'),
    m('SN', 'Roasted Chana & Nuts', 190, 10, '🫘'),
    m('DN', 'Murgh Shorba with Roti', 360, 28, '🍗'),
    m('WE', 'Seekh Kebab with Salad', 400, 32, '🍖'),
  ],
  'Kashmiri-veg': [
    m('BF', 'Kashmiri Kahwa with Girda', 260, 6, '☕'),
    m('LU', 'Rajma (Kashmiri style) with Rice', 490, 22, '🫘'),
    m('SN', 'Walnuts & Dried Apricots', 200, 5, '🪨'),
    m('DN', 'Haak Saag with Millet Roti', 320, 14, '🥬'),
    m('WE', 'Lotus Stem Sabzi with Rice', 380, 12, '🌸'),
  ],
  'default-veg': [
    m('BF', 'Protein-Packed Poha', 420, 22, '🌾'),
    m('LU', 'Balanced Dal Bowl', 510, 31, '🥣'),
    m('SN', 'Greek Yogurt & Nuts', 180, 14, '🥛'),
    m('DN', 'Grilled Paneer Salad', 460, 35, '🥗'),
    m('WE', 'Family-Friendly Khichdi Bowl', 480, 24, '🍲'),
  ],
  'default-nonveg': [
    m('BF', 'Scrambled Eggs with Whole Grain Toast', 380, 24, '🥚'),
    m('LU', 'Grilled Chicken with Millet Bowl', 520, 38, '🍗'),
    m('SN', 'Boiled Egg & Sprout Salad', 190, 16, '🌱'),
    m('DN', 'Baked Fish with Steamed Vegetables', 380, 32, '🐟'),
    m('WE', 'Chicken & Vegetable Khichdi', 460, 30, '🍲'),
  ],
};

// ── Utility functions ──────────────────────────────────────────────────────────

function getCuisineKey(culinaryPreference: string): string {
  const short = culinaryPreference.split(' (')[0] ?? culinaryPreference;
  const map: Record<string, string> = {
    'South Indian': 'South Indian', 'North Indian': 'North Indian',
    'East Indian': 'Bengali', 'Gujarati': 'Gujarati', 'Rajasthani': 'Rajasthani',
    'Maharashtrian': 'Maharashtrian', 'Goan': 'default',
    'West Indian': 'Gujarati', 'Kerala': 'Kerala', 'Tamil Nadu': 'South Indian',
    'Telangana': 'South Indian', 'Karnataka': 'South Indian',
    'Andhra Pradesh': 'South Indian', 'Bihari': 'default', 'Odia': 'Bengali',
    'Jharkhand': 'default', 'Bengali': 'Bengali', 'Kashmiri': 'Kashmiri',
    'Himachali': 'Kashmiri', 'Punjabi': 'North Indian', 'Haryanvi': 'North Indian',
    'Mughalai': 'Mughalai',
  };
  return map[short] || 'default';
}

export function generateMeals(blueprint: BlueprintData): NsMeal[] {
  const isVeg = blueprint.dietPreference === 'Vegetarian';
  const cuisineKey = getCuisineKey(blueprint.culinaryPreference);
  const suffix = isVeg ? '-veg' : '-nonveg';
  return MEAL_DB[`${cuisineKey}${suffix}`] ?? MEAL_DB[`default${suffix}`] ?? MEAL_DB['default-veg'] ?? [];
}

export function generatePlanTitle(blueprint: BlueprintData): string {
  const goalMap: Record<string, string> = {
    'Lose Weight': 'Weight Loss',
    "Improve Women's Health": "Women's Health",
    'Improve Digestive Health': 'Digestive Health',
    'Increase Muscle Mass': 'Muscle Building',
    'Improve Energy Levels': 'Energy',
    'Improve Skin Health': 'Skin Health',
    'Improve Mental Health': 'Mental Wellness',
    'Immune Health': 'Immune Support',
    'Improve Kidney Health': 'Kidney Health',
    'Improve Geriatric Health': 'Longevity',
    'Manage Diabetes': 'Diabetes Management',
    'Improve Heart Health': 'Heart Health',
  };
  const goalShort = goalMap[blueprint.goal] || blueprint.goal;
  const cuisine = blueprint.culinaryPreference.split(' (')[0];

  if (blueprint.goal === 'Manage Diabetes') return `${blueprint.dietPreference} Diabetes Management Plan`;
  if (blueprint.goal === 'Improve Heart Health') return 'Heart Health Nutrition Plan';
  if (blueprint.goal === 'Improve Digestive Health') return 'Digestive Health Blueprint';
  if (blueprint.goal === 'Improve Mental Health') return 'Mental Wellness Nutrition Plan';
  return `${cuisine} ${goalShort} Plan`;
}

// ── Wizard component ───────────────────────────────────────────────────────────

interface WizardProps {
  onComplete: (data: BlueprintData) => void;
  onClose: () => void;
}

const TOTAL_FORM_STEPS = 5;

export default function NutritionBlueprintWizard({ onComplete, onClose }: WizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [dietPreference, setDietPreference] = useState('');
  const [culinaryPreference, setCulinaryPreference] = useState('');
  const [search, setSearch] = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [previewScrolled, setPreviewScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setSearch(''); }, [step]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Generation animation
  useEffect(() => {
    if (step !== 5) return;
    setGenProgress(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    GENERATION_ITEMS.forEach((_, i) => {
      timers.push(setTimeout(() => setGenProgress(i + 1), 300 + i * 450));
    });
    timers.push(setTimeout(() => { setPreviewScrolled(false); setDirection(1); setStep(6); }, 300 + GENERATION_ITEMS.length * 450 + 800));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const goNext = () => { setDirection(1); setStep(s => s + 1); };

  const advanceAfterSelection = (saveFn: () => void) => {
    saveFn();
    setTimeout(goNext, 200);
  };

  const goBack = () => {
    if (step === 0) { onClose(); return; }
    if (step === 6) { setDirection(-1); setStep(0); return; }
    setDirection(-1);
    setStep(s => s - 1);
  };

  const canContinue = (): boolean => {
    if (step === 0) return !!goal;
    if (step === 1) return conditions.length > 0;
    if (step === 2) return symptoms.length > 0;
    if (step === 3) return !!dietPreference;
    if (step === 4) return !!culinaryPreference;
    return false;
  };

  const handleActivate = () => {
    const blueprint: BlueprintData = {
      goal, conditions, symptoms, dietPreference, culinaryPreference,
      nutritionPlanCreated: true,
      nutritionBlueprintCompleted: true,
      generatedPlan: { goal, conditions, symptoms, dietPreference, culinaryPreference },
    };
    onComplete(blueprint);
  };

  const toggleMulti = (val: string, arr: string[], setArr: (v: string[]) => void) => {
    if (val === 'None') { setArr(['None']); return; }
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr.filter(x => x !== 'None'), val];
    setArr(next);
  };

  const progress = step < TOTAL_FORM_STEPS ? ((step + 1) / TOTAL_FORM_STEPS) * 100 : 100;

  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };

  const isFormStep = step >= 0 && step <= 4;

  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        key="nbw-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(4,10,6,0.78)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <style>{`
          .nbw-modal {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
            background: linear-gradient(160deg, #071710 0%, #0c1d11 55%, #152e1d 100%);
            overflow: hidden;
          }
          @media (min-width: 768px) {
            .nbw-modal {
              width: 980px;
              max-width: 95vw;
              max-height: 90vh;
              border-radius: 28px;
              box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(107,143,113,0.14);
            }
          }
          .nbw-content { flex: 1; overflow-y: auto; padding: 0 28px 24px; scrollbar-width: thin; scrollbar-color: rgba(107,143,113,0.3) transparent; }
          .nbw-content::-webkit-scrollbar { width: 4px; }
          .nbw-content::-webkit-scrollbar-track { background: transparent; }
          .nbw-content::-webkit-scrollbar-thumb { background: rgba(107,143,113,0.3); border-radius: 2px; }
          @media (max-width: 767px) { .nbw-content { padding: 0 20px 20px; } }

          .nbw-goal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          @media (max-width: 640px) { .nbw-goal-grid { grid-template-columns: 1fr; } }

          .nbw-chip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          @media (max-width: 767px) { .nbw-chip-grid { grid-template-columns: repeat(2, 1fr); } }

          .nbw-cuisine-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          @media (max-width: 767px) { .nbw-cuisine-grid { grid-template-columns: repeat(2, 1fr); } }

          .nbw-diet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @media (max-width: 480px) { .nbw-diet-grid { grid-template-columns: 1fr; } }

          .nbw-goal-card {
            background: rgba(255,255,255,0.04);
            border: 1.5px solid rgba(255,255,255,0.07);
            border-radius: 18px; padding: 18px 16px;
            cursor: pointer; text-align: left;
            transition: all 0.18s ease;
          }
          .nbw-goal-card:hover { background: rgba(107,143,113,0.07); border-color: rgba(107,143,113,0.3); }
          .nbw-goal-card.selected {
            background: rgba(107,143,113,0.13);
            border-color: #6B8F71;
            box-shadow: 0 0 0 1px rgba(107,143,113,0.25), 0 6px 24px rgba(107,143,113,0.14);
            transform: translateY(-1px);
          }

          .nbw-chip {
            border: 1.5px solid rgba(255,255,255,0.1);
            border-radius: 100px; padding: 8px 14px;
            cursor: pointer; font-size: 12px; font-weight: 600;
            color: rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.04);
            transition: all 0.16s ease;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            text-align: center;
          }
          .nbw-chip:hover { border-color: rgba(107,143,113,0.4); color: rgba(255,255,255,0.85); }
          .nbw-chip.selected {
            background: rgba(107,143,113,0.22);
            border-color: #6B8F71;
            color: #A8C5AC;
          }

          .nbw-cuisine-card {
            background: rgba(255,255,255,0.04);
            border: 1.5px solid rgba(255,255,255,0.07);
            border-radius: 14px; padding: 12px 14px;
            cursor: pointer; font-size: 12px; font-weight: 600;
            color: rgba(255,255,255,0.65);
            transition: all 0.16s ease;
            text-align: left;
          }
          .nbw-cuisine-card:hover { background: rgba(107,143,113,0.07); border-color: rgba(107,143,113,0.3); }
          .nbw-cuisine-card.selected {
            background: rgba(107,143,113,0.14);
            border-color: #6B8F71;
            color: #fff;
            box-shadow: 0 2px 12px rgba(107,143,113,0.18);
          }

          .nbw-diet-card {
            background: rgba(255,255,255,0.04);
            border: 1.5px solid rgba(255,255,255,0.07);
            border-radius: 20px; padding: 24px 20px;
            cursor: pointer; text-align: center;
            transition: all 0.18s ease;
          }
          .nbw-diet-card:hover { background: rgba(107,143,113,0.07); border-color: rgba(107,143,113,0.3); transform: translateY(-2px); }
          .nbw-diet-card.selected {
            background: rgba(107,143,113,0.13);
            border-color: #6B8F71;
            box-shadow: 0 0 0 1px rgba(107,143,113,0.25), 0 8px 28px rgba(107,143,113,0.16);
            transform: translateY(-2px);
          }

          .nbw-search-wrap {
            position: relative; margin-bottom: 16px;
          }
          .nbw-search-input {
            width: 100%; padding: 11px 16px 11px 40px;
            background: rgba(255,255,255,0.06);
            border: 1.5px solid rgba(255,255,255,0.1);
            border-radius: 50px; color: #fff; font-size: 13px;
            outline: none; transition: border-color 0.18s;
            box-sizing: border-box;
          }
          .nbw-search-input::placeholder { color: rgba(255,255,255,0.3); }
          .nbw-search-input:focus { border-color: rgba(107,143,113,0.5); }
          .nbw-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }

          .nbw-continue-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 32px; border: none; border-radius: 50px; cursor: pointer;
            font-weight: 700; font-size: 14px; letter-spacing: -0.01em;
            background: linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%);
            color: #fff;
            box-shadow: 0 4px 16px rgba(107,143,113,0.3);
            transition: all 0.18s ease;
          }
          .nbw-continue-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(107,143,113,0.38); }
          .nbw-continue-btn:disabled { opacity: 0.38; cursor: not-allowed; }

          .nbw-back-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 10px 18px; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 50px;
            background: transparent; color: rgba(255,255,255,0.55);
            font-size: 13px; font-weight: 600; cursor: pointer;
            transition: all 0.16s ease;
          }
          .nbw-back-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }

          .nbw-activate-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 16px 40px; border: none; border-radius: 50px; cursor: pointer;
            font-weight: 800; font-size: 16px; letter-spacing: -0.02em;
            background: linear-gradient(135deg, #6B8F71 0%, #4A6E50 100%);
            color: #fff;
            box-shadow: 0 6px 24px rgba(107,143,113,0.42);
            transition: all 0.18s ease;
          }
          .nbw-activate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(107,143,113,0.5); }

          .nbw-pbar-track {
            height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-top: 10px;
          }
          .nbw-pbar-fill {
            height: 100%; background: linear-gradient(90deg, #6B8F71, #A8C5AC); border-radius: 2px;
            transition: width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* ── Meal preview editorial layout ── */

          /* Meal block: full-bleed editorial section */
          .nbw-meal-block {
            border-bottom: 1px solid rgba(255,255,255,0.07);
            padding-bottom: 0;
          }
          .nbw-meal-block:last-of-type { border-bottom: none; }

          /* Time + category eyebrow row */
          .nbw-meal-eyebrow {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 22px 24px 14px;
          }
          @media (min-width: 768px) {
            .nbw-meal-eyebrow { padding: 26px 28px 16px; }
          }

          .nbw-meal-dot {
            width: 32px; height: 32px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            font-size: 15px;
          }

          /* Image: edge-to-edge, tall */
          .nbw-meal-hero-wrap {
            position: relative;
            height: 220px;
            overflow: hidden;
            background: #1a2b1e;
          }
          @media (min-width: 768px) { .nbw-meal-hero-wrap { height: 270px; } }
          @media (min-width: 1024px) { .nbw-meal-hero-wrap { height: 300px; } }

          .nbw-meal-hero-img {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.6s ease;
          }
          .nbw-meal-block:hover .nbw-meal-hero-img { transform: scale(1.03); }

          /* Options carousel (for multi-option support) */
          .nbw-meal-opts-rail {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .nbw-meal-opts-rail::-webkit-scrollbar { display: none; }

          .nbw-meal-opt-card {
            flex-shrink: 0;
            width: 200px;
            border-radius: 14px;
            overflow: hidden;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            scroll-snap-align: start;
            transition: transform 0.22s ease, border-color 0.22s ease;
          }
          @media (min-width: 768px) { .nbw-meal-opt-card { width: 236px; } }
          .nbw-meal-opt-card:hover { transform: translateY(-2px); border-color: rgba(107,143,113,0.35); }
          .nbw-meal-opt-card:hover .nbw-meal-opt-img { transform: scale(1.04); }

          .nbw-meal-opt-img-wrap {
            height: 132px;
            overflow: hidden;
            position: relative;
            background: #1a2b1e;
          }
          @media (min-width: 768px) { .nbw-meal-opt-img-wrap { height: 148px; } }
          .nbw-meal-opt-img {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.5s ease;
          }

          /* Activation card at bottom — not sticky, inline */
          .nbw-activate-card {
            position: relative;
            overflow: hidden;
            background: linear-gradient(155deg, #071710 0%, #0f2415 55%, #071710 100%);
            border-top: 1px solid rgba(107,143,113,0.2);
            padding: 36px 28px 44px;
            text-align: center;
          }
          @media (min-width: 768px) { .nbw-activate-card { padding: 44px 40px 52px; } }
          @media (max-width: 640px) {
            .nbw-activate-card .nbw-activate-btn { width: 100%; }
          }
        `}</style>

        <motion.div
          className="nbw-modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
        >
          {/* ── Decorative glow ── */}
          <motion.div
            animate={{ opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '260px', height: '260px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(107,143,113,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Header ── */}
          <div style={{
            flexShrink: 0, padding: '20px 28px 16px',
            borderBottom: step < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: step < 5 ? '14px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {step < 5 && (
                  <button className="nbw-back-btn" onClick={goBack} style={{ padding: '7px 14px' }}>
                    <ChevronLeft size={14} />
                    {step === 0 ? 'Cancel' : 'Back'}
                  </button>
                )}
                {step >= 5 && step < 6 && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B8F71', boxShadow: '0 0 10px rgba(107,143,113,0.6)' }} />
                )}
                {step < 5 && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(168,197,172,0.7)', letterSpacing: '0.02em' }}>
                    Step {step + 1} of {TOTAL_FORM_STEPS}
                  </span>
                )}
                {step === 5 && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(168,197,172,0.8)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Building Your Blueprint
                  </span>
                )}
                {step === 6 && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#A8C5AC', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Blueprint Ready
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.55)', transition: 'all 0.16s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
            {step < 5 && (
              <div className="nbw-pbar-track">
                <div className="nbw-pbar-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {/* ── Step content ── */}
          <div
            className="nbw-content"
            style={{ position: 'relative', padding: step === 6 ? '0' : undefined }}
            onScroll={step === 6 ? (e) => {
              const el = e.currentTarget;
              const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 160;
              if (nearBottom) setPreviewScrolled(true);
            } : undefined}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.7 }}
              >
                {/* ── Step 1: Goal ── */}
                {step === 0 && (
                  <div style={{ paddingTop: '24px' }}>
                    <StepHeader
                      title="What's your health goal?"
                      subtitle="We'll build your entire nutrition plan around this. Choose what matters most right now."
                    />
                    <div className="nbw-goal-grid">
                      {GOAL_OPTIONS.map(opt => (
                        <button
                          key={opt.label}
                          className={`nbw-goal-card${goal === opt.label ? ' selected' : ''}`}
                          onClick={() => advanceAfterSelection(() => setGoal(opt.label))}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '26px', lineHeight: 1 }}>{opt.emoji}</span>
                            {goal === opt.label && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 14, stiffness: 400 }}
                                style={{
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  background: '#6B8F71', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Check size={11} strokeWidth={3} color="#fff" />
                              </motion.div>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: 800, color: goal === opt.label ? '#fff' : 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                            {opt.label}
                          </p>
                          <p style={{ fontSize: '11px', color: goal === opt.label ? 'rgba(168,197,172,0.8)' : 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>
                            {opt.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Conditions ── */}
                {step === 1 && (
                  <div style={{ paddingTop: '24px' }}>
                    <StepHeader
                      title="Do you have any medical concerns?"
                      subtitle="Select all that apply. This helps us avoid ingredients and recommend what's best for your condition."
                    />
                    {conditions.length > 0 && (
                      <SelectionCount count={conditions.length} singular="concern" plural="concerns" />
                    )}
                    <div className="nbw-search-wrap">
                      <Search size={15} color="rgba(255,255,255,0.35)" className="nbw-search-icon" />
                      <input
                        className="nbw-search-input"
                        placeholder="Search conditions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="nbw-chip-grid">
                      {CONDITION_OPTIONS.filter(o => !search || o.toLowerCase().includes(search.toLowerCase())).map(opt => (
                        <button
                          key={opt}
                          className={`nbw-chip${conditions.includes(opt) ? ' selected' : ''}`}
                          onClick={() => toggleMulti(opt, conditions, setConditions)}
                          title={opt}
                        >
                          {conditions.includes(opt) && <Check size={10} strokeWidth={3} style={{ display: 'inline', marginRight: '4px', flexShrink: 0 }} />}
                          {opt.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Symptoms ── */}
                {step === 2 && (
                  <div style={{ paddingTop: '24px' }}>
                    <StepHeader
                      title="Do you have any of these symptoms?"
                      subtitle="Select all that apply. Your meal plan will be adjusted to address these."
                    />
                    {symptoms.length > 0 && (
                      <SelectionCount count={symptoms.length} singular="symptom" plural="symptoms" />
                    )}
                    <div className="nbw-search-wrap">
                      <Search size={15} color="rgba(255,255,255,0.35)" className="nbw-search-icon" />
                      <input
                        className="nbw-search-input"
                        placeholder="Search symptoms..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="nbw-chip-grid">
                      {SYMPTOM_OPTIONS.filter(o => !search || o.toLowerCase().includes(search.toLowerCase())).map(opt => (
                        <button
                          key={opt}
                          className={`nbw-chip${symptoms.includes(opt) ? ' selected' : ''}`}
                          onClick={() => toggleMulti(opt, symptoms, setSymptoms)}
                        >
                          {symptoms.includes(opt) && <Check size={10} strokeWidth={3} style={{ display: 'inline', marginRight: '4px', flexShrink: 0 }} />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 4: Diet Preference ── */}
                {step === 3 && (
                  <div style={{ paddingTop: '24px' }}>
                    <StepHeader
                      title="What is your dietary preference?"
                      subtitle="Your meals will be built entirely around this choice."
                    />
                    <div className="nbw-diet-grid" style={{ marginTop: '8px' }}>
                      {DIET_OPTIONS.map(opt => (
                        <button
                          key={opt.label}
                          className={`nbw-diet-card${dietPreference === opt.label ? ' selected' : ''}`}
                          onClick={() => advanceAfterSelection(() => setDietPreference(opt.label))}
                        >
                          <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '14px' }}>{opt.emoji}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                            <p style={{ fontSize: '18px', fontWeight: 800, color: dietPreference === opt.label ? '#fff' : 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em' }}>
                              {opt.label}
                            </p>
                            {dietPreference === opt.label && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 14, stiffness: 400 }}
                                style={{
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  background: '#6B8F71', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Check size={12} strokeWidth={3} color="#fff" />
                              </motion.div>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: dietPreference === opt.label ? 'rgba(168,197,172,0.8)' : 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>
                            {opt.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 5: Culinary Preference ── */}
                {step === 4 && (
                  <div style={{ paddingTop: '24px' }}>
                    <StepHeader
                      title="What is your day to day culinary preference?"
                      subtitle="We'll source ingredients, recipes, and meal ideas from this regional cuisine."
                    />
                    {culinaryPreference && (
                      <SelectionCount count={1} singular="cuisine selected" plural="cuisines selected" />
                    )}
                    <div className="nbw-search-wrap">
                      <Search size={15} color="rgba(255,255,255,0.35)" className="nbw-search-icon" />
                      <input
                        className="nbw-search-input"
                        placeholder="Search cuisines..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="nbw-cuisine-grid">
                      {CUISINE_OPTIONS.filter(o => !search || o.toLowerCase().includes(search.toLowerCase())).map(opt => {
                        const shortLabel = opt.split(' (')[0];
                        const subLabel = opt.includes(' (') ? opt.slice(opt.indexOf(' (') + 2, -1) : '';
                        return (
                          <button
                            key={opt}
                            className={`nbw-cuisine-card${culinaryPreference === opt ? ' selected' : ''}`}
                            onClick={() => advanceAfterSelection(() => setCulinaryPreference(opt))}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: culinaryPreference === opt ? '#fff' : 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em', marginBottom: subLabel ? '3px' : 0 }}>
                                  {shortLabel}
                                </p>
                                {subLabel && (
                                  <p style={{ fontSize: '10px', color: culinaryPreference === opt ? 'rgba(168,197,172,0.7)' : 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
                                    {subLabel}
                                  </p>
                                )}
                              </div>
                              {culinaryPreference === opt && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', damping: 14, stiffness: 400 }}
                                  style={{
                                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                    background: '#6B8F71', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  <Check size={10} strokeWidth={3} color="#fff" />
                                </motion.div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Generation screen ── */}
                {step === 5 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '420px', padding: '40px 20px', textAlign: 'center',
                  }}>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1.03, 0.97] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '80px', height: '80px', borderRadius: '50%', marginBottom: '28px',
                        background: 'radial-gradient(ellipse, rgba(107,143,113,0.35) 0%, rgba(107,143,113,0.08) 70%)',
                        border: '1.5px solid rgba(107,143,113,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '32px' }}>🌿</span>
                    </motion.div>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '6px' }}>
                      Creating Your Blueprint
                    </p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '36px', maxWidth: '300px', lineHeight: 1.5 }}>
                      Personalising your nutrition plan based on your profile
                    </p>
                    <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {GENERATION_ITEMS.map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: genProgress > i ? 1 : 0.25, x: 0 }}
                          transition={{ duration: 0.3, delay: genProgress > i ? 0 : 0 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px',
                            background: genProgress > i ? 'rgba(107,143,113,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${genProgress > i ? 'rgba(107,143,113,0.25)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '12px',
                            transition: 'all 0.35s ease',
                          }}
                        >
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                            background: genProgress > i ? '#6B8F71' : 'rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.3s ease',
                          }}>
                            {genProgress > i
                              ? <Check size={12} strokeWidth={3} color="#fff" />
                              : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                            }
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: genProgress > i ? '#A8C5AC' : 'rgba(255,255,255,0.3)' }}>
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Meal Plan Preview screen ── */}
                {step === 6 && (() => {
                  const bp: BlueprintData = {
                    goal, conditions, symptoms, dietPreference, culinaryPreference,
                    nutritionPlanCreated: true, nutritionBlueprintCompleted: true,
                    generatedPlan: { goal, conditions, symptoms, dietPreference, culinaryPreference },
                  };
                  const meals = generateMeals(bp);
                  const planTitle = generatePlanTitle(bp);

                  const MEAL_IMGS: Record<string, string> = {
                    'Pesarattu with Green Chutney':    'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=85',
                    'Sambar with Millet Rice':          'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Roasted Peanuts & Coconut Water':  'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Rasam with Steamed Vegetables':    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Kozhukattai with Coconut Filling': 'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Egg Dosa with Sambar':             'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Fish Curry with Brown Rice':       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Boiled Egg & Sprouts':             'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Grilled Pomfret with Rasam':       'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Chettinad Chicken (light)':        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Besan Chilla with Mint Chutney':   'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=85',
                    'Millet Roti with Dal Tadka':       'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Roasted Chana & Dates':            'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Palak Dal with Quinoa':            'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=85',
                    'Rajma Chawal (portion-controlled)':'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Egg Paratha with Yogurt':          'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Chicken Dal with Millet Roti':     'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Boiled Chicken & Sprouts':         'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Tandoori Chicken with Salad':      'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=85',
                    'Mutton Shorba with Brown Rice':    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Poha with Sprouts':                'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Jowar Bhakri with Vegetable Sabzi':'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=85',
                    'Roasted Chana':                    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Mixed Dal and Vegetables':         'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Zunka Bhakri':                     'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Egg Bhurji with Bhakri':           'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Kombdi Vade (light chicken curry)':'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Boiled Egg with Cucumber':         'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Fish Ambti with Brown Rice':       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Mutton Kolhapuri (portion-controlled)': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Thepla with Curd':                 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=85',
                    'Dal Dhokli':                       'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Makhana (Fox Nuts)':               'https://images.unsplash.com/photo-1606923829579-0cb981a83e2a?w=800&q=85',
                    'Khichdi with Kadhi':               'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Handvo (Savoury Cake)':            'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Bajra Roti with Ghee':             'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=85',
                    'Dal Baati Churma (light)':         'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Roasted Moong':                    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Gatte ki Sabzi with Millet':       'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Ker Sangri with Bajra Roti':       'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Muri with Mixed Vegetables':       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Shukto with Steamed Rice':         'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Ghugni (Spiced Chickpeas)':        'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Moong Dal with Steamed Rice':      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=85',
                    'Cholar Dal with Luchi':            'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Egg Curry with Steamed Rice':      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Machher Jhol with Rice':           'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Boiled Egg with Sprouts':          'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Shorshe Bata Maach':               'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Chicken Kosha (light)':            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Puttu with Kadala Curry':          'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=85',
                    'Sambar & Avial with Brown Rice':   'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Baked Banana Chips':               'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Vegetable Stew with Appam':        'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Vegetable Kerala Biryani':         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Egg Appam with Coconut Milk':      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Kerala Fish Curry with Brown Rice':'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Boiled Prawns with Lime':          'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Meen Moilee with Appam':           'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Kerala Chicken Biryani (light)':   'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Egg Paratha with Raita':           'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Chicken Yakhni Pulao':             'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Roasted Chana & Nuts':             'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=85',
                    'Murgh Shorba with Roti':           'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Seekh Kebab with Salad':           'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Kashmiri Kahwa with Girda':        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=85',
                    'Rajma (Kashmiri style) with Rice': 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Walnuts & Dried Apricots':         'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Haak Saag with Millet Roti':       'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=85',
                    'Lotus Stem Sabzi with Rice':       'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Protein-Packed Poha':              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=85',
                    'Balanced Dal Bowl':                'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=85',
                    'Greek Yogurt & Nuts':              'https://images.unsplash.com/photo-1606923829579-0cb981a83e2a?w=800&q=85',
                    'Grilled Paneer Salad':             'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                    'Family-Friendly Khichdi Bowl':     'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85',
                    'Scrambled Eggs with Whole Grain Toast': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85',
                    'Grilled Chicken with Millet Bowl': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=85',
                    'Boiled Egg & Sprout Salad':        'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=85',
                    'Baked Fish with Steamed Vegetables': 'https://images.unsplash.com/photo-1574484284002-952d92a03a40?w=800&q=85',
                    'Chicken & Vegetable Khichdi':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85',
                  };
                  const FALLBACK = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=85';

                  const TIME_LABEL: Record<string, string> = {
                    Breakfast: '08:00 AM', Lunch: '01:00 PM',
                    Snack: '04:30 PM', Dinner: '07:30 PM', Weekend: 'Weekend',
                  };
                  const CAT_DOT_BG: Record<string, string> = {
                    Breakfast: 'linear-gradient(135deg,#D4A843,#B07828)',
                    Lunch:     'linear-gradient(135deg,#6B8F71,#4A6E50)',
                    Snack:     'linear-gradient(135deg,#C8604A,#9e3e28)',
                    Dinner:    'linear-gradient(135deg,#3A4E8A,#5B6EAA)',
                    Weekend:   'linear-gradient(135deg,#4A6E50,#2e4e35)',
                  };
                  const CAT_ICON: Record<string, string> = {
                    Breakfast: '☀️', Lunch: '🍽️', Snack: '⚡', Dinner: '🌙', Weekend: '🌿',
                  };
                  const CAT_ACCENT: Record<string, string> = {
                    Breakfast: '#D4A843', Lunch: '#6B8F71', Snack: '#C8604A',
                    Dinner: '#8FA4FF', Weekend: '#A8C5AC',
                  };

                  return (
                    <div>
                      {/* Compact hero strip */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{
                          position: 'relative', overflow: 'hidden',
                          background: 'linear-gradient(155deg,#071710 0%,#0f2415 55%,#071710 100%)',
                          padding: '24px 24px 22px',
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <motion.div animate={{ opacity: [0.1,0.2,0.1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(107,143,113,0.25) 0%,transparent 70%)', pointerEvents: 'none' }} />
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.06 }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(107,143,113,0.15)', border: '1px solid rgba(107,143,113,0.3)', borderRadius: '20px', padding: '4px 11px', marginBottom: '10px' }}
                        >
                          <CheckCircle2 size={11} color="#6B8F71" strokeWidth={2.5} />
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#A8C5AC', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Meal Plan Is Ready</span>
                        </motion.div>
                        <motion.h2
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.38 }}
                          style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '3px', position: 'relative' }}
                        >
                          {planTitle}
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.18, duration: 0.35 }}
                          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', position: 'relative' }}
                        >
                          Scroll through your daily meal journey below
                        </motion.p>
                      </motion.div>

                      {/* Editorial meal blocks */}
                      {meals.map((meal, i) => {
                        const accent = CAT_ACCENT[meal.category] ?? '#6B8F71';
                        const img = MEAL_IMGS[meal.name] ?? FALLBACK;
                        return (
                          <motion.div
                            key={meal.category}
                            className="nbw-meal-block"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.1, duration: 0.42, ease: [0.22,1,0.36,1] }}
                          >
                            {/* Eyebrow row */}
                            <div className="nbw-meal-eyebrow">
                              <div className="nbw-meal-dot" style={{ background: CAT_DOT_BG[meal.category] ?? 'linear-gradient(135deg,#1C2B1E,#3A5C3E)' }}>
                                <span>{CAT_ICON[meal.category] ?? '🍽️'}</span>
                              </div>
                              <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1px' }}>
                                  {TIME_LABEL[meal.category] ?? meal.category}
                                </p>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                  {meal.category}
                                </h3>
                              </div>
                            </div>

                            {/* Hero image — edge to edge */}
                            <div className="nbw-meal-hero-wrap">
                              <img className="nbw-meal-hero-img" src={img} alt={meal.name} />
                              {/* gradient overlay */}
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,12,7,0.78) 0%, rgba(4,12,7,0.14) 55%, transparent 100%)' }} />
                              {/* Meal name + stats over image */}
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' }}>
                                <p style={{ fontSize: '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.22, marginBottom: '8px' }}>
                                  {meal.name}
                                </p>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)', padding: '3px 9px', borderRadius: '20px' }}>
                                    {meal.kcal} kcal
                                  </span>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: `${accent}55`, backdropFilter: 'blur(6px)', border: `1px solid ${accent}60`, padding: '3px 9px', borderRadius: '20px' }}>
                                    {meal.protein}g protein
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Option cards rail — architecture ready for multiple options per slot */}
                            <div style={{ padding: '14px 20px 20px' }}>
                              <div className="nbw-meal-opts-rail">
                                <div className="nbw-meal-opt-card">
                                  <div className="nbw-meal-opt-img-wrap">
                                    <img className="nbw-meal-opt-img" src={img} alt={meal.name} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)' }} />
                                    <div style={{ position: 'absolute', bottom: '7px', left: '9px', fontSize: '8px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                      Today's Choice
                                    </div>
                                  </div>
                                  <div style={{ padding: '10px 12px 12px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', marginBottom: '5px', lineHeight: 1.3 }}>{meal.name}</p>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <span style={{ fontSize: '9px', fontWeight: 700, color: accent }}>{meal.kcal} kcal</span>
                                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>·</span>
                                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#A8C5AC' }}>{meal.protein}g protein</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Activation card — appears inline at the end, fades in after scroll */}
                      <AnimatePresence>
                        {previewScrolled && (
                          <motion.div
                            className="nbw-activate-card"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 24 }}
                            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <motion.div animate={{ opacity: [0.1,0.22,0.1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(107,143,113,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
                            <motion.div
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', damping: 16, stiffness: 280, delay: 0.1 }}
                              style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#6B8F71,#4A6E50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 6px 22px rgba(107,143,113,0.38)' }}
                            >
                              <CheckCircle2 size={26} color="#fff" strokeWidth={2} />
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.18, duration: 0.38 }}
                              style={{ fontSize: '11px', fontWeight: 700, color: '#6B8F71', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
                            >
                              Ready to start?
                            </motion.p>
                            <motion.h3
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.22, duration: 0.38 }}
                              style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '6px' }}
                            >
                              This is your personalised meal plan.
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.28, duration: 0.35 }}
                              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px', lineHeight: 1.55 }}
                            >
                              Activate it to start tracking your nutrition journey.
                            </motion.p>
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.32, duration: 0.36 }}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative' }}
                            >
                              <button className="nbw-activate-btn" onClick={handleActivate} style={{ minWidth: '220px' }}>
                                <CheckCircle2 size={17} strokeWidth={2.5} />
                                Activate My Meal Plan
                              </button>
                              <button className="nbw-back-btn" onClick={goBack} style={{ fontSize: '12px' }}>
                                <ChevronLeft size={13} />
                                Edit My Answers
                              </button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer: shown only for multi-select form steps ── */}
          {(step === 1 || step === 2) && (
            <div style={{
              flexShrink: 0, padding: '14px 28px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: '12px',
            }}>
              <button className="nbw-back-btn" onClick={goBack}>
                <ChevronLeft size={14} />
                Back
              </button>
              <button
                className="nbw-continue-btn"
                disabled={!canContinue()}
                onClick={goNext}
              >
                Continue
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

// ── Internal sub-components ────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.22, marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, maxWidth: '480px' }}>
        {subtitle}
      </p>
    </div>
  );
}

function SelectionCount({ count, singular, plural }: { count: number; singular: string; plural: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '20px', marginBottom: '12px',
        background: 'rgba(107,143,113,0.15)', border: '1px solid rgba(107,143,113,0.28)',
      }}
    >
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6B8F71' }} />
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8C5AC' }}>
        {count} {count === 1 ? singular : plural} selected
      </span>
    </motion.div>
  );
}

