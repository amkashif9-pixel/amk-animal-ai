import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { PriceEstimateInput, PriceEstimateResult } from '../../types/marketPrice';
import { calculateMarketPrice } from '../../services/priceEstimator';
import { MAJOR_MANDIS } from '../../data/priceData';
import { ALL_SPECIES } from '../../data/speciesData';
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  DollarSign,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Beef,
} from 'lucide-react';

interface PriceEstimatorProps {
  initialSpecies?: string;
  initialBreed?: string;
  onNavigateToMarketplace?: () => void;
  onNavigateToMeatYield?: (species: string, breed?: string, weightKg?: number) => void;
}

export const PriceEstimator: React.FC<PriceEstimatorProps> = ({
  initialSpecies = 'Cow',
  initialBreed = 'Sahiwal Cow',
  onNavigateToMarketplace,
  onNavigateToMeatYield,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Input States
  const [country, setCountry] = useState('Pakistan');
  const [province, setProvince] = useState('Punjab');
  const [districtMandi, setDistrictMandi] = useState('lahore_kanjra');
  const [species, setSpecies] = useState(initialSpecies);
  const [breed, setBreed] = useState(initialBreed);
  const [ageYears, setAgeYears] = useState<number>(3.0);
  const [gender, setGender] = useState<'male' | 'female' | 'castrated'>('female');
  const [weightKg, setWeightKg] = useState<number>(420);
  const [healthCondition, setHealthCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [dailyMilkYield, setDailyMilkYield] = useState<number>(14);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<'dairy' | 'meat' | 'qurbani' | 'breeding'>('dairy');

  const [estimate, setEstimate] = useState<PriceEstimateResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const input: PriceEstimateInput = {
      country,
      provinceState: province,
      districtCity: districtMandi,
      species,
      breed,
      ageYears,
      gender,
      weightKg,
      healthCondition,
      dailyMilkProductionLiters: gender === 'female' ? dailyMilkYield : 0,
      isPregnant,
      purpose,
    };

    const res = calculateMarketPrice(input);
    setEstimate(res);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>{isUrdu ? 'سائنسی مویشی منڈی ویلیوایشن' : 'Scientific Mandi Valuation Algorithm'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.market.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.market.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Price Parameters Input Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Country & Province */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.country}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Pakistan">🇵🇰 Pakistan (روپے)</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia (SAR)</option>
                  <option value="UAE">🇦🇪 UAE (AED)</option>
                  <option value="International">🌐 International (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.province}
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Punjab">Punjab (پنجاب)</option>
                  <option value="Sindh">Sindh (سندھ)</option>
                  <option value="KPK">Khyber Pakhtunkhwa (خیبر پختونخوا)</option>
                  <option value="Balochistan">Balochistan (بلوچستان)</option>
                  <option value="Islamabad">Islamabad Capital (وفاق)</option>
                </select>
              </div>
            </div>

            {/* District & Mandi Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.market.district}
              </label>
              <select
                value={districtMandi}
                onChange={(e) => setDistrictMandi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {MAJOR_MANDIS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isUrdu ? m.nameUr : m.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Species and Breed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.species}
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Cow">Cow (گائے)</option>
                  <option value="Buffalo">Buffalo (بھینس)</option>
                  <option value="Goat">Goat (بکری)</option>
                  <option value="Sheep">Sheep (بھیڑ / چھترا)</option>
                  <option value="Bull">Bull / Ox (بیل / سانڈ)</option>
                  <option value="Camel">Camel (اونٹ)</option>
                  <option value="Poultry">Poultry / Aseel (اصیل مرغا)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.breed}
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Age, Gender & Weight */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.ageYears}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.gender}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="female">{isUrdu ? 'مادہ' : 'Female'}</option>
                  <option value="male">{isUrdu ? 'نر' : 'Male'}</option>
                  <option value="castrated">{isUrdu ? 'کھسی (قربانی)' : 'Castrated'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.weightKg}
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Milk Yield (If female) & Pregnancy */}
            {gender === 'female' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
                <div>
                  <label className="block text-[11px] font-bold text-brand-900 uppercase tracking-wider mb-1">
                    {t.market.milkYield}
                  </label>
                  <input
                    type="number"
                    value={dailyMilkYield}
                    onChange={(e) => setDailyMilkYield(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-900">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>{isUrdu ? 'تصدیق شدہ گابھن (حاملہ)' : 'Confirmed Pregnant'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Health & Commercial Purpose */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.healthCondition}
                </label>
                <select
                  value={healthCondition}
                  onChange={(e) => setHealthCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="excellent">{isUrdu ? 'بہترین / چمکدار فربہ' : 'Excellent / Prime'}</option>
                  <option value="good">{isUrdu ? 'اچھی صحت' : 'Good Healthy'}</option>
                  <option value="fair">{isUrdu ? 'درمیانی / عام' : 'Fair / Lean'}</option>
                  <option value="poor">{isUrdu ? 'کمزور' : 'Poor'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.market.purpose}
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="dairy">{isUrdu ? 'ڈیری / دودھ' : 'Dairy Production'}</option>
                  <option value="qurbani">{isUrdu ? 'عید الاضحیٰ قربانی' : 'Qurbani Sacrifice'}</option>
                  <option value="meat">{isUrdu ? 'گوشت / بیف فارمنگ' : 'Meat / Fattening'}</option>
                  <option value="breeding">{isUrdu ? 'نسل کشی (بریڈنگ)' : 'Pedigree Stud'}</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-forest-800 hover:from-brand-500 hover:to-forest-700 text-white font-bold text-sm shadow-lg shadow-brand-700/20 flex items-center justify-center gap-2 transition"
            >
              <Calculator className="w-5 h-5" />
              <span>{t.market.calculate}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Valuation Results */}
        <div className="lg:col-span-6">
          {!estimate ? (
            <div className="h-full min-h-[420px] bg-slate-50 border border-slate-200/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">
                {isUrdu ? 'منڈی قیمت کا حساب لگائیں' : 'Calculate Mandi Valuation'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {isUrdu
                  ? 'بائیں جانب جانور کا وزن، دودھ، عمر اور نسل درج کر کے "منڈی قیمت کا اندازہ لگائیں" پر کلک کریں۔'
                  : 'Enter live weight, dentition, milk production, and location on the left to calculate high-confidence livestock valuation.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 animate-fade-in">
              {/* Header result */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                    {t.market.resultsTitle}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {breed} ({species})
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {isUrdu ? estimate.confidenceLevelUr : estimate.confidenceLevelEn}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {t.market.lastUpdated}: {estimate.lastUpdatedDate}
                  </span>
                </div>
              </div>

              {/* Three Price Cards (Min, Average, Max) */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.market.minPrice}
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-800">
                    {estimate.currency} {estimate.minPrice.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-brand-50 border-2 border-brand-500 text-brand-950 shadow-sm relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-extrabold uppercase">
                    {isUrdu ? 'اوسط' : 'Average'}
                  </span>
                  <span className="text-[10px] font-bold text-brand-800 uppercase block mb-1">
                    {t.market.avgPrice}
                  </span>
                  <span className="text-base sm:text-xl font-black text-brand-800">
                    {estimate.currency} {estimate.avgPrice.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.market.maxPrice}
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-800">
                    {estimate.currency} {estimate.maxPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Valuation Factors Applied */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  <span>{t.market.factorsApplied}</span>
                </h5>
                <div className="space-y-1.5">
                  {estimate.factorsApplied.map((fac, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-700 font-medium">
                        {isUrdu ? fac.factorUr : fac.factorEn}
                      </span>
                      {fac.percentage !== 0 && (
                        <span
                          className={`font-bold inline-flex items-center gap-0.5 ${
                            fac.impact === 'positive'
                              ? 'text-emerald-600'
                              : fac.impact === 'negative'
                              ? 'text-red-500'
                              : 'text-slate-500'
                          }`}
                        >
                          {fac.impact === 'positive' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{fac.percentage > 0 ? `+${fac.percentage}%` : `${fac.percentage}%`}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Market Limitation & Benchmark Transparency */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>{isUrdu ? estimate.valuationTypeUr : estimate.valuationTypeEn}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {isUrdu ? 'غیر لائیو ریفرنس ماڈل' : 'Non-Live Baseline Model'}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-amber-900">
                  {isUrdu ? estimate.limitationsNoticeUr : estimate.limitationsNoticeEn}
                </p>

                <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-amber-800 font-medium">
                  <div>
                    <span className="font-bold text-amber-950">{isUrdu ? 'ڈیٹا سورس:' : 'Data Source:'}</span>{' '}
                    <span>{isUrdu ? estimate.dataSourceUr : estimate.dataSourceEn}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-950">{isUrdu ? 'علاقائی کوریج:' : 'Coverage:'}</span>{' '}
                    <span>{isUrdu ? estimate.geographicCoverageUr : estimate.geographicCoverageEn}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-950">{isUrdu ? 'بینچ مارک کیٹلاگ تاریخ:' : 'Catalog Benchmark Date:'}</span>{' '}
                    <span>{estimate.benchmarkCatalogDate}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-950">{isUrdu ? 'آخری تکنیکی جائزہ:' : 'Last Model Review:'}</span>{' '}
                    <span>{estimate.lastReviewedDate}</span>
                  </div>
                </div>
              </div>

              {/* Cross-Link Actions: Meat Yield & Marketplace */}
              <div className="space-y-2 pt-1">
                {onNavigateToMeatYield && (
                  <button
                    type="button"
                    onClick={() => onNavigateToMeatYield(species, breed, weightKg)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Beef className="w-4 h-4 text-emerald-200" />
                    <span>
                      {isUrdu
                        ? `گوشت اور لاگت کا تخمینہ لگائیں (${weightKg} کلو گرام)`
                        : `Calculate Carcass & Meat Yield (${weightKg} kg)`}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                  </button>
                )}

                {onNavigateToMarketplace && (
                  <button
                    type="button"
                    onClick={onNavigateToMarketplace}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>{isUrdu ? 'اس نسل کے تصدیق شدہ لائیو اشتہارات دیکھیں' : 'Browse Verified Listings in Marketplace'}</span>
                    <ArrowUpRight className="w-4 h-4 text-brand-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
