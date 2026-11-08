/**
 * Veterinary Laboratory & Diagnostic Tests Reference
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 */

import { RecommendedLabTest } from '../types/health';

export const LAB_TESTS: Record<string, RecommendedLabTest> = {
  cmt_mastitis: {
    id: 'cmt_mastitis',
    testNameEn: 'California Mastitis Test (CMT) / Somatic Cell Count',
    testNameUr: 'کیلیفورنیا ماسٹائٹس ٹیسٹ (ساڑو کی موقع پر جانچ)',
    purposeEn: 'Rapid cowside screening of individual quarters for subclinical and clinical mastitis before irreversible quarter loss occurs.',
    purposeUr: 'ہر تھن کے دودھ میں جلن اور جراثیم کے اثرات کی فارم پر فوری جانچ تاکہ ساڑو کا بروقت علاج ہو سکے۔',
    sampleType: 'Milk',
    urgency: 'routine',
    expectedTurnaround: '5 minutes (Cowside immediate paddle reaction)',
  },

  blood_smear_hemoparasites: {
    id: 'blood_smear_hemoparasites',
    testNameEn: 'Giemsa-Stained Peripheral Blood Smear Examination',
    testNameUr: 'خون کی سلائیڈ کا مائکروسکوپک معائنہ برائے چیچڑ کا بخار',
    purposeEn: 'Microscopic confirmation of intra-erythrocytic protozoa: Theileria annulata (ring and rod forms), Babesia bigemina/bovis, and Anaplasma marginale.',
    purposeUr: 'خون کے سرخ خلیات کے اندر چچڑ کے زہریلے جراثیم (Theileria / Babesia) کی مائیکروسکوپ کے ذریعے حتمی تصدیق۔',
    sampleType: 'Whole Blood',
    urgency: 'urgent',
    expectedTurnaround: '2 to 4 hours in local veterinary diagnostic laboratory',
  },

  fecal_flotation: {
    id: 'fecal_flotation',
    testNameEn: 'Fecal Floatation & Sedimentation for Parasites',
    testNameUr: 'گوبر کا لیبارٹری معائنہ برائے پیٹ کے کیڑے و کوکسیڈیا',
    purposeEn: 'Quantification of gastrointestinal nematode eggs (EPG), Fasciola hepatica (liver fluke) ova, and Eimeria oocysts.',
    purposeUr: 'گوبر میں پیٹ کے کیڑوں کے انڈوں اور خونی پیچش (Coccidiosis) کے جرثوموں کی تعداد معلوم کرنا۔',
    sampleType: 'Feces',
    urgency: 'routine',
    expectedTurnaround: '2 to 6 hours',
  },

  viral_pcr_antigen: {
    id: 'viral_pcr_antigen',
    testNameEn: 'RT-PCR & Antigen-Capture ELISA Confirmatory Assay',
    testNameUr: 'پی سی آر (PCR) یا ایلائزا لیبارٹری ٹیسٹ',
    purposeEn: 'Definitive molecular identification of viral genome (Foot-and-Mouth Disease, PPR, Lumpy Skin Disease, Newcastle Disease, Canine Parvovirus).',
    purposeUr: 'وائرس کی صحیح قسم اور سٹرین کی ڈی این اے لیبارٹری سے مصدقہ تصدیق۔',
    sampleType: 'Serum',
    urgency: 'urgent',
    expectedTurnaround: '24 to 48 hours at Provincial Diagnostic Laboratories (PRI / UVAS / VRI)',
  },

  serum_calcium_electrolytes: {
    id: 'serum_calcium_electrolytes',
    testNameEn: 'Serum Ionized Calcium, Phosphorus & Magnesium Profile',
    testNameUr: 'خون میں کیلشیم، فاسفورس اور میگنیشیم کا ٹیسٹ',
    purposeEn: 'Differentiation of periparturient recumbency: Hypocalcemia (Milk Fever) vs Hypomagnesemic Tetany vs Downer Cow Syndrome.',
    purposeUr: 'بچے کی پیدائش کے بعد گرنے والی گائے میں کیلشیم کی کمی، میگنیشیم کی کمی یا ہڈی کے فریکچر کا فرق معلوم کرنا۔',
    sampleType: 'Serum',
    urgency: 'immediate',
    expectedTurnaround: '1 to 3 hours (Stat clinical chemistry)',
  },
};
