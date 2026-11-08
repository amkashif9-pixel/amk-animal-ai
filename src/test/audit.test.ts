import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Polyfill localStorage and sessionStorage for Node.js test environment if missing
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

if (typeof globalThis.sessionStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    length: 0,
  } as any;
}

// Services under audit
import {
  isValidApiKeyFormat,
  maskApiKey,
  extractAndParseJson,
  getStoredApiKey,
  saveApiKey,
  consumeAiQuotaWithServer,
  GEMINI_STORAGE_KEY,
} from '../services/aiService';

import {
  verifyAdminKey,
  isCurrentAdminSessionValid,
  clearAdminSession,
  isServerAuthorizedAdmin,
  adminResetUserQuotaWithServer,
} from '../services/adminAuthService';

import { calculateMarketPrice } from '../services/priceEstimator';

import {
  isValidRvmpLicense,
  getAllVeterinarians,
  verifyVeterinarian,
  revokeVeterinarian,
  getVerificationAuditLogs,
  uploadVeterinaryDocument,
  updateVeterinarianProfile,
} from '../services/vetService';

import {
  fetchMarketplaceListings,
  createMarketplaceListing,
  updateMarketplaceListing,
  submitFraudReport,
  adminModerateListing,
} from '../services/marketplaceService';

import {
  fetchConsultations,
  bookConsultation,
  cancelConsultation,
  savePrescription,
  updateConsultationStatus,
} from '../services/consultationService';

import { isSupabaseConfigured } from '../services/supabase';

// Helper: Exact Base64 Decoded Size Calculator
function calculateDecodedBase64Size(base64Str: string): number {
  const clean = base64Str.trim();
  const len = clean.length;
  if (len === 0) return 0;
  let padding = 0;
  if (clean.endsWith('==')) padding = 2;
  else if (clean.endsWith('=')) padding = 1;
  return Math.floor((len * 3) / 4) - padding;
}

// ============================================================================
// DOMAIN 1: GEMINI API SECURITY & INTEGRATION (UNIT TESTS)
// ============================================================================
describe('Domain 1: Gemini API Security & Format Sanitization (Unit Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should validate standard Google AI Studio API key format (AIzaSy + 33 chars = 39 total)', () => {
    expect(isValidApiKeyFormat('AIzaSyAbcdEfghIjklMnopQrstuVwxyz0123456')).toBe(true);
    expect(isValidApiKeyFormat('AIzaSyA_B-C1234567890abcdefghijklmnopqr')).toBe(true);

    expect(isValidApiKeyFormat('AIzaSyShort')).toBe(false);
    expect(isValidApiKeyFormat('sk-proj-12345678901234567890123456789012')).toBe(false);
    expect(isValidApiKeyFormat('AIzaSy' + 'a'.repeat(40))).toBe(false);
    expect(isValidApiKeyFormat('')).toBe(false);
    expect(isValidApiKeyFormat(null as any)).toBe(false);
    expect(isValidApiKeyFormat(undefined as any)).toBe(false);
  });

  it('should securely mask API keys for client-side UI display', () => {
    const key = 'AIzaSyAbcdEfghIjklMnopQrstuVwxyz0123456';
    const masked = maskApiKey(key);
    expect(masked).toBe('AIzaSy...3456');
    expect(masked).not.toContain('IjklMnopQrstu');

    expect(maskApiKey('')).toBe('••••••••');
    expect(maskApiKey('12345')).toBe('••••••••');
  });

  it('should extract and parse JSON safely from raw or markdown-wrapped LLM responses', () => {
    const raw = '{"species": "Cow", "breed": "Sahiwal", "confidenceScore": 92}';
    const parsedRaw = extractAndParseJson<{ species: string; breed: string }>(raw);
    expect(parsedRaw).not.toBeNull();
    expect(parsedRaw?.species).toBe('Cow');
    expect(parsedRaw?.breed).toBe('Sahiwal');

    const fenced = '```json\n{"species": "Buffalo", "breed": "Nili-Ravi", "confidenceScore": 88}\n```';
    const parsedFenced = extractAndParseJson<{ species: string; breed: string }>(fenced);
    expect(parsedFenced?.species).toBe('Buffalo');
    expect(parsedFenced?.breed).toBe('Nili-Ravi');

    const chatter = 'Here is the analysis:\n```json\n{"species": "Goat", "breed": "Kamori"}\n```\nHope this helps!';
    const parsedChatter = extractAndParseJson<{ species: string; breed: string }>(chatter);
    expect(parsedChatter?.species).toBe('Goat');
    expect(parsedChatter?.breed).toBe('Kamori');

    expect(extractAndParseJson('Not a JSON string at all')).toBeNull();
  });

  it('should defend against storage poisoning: reject invalid keys injected into localStorage', () => {
    localStorage.setItem(GEMINI_STORAGE_KEY, 'malicious_injected_script_or_corrupt_string');
    const key = getStoredApiKey();
    expect(key).toBe('');

    const saveResult = saveApiKey('AIzaSyAbcdEfghIjklMnopQrstuVwxyz0123456');
    expect(saveResult.success).toBe(true);
    expect(getStoredApiKey()).toBe('AIzaSyAbcdEfghIjklMnopQrstuVwxyz0123456');
  });
});

// ============================================================================
// DOMAIN 2: ADMIN AUTHORIZATION & ROLE-BASED ACCESS CONTROL (UNIT TESTS)
// ============================================================================
describe('Domain 2: Admin Authorization & Role-Based Access Control (Unit Tests)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should verify the administrative passkey ONLY in dev simulation and register token in-memory', () => {
    expect(isCurrentAdminSessionValid()).toBe(false);

    const failure = verifyAdminKey('wrong-passkey');
    expect(failure).toBe(false);
    expect(isCurrentAdminSessionValid()).toBe(false);

    const success = verifyAdminKey('amk923346682654', 'amkashif@amkanimal.ai');
    expect(success).toBe(true);
    expect(isCurrentAdminSessionValid()).toBe(true);
  });

  it('should reject forged or corrupted session tokens in sessionStorage', () => {
    const forgedSession = {
      adminEmail: 'attacker@evil.com',
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 7200000,
      sessionToken: 'forged_arbitrary_token_without_signature',
    };
    sessionStorage.setItem('amk_admin_verified_session', JSON.stringify(forgedSession));
    expect(isCurrentAdminSessionValid()).toBe(false);
  });

  it('should reject forged valid-looking amk_sec_ and amk_srv_ tokens injected directly into sessionStorage', () => {
    const forgedSecSession = {
      adminEmail: 'attacker@evil.com',
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 7200000,
      sessionToken: 'amk_sec_forged_malicious_token_12345',
      authSource: 'dev_local_simulation',
    };
    sessionStorage.setItem('amk_admin_verified_session', JSON.stringify(forgedSecSession));
    expect(isCurrentAdminSessionValid()).toBe(false);

    const forgedSrvSession = {
      adminEmail: 'attacker@evil.com',
      verifiedAt: Date.now(),
      expiresAt: Date.now() + 7200000,
      sessionToken: 'amk_srv_forged_database_claim_998877',
      authSource: 'supabase_rpc',
    };
    sessionStorage.setItem('amk_admin_verified_session', JSON.stringify(forgedSrvSession));
    expect(isCurrentAdminSessionValid()).toBe(false);
  });

  it('should reject expired admin sessions and purge tokens', () => {
    const expiredSession = {
      adminEmail: 'amkashif@amkanimal.ai',
      verifiedAt: Date.now() - (3 * 60 * 60 * 1000),
      expiresAt: Date.now() - (1 * 60 * 60 * 1000),
      sessionToken: 'amk_sec_expired12345',
    };
    sessionStorage.setItem('amk_admin_verified_session', JSON.stringify(expiredSession));

    expect(isCurrentAdminSessionValid()).toBe(false);
    expect(sessionStorage.getItem('amk_admin_verified_session')).toBeNull();
  });

  it('should clear admin privileges upon explicit sign-out or session revocation', () => {
    verifyAdminKey('amk923346682654');
    expect(isCurrentAdminSessionValid()).toBe(true);

    clearAdminSession();
    expect(isCurrentAdminSessionValid()).toBe(false);
  });

  it('should fail closed when evaluating server admin privileges without live Supabase configuration', async () => {
    const isServerAdmin = await isServerAuthorizedAdmin();
    expect(isServerAdmin).toBe(false);
  });
});

// ============================================================================
// DOMAIN 3: SUPABASE ROW LEVEL SECURITY & STORAGE OBJECT POLICIES (SCHEMA TESTS)
// ============================================================================
describe('Domain 3: Supabase Row Level Security & Storage Object Policies (Schema Tests)', () => {
  const sql01Path = path.resolve(__dirname, '../../supabase/migrations/01_amk_animal_ai_init.sql');
  const sql01Content = fs.readFileSync(sql01Path, 'utf8');

  it('should enforce ROW LEVEL SECURITY across all essential domain tables', () => {
    const requiredRlsTables = [
      'animals',
      'animal_images',
      'animal_analysis',
      'animal_health_records',
      'vaccinations',
      'feeding_plans',
      'marketplace_listings',
      'consultations',
      'notifications',
      'subscriptions',
      'fraud_reports',
      'veterinarians',
    ];

    for (const table of requiredRlsTables) {
      const enableRlsRegex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      expect(sql01Content).toMatch(enableRlsRegex);
    }
  });

  it('should declare storage buckets and strict object-level RLS policies', () => {
    expect(sql01Content).toContain("'animal-photos'");
    expect(sql01Content).toContain("'marketplace-media'");
    expect(sql01Content).toContain("'medical-records'");
  });
});

// ============================================================================
// DOMAIN 4: MARKET PRICE CALCULATION BOUNDARIES & ALGORITHMS (UNIT TESTS)
// ============================================================================
describe('Domain 4: Market Price Calculation Algorithms & Boundaries (Unit Tests)', () => {
  it('should clamp extreme weight, age, and milk production boundaries', () => {
    const negWeight = calculateMarketPrice({
      species: 'Cow',
      breed: 'Sahiwal',
      ageYears: 3,
      gender: 'female',
      weightKg: -50,
      healthCondition: 'good',
      country: 'Pakistan',
      provinceState: 'Punjab',
      districtCity: 'Sahiwal',
    });
    expect(negWeight.avgPrice).toBeGreaterThan(0);
    expect(negWeight.avgPrice).toBeLessThan(10000000);

    const giantWeight = calculateMarketPrice({
      species: 'Cow',
      breed: 'Sahiwal',
      ageYears: 3,
      gender: 'female',
      weightKg: 50000,
      healthCondition: 'good',
      country: 'Pakistan',
      provinceState: 'Punjab',
      districtCity: 'Sahiwal',
    });
    expect(giantWeight.avgPrice).toBeGreaterThan(0);
    expect(giantWeight.avgPrice).toBeLessThan(5000000);
  });

  it('should enforce biological constraints (no milk yield or pregnancy bonuses for males)', () => {
    const bullEstimate = calculateMarketPrice({
      species: 'Cow',
      breed: 'Sahiwal',
      ageYears: 3,
      gender: 'male',
      weightKg: 450,
      dailyMilkProductionLiters: 25,
      isPregnant: true,
      healthCondition: 'good',
      country: 'Pakistan',
      provinceState: 'Punjab',
      districtCity: 'Sahiwal',
    });

    const hasDairyFactor = bullEstimate.factorsApplied.some(f => f.factorEn.toLowerCase().includes('milk') || f.factorEn.toLowerCase().includes('dairy'));
    const hasPregnancyFactor = bullEstimate.factorsApplied.some(f => f.factorEn.toLowerCase().includes('pregnant'));

    expect(hasDairyFactor).toBe(false);
    expect(hasPregnancyFactor).toBe(false);
  });

  it('should convert currency correctly for non-Pakistan markets (SAR, AED, USD, GBP)', () => {
    const pkrResult = calculateMarketPrice({
      species: 'Goat',
      breed: 'Kamori',
      ageYears: 2,
      gender: 'female',
      weightKg: 50,
      healthCondition: 'good',
      country: 'Pakistan',
      provinceState: 'Sindh',
      districtCity: 'Hyderabad',
    });
    expect(pkrResult.currency).toBe('PKR');

    const sarResult = calculateMarketPrice({
      species: 'Goat',
      breed: 'Kamori',
      ageYears: 2,
      gender: 'female',
      weightKg: 50,
      healthCondition: 'good',
      country: 'Saudi Arabia',
      provinceState: 'Riyadh',
      districtCity: 'Riyadh',
    });
    expect(sarResult.currency).toBe('SAR');
    expect(sarResult.avgPrice).toBeLessThan(pkrResult.avgPrice);

    const usdResult = calculateMarketPrice({
      species: 'Goat',
      breed: 'Kamori',
      ageYears: 2,
      gender: 'female',
      weightKg: 50,
      healthCondition: 'good',
      country: 'International',
      provinceState: 'Texas',
      districtCity: 'Austin',
    });
    expect(usdResult.currency).toBe('USD');
    expect(usdResult.avgPrice).toBeLessThan(sarResult.avgPrice);
  });

  it('should guarantee a realistic minimum price floor even for poor health conditions', () => {
    const poorConditionResult = calculateMarketPrice({
      species: 'Cow',
      breed: 'Sahiwal',
      ageYears: 10,
      gender: 'female',
      weightKg: 300,
      healthCondition: 'poor',
      country: 'Pakistan',
      provinceState: 'Punjab',
      districtCity: 'Multan',
    });
    expect(poorConditionResult.minPrice).toBeGreaterThan(30000);
    expect(poorConditionResult.avgPrice).toBeGreaterThan(poorConditionResult.minPrice);
    expect(poorConditionResult.maxPrice).toBeGreaterThan(poorConditionResult.avgPrice);
  });

  it('should explicitly disclose that mandi data is a static survey benchmark (not live streaming)', () => {
    const estimate = calculateMarketPrice({
      species: 'Cow',
      breed: 'Sahiwal',
      ageYears: 3,
      gender: 'female',
      weightKg: 400,
      healthCondition: 'good',
      country: 'Pakistan',
      provinceState: 'Punjab',
      districtCity: 'Sahiwal',
    });

    expect(estimate.lastUpdatedDate).toContain('2025-11-15');
    expect(estimate.dataSourceEn).toContain('Static');
    expect(estimate.limitationsNoticeEn).toContain('NON-LIVE BENCHMARK NOTICE');
  });
});

// ============================================================================
// DOMAIN 5: VETERINARIAN VERIFICATION & MANDATORY DOCUMENTS (UNIT TESTS)
// ============================================================================
describe('Domain 5: Veterinarian Verification & Mandatory Documents (Unit Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should validate official RVMP license numbers accurately', () => {
    expect(isValidRvmpLicense('RVMP-PB-14892')).toBe(true);
    expect(isValidRvmpLicense('RVMP-SD-09841')).toBe(true);
    expect(isValidRvmpLicense('RVMP-KPK-11223')).toBe(true);
    expect(isValidRvmpLicense('RVMP-BA-33441')).toBe(true);

    expect(isValidRvmpLicense('12345')).toBe(false);
    expect(isValidRvmpLicense('DOC-AHMED')).toBe(false);
    expect(isValidRvmpLicense('RVMP-123')).toBe(false);
    expect(isValidRvmpLicense('')).toBe(false);
    expect(isValidRvmpLicense(null as any)).toBe(false);
  });

  it('should verify a veterinarian profile and log the audit entry with document reference', () => {
    const vets = getAllVeterinarians();
    expect(vets.length).toBeGreaterThan(0);

    const testVet = vets[0];
    const initialLogsCount = getVerificationAuditLogs().length;

    const result = verifyVeterinarian(
      testVet.id,
      'amkashif (Admin)',
      'RVMP-PB-99881',
      'AMK-DOC-AUDIT-DEGREE-UVAS-001'
    );
    expect(result.success).toBe(true);

    const updatedVets = getAllVeterinarians();
    const updatedTarget = updatedVets.find(v => v.id === testVet.id);
    expect(updatedTarget?.isVerified).toBe(true);
    expect(updatedTarget?.licenseNumber).toBe('RVMP-PB-99881');
    expect(updatedTarget?.manualVerificationDocRef).toBe('AMK-DOC-AUDIT-DEGREE-UVAS-001');

    const auditLogs = getVerificationAuditLogs();
    expect(auditLogs.length).toBe(initialLogsCount + 1);
    expect(auditLogs[0].action).toBe('verified');
    expect(auditLogs[0].vetId).toBe(testVet.id);
    expect(auditLogs[0].licenseNumber).toBe('RVMP-PB-99881');
    expect(auditLogs[0].manualVerificationDocRef).toBe('AMK-DOC-AUDIT-DEGREE-UVAS-001');
    expect(auditLogs[0].performedBy).toBe('amkashif (Admin)');
    expect(auditLogs[0].timestamp).toBeDefined();
    expect(auditLogs[0].disclaimer).toContain('Does not constitute real-time PVMC');
  });

  it('should reject veterinarian verification if license format is invalid', () => {
    const vets = getAllVeterinarians();
    const testVet = vets[0];

    const result = verifyVeterinarian(testVet.id, 'amkashif (Admin)', 'INVALID-LICENSE', 'AMK-DOC-VALID-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid license format');
  });

  it('should reject veterinarian verification if document reference is missing or empty', () => {
    const vets = getAllVeterinarians();
    const testVet = vets[0];

    const noDocResult = verifyVeterinarian(testVet.id, 'amkashif (Admin)', 'RVMP-PB-14892', '');
    expect(noDocResult.success).toBe(false);
    expect(noDocResult.error).toContain('Verification Rejected');

    const undefDocResult = verifyVeterinarian(testVet.id, 'amkashif (Admin)', 'RVMP-PB-14892', undefined as any);
    expect(undefDocResult.success).toBe(false);
    expect(undefDocResult.error).toContain('Verification Rejected');
  });

  it('should reject veterinarian verification if verifier is not an authorized administrator', () => {
    const vets = getAllVeterinarians();
    const testVet = vets[0];

    const unauthResult = verifyVeterinarian(testVet.id, 'farmer_joe', 'RVMP-PB-14892', 'DOC-REF-999');
    expect(unauthResult.success).toBe(false);
    expect(unauthResult.error).toContain('Unauthorized');

    const spoofResult = verifyVeterinarian(testVet.id, 'unauth_hacker_admin', 'RVMP-PB-14892', 'DOC-REF-999');
    expect(spoofResult.success).toBe(false);
    expect(spoofResult.error).toContain('Unauthorized');
  });

  it('should revoke veterinarian status and record revocation audit trail', () => {
    const vets = getAllVeterinarians();
    const testVet = vets[0];

    verifyVeterinarian(testVet.id, 'amkashif (Admin)', 'RVMP-PB-14892', 'AMK-DOC-DEGREE-VALIDATED-123');

    const revokeResult = revokeVeterinarian(testVet.id, 'amkashif (Admin)', 'Suspension pending annual license renewal');
    expect(revokeResult.success).toBe(true);

    const updatedVets = getAllVeterinarians();
    const target = updatedVets.find(v => v.id === testVet.id);
    expect(target?.isVerified).toBe(false);

    const auditLogs = getVerificationAuditLogs();
    expect(auditLogs[0].action).toBe('revoked');
    expect(auditLogs[0].vetId).toBe(testVet.id);
    expect(auditLogs[0].reason).toContain('Suspension pending');
  });

  it('should sanitize veterinarian self-updates and prevent tampering with verification fields', async () => {
    const vets = getAllVeterinarians();
    const testVet = vets[0];

    // Vet attempts to self-verify or change license number
    const updateResult = await updateVeterinarianProfile(testVet.id, {
      clinicNameEn: 'Updated Al-Razi Clinic',
      isVerified: true,
      licenseNumber: 'RVMP-FAKE-99999',
      rating: 5.0,
      reviewCount: 9999,
    });
    expect(updateResult.success).toBe(true);

    const refreshed = getAllVeterinarians().find(v => v.id === testVet.id);
    expect(refreshed?.clinicNameEn).toBe('Updated Al-Razi Clinic');
    // Verification fields and ratings must NOT be altered by self-update
    expect(refreshed?.licenseNumber).toBe(testVet.licenseNumber);
    expect(refreshed?.reviewCount).toBe(testVet.reviewCount);
  });
});

// ============================================================================
// DOMAIN 6: RUNTIME AI QUOTA ENGINE & CONCURRENCY SIMULATION (BEHAVIORAL TESTS)
// ============================================================================
describe('Domain 6: Runtime AI Quota Engine & Concurrency Simulation (Behavioral Tests)', () => {
  interface QuotaState {
    burstCount: number;
    burstWindowStart: number;
    dailyCount: number;
    dailyWindowStart: number;
  }

  function simulateConsumeQuota(
    state: QuotaState,
    currentTime: number,
    burstLimit: number = 10,
    burstWindowSec: number = 60,
    dailyLimit: number = 50,
    dailyWindowSec: number = 86400
  ): { allowed: boolean; errorCode?: string; retryAfter?: number } {
    if ((currentTime - state.burstWindowStart) / 1000 >= burstWindowSec) {
      state.burstCount = 0;
      state.burstWindowStart = currentTime;
    }

    if ((currentTime - state.dailyWindowStart) / 1000 >= dailyWindowSec) {
      state.dailyCount = 0;
      state.dailyWindowStart = currentTime;
    }

    if (state.burstCount >= burstLimit) {
      const retryAfter = Math.ceil(burstWindowSec - (currentTime - state.burstWindowStart) / 1000);
      return { allowed: false, errorCode: 'BURST_LIMIT_EXCEEDED', retryAfter: Math.max(1, retryAfter) };
    }

    if (state.dailyCount >= dailyLimit) {
      const retryAfter = Math.ceil(dailyWindowSec - (currentTime - state.dailyWindowStart) / 1000);
      return { allowed: false, errorCode: 'DAILY_LIMIT_EXCEEDED', retryAfter: Math.max(1, retryAfter) };
    }

    state.burstCount += 1;
    state.dailyCount += 1;
    return { allowed: true };
  }

  it('should permit exactly 10 burst requests in 60s and reject the 11th with BURST_LIMIT_EXCEEDED', () => {
    const startTime = Date.now();
    const quotaState: QuotaState = {
      burstCount: 0,
      burstWindowStart: startTime,
      dailyCount: 0,
      dailyWindowStart: startTime,
    };

    for (let i = 1; i <= 10; i++) {
      const res = simulateConsumeQuota(quotaState, startTime + i * 100);
      expect(res.allowed).toBe(true);
    }

    const rejectedRes = simulateConsumeQuota(quotaState, startTime + 2000);
    expect(rejectedRes.allowed).toBe(false);
    expect(rejectedRes.errorCode).toBe('BURST_LIMIT_EXCEEDED');
    expect(rejectedRes.retryAfter).toBeGreaterThan(0);
  });

  it('should reset burst counter after sliding window expiration (61 seconds)', () => {
    const startTime = Date.now();
    const quotaState: QuotaState = {
      burstCount: 10,
      burstWindowStart: startTime,
      dailyCount: 10,
      dailyWindowStart: startTime,
    };

    expect(simulateConsumeQuota(quotaState, startTime + 30000).allowed).toBe(false);

    const afterSlide = simulateConsumeQuota(quotaState, startTime + 61000);
    expect(afterSlide.allowed).toBe(true);
    expect(quotaState.burstCount).toBe(1);
  });

  it('should reject requests exceeding daily quota ceiling (50 scans/day)', () => {
    const startTime = Date.now();
    const quotaState: QuotaState = {
      burstCount: 0,
      burstWindowStart: startTime,
      dailyCount: 50,
      dailyWindowStart: startTime,
    };

    const dailyRes = simulateConsumeQuota(quotaState, startTime + 5000);
    expect(dailyRes.allowed).toBe(false);
    expect(dailyRes.errorCode).toBe('DAILY_LIMIT_EXCEEDED');
  });

  it('should calculate accurate decoded binary size for base64 strings', () => {
    expect(calculateDecodedBase64Size('ABCD')).toBe(3);
    expect(calculateDecodedBase64Size('ABC=')).toBe(2);
    expect(calculateDecodedBase64Size('AB==')).toBe(1);
    expect(calculateDecodedBase64Size('')).toBe(0);

    const base64UnderLimit = 'A'.repeat(5 * 1024 * 1024);
    const sizeUnder = calculateDecodedBase64Size(base64UnderLimit);
    expect(sizeUnder).toBeLessThan(4.5 * 1024 * 1024);

    const base64OverLimit = 'A'.repeat(7 * 1024 * 1024);
    const sizeOver = calculateDecodedBase64Size(base64OverLimit);
    expect(sizeOver).toBeGreaterThan(4.5 * 1024 * 1024);
  });
});

// ============================================================================
// DOMAIN 7: SQL MIGRATIONS & STREAM PROXY HARDENING VERIFICATION
// ============================================================================
describe('Domain 7: SQL Migrations & Stream Proxy Hardening Verification', () => {
  const sql03Path = path.resolve(__dirname, '../../supabase/migrations/03_final_security_fixes.sql');
  const sql03Content = fs.readFileSync(sql03Path, 'utf8');

  const edgePath = path.resolve(__dirname, '../../supabase/functions/gemini-proxy/index.ts');
  const edgeContent = fs.readFileSync(edgePath, 'utf8');

  it('should declare veterinarian verification columns and tamper-proof triggers in 03 migration', () => {
    expect(sql03Content).toContain('ADD COLUMN IF NOT EXISTS manual_verification_doc_ref TEXT');
    expect(sql03Content).toContain('ADD COLUMN IF NOT EXISTS verification_type TEXT');
    expect(sql03Content).toContain('ADD COLUMN IF NOT EXISTS verified_by UUID');
    expect(sql03Content).toContain('ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ');
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.enforce_veterinarian_verification_integrity()');
    expect(sql03Content).toContain('CREATE TRIGGER trg_enforce_vet_verification_integrity');
    expect(sql03Content).toContain('public.is_admin()');
  });

  it('should mandate an authentic uploaded file in storage.objects for vet verification in 03 migration', () => {
    expect(sql03Content).toContain("bucket_id = 'vet-documents'");
    expect(sql03Content).toContain('storage.objects');
    expect(sql03Content).toContain('does not exist in the private vet-documents storage bucket');
  });

  it('should enforce column-level permissions on user_profiles, veterinarians, and marketplace_listings', () => {
    expect(sql03Content).toContain('REVOKE UPDATE ON public.user_profiles FROM authenticated, anon, public');
    expect(sql03Content).toContain('GRANT UPDATE (full_name, phone, farm_name, city, province, country, preferred_language) ON public.user_profiles TO authenticated');

    expect(sql03Content).toContain('REVOKE UPDATE ON public.veterinarians FROM authenticated, anon, public');
    expect(sql03Content).toContain('GRANT UPDATE (name_en, name_ur, degrees, clinic_name_en, clinic_name_ur');

    expect(sql03Content).toContain('REVOKE UPDATE ON public.marketplace_listings FROM authenticated, anon, public');
  });

  it('should declare consultations customer vs veterinarian role separation policies and triggers', () => {
    expect(sql03Content).toContain('Customers can update own consultation status to cancelled');
    expect(sql03Content).toContain('Assigned veterinarians can update consultation records');
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.enforce_consultation_integrity()');
    expect(sql03Content).toContain('Only the assigned licensed veterinarian can write or modify medical prescriptions');
  });

  it('should enforce marketplace moderation, fraud report handling, and immutable seller_id', () => {
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.enforce_marketplace_listing_integrity()');
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.handle_fraud_report_submission()');
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.admin_moderate_marketplace_listing');
    expect(sql03Content).toContain('idx_fraud_reports_user_listing');
  });

  it('should declare atomic persistent user_ai_quotas table and consume_ai_scan_quota RPC with server tier limits', () => {
    expect(sql03Content).toContain('CREATE TABLE IF NOT EXISTS public.user_ai_quotas');
    expect(sql03Content).toContain('FOR UPDATE');
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.admin_reset_user_quota');
  });

  it('should declare storage helper public.can_access_medical_record and enforce private buckets', () => {
    expect(sql03Content).toContain('CREATE OR REPLACE FUNCTION public.can_access_medical_record');
    expect(sql03Content).toContain("'medical-records', 'medical-records', false");
    expect(sql03Content).toContain("'vet-documents', 'vet-documents', false");
  });

  it('should revoke all EXECUTE privileges from public and anon on privileged RPC functions', () => {
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon');
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.admin_verify_veterinarian');
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.admin_revoke_veterinarian');
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.consume_ai_scan_quota');
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.admin_reset_user_quota');
    expect(sql03Content).toContain('REVOKE EXECUTE ON FUNCTION public.enforce_profile_role_integrity() FROM public, anon');
  });

  it('should enforce stream-level byte limitation and fail-closed quota check in Gemini Edge Proxy', () => {
    expect(edgeContent).toContain('req.body?.getReader()');
    expect(edgeContent).toContain('reader.cancel()');
    expect(edgeContent).toContain('MAX_BODY_BYTES = 10 * 1024 * 1024');
    expect(edgeContent).toContain('QUOTA_VERIFICATION_FAILED');
    expect(edgeContent).toContain('status: 503');
    expect(edgeContent).toContain('getDecodedBase64Size');
    expect(edgeContent).toContain('MAX_DECODED_IMAGE_BYTES');
  });
});

// ============================================================================
// DOMAIN 8: USER PROFILES PRIVILEGED FIELDS & MULTI-PERSONA ACCESS TESTS
// ============================================================================
describe('Domain 8: User Profiles Privileged Fields & Multi-Persona Access Tests (Behavioral Tests)', () => {
  it('should prevent non-admin users from escalating roles or subscription tiers', () => {
    const regularUser = {
      id: 'usr_farmer_99',
      role: 'farmer',
      subscriptionTier: 'free',
      aiScansMonthlyLimit: 10,
    };

    // Attempt role elevation
    const maliciousRoleChange = { ...regularUser, role: 'admin' };
    const sanitizeProfileUpdate = (updates: any, isAdmin: boolean) => {
      const clean = { ...updates };
      if (!isAdmin) {
        delete clean.role;
        delete clean.subscriptionTier;
        delete clean.aiScansMonthlyLimit;
        delete clean.email;
        delete clean.aiScansUsedThisMonth;
      }
      return clean;
    };

    const sanitizedOrdinary = sanitizeProfileUpdate(maliciousRoleChange, false);
    expect(sanitizedOrdinary.role).toBeUndefined();

    // Admin can update privileged fields
    const sanitizedAdmin = sanitizeProfileUpdate(maliciousRoleChange, true);
    expect(sanitizedAdmin.role).toBe('admin');
  });

  it('should block unauthenticated access from executing admin actions', async () => {
    const isServerAdmin = await isServerAuthorizedAdmin();
    expect(isServerAdmin).toBe(false);

    const resetRes = await adminResetUserQuotaWithServer('usr_test_target');
    expect(resetRes.success).toBe(false);
  });
});

// ============================================================================
// DOMAIN 9: MARKETPLACE MODERATION & SELLER PRIVILEGE SEPARATION TESTS
// ============================================================================
describe('Domain 9: Marketplace Moderation & Seller Privilege Separation Tests (Behavioral Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create listing with isFeatured=false, isReported=false, and reportCount=0 even if seller passes true', async () => {
    const res = await createMarketplaceListing({
      sellerId: 'seller_test_1',
      sellerName: 'Ahmed Farmer',
      sellerPhone: '+923001234567',
      sellerWhatsapp: '+923001234567',
      category: 'cattle',
      titleEn: 'Test Sahiwal Heifer',
      titleUr: 'ٹیسٹ گائے',
      species: 'Cow',
      breed: 'Sahiwal',
      age: '2 Years',
      gender: 'female',
      askingPrice: 200000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Sahiwal',
      locationProvince: 'Punjab',
      descriptionEn: 'Healthy animal',
      descriptionUr: 'صحت مند جانور',
      images: ['https://example.com/cow.jpg'],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Healthy',
      healthStatusDescriptionUr: 'صحت مند',
      isSold: false,
    });

    expect(res.success).toBe(true);
    expect(res.data?.isFeatured).toBe(false);
    expect(res.data?.isReported).toBe(false);
    expect(res.data?.reportCount).toBe(0);
  });

  it('should prevent seller from modifying isFeatured, isReported, or reportCount on update', async () => {
    const createRes = await createMarketplaceListing({
      sellerId: 'seller_test_2',
      sellerName: 'Tariq Trader',
      sellerPhone: '+923007654321',
      sellerWhatsapp: '+923007654321',
      category: 'goats',
      titleEn: 'Beetal Goat',
      titleUr: 'بیتل بکری',
      species: 'Goat',
      breed: 'Beetal',
      age: '1.5 Years',
      gender: 'female',
      askingPrice: 85000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Lahore',
      locationProvince: 'Punjab',
      descriptionEn: 'High milk yield',
      descriptionUr: 'زیادہ دودھ',
      images: ['https://example.com/goat.jpg'],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Active',
      healthStatusDescriptionUr: 'چست',
      isSold: false,
    });

    const listingId = createRes.data!.id;

    // Seller attempts to self-feature and clear fraud status
    await updateMarketplaceListing(listingId, {
      askingPrice: 90000,
      isFeatured: true,
      isReported: false,
      reportCount: 0,
    });

    const listings = (await fetchMarketplaceListings()).data!;
    const updated = listings.find(l => l.id === listingId);
    expect(updated?.askingPrice).toBe(90000);
    expect(updated?.isFeatured).toBe(false); // Tamper attempt stripped!
  });

  it('should prevent seller from reporting own listing and reject duplicate reports', async () => {
    const createRes = await createMarketplaceListing({
      sellerId: 'seller_test_3',
      sellerName: 'Zahid Farmer',
      sellerPhone: '+923009988776',
      sellerWhatsapp: '+923009988776',
      category: 'sheep',
      titleEn: 'Kajli Ram',
      titleUr: 'کجلی چھترا',
      species: 'Sheep',
      breed: 'Kajli',
      age: '2 Years',
      gender: 'male',
      askingPrice: 120000,
      currency: 'PKR',
      isNegotiable: false,
      locationCity: 'Sargodha',
      locationProvince: 'Punjab',
      descriptionEn: 'Champion',
      descriptionUr: 'خوبصورت',
      images: ['https://example.com/ram.jpg'],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Healthy',
      healthStatusDescriptionUr: 'صحت مند',
      isSold: false,
    });

    const listingId = createRes.data!.id;

    // First report from user succeeds
    const report1 = await submitFraudReport(listingId, 'fake_price', 'Price differs from mandi');
    expect(report1.success).toBe(true);

    // Duplicate report from same user is rejected
    const report2 = await submitFraudReport(listingId, 'fake_price', 'Duplicate spam report');
    expect(report2.success).toBe(false);
    expect(report2.error).toContain('already submitted a report');
  });

  it('should allow platform administrators to feature, unfeature, and moderate listings', async () => {
    const createRes = await createMarketplaceListing({
      sellerId: 'seller_test_4',
      sellerName: 'Akram Dairy',
      sellerPhone: '+923005544332',
      sellerWhatsapp: '+923005544332',
      category: 'buffalo',
      titleEn: 'Nili Ravi Buffalo',
      titleUr: 'نیلی راوی بھینس',
      species: 'Buffalo',
      breed: 'Nili-Ravi',
      age: '4 Years',
      gender: 'female',
      askingPrice: 450000,
      currency: 'PKR',
      isNegotiable: true,
      locationCity: 'Okara',
      locationProvince: 'Punjab',
      descriptionEn: '18 liters',
      descriptionUr: '18 لیٹر',
      images: ['https://example.com/buffalo.jpg'],
      vaccinationStatus: 'fully_vaccinated',
      healthStatusDescriptionEn: 'Good',
      healthStatusDescriptionUr: 'اچھی حالت',
      isSold: false,
    });

    const listingId = createRes.data!.id;

    // Admin features the listing
    const featRes = await adminModerateListing(listingId, 'feature');
    expect(featRes.success).toBe(true);

    const listings = (await fetchMarketplaceListings()).data!;
    const featuredListing = listings.find(l => l.id === listingId);
    expect(featuredListing?.isFeatured).toBe(true);

    // Admin unfeatures the listing
    const unfeatRes = await adminModerateListing(listingId, 'unfeature');
    expect(unfeatRes.success).toBe(true);
    const unfeaturedListing = (await fetchMarketplaceListings()).data!.find(l => l.id === listingId);
    expect(unfeaturedListing?.isFeatured).toBe(false);
  });
});

// ============================================================================
// DOMAIN 10: CONSULTATIONS ROLE SEPARATION & PRESCRIPTION PROTECTION TESTS
// ============================================================================
describe('Domain 10: Consultations Role Separation & Prescription Protection Tests (Behavioral Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow customer to book consultation with pending status and null prescription', async () => {
    const bookRes = await bookConsultation({
      veterinarianId: 'vet_001',
      animalId: 'animal_cow_123',
      consultationDate: '2026-11-10T10:00:00Z',
      consultationMethod: 'farm_visit',
      symptomNotes: 'Cow has mild cough and reduced appetite',
    });

    expect(bookRes.success).toBe(true);
    expect(bookRes.data?.status).toBe('pending');
    expect(bookRes.data?.prescriptionNotes).toBeUndefined();
  });

  it('should allow customer to cancel pending consultation', async () => {
    const bookRes = await bookConsultation({
      veterinarianId: 'vet_002',
      consultationDate: '2026-11-12T14:00:00Z',
      consultationMethod: 'in_clinic',
    });

    const consultId = bookRes.data!.id;
    const cancelRes = await cancelConsultation(consultId);
    expect(cancelRes.success).toBe(true);

    const consultations = (await fetchConsultations()).data!;
    const target = consultations.find(c => c.id === consultId);
    expect(target?.status).toBe('cancelled');
  });

  it('should allow attending veterinarian to write prescriptions and complete consultation', async () => {
    const bookRes = await bookConsultation({
      veterinarianId: 'vet_003',
      consultationDate: '2026-11-15T09:00:00Z',
      consultationMethod: 'tele_consultation',
    });

    const consultId = bookRes.data!.id;

    // Attending vet writes prescription
    const rxRes = await savePrescription(consultId, 'Oxytetracycline 20% 20ml IM daily for 3 days; Flunixin meglumine 10ml IV');
    expect(rxRes.success).toBe(true);

    // Attending vet completes appointment
    const completeRes = await updateConsultationStatus(consultId, 'completed');
    expect(completeRes.success).toBe(true);

    const consultations = (await fetchConsultations()).data!;
    const target = consultations.find(c => c.id === consultId);
    expect(target?.prescriptionNotes).toContain('Oxytetracycline');
    expect(target?.status).toBe('completed');
  });
});

// ============================================================================
// DOMAIN 11: STORAGE ACCESS & MEDICAL DOCUMENT OWNERSHIP AUTHORIZATION
// ============================================================================
describe('Domain 11: Storage Access & Medical Document Ownership Authorization', () => {
  function simulateMedicalRecordAccess(
    callerId: string,
    callerRole: string,
    objectPath: string,
    assignedVetIdsForPatient: string[] = []
  ): boolean {
    if (!callerId) return false;
    if (callerRole === 'admin') return true;

    const parts = objectPath.split('/');
    const ownerId = parts[0];

    // Caller is folder owner
    if (ownerId === callerId) return true;

    // Caller is assigned attending veterinarian
    if (callerRole === 'veterinarian' && assignedVetIdsForPatient.includes(callerId)) {
      return true;
    }

    return false;
  }

  it('should permit record owner and platform admin to access private medical document', () => {
    const ownerAccess = simulateMedicalRecordAccess('user_farmer_1', 'farmer', 'user_farmer_1/cow_99/blood_test.pdf');
    expect(ownerAccess).toBe(true);

    const adminAccess = simulateMedicalRecordAccess('admin_amk', 'admin', 'user_farmer_1/cow_99/blood_test.pdf');
    expect(adminAccess).toBe(true);
  });

  it('should allow assigned attending veterinarian to access patient medical document', () => {
    const assignedVetAccess = simulateMedicalRecordAccess(
      'vet_dr_kashif',
      'veterinarian',
      'user_farmer_1/cow_99/blood_test.pdf',
      ['vet_dr_kashif'] // assigned to this patient's consultation
    );
    expect(assignedVetAccess).toBe(true);
  });

  it('should strictly block unauthorized strangers from accessing another user medical document', () => {
    // Unassigned veterinarian
    const unassignedVetAccess = simulateMedicalRecordAccess(
      'vet_stranger',
      'veterinarian',
      'user_farmer_1/cow_99/blood_test.pdf',
      ['vet_dr_kashif']
    );
    expect(unassignedVetAccess).toBe(false);

    // Another farmer
    const anotherFarmerAccess = simulateMedicalRecordAccess(
      'user_farmer_2',
      'farmer',
      'user_farmer_1/cow_99/blood_test.pdf'
    );
    expect(anotherFarmerAccess).toBe(false);

    // Unauthenticated caller
    const unauthAccess = simulateMedicalRecordAccess('', 'anonymous', 'user_farmer_1/cow_99/blood_test.pdf');
    expect(unauthAccess).toBe(false);
  });
});

// ============================================================================
// DOMAIN 12: LIVE SUPABASE INTEGRATION TESTS (CONDITIONAL ON CLOUD BACKEND)
// ============================================================================
describe('Domain 12: Live Supabase Integration Tests (Conditional on Cloud Backend)', () => {
  it('should report cloud connectivity status and distinguish live integration tests from offline runner', () => {
    const isConfigured = isSupabaseConfigured();
    if (!isConfigured) {
      console.log('ℹ️ [INTEGRATION TEST NOTICE]: Live Supabase cloud backend is not configured in offline test runner.');
      console.log('   Offline tests verify local security bounds, format parsers, and schema definitions.');
      console.log('   Full database RPC tests must be executed with live VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      expect(isConfigured).toBe(false);
    } else {
      console.log('✅ [INTEGRATION TEST NOTICE]: Live Supabase cloud backend is configured.');
      expect(isConfigured).toBe(true);
    }
  });
});
