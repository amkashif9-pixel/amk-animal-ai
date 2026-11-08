/**
 * AI Meat Yield Estimator Types
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 */

export type MeatYieldSpecies = 'cow' | 'buffalo' | 'goat' | 'sheep' | 'dumba';

export type AnimalGender = 'male' | 'female' | 'castrated';

export type BodyConditionScore = 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5 | number; // 1 = Emaciated, 3 = Ideal, 5 = Very Obese

export type PhysicalBuild = 'light_dairy' | 'medium_normal' | 'heavy_muscular';

export type AgeDentition =
  | 'kheera_milk_teeth' // < 1.5 yrs
  | 'donda_2_teeth'     // 1.5 - 2.5 yrs (Prime Qurbani)
  | 'choga_4_teeth'     // 2.5 - 3.5 yrs
  | 'chhega_6_teeth'    // 3.5 - 4.5 yrs
  | 'full_mouth_mature'; // 5+ yrs

export type DressingMethod =
  | 'standard_halal_skin_off' // Standard Halal (hide, head, trotters, viscera removed)
  | 'traditional_qurbani'     // Traditional whole carcass with fat retained
  | 'skin_on_dressed'         // Skin left on after hair scalding (certain regional small ruminants)
  | 'commercial_chilled';     // Chilled dressed carcass (incorporates cooler shrinkage)

export type FastingStatus = 'fasted_12_24h' | 'unfasted_full_gut';

export interface MeatYieldInput {
  species: MeatYieldSpecies;
  liveWeightKg: number;
  breed?: string;
  gender?: AnimalGender;
  ageDentition?: AgeDentition;
  bcs?: BodyConditionScore;
  physicalBuild?: PhysicalBuild;
  dressingMethod?: DressingMethod;
  fastingStatus?: FastingStatus;
  animalNameOrTag?: string;
}

export interface YieldScenario {
  dressingPercentage: number;
  carcassWeightKg: number;
  boneInMeatKg: number;
  boneInMeatPercentage: number;
  bonelessMeatKg: number;
  bonelessMeatPercentage: number;
  boneWeightKg: number;
  bonePercentage: number;
  fatWeightKg: number;
  fatPercentage: number;
  trimWasteKg: number;
  trimWastePercentage: number;
}

export interface ByProductsBreakdown {
  hideOrSkinKg: number;
  hideOrSkinPct: number;
  headAndTrottersKg: number;
  headAndTrottersPct: number;
  edibleRedOffalKg: number; // Liver, Heart, Kidneys, Spleen
  edibleRedOffalPct: number;
  edibleGreenOffalKg: number; // Cleaned tripe / stomach & intestines
  edibleGreenOffalPct: number;
  bloodAndGutWasteKg: number;
  bloodAndGutWastePct: number;
}

export interface MeatYieldEstimateResult {
  id: string;
  timestamp: string;
  input: MeatYieldInput;
  species: MeatYieldSpecies;
  liveWeightKg: number;
  scenarios: {
    low: YieldScenario;
    mostLikely: YieldScenario;
    high: YieldScenario;
  };
  byProducts: ByProductsBreakdown;
  factorsApplied: {
    factorEn: string;
    factorUr: string;
    impactDescription: string;
  }[];
  isCalibrated: boolean;
  calibrationNotesEn: string;
  calibrationNotesUr: string;
  isApproximateEstimateOnly: boolean;
  scientificDisclaimerEn: string;
  scientificDisclaimerUr: string;
}

export interface FinancialCalculatorInput {
  liveAnimalPricePkr: number;
  sellingMode: 'bone_in' | 'boneless';
  boneInMeatPricePerKgPkr: number;
  bonelessMeatPricePerKgPkr: number;
  soupBonePricePerKgPkr: number;
  fatPricePerKgPkr: number;
  hideValuePkr: number;
  headAndTrottersValuePkr: number;
  edibleOffalValuePkr: number;
  butcherAndSlaughterCostPkr: number;
  transportAndPackagingCostPkr: number;
}

export interface FinancialCalculatorResult {
  totalCostPkr: number;
  meatRevenuePkr: number;
  byProductsRevenuePkr: number;
  totalRevenuePkr: number;
  netProfitOrLossPkr: number;
  profitMarginPercent: number;
  effectiveCostPerKgMeatPkr: number;
  isProfit: boolean;
}

export interface SpeciesYieldConfig {
  species: MeatYieldSpecies;
  nameEn: string;
  nameUr: string;
  baseDressingPctLow: number;
  baseDressingPctLikely: number;
  baseDressingPctHigh: number;
  baseBonelessYieldPct: number; // of carcass weight
  baseBonePct: number;          // of carcass weight
  baseFatPct: number;           // of carcass weight
  baseTrimWastePct: number;     // of carcass weight
  hideSkinPctOfLiveWeight: number;
  headTrottersPctOfLiveWeight: number;
  redOffalPctOfLiveWeight: number;
  greenOffalPctOfLiveWeight: number;
  notes: string;
  isOfficialBenchmark: boolean;
}

export interface SlaughterActualRecord {
  id: string;
  estimateId?: string;
  species: MeatYieldSpecies;
  breed: string;
  liveWeightKg: number;
  actualCarcassWeightKg: number;
  predictedCarcassWeightKg?: number;
  actualBoneInMeatKg?: number;
  actualBonelessMeatKg?: number;
  actualBoneKg?: number;
  actualFatKg?: number;
  actualDressingPercentage: number;
  predictedDressingPercentage?: number;
  variancePercentage: number; // Error delta
  recordedAt: string;
  slaughterhouseOrCity: string;
  notes?: string;
}
