export interface PriceEstimateInput {
  country: string;
  provinceState: string;
  districtCity: string;
  species: string;
  breed: string;
  ageYears: number;
  gender: 'male' | 'female' | 'castrated';
  weightKg: number;
  healthCondition: 'excellent' | 'good' | 'fair' | 'poor';
  dailyMilkProductionLiters?: number;
  isPregnant?: boolean;
  purpose?: 'dairy' | 'meat' | 'qurbani' | 'breeding' | 'pet' | 'working';
}

export interface PriceEstimateResult {
  currency: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  lastUpdatedDate: string;
  benchmarkCatalogDate: string;
  lastReviewedDate: string;
  geographicCoverageEn: string;
  geographicCoverageUr: string;
  isLiveMandiFeed: boolean;
  valuationTypeEn: string;
  valuationTypeUr: string;
  dataSourceEn: string;
  dataSourceUr: string;
  confidenceLevelEn: 'High' | 'Medium' | 'Approximate';
  confidenceLevelUr: string;
  limitationsNoticeEn: string;
  limitationsNoticeUr: string;
  factorsApplied: {
    factorEn: string;
    factorUr: string;
    impact: 'positive' | 'negative' | 'neutral';
    percentage: number;
  }[];
}
