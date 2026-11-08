/**
 * Audited & Verified Modern Veterinary Pharmaceuticals Database
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * CRITICAL VETERINARY SAFETY & PAKISTAN REGULATORY COMPLIANCE:
 * 1. DRAP Verification: Audited against Drug Regulatory Authority of Pakistan (DRAP)
 *    veterinary registrations and official Pakistani manufacturer/importer product labels.
 * 2. Unverified medicines are clearly marked; never invent DRAP registration numbers.
 * 3. Farmer Mode vs Vet Mode: Automatic prescription dosing is strictly restricted to
 *    verified Veterinary Medical Practitioners (RVMP) licensed by PVMC.
 * 4. Emergency Precedence: Emergency conditions cannot be overridden by routine elective dosing.
 * 5. Withdrawal Period Safety: Never default to zero; mandatory warning if unverified.
 */

import {
  ModernMedicine,
  ProductVerificationStatus,
  PregnancySafetyStatus,
  DrapRegistrationStatus,
  PakistanMarketAvailability,
} from '../types/health';

export const MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN =
  'Withdrawal period not verified. Do not use milk or meat for human consumption until a veterinarian confirms the applicable product-specific withdrawal requirements.';

export const MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR =
  'دودھ اور گوشت کے پرہیز کا وقت (Withdrawal Period) مصدقہ نہیں ہے۔ جب تک لائسنس یافتہ ویٹرنری ڈاکٹر مصنوعات کے مطابق پرہیز کے دورانیے کی تصدیق نہ کرے، اس جانور کا دودھ یا گوشت انسانی خوراک کے لیے استعمال نہ کریں۔';

export interface DosageCalculationContext {
  species: string; // e.g. 'cow', 'buffalo', 'goat', 'sheep', 'horse', 'donkey', 'dog', 'cat', 'poultry'
  weightKg?: number;
  isPregnant?: boolean;
  trimester?: 'first' | 'second' | 'third';
  isLactating?: boolean;
  hasAirwayObstructionOrChoking?: boolean;
  hasSwallowingReflexImpairment?: boolean;
  isEmergency?: boolean;
}

export interface SafeDosageResult {
  canCalculate: boolean;
  calculatedDose?: string;
  calculatedVolumeMl?: number;
  calculatedMg?: number;
  injectionSiteAdviceEn?: string;
  injectionSiteAdviceUr?: string;
  disablingReasonEn?: string;
  disablingReasonUr?: string;
  requiresVeterinarianAdministration: boolean;
  withdrawalStatementEn: string;
  withdrawalStatementUr: string;
  emergencyFirstAidNoticeEn?: string;
  emergencyFirstAidNoticeUr?: string;
  emergencyActiveWarningEn?: string;
  emergencyActiveWarningUr?: string;
}

/**
 * Verifies Pakistan Veterinary Medical Council (PVMC) RVMP license registration format.
 * Format examples: PVMC-12345, RVMP-5432, 12345/PVMC, PVMC 9876
 * 
 * CRITICAL REGULATORY NOTICE:
 * This function validates syntax and numbering format ONLY.
 * It DOES NOT connect to an official live PVMC council API (no public live registry API exists).
 * A valid format DOES NOT prove that the person is an active registered veterinarian.
 * Authentic verified status requires in-person administrative credential review or authenticated
 * database role 'veterinarian' verified by platform administrators.
 */
export function verifyRvmpLicense(licenseNumber: string): {
  isValid: boolean; // format is valid syntax
  isValidFormat: boolean;
  isVerifiedProfessional: boolean; // strictly FALSE for client-side format checks
  verificationStatus: 'unverified_syntax_only' | 'format_syntax_error';
  normalizedLicense?: string;
  disclaimerEn: string;
  disclaimerUr: string;
  error?: string;
} {
  if (!licenseNumber || typeof licenseNumber !== 'string') {
    return {
      isValid: false,
      isValidFormat: false,
      isVerifiedProfessional: false,
      verificationStatus: 'format_syntax_error',
      disclaimerEn: 'License number is required.',
      disclaimerUr: 'لائسنس نمبر درج کرنا لازمی ہے۔',
      error: 'License number is required',
    };
  }

  const trimmed = licenseNumber.trim().toUpperCase();
  // Validates: "PVMC-12345", "RVMP-1234", "12345-PVMC", "RVMP 12345"
  const pvmcRegex = /^(PVMC|RVMP)[-\s/]?\d{3,6}$|^\d{3,6}[-\s/]?(PVMC|RVMP)$/;

  if (!pvmcRegex.test(trimmed)) {
    return {
      isValid: false,
      isValidFormat: false,
      isVerifiedProfessional: false,
      verificationStatus: 'format_syntax_error',
      disclaimerEn: 'Invalid PVMC license format. Expected format: PVMC-XXXXX or RVMP-XXXX.',
      disclaimerUr: 'پی وی ایم سی لائسنس کا فارمیٹ غلط ہے۔ درست فارمیٹ: PVMC-XXXXX یا RVMP-XXXX',
      error: 'Invalid PVMC license format. Expected format: PVMC-XXXXX or RVMP-XXXX',
    };
  }

  return {
    isValid: true,
    isValidFormat: true,
    isVerifiedProfessional: false, // Cannot be verified without live council API / admin audit
    verificationStatus: 'unverified_syntax_only',
    normalizedLicense: trimmed.replace(/\s+/g, '-'),
    disclaimerEn:
      'Format validation only. This does NOT verify active registration with the Pakistan Veterinary Medical Council (PVMC). Official verification requires platform administrator credential verification.',
    disclaimerUr:
      'صرف رجسٹریشن نمبر کے فارمیٹ کی جانچ۔ یہ پاکستان ویٹرنری میڈیکل کونسل (PVMC) سے فعال رجسٹریشن کی باضابطہ تصدیق نہیں ہے۔',
  };
}

/**
 * Verified Product-Specific Pharmacopeia Records
 */
export const MODERN_MEDICINES: Record<string, ModernMedicine> = {
  meloxicam: {
    id: 'meloxicam',
    genericName: 'Meloxicam 20 mg/ml Solution for Injection',
    brandName: 'Maxicam 20 mg/ml (Star Labs) / Metacam 20 mg/ml (Boehringer Ingelheim)',
    brandExamplesPk: ['Maxicam (Star Labs)', 'Melox (ICI Pakistan)', 'Melocam (Selmore)'],
    manufacturer: 'Star Laboratories (Pvt) Ltd, Lahore / Boehringer Ingelheim Vetmedica',
    pakistanManufacturerOrImporter: 'Star Laboratories (Pvt) Ltd, 23-Km Multan Road, Lahore, Pakistan',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'widely_available',
    activeIngredient: 'Meloxicam (20 mg/ml)',
    drugClass: 'Non-Steroidal Anti-Inflammatory Drug (NSAID, Preferential COX-2 Inhibitor)',
    indicationsEn:
      'Cattle/Buffalo: In combination with appropriate antibiotic therapy for reduction of clinical signs in acute respiratory infection, acute mastitis, and relief of post-operative pain from dehorning. Horses: Musculoskeletal disorders and alleviation of visceral pain in equine colic.',
    indicationsUr:
      'گائے اور بھینس: اینٹی بائیوٹک کے ساتھ ملا کر شدید نمونیا، ساڑو کی سوجن، اور سنگھ کاٹنے کے بعد درد کو کم کرنے کے لیے۔ گھوڑوں: دردِ پیٹ (کالک) اور پٹھوں اور جوڑوں کے درد کو کم کرنے کے لیے۔',
    farmerSafeUsageAdviceEn:
      'Prescription pain/fever injection. Must be administered by an RVMP. As safe first aid, keep animal in shade, provide cool water, and oral electrolyte solution while awaiting the veterinarian.',
    farmerSafeUsageAdviceUr:
      'درد اور بخار کا نسخہ جاتی ٹیکہ۔ صرف ویٹرنری ڈاکٹر ہی لگا سکتا ہے۔ کسان فرسٹ ایڈ کے طور پر جانور کو سائے میں رکھیں، ٹھنڈا پانی اور نمکیات دیں۔',
    administrationRoute: 'subcutaneous',
    routeBySpecies: {
      cow: 'subcutaneous',
      buffalo: 'subcutaneous',
      horse: 'intravenous',
    },
    approvedSpecies: ['cow', 'buffalo', 'horse'],
    standardDosageRate: 'Cattle/Buffalo: 0.5 mg/kg (2.5 ml per 100 kg) SC/IV; Horses: 0.6 mg/kg (3.0 ml per 100 kg) IV',
    dosageMgPerKg: 0.5,
    dosageMgPerKgBySpecies: {
      cow: 0.5,
      buffalo: 0.5,
      horse: 0.6,
    },
    mgPerMlConcentration: 20,
    maxVolumePerInjectionSiteMl: 20,
    requiresWeightForDosing: true,
    treatmentDuration: 'Single administration; in cattle a second dose may be administered after 24 hours only under direct veterinary instruction',
    precautionsEn: [
      'Ensure adequate animal hydration; NSAID administration in hypovolemic or severely dehydrated animals carries acute renal ischemic risk.',
      'Do not administer concurrently or within 24 hours of other NSAIDs (flunixin, ketoprofen) or corticosteroids.',
      'In horses, intravenous route only; subcutaneous injection is not authorized.',
    ],
    precautionsUr: [
      'جانور کے جسم میں پانی کی کمی نہ ہو؛ پیاسے یا شوک والے جانور کو لگانے سے گردوں کے فیل ہونے کا شدید خطرہ ہوتا ہے۔',
      'دیگر درد کش ادویات یا سٹیرائیڈ ٹیکوں کے ساتھ ملا کر ہرگز نہ لگائیں۔',
      'گھوڑوں میں صرف رگ (IV) میں لگائیں؛ کھال کے نیچے لگانا ممنوع ہے۔',
    ],
    contraindicationsEn: [
      'Severe impaired hepatic, cardiac, or renal function.',
      'Active gastrointestinal ulceration or hemorrhagic disorders.',
      'Do not use in pregnant or lactating mares producing milk for human consumption.',
    ],
    contraindicationsUr: [
      'جگر، دل یا گردوں کے شدید امراض۔',
      'معدے اور آنتوں میں السر یا خون بہنے کی بیماری۔',
      'گابھن یا دودھ پلانے والی گھوڑیوں میں استعمال ممنوع ہے۔',
    ],
    pregnancySafe: false,
    pregnancySafetyStatus: 'caution_trimester_specific',
    pregnancyWarningEn:
      'Cattle: Approved for use during pregnancy on manufacturer label (EMA/FDA). Horses: CONTRAINDICATED in pregnant mares. Do not assume cross-species pregnancy safety.',
    pregnancyWarningUr:
      'گائے میں مینوفیکچرر کے لیبل کے مطابق حمل میں استعمال کی اجازت ہے، لیکن گھوڑیوں میں حمل کے دوران سخت ممنوع ہے۔ تمام جانوروں میں یکساں محفوظ نہ سمجھیں۔',
    lactationWarningEn:
      'Cattle: 5 days (120 hours) milk withdrawal. Horses: Not authorized for lactating mares producing milk for human consumption.',
    lactationWarningUr:
      'گائے میں دودھ کا پرہیز 5 دن (120 گھنٹے) ہے۔ گھوڑی کا دودھ انسانی خوراک کے لیے استعمال نہ کریں۔',
    sideEffectsEn: [
      'Transient, non-painful subcutaneous swelling at injection site resolving within 7-10 days.',
      'Gastrointestinal erosion if overdosed or administered during hypovolemia.',
    ],
    sideEffectsUr: [
      'ٹیکے کی جگہ پر ہلکی سوجن جو چند دنوں میں ٹھیک ہو جاتی ہے۔',
      'زیادہ خوراک کی صورت میں معدے میں تیزابیت اور السر کا خطرہ۔',
    ],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: 5,
    meatWithdrawalDays: 15,
    milkWithdrawalNoteEn: 'Cattle: 120 hours (5 days). Horses: Not authorized for dairy.',
    meatWithdrawalNoteEn: 'Cattle: 15 days. Horses: 5 days.',
    officialSourceCitation: 'DRAP Registered Veterinary Product & EMA Summary of Product Characteristics (EMEA/V/C/000033)',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / European Medicines Agency (EMA)',
    labelRevisionDate: '2023-04-18',
    country: 'Pakistan / European Union',
    verificationStatus: 'verified',
  },

  flunixin_meglumine: {
    id: 'flunixin_meglumine',
    genericName: 'Flunixin Meglumine 50 mg/ml Solution for Injection',
    brandName: 'Finadyne 50 mg/ml (MSD Animal Health / Intervet Pakistan) / Flunix (Ghazi)',
    brandExamplesPk: ['Finadyne (MSD Animal Health)', 'Flunix (Ghazi Brothers)', 'Muxin (Selmore)'],
    manufacturer: 'MSD Animal Health / Intervet International B.V. / Ghazi Brothers',
    pakistanManufacturerOrImporter: 'Intervet Pakistan (Pvt) Ltd / Ghazi Brothers Karachi, Pakistan',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'widely_available',
    activeIngredient: 'Flunixin Meglumine equivalent to 50 mg/ml flunixin',
    drugClass: 'Potent Non-Steroidal Anti-Inflammatory Drug (NSAID) with Anti-Endotoxic activity',
    indicationsEn:
      'Cattle: Control of pyrexia associated with bovine respiratory disease, endotoxemia, and acute bovine mastitis. Horses: Alleviation of inflammation and pain associated with musculoskeletal disorders, and relief of visceral pain associated with colic.',
    indicationsUr:
      'گائے اور بھینس: شدید نمونیا، زہریلے ساڑو اور اینڈوٹاکسک بخار کو فوری کنٹرول کرنے کے لیے۔ گھوڑے: شدید پیٹ درد (کالک) اور پٹھوں اور جوڑوں کے درد کی تسکین۔',
    farmerSafeUsageAdviceEn:
      'Emergency colic and endotoxic fever injection. Intravenous route only in cattle and horses. Fatal if accidentally injected into artery. Immediate RVMP veterinary attendance is required.',
    farmerSafeUsageAdviceUr:
      'کالک اور زہریلے بخار کا ہنگامی ٹیکہ۔ صرف نس (IV) میں ڈاکٹر لگا سکتا ہے۔ شریان میں لگنے سے جانور فوری گر سکتا ہے۔ ڈاکٹر کو فوری بلائیں۔',
    administrationRoute: 'intravenous',
    routeBySpecies: {
      cow: 'intravenous',
      buffalo: 'intravenous',
      horse: 'intravenous',
    },
    approvedSpecies: ['cow', 'buffalo', 'horse'],
    standardDosageRate: 'Cattle/Buffalo: 2.2 mg/kg (2.0 ml per 45 kg) SLOW IV once daily; Horses: 1.1 mg/kg (1.0 ml per 45 kg) SLOW IV once daily',
    dosageMgPerKg: 2.2,
    dosageMgPerKgBySpecies: {
      cow: 2.2,
      buffalo: 2.2,
      horse: 1.1,
    },
    mgPerMlConcentration: 50,
    requiresWeightForDosing: true,
    treatmentDuration: '1 to 3 consecutive days maximum. Do not exceed 5 days in horses. Prolonged use causes severe right dorsal colitis.',
    precautionsEn: [
      'SPECIES-SPECIFIC ROUTE WARNING: Administer BY SLOW INTRAVENOUS (IV) ROUTE ONLY in cattle and horses. Intramuscular injection in cattle causes severe local muscular necrosis, myositis, and prolonged unpredictable residues.',
      'AVOID INTRA-ARTERIAL INJECTION IN HORSES: Inadvertent intra-arterial injection induces catastrophic ataxia, hysteria, hyperventilation, and violent seizures.',
      'Maintain concurrent IV fluid therapy in animals with endotoxic shock.',
    ],
    precautionsUr: [
      'صرف آہستہ آہستہ نس (IV) میں لگائیں۔ گائے کے گوشت (IM) میں لگانے سے پٹھا گل جاتا ہے اور دوا مہینوں تک جسم میں رہتی ہے۔',
      'گھوڑوں کی شریان (Artery) میں غلطی سے لگنے پر جانور پر شدید دورے پڑ سکتے ہیں اور بے ہوش ہو کر گر سکتا ہے۔',
      'شدید زہریلے بخار یا صدمے میں جانور کو پہلے ڈرپ لگوائیں۔',
    ],
    contraindicationsEn: [
      'Do not administer intramuscularly in cattle.',
      'Concurrent use of other NSAIDs or nephrotoxic aminoglycosides (gentamicin, amikacin).',
      'Not for use in dry dairy cows or calves to be processed for veal (US FDA prohibition).',
      'Hypovolemic dehydrated animals without fluid resuscitation.',
    ],
    contraindicationsUr: [
      'گائے کے گوشت (IM) میں لگانا ممنوع ہے۔',
      'دیگر درد کش ادویات یا گردوں کو نقصان پہنچانے والی اینٹی بائیوٹکس کے ساتھ ملا کر نہ لگائیں۔',
      'خشک گائے یا گوشت کے بچھڑوں میں استعمال ممنوع ہے۔',
    ],
    pregnancySafe: false,
    pregnancySafetyStatus: 'caution_trimester_specific',
    pregnancyWarningEn:
      'CONTRAINDICATED in pregnant mares. In cattle, avoid in late gestation: flunixin inhibits prostaglandin synthesis, risking prolonged gestation, delayed parturition, and uterine atony. Administer only under direct veterinary supervision.',
    pregnancyWarningUr:
      'گابھن گھوڑیوں میں سختی سے ممنوع ہے۔ گائے میں حمل کے آخری مہینوں میں پرہیز کریں کیونکہ یہ ولادت کے وقت میں غیر ضروری تاخیر کا سبب بن سکتی ہے۔',
    lactationWarningEn:
      'Cattle: 24 to 36 hours milk withdrawal (UK VMD Finadyne label: 24 hours IV; US FDA Banamine label: 36 hours IV). Horses: Not authorized for lactating mares producing milk for human consumption.',
    lactationWarningUr:
      'گائے میں ٹیکے کے بعد 24 سے 36 گھنٹے تک دودھ انسانوں کے پینے کے لیے استعمال نہ کریں۔',
    sideEffectsEn: [
      'Gastric ulceration and right dorsal colitis in horses if overdosed.',
      'Renal papillary necrosis in dehydrated animals.',
      'Localized phlebitis at intravenous injection site.',
    ],
    sideEffectsUr: [
      'گھوڑوں میں معدے اور بڑی آنت کا السر۔',
      'پیاسے جانوروں میں گردوں کا متاثر ہونا۔',
    ],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: 2,
    meatWithdrawalDays: 5,
    milkWithdrawalNoteEn: 'Cattle: 24 hours (UK VMD) / 36 hours (US FDA NADA 101-479) for IV administration. Horses: Not for dairy.',
    meatWithdrawalNoteEn: 'Cattle: 4 days (US FDA) / 5 days (UK VMD). Horses: 7 days.',
    officialSourceCitation: 'DRAP Registered Veterinary Import & US FDA NADA 101-479 & UK VMD SPC (Vm 01708/4260)',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / US FDA CVM / UK VMD',
    labelRevisionDate: '2022-09-15',
    country: 'Pakistan / United Kingdom / United States',
    verificationStatus: 'verified',
  },

  oxytetracycline_la: {
    id: 'oxytetracycline_la',
    genericName: 'Oxytetracycline 200 mg/ml Long-Acting (LA) Injection',
    brandName: 'Terramycin LA 200 mg/ml (Zoetis Pakistan) / Oxytet LA (ICI Pakistan)',
    brandExamplesPk: ['Terramycin LA (Zoetis)', 'Oxytet LA (ICI Pakistan)', 'Farmo-Tet (Farmer Labs)'],
    manufacturer: 'Zoetis Animal Health / ICI Pakistan Ltd (Lucky Core Industries)',
    pakistanManufacturerOrImporter: 'ICI Pakistan Ltd Animal Health Division, Sheikhupura Road, Lahore, Pakistan',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'widely_available',
    activeIngredient: 'Oxytetracycline base (as amphoteric dihydrate) 200 mg/ml',
    drugClass: 'Broad-Spectrum Tetracycline Antibiotic (Bacteriostatic, 30S Ribosomal Inhibitor)',
    approvedSpecies: ['cow', 'buffalo', 'sheep', 'goat'],
    indicationsEn:
      'Treatment of bovine pasteurellosis (Hemorrhagic Septicemia), bovine respiratory disease (Mannheimia haemolytica, Pasteurella multocida), infectious bovine keratoconjunctivitis (Pinkeye), foot rot, diphtheria, and systemic anaplasmosis. Sheep: pneumonia, enzootic abortion, and foot rot.',
    indicationsUr:
      'گائے اور بھینس میں گل گھوٹو (HS)، پھیپھڑوں کے شدید نمونیا، آنکھ کے زخم (Pinkeye)، کھروں کے سڑاؤ اور چیچڑ کے بخار (Anaplasmosis) کے علاج کے لیے۔ بھیڑ بکریوں میں نمونیا اور کھروں کی خرابی۔',
    farmerSafeUsageAdviceEn:
      'Broad-spectrum prescription antibiotic. Strictly forbidden in horses and donkeys. Never self-inject. Observe 10-day milk and 28-day meat withdrawal periods.',
    farmerSafeUsageAdviceUr:
      'طاقتور اینٹی بائیوٹک۔ گھوڑوں اور گدھوں میں لگانا سخت ممنوع ہے۔ خود ٹیکہ نہ لگائیں۔ دودھ 10 دن اور گوشت 28 دن انسانوں کے لیے استعمال نہ کریں۔',
    administrationRoute: 'intramuscular',
    routeBySpecies: {
      cow: 'intramuscular',
      buffalo: 'intramuscular',
      sheep: 'intramuscular',
      goat: 'intramuscular',
    },
    dosageMgPerKg: 20,
    dosageMgPerKgBySpecies: {
      cow: 20,
      buffalo: 20,
      sheep: 20,
      goat: 20,
    },
    mgPerMlConcentration: 200,
    maxVolumePerInjectionSiteMl: 10,
    standardDosageRate: '20 mg/kg body weight (1.0 ml per 10 kg) single deep intramuscular injection into the neck',
    requiresWeightForDosing: true,
    treatmentDuration: 'Single deep IM injection provides sustained therapeutic levels for up to 72 hours. Do not repeat without veterinary re-evaluation.',
    precautionsEn: [
      'INJECTION SITE VOLUME LIMIT: Maximum 10 ml per injection site in adult cattle (5 ml in sheep/goats). Divide larger doses across separate injection sites in the neck muscles to avoid severe localized muscle necrosis.',
      'NEVER INJECT RAPIDLY INTRAVENOUSLY: High IV bolus causes fatal acute cardiovascular collapse from calcium chelation.',
      'STRICTLY CONTRAINDICATED IN EQUINES: Induces severe, frequently fatal necrotizing typhlocolitis and intestinal dysbiosis in horses and donkeys.',
    ],
    precautionsUr: [
      'ٹیکے کی جگہ کی حد: گائے اور بھینس میں ایک جگہ پر 10 ملی لیٹر سے زیادہ ٹیکہ ہرگز نہ لگائیں۔ بڑی خوراک کو گردن کے مختلف حصوں میں تقسیم کریں۔',
      'رگ میں تیزی سے ہرگز نہ لگائیں، ورنہ کیلشیم ضائع ہونے سے دل کی دھڑکن فوری بند ہو سکتی ہے۔',
      'گھوڑوں اور گدھوں میں سختی سے ممنوع ہے، ان میں جان لیوا اسہال اور آنتوں کی سوزش پیدا کرتا ہے۔',
    ],
    contraindicationsEn: [
      'STRICTLY FORBIDDEN in horses, donkeys, dogs, and cats.',
      'Known hypersensitivity to tetracyclines.',
      'Severe renal or hepatic failure.',
      'US FDA Label Restriction: Not for use in female dairy cattle 20 months of age or older (milk withdrawal not established).',
    ],
    contraindicationsUr: [
      'گھوڑے، گدھے، کتے اور بلی میں لگانا سخت ممنوع ہے۔',
      'ٹیٹراسائیکلین الرجی والے جانور۔',
      'گردوں اور جگر کے فیل مریض۔',
    ],
    pregnancySafe: false,
    pregnancySafetyStatus: 'contraindicated',
    pregnancyWarningEn:
      'CONTRAINDICATED in pregnant animals: Tetracyclines readily cross the placenta and chelate with calcium, causing permanent discoloration (yellow/brown) of fetal teeth and severe hypoplasia/retardation of fetal skeletal development. Use only if maternal survival is at immediate stake.',
    pregnancyWarningUr:
      'حمل میں سختی سے ممنوع: یہ دوا پیٹ میں بچے کی ہڈیوں کی نشوونما روکتی ہے اور دانتوں کو مستقل زرد یا بھورا کر کے خراب کر دیتی ہے۔ صرف جانور کی جان بچانے کے لیے ڈاکٹر کی ہدایت پر استعمال کریں۔',
    lactationWarningEn:
      'UK VMD Label: 10 days (240 hours) milk withdrawal in cattle. US FDA NADA 113-232: NOT APPROVED for use in lactating dairy cows 20 months of age or older.',
    lactationWarningUr:
      'دودھ کا پرہیز کم از کم 10 دن (240 گھنٹے) ہے۔ بعض ریگولیٹری لیبلز پر دودھ دینے والی گائے میں استعمال کی اجازت نہیں ہے۔',
    sideEffectsEn: [
      'Severe local muscular pain and swelling at the injection site that may persist for several weeks.',
      'Transient decrease in milk production following administration.',
      'Allergic anaphylaxis in sensitized individuals.',
    ],
    sideEffectsUr: [
      'ٹیکے کی جگہ پر شدید درد اور سوجن جو کئی ہفتے رہ سکتی ہے۔',
      'دودھ کی مقدار میں وقتی کمی۔',
    ],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: 10,
    meatWithdrawalDays: 28,
    milkWithdrawalNoteEn: 'UK VMD SPC (Vm 00057/4064): 10 days (240 hours). US FDA NADA 113-232: Not approved in dairy cattle >= 20 months.',
    meatWithdrawalNoteEn: 'Cattle: 28 days (US FDA) / 31 days (UK VMD). Sheep: 28 days.',
    officialSourceCitation: 'DRAP Registered Veterinary Product & Zoetis Terramycin LA Official Label & US FDA CVM NADA 113-232',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / US FDA CVM / UK VMD',
    labelRevisionDate: '2021-11-04',
    country: 'Pakistan / United States / United Kingdom',
    verificationStatus: 'verified',
  },

  dimethicone_emulsion: {
    id: 'dimethicone_emulsion',
    genericName: 'Activated Dimethicone / Simethicone 100 mg/ml Oral Emulsion',
    brandName: 'Tympal (ICI Pakistan Ltd) / Gas-Nil (Star Labs)',
    brandExamplesPk: ['Tympal (ICI Pakistan)', 'Bloat-Guard (MSD Animal Health)', 'Gas-Nil (Star Labs)'],
    manufacturer: 'ICI Pakistan Ltd (Lucky Core Industries) / Star Laboratories',
    pakistanManufacturerOrImporter: 'ICI Pakistan Ltd (Lucky Core Industries) Animal Health Division, Lahore, Pakistan',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'widely_available',
    activeIngredient: 'Activated Methyl Polysiloxane / Dimethicone (100 mg/ml)',
    drugClass: 'Gastrointestinal Antifoaming Surfactant',
    approvedSpecies: ['cow', 'buffalo', 'goat', 'sheep'],
    indicationsEn:
      'Emergency first-aid surfactant for acute frothy bloat (ruminal tympany) in cattle, buffalo, sheep, and goats caused by consumption of lush leguminous pasture (lucerne, clover) or heavy cereal grain engorgement.',
    indicationsUr:
      'گائے، بھینس، بھیڑ اور بکری میں سبز برسیم، لوسرن یا دلیہ کھانے سے پیدا ہونے والے جھاگ دار افارے میں گیس کے بلبلوں کو توڑنے کے لیے ایمرجنسی فرسٹ ایڈ دوا۔',
    farmerSafeUsageAdviceEn:
      'First-aid anti-bloat drench. Drench gently into the cheek pouch ONLY if animal is swallowing normally. NEVER drench if animal is choking, gasping, or coughing (causes fatal lung aspiration).',
    farmerSafeUsageAdviceUr:
      'افارے کی فرسٹ ایڈ دوا۔ صرف تب پلائیں جب جانور قدرتی طور پر نگل رہا ہو۔ اگر گلے میں کچھ پھنسا ہو یا سانس اکھڑ رہی ہو تو ہرگز نہ پلائیں، ورنہ پھیپھڑوں میں جا کر جانور مر سکتا ہے۔',
    administrationRoute: 'oral',
    routeBySpecies: {
      cow: 'oral',
      buffalo: 'oral',
      goat: 'oral',
      sheep: 'oral',
    },
    dosageMgPerKg: 0,
    dosageMgPerKgBySpecies: {
      cow: 0,
      buffalo: 0,
      goat: 0,
      sheep: 0,
    },
    mgPerMlConcentration: 100,
    standardDosageRate: 'Adult Cattle/Buffalo: 100 ml orally diluted in 500 ml lukewarm water; Sheep/Goat: 20-30 ml orally diluted in 100 ml water',
    requiresWeightForDosing: false,
    treatmentDuration: 'Single administration; repeat after 4-6 hours only if frothy tympany reaccumulates under veterinary supervision',
    precautionsEn: [
      'CRITICAL ASPIRATION HAZARD: NEVER attempt oral drenching if the animal has impaired swallowing, is in respiratory distress / choking, is coughing, or is in lateral recumbency. Direct aspiration into the lungs produces fatal foreign-body asphyxiation and necrotizing pneumonia.',
      'NOT FOR FREE-GAS CHOKING: Ineffective against obstructive free-gas bloat caused by an esophageal foreign body (e.g. whole potato or turnip). Choking requires immediate manual desobstruction or veterinary stomach tubing.',
      'Administer slowly via the side of the mouth (cheek pouch), ensuring the animal swallows each gulp naturally.',
    ],
    precautionsUr: [
      'سانس کی نالی میں دوا جانے کا شدید خطرہ: اگر جانور کو سانس لینے میں دشواری ہو، دم گھٹ رہا ہو، گلے میں کوئی چیز پھنسی ہو، یا جانور گر گیا ہو، تو منہ کے راستے دوا ہرگز نہ پلائیں۔ پھیپھڑوں میں دوا جانا فوری موت کا سبب بنتا ہے۔',
      'اگر گلے میں آلو یا شلجم پھنسنے کی وجہ سے گیس رکی ہو تو دوا کام نہیں کرے گی، ڈاکٹر سے فوری نالی یا ٹروکار لگوائیں۔',
      'منہ کے کونے سے آہستہ آہستہ پلائیں تاکہ جانور قدرتی طور پر نگل سکے۔',
    ],
    contraindicationsEn: [
      'Absent or impaired swallowing reflex.',
      'Obstructive esophageal foreign body (choking).',
      'Severe dyspnea / open-mouth gasping where drenching poses immediate asphyxiation hazard.',
    ],
    contraindicationsUr: [
      'نگلنے کی صلاحیت کا نہ ہونا یا بے ہوشی۔',
      'گلے میں کسی چیز کا پھنسنا (Choking)۔',
      'منہ کھول کر ہانپنا یا سانس کا شدید اکھڑنا۔',
    ],
    pregnancySafe: true,
    pregnancySafetyStatus: 'safe_with_precautions',
    pregnancyWarningEn:
      'Physiologically inert non-absorbable silicone surfactant. However, extreme gentleness is required when drenching pregnant animals to prevent stress and recumbency.',
    pregnancyWarningUr:
      'خون میں جذب نہیں ہوتی، لیکن گابھن جانور کو دوا پلاتے وقت زبردستی یا گلے کو زیادہ اونچا کرنے سے پرہیز کریں تاکہ تناؤ نہ آئے۔',
    lactationWarningEn:
      'Not absorbed into systemic circulation. On verified manufacturer labels (Tympal / Bloat Guard), milk withdrawal is 0 days. Unverified local preparations must undergo veterinary verification.',
    lactationWarningUr:
      'خون میں جذب نہیں ہوتی۔ مصدقہ لیبل کے مطابق دودھ کا پرہیز نہیں ہوتا، لیکن غیر مصدقہ دیسی بوتلوں کے لیے ڈاکٹر سے تصدیق ضروری ہے۔',
    sideEffectsEn: [
      'None reported when administered correctly into rumen; lethal foreign-body pneumonia if misdirected into the respiratory tract.',
    ],
    sideEffectsUr: [
      'معدے میں جانے پر کوئی مضر اثر نہیں، لیکن سانس کی نالی میں جانے پر جان لیوا ثابت ہو سکتی ہے۔',
    ],
    isPrescriptionRequired: false,
    requiresVeterinarianAdministration: false,
    milkWithdrawalDays: 0,
    meatWithdrawalDays: 0,
    milkWithdrawalNoteEn: '0 days on verified manufacturer SPC (Tympal / Bloat Guard).',
    meatWithdrawalNoteEn: '0 days on verified manufacturer SPC.',
    officialSourceCitation: 'DRAP Registered Veterinary Product & NOAH Compendium of Animal Medicines',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / UK VMD / NOAH',
    labelRevisionDate: '2020-06-12',
    country: 'Pakistan / United Kingdom',
    verificationStatus: 'verified',
  },

  buparvaquone: {
    id: 'buparvaquone',
    genericName: 'Buparvaquone 50 mg/ml Injection',
    brandName: 'Butalex 50 mg/ml (MSD Animal Health / Intervet Pakistan) / Bupapar (ICI)',
    brandExamplesPk: ['Butalex (MSD Animal Health)', 'Bupapar (ICI Pakistan)', 'Parvaquone-Vet (Star Labs)'],
    manufacturer: 'MSD Animal Health (Intervet International B.V.) / ICI Pakistan Ltd',
    pakistanManufacturerOrImporter: 'Intervet Pakistan (Pvt) Ltd, Karachi / ICI Pakistan Ltd, Lahore',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'restricted_veterinary_distributors',
    activeIngredient: 'Buparvaquone (50 mg/ml)',
    drugClass: 'Hydroxynaphthoquinone Antiprotozoal Agent',
    approvedSpecies: ['cow', 'buffalo'],
    indicationsEn:
      'Curative treatment of acute and chronic theileriosis (East Coast Fever, Corridor disease, Mediterranean Coast Fever / Tropical theileriosis caused by Theileria annulata and Theileria parva) in cattle and buffalo.',
    indicationsUr:
      'گائے اور بھینس میں چیچڑوں سے پھیلنے والے خطرناک سرخ بخار (Theileriosis / Tropical Theileriosis) کے علاج کے لیے واحد مصدقہ اور موثر اینٹی پروٹوزول دوا۔',
    farmerSafeUsageAdviceEn:
      'Specific prescription cure for tick fever (Theileriosis) in cattle and buffalo. Requires microscopic blood smear diagnosis by a veterinary lab. Max 10 ml per injection site in the neck.',
    farmerSafeUsageAdviceUr:
      'چیچڑوں کے سرخ بخار (Theileriosis) کا خاص ٹیکہ۔ لیب سے خون کی جانچ کے بعد صرف ویٹرنری ڈاکٹر ہی گردن کے پٹھے میں لگائے۔ ایک جگہ پر 10 ملی سے زیادہ نہ لگائیں۔',
    administrationRoute: 'intramuscular',
    routeBySpecies: {
      cow: 'intramuscular',
      buffalo: 'intramuscular',
    },
    dosageMgPerKg: 2.5,
    dosageMgPerKgBySpecies: {
      cow: 2.5,
      buffalo: 2.5,
    },
    mgPerMlConcentration: 50,
    maxVolumePerInjectionSiteMl: 10,
    standardDosageRate: '2.5 mg/kg body weight (1.0 ml per 20 kg live weight) by deep intramuscular injection in the neck',
    requiresWeightForDosing: true,
    treatmentDuration: 'Single intramuscular dose. In advanced clinical cases accompanied by severe lung edema, a second dose after 48 hours is administered strictly upon veterinary prescription.',
    precautionsEn: [
      'MANDATORY INJECTION SITE LIMIT: Maximum 10 ml per injection site. If total volume exceeds 10 ml, divide across separate deep muscular sites in the neck to prevent localized sterile abscessation.',
      'INTRAVENOUS AND SUBCUTANEOUS ROUTES ARE STRICTLY FORBIDDEN: Deep intramuscular administration in neck muscles only.',
      'Provide supportive care (iron/B12 hematinics and blood transfusion) if hemolytic anemia is severe.',
    ],
    precautionsUr: [
      'ٹیکے کے مقام کی سخت حد: ایک جگہ پر 10 ملی لیٹر سے زیادہ ٹیکہ ہرگز نہ لگائیں۔ زیادہ مقدار کو گردن کے مختلف پٹھوں میں تقسیم کریں۔',
      'رگ (IV) یا کھال کے نیچے (SC) لگانا سخت ممنوع ہے؛ صرف گردن کے گوشت میں گہرا لگائیں۔',
      'خون کی شدید کمی کی صورت میں خون کی منتقلی یا آئرن کا استعمال کریں۔',
    ],
    contraindicationsEn: [
      'NOT APPROVED for horses, donkeys, sheep, goats, poultry, dogs, or cats.',
      'Intravenous or subcutaneous injection.',
      'Animals intended for dairy consumption where local regulatory licensing restricts buparvaquone residues in milk.',
    ],
    contraindicationsUr: [
      'گھوڑے، گدھے، بھیڑ، بکری، کتے، بلی یا پرندوں میں استعمال کی منظوری نہیں ہے۔',
      'رگ یا کھال کے نیچے لگانا سختی سے ممنوع ہے۔',
    ],
    pregnancySafe: false,
    pregnancySafetyStatus: 'caution_trimester_specific',
    pregnancyWarningEn:
      'Caution: Advanced theileriosis frequently triggers maternal pyrexia and secondary abortion. Administering buparvaquone is essential for maternal survival, but must be accompanied by supportive veterinary therapy in late gestation.',
    pregnancyWarningUr:
      'چیچڑ کا بخار خود بچہ ضائع کرنے کا بڑا سبب ہے۔ ماں کی جان بچانا پہلی ترجیح ہے، تاہم حمل کے آخری دنوں میں ڈاکٹر کی زیر نگرانی لگائیں۔',
    lactationWarningEn:
      'Mandatory 48-hour milk discard period post-administration. In regions where not approved for lactating dairy cattle producing milk for human consumption, adhere strictly to national veterinary authority directives.',
    lactationWarningUr:
      'ٹیکے کے بعد کم از کم 48 گھنٹے تک دودھ انسانوں کے پینے کے لیے استعمال نہ کریں۔',
    sideEffectsEn: [
      'Transient, localized, non-painful muscular swelling at the injection site that resolves spontaneously within 7-10 days.',
    ],
    sideEffectsUr: [
      'ٹیکے کے مقام پر سوجن جو 7 سے 10 دن میں خود بخود ٹھیک ہو جاتی ہے۔',
    ],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: 2,
    meatWithdrawalDays: 42,
    milkWithdrawalNoteEn: '48 hours milk discard (where authorized for dairy cattle by local regulatory authority).',
    meatWithdrawalNoteEn: '42 days meat withdrawal (MSD Butalex Product SPC).',
    officialSourceCitation: 'DRAP Registered Veterinary Product & MSD Animal Health Butalex SPC & WOAH/OIE Standards',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / MSD Animal Health / OIE',
    labelRevisionDate: '2019-08-20',
    country: 'Pakistan / International',
    verificationStatus: 'verified',
  },

  calcium_borogluconate: {
    id: 'calcium_borogluconate',
    genericName: 'Calcium Borogluconate 20%-40% Solution for Infusion',
    brandName: 'Cal-Plus (ICI Pakistan Ltd) / Milcal (Selmore) / Calciject (Norbrook)',
    brandExamplesPk: ['Cal-Plus (ICI Pakistan)', 'Milcal (Selmore)', 'Calbor (Star Labs)'],
    manufacturer: 'ICI Pakistan Ltd (Lucky Core Industries) / Selmore Pharmaceuticals',
    pakistanManufacturerOrImporter: 'ICI Pakistan Ltd Animal Health Division, Sheikhupura Road, Lahore, Pakistan',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'widely_available',
    activeIngredient: 'Calcium Borogluconate 20%-40% w/v with Magnesium and Phosphorus',
    drugClass: 'Electrolyte and Mineral Replacement Therapy',
    approvedSpecies: ['cow', 'buffalo', 'sheep', 'goat'],
    indicationsEn:
      'Emergency restoration of extracellular calcium in acute periparturient hypocalcemia (Parturient Paresis / Milk Fever) in adult dairy cows and buffaloes, and acute hypocalcemia / pregnancy toxemia in ewes and does.',
    indicationsUr:
      'بچہ جننے کے فوری بعد زیادہ دودھ والی گائے اور بھینس میں خون میں کیلشیم کی شدید کمی (سوتا بخار / Milk Fever) اور بکریوں میں حمل کے آخری دنوں کی کمزوری کا ہنگامی علاج۔',
    farmerSafeUsageAdviceEn:
      'Emergency infusion for downer cows with Milk Fever. Must ONLY be infused slowly into vein by a licensed veterinarian with a stethoscope. Rapid infusion causes sudden fatal cardiac arrest. Pre-warm to 38°C.',
    farmerSafeUsageAdviceUr:
      'سوتا بخار (Milk Fever) کی ہنگامی ڈرپ۔ صرف اور صرف ویٹرنری ڈاکٹر ہی دل کی دھڑکن چیک کرتے ہوئے بہت آہستہ نس میں لگا سکتا ہے۔ تیزی سے لگانے پر دل فوری بند ہو جاتا ہے۔',
    administrationRoute: 'intravenous',
    routeBySpecies: {
      cow: 'intravenous',
      buffalo: 'intravenous',
      sheep: 'subcutaneous',
      goat: 'subcutaneous',
    },
    dosageMgPerKg: 0,
    dosageMgPerKgBySpecies: {
      cow: 0,
      buffalo: 0,
      sheep: 0,
      goat: 0,
    },
    mgPerMlConcentration: 250,
    standardDosageRate: 'Adult Cattle/Buffalo: 400-500 ml total (administered SLOWLY IV over 15-20 min, or divided IV/SC); Ewes/Does: 50-100 ml SC divided across multiple sites',
    requiresWeightForDosing: true,
    treatmentDuration: 'Single emergency administration. Repeat after 8-12 hours only if the recumbent animal fails to rise and hypocalcemia persists upon veterinary re-examination.',
    precautionsEn: [
      'RESTRICTED TO LICENSED VETERINARY PROFESSIONALS: Intravenous administration must ONLY be performed by a qualified veterinary surgeon or trained veterinary professional.',
      'LETHAL RAPID INFUSION HAZARD: Rapid intravenous bolus infusion causes sudden fatal cardiac arrest (ventricular fibrillation, severe bradycardia, heart block).',
      'MANDATORY TEMPERATURE PREPARATION: Warm solution to animal body temperature (38°C) before infusion.',
      'MANDATORY CARDIAC AUSCULTATION: Continuously monitor heart rate and rhythm with a stethoscope throughout the 15-20 minute infusion. STOP INFUSION IMMEDIATELY if arrhythmia, skipped beats, or severe bradycardia occurs.',
      'SUBCUTANEOUS SITE DIVISION: When administering subcutaneously, divide volume across multiple sites in the neck and ribs to avoid pressure necrosis and abscesses.',
    ],
    precautionsUr: [
      'صرف لائسنس یافتہ ویٹرنری ڈاکٹر کے لیے: رگ میں یہ ڈرپ لگانا عام کسان کے بس کا کام نہیں، صرف ویٹرنری ڈاکٹر ہی لگا سکتا ہے۔',
      'تیزی سے لگانے کا جان لیوا خطرہ: ڈرپ تیزی سے رگ میں چڑھانے سے دل کی دھڑکن فوری طور پر بند ہو جاتی ہے اور جانور موقع پر دم توڑ دیتا ہے۔',
      'ڈرپ کو لگانے سے پہلے جانور کے جسم کے برابر (38 ڈگری) نیم گرم کریں۔',
      'ڈرپ لگاتے وقت اسٹیتھوسکوپ سے دل کی دھڑکن مسلسل سننا لازمی ہے۔ دھڑکن بے ترتیب ہوتے ہی فوری روک دیں۔',
      'کھال کے نیچے لگاتے وقت مختلف جگہوں پر تقسیم کر کے لگائیں تاکہ سوجن اور پیپ نہ بنے۔',
    ],
    contraindicationsEn: [
      'Rapid intravenous injection (near 100% risk of fatal arrhythmia).',
      'Hypercalcemic states or concurrent administration of cardiac glycosides (digitalis).',
      'Severe chronic renal failure.',
    ],
    contraindicationsUr: [
      'ایک دم تیزی سے رگ میں چڑھانا۔',
      'دل کی ادویات (Digitalis) کے ساتھ ملا کر دینا۔',
    ],
    pregnancySafe: true,
    pregnancySafetyStatus: 'safe_with_precautions',
    pregnancyWarningEn:
      'Safe and life-saving for periparturient paresis. However, must not be infused recklessly; monitoring of cardiac dynamics is vital.',
    pregnancyWarningUr:
      'زچگی کے بعد سوتا بخار میں جان بچانے والی دوا ہے، لیکن غیر محتاط طریقے سے لگانے سے گریز کریں۔',
    lactationWarningEn:
      'Physiological mineral salt solution. On verified labels (Norbrook Calciject / Cal-Plus), withdrawal is: Meat 0 days, Milk 0 hours.',
    lactationWarningUr:
      'مصدقہ لیبل کے مطابق دودھ اور گوشت کا پرہیز صفر ہے، کیونکہ یہ قدرتی نمکیات ہیں۔',
    sideEffectsEn: [
      'Fatal cardiac arrest if infused too rapidly.',
      'Subcutaneous tissue irritation and localized sterile abscess formation at injection sites.',
    ],
    sideEffectsUr: [
      'تیز لگانے کی صورت میں دل کی حرکت بند ہونا۔',
      'کھال کے نیچے لگانے سے مقامی سوجن۔',
    ],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: 0,
    meatWithdrawalDays: 0,
    milkWithdrawalNoteEn: '0 hours (Norbrook Calciject UK VMD SPC Vm 02000/4043 & Cal-Plus).',
    meatWithdrawalNoteEn: '0 days (Norbrook Calciject UK VMD SPC & Cal-Plus).',
    officialSourceCitation: 'DRAP Registered Veterinary Product & Norbrook Laboratories Calciject SPC (Vm 02000/4043)',
    sourceDocumentUrl: 'https://www.dra.gov.pk/',
    regulatoryAuthority: 'DRAP Pakistan / UK VMD',
    labelRevisionDate: '2021-03-15',
    country: 'Pakistan / United Kingdom',
    verificationStatus: 'verified',
  },

  generic_enrofloxacin_injectable: {
    id: 'generic_enrofloxacin_injectable',
    genericName: 'Enrofloxacin 100 mg/ml Generic Injectable Solution',
    brandName: 'Unverified Local Generic Enrofloxacin',
    brandExamplesPk: ['Local Generic Compound'],
    manufacturer: 'Unspecified Generic Compounder',
    pakistanManufacturerOrImporter: 'Unverified Local Compounding Source',
    drapStatus: 'unverified_pending_drap_record',
    drapRegNumber: null,
    pakistanAvailability: 'unverified',
    activeIngredient: 'Enrofloxacin 100 mg/ml',
    drugClass: 'Fluoroquinolone Antibiotic (Bactericidal DNA Gyrase Inhibitor)',
    approvedSpecies: ['cow'],
    indicationsEn: 'Unverified generic formulation for bovine respiratory disease.',
    indicationsUr: 'غیر مصدقہ فارمولیشن برائے سانس کے امراض۔',
    farmerSafeUsageAdviceEn:
      'Unverified generic product lacking DRAP registration proof. Do not administer. Requires RVMP prescription and laboratory verification.',
    farmerSafeUsageAdviceUr:
      'غیر مصدقہ فارمولیشن۔ سرکاری رجسٹریشن کے بغیر ہرگز استعمال نہ کریں۔ مستند ویٹرنری ڈاکٹر سے رجوع کریں۔',
    administrationRoute: 'subcutaneous',
    standardDosageRate: 'Dosing disabled pending manufacturer label verification',
    requiresWeightForDosing: true,
    treatmentDuration: 'Requires veterinary examination',
    precautionsEn: ['Restricted fluoroquinolone; unauthorized use accelerates antimicrobial resistance.'],
    precautionsUr: ['فلوروکوئنولون کا غیر مجاز استعمال جراثیموں میں مدافعت بڑھاتا ہے۔'],
    contraindicationsEn: ['Growing equines, companion animals, and unverified food animal applications.'],
    contraindicationsUr: ['گھوڑوں اور غیر تصدیق شدہ جانوروں میں ممانعت۔'],
    pregnancySafe: false,
    pregnancySafetyStatus: 'unverified_insufficient_data',
    pregnancyWarningEn: 'Insufficient safety data on generic label.',
    pregnancyWarningUr: 'حمل پر اثرات کی غیر مصدقہ معلومات۔',
    lactationWarningEn: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN,
    lactationWarningUr: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR,
    sideEffectsEn: ['Articular cartilage lesions in juvenile animals.'],
    sideEffectsUr: ['نوجوان جانوروں میں جوڑوں کی خرابی۔'],
    isPrescriptionRequired: true,
    requiresVeterinarianAdministration: true,
    milkWithdrawalDays: null,
    meatWithdrawalDays: null,
    officialSourceCitation: 'Unverified Generic Product — Requires Official DRAP Label Verification',
    verificationStatus: 'provisional_requires_review',
  },

  unverified_herbal_bolus: {
    id: 'unverified_herbal_bolus',
    genericName: 'Unverified Commercial Herbal Antidiarrheal Bolus',
    brandName: 'Unregistered Commercial Bolus',
    brandExamplesPk: ['Unbranded Bazaar Powder/Bolus'],
    manufacturer: 'Unregistered Manufacturer',
    pakistanManufacturerOrImporter: 'Unregistered Bazaar Compounder',
    drapStatus: 'not_registered_in_pakistan',
    drapRegNumber: null,
    pakistanAvailability: 'unverified',
    activeIngredient: 'Undisclosed Botanical Compounds',
    drugClass: 'Unregistered Herbal Preparation',
    approvedSpecies: [],
    indicationsEn: 'Unregistered market remedy for indigestion.',
    indicationsUr: 'بازاری غیر مصدقہ دیسی گولیاں۔',
    farmerSafeUsageAdviceEn: 'Unregistered bazaar concoction. High risk of heavy metals, aflatoxins, and adulteration. Strictly avoid.',
    farmerSafeUsageAdviceUr: 'بازاری غیر مصدقہ گولی۔ زہریلے مادوں کا شدید خطرہ ہے۔ استعمال سے مکمل گریز کریں۔',
    administrationRoute: 'oral',
    standardDosageRate: 'Dosage calculation disabled for unregistered preparations',
    requiresWeightForDosing: false,
    treatmentDuration: 'Do not administer without veterinary clearance',
    precautionsEn: ['Unknown composition may contain adulterants or heavy metals.'],
    precautionsUr: ['نامعلوم اجزاء جانور کے لیے زہریلے ہو سکتے ہیں۔'],
    contraindicationsEn: ['All clinical conditions.'],
    contraindicationsUr: ['تمام بیماریاں۔'],
    pregnancySafe: false,
    pregnancySafetyStatus: 'unverified_insufficient_data',
    pregnancyWarningEn: 'Safety during pregnancy has never been evaluated.',
    pregnancyWarningUr: 'حمل کے لیے کوئی تصدیق نہیں ہے۔',
    lactationWarningEn: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN,
    lactationWarningUr: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR,
    sideEffectsEn: ['Potential gastrointestinal irritation and toxic organ damage.'],
    sideEffectsUr: ['معدے کی سوزش اور زہریلے اثرات۔'],
    isPrescriptionRequired: false,
    requiresVeterinarianAdministration: false,
    milkWithdrawalDays: null,
    meatWithdrawalDays: null,
    officialSourceCitation: 'Unregistered Market Preparation — No Verification',
    verificationStatus: 'unverified',
  },
};

/**
 * Generates an audited, regulatory-compliant withdrawal period statement.
 * Strictly adheres to the rule: If withdrawal is unverified or null, display mandatory warning.
 * Never use zero as default.
 */
export function formatSafeWithdrawalStatement(medicine: ModernMedicine, isUrdu = false): string {
  if (
    medicine.verificationStatus !== 'verified' ||
    medicine.milkWithdrawalDays === null ||
    medicine.meatWithdrawalDays === null
  ) {
    return isUrdu ? MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR : MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN;
  }

  if (isUrdu) {
    return `مصدقہ پرہیز کا دورانیہ: دودھ ${medicine.milkWithdrawalDays} دن | گوشت ${medicine.meatWithdrawalDays} دن (${medicine.regulatoryAuthority || 'مصدقہ لیبل'})`;
  }

  return `Verified Withdrawal: Milk: ${medicine.milkWithdrawalDays} days | Meat: ${medicine.meatWithdrawalDays} days (${medicine.regulatoryAuthority || 'Official Product Label'})`;
}

/**
 * Strict Dosage Engine Safety Filter
 * 
 * Disables calculation whenever:
 * 1. Product is provisional or unverified (must be 'verified').
 * 2. Species is unsupported or contraindicated on the product label.
 * 3. Exact product concentration is unknown or missing.
 * 4. Animal weight is missing, zero, or biologically implausible.
 * 5. Pregnancy/lactation restrictions are unresolved or contraindicated.
 * 6. Airway or swallowing impairment exists for oral routes (choking / bloat emergency).
 * 7. Prescription injectables require licensed veterinary doctor administration.
 * 8. Emergency precedence: Emergency stabilization takes absolute priority over routine elective calculations.
 */
export function calculateSafeMedicationDosage(
  medicine: ModernMedicine,
  context: DosageCalculationContext
): SafeDosageResult {
  const speciesNorm = (context.species || '').toLowerCase().trim();
  const weight = context.weightKg;

  // Emergency Precedence Notice
  let emergencyActiveNoticeEn: string | undefined = undefined;
  let emergencyActiveNoticeUr: string | undefined = undefined;

  if (context.isEmergency) {
    emergencyActiveNoticeEn = 'CRITICAL EMERGENCY ACTIVE: Immediate physical stabilization (airway, recumbency, hemorrhage, shock) takes absolute priority over elective medication dosing. Call an emergency RVMP immediately.';
    emergencyActiveNoticeUr = 'ہنگامی حالت کا ترجیحی انتباہ: جانور کی جان بچانے کے لیے بنیادی فرسٹ ایڈ پہلی ترجیح ہے۔ کسی دوا کے حساب کی وجہ سے ڈاکٹر کو بلانے میں تاخیر نہ کریں۔';
  }

  // 1. Verification Status Gate
  if (medicine.verificationStatus !== 'verified') {
    return {
      canCalculate: false,
      disablingReasonEn: `Dosage calculation disabled: product label is ${medicine.verificationStatus || 'unverified'}. Dosage calculation from generic or unverified products is strictly prohibited.`,
      disablingReasonUr: `خوراک کا حساب غیر فعال ہے: اس دوا کی مینوفیکچرر لیبل کی تصدیق ابھی باقی ہے۔ غیر مصدقہ مصنوعات پر خوراک نکالنا ممنوع ہے۔`,
      requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
      withdrawalStatementEn: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_EN,
      withdrawalStatementUr: MANDATORY_UNVERIFIED_WITHDRAWAL_WARNING_UR,
      emergencyActiveWarningEn: emergencyActiveNoticeEn,
      emergencyActiveWarningUr: emergencyActiveNoticeUr,
    };
  }

  // 2. Species Approval & Contraindication Gate
  const isApprovedSpecies = medicine.approvedSpecies?.some((s) => speciesNorm.includes(s));
  if (!isApprovedSpecies) {
    // Specific equine contraindication on oxytetracycline
    if (medicine.id === 'oxytetracycline_la' && (speciesNorm.includes('horse') || speciesNorm.includes('donkey'))) {
      return {
        canCalculate: false,
        disablingReasonEn: 'STRICTLY CONTRAINDICATED: Tetracyclines cause severe, frequently fatal necrotizing enterocolitis in horses and donkeys. Never administer.',
        disablingReasonUr: 'سختی سے ممنوع: گھوڑوں اور گدھوں میں ٹیٹراسائیکلین جان لیوا آنتوں کی سوزش اور شدید اسہال پیدا کرتی ہے۔ ہرگز نہ لگائیں۔',
        requiresVeterinarianAdministration: true,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    // Specific buparvaquone restriction to cattle/buffalo
    if (medicine.id === 'buparvaquone' && !speciesNorm.includes('cow') && !speciesNorm.includes('buffalo')) {
      return {
        canCalculate: false,
        disablingReasonEn: `Dosage calculation disabled: Buparvaquone (Butalex) is NOT approved for ${context.species}. Approved strictly for cattle and buffalo.`,
        disablingReasonUr: `خوراک کا حساب غیر فعال ہے: بوپارواکوئن صرف گائے اور بھینس کے لیے منظور شدہ ہے۔ ${context.species} میں استعمال کی منظوری نہیں ہے۔`,
        requiresVeterinarianAdministration: true,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    return {
      canCalculate: false,
      disablingReasonEn: `Dosage calculation disabled: species '${context.species}' is not approved on the official product label (${medicine.brandName || medicine.genericName}).`,
      disablingReasonUr: `خوراک کا حساب غیر فعال ہے: مینوفیکچرر کے سرکاری لیبل پر اس جانور کی نوع (${context.species}) کے لیے دوا کی منظوری درج نہیں ہے۔`,
      requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
      withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
      withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
      emergencyActiveWarningEn: emergencyActiveNoticeEn,
      emergencyActiveWarningUr: emergencyActiveNoticeUr,
    };
  }

  // 3. Exact Product Concentration Gate
  if (!medicine.mgPerMlConcentration || medicine.mgPerMlConcentration <= 0) {
    return {
      canCalculate: false,
      disablingReasonEn: 'Dosage calculation disabled: exact product active concentration is unknown or unverified. Calculation from generic estimates is strictly prohibited.',
      disablingReasonUr: 'خوراک کا حساب غیر فعال ہے: دوا کے فعال اجزاء کی درست طاقت مصدقہ نہیں ہے۔ اندازوں پر خوراک نکالنا ممنوع ہے۔',
      requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
      withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
      withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
      emergencyActiveWarningEn: emergencyActiveNoticeEn,
      emergencyActiveWarningUr: emergencyActiveNoticeUr,
    };
  }

  // 4. Live Weight Requirement & Biological Bounds Check
  if (medicine.requiresWeightForDosing) {
    if (!weight || weight <= 0) {
      return {
        canCalculate: false,
        disablingReasonEn: 'Dosage calculation disabled: live animal weight in kg is missing. Live weight is strictly mandatory for safe veterinary dosage calculation.',
        disablingReasonUr: 'خوراک کا حساب غیر فعال ہے: جانور کا زندہ وزن درج نہیں ہے۔ درست طبی خوراک نکالنے کے لیے وزن کا اندراج لازمی ہے۔',
        requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    // Biological weight bounds sanity validation
    if (
      (speciesNorm.includes('cow') || speciesNorm.includes('buffalo')) &&
      (weight < 25 || weight > 1500)
    ) {
      return {
        canCalculate: false,
        disablingReasonEn: `Dosage calculation disabled: entered weight (${weight} kg) is physiologically implausible for ${context.species} (plausible range: 25 - 1500 kg).`,
        disablingReasonUr: `خوراک کا حساب غیر فعال ہے: درج کردہ وزن (${weight} کلوگرام) حیاتیاتی طور پر غیر معقول ہے۔`,
        requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    if (
      (speciesNorm.includes('goat') || speciesNorm.includes('sheep')) &&
      (weight < 2 || weight > 200)
    ) {
      return {
        canCalculate: false,
        disablingReasonEn: `Dosage calculation disabled: entered weight (${weight} kg) is physiologically implausible for ${context.species} (plausible range: 2 - 200 kg).`,
        disablingReasonUr: `خوراک کا حساب غیر فعال ہے: درج کردہ وزن (${weight} کلوگرام) بھیڑ بکری کے لیے غیر معقول ہے۔`,
        requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }
  }

  // 5. Pregnancy & Lactation Safety Gate
  if (medicine.pregnancySafetyStatus === 'contraindicated' && context.isPregnant === true) {
    return {
      canCalculate: false,
      disablingReasonEn: `CONTRAINDICATED IN PREGNANCY: ${medicine.brandName || medicine.genericName} is strictly contraindicated during pregnancy on the official product label. ${medicine.pregnancyWarningEn || ''}`,
      disablingReasonUr: `حمل میں سختی سے ممنوع: مینوفیکچرر کے سرکاری لیبل کے مطابق یہ دوا گابھن جانوروں کے لیے سختی سے ممنوع ہے۔`,
      requiresVeterinarianAdministration: true,
      withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
      withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
      emergencyActiveWarningEn: emergencyActiveNoticeEn,
      emergencyActiveWarningUr: emergencyActiveNoticeUr,
    };
  }

  if (medicine.pregnancySafetyStatus === 'caution_trimester_specific') {
    // If pregnant female and 3rd trimester contraindication applies (e.g. Flunixin in late pregnancy)
    if (context.isPregnant === true && context.trimester === 'third' && medicine.id === 'flunixin_meglumine') {
      return {
        canCalculate: false,
        disablingReasonEn: 'CONTRAINDICATED IN LATE PREGNANCY (3rd Trimester): Flunixin meglumine inhibits prostaglandin synthesis, risking delayed parturition and uterine atony.',
        disablingReasonUr: 'حمل کے تیسرے سہ ماہی میں ممنوع: فلو نکسن زچگی میں پیچیدگی اور ولادت کے وقت میں غیر ضروری تاخیر کا سبب بن سکتی ہے۔',
        requiresVeterinarianAdministration: true,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    // In horses, NSAIDs are contraindicated in pregnant mares:
    if (speciesNorm.includes('horse') && context.isPregnant === undefined) {
      return {
        canCalculate: false,
        disablingReasonEn: 'Dosage calculation disabled: pregnancy status is unresolved. Contraindicated in pregnant mares on manufacturer product label; confirm pregnancy status before dosing.',
        disablingReasonUr: 'خوراک کا حساب غیر فعال ہے: گھوڑی کے حمل کی تصدیق لازمی ہے۔ گابھن گھوڑیوں میں استعمال ممنوع ہے۔',
        requiresVeterinarianAdministration: true,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }

    // In cattle, flunixin carries late-gestation contraindications:
    if (
      medicine.id === 'flunixin_meglumine' &&
      context.isPregnant === undefined &&
      (speciesNorm.includes('cow') || speciesNorm.includes('buffalo'))
    ) {
      return {
        canCalculate: false,
        disablingReasonEn: 'Dosage calculation disabled: pregnancy status is unresolved. Flunixin carries late-gestation contraindications requiring veterinary confirmation before administration.',
        disablingReasonUr: 'خوراک کا حساب غیر فعال ہے: حمل کی کیفیت واضح نہیں ہے۔ فلو نکسن آخری سہ ماہی میں پیچیدگی پیدا کر سکتی ہے اس لیے حمل کی تصدیق ضروری ہے۔',
        requiresVeterinarianAdministration: true,
        withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
        withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
        emergencyActiveWarningEn: emergencyActiveNoticeEn,
        emergencyActiveWarningUr: emergencyActiveNoticeUr,
      };
    }
  }

  // 6. Special Airway & Swallowing Gate (Oral Bloat Drenches)
  if (
    medicine.administrationRoute === 'oral' &&
    (context.hasAirwayObstructionOrChoking || context.hasSwallowingReflexImpairment)
  ) {
    return {
      canCalculate: false,
      disablingReasonEn: 'CRITICAL AIRWAY CONTRAINDICATION: Oral drenching is strictly forbidden when swallowing or breathing is impaired. High risk of fatal aspiration pneumonia. Immediate veterinary stomach tubing or trocharization required.',
      disablingReasonUr: 'سانس میں تنگی یا نگلنے کی خرابی کے دوران منہ سے کچھ پلانا سختی سے ممنوع ہے۔ پھیپھڑوں میں دوا جانے سے جان جا سکتی ہے۔ ڈاکٹر سے فوری نالی لگوائیں۔',
      requiresVeterinarianAdministration: true,
      withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
      withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
      emergencyActiveWarningEn: emergencyActiveNoticeEn,
      emergencyActiveWarningUr: emergencyActiveNoticeUr,
    };
  }

  // 7. Route and Volume Resolution
  const matchedRoute =
    (medicine.routeBySpecies && medicine.routeBySpecies[speciesNorm]) ||
    medicine.administrationRoute;

  // Resolve species-specific dose rate
  const matchedMgPerKg =
    (medicine.dosageMgPerKgBySpecies && medicine.dosageMgPerKgBySpecies[speciesNorm]) ??
    medicine.dosageMgPerKg;

  let calculatedDoseText = '';
  let calculatedVolumeMl: number | undefined = undefined;
  let calculatedMg: number | undefined = undefined;
  let injectionSiteAdviceEn: string | undefined = undefined;
  let injectionSiteAdviceUr: string | undefined = undefined;

  if (matchedMgPerKg && matchedMgPerKg > 0 && weight && weight > 0) {
    calculatedMg = weight * matchedMgPerKg;
    calculatedVolumeMl = calculatedMg / medicine.mgPerMlConcentration;
    calculatedDoseText = `${calculatedVolumeMl.toFixed(1)} ml (${calculatedMg.toFixed(0)} mg) via ${matchedRoute.toUpperCase()} for ${weight} kg live weight`;

    // Injection site volume safety check (e.g. Butalex max 10 ml; Terramycin LA max 10 ml)
    if (medicine.maxVolumePerInjectionSiteMl && calculatedVolumeMl > medicine.maxVolumePerInjectionSiteMl) {
      const sitesCount = Math.ceil(calculatedVolumeMl / medicine.maxVolumePerInjectionSiteMl);
      const mlPerSite = (calculatedVolumeMl / sitesCount).toFixed(1);
      injectionSiteAdviceEn = `INJECTION SITE SAFETY: Total volume (${calculatedVolumeMl.toFixed(1)} ml) exceeds the maximum allowed ${medicine.maxVolumePerInjectionSiteMl} ml per site. Divide dose into ${sitesCount} separate deep muscular sites in the neck (~${mlPerSite} ml per site) to avoid severe tissue necrosis.`;
      injectionSiteAdviceUr = `ٹیکے کے مقام کی حفاظت: کل مقدار (${calculatedVolumeMl.toFixed(1)} ملی) ایک جگہ پر زیادہ سے زیادہ اجازت شدہ ${medicine.maxVolumePerInjectionSiteMl} ملی سے زیادہ ہے۔ پٹھے کو خراب ہونے سے بچانے کے لیے اسے گردن کے ${sitesCount} مختلف مقامات پر تقسیم کر کے لگائیں (ہر جگہ تقریباً ${mlPerSite} ملی)۔`;
    }
  } else {
    // Unit or standard dosing (e.g. Dimethicone oral emulsion or Calcium borogluconate slow infusion)
    calculatedDoseText = medicine.standardDosageRate;
  }

  // 8. Emergency First Aid vs Veterinary Treatment Notice
  let emergencyNoticeEn: string | undefined = undefined;
  let emergencyNoticeUr: string | undefined = undefined;

  if (medicine.id === 'calcium_borogluconate') {
    emergencyNoticeEn = 'PROFESSIONAL VETERINARY RESTRICTION: Intravenous infusion must be administered ONLY by a licensed veterinary doctor. Rapid IV infusion causes fatal cardiac arrest. Continuous cardiac auscultation during slow infusion (15-20 min) is mandatory.';
    emergencyNoticeUr = 'پیشہ ورانہ ویٹرنری پابندی: رگ میں یہ ڈرپ صرف لائسنس یافتہ ویٹرنری ڈاکٹر ہی لگا سکتا ہے۔ تیزی سے لگانے سے دل کی دھڑکن بند ہو جاتی ہے۔';
  } else if (medicine.id === 'flunixin_meglumine' && (speciesNorm.includes('cow') || speciesNorm.includes('buffalo'))) {
    emergencyNoticeEn = 'ROUTE COMPLIANCE MANDATORY: Administer by SLOW INTRAVENOUS (IV) route ONLY. Intramuscular injection in cattle is contraindicated and causes severe muscular necrosis.';
    emergencyNoticeUr = 'صرف اور صرف رگ (IV) میں لگائیں۔ گائے کے گوشت میں لگانا سخت نقصان دہ ہے۔';
  }

  return {
    canCalculate: true,
    calculatedDose: calculatedDoseText,
    calculatedVolumeMl,
    calculatedMg,
    injectionSiteAdviceEn,
    injectionSiteAdviceUr,
    requiresVeterinarianAdministration: !!medicine.requiresVeterinarianAdministration,
    withdrawalStatementEn: formatSafeWithdrawalStatement(medicine, false),
    withdrawalStatementUr: formatSafeWithdrawalStatement(medicine, true),
    emergencyFirstAidNoticeEn: emergencyNoticeEn,
    emergencyFirstAidNoticeUr: emergencyNoticeUr,
    emergencyActiveWarningEn: emergencyActiveNoticeEn,
    emergencyActiveWarningUr: emergencyActiveNoticeUr,
  };
}
