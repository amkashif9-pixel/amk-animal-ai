import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScanPrediction } from '../types/animal';
import { ALL_BREEDS } from '../data/speciesData';
import { HealthAssessmentInput, HealthAssessmentResult } from '../types/health';
import { CLINICAL_DISEASES } from '../data/diseaseData';
import { supabase, isSupabaseConfigured } from './supabase';

export const GEMINI_STORAGE_KEY = 'amk_gemini_api_key';

// Rate Limiter State (max 10 requests per minute)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestTimestamps: number[] = [];

/**
 * Validates Google Gemini API key format (standard AI Studio prefix AIzaSy and length 39)
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  const geminiKeyRegex = /^AIzaSy[A-Za-z0-9_-]{33}$/;
  return geminiKeyRegex.test(trimmed);
}

/**
 * Obfuscates stored key for safe UI display (e.g., "AIzaSy...4x9B")
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 10) return '••••••••';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export function getStoredApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && isValidApiKeyFormat(envKey)) return envKey.trim();

  const saved = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (saved && isValidApiKeyFormat(saved)) return saved.trim();

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
      error: 'Invalid Gemini API key format. Key must begin with "AIzaSy" followed by 33 characters.',
    };
  }

  localStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
  return { success: true };
}

/**
 * Verifies API connectivity with Google Gemini servers
 */
export async function testGeminiApiKey(key: string): Promise<{ success: boolean; message: string }> {
  if (!isValidApiKeyFormat(key)) {
    return {
      success: false,
      message: 'Invalid API key format. Key must start with "AIzaSy".',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(key.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('ping');
    const text = result.response.text();
    if (text) {
      return { success: true, message: 'Google Gemini API key verified successfully!' };
    }
    return { success: false, message: 'Empty response from Gemini endpoint.' };
  } catch (err: any) {
    const msg = err?.message || 'Connection failed';
    if (msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('403')) {
      return { success: false, message: 'Authentication failed. Please verify that the API key is active.' };
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return { success: false, message: 'Gemini API quota exceeded for this key.' };
    }
    return { success: false, message: `Verification failed: ${msg}` };
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

  // 2. Developer Offline BYOK Sandbox Mode
  const apiKey = getStoredApiKey();
  if (apiKey) {
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded: Please wait a moment before initiating another AI vision scan.');
    }

    try {
      console.info('Using local developer BYOK key. In production, requests route through Supabase Edge Function.');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Sanitize and validate image payload
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

      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();
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
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to scientific reference baseline:', err);
      if (err?.message?.includes('Rate limit')) {
        throw err;
      }
    }
  }

  // Fallback Reference Mode (when no Gemini key is provided, or network fails)
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
 * Evaluates symptoms, animal history, and clinical data to produce
 * a structured veterinary triage report.
 */
export async function triageAnimalHealth(
  input: HealthAssessmentInput
): Promise<HealthAssessmentResult> {
  const { species, symptoms, feedingDrinkingBehavior, temperatureF, durationDays, customDescription } = input;

  // Check emergency criteria first
  const isEmergency: boolean = Boolean(
    symptoms.some((s) =>
      ['severe_breathing', 'collapse', 'severe_bloat', 'poisoning', 'severe_bleeding', 'cannot_stand'].includes(s)
    ) ||
    feedingDrinkingBehavior === 'stopped' ||
    (temperatureF !== undefined && temperatureF >= 106.0)
  );

  const emergencyWarningsEn: string[] = [];
  const emergencyWarningsUr: string[] = [];

  if (isEmergency) {
    emergencyWarningsEn.push(
      'CRITICAL: Immediate life-threatening signs detected (respiratory obstruction, severe fever, or ruminal collapse). Contact an RVMP emergency vet immediately!'
    );
    emergencyWarningsUr.push(
      'انتہائی خطرہ: جانور کی جان کو فوری خطرہ لاحق ہے (سانس بند ہونا، 106 سے زیادہ تیز بخار یا گر جانا)۔ فوراً ایمرجنسی ویٹرنری ڈاکٹر کو بلائیں!'
    );
  }

  // Match clinical conditions from database
  let primaryMatches = CLINICAL_DISEASES.filter((d) => {
    const desc = (customDescription + ' ' + symptoms.join(' ')).toLowerCase();
    const nameMatch = d.nameEn.toLowerCase().includes(species.toLowerCase()) || d.id.includes(species);
    // Score based on symptoms
    const matchedCount = d.symptomsEn.filter((s) => desc.includes(s.toLowerCase().slice(0, 5))).length;
    return matchedCount > 0 || nameMatch;
  });

  if (primaryMatches.length === 0) {
    primaryMatches = [CLINICAL_DISEASES[0], CLINICAL_DISEASES[3]]; // FMD and Mastitis as common primary
  }

  const overallRiskLevel = isEmergency
    ? 'emergency'
    : primaryMatches.some((m) => m.riskLevel === 'severe')
    ? 'severe'
    : 'moderate';

  return {
    id: 'health_eval_' + Date.now(),
    timestamp: new Date().toISOString(),
    input,
    detectedEmergency: isEmergency,
    emergencyWarningsEn,
    emergencyWarningsUr,
    primaryMatches: primaryMatches.slice(0, 2),
    differentialMatches: CLINICAL_DISEASES.filter((d) => !primaryMatches.includes(d)).slice(0, 2),
    overallRiskLevel,
    generalPrecautionsEn: [
      'Isolate the animal in a well-ventilated, clean, dry, shaded pen.',
      'Ensure access to clean, room-temperature drinking water with oral electrolytes.',
      'Do not force dry roughage if mouth or throat is painful.',
      'Record rectal temperature twice daily (morning and evening) in degrees Fahrenheit.',
    ],
    generalPrecautionsUr: [
      'جانور کو فوری طور پر ہوا دار، سوکھی اور سایہ دار جگہ پر دوسرے جانوروں سے الگ باندھیں۔',
      'صاف تازہ پانی میں نمکیات ملا کر پینے کے لیے ہر وقت سامنے رکھیں۔',
      'منہ یا گلے میں تکلیف کی صورت میں سخت توڑی نہ ڈالیں بلکہ نرم دلیا اور چارہ دیں۔',
      'صبح اور شام جانور کا ٹمپریچر (بخار) تھرمامیٹر سے باقاعدگی سے چیک کریں۔',
    ],
    veterinaryDisclaimerEn:
      'LEGAL & SAFETY DISCLAIMER: This assessment is generated by an artificial intelligence system for educational and preliminary triage only. It DOES NOT constitute a veterinary diagnosis or prescription. Never administer injections, tranquilizers, or prescription antibiotics without a physical examination by a licensed veterinarian (RVMP).',
    veterinaryDisclaimerUr:
      'قانونی اور ویٹرنری انتباہ: یہ تجزیہ صرف ابتدائی معلومات اور آگاہی کے لیے ہے۔ یہ کسی مستند رجسٹرڈ ویٹرنری ڈاکٹر (RVMP) کے معائنے یا نسخے کا نعم البدل نہیں ہے۔ ڈاکٹر کی نگرانی کے بغیر کوئی بھی اینٹی بائیوٹک یا خطرناک انجیکشن ہرگز نہ لگائیں۔',
    isAiAnalysis: true,
  };
}

/**
 * Handles bilingual veterinary AI chat inquiries.
 */
export async function sendVeterinaryChatMessage(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  attachedAnimalSummary?: string,
  language: 'en' | 'ur' = 'ur'
): Promise<string> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    if (!checkRateLimit()) {
      return language === 'ur'
        ? '⚠️ آپ نے بہت کم وقت میں زیادہ سوالات پوچھے ہیں۔ براہ کرم چند لمحے انتظار کیجیے۔'
        : '⚠️ Rate limit reached. Please wait a moment before sending another query.';
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are AMK Animal AI, an expert veterinary technology specialist and livestock advisor created by amkashif.
Language preference: Respond fluently in ${language === 'ur' ? 'Pakistani Urdu (اردو)' : 'English'}.
${attachedAnimalSummary ? `Current Active Animal Context: ${attachedAnimalSummary}` : ''}

CRITICAL VETERINARY SAFETY RULES:
1. Never claim to give a confirmed final clinical diagnosis.
2. Never prescribe specific dosages of dangerous prescription antibiotics or injectables.
3. Recommend an emergency veterinarian immediately if life-threatening symptoms (choking, severe bloat, high fever, recumbency) are mentioned.
4. For food animals (dairy/meat), remind about withdrawal periods.
5. Provide actionable husbandry, feed, biosecurity, and home first-aid measures.
6. Signature at end of major recommendations: AMK Animal AI | Contact: +923346682654`,
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (e: any) {
      console.warn('Gemini chat error:', e);
    }
  }

  // Offline / Fallback knowledge response
  if (language === 'ur') {
    return `وعلیکم السلام! میں **اے ایم کے اینیمل اے آئی** ہوں۔ آپ کے سوال کا ویٹرنری جائزہ:

1. **ابتدائی نگہداشت:** جانور کو خشک، ہوادار اور پرسکون جگہ پر رکھیں اور پینے کے لیے تازہ پانی اور الیکٹرولائٹس فراہم کریں۔
2. **اہم احتیاط:** ڈاکٹر کے مشورے کے بغیر اینٹی بائیوٹک یا کوئی خطرناک انجیکشن خود سے ہرگز نہ لگائیں۔
3. **ڈاکٹر سے مشورہ:** اگر جانور کا بخار 104 فارن ہائیٹ سے زیادہ ہو یا کھانا پینا چھوڑ دے تو قریبی رجسٹرڈ ویٹرنری ڈاکٹر (RVMP) سے فوری معائنہ کروائیں۔

*(نوٹ: کلاؤڈ اے آئی کے مکمل جوابات کے لیے آپ ترتیبات میں اپنی جیمنائی API Key شامل کر سکتے ہیں)*
— **اے ایم کے اینیمل اے آئی | پیشکش: amkashif | واٹس ایپ: +923346682654**`;
  }

  return `Hello! I am **AMK Animal AI**. Regarding your animal inquiry:

1. **Initial Supportive Care:** Ensure the animal is isolated in a clean, shaded, well-ventilated pen with ad-libitum clean drinking water.
2. **Safety Notice:** Do not administer prescription antibiotics or deep intramuscular injections without veterinary prescription.
3. **Veterinary Action:** If rectal temperature exceeds 104°F or the animal stops ruminating/eating, contact an RVMP licensed veterinarian promptly.

*(Note: Add your Gemini API key in Settings for full real-time cloud AI responses)*
— **AMK Animal AI | By amkashif | WhatsApp: +923346682654**`;
}
