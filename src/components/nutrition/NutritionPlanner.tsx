import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { NutritionPlanInput, FeedRecommendation } from '../../types/nutrition';
import { calculateScientificNutrition } from '../../data/nutritionData';
import { ALL_SPECIES } from '../../data/speciesData';
import {
  Wheat,
  Droplet,
  Sparkles,
  Scale,
  Calendar,
  CheckCircle,
  Clock,
  Layers,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const NutritionPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [species, setSpecies] = useState('cow');
  const [breed, setBreed] = useState('Sahiwal');
  const [ageMonths, setAgeMonths] = useState<number>(36);
  const [weightKg, setWeightKg] = useState<number>(450);
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high' | 'working'>('moderate');
  const [productionStage, setProductionStage] = useState<
    'none' | 'early_lactation' | 'mid_lactation' | 'late_lactation' | 'pregnant' | 'growing'
  >('early_lactation');
  const [dailyMilkYieldLiters, setDailyMilkYieldLiters] = useState<number>(16);
  const [season, setSeason] = useState<'summer' | 'winter' | 'spring' | 'autumn'>('winter');

  const [plan, setPlan] = useState<FeedRecommendation>(() =>
    calculateScientificNutrition({
      species: 'cow',
      breed: 'Sahiwal',
      ageMonths: 36,
      weightKg: 450,
      activityLevel: 'moderate',
      productionStage: 'early_lactation',
      dailyMilkYieldLiters: 16,
      season: 'winter',
    })
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const recommendation = calculateScientificNutrition({
      species,
      breed,
      ageMonths,
      weightKg,
      activityLevel,
      productionStage,
      dailyMilkYieldLiters,
      season,
    });
    setPlan(recommendation);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-3">
          <Wheat className="w-4 h-4 text-brand-600" />
          <span>{isUrdu ? 'سائنسی ونڈا و راشن فارمولیشن' : 'Scientific Dairy & Livestock Nutrition'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.nutrition.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.nutrition.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Parameter Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-600" />
              <span>{t.nutrition.parameters}</span>
            </h4>

            {/* Species */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isUrdu ? 'جانور کی قسم' : 'Animal Species'}
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="cow">Cow (گائے)</option>
                <option value="buffalo">Buffalo (بھینس)</option>
                <option value="goat">Goat (بکری)</option>
                <option value="sheep">Sheep (بھیڑ)</option>
                <option value="hen">Poultry (مرغی)</option>
              </select>
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.nutrition.ageMonths}
                </label>
                <input
                  type="number"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.nutrition.weightKg}
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Production Stage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.nutrition.productionStage}
              </label>
              <select
                value={productionStage}
                onChange={(e) => setProductionStage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="early_lactation">{isUrdu ? 'شروع کا سُوا / زیادہ دودھ (Early Lactation)' : 'Early Lactation (Peak Milk)'}</option>
                <option value="mid_lactation">{isUrdu ? 'درمیانی دودھ کا دورانیہ (Mid Lactation)' : 'Mid Lactation'}</option>
                <option value="late_lactation">{isUrdu ? 'آخری دودھ کا دورانیہ (Late Lactation)' : 'Late Lactation'}</option>
                <option value="pregnant">{isUrdu ? 'آخری دو ماہ کا گابھن (Steaming-up)' : 'Late Pregnancy / Dry Cow'}</option>
                <option value="growing">{isUrdu ? 'بڑھوتری والا بچھڑا / کٹڑا' : 'Growing / Fattening'}</option>
                <option value="none">{isUrdu ? 'معمول کی دیکھ بھال (Maintenance)' : 'Dry / Maintenance'}</option>
              </select>
            </div>

            {/* Daily Milk Yield (If in lactation) */}
            {(productionStage.includes('lactation') || productionStage === 'none') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.nutrition.dailyMilkYield}
                </label>
                <input
                  type="number"
                  value={dailyMilkYieldLiters}
                  onChange={(e) => setDailyMilkYieldLiters(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}

            {/* Current Season */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.nutrition.season}
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="winter">{isUrdu ? 'سردیاں (برسیم، جئی، سرسوں)' : 'Winter (Berseem, Oats)'}</option>
                <option value="spring">{isUrdu ? 'بہار (لوسرن، رائی گھاس)' : 'Spring (Lucerne, Ryegrass)'}</option>
                <option value="summer">{isUrdu ? 'گرمیاں (مکئی، جوار، باجرہ سائیلج)' : 'Summer (Maize, Sorghum)'}</option>
                <option value="autumn">{isUrdu ? 'خزاں / برسات (روڈس، سائیلج)' : 'Autumn (Silage, Rhodes)'}</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.nutrition.generatePlan}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Custom Scientific Formulation Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block mb-0.5">
                  {t.nutrition.planTitle}
                </span>
                <h3 className="text-xl font-black text-slate-900 capitalize">
                  {species} ({weightKg} kg bodyweight)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase">
                {plan.category}
              </span>
            </div>

            {/* Core Rations Breakdown Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {t.nutrition.dryMatter}
                </span>
                <span className="text-base font-black text-slate-800">
                  {plan.dailyDryMatterKg}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  {t.nutrition.greenFodder}
                </span>
                <span className="text-base font-black text-emerald-800">
                  {plan.greenFodderKg}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                  {t.nutrition.dryRoughage}
                </span>
                <span className="text-xs font-black text-amber-800">
                  {plan.dryRoughageKg}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-50 border-2 border-brand-500 text-brand-950 shadow-xs">
                <span className="text-[10px] font-bold text-brand-800 uppercase block mb-1">
                  {t.nutrition.concentrate}
                </span>
                <span className="text-base font-black text-brand-700">
                  {plan.concentrateWandaKg}
                </span>
              </div>
            </div>

            {/* Water and Nutrient Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
                <Droplet className="w-6 h-6 text-sky-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">
                    {t.nutrition.waterRequirement}
                  </span>
                  <span className="font-extrabold text-sky-950">
                    {plan.cleanWaterLiters}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  {t.nutrition.crudeProtein}
                </span>
                <span className="font-extrabold text-slate-800">
                  {plan.crudeProteinPercentage}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  {t.nutrition.mineralMix}
                </span>
                <span className="font-extrabold text-slate-800">
                  {plan.mineralMixtureGrams}
                </span>
              </div>
            </div>

            {/* Recommended Seasonal Fodders */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-brand-600" />
                <span>{t.nutrition.localFodders}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isUrdu ? plan.localFodderSuggestionsUr : plan.localFodderSuggestionsEn).map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Feeding Protocol / Schedule */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>{t.nutrition.feedingSchedule}</span>
              </h5>
              <div className="space-y-1.5">
                {(isUrdu ? plan.feedingScheduleUr : plan.feedingScheduleEn).map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs text-brand-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t.nutrition.specialNotes}</span>
                <p className="leading-relaxed text-[11px] text-brand-900">
                  {isUrdu ? plan.specialInstructionsUr : plan.specialInstructionsEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
