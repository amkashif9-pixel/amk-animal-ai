import { PriceEstimateInput, PriceEstimateResult } from '../types/marketPrice';
import { PAKISTAN_MANDI_BENCHMARKS } from '../data/priceData';

// Currency exchange benchmarks relative to PKR
const CURRENCY_CONVERSIONS: Record<string, { currency: string; rateFromPkr: number; symbol: string }> = {
  Pakistan: { currency: 'PKR', rateFromPkr: 1.0, symbol: 'Rs' },
  'Saudi Arabia': { currency: 'SAR', rateFromPkr: 1 / 74.2, symbol: 'SAR' },
  UAE: { currency: 'AED', rateFromPkr: 1 / 75.8, symbol: 'AED' },
  International: { currency: 'USD', rateFromPkr: 1 / 278.5, symbol: '$' },
  UK: { currency: 'GBP', rateFromPkr: 1 / 355.0, symbol: '£' },
};

export function calculateMarketPrice(input: PriceEstimateInput): PriceEstimateResult {
  // 1. Input sanitization & boundary defense
  const sanitizedWeight = Math.max(1, Math.min(2500, Number(input.weightKg) || 50));
  const sanitizedAge = Math.max(0.1, Math.min(35, Number(input.ageYears) || 2.0));
  const isFemale = input.gender === 'female';
  const sanitizedMilkYield = isFemale ? Math.max(0, Math.min(60, Number(input.dailyMilkProductionLiters) || 0)) : 0;
  const isActuallyPregnant = isFemale && Boolean(input.isPregnant);
  const countryKey = input.country in CURRENCY_CONVERSIONS ? input.country : 'Pakistan';
  const conversion = CURRENCY_CONVERSIONS[countryKey] || CURRENCY_CONVERSIONS.Pakistan;

  const { species, breed, healthCondition, purpose = 'dairy' } = input;

  // 2. Lookup breed benchmark or species fallback
  const breedKey = Object.keys(PAKISTAN_MANDI_BENCHMARKS).find(
    (k) =>
      k.toLowerCase().includes(breed.toLowerCase().replace(/[\s-]/g, '_')) ||
      PAKISTAN_MANDI_BENCHMARKS[k].species.toLowerCase() === species.toLowerCase()
  );

  const isSmallRuminant = species.toLowerCase().includes('goat') || species.toLowerCase().includes('sheep');
  const isPoultry = species.toLowerCase().includes('hen') || species.toLowerCase().includes('poultry') || species.toLowerCase().includes('rooster');

  const benchmark = breedKey
    ? PAKISTAN_MANDI_BENCHMARKS[breedKey]
    : {
        species,
        breed,
        basePricePerKgLiveWeight: isPoultry ? 2500 : isSmallRuminant ? 1050 : 680,
        dairyYieldPerLiterBonus: isSmallRuminant ? 12000 : 14000,
        qurbaniTeethMultiplier: {
          milk_teeth: 1.0,
          two_teeth: 1.25,
          four_teeth: 1.15,
          six_teeth: 1.0,
          full_mouth: 0.85,
        },
        pregnancyBonusMin: isSmallRuminant ? 12000 : 30000,
        pregnancyBonusMax: isSmallRuminant ? 25000 : 60000,
      };

  const factorsApplied: {
    factorEn: string;
    factorUr: string;
    impact: 'positive' | 'negative' | 'neutral';
    percentage: number;
  }[] = [];

  // Step 1: Base Live Weight Asset Value
  let assetBase = sanitizedWeight * benchmark.basePricePerKgLiveWeight;
  factorsApplied.push({
    factorEn: `Live weight base (${sanitizedWeight} kg @ Rs ${benchmark.basePricePerKgLiveWeight}/kg)`,
    factorUr: `زندہ وزن کا بنیادی تخمینہ (${sanitizedWeight} کلو @ ${benchmark.basePricePerKgLiveWeight} روپے فی کلو)`,
    impact: 'neutral',
    percentage: 0,
  });

  // Step 2: Dentition / Age Factor
  let teethCategory = 'two_teeth';
  if (sanitizedAge < 1.5) teethCategory = 'milk_teeth';
  else if (sanitizedAge >= 1.5 && sanitizedAge < 2.5) teethCategory = 'two_teeth';
  else if (sanitizedAge >= 2.5 && sanitizedAge < 4.0) teethCategory = 'four_teeth';
  else if (sanitizedAge >= 4.0 && sanitizedAge < 6.0) teethCategory = 'six_teeth';
  else teethCategory = 'full_mouth';

  const teethMult = benchmark.qurbaniTeethMultiplier[teethCategory] || 1.0;
  if (teethMult !== 1.0) {
    const pct = Math.round((teethMult - 1.0) * 100);
    assetBase *= teethMult;
    factorsApplied.push({
      factorEn: `Age & Dentition adjustment (${teethCategory.replace('_', ' ')}): ${pct > 0 ? '+' : ''}${pct}%`,
      factorUr: `عمر اور دانتوں کا تخمینہ (${teethCategory === 'two_teeth' ? 'دوندہ' : teethCategory === 'four_teeth' ? 'چوگا' : 'عمر رسیدگی'}): ${pct > 0 ? '+' : ''}${pct}%`,
      impact: pct > 0 ? 'positive' : 'negative',
      percentage: pct,
    });
  }

  // Step 3: Physical Health Adjustment
  let healthMultiplier = 1.0;
  if (healthCondition === 'excellent') {
    healthMultiplier = 1.15;
    factorsApplied.push({
      factorEn: 'Prime physical body condition & glossy coat (+15%)',
      factorUr: 'اعلیٰ چمکدار کھال اور بہترین فربہی (+15%)',
      impact: 'positive',
      percentage: 15,
    });
  } else if (healthCondition === 'good') {
    healthMultiplier = 1.05;
  } else if (healthCondition === 'fair') {
    healthMultiplier = 0.9;
    factorsApplied.push({
      factorEn: 'Lean body condition (-10%)',
      factorUr: 'کمزور جسمانی ساخت (-10%)',
      impact: 'negative',
      percentage: -10,
    });
  } else if (healthCondition === 'poor') {
    healthMultiplier = 0.75;
    factorsApplied.push({
      factorEn: 'Substandard / rehabilitating condition (-25%)',
      factorUr: 'انتہائی لاغر یا زیرِ علاج حالت (-25%)',
      impact: 'negative',
      percentage: -25,
    });
  }
  assetBase *= healthMultiplier;

  // Step 4: Qurbani Purpose (applicable to sound 2-teeth or 4-teeth animals)
  if (purpose === 'qurbani' && (teethCategory === 'two_teeth' || teethCategory === 'four_teeth')) {
    assetBase *= 1.2;
    factorsApplied.push({
      factorEn: 'Qurbani sacrificial eligibility & premium aesthetics (+20%)',
      factorUr: 'قربانی کی شرعی اہلیت (دوندہ/چوگا) اور خوبصورتی کا پریمیم (+20%)',
      impact: 'positive',
      percentage: 20,
    });
  }

  // Step 5: Additive Production Bonuses (Milk Yield & Pregnancy)
  let productionBonus = 0;
  if (sanitizedMilkYield > 0) {
    const milkBonus = sanitizedMilkYield * benchmark.dairyYieldPerLiterBonus;
    productionBonus += milkBonus;
    const share = Math.round(assetBase > 0 ? (milkBonus / (assetBase + milkBonus)) * 100 : 0);
    factorsApplied.push({
      factorEn: `Dairy milk yield (${sanitizedMilkYield} L/day adds Rs ${Math.round(milkBonus).toLocaleString()})`,
      factorUr: `دودھ کی پیداوار (${sanitizedMilkYield} لیٹر یومیہ پر ${Math.round(milkBonus).toLocaleString()} روپے کا اضافہ)`,
      impact: 'positive',
      percentage: share,
    });
  }

  if (isActuallyPregnant) {
    const pregBonus = (benchmark.pregnancyBonusMin + benchmark.pregnancyBonusMax) / 2;
    productionBonus += pregBonus;
    factorsApplied.push({
      factorEn: `Confirmed pregnant / gestating (+Rs ${Math.round(pregBonus).toLocaleString()})`,
      factorUr: `تصدیق شدہ گابھن مادہ (+${Math.round(pregBonus).toLocaleString()} روپے)`,
      impact: 'positive',
      percentage: 15,
    });
  }

  // Combined Total in PKR
  let totalPkr = assetBase + productionBonus;

  // Enforce Realistic Price Floors
  const floorPkr = isPoultry ? 3000 : isSmallRuminant ? 25000 : 70000;
  if (totalPkr < floorPkr) totalPkr = floorPkr;

  // Convert to requested currency
  const convertedAvg = totalPkr * conversion.rateFromPkr;
  const isPkr = conversion.currency === 'PKR';
  const roundFactor = isPkr ? 1000 : 10;

  const avgPrice = Math.round(convertedAvg / roundFactor) * roundFactor;
  const minPrice = Math.round((avgPrice * 0.88) / roundFactor) * roundFactor;
  const maxPrice = Math.round((avgPrice * 1.14) / roundFactor) * roundFactor;

  return {
    currency: conversion.currency,
    minPrice,
    avgPrice,
    maxPrice,
    lastUpdatedDate: '2025-11-15 (Q4 Survey Dataset)',
    benchmarkCatalogDate: '2025-11-15',
    lastReviewedDate: '2026-11-03',
    geographicCoverageEn: 'Punjab & Sindh Mandis (Lahore, Multan, Faisalabad, Karachi)',
    geographicCoverageUr: 'پنجاب اور سندھ کی مرکزی لائیو اسٹاک منڈیاں (لاہور، ملتان، فیصل آباد، کراچی)',
    isLiveMandiFeed: false,
    valuationTypeEn: 'Illustrative Baseline Mandi Survey Estimate (Non-Live)',
    valuationTypeUr: 'وضاحتی منڈی سروے تخمینہ (حوالہ جاتی / غیر لائیو)',
    dataSourceEn: `Punjab & Sindh Livestock Market Research Surveys & Mandi Indices (${countryKey}) — Static Reference Benchmarks (Nov 2025). Non-live algorithmic model.`,
    dataSourceUr: `پنجاب و سندھ لائیو اسٹاک منڈی سروے انڈیکس (${countryKey}) — حوالہ جاتی بینچ مارک (نومبر 2025)۔ غیر لائیو سائنسی ماڈل۔`,
    confidenceLevelEn: 'Approximate',
    confidenceLevelUr: 'تقریبی تخمینہ (Approximate Estimate)',
    limitationsNoticeEn:
      'NON-LIVE BENCHMARK NOTICE: This valuation is calculated from static livestock research benchmarks (November 2025) and fixed currency exchange constants (USD ~278.5 PKR, SAR ~74.2 PKR, AED ~75.8 PKR). AMK Animal AI does NOT currently connect to live real-time auction ticker APIs. Real auction prices in mandis (e.g. Shahpur Kanjran Lahore, Multan, Cattle Colony Karachi) fluctuate based on daily supply, teeth soundness, and on-site negotiation. Never use as a legally binding appraisal.',
    limitationsNoticeUr:
      'غیر لائیو انڈیکس نوٹس: یہ قیمت لائیو اسٹاک ریسرچ سروے کے جامد بینچ مارکس (نومبر 2025) اور مقررہ کرنسی ریٹس پر مبنی سائنسی تخمینہ ہے۔ اے ایم کے اینیمل اے آئی کسی لائیو منڈی ریئل ٹائم ٹکر سے منسلک نہیں ہے۔ اصل قیمتیں منڈی میں روزانہ رسد و طلب، دانتوں اور موقع پر خریدار و بیوپاری کی بات چیت سے طے ہوتی ہیں۔ اسے حتمی قانونی دستاویز کے طور پر استعمال نہ کریں۔',
    factorsApplied,
  };
}
