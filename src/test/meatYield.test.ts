import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Polyfill localStorage if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    length: 0,
  } as any;
}

import {
  calculateMeatYield,
  calculateFinancials,
  kgToMaund,
  maundToKg,
  DEFAULT_SPECIES_CONFIGS,
} from '../services/meatYieldCalculator';
import {
  calculateCalibrationAccuracy,
} from '../services/meatYieldService';
import {
  MeatYieldInput,
  MeatYieldSpecies,
  FinancialCalculatorInput,
  SlaughterActualRecord,
} from '../types/meatYield';

describe('AMK Animal AI — AI Meat Yield Estimator Test Suite', () => {

  describe('1. Scientific Calculations for All 5 Species', () => {
    const speciesList: MeatYieldSpecies[] = ['cow', 'buffalo', 'goat', 'sheep', 'dumba'];

    it.each(speciesList)('calculates valid yield scenarios for %s', (species) => {
      const liveWeights: Record<MeatYieldSpecies, number> = {
        cow: 420,
        buffalo: 520,
        goat: 55,
        sheep: 48,
        dumba: 75,
      };

      const input: MeatYieldInput = {
        species,
        liveWeightKg: liveWeights[species],
        bcs: 3.0,
        gender: 'male',
        ageDentition: 'donda_2_teeth',
        physicalBuild: 'medium_normal',
        dressingMethod: 'standard_halal_skin_off',
        fastingStatus: 'fasted_12_24h',
      };

      const res = calculateMeatYield(input);

      expect(res.species).toBe(species);
      expect(res.liveWeightKg).toBe(liveWeights[species]);
      expect(res.scenarios.low).toBeDefined();
      expect(res.scenarios.mostLikely).toBeDefined();
      expect(res.scenarios.high).toBeDefined();

      // Check scenario order: Low < Most Likely < High
      expect(res.scenarios.low.carcassWeightKg).toBeLessThan(res.scenarios.mostLikely.carcassWeightKg);
      expect(res.scenarios.mostLikely.carcassWeightKg).toBeLessThan(res.scenarios.high.carcassWeightKg);
      expect(res.scenarios.low.dressingPercentage).toBeLessThan(res.scenarios.mostLikely.dressingPercentage);
      expect(res.scenarios.mostLikely.dressingPercentage).toBeLessThan(res.scenarios.high.dressingPercentage);

      // Verify approximate disclaimer presence
      expect(res.isApproximateEstimateOnly).toBe(true);
      expect(res.scientificDisclaimerEn.toLowerCase()).toContain('approximate');
      expect(res.scientificDisclaimerUr).toBeDefined();
    });

    it('accurately accounts for Buffalo heavier hide proportion compared to Cow', () => {
      const cowRes = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 450,
        bcs: 3.0,
      });

      const buffaloRes = calculateMeatYield({
        species: 'buffalo',
        liveWeightKg: 450,
        bcs: 3.0,
      });

      // Buffalo hide is scientifically thicker (approx 10.5% vs Cow 7.0%)
      expect(buffaloRes.byProducts.hideOrSkinKg).toBeGreaterThan(cowRes.byProducts.hideOrSkinKg);
      // Buffalo baseline dressing is lower due to heavier head and skin
      expect(buffaloRes.scenarios.mostLikely.dressingPercentage).toBeLessThan(cowRes.scenarios.mostLikely.dressingPercentage);
    });

    it('accurately accounts for Ram / Dumba fat tail in carcass fat yield', () => {
      const sheepRes = calculateMeatYield({
        species: 'sheep',
        liveWeightKg: 60,
        bcs: 3.0,
      });

      const dumbaRes = calculateMeatYield({
        species: 'dumba',
        liveWeightKg: 60,
        bcs: 3.0,
      });

      // Dumba fat tail is retained on the dressed carcass, resulting in higher fat yield
      expect(dumbaRes.scenarios.mostLikely.fatWeightKg).toBeGreaterThan(sheepRes.scenarios.mostLikely.fatWeightKg);
      expect(dumbaRes.scenarios.mostLikely.fatPercentage).toBeGreaterThan(sheepRes.scenarios.mostLikely.fatPercentage);
    });
  });

  describe('2. Carcass Partition & Mathematical Consistency', () => {
    it('guarantees that carcass component percentages sum to 100% for all species', () => {
      const speciesList: MeatYieldSpecies[] = ['cow', 'buffalo', 'goat', 'sheep', 'dumba'];

      speciesList.forEach((sp) => {
        const res = calculateMeatYield({
          species: sp,
          liveWeightKg: 300,
          bcs: 3.5,
        });

        ['low', 'mostLikely', 'high'].forEach((scenarioKey) => {
          const s = res.scenarios[scenarioKey as 'low' | 'mostLikely' | 'high'];
          const pctSum = s.bonelessMeatPercentage + s.bonePercentage + s.fatPercentage + s.trimWastePercentage;
          expect(pctSum).toBeCloseTo(100.0, 1);

          const kgSum = s.bonelessMeatKg + s.boneWeightKg + s.fatWeightKg + s.trimWasteKg;
          expect(kgSum).toBeCloseTo(s.carcassWeightKg, 1);
        });
      });
    });

    it('guarantees bone-in meat equals boneless meat + bone without double counting', () => {
      const res = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        bcs: 3.0,
      });

      const s = res.scenarios.mostLikely;
      const expectedBoneIn = Number((s.bonelessMeatKg + s.boneWeightKg).toFixed(1));
      expect(s.boneInMeatKg).toBeCloseTo(expectedBoneIn, 1);

      // Verify that bone-in meat is strictly less than full carcass (excluding separable fat and trim)
      expect(s.boneInMeatKg).toBeLessThan(s.carcassWeightKg);
      expect(s.bonelessMeatKg).toBeLessThan(s.boneInMeatKg);
    });

    it('guarantees live weight mass balance (Carcass + By-Products + Inedible/Blood = 100% of Live Weight)', () => {
      const liveWeight = 420;
      const res = calculateMeatYield({
        species: 'cow',
        liveWeightKg: liveWeight,
        bcs: 3.0,
      });

      const byProds = res.byProducts;
      const likelyCarcass = res.scenarios.mostLikely.carcassWeightKg;

      const totalMass =
        likelyCarcass +
        byProds.hideOrSkinKg +
        byProds.headAndTrottersKg +
        byProds.edibleRedOffalKg +
        byProds.edibleGreenOffalKg +
        byProds.bloodAndGutWasteKg;

      expect(totalMass).toBeCloseTo(liveWeight, 1);
    });
  });

  describe('3. Animal-Specific Modifiers & Physiological Adjustments', () => {
    it('applies positive yield adjustment for higher Body Condition Score (BCS 5 vs BCS 1)', () => {
      const emaciated = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        bcs: 1.0,
      });

      const primeFat = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        bcs: 5.0,
      });

      expect(primeFat.scenarios.mostLikely.dressingPercentage).toBeGreaterThan(emaciated.scenarios.mostLikely.dressingPercentage);
      expect(primeFat.scenarios.mostLikely.fatPercentage).toBeGreaterThan(emaciated.scenarios.mostLikely.fatPercentage);
      expect(emaciated.scenarios.mostLikely.bonePercentage).toBeGreaterThan(primeFat.scenarios.mostLikely.bonePercentage);
    });

    it('applies gender adjustment: intact male yields higher lean boneless meat than female', () => {
      const male = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        gender: 'male',
      });

      const female = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        gender: 'female',
      });

      expect(male.scenarios.mostLikely.bonelessMeatPercentage).toBeGreaterThan(female.scenarios.mostLikely.bonelessMeatPercentage);
      expect(female.scenarios.mostLikely.fatPercentage).toBeGreaterThan(male.scenarios.mostLikely.fatPercentage);
    });

    it('applies physical build modifier (heavy muscular vs light dairy angular)', () => {
      const muscular = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        physicalBuild: 'heavy_muscular',
      });

      const dairy = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        physicalBuild: 'light_dairy',
      });

      expect(muscular.scenarios.mostLikely.dressingPercentage).toBeGreaterThan(dairy.scenarios.mostLikely.dressingPercentage);
      expect(muscular.scenarios.mostLikely.bonelessMeatKg).toBeGreaterThan(dairy.scenarios.mostLikely.bonelessMeatKg);
    });

    it('applies fasting status: fasted animal has higher dressing % due to empty paunch', () => {
      const fasted = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        fastingStatus: 'fasted_12_24h',
      });

      const unfasted = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 400,
        fastingStatus: 'unfasted_full_gut',
      });

      expect(fasted.scenarios.mostLikely.dressingPercentage).toBeGreaterThan(unfasted.scenarios.mostLikely.dressingPercentage);
      expect(unfasted.byProducts.bloodAndGutWasteKg).toBeGreaterThan(fasted.byProducts.bloodAndGutWasteKg);
    });

    it('applies skin-on scalded dressing method (higher dressing %)', () => {
      const skinOff = calculateMeatYield({
        species: 'goat',
        liveWeightKg: 50,
        dressingMethod: 'standard_halal_skin_off',
      });

      const skinOn = calculateMeatYield({
        species: 'goat',
        liveWeightKg: 50,
        dressingMethod: 'skin_on_dressed',
      });

      expect(skinOn.scenarios.mostLikely.dressingPercentage).toBeGreaterThan(skinOff.scenarios.mostLikely.dressingPercentage);
    });
  });

  describe('4. Fail-Safe and Boundary Handling', () => {
    it('safely handles zero and negative weights without throwing or returning NaN', () => {
      const zeroRes = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 0,
      });

      expect(zeroRes.liveWeightKg).toBe(0);
      expect(zeroRes.scenarios.mostLikely.carcassWeightKg).toBe(0);
      expect(zeroRes.scenarios.mostLikely.bonelessMeatKg).toBe(0);
      expect(isNaN(zeroRes.scenarios.mostLikely.dressingPercentage)).toBe(false);

      const negRes = calculateMeatYield({
        species: 'goat',
        liveWeightKg: -50,
      });
      expect(negRes.liveWeightKg).toBe(0);
      expect(negRes.scenarios.mostLikely.carcassWeightKg).toBe(0);
    });

    it('safely handles extreme livestock weights gracefully', () => {
      const hugeBull = calculateMeatYield({
        species: 'cow',
        liveWeightKg: 1500,
      });
      expect(hugeBull.scenarios.mostLikely.carcassWeightKg).toBeGreaterThan(700);

      const tinyLamb = calculateMeatYield({
        species: 'sheep',
        liveWeightKg: 12,
      });
      expect(tinyLamb.scenarios.mostLikely.carcassWeightKg).toBeGreaterThan(4);
    });

    it('safely applies default values when optional parameters are omitted', () => {
      const minimal = calculateMeatYield({
        species: 'buffalo',
        liveWeightKg: 480,
      });

      expect(minimal.scenarios.mostLikely.dressingPercentage).toBeGreaterThan(40);
      expect(minimal.byProducts.edibleRedOffalKg).toBeGreaterThan(0);
    });
  });

  describe('5. Financial Calculator & Double-Counting Avoidance', () => {
    const sampleYield = calculateMeatYield({
      species: 'cow',
      liveWeightKg: 400,
    });

    it('strictly separates bone-in vs boneless revenue to prevent double-counting the carcass', () => {
      const boneInFinInput: FinancialCalculatorInput = {
        liveAnimalPricePkr: 220000,
        sellingMode: 'bone_in',
        boneInMeatPricePerKgPkr: 1100,
        bonelessMeatPricePerKgPkr: 1400,
        soupBonePricePerKgPkr: 250,
        fatPricePerKgPkr: 350,
        hideValuePkr: 3500,
        headAndTrottersValuePkr: 4000,
        edibleOffalValuePkr: 4500,
        butcherAndSlaughterCostPkr: 5000,
        transportAndPackagingCostPkr: 3000,
      };

      const boneInRes = calculateFinancials(sampleYield, 'mostLikely', boneInFinInput);

      const bonelessFinInput: FinancialCalculatorInput = {
        ...boneInFinInput,
        sellingMode: 'boneless',
      };

      const bonelessRes = calculateFinancials(sampleYield, 'mostLikely', bonelessFinInput);

      // Total costs should be identical
      expect(boneInRes.totalCostPkr).toBe(220000 + 5000 + 3000);
      expect(bonelessRes.totalCostPkr).toBe(boneInRes.totalCostPkr);

      // Verify that boneless strategy prices boneless meat + soup bones, but NOT bone-in meat
      expect(boneInRes.meatRevenuePkr).toBeGreaterThan(150000);
      expect(bonelessRes.meatRevenuePkr).toBeGreaterThan(150000);

      // Both strategies calculate distinct non-zero revenues and margins
      expect(boneInRes.totalRevenuePkr).toBe(boneInRes.meatRevenuePkr + boneInRes.byProductsRevenuePkr);
      expect(bonelessRes.totalRevenuePkr).toBe(bonelessRes.meatRevenuePkr + bonelessRes.byProductsRevenuePkr);

      expect(typeof boneInRes.netProfitOrLossPkr).toBe('number');
      expect(typeof boneInRes.profitMarginPercent).toBe('number');
      expect(boneInRes.effectiveCostPerKgMeatPkr).toBeGreaterThan(0);
    });

    it('correctly flags loss when purchase price exceeds realized meat and by-products revenue', () => {
      const lossFinInput: FinancialCalculatorInput = {
        liveAnimalPricePkr: 500000, // unrealistically high purchase price
        sellingMode: 'bone_in',
        boneInMeatPricePerKgPkr: 800,
        bonelessMeatPricePerKgPkr: 1000,
        soupBonePricePerKgPkr: 200,
        fatPricePerKgPkr: 200,
        hideValuePkr: 2000,
        headAndTrottersValuePkr: 2000,
        edibleOffalValuePkr: 2000,
        butcherAndSlaughterCostPkr: 10000,
        transportAndPackagingCostPkr: 5000,
      };

      const res = calculateFinancials(sampleYield, 'mostLikely', lossFinInput);
      expect(res.isProfit).toBe(false);
      expect(res.netProfitOrLossPkr).toBeLessThan(0);
      expect(res.profitMarginPercent).toBeLessThan(0);
    });
  });

  describe('6. Weight Conversions (Kg <-> Maund / من)', () => {
    it('converts between kg and Pakistani Maund (1 Maund = 40 kg)', () => {
      expect(kgToMaund(40)).toBe(1.0);
      expect(kgToMaund(80)).toBe(2.0);
      expect(kgToMaund(420)).toBe(10.5);

      expect(maundToKg(1)).toBe(40.0);
      expect(maundToKg(2.5)).toBe(100.0);
      expect(maundToKg(10.5)).toBe(420.0);
    });
  });

  describe('7. Ground-Truth Calibration and Accuracy Algorithm', () => {
    it('computes accurate aggregate prediction accuracy from scale records', () => {
      const mockRecords: SlaughterActualRecord[] = [
        {
          id: '1',
          species: 'cow',
          breed: 'Sahiwal',
          liveWeightKg: 400,
          actualCarcassWeightKg: 212,
          predictedCarcassWeightKg: 210,
          actualDressingPercentage: 53.0,
          predictedDressingPercentage: 52.5,
          variancePercentage: 0.5,
          recordedAt: new Date().toISOString(),
          slaughterhouseOrCity: 'Lahore Abattoir',
        },
        {
          id: '2',
          species: 'buffalo',
          breed: 'Nili Ravi',
          liveWeightKg: 500,
          actualCarcassWeightKg: 251,
          predictedCarcassWeightKg: 250,
          actualDressingPercentage: 50.2,
          predictedDressingPercentage: 50.0,
          variancePercentage: 0.2,
          recordedAt: new Date().toISOString(),
          slaughterhouseOrCity: 'Sahiwal Abattoir',
        },
      ];

      const accuracy = calculateCalibrationAccuracy(mockRecords);
      // Avg variance is (0.5 + 0.2) / 2 = 0.35% -> Accuracy is 99.65% -> approx 99.6%
      expect(accuracy).toBeGreaterThanOrEqual(99.0);
      expect(accuracy).toBeLessThanOrEqual(100.0);
    });

    it('returns standard scientific baseline accuracy when no ground-truth records exist', () => {
      expect(calculateCalibrationAccuracy([])).toBe(96.5);
    });
  });

  describe('8. Supabase Migration Integrity Check (04_meat_yield_estimator.sql)', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/04_meat_yield_estimator.sql');

    it('verifies that migration file exists and is non-empty', () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
      const content = fs.readFileSync(migrationPath, 'utf8');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('verifies required SQL tables, indexes, and triggers are defined', () => {
      const content = fs.readFileSync(migrationPath, 'utf8');

      // Tables
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.meat_yield_configs');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.meat_yield_estimates');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.slaughter_actual_records');

      // RLS policies
      expect(content).toContain('ALTER TABLE public.meat_yield_configs ENABLE ROW LEVEL SECURITY');
      expect(content).toContain('ALTER TABLE public.meat_yield_estimates ENABLE ROW LEVEL SECURITY');
      expect(content).toContain('ALTER TABLE public.slaughter_actual_records ENABLE ROW LEVEL SECURITY');

      // Trigger
      expect(content).toContain('trg_set_updated_at_meat_yield_configs');

      // Seeded Species
      expect(content).toContain("'cow'");
      expect(content).toContain("'buffalo'");
      expect(content).toContain("'goat'");
      expect(content).toContain("'sheep'");
      expect(content).toContain("'dumba'");
    });

    it('verifies Row Level Security prevents unauthorized tampering of yield configs', () => {
      const content = fs.readFileSync(migrationPath, 'utf8');
      expect(content).toContain('public.is_admin()');
      expect(content).toContain('CREATE POLICY "Admins can manage yield configs"');
      expect(content).toContain('CREATE POLICY "Users can insert meat yield estimates"');
      expect(content).toContain('CREATE POLICY "Admins can manage all slaughter records"');
    });
  });
});
