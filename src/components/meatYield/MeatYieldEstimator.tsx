import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import {
  MeatYieldSpecies,
  MeatYieldInput,
  MeatYieldEstimateResult,
  FinancialCalculatorInput,
  FinancialCalculatorResult,
  SlaughterActualRecord,
} from '../../types/meatYield';
import {
  calculateMeatYield,
  calculateMeatYieldFinancials,
  DEFAULT_SPECIES_CONFIGS,
} from '../../services/meatYieldCalculator';
import {
  saveMeatYieldEstimate,
  recordSlaughterActual,
  getSpeciesYieldConfigs,
} from '../../services/meatYieldService';
import {
  Scale,
  Beef,
  DollarSign,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  Check,
} from 'lucide-react';

interface MeatYieldEstimatorProps {
  initialSpecies?: string;
  initialBreed?: string;
  initialWeightKg?: number;
  initialBcs?: number;
  onNavigateToScanner?: () => void;
  onNavigateToPrice?: () => void;
}

const SPECIES_OPTIONS: { id: MeatYieldSpecies; nameEn: string; nameUr: string; icon: string; imageUrl: string; typicalBreeds: string[] }[] = [
  {
    id: 'cow',
    nameEn: 'Cow / Cattle',
    nameUr: 'گائے / بیل',
    icon: '🐄',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80',
    typicalBreeds: ['Sahiwal Cow', 'Cholistani Cow', 'Red Sindhi', 'Dhanni', 'Crossbred Friesian', 'Brahman'],
  },
  {
    id: 'buffalo',
    nameEn: 'Water Buffalo',
    nameUr: 'بھینس / کٹا',
    icon: '🐃',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=300&q=80',
    typicalBreeds: ['Nili-Ravi Buffalo', 'Kundi Buffalo', 'Azakheli Buffalo'],
  },
  {
    id: 'goat',
    nameEn: 'Goat / Buck',
    nameUr: 'بکرا / بکری',
    icon: '🐐',
    imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=300&q=80',
    typicalBreeds: ['Beetal Goat', 'Kamori Goat', 'Teddy Goat', 'Dera Din Panah', 'Nachi Goat', 'Barbari Goat', 'Gulabi Goat'],
  },
  {
    id: 'sheep',
    nameEn: 'Thin-Tail Sheep',
    nameUr: 'بھیڑ / چھترا',
    icon: '🐑',
    imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=300&q=80',
    typicalBreeds: ['Kajli Sheep', 'Lohi Sheep', 'Thalli Sheep', 'Sipli Sheep'],
  },
  {
    id: 'dumba',
    nameEn: 'Ram / Dumba',
    nameUr: 'دنبہ / مینڈھا',
    icon: '🐏',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=300&q=80',
    typicalBreeds: ['Balkhi Dumba', 'Hashtnagri Dumba', 'Michni Dumba', 'Kandahari Dumba'],
  },
];

export const MeatYieldEstimator: React.FC<MeatYieldEstimatorProps> = ({
  initialSpecies,
  initialBreed,
  initialWeightKg,
  initialBcs,
  onNavigateToScanner,
  onNavigateToPrice,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Map initial incoming species prop to valid enum
  const mapInitialSpecies = (sp?: string): MeatYieldSpecies => {
    if (!sp) return 'cow';
    const s = sp.toLowerCase();
    if (s.includes('buffalo')) return 'buffalo';
    if (s.includes('goat')) return 'goat';
    if (s.includes('dumba') || s.includes('ram')) return 'dumba';
    if (s.includes('sheep')) return 'sheep';
    return 'cow';
  };

  // State
  const [species, setSpecies] = useState<MeatYieldSpecies>(mapInitialSpecies(initialSpecies));
  const [breed, setBreed] = useState<string>(initialBreed || 'Sahiwal Cow');
  const [liveWeightKg, setLiveWeightKg] = useState<number>(initialWeightKg || 420);
  const [weightMaund, setWeightMaund] = useState<number>(() => Number(((initialWeightKg || 420) / 40).toFixed(2)));
  const [gender, setGender] = useState<'male' | 'female' | 'castrated'>('male');
  const [ageDentition, setAgeDentition] = useState<MeatYieldInput['ageDentition']>('donda_2_teeth');
  const [bcs, setBcs] = useState<MeatYieldInput['bcs']>((initialBcs as any) || 3);
  const [physicalBuild, setPhysicalBuild] = useState<MeatYieldInput['physicalBuild']>('heavy_muscular');
  const [dressingMethod, setDressingMethod] = useState<MeatYieldInput['dressingMethod']>('standard_halal_skin_off');
  const [fastingStatus, setFastingStatus] = useState<MeatYieldInput['fastingStatus']>('fasted_12_24h');
  const [animalNameOrTag, setAnimalNameOrTag] = useState<string>('');

  // Selected scenario view
  const [activeScenario, setActiveScenario] = useState<'low' | 'mostLikely' | 'high'>('mostLikely');

  // Estimation Result
  const [estimateResult, setEstimateResult] = useState<MeatYieldEstimateResult | null>(null);

  // Financial inputs & result
  const [financialInputs, setFinancialInputs] = useState<FinancialCalculatorInput>({
    liveAnimalPricePkr: 220000,
    sellingMode: 'bone_in',
    boneInMeatPricePerKgPkr: 1100,
    bonelessMeatPricePerKgPkr: 1450,
    soupBonePricePerKgPkr: 300,
    fatPricePerKgPkr: 400,
    hideValuePkr: 4500,
    headAndTrottersValuePkr: 3500,
    edibleOffalValuePkr: 5000,
    butcherAndSlaughterCostPkr: 6000,
    transportAndPackagingCostPkr: 3000,
  });

  const [financialResult, setFinancialResult] = useState<FinancialCalculatorResult | null>(null);

  // Calibration modal
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [actualCarcassInput, setActualCarcassInput] = useState<number>(0);
  const [actualCityInput, setActualCityInput] = useState<string>('Lahore PAMCO');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Auto calculate when core inputs change
  useEffect(() => {
    runCalculation();
  }, [species, breed, liveWeightKg, gender, ageDentition, bcs, physicalBuild, dressingMethod, fastingStatus]);

  // Update default financial price suggestions per species
  useEffect(() => {
    if (species === 'cow' || species === 'buffalo') {
      setFinancialInputs((prev) => ({
        ...prev,
        liveAnimalPricePkr: species === 'cow' ? 240000 : 260000,
        boneInMeatPricePerKgPkr: 1100,
        bonelessMeatPricePerKgPkr: 1450,
        soupBonePricePerKgPkr: 300,
        fatPricePerKgPkr: 400,
        hideValuePkr: species === 'buffalo' ? 6500 : 4500,
        headAndTrottersValuePkr: 4000,
        edibleOffalValuePkr: 5500,
        butcherAndSlaughterCostPkr: 6000,
      }));
    } else {
      // Small Ruminant (Goat / Sheep / Dumba - Mutton rates)
      setFinancialInputs((prev) => ({
        ...prev,
        liveAnimalPricePkr: species === 'dumba' ? 95000 : 75000,
        boneInMeatPricePerKgPkr: 2300,
        bonelessMeatPricePerKgPkr: 2900,
        soupBonePricePerKgPkr: 600,
        fatPricePerKgPkr: 750,
        hideValuePkr: 1200,
        headAndTrottersValuePkr: 1800,
        edibleOffalValuePkr: 2200,
        butcherAndSlaughterCostPkr: 2500,
      }));
    }
  }, [species]);

  // Recalculate financials whenever estimate or financial inputs change
  useEffect(() => {
    if (estimateResult) {
      const scenario = estimateResult.scenarios[activeScenario];
      const res = calculateMeatYieldFinancials(scenario, estimateResult.byProducts, financialInputs);
      setFinancialResult(res);
    }
  }, [estimateResult, activeScenario, financialInputs]);

  // Handle Species Change
  const handleSpeciesChange = (newSpecies: MeatYieldSpecies) => {
    setSpecies(newSpecies);
    const spObj = SPECIES_OPTIONS.find((s) => s.id === newSpecies);
    if (spObj && spObj.typicalBreeds.length > 0) {
      setBreed(spObj.typicalBreeds[0]);
    }
    // Set typical weight
    if (newSpecies === 'cow') {
      setLiveWeightKg(420);
      setWeightMaund(10.5);
    } else if (newSpecies === 'buffalo') {
      setLiveWeightKg(520);
      setWeightMaund(13.0);
    } else if (newSpecies === 'dumba') {
      setLiveWeightKg(75);
      setWeightMaund(1.88);
    } else if (newSpecies === 'goat') {
      setLiveWeightKg(55);
      setWeightMaund(1.38);
    } else {
      setLiveWeightKg(60);
      setWeightMaund(1.5);
    }
  };

  const handleWeightKgChange = (val: number) => {
    const safe = Math.max(0, val);
    setLiveWeightKg(safe);
    setWeightMaund(Number((safe / 40).toFixed(2)));
  };

  const handleWeightMaundChange = (val: number) => {
    const safe = Math.max(0, val);
    setWeightMaund(safe);
    setLiveWeightKg(Math.round(safe * 40));
  };

  const runCalculation = () => {
    const input: MeatYieldInput = {
      species,
      breed,
      liveWeightKg,
      gender,
      ageDentition,
      bcs,
      physicalBuild,
      dressingMethod,
      fastingStatus,
      animalNameOrTag,
    };
    const res = calculateMeatYield(input);
    setEstimateResult(res);
  };

  const handleSaveToRecords = async () => {
    if (!estimateResult) return;
    const res = await saveMeatYieldEstimate(estimateResult);
    if (res.success) {
      setSaveSuccessMsg(isUrdu ? 'تخمینہ کامیابی سے فارم ریکارڈ میں محفوظ کر لیا گیا۔' : 'Meat yield estimate saved to records!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const handleRecordSlaughter = async () => {
    if (!estimateResult || actualCarcassInput <= 0) return;
    const res = await recordSlaughterActual({
      estimateId: estimateResult.id,
      species,
      breed,
      liveWeightKg,
      actualCarcassWeightKg: actualCarcassInput,
      predictedDressingPercentage: estimateResult.scenarios.mostLikely.dressingPercentage,
      slaughterhouseOrCity: actualCityInput,
      notes: `Recorded via AMK Animal AI on ${new Date().toLocaleDateString()}`,
    });

    if (res.success) {
      setShowCalibrationModal(false);
      setSaveSuccessMsg(isUrdu ? 'ذبح کے اصل نتائج محفوظ کر لیے گئے۔ ماڈل کیلیبریشن اپڈیٹ ہو گئی۔' : 'Slaughter outcome recorded! Calibration database updated.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const currentScenario = estimateResult?.scenarios[activeScenario];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in font-sans">
      {/* Printable Certificate Header with Official AMK Monogram (visible only during print) */}
      <div className="hidden print:block mb-8 border-b-2 border-emerald-700 pb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/amk-monogram.jpg" alt="AMK Monogram" className="w-14 h-14 rounded-xl object-cover border border-emerald-600" />
          <div className="text-left">
            <h1 className="text-2xl font-black text-emerald-950">AMK ANIMAL AI — MEAT YIELD CERTIFICATE</h1>
            <p className="text-xs text-slate-600">Official Livestock Carcass Breakdown & Pre-Slaughter Yield Evaluation</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 font-semibold">Trust • Innovation • Excellence | By amkashif | WhatsApp: +923346682654 | Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Screen Header */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <Beef className="w-4 h-4 text-emerald-600" />
            <span>{t.meatYield.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.meatYield.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {t.meatYield.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToScanner && (
            <button
              onClick={onNavigateToScanner}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>{t.meatYield.useScannerWeight}</span>
            </button>
          )}

          <button
            onClick={handlePrintCertificate}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{t.meatYield.printReport}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs & Animal Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-600" />
                <span>{t.meatYield.animalDetails}</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">Step 1 of 2</span>
            </div>

            {/* Species Selector Tabs with Animal Photos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t.meatYield.species}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SPECIES_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSpeciesChange(opt.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl text-center transition-all ${
                      species === opt.id
                        ? 'bg-emerald-600 text-white shadow-sm font-bold ring-2 ring-emerald-500'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-100 text-xs'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden mb-1.5 shadow-xs border border-white/60 bg-emerald-100">
                      <img
                        src={opt.imageUrl}
                        alt={opt.nameEn}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] leading-tight line-clamp-1">{isUrdu ? opt.nameUr : opt.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Breed Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.meatYield.breed}
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {SPECIES_OPTIONS.find((s) => s.id === species)?.typicalBreeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Weight (kg and Maund Dual Input) */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.liveWeight}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={liveWeightKg || ''}
                    onChange={(e) => handleWeightKgChange(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.liveWeightMaund}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="50"
                    value={weightMaund || ''}
                    onChange={(e) => handleWeightMaundChange(Number(e.target.value))}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    من
                  </span>
                </div>
              </div>
            </div>

            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.meatYield.gender}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="male">{t.meatYield.male}</option>
                  <option value="female">{t.meatYield.female}</option>
                  <option value="castrated">{t.meatYield.castrated}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.meatYield.ageDentition}
                </label>
                <select
                  value={ageDentition}
                  onChange={(e) => setAgeDentition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="kheera_milk_teeth">{t.meatYield.kheera}</option>
                  <option value="donda_2_teeth">{t.meatYield.donda}</option>
                  <option value="choga_4_teeth">{t.meatYield.choga}</option>
                  <option value="chhega_6_teeth">{t.meatYield.chhega}</option>
                  <option value="full_mouth_mature">{t.meatYield.fullMouth}</option>
                </select>
              </div>
            </div>

            {/* Body Condition Score (BCS 1-5) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t.meatYield.bcs}
                </label>
                <span className="text-[11px] font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                  BCS {bcs}/5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {([1, 2, 3, 4, 5] as const).map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setBcs(score)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition ${
                      bcs === score
                        ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-500'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                {bcs === 1 && t.meatYield.bcs1}
                {bcs === 2 && t.meatYield.bcs2}
                {bcs === 3 && t.meatYield.bcs3}
                {bcs === 4 && t.meatYield.bcs4}
                {bcs === 5 && t.meatYield.bcs5}
              </p>
            </div>

            {/* Muscular Build & Dressing Method */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.meatYield.physicalBuild}
                </label>
                <select
                  value={physicalBuild}
                  onChange={(e) => setPhysicalBuild(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="heavy_muscular">{t.meatYield.buildHeavy}</option>
                  <option value="medium_normal">{t.meatYield.buildMedium}</option>
                  <option value="light_dairy">{t.meatYield.buildLight}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.meatYield.dressingMethod}
                </label>
                <select
                  value={dressingMethod}
                  onChange={(e) => setDressingMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="standard_halal_skin_off">{t.meatYield.methodStandard}</option>
                  <option value="traditional_qurbani">{t.meatYield.methodQurbani}</option>
                  <option value="skin_on_dressed">{t.meatYield.methodSkinOn}</option>
                  <option value="commercial_chilled">{t.meatYield.methodChilled}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.meatYield.fastingStatus}
                </label>
                <select
                  value={fastingStatus}
                  onChange={(e) => setFastingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="fasted_12_24h">{t.meatYield.fasted}</option>
                  <option value="unfasted_full_gut">{t.meatYield.unfasted}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Meat Prediction Scenarios & Carcass Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Printable Animal Profile Tag Summary */}
          <div className="hidden print:grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-xs">
            <div><strong>Species:</strong> {species.toUpperCase()}</div>
            <div><strong>Breed:</strong> {breed}</div>
            <div><strong>Live Weight:</strong> {liveWeightKg} kg ({weightMaund} Maund)</div>
            <div><strong>Dentition:</strong> {ageDentition}</div>
          </div>

          {/* Scenario Tabs (Low / Most Likely / High) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Beef className="w-5 h-5 text-emerald-600" />
                  <span>{t.meatYield.resultsTitle}</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scientific Carcass Partition & Component Weights
                </p>
              </div>

              {/* Scenario Toggle Buttons */}
              <div className="print:hidden inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setActiveScenario('low')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScenario === 'low'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.meatYield.lowScenario}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario('mostLikely')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScenario === 'mostLikely'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.meatYield.likelyScenario}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario('high')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScenario === 'high'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.meatYield.highScenario}
                </button>
              </div>
            </div>

            {/* Approximate Warning Disclaimer Badge */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{t.meatYield.disclaimerNotice}</span>
            </div>

            {/* Primary Carcass & Meat KPI Cards */}
            {currentScenario && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Carcass Weight */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t.meatYield.carcassWeight}
                    </span>
                    <span className="text-2xl font-black text-emerald-950 mt-1 block">
                      {currentScenario.carcassWeightKg} <span className="text-xs font-bold">kg</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block">
                      {currentScenario.dressingPercentage}% of live weight
                    </span>
                  </div>

                  {/* Bone-In Meat */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80">
                    <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                      {t.meatYield.boneInMeat}
                    </span>
                    <span className="text-2xl font-black text-brand-950 mt-1 block">
                      {currentScenario.boneInMeatKg} <span className="text-xs font-bold">kg</span>
                    </span>
                    <span className="text-[10px] font-semibold text-brand-700 mt-0.5 block">
                      {currentScenario.boneInMeatPercentage}% of carcass
                    </span>
                  </div>

                  {/* Boneless Meat */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      {t.meatYield.bonelessMeat}
                    </span>
                    <span className="text-2xl font-black text-blue-950 mt-1 block">
                      {currentScenario.bonelessMeatKg} <span className="text-xs font-bold">kg</span>
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 mt-0.5 block">
                      {currentScenario.bonelessMeatPercentage}% of carcass
                    </span>
                  </div>

                  {/* Separable Fat */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      {t.meatYield.fatWeight}
                    </span>
                    <span className="text-2xl font-black text-amber-950 mt-1 block">
                      {currentScenario.fatWeightKg} <span className="text-xs font-bold">kg</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 mt-0.5 block">
                      {currentScenario.fatPercentage}% of carcass
                    </span>
                  </div>
                </div>

                {/* Internal Percentage Consistency Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Carcass Partition Consistency</span>
                    <span>100% Accounted</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden">
                    <div
                      style={{ width: `${currentScenario.bonelessMeatPercentage}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Boneless Meat: ${currentScenario.bonelessMeatPercentage}%`}
                    />
                    <div
                      style={{ width: `${currentScenario.bonePercentage}%` }}
                      className="bg-slate-400 h-full"
                      title={`Bones: ${currentScenario.bonePercentage}%`}
                    />
                    <div
                      style={{ width: `${currentScenario.fatPercentage}%` }}
                      className="bg-amber-400 h-full"
                      title={`Separable Fat: ${currentScenario.fatPercentage}%`}
                    />
                    <div
                      style={{ width: `${currentScenario.trimWastePercentage}%` }}
                      className="bg-red-300 h-full"
                      title={`Shrinkage/Trim: ${currentScenario.trimWastePercentage}%`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Boneless Meat ({currentScenario.bonelessMeatPercentage}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      Bone Weight: {currentScenario.boneWeightKg} kg ({currentScenario.bonePercentage}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Fat: {currentScenario.fatWeightKg} kg ({currentScenario.fatPercentage}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                      Loss/Trim ({currentScenario.trimWastePercentage}%)
                    </span>
                  </div>
                </div>

                {/* Factors Applied Tags */}
                {estimateResult?.factorsApplied && estimateResult.factorsApplied.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Biological & Conditioning Factors Incorporated:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {estimateResult.factorsApplied.map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200/80"
                        >
                          {isUrdu ? fac.factorUr : fac.factorEn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fifth Quarter / By-Products Breakdown Card */}
          {estimateResult?.byProducts && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-600" />
                <span>{t.meatYield.byProductsTitle}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{t.meatYield.hideOrSkin}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {estimateResult.byProducts.hideOrSkinKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">({estimateResult.byProducts.hideOrSkinPct}% of live)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{t.meatYield.headAndTrotters}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {estimateResult.byProducts.headAndTrottersKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">({estimateResult.byProducts.headAndTrottersPct}% of live)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{t.meatYield.edibleRedOffal}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {estimateResult.byProducts.edibleRedOffalKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">({estimateResult.byProducts.edibleRedOffalPct}% of live)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{t.meatYield.edibleGreenOffal}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {estimateResult.byProducts.edibleGreenOffalKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">({estimateResult.byProducts.edibleGreenOffalPct}% of live)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 block">{t.meatYield.bloodAndGutWaste}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {estimateResult.byProducts.bloodAndGutWasteKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400">({estimateResult.byProducts.bloodAndGutWastePct}% of live weight)</span>
                </div>
              </div>
            </div>
          )}

          {/* Financial Commercial Economics Calculator */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>{t.meatYield.financialsTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.meatYield.financialsSubtitle}
                </p>
              </div>

              {/* Selling Mode Selector */}
              <div className="print:hidden inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFinancialInputs({ ...financialInputs, sellingMode: 'bone_in' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    financialInputs.sellingMode === 'bone_in'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.meatYield.modeBoneIn}
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialInputs({ ...financialInputs, sellingMode: 'boneless' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    financialInputs.sellingMode === 'boneless'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.meatYield.modeBoneless}
                </button>
              </div>
            </div>

            {/* Financial Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:hidden">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.liveAnimalPrice}
                </label>
                <input
                  type="number"
                  value={financialInputs.liveAnimalPricePkr}
                  onChange={(e) =>
                    setFinancialInputs({ ...financialInputs, liveAnimalPricePkr: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {financialInputs.sellingMode === 'bone_in' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.meatYield.boneInRate}
                  </label>
                  <input
                    type="number"
                    value={financialInputs.boneInMeatPricePerKgPkr}
                    onChange={(e) =>
                      setFinancialInputs({ ...financialInputs, boneInMeatPricePerKgPkr: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t.meatYield.bonelessRate}
                    </label>
                    <input
                      type="number"
                      value={financialInputs.bonelessMeatPricePerKgPkr}
                      onChange={(e) =>
                        setFinancialInputs({ ...financialInputs, bonelessMeatPricePerKgPkr: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t.meatYield.soupBoneRate}
                    </label>
                    <input
                      type="number"
                      value={financialInputs.soupBonePricePerKgPkr}
                      onChange={(e) =>
                        setFinancialInputs({ ...financialInputs, soupBonePricePerKgPkr: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.butcherFee}
                </label>
                <input
                  type="number"
                  value={financialInputs.butcherAndSlaughterCostPkr}
                  onChange={(e) =>
                    setFinancialInputs({ ...financialInputs, butcherAndSlaughterCostPkr: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.hideValue}
                </label>
                <input
                  type="number"
                  value={financialInputs.hideValuePkr}
                  onChange={(e) =>
                    setFinancialInputs({ ...financialInputs, hideValuePkr: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.meatYield.headTrottersValue}
                </label>
                <input
                  type="number"
                  value={financialInputs.headAndTrottersValuePkr}
                  onChange={(e) =>
                    setFinancialInputs({ ...financialInputs, headAndTrottersValuePkr: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Profitability Outcome Cards */}
            {financialResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {t.meatYield.totalInvestment}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    Rs. {financialResult.totalCostPkr.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {t.meatYield.totalRevenue}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    Rs. {financialResult.totalRevenuePkr.toLocaleString()}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    financialResult.isProfit
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase flex items-center gap-1">
                    {financialResult.isProfit ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                    <span>{financialResult.isProfit ? t.meatYield.netProfit : t.meatYield.netLoss}</span>
                  </span>
                  <span className="text-lg font-black mt-0.5 block">
                    Rs. {Math.abs(financialResult.netProfitOrLossPkr).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold block mt-0.5">
                    {financialResult.profitMarginPercent}% Margin
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {t.meatYield.effectiveMeatCost}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    Rs. {financialResult.effectiveCostPerKgMeatPkr} / kg
                  </span>
                  <span className="text-[10px] text-slate-400">Net production cost</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Strip: Save & Record Slaughter calibration */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={handleSaveToRecords}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>{t.meatYield.saveEstimate}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCalibrationModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t.meatYield.recordActual}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actual Slaughter Calibration Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>{t.meatYield.recordActual}</span>
              </h3>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Recording actual post-slaughter scale measurements calibrates the scientific prediction model and improves yield accuracy for {breed}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Actual Carcass Dressed Weight (صاف لاشہ وزن کلو)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 224.5"
                  value={actualCarcassInput || ''}
                  onChange={(e) => setActualCarcassInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Abattoir / Slaughterhouse / Mandi City
                </label>
                <input
                  type="text"
                  placeholder="e.g. PAMCO Slaughterhouse, Lahore"
                  value={actualCityInput}
                  onChange={(e) => setActualCityInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCalibrationModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordSlaughter}
                disabled={actualCarcassInput <= 0}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                Submit Calibration Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
