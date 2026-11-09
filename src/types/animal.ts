export type AnimalCategory = 'livestock' | 'poultry' | 'pets';

export type LivestockType =
  | 'cow'
  | 'buffalo'
  | 'goat'
  | 'sheep'
  | 'bull'
  | 'calf'
  | 'camel'
  | 'donkey'
  | 'horse'
  | 'mule';

export type PoultryType =
  | 'hen'
  | 'rooster'
  | 'chicken'
  | 'duck'
  | 'goose'
  | 'turkey'
  | 'pigeon'
  | 'quail'
  | 'parrot'
  | 'other_bird';

export type PetType =
  | 'dog'
  | 'cat'
  | 'rabbit'
  | 'guinea_pig'
  | 'hamster'
  | 'domestic_bird'
  | 'other_pet';

export type AnimalSpeciesType = LivestockType | PoultryType | PetType;

export interface AnimalSpecies {
  id: string;
  name: string;
  nameUrdu: string;
  category: AnimalCategory;
  scientificName: string;
  icon: string;
  imageUrl?: string;
  descriptionEn: string;
  descriptionUr: string;
  commonBreedsCount: number;
}

export interface AnimalBreed {
  id: string;
  speciesId: string;
  name: string;
  nameUrdu: string;
  origin: string;
  originUrdu: string;
  scientificName?: string;
  physicalCharacteristicsEn: string;
  physicalCharacteristicsUr: string;
  averageLifespan: string;
  typicalWeightRange: string;
  maleFemaleDifferencesEn: string;
  maleFemaleDifferencesUr: string;
  feedingRequirementsEn: string;
  feedingRequirementsUr: string;
  housingEnvironmentEn: string;
  housingEnvironmentUr: string;
  reproductionInfoEn: string;
  reproductionInfoUr: string;
  careMaintenanceEn: string;
  careMaintenanceUr: string;
  commonDiseases: string[];
  vaccinationInfoEn: string;
  vaccinationInfoUr: string;
  economicUsesEn: string;
  economicUsesUr: string;
  specialCareEn: string;
  specialCareUr: string;
  imageUrl?: string;
}

export interface ScanPrediction {
  species: string;
  speciesUrdu: string;
  breed: string;
  breedUrdu: string;
  confidenceScore: number; // 0 - 100
  confidenceLabel: 'High' | 'Medium' | 'Low' | 'Uncertain';
  gender?: 'Male' | 'Female' | 'Unknown';
  estimatedAgeRange?: string;
  coatColor?: string;
  bodyConditionScore?: string; // BCS 1-5 or 1-9
  estimatedWeightRange?: string;
  distinguishingFeatures: string[];
  uncertaintyExplanationEn: string;
  uncertaintyExplanationUr: string;
  isPurebredEstimateOnly: boolean;
  needsClarification: boolean;
  clarificationPromptEn?: string;
  clarificationPromptUr?: string;
  detailedBreedInfo?: AnimalBreed;
  rawAiExplanation?: string;
  dataSource?: 'live_ai' | 'reference_mode';
}

export interface AnimalProfile {
  id: string;
  userId?: string;
  name: string;
  tagNumber?: string;
  species: string;
  breed: string;
  gender: 'male' | 'female' | 'castrated';
  dobOrAge: string;
  photos: string[];
  purchasePrice?: number;
  currentEstimatedValue?: number;
  weightRecords: { date: string; weightKg: number; notes?: string }[];
  milkRecords: { date: string; morningLiters: number; eveningLiters: number; totalLiters: number }[];
  healthHistory: {
    id: string;
    date: string;
    condition: string;
    symptoms: string;
    diagnosis?: string;
    veterinarian?: string;
    treatment: string;
    resolved: boolean;
  }[];
  vaccinationRecords: {
    id: string;
    vaccineName: string;
    dateAdministered: string;
    nextDueDate: string;
    administeredBy?: string;
    batchNumber?: string;
  }[];
  reproductionRecords: {
    id: string;
    heatDate?: string;
    inseminationDate?: string;
    pregnancyCheckedDate?: string;
    isPregnant?: boolean;
    expectedCalvingDate?: string;
    birthDate?: string;
    offspringCount?: number;
    notes?: string;
  }[];
  feedingNotes?: string;
  createdAt: string;
  updatedAt: string;
}
