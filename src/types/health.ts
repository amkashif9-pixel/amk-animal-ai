/**
 * Veterinary Health, Disease Detection & Clinical Decision-Support Types
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 */

export type HealthRiskLevel = 'mild' | 'moderate' | 'severe' | 'emergency';

export type SupportedHealthSpecies =
  | 'cow'
  | 'buffalo'
  | 'goat'
  | 'sheep'
  | 'poultry'
  | 'dog'
  | 'cat'
  | 'horse'
  | 'donkey'
  | string;

export type MediaViewType = 'close_up_lesion' | 'full_body' | 'video_clip';

export interface UploadedHealthMedia {
  id: string;
  dataUrl: string;
  type: 'image' | 'video';
  viewType: MediaViewType;
  name: string;
  timestampSeconds?: number;
}

export type EvidenceQualityGrade =
  | 'scientific_clinical_support'
  | 'empirical_veterinary_consensus'
  | 'traditional_supportive_only';

export type ProductVerificationStatus =
  | 'verified'
  | 'provisional_requires_review'
  | 'unverified';

export type PregnancySafetyStatus =
  | 'safe_with_precautions'
  | 'contraindicated'
  | 'caution_trimester_specific'
  | 'unverified_insufficient_data';

export type DrapRegistrationStatus =
  | 'verified_drap_registered'
  | 'verified_drap_import'
  | 'unverified_pending_drap_record'
  | 'not_registered_in_pakistan';

export type PakistanMarketAvailability =
  | 'widely_available'
  | 'restricted_veterinary_distributors'
  | 'rare_imported'
  | 'unverified';

export interface TraditionalRemedy {
  id: string;
  nameEn: string;
  nameUr: string;
  ingredientsEn: string[];
  ingredientsUr: string[];
  preparationMethodEn: string;
  preparationMethodUr: string;
  evidenceQuality: EvidenceQualityGrade;
  evidenceNotesEn: string;
  evidenceNotesUr: string;
  benefitsEn: string;
  benefitsUr: string;
  risksAndSideEffectsEn: string;
  risksAndSideEffectsUr: string;
  contraindicationsEn: string[];
  contraindicationsUr: string[];
  speciesSpecificToxicityWarningsEn: string[];
  speciesSpecificToxicityWarningsUr: string[];
  vetReviewStatus: string;
}

export interface ModernMedicine {
  id: string;
  genericName: string;
  brandName?: string;
  brandExamplesPk: string[]; // e.g. Maxicam, Terramycin LA, Penbiotic
  manufacturer?: string;
  activeIngredient?: string;
  drugClass: string; // e.g. NSAID, Beta-Lactam Antibiotic, Anthelmintic
  indicationsEn: string;
  indicationsUr: string;
  administrationRoute: 'oral' | 'intramuscular' | 'intravenous' | 'subcutaneous' | 'topical' | 'intramammary';
  routeBySpecies?: Record<string, 'oral' | 'intramuscular' | 'intravenous' | 'subcutaneous' | 'topical' | 'intramammary'>;
  approvedSpecies?: string[];
  standardDosageRate: string; // e.g. "0.5 mg/kg body weight once daily"
  dosageMgPerKg?: number; // e.g. 0.5
  dosageMgPerKgBySpecies?: Record<string, number>;
  mgPerMlConcentration?: number; // e.g. 20 (for 20 mg/ml solution)
  maxVolumePerInjectionSiteMl?: number;
  calculatedDoseForWeight?: string;
  dosageCalculationDisabledReasonEn?: string;
  dosageCalculationDisabledReasonUr?: string;
  requiresWeightForDosing: boolean;
  treatmentDuration: string; // e.g. "3-5 consecutive days under veterinary supervision"
  precautionsEn: string[];
  precautionsUr: string[];
  contraindicationsEn: string[];
  contraindicationsUr: string[];
  pregnancySafe: boolean; // Backwards compatibility boolean
  pregnancySafetyStatus?: PregnancySafetyStatus;
  pregnancyWarningEn?: string;
  pregnancyWarningUr?: string;
  lactationWarningEn?: string;
  lactationWarningUr?: string;
  sideEffectsEn: string[];
  sideEffectsUr: string[];
  isPrescriptionRequired: boolean;
  requiresVeterinarianAdministration?: boolean;
  milkWithdrawalDays: number | null; // null if unverified
  meatWithdrawalDays: number | null; // null if unverified
  milkWithdrawalNoteEn?: string;
  milkWithdrawalNoteUr?: string;
  meatWithdrawalNoteEn?: string;
  meatWithdrawalNoteUr?: string;
  withdrawalStatementEn?: string;
  withdrawalStatementUr?: string;
  officialSourceCitation: string;
  sourceDocumentUrl?: string;
  regulatoryAuthority?: string;
  labelRevisionDate?: string;
  country?: string;
  verificationStatus?: ProductVerificationStatus;
  drapStatus?: DrapRegistrationStatus;
  drapRegNumber?: string | null;
  pakistanManufacturerOrImporter?: string;
  pakistanAvailability?: PakistanMarketAvailability;
  farmerSafeUsageAdviceEn?: string;
  farmerSafeUsageAdviceUr?: string;
}

export interface RecommendedLabTest {
  id: string;
  testNameEn: string;
  testNameUr: string;
  purposeEn: string;
  purposeUr: string;
  sampleType: 'Whole Blood' | 'Serum' | 'Milk' | 'Feces' | 'Skin Scraping / Biopsy' | 'Nasal Swab' | 'Post-Mortem Tissue';
  urgency: 'routine' | 'urgent' | 'immediate';
  expectedTurnaround: string;
}

export interface SourceCitation {
  sourceName: string;
  publicationOrEdition: string;
  reviewStatus: string;
  url?: string;
}

export interface ActiveIngredientGuidance {
  ingredientEn: string;
  ingredientUr: string;
  purposeEn: string;
  purposeUr: string;
  administrationRoute: 'topical' | 'oral' | 'subcutaneous' | 'intramuscular' | 'intravenous' | 'intramammary' | 'eye_ear_drops';
  isPrescriptionOnly: boolean;
  contraindicationsEn: string[];
  contraindicationsUr: string[];
  evidenceLevel: 'established_standard' | 'supportive_adjunct';
}

export interface WithdrawalPeriodInfo {
  milkWithdrawalDays?: number;
  meatWithdrawalDays?: number;
  eggWithdrawalDays?: number;
  specialNotesEn?: string;
  specialNotesUr?: string;
}

export type EmergencySymptomType =
  | 'severe_breathing'
  | 'severe_bloat'
  | 'cannot_stand'
  | 'severe_bleeding'
  | 'suspected_poisoning'
  | 'seizures_tremors'
  | 'severe_dehydration';

export interface EmergencyActionProtocol {
  emergencyType: EmergencySymptomType;
  titleEn: string;
  titleUr: string;
  immediateStepsEn: string[];
  immediateStepsUr: string[];
  dangerWarningsEn: string[];
  dangerWarningsUr: string[];
}

export interface PossibleDisease {
  id: string;
  nameEn: string;
  nameUr: string;
  scientificName?: string;
  targetSpecies: string[]; // e.g., ['cow', 'buffalo', 'goat']
  symptomsEn: string[];
  symptomsUr: string[];
  observedVisualSignsEn?: string[];
  observedVisualSignsUr?: string[];
  possibleCausesEn: string[];
  possibleCausesUr: string[];
  transmissionEn?: string;
  transmissionUr?: string;
  riskLevel: HealthRiskLevel;
  immediateCareEn: string[];
  immediateCareUr: string[];
  supportingSymptomsEn?: string[];
  supportingSymptomsUr?: string[];
  contradictingSymptomsEn?: string[];
  contradictingSymptomsUr?: string[];
  traditionalRemedies?: TraditionalRemedy[];
  modernMedicines?: ModernMedicine[];
  recommendedLabTests?: RecommendedLabTest[];
  sourceCitations?: SourceCitation[];
  activeIngredients?: ActiveIngredientGuidance[];
  contraindicationsEn?: string[];
  contraindicationsUr?: string[];
  requiresVeterinaryPrescription?: boolean;
  isolationRecommendationsEn?: string[];
  isolationRecommendationsUr?: string[];
  preventionEn: string[];
  preventionUr: string[];
  preventativeVaccineName?: string;
  recommendedVetExamEn: string;
  recommendedVetExamUr: string;
  questionsForVetEn: string[];
  questionsForVetUr: string[];
  withdrawalPeriod?: WithdrawalPeriodInfo;
  withdrawalPeriodWarningEn?: string;
  withdrawalPeriodWarningUr?: string;
  confidenceScore?: number;
  clinicalLimitationsEn?: string;
  clinicalLimitationsUr?: string;
}

export interface HealthAssessmentInput {
  species: string;
  breed?: string;
  age?: string;
  gender?: string;
  weightKg?: number;
  temperatureF?: number;
  symptoms: string[];
  symptomSeverity?: 'mild' | 'moderate' | 'severe';
  customDescription: string;
  feedingDrinkingBehavior: 'normal' | 'reduced' | 'stopped' | 'excessive';
  waterIntake?: 'normal' | 'increased' | 'decreased' | 'refusing';
  milkProductionChange?: 'not_applicable' | 'normal' | 'mild_drop' | 'severe_drop' | 'completely_stopped' | 'abnormal_clots_blood';
  breathingPattern?: 'normal' | 'rapid_shallow' | 'labored_wheezing' | 'coughing' | 'open_mouth_gasping';
  rumenDigestion?: 'normal' | 'mild_bloat' | 'severe_distended_tympany' | 'impaction_hard_rumen' | 'colic_kicking_belly';
  stoolCondition?: 'normal' | 'watery_diarrhea' | 'bloody_mucus' | 'black_tarry' | 'hard_dry_pellets' | 'no_defecation';
  urineCondition?: 'normal' | 'red_coffee_colored' | 'strained_painful' | 'frequent_scanty' | 'no_urination';
  movementGait?: 'normal' | 'limping' | 'stiff_reluctant' | 'circling_head_pressing' | 'inability_to_stand';
  previousDiseases?: string;
  recentVaccinations?: string;
  recentMedications?: string;
  durationDays: number;
  isPregnant?: boolean;
  pregnancyTrimester?: 'first' | 'second' | 'third';
  isLactating?: boolean;
  isFoodProducing?: boolean;
  mediaFiles?: UploadedHealthMedia[];
  animalId?: string;
  animalName?: string;
}

export interface HealthAssessmentResult {
  id: string;
  timestamp: string;
  input: HealthAssessmentInput;
  detectedEmergency: boolean;
  emergencyProtocols: EmergencyActionProtocol[];
  emergencyWarningsEn: string[];
  emergencyWarningsUr: string[];
  visualSymptomsObservedEn: string[];
  visualSymptomsObservedUr: string[];
  confidenceScore: number; // 0 - 100
  confidenceLabel: 'High' | 'Medium' | 'Low' | 'Uncertain';
  scientificLimitationsEn: string;
  scientificLimitationsUr: string;
  clarifyingQuestionsEn: string[];
  clarifyingQuestionsUr: string[];
  primaryMatches: PossibleDisease[];
  differentialMatches: PossibleDisease[];
  overallRiskLevel: HealthRiskLevel;
  generalPrecautionsEn: string[];
  generalPrecautionsUr: string[];
  veterinaryDisclaimerEn: string;
  veterinaryDisclaimerUr: string;
  isAiAnalysis: boolean;
  aiRawResponse?: string;
  dataSource?: 'live_ai' | 'reference_mode';
  // Follow-up & Case Management
  vetConfirmed?: boolean;
  confirmedDiagnosis?: string;
  confirmedByVetName?: string;
  treatmentOutcome?: 'pending' | 'recovered' | 'improving' | 'unchanged' | 'deteriorated' | 'referred_hospital';
  followUpNotes?: string;
  followUpDate?: string;
}
