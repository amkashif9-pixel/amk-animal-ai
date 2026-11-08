export interface VaccineProtocol {
  id: string;
  species: string;
  diseaseEn: string;
  diseaseUr: string;
  vaccineNameEn: string;
  vaccineNameUr: string;
  recommendedMonthEn: string;
  recommendedMonthUr: string;
  frequencyEn: string;
  frequencyUr: string;
  routeEn: string;
  routeUr: string;
  boosterRequired: boolean;
  notesEn: string;
  notesUr: string;
}

export const VACCINE_PROTOCOLS: VaccineProtocol[] = [
  // CATTLE & BUFFALO
  {
    id: 'fmd_bovine',
    species: 'cow',
    diseaseEn: 'Foot-and-Mouth Disease (FMD)',
    diseaseUr: 'منہ کھر (FMD)',
    vaccineNameEn: 'Bivalent / Trivalent FMD Vaccine (Aribovax / Bioveta / VRI)',
    vaccineNameUr: 'منہ کھر کی حفاظتی ویکسین (VRI یا امپورٹڈ)',
    recommendedMonthEn: 'February-March and September-October',
    recommendedMonthUr: 'فروری/مارچ اور ستمبر/اکتوبر (سال میں دو بار)',
    frequencyEn: 'Bi-annual (Every 6 months)',
    frequencyUr: 'سال میں دو بار',
    routeEn: 'Subcutaneous (S/C) in neck fold',
    routeUr: 'گردن کی کھال کے نیچے (S/C)',
    boosterRequired: true,
    notesEn: 'Mandatory before spring and autumn seasonal transmission peaks.',
    notesUr: 'موسمِ بہار اور خزاں کے آغاز سے پہلے لگانا ضروری ہے۔',
  },
  {
    id: 'hs_bovine',
    species: 'buffalo',
    diseaseEn: 'Hemorrhagic Septicemia (HS / گل گھوٹو)',
    diseaseUr: 'گل گھوٹو (HS)',
    vaccineNameEn: 'Oil Adjuvant HS Vaccine (VRI Lahore)',
    vaccineNameUr: 'تیل والی گل گھوٹو ویکسین',
    recommendedMonthEn: 'May - June (Pre-Monsoon)',
    recommendedMonthUr: 'مئی تا جون (برسات شروع ہونے سے قبل)',
    frequencyEn: 'Annual / Bi-annual in buffaloes',
    frequencyUr: 'سالانہ یا سال میں دو بار (بھینسوں میں)',
    routeEn: 'Intramuscular (I/M) or Deep S/C',
    routeUr: 'گوشت میں گہرا ٹیکہ (I/M)',
    boosterRequired: false,
    notesEn: 'Essential for all cattle and buffaloes before rainy season.',
    notesUr: 'برساتی موسم کی جان لیوا وبا سے بچاؤ کے لیے لازمی۔',
  },
  {
    id: 'lsd_bovine',
    species: 'cow',
    diseaseEn: 'Lumpy Skin Disease (LSD)',
    diseaseUr: 'لمپی سکن ڈیزیز (LSD)',
    vaccineNameEn: 'Goat Pox Vaccine (Neethling strain / VRI)',
    vaccineNameUr: 'لمپی سکن / گوٹ پوکس ویکسین',
    recommendedMonthEn: 'March - April',
    recommendedMonthUr: 'مارچ تا اپریل (مچھر مکھی کے سیزن سے پہلے)',
    frequencyEn: 'Once a year',
    frequencyUr: 'سال میں ایک بار',
    routeEn: 'Subcutaneous',
    routeUr: 'جلد کے نیچے',
    boosterRequired: false,
    notesEn: 'Protects against nodular skin disease transmitted by vectors.',
    notesUr: 'مچھروں اور مکھیوں سے پھیلنے والے خطرناک وائرس سے بچاؤ۔',
  },
  {
    id: 'bq_bovine',
    species: 'cow',
    diseaseEn: 'Blackleg / Black Quarter (BQ / چوڑیا)',
    diseaseUr: 'چوڑیا / پٹھوں کی سوجن (BQ)',
    vaccineNameEn: 'Clostridium chauvoei BQ Vaccine',
    vaccineNameUr: 'چوڑیا کا حفاظتی ٹیکہ',
    recommendedMonthEn: 'April - May',
    recommendedMonthUr: 'اپریل تا مئی',
    frequencyEn: 'Annually for young cattle (6 months to 2 years)',
    frequencyUr: 'سالانہ (6 ماہ سے 2 سال کے کٹڑوں اور بچھڑوں کے لیے)',
    routeEn: 'Subcutaneous',
    routeUr: 'جلد کے نیچے',
    boosterRequired: false,
    notesEn: 'Affects fast-growing, heavy muscular calves.',
    notesUr: 'صحت مند اور فربہ بچھڑوں پر حملہ آور ہوتی ہے۔',
  },

  // GOATS & SHEEP
  {
    id: 'etv_caprine',
    species: 'goat',
    diseaseEn: 'Enterotoxemia (ETV / پیٹ کا زہر)',
    diseaseUr: 'پھٹ کلا / پیٹ کا زہر (ETV)',
    vaccineNameEn: 'Clostridium perfringens Type D Vaccine',
    vaccineNameUr: 'ای ٹی وی (ETV) ویکسین',
    recommendedMonthEn: 'March and September',
    recommendedMonthUr: 'مارچ اور ستمبر (چارہ بدلنے کے سیزن میں)',
    frequencyEn: 'Bi-annual (Every 6 months)',
    frequencyUr: 'سال میں دو بار',
    routeEn: 'Subcutaneous',
    routeUr: 'گردن کی جلد کے نیچے',
    boosterRequired: true,
    notesEn: 'Prevents sudden pulpy kidney death when lush green fodder is grazed.',
    notesUr: 'تازہ چارہ یا دانہ زیادہ کھانے پر اچانک ہلاکت سے بچاؤ۔',
  },
  {
    id: 'ppr_caprine',
    species: 'goat',
    diseaseEn: 'Peste des Petits Ruminants (PPR / بکریوں کا طاعون)',
    diseaseUr: 'بکریوں کا طاعون (PPR)',
    vaccineNameEn: 'Live Attenuated PPR Vaccine (Nigeria 75/1)',
    vaccineNameUr: 'پی پی آر لائیو ویکسین',
    recommendedMonthEn: 'Any month (Before winter)',
    recommendedMonthUr: 'سردیوں کے آغاز سے پہلے',
    frequencyEn: 'Once in 2-3 years (or lifetime immunity)',
    frequencyUr: 'زندگی میں ایک بار یا ہر 3 سال بعد',
    routeEn: 'Subcutaneous',
    routeUr: 'کھال کے نیچے',
    boosterRequired: false,
    notesEn: 'Most critical vaccine for small ruminant farms to prevent epidemic loss.',
    notesUr: 'بکریوں کی سب سے زیادہ تباہ کن وبا سے بچاؤ۔',
  },

  // POULTRY
  {
    id: 'nd_lasota',
    species: 'hen',
    diseaseEn: 'Newcastle Disease (ND / رانی کھیت)',
    diseaseUr: 'رانی کھیت (ND)',
    vaccineNameEn: 'ND Lasota / Clone 30',
    vaccineNameUr: 'لیسوٹا / این ڈی قطرے',
    recommendedMonthEn: 'Day 5-7, Day 21, and every 6-8 weeks',
    recommendedMonthUr: '5 سے 7 دن کی عمر، 21 دن پر، اور ہر 2 ماہ بعد',
    frequencyEn: 'Routine flock cycle',
    frequencyUr: 'مسلسل باقاعدہ شیڈول',
    routeEn: 'Eye drops or Drinking water',
    routeUr: 'آنکھ میں ایک قطرہ یا پینے کے پانی میں',
    boosterRequired: true,
    notesEn: 'Store between 2-8°C with unchlorinated milk powder water.',
    notesUr: 'ویکسین کو ہمیشہ برف میں رکھیں اور کلورین سے پاک پانی استعمال کریں۔',
  },

  // DOGS
  {
    id: 'rabies_canine',
    species: 'dog',
    diseaseEn: 'Rabies (ہلکا پن / پاگل پن)',
    diseaseUr: 'پاگل پن (Rabies)',
    vaccineNameEn: 'Rabisin / Defensor 3 Inactivated Rabies',
    vaccineNameUr: 'ریبیز حفاظتی ٹیکہ',
    recommendedMonthEn: 'At 12 weeks of age, then annually',
    recommendedMonthUr: '3 ماہ کی عمر میں اور پھر ہر سال',
    frequencyEn: 'Annual Booster',
    frequencyUr: 'سالانہ بوسٹر',
    routeEn: 'Subcutaneous / Intramuscular',
    routeUr: 'کھال کے نیچے یا گوشت میں',
    boosterRequired: true,
    notesEn: 'Zoonotic fatal disease. Legally mandated for companion and working animals.',
    notesUr: 'انسانوں میں منتقل ہونے والی جان لیوا بیماری سے حفاظت کے لیے لازمی۔',
  },
];

export const GESTATION_DAYS: Record<string, number> = {
  cow: 283, // ~9 months 9 days
  buffalo: 310, // ~10 months 10 days
  goat: 150, // ~5 months
  sheep: 148, // ~5 months
  camel: 390, // ~13 months
  horse: 340, // ~11 months
  donkey: 365, // ~12 months
  dog: 63, // ~2 months 3 days
  cat: 65, // ~2 months 5 days
  rabbit: 31, // ~1 month
};
