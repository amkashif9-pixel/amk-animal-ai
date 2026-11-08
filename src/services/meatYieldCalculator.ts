/**
 * Scientific Meat Yield & Carcass Breakdown Calculation Engine
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * Based on empirical livestock carcass research, meat science literature, and
 * South Asian livestock dressing benchmarks (UVAS Lahore, PARC, and FAO reference data).
 */

import {
  MeatYieldSpecies,
  MeatYieldInput,
  MeatYieldEstimateResult,
  YieldScenario,
  ByProductsBreakdown,
  SpeciesYieldConfig,
  FinancialCalculatorInput,
  FinancialCalculatorResult,
} from '../types/meatYield';

// ============================================================================
// 1. DEFAULT SPECIES BENCHMARKS
// ============================================================================
export const DEFAULT_SPECIES_CONFIGS: Record<MeatYieldSpecies, SpeciesYieldConfig> = {
  cow: {
    species: 'cow',
    nameEn: 'Cow / Cattle (گائے)',
    nameUr: 'گائے / بیل (Cattle)',
    baseDressingPctLow: 50.0,
    baseDressingPctLikely: 53.0,
    baseDressingPctHigh: 56.5,
    baseBonelessYieldPct: 70.5,
    baseBonePct: 18.0,
    baseFatPct: 10.0,
    baseTrimWastePct: 1.5,
    hideSkinPctOfLiveWeight: 7.0,
    headTrottersPctOfLiveWeight: 5.0,
    redOffalPctOfLiveWeight: 3.0,
    greenOffalPctOfLiveWeight: 4.0,
    notes: 'UVAS & PARC Sahiwal/Cholistani cattle meat dressing trial benchmarks.',
    isOfficialBenchmark: true,
  },
  buffalo: {
    species: 'buffalo',
    nameEn: 'Buffalo (بھینس / کٹا)',
    nameUr: 'بھینس / کٹا (Water Buffalo)',
    baseDressingPctLow: 47.0,
    baseDressingPctLikely: 50.0,
    baseDressingPctHigh: 53.0,
    baseBonelessYieldPct: 68.5,
    baseBonePct: 20.0,
    baseFatPct: 9.5,
    baseTrimWastePct: 2.0,
    hideSkinPctOfLiveWeight: 10.5, // Buffaloes have substantially heavier hide
    headTrottersPctOfLiveWeight: 5.5,
    redOffalPctOfLiveWeight: 3.2,
    greenOffalPctOfLiveWeight: 4.5,
    notes: 'Nili-Ravi & Kundi young male buffalo dressing trial data (PFI / UVAS).',
    isOfficialBenchmark: true,
  },
  goat: {
    species: 'goat',
    nameEn: 'Goat / Buck (بکری / بکرا)',
    nameUr: 'بکرا / بکری (Caprine)',
    baseDressingPctLow: 46.0,
    baseDressingPctLikely: 49.0,
    baseDressingPctHigh: 52.5,
    baseBonelessYieldPct: 68.0,
    baseBonePct: 21.0,
    baseFatPct: 8.5,
    baseTrimWastePct: 2.5,
    hideSkinPctOfLiveWeight: 7.5,
    headTrottersPctOfLiveWeight: 5.5,
    redOffalPctOfLiveWeight: 3.2,
    greenOffalPctOfLiveWeight: 4.0,
    notes: 'Beetal, Kamori, and Teddy goat carcass yield standards in Punjab/Sindh.',
    isOfficialBenchmark: true,
  },
  sheep: {
    species: 'sheep',
    nameEn: 'Sheep (بھیڑ / چھترا)',
    nameUr: 'بھیڑ / چھترا (Thin-Tailed Sheep)',
    baseDressingPctLow: 45.0,
    baseDressingPctLikely: 48.0,
    baseDressingPctHigh: 51.0,
    baseBonelessYieldPct: 66.0,
    baseBonePct: 20.0,
    baseFatPct: 12.5,
    baseTrimWastePct: 1.5,
    hideSkinPctOfLiveWeight: 8.0,
    headTrottersPctOfLiveWeight: 5.0,
    redOffalPctOfLiveWeight: 3.0,
    greenOffalPctOfLiveWeight: 4.0,
    notes: 'Kajli and Lohi breed carcass composition research standards.',
    isOfficialBenchmark: true,
  },
  dumba: {
    species: 'dumba',
    nameEn: 'Ram / Dumba (دنبہ / مینڈھا)',
    nameUr: 'دنبہ / مینڈھا (Fat-Tailed Sheep)',
    baseDressingPctLow: 48.0,
    baseDressingPctLikely: 52.0,
    baseDressingPctHigh: 56.0,
    baseBonelessYieldPct: 62.0,
    baseBonePct: 18.5,
    baseFatPct: 18.0, // Substantial fat tail (چک چکی) included in halal carcass
    baseTrimWastePct: 1.5,
    hideSkinPctOfLiveWeight: 8.0,
    headTrottersPctOfLiveWeight: 5.0,
    redOffalPctOfLiveWeight: 3.0,
    greenOffalPctOfLiveWeight: 4.0,
    notes: 'Balkhi / Hashtnagri fat-tailed sheep (includes rump/tail fat deposits).',
    isOfficialBenchmark: true,
  },
};

// ============================================================================
// 2. CORE ESTIMATION ALGORITHM
// ============================================================================

export function calculateMeatYield(
  input: MeatYieldInput,
  customConfig?: SpeciesYieldConfig
): MeatYieldEstimateResult {
  const config = customConfig || DEFAULT_SPECIES_CONFIGS[input.species] || DEFAULT_SPECIES_CONFIGS.cow;
  const factorsApplied: MeatYieldEstimateResult['factorsApplied'] = [];

  // Guard against zero, negative, or NaN weight
  const safeWeight = Math.max(0, Number(input.liveWeightKg) || 0);

  // 1. Calculate Dressing Percentage Adjustments
  let dpAdjustment = 0;
  let bonelessPctAdj = 0;
  let bonePctAdj = 0;
  let fatPctAdj = 0;

  // Factor A: Body Condition Score (BCS 1-5)
  if (input.bcs === 1) {
    dpAdjustment -= 4.0;
    bonelessPctAdj -= 4.0;
    fatPctAdj -= 5.0;
    bonePctAdj += 6.0;
    factorsApplied.push({
      factorEn: 'Body Condition: Emaciated (BCS 1)',
      factorUr: 'جسمانی ساخت: انتہائی کمزور (BCS 1)',
      impactDescription: 'Lower dressing percentage (-4%) and higher bone-to-meat ratio.',
    });
  } else if (input.bcs === 2) {
    dpAdjustment -= 2.0;
    bonelessPctAdj -= 2.0;
    fatPctAdj -= 2.5;
    bonePctAdj += 3.0;
    factorsApplied.push({
      factorEn: 'Body Condition: Lean (BCS 2)',
      factorUr: 'جسمانی ساخت: دبلا / پتلا (BCS 2)',
      impactDescription: 'Slightly reduced dressing percentage (-2%).',
    });
  } else if (input.bcs === 4) {
    dpAdjustment += 2.5;
    bonelessPctAdj += 1.5;
    fatPctAdj += 4.0;
    bonePctAdj -= 3.0;
    factorsApplied.push({
      factorEn: 'Body Condition: Well-Finished / Plump (BCS 4)',
      factorUr: 'جسمانی ساخت: بھرا ہوا / تیار جانور (BCS 4)',
      impactDescription: 'Increased dressing yield (+2.5%) and good muscle covering.',
    });
  } else if (input.bcs === 5) {
    dpAdjustment += 4.0;
    bonelessPctAdj -= 1.0;
    fatPctAdj += 8.0;
    bonePctAdj -= 5.0;
    factorsApplied.push({
      factorEn: 'Body Condition: Over-fat / Obese (BCS 5)',
      factorUr: 'جسمانی ساخت: حد سے زیادہ موٹا / چربی والا (BCS 5)',
      impactDescription: 'Substantially higher carcass weight (+4%) with higher separable fat.',
    });
  }

  // Factor B: Gender
  if (input.gender === 'male') {
    dpAdjustment += 1.0;
    bonelessPctAdj += 1.5;
    fatPctAdj -= 2.0;
    bonePctAdj += 0.5;
    factorsApplied.push({
      factorEn: 'Gender: Intact Bull / Buck / Ram',
      factorUr: 'جنس: نر جانور (سانڈ / بکرا / چھترا)',
      impactDescription: 'Higher muscularity, leaner carcass, and solid bone structure.',
    });
  } else if (input.gender === 'castrated') {
    dpAdjustment += 0.5;
    fatPctAdj += 1.5;
    factorsApplied.push({
      factorEn: 'Gender: Castrated (کھسی / واچھہ)',
      factorUr: 'جنس: خصی جانور (Castrated)',
      impactDescription: 'Optimal fat marbling and tender meat cuts.',
    });
  }

  // Factor C: Physical Build
  if (input.physicalBuild === 'heavy_muscular') {
    dpAdjustment += 2.0;
    bonelessPctAdj += 3.0;
    bonePctAdj -= 2.0;
    factorsApplied.push({
      factorEn: 'Physical Build: Heavy Muscular Beef Type',
      factorUr: 'جسمانی بناوٹ: کڑیل اور بھاری پٹھے',
      impactDescription: 'Exceptional meat yield (+3% boneless meat ratio).',
    });
  } else if (input.physicalBuild === 'light_dairy') {
    dpAdjustment -= 2.0;
    bonelessPctAdj -= 3.0;
    bonePctAdj += 2.5;
    factorsApplied.push({
      factorEn: 'Physical Build: Angular Dairy Frame',
      factorUr: 'جسمانی بناوٹ: ڈیری ہڈیوں والا فریم',
      impactDescription: 'Higher bone percentage and lower boneless meat yield.',
    });
  }

  // Factor D: Age & Dentition
  if (input.ageDentition === 'kheera_milk_teeth') {
    dpAdjustment -= 1.0;
    bonePctAdj -= 1.0;
    fatPctAdj -= 1.5;
    factorsApplied.push({
      factorEn: 'Age: Young (Milk Teeth / کھیرہ)',
      factorUr: 'عمر: کم عمر کھیرہ جانور (Milk Teeth)',
      impactDescription: 'Lighter tender bones with delicate fat cover.',
    });
  } else if (input.ageDentition === 'donda_2_teeth') {
    factorsApplied.push({
      factorEn: 'Age: Prime Youth (Two Teeth / دوندہ)',
      factorUr: 'عمر: دو دانت / دوندہ (Prime Qurbani Age)',
      impactDescription: 'Optimal scientific meat-to-bone equilibrium.',
    });
  } else if (input.ageDentition === 'full_mouth_mature') {
    dpAdjustment -= 1.5;
    bonePctAdj += 2.0;
    bonelessPctAdj -= 1.5;
    factorsApplied.push({
      factorEn: 'Age: Mature / Full Mouth (چھگا یا بڑا)',
      factorUr: 'عمر: پختہ عمر / پورا منہ',
      impactDescription: 'Heavier dense skeleton with higher bone percentage.',
    });
  }

  // Factor E: Fasting Status
  if (input.fastingStatus === 'fasted_12_24h') {
    dpAdjustment += 2.0;
    factorsApplied.push({
      factorEn: 'Fasting: Fasted 12-24 Hours Prior to Slaughter',
      factorUr: 'بھوکا رکھنا: ذبح سے 12 تا 24 گھنٹے قبل دانہ پانی روکا گیا',
      impactDescription: 'Evacuated gut fill yields higher dressing percentage on live weight.',
    });
  } else {
    dpAdjustment -= 2.0;
    factorsApplied.push({
      factorEn: 'Fasting: Unfasted (Full Gut / بھرا ہوا پیٹ)',
      factorUr: 'بھوکا رکھنا: پیٹ بھرا ہوا بغیر فاقہ',
      impactDescription: 'Gut contents (paunch fill) reduce net dressing yield by ~2%.',
    });
  }

  // Factor F: Dressing Method
  if (input.dressingMethod === 'skin_on_dressed') {
    dpAdjustment += 6.0;
    factorsApplied.push({
      factorEn: 'Dressing: Scalded Skin-On Dressed',
      factorUr: 'ذبح طریقہ: کھال سمیت لاشہ (Skin-on)',
      impactDescription: 'Retains skin on carcass (+6% gross dressed weight).',
    });
  } else if (input.dressingMethod === 'commercial_chilled') {
    dpAdjustment -= 2.0;
    factorsApplied.push({
      factorEn: 'Dressing: Chilled Carcass (Cooler Shrinkage)',
      factorUr: 'ذبح طریقہ: ٹھنڈا چلر لاشہ (Cooler Shrinkage)',
      impactDescription: 'Accounts for ~2% post-mortem moisture shrinkage.',
    });
  } else if (input.dressingMethod === 'traditional_qurbani') {
    fatPctAdj += 2.0;
    bonelessPctAdj -= 1.0;
    factorsApplied.push({
      factorEn: 'Dressing: Traditional Whole Qurbani Carcass',
      factorUr: 'ذبح طریقہ: روایتی قربانی کٹائی مع اندرونی چربی',
      impactDescription: 'Kidney and pelvic fat retained on carcass.',
    });
  }

  // 2. Compute 3 Scenarios (Low, Most Likely, High)
  const lowDP = clamp(config.baseDressingPctLow + dpAdjustment - 1.5, 38, 64);
  const likelyDP = clamp(config.baseDressingPctLikely + dpAdjustment, 40, 66);
  const highDP = clamp(config.baseDressingPctHigh + dpAdjustment + 1.5, 42, 68);

  const lowScenario = buildScenario(safeWeight, lowDP, config, bonelessPctAdj - 2.0, bonePctAdj + 1.5, fatPctAdj - 1.5);
  const likelyScenario = buildScenario(safeWeight, likelyDP, config, bonelessPctAdj, bonePctAdj, fatPctAdj);
  const highScenario = buildScenario(safeWeight, highDP, config, bonelessPctAdj + 2.0, bonePctAdj - 1.5, fatPctAdj + 2.0);

  // 3. Compute By-products Breakdown
  const byProducts = calculateByProducts(
    safeWeight,
    config,
    likelyScenario.carcassWeightKg,
    input.dressingMethod || 'standard_halal_skin_off'
  );

  return {
    id: 'yield_' + Date.now(),
    timestamp: new Date().toISOString(),
    input,
    species: input.species,
    liveWeightKg: safeWeight,
    scenarios: {
      low: lowScenario,
      mostLikely: likelyScenario,
      high: highScenario,
    },
    byProducts,
    factorsApplied,
    isCalibrated: config.isOfficialBenchmark,
    calibrationNotesEn: config.isOfficialBenchmark
      ? 'Calibrated using scientific Pakistani livestock carcass research trials (UVAS Lahore, PARC & FAO).'
      : 'Uncalibrated baseline estimate. Please record actual slaughter results to calibrate this breed.',
    calibrationNotesUr: config.isOfficialBenchmark
      ? 'یہ تخمینہ یونیورسٹی آف ویٹرنری اینڈ اینیمل سائنسز (UVAS) اور پاکستان زرعی تحقیقاتی کونسل کے سائنسی تجربات پر مبنی ہے۔'
      : 'غیر تصدیق شدہ بنیادی تخمینہ۔ درستگی میں بہتری کے لیے ذبح کے بعد اصل نتائج کا اندراج کریں۔',
    isApproximateEstimateOnly: true,
    scientificDisclaimerEn:
      'Approximate scientific estimate based on dressing percentage and body condition formulas. Actual slaughterhouse yields vary based on gut-fill, carcass chilling shrink, and specific cutting specifications. Not a guaranteed yield.',
    scientificDisclaimerUr:
      'یہ سائنسی تخمینہ ڈریسنگ فیصد اور جسمانی کیفیت کے فارمولوں پر مبنی ہے، جو حتمی یا لازمی نہیں ہے۔ اصل پیداوار معدہ بھرائی، ٹھنڈا ہونے پر کمی اور قصاب کے کٹاؤ کے طریقہ کار پر منحصر ہوتی ہے۔',
  };
}

// ============================================================================
// 3. HELPER FUNCTIONS FOR CONSISTENT PERCENTAGES
// ============================================================================

function buildScenario(
  liveWeightKg: number,
  dressingPercentage: number,
  config: SpeciesYieldConfig,
  bonelessAdj: number,
  boneAdj: number,
  fatAdj: number
): YieldScenario {
  const carcassWeightKg = roundTwo((liveWeightKg * dressingPercentage) / 100);

  // Raw adjusted proportions of carcass
  let rawBoneless = Math.max(45, config.baseBonelessYieldPct + bonelessAdj);
  let rawBone = Math.max(10, config.baseBonePct + boneAdj);
  let rawFat = Math.max(4, config.baseFatPct + fatAdj);
  let rawTrim = Math.max(1, config.baseTrimWastePct);

  // Strictly normalize sum to exactly 100% of carcass
  const sum = rawBoneless + rawBone + rawFat + rawTrim;
  const bonelessMeatPct = roundTwo((rawBoneless / sum) * 100);
  const bonePct = roundTwo((rawBone / sum) * 100);
  const fatPct = roundTwo((rawFat / sum) * 100);
  // Ensure the 4 components add up to exactly 100.00% without rounding drift
  const trimWastePct = roundTwo(100 - (bonelessMeatPct + bonePct + fatPct));

  // Bone-in Meat (Traditional South Asian Mandi / Butcher Cut = Boneless Meat + Bone)
  const boneInMeatPct = roundTwo(bonelessMeatPct + bonePct);

  // Compute weights in kg
  const bonelessMeatKg = roundTwo((carcassWeightKg * bonelessMeatPct) / 100);
  const boneWeightKg = roundTwo((carcassWeightKg * bonePct) / 100);
  const fatWeightKg = roundTwo((carcassWeightKg * fatPct) / 100);
  const trimWasteKg = roundTwo((carcassWeightKg * trimWastePct) / 100);
  const boneInMeatKg = roundTwo(bonelessMeatKg + boneWeightKg);

  return {
    dressingPercentage: roundTwo(dressingPercentage),
    carcassWeightKg,
    boneInMeatKg,
    boneInMeatPercentage: boneInMeatPct,
    bonelessMeatKg,
    bonelessMeatPercentage: bonelessMeatPct,
    boneWeightKg,
    bonePercentage: bonePct,
    fatWeightKg,
    fatPercentage: fatPct,
    trimWasteKg,
    trimWastePercentage: trimWastePct,
  };
}

function calculateByProducts(
  liveWeightKg: number,
  config: SpeciesYieldConfig,
  carcassWeightKg: number,
  dressingMethod?: string
): ByProductsBreakdown {
  if (liveWeightKg <= 0) {
    return {
      hideOrSkinKg: 0,
      hideOrSkinPct: 0,
      headAndTrottersKg: 0,
      headAndTrottersPct: 0,
      edibleRedOffalKg: 0,
      edibleRedOffalPct: 0,
      edibleGreenOffalKg: 0,
      edibleGreenOffalPct: 0,
      bloodAndGutWasteKg: 0,
      bloodAndGutWastePct: 0,
    };
  }

  // If skin-on dressed, skin is already on carcass
  const skinPct = dressingMethod === 'skin_on_dressed' ? 0 : config.hideSkinPctOfLiveWeight;
  const headTrottersPct = config.headTrottersPctOfLiveWeight;
  const redOffalPct = config.redOffalPctOfLiveWeight;
  const greenOffalPct = config.greenOffalPctOfLiveWeight;

  const hideOrSkinKg = roundTwo((liveWeightKg * skinPct) / 100);
  const headAndTrottersKg = roundTwo((liveWeightKg * headTrottersPct) / 100);
  const edibleRedOffalKg = roundTwo((liveWeightKg * redOffalPct) / 100);
  const edibleGreenOffalKg = roundTwo((liveWeightKg * greenOffalPct) / 100);

  // The remaining balance of live weight consists of blood, paunch content (gut fill), inedible waste, and water loss
  const accountedKg = carcassWeightKg + hideOrSkinKg + headAndTrottersKg + edibleRedOffalKg + edibleGreenOffalKg;
  const bloodAndGutWasteKg = Math.max(0, roundTwo(liveWeightKg - accountedKg));
  const bloodAndGutWastePct = roundTwo((bloodAndGutWasteKg / liveWeightKg) * 100);

  return {
    hideOrSkinKg,
    hideOrSkinPct: roundTwo(skinPct),
    headAndTrottersKg,
    headAndTrottersPct: roundTwo(headTrottersPct),
    edibleRedOffalKg,
    edibleRedOffalPct: roundTwo(redOffalPct),
    edibleGreenOffalKg,
    edibleGreenOffalPct: roundTwo(greenOffalPct),
    bloodAndGutWasteKg,
    bloodAndGutWastePct,
  };
}

// ============================================================================
// 4. FINANCIAL ECONOMICS CALCULATOR
// ============================================================================

export function calculateMeatYieldFinancials(
  scenario: YieldScenario,
  byProducts: ByProductsBreakdown,
  input: FinancialCalculatorInput
): FinancialCalculatorResult {
  const purchasePrice = Math.max(0, Number(input.liveAnimalPricePkr) || 0);
  const slaughterFee = Math.max(0, Number(input.butcherAndSlaughterCostPkr) || 0);
  const transportCost = Math.max(0, Number(input.transportAndPackagingCostPkr) || 0);

  const totalCostPkr = roundTwo(purchasePrice + slaughterFee + transportCost);

  // Calculate By-products Revenue
  const byProductsRevenuePkr = roundTwo(
    (Number(input.hideValuePkr) || 0) +
    (Number(input.headAndTrottersValuePkr) || 0) +
    (Number(input.edibleOffalValuePkr) || 0)
  );

  let meatRevenuePkr = 0;
  let primaryMeatKg = 0;

  // STRICT RULE: Avoid counting bone-in and boneless meat as two separate sales of the same carcass!
  if (input.sellingMode === 'bone_in') {
    // Mode A: Sold as Bone-In Meat (گوشت مع ہڈی) + Separable Fat
    const boneInRate = Math.max(0, Number(input.boneInMeatPricePerKgPkr) || 0);
    const fatRate = Math.max(0, Number(input.fatPricePerKgPkr) || 0);

    const boneInRevenue = scenario.boneInMeatKg * boneInRate;
    const fatRevenue = scenario.fatWeightKg * fatRate;

    meatRevenuePkr = roundTwo(boneInRevenue + fatRevenue);
    primaryMeatKg = scenario.boneInMeatKg;
  } else {
    // Mode B: Sold as Boneless Meat + Soup Bones + Separable Fat
    const bonelessRate = Math.max(0, Number(input.bonelessMeatPricePerKgPkr) || 0);
    const soupBoneRate = Math.max(0, Number(input.soupBonePricePerKgPkr) || 0);
    const fatRate = Math.max(0, Number(input.fatPricePerKgPkr) || 0);

    const bonelessRevenue = scenario.bonelessMeatKg * bonelessRate;
    const soupBoneRevenue = scenario.boneWeightKg * soupBoneRate;
    const fatRevenue = scenario.fatWeightKg * fatRate;

    meatRevenuePkr = roundTwo(bonelessRevenue + soupBoneRevenue + fatRevenue);
    primaryMeatKg = scenario.bonelessMeatKg;
  }

  const totalRevenuePkr = roundTwo(meatRevenuePkr + byProductsRevenuePkr);
  const netProfitOrLossPkr = roundTwo(totalRevenuePkr - totalCostPkr);

  const profitMarginPercent = totalCostPkr > 0
    ? roundTwo((netProfitOrLossPkr / totalCostPkr) * 100)
    : 0;

  // Effective cost per kg of primary meat (after offsetting by-product revenue from costs)
  const netMeatCost = Math.max(0, totalCostPkr - byProductsRevenuePkr);
  const effectiveCostPerKgMeatPkr = primaryMeatKg > 0
    ? roundTwo(netMeatCost / primaryMeatKg)
    : 0;

  return {
    totalCostPkr,
    meatRevenuePkr,
    byProductsRevenuePkr,
    totalRevenuePkr,
    netProfitOrLossPkr,
    profitMarginPercent,
    effectiveCostPerKgMeatPkr,
    isProfit: netProfitOrLossPkr >= 0,
  };
}

// Utility functions
export function kgToMaund(kg: number): number {
  return roundTwo(kg / 40.0);
}

export function maundToKg(maund: number): number {
  return roundTwo(maund * 40.0);
}

export const calculateFinancials = (
  estimate: MeatYieldEstimateResult,
  scenarioKey: 'low' | 'mostLikely' | 'high' = 'mostLikely',
  input: FinancialCalculatorInput
): FinancialCalculatorResult => {
  return calculateMeatYieldFinancials(estimate.scenarios[scenarioKey], estimate.byProducts, input);
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function roundTwo(val: number): number {
  return Math.round(val * 100) / 100;
}
