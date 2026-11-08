import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Polyfill localStorage if running in headless node
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
  evaluateEmergencyProtocols,
  triageAnimalHealth,
  detectAnimalDiseaseFromMediaAndSymptoms,
  isValidApiKeyFormat,
  maskApiKey,
} from '../services/aiService';
import {
  CLINICAL_DISEASES,
  EMERGENCY_PROTOCOLS,
  findDiseasesBySpeciesAndSymptoms,
} from '../data/diseaseData';
import {
  TRADITIONAL_REMEDIES,
} from '../data/traditionalRemediesData';
import {
  MODERN_MEDICINES,
  calculateSafeMedicationDosage,
  formatSafeWithdrawalStatement,
  verifyRvmpLicense,
  MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN,
  MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR,
} from '../data/modernMedicinesData';
import {
  saveDiseaseAssessment,
  getUserDiseaseAssessments,
  deleteDiseaseAssessment,
  updateDiseaseAssessmentOutcome,
} from '../services/diseaseService';
import {
  HealthAssessmentInput,
  HealthAssessmentResult,
  EmergencySymptomType,
  UploadedHealthMedia,
  PossibleDisease,
} from '../types/health';

describe('AMK Animal AI — Complete Symptom-Based AI Veterinary Diagnosis & Treatment System', () => {

  // =========================================================================
  // 1. EMERGENCY SIGNS & PRE-VET LIFE SUPPORT PROTOCOLS (7 Urgent Sign Types)
  // =========================================================================
  describe('1. Immediate Emergency Detection & Pre-Vet Life Support Protocols', () => {
    const emergencyScenarios: Array<{
      category: EmergencySymptomType;
      symptomText: string;
      expectedKeyword: string;
    }> = [
      {
        category: 'severe_breathing',
        symptomText: 'Animal is showing severe breathing difficulty with open mouth gasping and neck outstretched',
        expectedKeyword: 'breathing',
      },
      {
        category: 'severe_bloat',
        symptomText: 'Severe tympany, left flank is tight as a drum, kicking at abdomen in acute distress',
        expectedKeyword: 'bloat',
      },
      {
        category: 'cannot_stand',
        symptomText: 'Cow is downer, recumbent on side and completely unable to stand for 12 hours',
        expectedKeyword: 'stand',
      },
      {
        category: 'severe_bleeding',
        symptomText: 'Deep arterial laceration with continuous spurting bleeding from leg',
        expectedKeyword: 'bleeding',
      },
      {
        category: 'suspected_poisoning',
        symptomText: 'Sudden frothing at mouth, pinpoint pupils, acute diarrhea after organophosphate spray',
        expectedKeyword: 'poisoning',
      },
      {
        category: 'seizures_tremors',
        symptomText: 'Continuous violent convulsions, muscle spasms, involuntary twitching and paddling',
        expectedKeyword: 'seizures',
      },
      {
        category: 'severe_dehydration',
        symptomText: 'Sunken eyeball globes, skin tent takes over 5 seconds to flatten, dry cold muzzle',
        expectedKeyword: 'dehydration',
      },
    ];

    it.each(emergencyScenarios)(
      'detects emergency flag and loads protocol for: $category',
      ({ category, symptomText }) => {
        const check = evaluateEmergencyProtocols([], symptomText);
        expect(check.detectedEmergency).toBe(true);
        expect(check.emergencyTypes).toContain(category);
        const protocol = check.protocols.find((p) => p.emergencyType === category);
        expect(protocol).toBeDefined();
        expect(protocol!.titleEn).toBeTruthy();
        expect(protocol!.titleUr).toBeTruthy();
        expect(protocol!.immediateStepsEn.length).toBeGreaterThanOrEqual(2);
        expect(protocol!.immediateStepsUr.length).toBeGreaterThanOrEqual(2);
        expect(check.warningsEn.length).toBeGreaterThan(0);
        expect(check.warningsUr.length).toBeGreaterThan(0);
      }
    );

    it('returns false for mild benign symptoms without emergency indicators', () => {
      const mildText = 'Mild dry coat, slightly sluggish appetite, normal temperature, active walking';
      const check = evaluateEmergencyProtocols([], mildText);
      expect(check.detectedEmergency).toBe(false);
      expect(check.emergencyTypes).toHaveLength(0);
      expect(check.protocols).toHaveLength(0);
    });

    it('verifies all 7 predefined emergency protocols have complete bilingual content and danger warnings', () => {
      const allTypes: EmergencySymptomType[] = [
        'severe_breathing',
        'severe_bloat',
        'cannot_stand',
        'severe_bleeding',
        'suspected_poisoning',
        'seizures_tremors',
        'severe_dehydration',
      ];

      for (const type of allTypes) {
        const proto = EMERGENCY_PROTOCOLS[type];
        expect(proto).toBeDefined();
        expect(proto.titleEn.length).toBeGreaterThan(5);
        expect(proto.titleUr.length).toBeGreaterThan(5);
        expect(proto.immediateStepsEn.length).toBeGreaterThanOrEqual(3);
        expect(proto.immediateStepsUr.length).toBeGreaterThanOrEqual(3);
        expect(proto.dangerWarningsEn.length).toBeGreaterThan(0);
        expect(proto.dangerWarningsUr.length).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // 2. SUPPORT FOR ALL 9 SPECIES & EXPANDED CLINICAL DOSSIERS
  // =========================================================================
  describe('2. Multi-Species Clinical Dossiers (All 9 Species Supported)', () => {
    const targetSpecies = [
      'cow',
      'buffalo',
      'goat',
      'sheep',
      'poultry',
      'dog',
      'cat',
      'horse',
      'donkey',
    ];

    it.each(targetSpecies)('has verified clinical entries or species mapping for %s', (species) => {
      const matchingDiseases = findDiseasesBySpeciesAndSymptoms(species, 'general');
      expect(matchingDiseases.length).toBeGreaterThanOrEqual(1);
    });

    it('validates Foot and Mouth Disease (FMD) clinical profile in Cow & Buffalo', () => {
      const fmd = CLINICAL_DISEASES.find((d: PossibleDisease) => d.id === 'fmd');
      expect(fmd).toBeDefined();
      expect(fmd!.targetSpecies).toContain('cow');
      expect(fmd!.targetSpecies).toContain('buffalo');
      expect(fmd!.symptomsEn.some((s: string) => s.toLowerCase().includes('blister') || s.toLowerCase().includes('saliv'))).toBe(true);
      expect(fmd!.supportingSymptomsEn?.length).toBeGreaterThan(0);
      expect(fmd!.contradictingSymptomsEn?.length).toBeGreaterThan(0);
      expect(fmd!.traditionalRemedies?.length).toBeGreaterThan(0);
      expect(fmd!.modernMedicines?.length).toBeGreaterThan(0);
      expect(fmd!.recommendedLabTests?.length).toBeGreaterThan(0);
    });

    it('validates Bovine Theileriosis (Tick Fever) in Cattle & Buffalo', () => {
      const theil = CLINICAL_DISEASES.find((d: PossibleDisease) => d.id === 'theileriosis');
      expect(theil).toBeDefined();
      expect(theil!.targetSpecies).toContain('cow');
      expect(theil!.targetSpecies).toContain('buffalo');
      expect(theil!.riskLevel).toBe('severe');
      expect(theil!.modernMedicines?.some((m) => m.genericName.toLowerCase().includes('buparvaquone'))).toBe(true);
    });

    it('validates Parturient Paresis / Milk Fever profile', () => {
      const mf = CLINICAL_DISEASES.find((d: PossibleDisease) => d.id === 'milk_fever');
      expect(mf).toBeDefined();
      expect(mf!.riskLevel).toBe('emergency');
      expect(mf!.contradictingSymptomsEn?.some((c) => c.toLowerCase().includes('fever'))).toBe(true);
      expect(mf!.modernMedicines?.some((m) => m.genericName.toLowerCase().includes('calcium'))).toBe(true);
    });

    it('validates Donkey & Horse Harness Wounds and Myiasis profile', () => {
      const myiasis = CLINICAL_DISEASES.find((d: PossibleDisease) => d.id === 'donkey_myiasis_wounds');
      expect(myiasis).toBeDefined();
      expect(myiasis!.targetSpecies).toContain('donkey');
      expect(myiasis!.targetSpecies).toContain('horse');
      expect(myiasis!.traditionalRemedies?.some((r) => r.id === 'camphor_neem_maggot_expeller')).toBe(true);
    });
  });

  // =========================================================================
  // 3. TRADITIONAL / DESI REMEDIES EVIDENCE & SAFETY
  // =========================================================================
  describe('3. Traditional & Desi Remedies Evidence-Reviewed Guidelines', () => {
    it('verifies all registered traditional remedies have complete evidence grading and toxicity warnings', () => {
      const remedies = Object.values(TRADITIONAL_REMEDIES);
      expect(remedies.length).toBeGreaterThanOrEqual(4);

      for (const r of remedies) {
        expect(['scientific_clinical_support', 'empirical_veterinary_consensus', 'traditional_supportive_only']).toContain(r.evidenceQuality);
        expect(r.benefitsEn).toBeTruthy();
        expect(r.benefitsUr).toBeTruthy();
        expect(r.risksAndSideEffectsEn).toBeTruthy();
        expect(r.risksAndSideEffectsUr).toBeTruthy();
        expect(r.contraindicationsEn.length).toBeGreaterThan(0);
        expect(r.speciesSpecificToxicityWarningsEn.length).toBeGreaterThan(0);
        expect(r.vetReviewStatus).toBeTruthy();
      }
    });

    it('confirms Camphor & Neem oil maggot expeller is safe for donkeys but contraindicated for cats', () => {
      const maggotRemedy = TRADITIONAL_REMEDIES.camphor_neem_maggot_expeller;
      expect(maggotRemedy).toBeDefined();
      expect(maggotRemedy.speciesSpecificToxicityWarningsEn.some((w) => w.toLowerCase().includes('donkey') || w.toLowerCase().includes('equine'))).toBe(true);
      expect(maggotRemedy.speciesSpecificToxicityWarningsEn.some((w) => w.toLowerCase().includes('cat'))).toBe(true);
    });
  });

  // =========================================================================
  // 4. MODERN VETERINARY MEDICINES & DOSAGE ENGINE
  // =========================================================================
  describe('4. Modern Veterinary Medicines & Dosage Calculation Engine', () => {
    it('verifies modern pharmaceuticals have verified Pakistan brand names and mg/kg concentrations', () => {
      const meds = Object.values(MODERN_MEDICINES);
      expect(meds.length).toBeGreaterThanOrEqual(5);

      for (const m of meds) {
        expect(m.genericName).toBeTruthy();
        expect(m.drugClass).toBeTruthy();
        expect(m.brandExamplesPk.length).toBeGreaterThan(0);
        expect(m.treatmentDuration).toBeTruthy();
        expect(typeof m.pregnancySafe).toBe('boolean');
        expect(m.milkWithdrawalDays === null || typeof m.milkWithdrawalDays === 'number').toBe(true);
        expect(m.meatWithdrawalDays === null || typeof m.meatWithdrawalDays === 'number').toBe(true);
        expect(m.officialSourceCitation).toBeTruthy();
      }
    });

    it('calculates exact dynamic dosage when live weight is provided', async () => {
      const input: HealthAssessmentInput = {
        species: 'cow',
        breed: 'Sahiwal',
        weightKg: 400, // 400 kg live weight
        temperatureF: 105.0,
        symptoms: ['fever', 'mouth_blisters_salivation'],
        customDescription: 'High fever, oral ulcers, salivation',
        feedingDrinkingBehavior: 'reduced',
        durationDays: 2,
      };

      const result = await triageAnimalHealth(input);
      expect(result.primaryMatches.length).toBeGreaterThan(0);

      const fmd = result.primaryMatches.find((d) => d.id === 'fmd');
      expect(fmd).toBeDefined();
      const meloxicam = fmd?.modernMedicines?.find((m) => m.id === 'meloxicam');
      expect(meloxicam).toBeDefined();
      // Meloxicam 0.5 mg/kg for 400 kg = 200 mg / 20 mg/ml = 10.0 ml
      expect(meloxicam?.calculatedDoseForWeight).toContain('10.0 ml');
    });

    it('flags missing weight and prompts for animal weight when calculating dosages', async () => {
      const input: HealthAssessmentInput = {
        species: 'buffalo',
        breed: 'Nili Ravi',
        weightKg: undefined, // missing weight
        symptoms: ['fever', 'throat_swelling'],
        customDescription: 'Swollen neck and throat, snoring respiration',
        feedingDrinkingBehavior: 'stopped',
        durationDays: 1,
      };

      const result = await triageAnimalHealth(input);
      expect(result.clarifyingQuestionsEn.some((q) => q.toLowerCase().includes('weight'))).toBe(true);
      expect(result.clarifyingQuestionsUr.some((q) => q.includes('وزن'))).toBe(true);
    });

    it('enforces pregnancy contraindication alerts on unsafe drugs (e.g. flunixin / oxytetracycline)', () => {
      const flunixin = MODERN_MEDICINES.flunixin_meglumine;
      const oxytet = MODERN_MEDICINES.oxytetracycline_la;

      expect(flunixin.pregnancySafe).toBe(false);
      expect(flunixin.pregnancyWarningEn).toBeTruthy();
      expect(oxytet.pregnancySafe).toBe(false);
      expect(oxytet.pregnancyWarningEn).toBeTruthy();
    });
  });

  // =========================================================================
  // 5. CONTRADICTORY SYMPTOM ANALYSIS & DIFFERENTIAL RANKING
  // =========================================================================
  describe('5. Contradictory Symptom Analysis & Clinical Differential Disambiguation', () => {
    it('ranks Milk Fever at top when cow is recumbent with subnormal temperature, and rules out fever septicemias', async () => {
      const input: HealthAssessmentInput = {
        species: 'cow',
        breed: 'Crossbred Holstein',
        gender: 'Female',
        isLactating: true,
        movementGait: 'inability_to_stand',
        temperatureF: 98.5, // subnormal temperature
        symptoms: ['cannot_stand', 'post_calving_downer'],
        customDescription: 'Calved 24 hours ago, icy cold ears, head tucked into flank, subnormal temperature 98.5 F',
        feedingDrinkingBehavior: 'stopped',
        durationDays: 1,
      };

      const result = await triageAnimalHealth(input);
      expect(result.primaryMatches[0]?.id).toBe('milk_fever');
      // HS or FMD should be strongly contradicted by subnormal temp and recent calving
      expect(result.primaryMatches[0]?.id).not.toBe('hs');
    });

    it('ranks HS (Gal Ghotu) top when bovine has acute 106°F fever and throat swelling', async () => {
      const input: HealthAssessmentInput = {
        species: 'buffalo',
        breed: 'Kundi',
        temperatureF: 106.2,
        symptoms: ['fever', 'throat_swelling', 'severe_breathing'],
        customDescription: 'Hot painful throat swelling, gasping for breath, grunting',
        feedingDrinkingBehavior: 'stopped',
        durationDays: 1,
      };

      const result = await triageAnimalHealth(input);
      expect(result.primaryMatches[0]?.id).toBe('hs');
    });
  });

  // =========================================================================
  // 6. CLINICAL CASE OUTCOME & FOLLOW-UP PERSISTENCE
  // =========================================================================
  describe('6. Clinical Case History & Follow-Up Outcome Tracking', () => {
    it('saves assessment and updates clinical follow-up outcome and vet confirmation', async () => {
      const sampleAssessment: HealthAssessmentResult = {
        id: 'eval_case_' + Date.now(),
        timestamp: new Date().toISOString(),
        input: {
          species: 'cow',
          breed: 'Cholistani',
          symptoms: ['fever'],
          customDescription: 'Fever and nasal discharge',
          feedingDrinkingBehavior: 'reduced',
          durationDays: 2,
        },
        detectedEmergency: false,
        emergencyProtocols: [],
        emergencyWarningsEn: [],
        emergencyWarningsUr: [],
        visualSymptomsObservedEn: [],
        visualSymptomsObservedUr: [],
        confidenceScore: 82,
        confidenceLabel: 'High',
        scientificLimitationsEn: 'Preliminary screening triage.',
        scientificLimitationsUr: 'ابتدائی سکریننگ۔',
        clarifyingQuestionsEn: [],
        clarifyingQuestionsUr: [],
        primaryMatches: [CLINICAL_DISEASES[0]],
        differentialMatches: [],
        overallRiskLevel: 'moderate',
        generalPrecautionsEn: [],
        generalPrecautionsUr: [],
        veterinaryDisclaimerEn: 'Does not constitute a confirmed diagnosis.',
        veterinaryDisclaimerUr: 'حتمی تشخیص نہیں ہے۔',
        isAiAnalysis: false,
      };

      // 1. Save
      const saveRes = await saveDiseaseAssessment(sampleAssessment);
      expect(saveRes.success).toBe(true);

      // 2. Update Outcome
      const updateRes = await updateDiseaseAssessmentOutcome(sampleAssessment.id, {
        vetConfirmed: true,
        confirmedDiagnosis: 'Foot-and-Mouth Disease (Type O)',
        confirmedByVetName: 'Dr. Tariq Mahmood (RVMP)',
        treatmentOutcome: 'recovered',
        followUpNotes: 'Lesions epithelialized completely after 8 days of antiseptic wash and Meloxicam.',
      });
      expect(updateRes.success).toBe(true);

      // 3. Verify retrieved records
      const records = await getUserDiseaseAssessments();
      const updated = records.find((r) => r.id === sampleAssessment.id);
      expect(updated).toBeDefined();
      expect(updated?.vetConfirmed).toBe(true);
      expect(updated?.treatmentOutcome).toBe('recovered');
      expect(updated?.confirmedByVetName).toBe('Dr. Tariq Mahmood (RVMP)');

      // 4. Cleanup
      await deleteDiseaseAssessment(sampleAssessment.id);
    });
  });

  // =========================================================================
  // 7. DATABASE MIGRATIONS AUDIT (05 & 06)
  // =========================================================================
  describe('7. Database Security Migrations Audit (05 and 06)', () => {
    it('verifies migration 06 adds follow-up outcome columns with check constraints and RLS', () => {
      const mig06Path = path.resolve(__dirname, '../../supabase/migrations/06_veterinary_case_history_and_remedies.sql');
      expect(fs.existsSync(mig06Path)).toBe(true);

      const sql = fs.readFileSync(mig06Path, 'utf8');
      expect(sql).toContain('ADD COLUMN IF NOT EXISTS vet_confirmed BOOLEAN');
      expect(sql).toContain('ADD COLUMN IF NOT EXISTS confirmed_diagnosis TEXT');
      expect(sql).toContain('ADD COLUMN IF NOT EXISTS treatment_outcome TEXT DEFAULT \'pending\'');
      expect(sql).toContain('CHECK (treatment_outcome IN (\'pending\', \'recovered\', \'improving\', \'unchanged\', \'deteriorated\', \'referred_hospital\'))');
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_disease_assessments_outcome');
      expect(sql).toContain('Users can update own disease assessment outcomes');
      expect(sql).toContain('GRANT UPDATE ON public.disease_assessments TO authenticated');
    });
  });

  // =========================================================================
  // 8. CRITICAL VETERINARY MEDICATION SAFETY AUDIT & DOSAGE ENGINE CONSTRAINTS
  // =========================================================================
  describe('8. Critical Veterinary Medication Safety Audit & Dosage Constraints', () => {
    // 1. Missing weight
    it('disables dosage calculation when live animal weight is missing or zero', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.meloxicam, {
        species: 'cow',
        weightKg: undefined,
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('live animal weight in kg is missing');
      expect(res.disablingReasonUr).toContain('وزن درج نہیں ہے');
    });

    // 2. Wrong / Contraindicated species
    it('strictly forbids oxytetracycline in horses/donkeys (lethal enterocolitis hazard)', () => {
      const resHorse = calculateSafeMedicationDosage(MODERN_MEDICINES.oxytetracycline_la, {
        species: 'horse',
        weightKg: 450,
      });
      expect(resHorse.canCalculate).toBe(false);
      expect(resHorse.disablingReasonEn).toContain('STRICTLY CONTRAINDICATED');
      expect(resHorse.disablingReasonEn).toContain('enterocolitis in horses and donkeys');

      const resDonkey = calculateSafeMedicationDosage(MODERN_MEDICINES.oxytetracycline_la, {
        species: 'donkey',
        weightKg: 180,
      });
      expect(resDonkey.canCalculate).toBe(false);
      expect(resDonkey.disablingReasonEn).toContain('STRICTLY CONTRAINDICATED');
    });

    it('disables dosage when attempting to administer buparvaquone to companion animals or unsupported species', () => {
      const resDog = calculateSafeMedicationDosage(MODERN_MEDICINES.buparvaquone, {
        species: 'dog',
        weightKg: 25,
      });
      expect(resDog.canCalculate).toBe(false);
      expect(resDog.disablingReasonEn).toContain('NOT approved for dog');
    });

    // 3. Wrong / Missing concentration
    it('disables dosage calculation when product concentration is unknown or zero', () => {
      const mockUncalibratedMed = {
        ...MODERN_MEDICINES.meloxicam,
        mgPerMlConcentration: 0,
      };
      const res = calculateSafeMedicationDosage(mockUncalibratedMed, {
        species: 'cow',
        weightKg: 400,
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('exact product active concentration is unknown or unverified');
    });

    // 4. Unknown brand / Unverified product
    it('disables dosage calculation for provisional or unverified products', () => {
      const resProvisional = calculateSafeMedicationDosage(MODERN_MEDICINES.generic_enrofloxacin_injectable, {
        species: 'cow',
        weightKg: 350,
      });
      expect(resProvisional.canCalculate).toBe(false);
      expect(resProvisional.disablingReasonEn).toContain('product label is provisional_requires_review');

      const resUnverified = calculateSafeMedicationDosage(MODERN_MEDICINES.unverified_herbal_bolus, {
        species: 'cow',
        weightKg: 350,
      });
      expect(resUnverified.canCalculate).toBe(false);
      expect(resUnverified.disablingReasonEn).toContain('product label is unverified');
    });

    // 5. Unverified withdrawal period
    it('renders exact mandatory warning text when withdrawal period is unverified', () => {
      const warningEn = formatSafeWithdrawalStatement(MODERN_MEDICINES.generic_enrofloxacin_injectable, false);
      expect(warningEn).toBe(MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN);
      expect(warningEn).toBe(
        'Withdrawal period not verified. Do not use milk or meat for human consumption until a veterinarian confirms the applicable product-specific withdrawal requirements.'
      );

      const warningUr = formatSafeWithdrawalStatement(MODERN_MEDICINES.generic_enrofloxacin_injectable, true);
      expect(warningUr).toBe(MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR);
      expect(warningUr).toContain('دودھ اور گوشت کے پرہیز کا وقت (Withdrawal Period) مصدقہ نہیں ہے');
    });

    // 6. Pregnancy & Lactation restrictions
    it('blocks dosage calculation when medicine is contraindicated during pregnancy', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.oxytetracycline_la, {
        species: 'cow',
        weightKg: 400,
        isPregnant: true,
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('CONTRAINDICATED IN PREGNANCY');
    });

    it('blocks flunixin meglumine in 3rd trimester pregnancy', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.flunixin_meglumine, {
        species: 'cow',
        weightKg: 450,
        isPregnant: true,
        trimester: 'third',
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('CONTRAINDICATED IN LATE PREGNANCY (3rd Trimester)');
    });

    it('blocks equine dosing when pregnancy status is unresolved', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.flunixin_meglumine, {
        species: 'horse',
        weightKg: 450,
        isPregnant: undefined,
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('pregnancy status is unresolved');
    });

    // 7. Prescription-only & Professional administration restrictions
    it('enforces prescription and professional veterinary administration gates', () => {
      expect(MODERN_MEDICINES.meloxicam.isPrescriptionRequired).toBe(true);
      expect(MODERN_MEDICINES.flunixin_meglumine.requiresVeterinarianAdministration).toBe(true);
      expect(MODERN_MEDICINES.oxytetracycline_la.requiresVeterinarianAdministration).toBe(true);
      expect(MODERN_MEDICINES.calcium_borogluconate.requiresVeterinarianAdministration).toBe(true);

      const resCalc = calculateSafeMedicationDosage(MODERN_MEDICINES.calcium_borogluconate, {
        species: 'cow',
        weightKg: 450,
      });
      expect(resCalc.requiresVeterinarianAdministration).toBe(true);
      expect(resCalc.emergencyFirstAidNoticeEn).toContain('PROFESSIONAL VETERINARY RESTRICTION');
      expect(resCalc.emergencyFirstAidNoticeEn).toContain('Rapid IV infusion causes fatal cardiac arrest');
    });

    // 8. Special safety rules: airway obstruction & injection site limits
    it('forbids oral drenching during bloat emergency with airway obstruction', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.dimethicone_emulsion, {
        species: 'cow',
        weightKg: 400,
        hasAirwayObstructionOrChoking: true,
      });
      expect(res.canCalculate).toBe(false);
      expect(res.disablingReasonEn).toContain('CRITICAL AIRWAY CONTRAINDICATION');
      expect(res.disablingReasonEn).toContain('fatal aspiration pneumonia');
    });

    it('enforces species-specific intravenous route requirement for flunixin in cattle', () => {
      expect(MODERN_MEDICINES.flunixin_meglumine.routeBySpecies?.cow).toBe('intravenous');
      expect(MODERN_MEDICINES.flunixin_meglumine.routeBySpecies?.buffalo).toBe('intravenous');

      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.flunixin_meglumine, {
        species: 'cow',
        weightKg: 450,
        isPregnant: false,
      });
      expect(res.emergencyFirstAidNoticeEn).toContain('Administer by SLOW INTRAVENOUS (IV) route ONLY');
    });

    it('enforces maximum 10 ml per injection site limit for Butalex (Buparvaquone)', () => {
      // 400 kg cow at 2.5 mg/kg = 1000 mg = 20.0 ml
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.buparvaquone, {
        species: 'cow',
        weightKg: 400,
        isPregnant: false,
      });
      expect(res.canCalculate).toBe(true);
      expect(res.calculatedVolumeMl).toBe(20);
      expect(res.injectionSiteAdviceEn).toContain('exceeds the maximum allowed 10 ml per site');
      expect(res.injectionSiteAdviceEn).toContain('Divide dose into 2 separate deep muscular sites');
    });

    // 9. Claims Audit: No drug described as 100% safe, zero side effects, or zero default withdrawal
    it('verifies that no medication claims 100% safety or zero side effects', () => {
      const allMeds = Object.values(MODERN_MEDICINES);
      for (const med of allMeds) {
        expect(med.sideEffectsEn.length).toBeGreaterThan(0);
        for (const se of med.sideEffectsEn) {
          expect(se.toLowerCase()).not.toContain('none reported under clinical dosages; physiologically inert');
        }
        expect(med.pregnancyWarningEn?.toLowerCase()).not.toContain('completely safe');
        expect(med.pregnancyWarningUr).not.toContain('100 فیصد محفوظ');
      }
    });

    it('verifies withdrawal period is never defaulted to zero for unverified products', () => {
      const unverifiedMed = MODERN_MEDICINES.generic_enrofloxacin_injectable;
      expect(unverifiedMed.milkWithdrawalDays).toBeNull();
      expect(unverifiedMed.meatWithdrawalDays).toBeNull();
      const stmt = formatSafeWithdrawalStatement(unverifiedMed, false);
      expect(stmt).toBe(MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN);
    });
  });

  // =========================================================================
  // 8. FINAL VETERINARY SAFETY & PAKISTAN REGULATORY COMPLIANCE AUDIT
  // =========================================================================
  describe('8. Final Veterinary Safety & Pakistan Compliance Audit', () => {
    // 1. DRAP Registration Status & Pakistan Label Audit (Zero-Fabrication Mandate)
    it('strictly classifies medicines as unverified pending DRAP proof and forbids fabricating registration numbers', () => {
      const primaryKeys = [
        'meloxicam',
        'flunixin_meglumine',
        'oxytetracycline_la',
        'dimethicone_emulsion',
        'buparvaquone',
        'calcium_borogluconate',
      ] as const;

      for (const key of primaryKeys) {
        const med = MODERN_MEDICINES[key];
        expect(med).toBeDefined();
        // Since online DRAP registry verification is unavailable, status MUST be unverified
        expect(med.drapStatus).toBe('unverified_pending_drap_record');
        expect(med.drapRegNumber).toBeNull(); // No fabricated numbers!
        expect(med.pakistanManufacturerOrImporter).toBeTruthy();
        expect(['widely_available', 'restricted_veterinary_distributors']).toContain(med.pakistanAvailability);
        expect(med.farmerSafeUsageAdviceEn).toBeTruthy();
        expect(med.farmerSafeUsageAdviceUr).toBeTruthy();
        expect(med.farmerSafeUsageAdviceEn!.length).toBeGreaterThan(20);
        expect(med.farmerSafeUsageAdviceUr!.length).toBeGreaterThan(20);
      }
    });

    it('identifies unverified products and strictly forbids fabricating DRAP registration numbers', () => {
      const unverifiedEnro = MODERN_MEDICINES.generic_enrofloxacin_injectable;
      expect(unverifiedEnro.drapStatus).toBe('unverified_pending_drap_record');
      expect(unverifiedEnro.drapRegNumber).toBeNull();
      expect(unverifiedEnro.verificationStatus).toBe('provisional_requires_review');

      const unverifiedHerbal = MODERN_MEDICINES.unverified_herbal_bolus;
      expect(unverifiedHerbal.drapStatus).toBe('not_registered_in_pakistan');
      expect(unverifiedHerbal.drapRegNumber).toBeNull();
      expect(unverifiedHerbal.verificationStatus).toBe('unverified');
    });

    // 2. PVMC / RVMP Licensing Verification Gate & Fake Number Handling
    it('validates syntax format while explicitly flagging that valid numbers are NOT proof of verified professional status', () => {
      // Valid syntax formats: format is valid BUT isVerifiedProfessional is strictly FALSE
      const validCase1 = verifyRvmpLicense('PVMC-12345');
      expect(validCase1.isValid).toBe(true);
      expect(validCase1.isValidFormat).toBe(true);
      expect(validCase1.isVerifiedProfessional).toBe(false); // CANNOT verify without live council API
      expect(validCase1.verificationStatus).toBe('unverified_syntax_only');
      expect(validCase1.disclaimerEn).toContain('Format validation only');
      expect(validCase1.disclaimerEn).toContain('does NOT verify active registration');

      const validCase2 = verifyRvmpLicense('RVMP-4567');
      expect(validCase2.isValid).toBe(true);
      expect(validCase2.isVerifiedProfessional).toBe(false);

      const validCase3 = verifyRvmpLicense('1234-PVMC');
      expect(validCase3.isValid).toBe(true);
      expect(validCase3.isVerifiedProfessional).toBe(false);

      // Fake / invalid strings must fail format validation
      expect(verifyRvmpLicense('').isValid).toBe(false);
      expect(verifyRvmpLicense('1234').isValid).toBe(false);
      expect(verifyRvmpLicense('VET-123').isValid).toBe(false);
      expect(verifyRvmpLicense('DOCTOR').isValid).toBe(false);
      expect(verifyRvmpLicense('PVMC').isValid).toBe(false);
      expect(verifyRvmpLicense('ADMIN').isValid).toBe(false);
      expect(verifyRvmpLicense('PMDC-12345').isValid).toBe(false);
      expect(verifyRvmpLicense('PVMC-FAKE').isValid).toBe(false);
      expect(verifyRvmpLicense('RVMP-00').isValid).toBe(false);
    });

    // 3. Unauthorized Vet Privileges Gate
    it('ensures entering a license string alone does not grant verified veterinarian privileges', () => {
      // Ordinary user entering a syntactically valid number
      const check = verifyRvmpLicense('PVMC-99999');
      expect(check.isValid).toBe(true);
      expect(check.isVerifiedProfessional).toBe(false); // Privilege gate holds!
    });

    // 3. Active Emergency Precedence Over Elective Dosing
    it('triggers active emergency precedence warning when acute life threats are present', () => {
      const res = calculateSafeMedicationDosage(MODERN_MEDICINES.meloxicam, {
        species: 'cow',
        weightKg: 400,
        isPregnant: false,
        isEmergency: true,
      });

      expect(res.emergencyActiveWarningEn).toBeDefined();
      expect(res.emergencyActiveWarningEn).toContain('CRITICAL EMERGENCY ACTIVE');
      expect(res.emergencyActiveWarningEn).toContain('Immediate physical stabilization');
      expect(res.emergencyActiveWarningUr).toContain('ہنگامی حالت');
    });

    // 4. Farmer Mode Safety: No unguided injectables, bilingual farmer guidance
    it('provides farmer-safe advisory and flags POM-V injectables for professional oversight', () => {
      const allMeds = Object.values(MODERN_MEDICINES);
      for (const med of allMeds) {
        expect(med.farmerSafeUsageAdviceEn).toBeTruthy();
        expect(med.farmerSafeUsageAdviceUr).toBeTruthy();
        if (med.isPrescriptionRequired) {
          expect(med.farmerSafeUsageAdviceEn!.toLowerCase()).toMatch(/veterinar|rvmp|prescription|doctor/);
        }
      }
    });

    // 5. Differential Diagnoses and Diagnostic Confidence Limitations
    it('ensures AI triage result always flags preliminary nature and missing clinical information', async () => {
      const input: HealthAssessmentInput = {
        species: 'cow',
        breed: 'Sahiwal',
        age: '4 Years',
        gender: 'Female',
        weightKg: 420,
        symptoms: ['fever', 'mouth_blisters_salivation', 'hoof_lesions_lameness'],
        customDescription: 'Salivating profusely with lameness and lip blisters',
        durationDays: 2,
        feedingDrinkingBehavior: 'stopped',
        waterIntake: 'decreased',
        rumenDigestion: 'normal',
        breathingPattern: 'normal',
        stoolCondition: 'normal',
        urineCondition: 'normal',
        movementGait: 'limping',
        isPregnant: false,
        isLactating: true,
        isFoodProducing: true,
      };

      const result = await triageAnimalHealth(input);
      expect(result.primaryMatches.length).toBeGreaterThan(0);
      expect(result.differentialMatches.length).toBeGreaterThanOrEqual(1);

      // Must never claim certainty
      expect(result.scientificLimitationsEn).toContain('Preliminary decision-support');
      expect(result.scientificLimitationsEn).toContain('cannot replace direct clinical palpation');
      expect(result.scientificLimitationsUr).toContain('ابتدائی');

      // Clarifying questions must be present
      expect(result.clarifyingQuestionsEn.length).toBeGreaterThanOrEqual(1);
      expect(result.clarifyingQuestionsUr.length).toBeGreaterThanOrEqual(1);

      // Recommended lab tests must be present
      expect(result.primaryMatches[0].recommendedLabTests).toBeDefined();
      expect(result.primaryMatches[0].recommendedLabTests!.length).toBeGreaterThan(0);
    });

    // 6. Gemini API Key Format Validation (Legacy AIzaSy & Modern AQ. Auth Keys)
    it('validates both legacy AIzaSy and modern AQ Google AI Studio Gemini API key formats', () => {
      // Legacy AI Studio keys (AIzaSy + 33 chars = 39 total)
      expect(isValidApiKeyFormat('AIzaSyAbcdEfghIjklMnopQrstuVwxyz0123456')).toBe(true);
      // Modern Google AI Studio Auth keys (starts with AQ.)
      expect(isValidApiKeyFormat('AQ.TEST_SAMPLE_MOCK_AUTH_KEY_1234567890_VALID')).toBe(true);

      // Rejections
      expect(isValidApiKeyFormat('')).toBe(false);
      expect(isValidApiKeyFormat('12345')).toBe(false);
      expect(isValidApiKeyFormat('sk-proj-openaiKeyFake123456789')).toBe(false);

      // Masking
      expect(maskApiKey('AQ.TEST_SAMPLE_MOCK_AUTH_KEY_1234567890_VALID')).toBe('AQ.TES...ALID');
    });
  });
});
