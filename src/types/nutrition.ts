export interface FeedRecommendation {
  species: string;
  category: 'maintenance' | 'growth' | 'lactation' | 'pregnancy' | 'work' | 'layer' | 'broiler';
  dailyDryMatterKg: string;
  greenFodderKg: string;
  dryRoughageKg: string;
  concentrateWandaKg: string;
  cleanWaterLiters: string;
  crudeProteinPercentage: string;
  calciumPhosphorusRatio: string;
  mineralMixtureGrams: string;
  localFodderSuggestionsEn: string[];
  localFodderSuggestionsUr: string[];
  feedingScheduleEn: string[];
  feedingScheduleUr: string[];
  specialInstructionsEn: string;
  specialInstructionsUr: string;
}

export interface NutritionPlanInput {
  species: string;
  breed?: string;
  ageMonths: number;
  weightKg: number;
  activityLevel: 'low' | 'moderate' | 'high' | 'working';
  productionStage: 'none' | 'early_lactation' | 'mid_lactation' | 'late_lactation' | 'pregnant' | 'growing';
  dailyMilkYieldLiters?: number;
  season: 'summer' | 'winter' | 'spring' | 'autumn';
}
