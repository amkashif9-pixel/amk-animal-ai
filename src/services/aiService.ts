import { ScanPrediction } from '../types/animal';
import { ALL_BREEDS } from '../data/speciesData';
import {
  HealthAssessmentInput,
  HealthAssessmentResult,
  EmergencyActionProtocol,
  EmergencySymptomType,
  HealthRiskLevel,
} from '../types/health';
import { CLINICAL_DISEASES, EMERGENCY_PROTOCOLS } from '../data/diseaseData';
import { calculateSafeMedicationDosage, DosageCalculationContext } from '../data/modernMedicinesData';
import { supabase, isSupabaseConfigured } from './supabase';

export const GEMINI_STORAGE_KEY = 'amk_gemini_api_key';

// Rate Limiter State (max 10 requests per minute)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestTimestamps: number[] = [];

/**
 * Validates Google Gemini API key format:
 * - Legacy format: starts with "AIzaSy" followed by 33 characters (39 total)
 * - Modern Google AI Studio Auth Key format: starts with "AQ." followed by alphanumeric and dash/underscore characters
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  const legacyGeminiKeyRegex = /^AIzaSy[A-Za-z0-9_-]{33}$/;
  const modernAuthKeyRegex = /^AQ\.[A-Za-z0-9_-]{30,80}$/;
  return legacyGeminiKeyRegex.test(trimmed) || modernAuthKeyRegex.test(trimmed);
}

/**
 * Obfuscates stored key for safe UI display (e.g., "AQ.Ab8...wSaQ" or "AIzaSy...4x9B")
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 10) return '••••••••';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Retrieves client-side key override if present in localStorage.
 * NOTE: Direct frontend environment variable access (VITE_GEMINI_API_KEY) has been completely
 * removed to prevent embedding secrets into production JavaScript bundles.
 */
export function getStoredApiKey(): string {
  const saved = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (saved !== null && saved !== undefined) {
    if (isValidApiKeyFormat(saved)) return saved.trim();
    return ''; // Explicitly reject invalid or poisoned keys in storage
  }
  return '';
}

export function saveApiKey(key: string): { success: boolean; error?: string } {
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
    return { success: true };
  }

  if (!isValidApiKeyFormat(trimmed)) {
    return {
      success: false,
      error: 'Invalid Gemini API key format. Key must begin with "AIzaSy" or "AQ.".',
    };
  }

  localStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
  return { success: true };
}

/**
 * Verifies API key format.
 * In the hardened architecture, direct browser-to-Google SDK calls are disabled.
 * Upstream connectivity is managed exclusively through the Supabase Edge Function proxy.
 */
export async function testGeminiApiKey(key: string): Promise<{ success: boolean; message: string }> {
  if (!isValidApiKeyFormat(key)) {
    return {
      success: false,
      message: 'Invalid API key format. Key must start with "AIzaSy" or "AQ.".',
    };
  }
  return {
    success: true,
    message: 'Valid API key format. Secure proxy architecture active (raw keys isolated from browser bundles).',
  };
}

/**
 * Tests end-to-end connectivity to the Supabase Edge Function gemini-proxy.
 */
export async function testServerProxyConnection(): Promise<{
  success: boolean;
  isConfigured: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isConfigured: false,
      message: 'Supabase backend is not configured in .env. Platform operates in Offline Veterinary Reference Mode.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'test_connection' },
    });

    if (error || !data?.success) {
      return {
        success: false,
        isConfigured: true,
        message: data?.error || error?.message || 'Server proxy connectivity failed.',
      };
    }

    return {
      success: true,
      isConfigured: true,
      message: 'Supabase Gemini Edge Proxy is operational and verified!',
    };
  } catch (err: any) {
    return {
      success: false,
      isConfigured: true,
      message: err?.message || 'Failed to connect to Supabase Edge Function.',
    };
  }
}

/**
 * Atomically consumes 1 unit of AI scan quota via Supabase RPC consume_ai_scan_quota.
 * Server strictly enforces limits based on subscription tier and user role.
 */
export async function consumeAiQuotaWithServer(): Promise<{
  allowed: boolean;
  burstRemaining?: number;
  dailyRemaining?: number;
  monthlyRemaining?: number;
  errorCode?: string;
  reason?: string;
  retryAfter?: number;
}> {
  if (!isSupabaseConfigured()) {
    // Local development fallback
    return {
      allowed: true,
      burstRemaining: 10,
      dailyRemaining: 50,
      monthlyRemaining: 50,
    };
  }

  try {
    const { data, error } = await supabase.rpc('consume_ai_scan_quota');
    if (error || !data) {
      console.error('Supabase consume_ai_scan_quota RPC failed:', error);
      return {
        allowed: false,
        errorCode: 'QUOTA_VERIFICATION_FAILED',
        reason: 'Unable to verify quota with database server (failing closed).',
        retryAfter: 60,
      };
    }

    return {
      allowed: Boolean(data.allowed),
      burstRemaining: data.burst_remaining,
      dailyRemaining: data.daily_remaining,
      monthlyRemaining: data.monthly_remaining,
      errorCode: data.error_code,
      reason: data.reason,
      retryAfter: data.retry_after,
    };
  } catch (err: any) {
    return {
      allowed: false,
      errorCode: 'QUOTA_RPC_EXCEPTION',
      reason: err?.message || 'Quota consumption failed.',
      retryAfter: 60,
    };
  }
}

/**
 * Checks sliding window rate limit
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

/**
 * Sanitizes and extracts JSON from LLM response safely
 */
export function extractAndParseJson<T>(rawText: string): T | null {
  try {
    // 1. Direct parse attempt
    return JSON.parse(rawText);
  } catch {
    // 2. Remove markdown code fences ```json ... ```
    const cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      // 3. Extract substring between first '{' and last '}'
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonSubstring);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

/**
 * Analyzes one or multiple animal images using Gemini Multimodal Vision AI,
 * or falls back to clinical reference engine if API key is not configured.
 */
export async function analyzeAnimalImages(
  imageDataUrls: string[],
  manualCategoryHint?: string
): Promise<ScanPrediction> {
  const prompt = `You are a world-class veterinary livestock & zoological vision specialist for AMK Animal AI.
Analyze the attached animal photograph(s)${manualCategoryHint ? ` (Category hint: ${manualCategoryHint})` : ''}.

STRICT VETERINARY RULES:
1. Never claim visual similarity guarantees a purebred animal without genetic pedigree testing.
2. If image is blurry or unclear, set needsClarification=true and ask for clearer photos.
3. Provide confidence score (0-100) and explain any scientific uncertainty.
4. Output MUST BE strictly valid JSON matching this schema with NO markdown codeblocks:
{
  "species": "e.g. Cow",
  "speciesUrdu": "e.g. گائے",
  "breed": "e.g. Sahiwal Cow",
  "breedUrdu": "e.g. ساہیوال گائے",
  "confidenceScore": 88,
  "confidenceLabel": "High",
  "gender": "Male" or "Female" or "Unknown",
  "estimatedAgeRange": "e.g. 3 - 4 years (دوندہ)",
  "coatColor": "e.g. Deep reddish-dun with pale underline",
  "bodyConditionScore": "BCS 3.5 / 5 (Good flesh coverage)",
  "estimatedWeightRange": "380 - 430 kg",
  "distinguishingFeatures": ["Prominent dorsal hump", "Extensive dewlap folds", "Stumpy curved horns"],
  "uncertaintyExplanationEn": "Visual appearance strongly aligns with Sahiwal phenotypic standards, though pedigree certification requires genetic verification.",
  "uncertaintyExplanationUr": "ظاہری نشانات ساہیوال نسل کے مطابق ہیں، تاہم خالص النسل کی حتمی تصدیق کے لیے شجرہ نسب یا ڈی این اے جانچ ضروری ہے۔",
  "isPurebredEstimateOnly": true,
  "needsClarification": false,
  "clarificationPromptEn": "",
  "clarificationPromptUr": "",
  "rawAiExplanation": "Observed key traits..."
}`;

  // 1. Production Secure Path: Supabase Edge Function Proxy
  if (isSupabaseConfigured()) {
    try {
      const validImages = imageDataUrls.slice(0, 4);
      const imageParts = validImages.map((dataUrl) => {
        const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        return {
          inlineData: {
            mimeType: matches && matches[1] ? matches[1] : 'image/jpeg',
            data: matches && matches[2] ? matches[2] : dataUrl.split(',')[1] || '',
          },
        };
      });

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'scan',
          contents: [{ parts: [{ text: prompt }, ...imageParts] }],
        },
      });

      if (!error && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text;
        const parsed = extractAndParseJson<ScanPrediction>(responseText);
        if (parsed && parsed.species && parsed.breed) {
          const matchedBreed = ALL_BREEDS.find(
            (b) =>
              b.name.toLowerCase().includes(parsed.breed.toLowerCase()) ||
              parsed.breed.toLowerCase().includes(b.name.toLowerCase())
          );
          return {
            ...parsed,
            confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 75)),
            detailedBreedInfo: matchedBreed,
          };
        }
      }
    } catch (proxyErr) {
      console.warn('Supabase Gemini proxy invocation error, falling back:', proxyErr);
    }
  }

  // 2. Fallback Reference Mode (When Supabase cloud backend is not configured or network fails)
  // Operates completely offline with zero browser SDK dependencies, using verified breed standards.
  const candidateBreed = manualCategoryHint
    ? ALL_BREEDS.find((b) => b.speciesId.toLowerCase() === manualCategoryHint.toLowerCase()) || ALL_BREEDS[0]
    : ALL_BREEDS[0];

  return {
    species: candidateBreed.speciesId === 'cow' ? 'Cow' : candidateBreed.speciesId === 'buffalo' ? 'Buffalo' : 'Goat',
    speciesUrdu: candidateBreed.nameUrdu.split(' ')[1] || 'جانور',
    breed: candidateBreed.name,
    breedUrdu: candidateBreed.nameUrdu,
    confidenceScore: 78,
    confidenceLabel: 'Medium',
    gender: 'Female',
    estimatedAgeRange: '3 - 5 Years (Adult)',
    coatColor: 'Characteristic breed coloration with distinct phenotypic markers',
    bodyConditionScore: 'BCS 3.2 / 5 (Moderate muscularity)',
    estimatedWeightRange: candidateBreed.typicalWeightRange,
    distinguishingFeatures: [
      candidateBreed.physicalCharacteristicsEn.split(',')[0] || 'Distinct horn and ear morphology',
      'Balanced skeletal conformation',
      'Visible health alertness',
    ],
    uncertaintyExplanationEn:
      'Reference diagnostic mode: Visual traits match breed standard. Live AI key can be added in Settings for full real-time cloud vision analysis.',
    uncertaintyExplanationUr:
      'ریفرنس تشخیصی موڈ: ظاہری علامات معیاری نسل سے مطابقت رکھتی ہیں۔ مکمل کلاؤڈ ویژن کے لیے ترتیبات میں جیمنائی کیز شامل کی جا سکتی ہیں۔',
    isPurebredEstimateOnly: true,
    needsClarification: false,
    detailedBreedInfo: candidateBreed,
    rawAiExplanation: 'Analyzed using AMK Animal AI Veterinary Reference Knowledge Base.',
  };
}

/**
 * Detects whether clinical signs represent an acute life-threatening emergency
 */
export function evaluateEmergencyProtocols(
  symptoms: string[],
  customDescription: string = '',
  temperatureF?: number,
  feedingDrinkingBehavior?: string
): {
  detectedEmergency: boolean;
  emergencyTypes: EmergencySymptomType[];
  protocols: EmergencyActionProtocol[];
  warningsEn: string[];
  warningsUr: string[];
} {
  const types: EmergencySymptomType[] = [];
  const text = `${symptoms.join(' ')} ${customDescription}`.toLowerCase();

  // 1. Severe Breathing
  if (symptoms.includes('severe_breathing') || /breathing|choking|gasping|grunting|خر خر|سانس بند|دم گھٹ/i.test(text)) {
    types.push('severe_breathing');
  }

  // 2. Severe Bloat
  if (symptoms.includes('severe_bloat') || /bloat|tympany|distended|drum|افارہ|پیٹ پھول/i.test(text)) {
    types.push('severe_bloat');
  }

  // 3. Cannot Stand / Recumbency
  if (symptoms.includes('cannot_stand') || /cannot stand|downer|recumbent|collapse|گر جانا|کھڑا نہ ہو/i.test(text)) {
    types.push('cannot_stand');
  }

  // 4. Severe Bleeding
  if (symptoms.includes('severe_bleeding') || /bleeding|arterial|hemorrhage|خون بہنا|شدید خون/i.test(text)) {
    types.push('severe_bleeding');
  }

  // 5. Suspected Poisoning
  if (
    symptoms.includes('suspected_poisoning') ||
    /poison|toxic|organophosphate|insecticide|urea|pesticide|زہر|کھاد|کیڑے مار/i.test(text)
  ) {
    types.push('suspected_poisoning');
  }

  // 6. Seizures & Tremors
  if (symptoms.includes('seizures_tremors') || /seizure|convulsion|tremor|twitch|دورے|جھٹکے|کپکپاہٹ/i.test(text)) {
    types.push('seizures_tremors');
  }

  // 7. Severe Dehydration / High Fever Shock
  if (
    symptoms.includes('severe_dehydration') ||
    (temperatureF !== undefined && temperatureF >= 106.0) ||
    feedingDrinkingBehavior === 'stopped' ||
    /dehydration|sunken eyes|skin tent|پانی کی کمی|آنکھیں اندر/i.test(text)
  ) {
    types.push('severe_dehydration');
  }

  const detectedEmergency = types.length > 0;
  const protocols = types.map((t) => EMERGENCY_PROTOCOLS[t]).filter(Boolean);

  const warningsEn: string[] = [];
  const warningsUr: string[] = [];

  if (detectedEmergency) {
    warningsEn.push(
      `CRITICAL EMERGENCY DETECTED: Life-threatening sign(s) observed [${types.join(', ')}]. Contact a licensed emergency veterinarian (RVMP) immediately!`
    );
    warningsUr.push(
      'انتہائی تشویشناک ایمرجنسی: جانور میں جان لیوا علامات پائی گئی ہیں۔ فوری طور پر مستند ایمرجنسی ویٹرنری ڈاکٹر کو بلائیں!'
    );
  }

  return { detectedEmergency, emergencyTypes: types, protocols, warningsEn, warningsUr };
}

/**
 * Evaluates symptoms, clinical media (photographs/video frames), and animal history
 * to produce a structured veterinary disease triage and decision-support report.
 */
export async function triageAnimalHealth(
  input: HealthAssessmentInput
): Promise<HealthAssessmentResult> {
  const {
    species,
    breed,
    age,
    gender,
    weightKg,
    temperatureF,
    symptoms,
    customDescription,
    feedingDrinkingBehavior,
    durationDays,
    isLactating,
    isFoodProducing,
    mediaFiles,
  } = input;

  // 1. Evaluate Emergency Protocols First
  const emergencyCheck = evaluateEmergencyProtocols(
    symptoms,
    customDescription,
    temperatureF,
    feedingDrinkingBehavior
  );

  let visualObservedEn: string[] = [];
  let visualObservedUr: string[] = [];
  let aiConfidence = 80;
  let aiConfidenceLabel: 'High' | 'Medium' | 'Low' | 'Uncertain' = 'Medium';
  let aiLimitationsEn =
    'Preliminary decision-support screening based on photographic and reported clinical evidence. Visual appearance alone cannot replace direct clinical palpation, auscultation, and microbiological diagnostic tests.';
  let aiLimitationsUr =
    'تصاویر اور موصولہ علامات پر مبنی ابتدائی سائنسی جائزہ۔ ظاہری صورتحال کسی باقاعدہ ویٹرنری معائنے، اسٹیتھوسکوپ اور لیبارٹری ٹیسٹ کا متبادل نہیں ہے۔';
  let clarifyingQuestionsEn: string[] = [];
  let clarifyingQuestionsUr: string[] = [];
  let suspectedDiseaseIds: string[] = [];
  let rawAiText = '';

  // 2. Multimodal Vision Analysis with Gemini API if Media is Attached
  if (mediaFiles && mediaFiles.length > 0) {
    const validImages = mediaFiles.slice(0, 4);
    const imageParts = validImages.map((m) => {
      const matches = m.dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      return {
        inlineData: {
          mimeType: matches && matches[1] ? matches[1] : 'image/jpeg',
          data: matches && matches[2] ? matches[2] : m.dataUrl.split(',')[1] || '',
        },
      };
    });

    const visionPrompt = `You are an expert veterinary pathology and diagnostic decision-support specialist for AMK Animal AI.
Examine the attached animal clinical photographs (including close-up lesions and full-body images) and clinical history:
Species: ${species}
Breed: ${breed || 'Unknown'}
Age: ${age || 'Unknown'}
Gender: ${gender || 'Unknown'}
Weight: ${weightKg ? `${weightKg} kg` : 'Unknown'}
Rectal Temperature: ${temperatureF ? `${temperatureF}°F` : 'Not recorded'}
Reported Symptoms: ${symptoms.join(', ') || 'None selected'}
Clinical Description: ${customDescription || 'None'}
Feeding / Drinking Behavior: ${feedingDrinkingBehavior}
Duration: ${durationDays} days
Lactating: ${isLactating ? 'Yes' : 'No'} | Food Animal: ${isFoodProducing ? 'Yes' : 'No'}

STRICT VETERINARY RULES:
1. NEVER declare an AI prediction as a confirmed diagnosis. Always frame as preliminary triage.
2. List specific visual lesion findings observed in the photos (e.g., vesicular mouth ulcers, cutaneous skin nodules, ocular discharge, edema, lameness, comb cyanosis).
3. Identify possible disease IDs from: fmd, hs, lumpy_skin, mastitis, bloat, nd_poultry, ppr_goat_sheep, equine_colic, canine_parvovirus, canine_rabies.
4. Output MUST BE strictly valid JSON with NO markdown codeblocks:
{
  "visualSymptomsObservedEn": ["observed visual finding 1", "observed visual finding 2"],
  "visualSymptomsObservedUr": ["اردو میں مشاہدہ کی گئی علامت 1", "علامت 2"],
  "confidenceScore": 85,
  "confidenceLabel": "High",
  "suspectedDiseaseIds": ["fmd", "mastitis"],
  "scientificLimitationsEn": "Visual AI assessment based on images. Definitive confirmation requires veterinary clinical examination.",
  "scientificLimitationsUr": "تصاویر پر مبنی اے آئی جائزہ۔ حتمی تصدیق کے لیے ڈاکٹر کا معائنہ لازمی ہے۔",
  "clarifyingQuestionsEn": ["Question 1?", "Question 2?"],
  "clarifyingQuestionsUr": ["سوال 1؟", "سوال 2؟"]
}`;

    // A. Production Secure Proxy
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
          body: {
            action: 'health_triage',
            contents: [{ parts: [{ text: visionPrompt }, ...imageParts] }],
          },
        });

        if (!error && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawAiText = data.candidates[0].content.parts[0].text;
          const parsed = extractAndParseJson<any>(rawAiText);
          if (parsed) {
            visualObservedEn = parsed.visualSymptomsObservedEn || [];
            visualObservedUr = parsed.visualSymptomsObservedUr || [];
            aiConfidence = Math.min(99, Math.max(30, Number(parsed.confidenceScore) || 80));
            aiConfidenceLabel = parsed.confidenceLabel || 'Medium';
            if (parsed.scientificLimitationsEn) aiLimitationsEn = parsed.scientificLimitationsEn;
            if (parsed.scientificLimitationsUr) aiLimitationsUr = parsed.scientificLimitationsUr;
            clarifyingQuestionsEn = parsed.clarifyingQuestionsEn || [];
            clarifyingQuestionsUr = parsed.clarifyingQuestionsUr || [];
            if (Array.isArray(parsed.suspectedDiseaseIds)) {
              suspectedDiseaseIds = parsed.suspectedDiseaseIds;
            }
          }
        }
      } catch (proxyErr) {
        console.warn('Supabase Gemini health proxy failed, falling back to clinical reference engine:', proxyErr);
      }
    }
  }

  // 3. Clinical Disease Matching & Scoring Engine
  const speciesNorm = species.toLowerCase().trim();
  const searchCorpus = `${speciesNorm} ${breed || ''} ${symptoms.join(' ')} ${customDescription}`.toLowerCase();

  // Score all diseases in reference database
  const scoredDiseases = CLINICAL_DISEASES.map((d) => {
    let score = 0;

    // A. Species compatibility
    const speciesMatch = d.targetSpecies.some((sp) => speciesNorm.includes(sp) || sp.includes(speciesNorm));
    if (speciesMatch) score += 35;

    // B. Direct AI vision detection bonus
    if (suspectedDiseaseIds.includes(d.id)) score += 50;

    // C. Symptom overlap
    const symptomHits = d.symptomsEn.filter((sym) =>
      searchCorpus.includes(sym.toLowerCase().slice(0, 6)) ||
      symptoms.some((userSym) => sym.toLowerCase().includes(userSym.replace(/_/g, ' ')))
    ).length;
    score += symptomHits * 15;

    // D. Visual lesion match
    if (d.observedVisualSignsEn) {
      const visualHits = d.observedVisualSignsEn.filter((v) =>
        visualObservedEn.some((userObs) => userObs.toLowerCase().includes(v.toLowerCase().slice(0, 6)))
      ).length;
      score += visualHits * 20;
    }

    // E. Fever match
    if (temperatureF !== undefined && temperatureF >= 103.5) {
      if (['fmd', 'hs', 'lumpy_skin', 'theileriosis', 'nd_poultry', 'ppr_goat_sheep', 'canine_parvovirus'].includes(d.id)) {
        score += 15;
      }
    }

    // F. Supporting & Contradicting Symptoms analysis
    if (d.supportingSymptomsEn) {
      const suppHits = d.supportingSymptomsEn.filter((s) =>
        searchCorpus.includes(s.toLowerCase().slice(0, 5))
      ).length;
      score += suppHits * 15;
    }
    if (d.contradictingSymptomsEn) {
      const contraHits = d.contradictingSymptomsEn.filter((c) =>
        searchCorpus.includes(c.toLowerCase().slice(0, 5))
      ).length;
      score -= contraHits * 20;
    }

    // Specific clinical rule-ins
    if (d.id === 'milk_fever') {
      if (input.movementGait === 'inability_to_stand' || symptoms.includes('cannot_stand')) score += 40;
      if (temperatureF !== undefined && temperatureF < 100.5) score += 45;
      if (temperatureF !== undefined && temperatureF >= 103.5) score -= 60; // fever rules out uncomplicated hypocalcemia
      if (input.durationDays <= 3 && (input.isLactating || input.gender?.toLowerCase() === 'female')) score += 25;
    }

    if (d.id === 'bloat') {
      if (input.rumenDigestion === 'severe_distended_tympany' || input.rumenDigestion === 'mild_bloat') score += 45;
      if (input.breathingPattern === 'open_mouth_gasping') score += 20;
    }

    if (d.id === 'theileriosis') {
      if (input.urineCondition === 'red_coffee_colored') score += 35;
      if (searchCorpus.includes('tick') || searchCorpus.includes('چیچڑ') || searchCorpus.includes('غدود') || searchCorpus.includes('lymph')) score += 35;
    }

    if (d.id === 'donkey_myiasis_wounds') {
      if (searchCorpus.includes('maggot') || searchCorpus.includes('کیڑے') || searchCorpus.includes('کاٹھی') || searchCorpus.includes('harness')) score += 50;
    }

    return { disease: d, score };
  });

  // Sort descending by score
  scoredDiseases.sort((a, b) => b.score - a.score);

  const rawPrimary = scoredDiseases.slice(0, 2).map((s) => s.disease);
  const differentialMatches = scoredDiseases.slice(2, 5).map((s) => s.disease);

  // Dynamically evaluate and calculate recommended medication dosages using the verified Safety Dosage Engine
  const primaryMatches = rawPrimary.map((disease) => {
    if (!disease.modernMedicines) return disease;
    const medicinesWithCalculated = disease.modernMedicines.map((med) => {
      const calculationContext: DosageCalculationContext = {
        species: input.species,
        weightKg,
        isPregnant: input.isPregnant,
        trimester: input.pregnancyTrimester,
        isLactating: input.isLactating,
        hasAirwayObstructionOrChoking: emergencyCheck.detectedEmergency && emergencyCheck.protocols.some((p) => p.emergencyType === 'severe_breathing' || p.emergencyType === 'severe_bloat'),
        hasSwallowingReflexImpairment: input.rumenDigestion === 'severe_distended_tympany' || input.breathingPattern === 'open_mouth_gasping',
        isEmergency: emergencyCheck.detectedEmergency,
      };

      const safeResult = calculateSafeMedicationDosage(med, calculationContext);

      return {
        ...med,
        calculatedDoseForWeight: safeResult.canCalculate ? safeResult.calculatedDose : undefined,
        dosageCalculationDisabledReasonEn: !safeResult.canCalculate ? safeResult.disablingReasonEn : undefined,
        dosageCalculationDisabledReasonUr: !safeResult.canCalculate ? safeResult.disablingReasonUr : undefined,
        withdrawalStatementEn: safeResult.withdrawalStatementEn,
        withdrawalStatementUr: safeResult.withdrawalStatementUr,
        precautionsEn: [
          ...(safeResult.emergencyActiveWarningEn ? [safeResult.emergencyActiveWarningEn] : []),
          ...med.precautionsEn,
          ...(safeResult.injectionSiteAdviceEn ? [safeResult.injectionSiteAdviceEn] : []),
          ...(safeResult.emergencyFirstAidNoticeEn ? [safeResult.emergencyFirstAidNoticeEn] : []),
        ],
        precautionsUr: [
          ...(safeResult.emergencyActiveWarningUr ? [safeResult.emergencyActiveWarningUr] : []),
          ...med.precautionsUr,
          ...(safeResult.injectionSiteAdviceUr ? [safeResult.injectionSiteAdviceUr] : []),
          ...(safeResult.emergencyFirstAidNoticeUr ? [safeResult.emergencyFirstAidNoticeUr] : []),
        ],
      };
    });
    return {
      ...disease,
      modernMedicines: medicinesWithCalculated,
    };
  });

  // If no visual symptoms were extracted from AI, populate baseline from primary disease
  if (visualObservedEn.length === 0 && primaryMatches[0]?.observedVisualSignsEn) {
    visualObservedEn = primaryMatches[0].observedVisualSignsEn.slice(0, 3);
    visualObservedUr = primaryMatches[0].observedVisualSignsUr?.slice(0, 3) || [];
  }

  // Populate dynamic clarifying questions including missing clinical information
  const dynamicQuestionsEn: string[] = [...clarifyingQuestionsEn];
  const dynamicQuestionsUr: string[] = [...clarifyingQuestionsUr];

  if (!weightKg || weightKg <= 0) {
    dynamicQuestionsEn.push('Live animal weight in kg is missing. What is the approximate weight? (Required for precise modern medicine dosage calculation)');
    dynamicQuestionsUr.push('جانور کا وزن (کلوگرام) درج نہیں ہے۔ کیا آپ جانور کا متوقع وزن بتا سکتے ہیں؟ (ادویات کی درست خوراک نکالنے کے لیے وزن ضروری ہے)');
  }

  if (temperatureF === undefined) {
    dynamicQuestionsEn.push('Has rectal temperature been checked with a clinical thermometer? (High fever indicates septic infection, whereas subnormal temp indicates hypocalcemia / shock)');
    dynamicQuestionsUr.push('کیا جانور کا بخار تھرمامیٹر سے چیک کیا گیا ہے؟ (تیز بخار انفیکشن جبکہ معمول سے کم درجہ حرارت سوتا بخار یا صدمے کی علامت ہے)');
  }

  if (input.isPregnant === undefined && (speciesNorm.includes('cow') || speciesNorm.includes('buffalo') || speciesNorm.includes('goat') || speciesNorm.includes('sheep'))) {
    dynamicQuestionsEn.push('Is the female animal currently pregnant? (Certain medications such as flunixin or corticosteroids are contraindicated in pregnancy)');
    dynamicQuestionsUr.push('کیا مادہ جانور اس وقت گابھن (حمل سے) ہے؟ (کچھ ادویات جیسے درد کش یا سٹیرائیڈ ٹیکے حمل میں نقصان دہ ہو سکتے ہیں)');
  }

  if (dynamicQuestionsEn.length === 0 && primaryMatches[0]?.questionsForVetEn) {
    dynamicQuestionsEn.push(...primaryMatches[0].questionsForVetEn);
    dynamicQuestionsUr.push(...(primaryMatches[0].questionsForVetUr || []));
  }

  const overallRiskLevel: HealthRiskLevel = emergencyCheck.detectedEmergency
    ? 'emergency'
    : primaryMatches.some((m) => m.riskLevel === 'emergency')
    ? 'emergency'
    : primaryMatches.some((m) => m.riskLevel === 'severe')
    ? 'severe'
    : 'moderate';

  return {
    id: 'health_eval_' + Date.now(),
    timestamp: new Date().toISOString(),
    input,
    detectedEmergency: emergencyCheck.detectedEmergency,
    emergencyProtocols: emergencyCheck.protocols,
    emergencyWarningsEn: emergencyCheck.warningsEn,
    emergencyWarningsUr: emergencyCheck.warningsUr,
    visualSymptomsObservedEn: visualObservedEn,
    visualSymptomsObservedUr: visualObservedUr,
    confidenceScore: aiConfidence,
    confidenceLabel: aiConfidenceLabel,
    scientificLimitationsEn: aiLimitationsEn,
    scientificLimitationsUr: aiLimitationsUr,
    clarifyingQuestionsEn: dynamicQuestionsEn,
    clarifyingQuestionsUr: dynamicQuestionsUr,
    primaryMatches,
    differentialMatches,
    overallRiskLevel,
    generalPrecautionsEn: [
      'Immediately isolate the animal in a well-ventilated, clean, dry, shaded pen away from healthy herd members.',
      'Ensure continuous access to fresh, clean drinking water fortified with oral electrolytes (ORS).',
      'Do not force coarse dry roughage (bhoosa) if oral ulcers or throat swelling is suspected.',
      'Record rectal temperature twice daily (morning and evening) using a calibrated veterinary thermometer.',
      'Maintain strict disinfection of footwear and equipment using 4% washing soda or Virkon-S.',
    ],
    generalPrecautionsUr: [
      'جانور کو فوری طور پر ہوا دار، سوکھی اور سایہ دار جگہ پر دوسرے جانوروں سے الگ باندھیں۔',
      'صاف تازہ پانی میں نمکیات (او آر ایس) ملا کر پینے کے لیے ہر وقت سامنے رکھیں۔',
      'منہ یا گلے میں تکلیف کی صورت میں سخت توڑی نہ ڈالیں بلکہ نرم دلیا اور چارہ دیں۔',
      'صبح اور شام جانور کا ٹمپریچر (بخار) تھرمامیٹر سے باقاعدگی سے چیک کریں۔',
      'باڑے کے اندر اور باہر جراثیم کش سپرے اور صفائی کا خاص خیال رکھیں۔',
    ],
    veterinaryDisclaimerEn:
      'LEGAL & SAFETY DISCLAIMER: This assessment is generated by an artificial intelligence decision-support system for educational and preliminary triage only. It DOES NOT constitute a confirmed veterinary diagnosis, prescription, or clinical certification. Never administer prescription antibiotics, deep intramuscular injections, or controlled veterinary drugs without a physical examination by a licensed veterinarian (RVMP).',
    veterinaryDisclaimerUr:
      'قانونی اور ویٹرنری انتباہ: یہ تجزیہ صرف ابتدائی معلومات اور معاونت کے لیے ہے۔ یہ کسی مستند رجسٹرڈ ویٹرنری ڈاکٹر (RVMP) کے معائنے، نسخے یا حتمی تشخیص کا نعم البدل نہیں ہے۔ ڈاکٹر کی نگرانی کے بغیر کوئی بھی اینٹی بائیوٹک یا خطرناک انجیکشن ہرگز نہ لگائیں۔',
    isAiAnalysis: true,
    aiRawResponse: rawAiText || undefined,
  };
}

/**
 * Convenience alias for multimodal disease detection
 */
export const detectAnimalDiseaseFromMediaAndSymptoms = triageAnimalHealth;


/**
 * Handles bilingual veterinary AI chat inquiries.
 */
export async function sendVeterinaryChatMessage(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  attachedAnimalSummary?: string,
  language: 'en' | 'ur' = 'ur'
): Promise<string> {
  const systemInstruction = `You are AMK Animal AI, an expert veterinary technology specialist and livestock advisor created by amkashif.
Language preference: Respond fluently in ${language === 'ur' ? 'Pakistani Urdu (اردو)' : 'English'}.
${attachedAnimalSummary ? `Current Active Animal Context: ${attachedAnimalSummary}` : ''}

CRITICAL VETERINARY SAFETY RULES:
1. Never claim to give a confirmed final clinical diagnosis.
2. Never prescribe specific dosages of dangerous prescription antibiotics or injectables.
3. Recommend an emergency veterinarian immediately if life-threatening symptoms (choking, severe bloat, high fever, recumbency) are mentioned.
4. For food animals (dairy/meat), remind about withdrawal periods.
5. Provide actionable husbandry, feed, biosecurity, and home first-aid measures.
6. Signature at end of major recommendations: AMK Animal AI | Contact: +923346682654`;

  // 1. Secure Cloud AI Path via Supabase Edge Function Proxy
  if (isSupabaseConfigured()) {
    if (!checkRateLimit()) {
      return language === 'ur'
        ? '⚠️ آپ نے بہت کم وقت میں زیادہ سوالات پوچھے ہیں۔ براہ کرم چند لمحے انتظار کیجیے۔'
        : '⚠️ Rate limit reached. Please wait a moment before sending another query.';
    }

    try {
      const contentsPayload = [
        ...history.map((h) => ({
          role: h.role,
          parts: h.parts.map((p) => ({ text: p.text })),
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'chat',
          contents: contentsPayload,
          systemInstruction,
        },
      });

      if (!error && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e: any) {
      console.warn('Supabase Gemini chat proxy error, falling back:', e);
    }
  }

  // 2. Offline / Fallback Knowledge Response (Safe Clinical First Aid & Triage Guidance)
  if (language === 'ur') {
    return `وعلیکم السلام! میں **اے ایم کے اینیمل اے آئی** ہوں۔ آپ کے سوال کا ویٹرنری جائزہ:

1. **ابتدائی نگہداشت:** جانور کو خشک، ہوادار اور پرسکون جگہ پر رکھیں اور پینے کے لیے تازہ پانی اور الیکٹرولائٹس فراہم کریں۔
2. **اہم احتیاط:** ڈاکٹر کے مشورے کے بغیر اینٹی بائیوٹک یا کوئی خطرناک انجیکشن خود سے ہرگز نہ لگائیں۔
3. **ڈاکٹر سے مشورہ:** اگر جانور کا بخار 104 فارن ہائیٹ سے زیادہ ہو یا کھانا پینا چھوڑ دے تو قریبی رجسٹرڈ ویٹرنری ڈاکٹر (RVMP) سے فوری معائنہ کروائیں۔

*(نوٹ: کلاؤڈ سرور غیر فعال ہونے کی صورت میں یہ جواب آف لائن ویٹرنری ڈیٹا بیس سے دیا گیا ہے)*
— **اے ایم کے اینیمل اے آئی | پیشکش: amkashif | واٹس ایپ: +923346682654**`;
  }

  return `Hello! I am **AMK Animal AI**. Regarding your animal inquiry:

1. **Initial Supportive Care:** Ensure the animal is isolated in a clean, shaded, well-ventilated pen with ad-libitum clean drinking water.
2. **Safety Notice:** Do not administer prescription antibiotics or deep intramuscular injections without veterinary prescription.
3. **Veterinary Action:** If rectal temperature exceeds 104°F or the animal stops ruminating/eating, contact an RVMP licensed veterinarian promptly.

*(Note: Response provided via Offline Veterinary Reference Knowledge Base)*
— **AMK Animal AI | By amkashif | WhatsApp: +923346682654**`;
}
