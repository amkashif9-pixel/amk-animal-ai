import { FeedRecommendation, NutritionPlanInput } from '../types/nutrition';

export function calculateScientificNutrition(input: NutritionPlanInput): FeedRecommendation {
  const { species, weightKg, productionStage, dailyMilkYieldLiters = 0, season } = input;

  // Scientific Dry Matter Calculation (NRC standards)
  // Base DM: 2.8% to 3.5% of body weight for ruminants
  const dmMultiplier = species === 'buffalo' ? 0.03 : species === 'cow' ? 0.032 : species === 'goat' ? 0.035 : 0.028;
  const baseDMI = weightKg * dmMultiplier;

  // Additional DM for milk yield (approx 0.35 kg DM per liter of milk)
  const milkDMI = dailyMilkYieldLiters * 0.35;
  const totalDMI = (baseDMI + milkDMI).toFixed(1);

  // Fodder partition: 60-70% from forage (green + dry roughage), 30-40% from concentrate
  const greenFodderKg = (weightKg * 0.08 + dailyMilkYieldLiters * 1.5).toFixed(0);
  const dryRoughageKg = (weightKg * 0.01).toFixed(1);

  // Wanda calculation
  let wandaKgNum = 1.5; // Maintenance
  if (species === 'buffalo') {
    wandaKgNum += dailyMilkYieldLiters * 0.5; // 1 kg wanda per 2 liters buffalo milk
  } else if (species === 'cow') {
    wandaKgNum += dailyMilkYieldLiters * 0.4; // 1 kg wanda per 2.5 liters cow milk
  } else if (species === 'goat' || species === 'sheep') {
    wandaKgNum = dailyMilkYieldLiters > 0 ? 0.4 + dailyMilkYieldLiters * 0.3 : 0.3;
  }
  if (productionStage === 'pregnant') {
    wandaKgNum += 1.5; // Steaming up ration
  }
  const concentrateWandaKg = wandaKgNum.toFixed(1);

  // Water requirement: base 4-5 liters per 100kg + 3 liters per liter of milk + summer multiplier
  const summerFactor = season === 'summer' ? 1.4 : 1.0;
  const waterMin = ((weightKg * 0.08 + dailyMilkYieldLiters * 3.5) * summerFactor).toFixed(0);
  const waterMax = (Number(waterMin) * 1.3).toFixed(0);

  // Mineral mixture & salt
  const mineralGrams = species === 'buffalo' || species === 'cow' ? '80 - 120 grams' : '20 - 30 grams';

  const isWinter = season === 'winter' || season === 'spring';

  return {
    species,
    category:
      productionStage === 'early_lactation' || productionStage === 'mid_lactation'
        ? 'lactation'
        : productionStage === 'pregnant'
        ? 'pregnancy'
        : 'maintenance',
    dailyDryMatterKg: `${totalDMI} kg`,
    greenFodderKg: `${greenFodderKg} kg`,
    dryRoughageKg: `${dryRoughageKg} kg (Wheat Straw / توڑی)`,
    concentrateWandaKg: `${concentrateWandaKg} kg`,
    cleanWaterLiters: `${waterMin} - ${waterMax} Liters`,
    crudeProteinPercentage:
      productionStage === 'early_lactation'
        ? '16% - 18% CP'
        : productionStage === 'pregnant'
        ? '14% - 15% CP'
        : '12% - 14% CP',
    calciumPhosphorusRatio: '2:1 (with DCP / Dicalcium Phosphate)',
    mineralMixtureGrams: mineralGrams,
    localFodderSuggestionsEn: isWinter
      ? [
          'Berseem (Egyptian Clover / مصری برسیم) — high digestible protein',
          'Lucerne (Alfalfa / لوسرن) — excellent amino acids',
          'Oats (جئی) — fiber & palatable dry matter',
          'Ryegrass & Mustard mixture',
        ]
      : [
          'Corn Silage / Green Maize (مکئی کا سائیلج) — prime energy source',
          'Sorghum (جوار / چری) — drought resilient green forage',
          'Millet (باجرہ) — rich minerals',
          'Rhodes grass & Cowpeas (رواں)',
        ],
    localFodderSuggestionsUr: isWinter
      ? [
          'مصری برسیم — بہترین پروٹین اور لذیذ ہاضمہ دار چارہ',
          'لوسرن (الفا الفا) — ڈیری گائیوں کے لیے امائنو ایسڈز کا خزانہ',
          'جئی — صحت مند فائبر اور وزن بڑھانے میں مفید',
          'رائے گھاس اور سرسوں کا ملاپ',
        ]
      : [
          'مکئی کا معیاری سائیلج — دودھ کے جانوروں کے لیے توانائی کا پاور ہاؤس',
          'جوار / چری — گرمیوں کا سدا بہار چارہ',
          'باجرہ — معدنیات اور غذائیت سے بھرپور',
          'روڈس گھاس اور رواں کا ملاپ',
        ],
    feedingScheduleEn: [
      'Morning 06:00 AM: Offer 50% of daily Wanda concentrate before or during milking.',
      'Morning 07:30 AM: Offer clean fresh water and chopped green fodder mixed with 30% wheat straw.',
      'Afternoon 01:00 PM: Offer abundant fresh, cool water; provide free-choice mineral salt lick.',
      'Evening 05:00 PM: Offer remaining 50% Wanda during second milking.',
      'Evening 06:30 PM: Feed remaining green fodder and dry roughage for nighttime rumination.',
    ],
    feedingScheduleUr: [
      'صبح 6 بجے: چوائی سے پہلے یا چوائی کے دوران دن کے 50 فیصد ونڈے کی خوراک ڈالیں۔',
      'صبح ساڑھے 7 بجے: کٹے ہوئے سبز چارے میں گندم کی توڑی ملا کر کھلائیں اور تازہ پانی پلائیں۔',
      'دوپہر 1 بجے: گرمیوں میں ٹھنڈا سایہ دار تازہ پانی اور نمک کا ڈھیلا چاٹنے کے لیے میسر رکھیں۔',
      'شام 5 بجے: شام کی چوائی کے وقت باقی ماندہ 50 فیصد ونڈا دیں۔',
      'شام ساڑھے 6 بجے: رات کے وقت جگالی کے لیے سبز چارہ اور خشک توڑی ڈالیں۔',
    ],
    specialInstructionsEn:
      'Always avoid abrupt changes in grain ratio to prevent subacute ruminal acidosis (SARA). Ensure clean water troughs free of algae.',
    specialInstructionsUr:
      'ونڈے میں اچانک تبدیلی نہ کریں تاکہ معدے کی تیزابیت اور افارے سے بچا جا سکے۔ پانی کے کھوروں کی روزانہ صفائی کریں۔',
  };
}
