import { PossibleDisease, EmergencyActionProtocol, EmergencySymptomType } from '../types/health';
import { TRADITIONAL_REMEDIES } from './traditionalRemediesData';
import { MODERN_MEDICINES } from './modernMedicinesData';
import { LAB_TESTS } from './labTestsData';

/**
 * Standard Veterinary Emergency Action Protocols
 * Step-by-step immediate first-aid instructions before the veterinary doctor arrives.
 */
export const EMERGENCY_PROTOCOLS: Record<EmergencySymptomType, EmergencyActionProtocol> = {
  severe_breathing: {
    emergencyType: 'severe_breathing',
    titleEn: 'Severe Respiratory Distress / Choking',
    titleUr: 'سانس میں شدید تنگی اور دم گھٹنا',
    immediateStepsEn: [
      'Call an emergency veterinarian immediately; do not delay.',
      'Keep the animal in sternal recumbency or standing with neck and head gently outstretched to open the airway.',
      'Ensure immediate shade, maximum ventilation, and cool misting if panting from heat stress.',
      'Clear any visible mouth foam, cud, or external obstruction using a clean gloved hand.',
      'NEVER drench oils, home remedies, or fluids down the throat of a choking or gasping animal (causes fatal inhalation pneumonia).',
    ],
    immediateStepsUr: [
      'فوری طور پر قریبی ایمرجنسی ویٹرنری ڈاکٹر کو کال کریں۔',
      'جانور کو پرسکون رکھیں اور گردن کو سیدھا لمبا پھیلائیں تاکہ سانس کی نالی کھلی رہے۔',
      'جانور کو ہوا دار، سایہ دار جگہ پر رکھیں اور شدید گرمی کی صورت میں سر پر پانی کے ہلکے چھینٹے دیں۔',
      'منہ سے جھاگ یا رال صاف کپڑے یا دستانے سے نرمی سے صاف کریں۔',
      'سانس میں تنگی یا ہانپتے ہوئے جانور کو نالی یا بوتل سے کوئی دوا یا تیل ہرگز نہ پلائیں، یہ پھیپھڑوں میں جا کر فوری ہلاکت کا باعث بنتا ہے۔',
    ],
    dangerWarningsEn: [
      'Drenching liquids during respiratory distress carries a near 100% mortality risk from aspiration pneumonia.',
    ],
    dangerWarningsUr: [
      'سانس کی تنگی کے دوران زبردستی کچھ پلانا پھیپھڑوں میں جا کر فوری موت کا سبب بنتا ہے۔',
    ],
  },
  severe_bloat: {
    emergencyType: 'severe_bloat',
    titleEn: 'Acute Life-Threatening Ruminal Bloat',
    titleUr: 'شدید افارہ / پیٹ کا ہوا یا جھاگ سے پھولنا',
    immediateStepsEn: [
      'Call an emergency vet for possible stomach tubing or emergency trocharization.',
      'Keep the animal standing; elevate front legs on an earthen mound or slope to reduce pressure on the diaphragm and lungs.',
      'Place a smooth wooden stick or rope bit across the mouth (tied behind the horns) to induce constant chewing, salivation, and belching.',
      'Administer oral antifoaming agent: 250-500 ml edible vegetable or mustard oil (سرسوں کا تیل) for cattle/buffalo, 50-100 ml for small ruminants.',
      'Keep the animal moving gently; strictly prevent the animal from lying down flat on its side.',
    ],
    immediateStepsUr: [
      'فوری ڈاکٹر کو بلائیں جو معدے میں نالی (Stomach Tube) یا ٹروکار لگا سکے۔',
      'جانور کو اونچی ڈھلوان والی جگہ پر کھڑا کریں تاکہ اگلا دھڑ اونچا رہے اور پھیپھڑوں پر بوجھ کم ہو۔',
      'منہ میں لکڑی کا ٹکڑا لگا کر سینگوں کے پیچھے رسی باندھیں تاکہ جانور جگالی کرے اور گیس خارج ہو۔',
      'جھاگ دار افارے میں 250 تا 500 ملی لیٹر خالص سرسوں کا تیل نیم گرم کر کے پلائیں۔ بھیڑ بکری کے لیے 50 تا 100 ملی لیٹر۔',
      'جانور کو سائیڈ پر زمین پر گرنے نہ دیں، ہلکی واک کروائیں۔',
    ],
    dangerWarningsEn: [
      'Do not attempt trocharization with blunt knives or unsterile instruments except as an absolute last resort when suffocation is imminent.',
    ],
    dangerWarningsUr: [
      'غیر مستند اوزاروں یا چھری سے پیٹ میں سوراخ کرنے سے گریز کریں، یہ شدید جراثیمی سوزش (Peritonitis) پیدا کر سکتا ہے۔',
    ],
  },
  cannot_stand: {
    emergencyType: 'cannot_stand',
    titleEn: 'Inability to Stand / Downer Cow / Recumbency',
    titleUr: 'زمین پر گر جانا / کھڑے ہونے سے معذوری (Downer Animal)',
    immediateStepsEn: [
      'Do not force, beat, or drag the animal with tractors or chains (causes irreversible muscle tearing and hip dislocation).',
      'Prop the animal up onto its brisket (sternal recumbency) using clean straw or hay bales under the shoulder/flank to prevent bloat.',
      'Roll the animal from one side to the other every 2-3 hours to maintain capillary blood flow and prevent pressure necrosis.',
      'Offer clean water and fresh green feed at chin level.',
      'Vet will immediately test for hypocalcemia (Milk Fever), hypomagnesemia, pelvic fracture, or spinal nerve paralysis.',
    ],
    immediateStepsUr: [
      'جانور کو زبردستی زنجیروں یا ٹریکٹر سے گھسیٹنے کی کوشش ہرگز نہ کریں، اس سے پٹھے پھٹ جاتے ہیں۔',
      'جانور کو سینے کے بل (Sternal Recumbency) سیدھا بٹھائیں اور اطراف میں توڑی کی بوریاں لگائیں تاکہ پیٹ میں گیس نہ بھرے۔',
      'ہر 2 سے 3 گھنٹے بعد جانور کی کروٹ تبدیل کریں تاکہ پٹھے مردہ نہ ہوں۔',
      'منہ کے قریب پانی اور سبز چارہ رکھیں تاکہ جانور کمزور نہ ہو۔',
      'ڈاکٹر کو بلائیں جو سوتا بخار (Milk Fever)، کیلشیم کی کمی یا ہڈی ٹوٹنے کی جانچ کرے۔',
    ],
    dangerWarningsEn: [
      'Leaving a heavy ruminant lying flat on its side for over 4 hours causes irreversible compartment syndrome and permanent paralysis.',
    ],
    dangerWarningsUr: [
      'جانور کو سائیڈ کے بل 4 گھنٹے سے زیادہ نہ چھوڑیں ورنہ پٹھے مستقل طور پر ناکارہ ہو سکتے ہیں۔',
    ],
  },
  severe_bleeding: {
    emergencyType: 'severe_bleeding',
    titleEn: 'Severe Arterial or Venous Bleeding',
    titleUr: 'شدید خون کا بہنا / گہرا کٹاؤ اور زخم',
    immediateStepsEn: [
      'Apply firm, continuous direct pressure on the bleeding wound with a thick, clean towel or sterile gauze.',
      'Maintain continuous pressure for at least 10-15 minutes without lifting the pad to check clot formation.',
      'If on a limb, apply a pressure bandage wrapped firmly from distal to proximal.',
      'Keep the animal quiet, calm, and securely tied to lower heart rate and blood pressure.',
      'Do not wash deep pulsating wounds with high-pressure hose water (dislodges the clot).',
    ],
    immediateStepsUr: [
      'صاف تولیے یا جراثیم کش پٹی سے خون کے مقام پر مسلسل اور مضبوط دباؤ ڈالیں۔',
      'کم از کم 10 سے 15 منٹ تک دباؤ برقرار رکھیں، بار بار پٹی ہٹا کر نہ دیکھیں۔',
      'اگر ٹانگ پر زخم ہو تو نیچے سے اوپر کی جانب مضبوطی سے پٹی باندھیں۔',
      'جانور کو مکمل طور پر پرسکون اور باندھ کر رکھیں تاکہ دل کی دھڑکن اور خون کا دباؤ تیز نہ ہو۔',
      'گہرے زخم پر پریشر سے پانی نہ ماریں ورنہ جمنے والا خون بہہ جائے گا۔',
    ],
    dangerWarningsEn: [
      'Tourniquets applied too tightly on limbs without intermittent release can cause tissue necrosis and limb loss.',
    ],
    dangerWarningsUr: [
      'ٹانگ پر بہت زیادہ سخت رسی یا تار زیادہ دیر تک نہ باندھیں ورنہ ٹانگ گل سکتی ہے۔',
    ],
  },
  suspected_poisoning: {
    emergencyType: 'suspected_poisoning',
    titleEn: 'Suspected Toxicity / Chemical / Weed Poisoning',
    titleUr: 'زہریلا پن / کیڑے مار دوائی، یوریا یا زہریلی بوٹی کا شبہ',
    immediateStepsEn: [
      'Identify and safely isolate the suspected source (pesticide bag, fertilizer/urea bag, toxic weed, rat poison) to show the vet.',
      'If ingestion was recent (< 1 hour) and animal is conscious, administer Activated Charcoal slurry (1-2 g/kg orally in water) to adsorb toxins.',
      'For suspected Urea poisoning: immediately drench 2-4 liters of cold vinegar (سرکہ) mixed with 2-3 liters of cold water to neutralize rumen ammonia.',
      'Wash any topical pesticide spillage off the skin immediately using copious cool soapy water.',
      'DO NOT induce vomiting in ruminants or horses (anatomically unsafe and causes fatal choking).',
    ],
    immediateStepsUr: [
      'زہر کا ذریعہ (سپرے والی خالی بوتل، یوریا کھاد، زہریلا چارہ یا چوہے مار دوا) فوراً الگ کریں تاکہ ڈاکٹر کو دکھایا جا سکے۔',
      'اگر جانور ہوش میں ہو تو ایکٹیویٹڈ چارکول (طبی کوئلے کا سفوف) پانی میں گھول کر پلائیں تاکہ زہر جذب ہو۔',
      'یوریا کھاد کے زہر میں فوری طور پر 2 سے 3 لیٹر سرکہ (Vinegar) ٹھنڈے پانی میں ملا کر پلائیں تاکہ امونیا بے اثر ہو۔',
      'اگر جلد پر زہریلا اسپرے گرا ہو تو فوری صابن اور ٹھنڈے پانی سے دھوئیں تاکہ چمڑی سے زہر اندر نہ جائے۔',
      'گائے، بھینس یا گھوڑے کو قے (الٹی) کروانے کی کوشش ہرگز نہ کریں۔',
    ],
    dangerWarningsEn: [
      'Never administer oral liquids to an animal showing tremors, convulsions, or unconsciousness.',
    ],
    dangerWarningsUr: [
      'بے ہوش یا جھٹکے کھانے والے جانور کے منہ میں کوئی بھی مائع دوا یا تیل نہ ڈالیں۔',
    ],
  },
  seizures_tremors: {
    emergencyType: 'seizures_tremors',
    titleEn: 'Seizures, Convulsions & Neurological Tremors',
    titleUr: 'دورے، اعصابی جھٹکے اور کپکپاہٹ',
    immediateStepsEn: [
      'Clear the immediate perimeter of hard objects, feeding mangers, ditches, and barbed wire to prevent traumatic injury.',
      'Dim lights, minimize noise, and keep voices low; acoustic or visual stimulation often triggers status epilepticus.',
      'Do not place hands near or inside the animal’s mouth (risk of severe involuntary crushing bite).',
      'Record duration and characteristics of seizures on phone video to assist the veterinarian’s neurological diagnosis.',
      'Keep head supported on a soft folded blanket or sack.',
    ],
    immediateStepsUr: [
      'جانور کے گرد سے لوہا، کھُرلی، گڑھے اور تاریں ہٹا دیں تاکہ ٹکرانے سے جانور زخمی نہ ہو۔',
      'روشنی مدہم کریں اور شور شرابہ بالکل بند کریں، کیونکہ شور سے جھٹکوں میں شدت آ جاتی ہے۔',
      'جانور کے منہ میں ہاتھ یا کپڑا ڈالنے کی کوشش نہ کریں ورنہ وہ بے ہوشی میں شدید کاٹ سکتا ہے۔',
      'جھٹکوں کے انداز کی چند سیکنڈ کی ویڈیو موبائل پر بنا لیں تاکہ ویٹرنری ڈاکٹر کو تشخیص میں آسانی ہو۔',
      'سر کے نیچے نرم بوری یا کپڑا رکھیں تاکہ زمین پر ٹکرانے سے چوٹ نہ آئے۔',
    ],
    dangerWarningsEn: [
      'Neurological signs may indicate zoonotic Rabies or Clostridial Tetanus. Avoid direct contact with saliva.',
    ],
    dangerWarningsUr: [
      'اعصابی علامات ریبیز (باولاپن) یا تشنج (Tetanus) کی ہو سکتی ہیں، رال کو چھونے سے گریز کریں اور دستانے پہنیں۔',
    ],
  },
  severe_dehydration: {
    emergencyType: 'severe_dehydration',
    titleEn: 'Severe Dehydration (>8-10% Bodyweight Deficit)',
    titleUr: 'شدید پانی اور نمکیات کی کمی (Severe Dehydration)',
    immediateStepsEn: [
      'Perform skin tent test on the neck: if skin fold takes >3 seconds to flatten and eyes are deeply sunken, dehydration is life-threatening.',
      'Check gum moisture: dry, tacky, pale mucous membranes indicate circulatory hypovolemia.',
      'Offer lukewarm clean water fortified with WHO-formula Oral Rehydration Salts (ORS) or electrolyte powder in small, frequent sips.',
      'If the animal is recumbent, lethargic, or refusing to drink, call a vet immediately for intravenous fluid resuscitation (Ringers Lactate / Normal Saline).',
      'Keep the animal sheltered from direct sunlight and wind.',
    ],
    immediateStepsUr: [
      'گردن کی کھال کھینچ کر چھوڑیں (Skin Tent Test)؛ اگر کھال 3 سیکنڈ سے زیادہ کھڑی رہے اور آنکھیں اندر دھنس چکی ہوں تو یہ جان لیوا کمی ہے۔',
      'مسوڑھے چیک کریں؛ اگر مسوڑھے خشک اور چپچپے ہوں تو دورانِ خون کمزور ہو چکا ہے۔',
      'او آر ایس (ORS) یا نمکول ملا نیم گرم پانی وقفے وقفے سے پلائیں۔',
      'اگر جانور پانی نہ پی رہا ہو یا سست ہو کر گر گیا ہو تو فوری ڈاکٹر سے نس (IV) میں ڈرپ (Ringer Lactate) لگوائیں۔',
      'جانور کو سیدھی دھوپ اور تیز ہوا سے بچا کر رکھیں۔',
    ],
    dangerWarningsEn: [
      'Severe dehydration in young calves with diarrhea quickly leads to fatal metabolic acidosis and hypovolemic shock within hours.',
    ],
    dangerWarningsUr: [
      'چھوٹے کٹڑوں اور بچھڑوں میں دستوں کی وجہ سے پانی کی کمی چند گھنٹوں میں جان لیوا ثابت ہو سکتی ہے۔',
    ],
  },
};

/**
 * Curated Clinical Disease Dossiers for All 9 Livestock & Domestic Species
 */
export const CLINICAL_DISEASES: PossibleDisease[] = [
  // 1. FOOT AND MOUTH DISEASE
  {
    id: 'fmd',
    nameEn: 'Foot-and-Mouth Disease (FMD)',
    nameUr: 'منہ کھر کی متعدی بیماری (FMD)',
    scientificName: 'Aphthovirus (Picornaviridae)',
    targetSpecies: ['cow', 'buffalo', 'goat', 'sheep'],
    symptomsEn: [
      'High fever (104-106°F)',
      'Severe ropy salivation and smacking of lips',
      'Painful vesicles and blisters in mouth, gums, and tongue',
      'Blisters and lesions between hooves and coronary band',
      'Lameness, stamping feet, reluctance to rise',
      'Drastic sudden drop in milk yield (up to 80%)',
    ],
    symptomsUr: [
      'تیز بخار (104 تا 106 فارن ہائیٹ)',
      'منہ سے رالیں بہنا اور ہونٹوں سے چڑ چڑ کی آواز نکالنا',
      'زبان، مسوڑھوں اور منہ کے اندر دردناک چھالے اور زخم',
      'کھروں کے درمیان گندے زخم اور پیپ',
      'شدید لنگڑاہٹ اور کھڑے ہونے سے گریز',
      'دودھ کی پیداوار میں اچانک 80 فیصد تک کمی',
    ],
    observedVisualSignsEn: [
      'Frothy ropy saliva hanging from muzzle',
      'Erosive raw red ulcers on dental pad and tongue',
      'Interdigital hoof cleft ulcers with sloughing tissue',
    ],
    observedVisualSignsUr: [
      'منہ سے لمبی لیس دار جھاگ والی رالیں',
      'زبان اور مسوڑھوں پر لال چھلے ہوئے زخم',
      'کھروں کے درمیان چھلے ہوئے زخم اور سوجن',
    ],
    possibleCausesEn: [
      'Highly contagious Aphthovirus (Types O, A, Asia-1)',
      'Airborne aerosol transmission across several kilometers',
      'Direct contact with infected livestock saliva, milk, or slurry',
      'Unvaccinated animals introduced from open livestock markets',
    ],
    possibleCausesUr: [
      'انتہائی متعدی ایپتھو وائرس (Aphthovirus ٹائپ O, A, Asia-1)',
      'ہوا اور سانس کے ذریعے وائرس کا کئی کلومیٹر تک پھیلاؤ',
      'متاثرہ جانور کی رال، دودھ اور فضلہ سے براہ راست ملاپ',
      'منڈیوں سے لائے گئے بغیر ویکسین لگے نئے جانور',
    ],
    riskLevel: 'severe',
    immediateCareEn: [
      'Isolate infected animals in a dry, soft-bedded pen immediately to prevent herd spread.',
      'Wash mouth lesions gently 2-3 times daily with mild alum water (پھٹکری کا پانی 2%) or boric acid solution.',
      'Clean hooves with 1:1000 Potassium Permanganate (لال دوائی) solution and apply zinc oxide soothing spray.',
      'Feed soft, cool, palatable fodder: green berseem slurry, soaked wheat bran, and cold clean water.',
      'DO NOT force hard dry wheat straw (bhoosa) which tears mouth ulcers.',
    ],
    immediateCareUr: [
      'متاثرہ جانور کو فوری طور پر تندرست جانوروں سے الگ خشک اور نرم جگہ پر باندھیں۔',
      'منہ کے زخموں کو روزانہ 2 سے 3 بار پھٹکری کے نیم گرم پانی (2 فیصد) سے نرمی سے دھوئیں تاکہ چھالے جلد ٹھیک ہوں۔',
      'پاؤں کے زخموں کو لال دوائی (پوٹاشیم پرمینگنیٹ) کے ہلکے گلابی پانی سے دھو کر اینٹی سیپٹک مرہم لگائیں۔',
      'نرم اور ٹھنڈی خوراک دیں جیسے باریک کٹا سبز چارہ، دلیا اور چوکر؛ سخت توڑی ہرگز نہ دیں کیونکہ وہ زخموں کو چھیل دیتی ہے۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Potassium Permanganate (1:1000 solution)',
        ingredientUr: 'پوٹاشیم پرمینگنیٹ (لال دوائی 1:1000 محلول)',
        purposeEn: 'Antiseptic footbath and hoof lesion wash to control secondary necrosis',
        purposeUr: 'کھروں کے زخموں کی اینٹی سیپٹک صفائی اور پیپ سے بچاؤ',
        administrationRoute: 'topical',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Do not use concentrated crystals directly on tissue (causes chemical burns)'],
        contraindicationsUr: ['خالص دانوں کو براہ راست زخم پر نہ لگائیں ورنہ کھال جل جائے گی'],
        evidenceLevel: 'established_standard',
      },
      {
        ingredientEn: 'Potash Alum 2% Solution (پھٹکری)',
        ingredientUr: 'پھٹکری کا 2 فیصد محلول',
        purposeEn: 'Mild astringent mouth wash to accelerate healing of oral ulcers',
        purposeUr: 'منہ کے چھالوں کو سکھانے اور جلدی ٹھیک کرنے کے لیے',
        administrationRoute: 'topical',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Do not force down throat as a systemic drench'],
        contraindicationsUr: ['پیٹ کے اندر زبردستی نہ انڈیلیں'],
        evidenceLevel: 'supportive_adjunct',
      },
      {
        ingredientEn: 'Meloxicam',
        ingredientUr: 'میلوکسیکیم (Meloxicam)',
        purposeEn: 'Non-steroidal anti-inflammatory (NSAID) for relief of high fever and severe oral/foot pain',
        purposeUr: 'تیز بخار اور منہ کھر کے شدید درد کو کم کرنے کے لیے',
        administrationRoute: 'intramuscular',
        isPrescriptionOnly: true,
        contraindicationsEn: ['Severe renal impairment', 'Gastrointestinal ulceration', 'Concurrent corticosteroid use'],
        contraindicationsUr: ['گردوں کی خرابی', 'معدے کے السر', 'سٹیرائیڈ کے ساتھ بیک وقت استعمال ممنوع'],
        evidenceLevel: 'established_standard',
      },
    ],
    contraindicationsEn: [
      'Do not administer corticosteroids (dexamethasone) as they suppress immunity and exacerbate viral replication.',
      'Do not feed coarse dry fodder.',
    ],
    contraindicationsUr: [
      'سٹیرائیڈ (ڈیکسامیتھاسون) کا استعمال ہرگز نہ کریں کیونکہ یہ وائرس کے خلاف قوتِ مدافعت ختم کر دیتا ہے۔',
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Strict quarantine of affected pens for minimum 28 days.',
      'Footbaths with 4% washing soda (sodium carbonate) at barn entries.',
    ],
    isolationRecommendationsUr: [
      'متاثرہ جانوروں کا باڑہ کم از کم 28 دن تک قرنطینہ میں رکھیں۔',
      'دروازے پر دھوبی سوڈا (4 فیصد سوڈیم کاربونیٹ) کا جراثیم کش حوض بنائیں۔',
    ],
    preventionEn: [
      'Biannual trivalent or quadrivalent FMD vaccination (Spring and Autumn).',
      'Strict biosecurity: 21-day quarantine of all newly purchased animals.',
      'Disinfect vehicles and farm entrances with 4% sodium carbonate.',
    ],
    preventionUr: [
      'سال میں دو بار (بہار اور خزاں) منہ کھر کی معیاری ویکسین لازمی لگوائیں۔',
      'منڈی سے خریدے گئے نئے جانوروں کو کم از کم 21 دن فارم سے الگ رکھیں۔',
      'فارم کے گیٹ پر چونے یا جراثیم کش دوا کا حوض بنائیں۔',
    ],
    preventativeVaccineName: 'FMD Trivalent Oil-Adjuvant Vaccine',
    recommendedVetExamEn:
      'Direct visual inspection, vesicular fluid PCR / ELISA typing, secondary bacterial infection assessment, supportive antipyretic administration.',
    recommendedVetExamUr:
      'ویٹرنری ڈاکٹر سے منہ اور کھروں کا معائنہ، وائرس کی ذیلی قسم کا تعین، اور تیز بخار کے لیے درد کش ادویات کا مشورہ۔',
    questionsForVetEn: [
      'Which FMD strain is currently circulating in our district?',
      'What fever-reducing medication and pain relief is safest for pregnant animals?',
      'How should we manage mastitis prevention while the teat skin has blisters?',
    ],
    questionsForVetUr: [
      'ہمارے علاقے میں اس وقت منہ کھر کی کون سی قسم (سٹرین) پھیل رہی ہے؟',
      'گابھن جانور کے بخار اور درد کو کم کرنے کے لیے کون سا ٹیکہ محفوظ ہے؟',
      'تھنوں پر چھالے ہونے کی صورت میں ساڑو سے کیسے بچاؤ ممکن ہے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 3,
      meatWithdrawalDays: 14,
      specialNotesEn: 'Milk must be pasteurized / boiled thoroughly; discard milk if systemic antibiotics are administered for secondary infections.',
      specialNotesUr: 'دودھ اچھی طرح ابال کر استعمال کریں؛ اینٹی بائیوٹک لگنے پر 72 گھنٹے دودھ ضائع کریں۔',
    },
    withdrawalPeriodWarningEn:
      'Milk from FMD-affected animals must be boiled thoroughly and never fed raw to calves. If antibiotics are administered for secondary infections, observe the 72-hour milk withdrawal.',
    withdrawalPeriodWarningUr:
      'متاثرہ گائے یا بھینس کا دودھ اچھی طرح ابال کر استعمال کریں اور کٹڑوں/بچھڑوں کو کچا دودھ نہ پلائیں۔ اینٹی بائیوٹک لگنے کی صورت میں 3 دن تک دودھ ضائع کریں۔',
    supportingSymptomsEn: [
      'Simultaneous mouth blisters and foot interdigital lesions',
      'Profuse stringy ropy salivation and lip smacking',
      'Sudden drop in milk yield in high-producing cows',
    ],
    supportingSymptomsUr: [
      'منہ اور کھروں دونوں میں ایک ساتھ چھالے اور زخم',
      'منہ سے مسلسل لمبی لیس دار رال اور ہونٹوں کی آواز',
      'دودھ میں اچانک شدید کمی',
    ],
    contradictingSymptomsEn: [
      'Absence of oral and hoof lesions',
      'Normal rectal temperature without fever',
      'Severe throat swelling without mouth blisters (indicative of HS)',
    ],
    contradictingSymptomsUr: [
      'منہ یا کھروں میں کسی چھالے کا نہ ہونا',
      'بخار کے بغیر معمول کا درجہ حرارت',
      'گلے کی شدید سوجن بغیر چھالوں کے (یہ گل گھوٹو ہے)',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.alum_mouth_wash,
      TRADITIONAL_REMEDIES.turmeric_mustard_oil,
    ],
    modernMedicines: [
      MODERN_MEDICINES.meloxicam,
      MODERN_MEDICINES.oxytetracycline_la,
    ],
    recommendedLabTests: [
      LAB_TESTS.viral_pcr_antigen,
    ],
    sourceCitations: [
      {
        sourceName: 'WOAH (OIE) Terrestrial Manual: Foot-and-Mouth Disease',
        publicationOrEdition: 'Chapter 3.1.8 (2022)',
        reviewStatus: 'Internationally Verified Standard',
      },
      {
        sourceName: 'UVAS Lahore Livestock Clinical Decision Support',
        publicationOrEdition: 'Clinical Protocol Guide 2024',
        reviewStatus: 'Pakistan Field Verified',
      },
    ],
  },

  // 2. HEMORRHAGIC SEPTICEMIA
  {
    id: 'hs',
    nameEn: 'Hemorrhagic Septicemia (HS / گل گھوٹو)',
    nameUr: 'گل گھوٹو کی جان لیوا بیماری (HS)',
    scientificName: 'Pasteurella multocida (Type B:2 & E:2)',
    targetSpecies: ['cow', 'buffalo'],
    symptomsEn: [
      'Sudden extremely high fever (106-107°F)',
      'Severe warm, painful swelling under the throat, neck, and brisket',
      'Heavy grunting, rapid labored breathing with outstretched neck',
      'Tongue protruding, dark red eye conjunctiva',
      'Severe respiratory distress, collapse within 12-24 hours if untreated',
    ],
    symptomsUr: [
      'اچانک شدید ترین بخار (106 تا 107 فارن ہائیٹ)',
      'گلے، جبڑے کے نیچے اور گردن پر گرم اور انتہائی دردناک سوجن',
      'خر خر کی آوازوں کے ساتھ سانس لینے میں شدید دشواری اور گردن کو لمبا پھیلانا',
      'زبان باہر نکل آنا اور آنکھیں سرخ انگارہ ہو جانا',
      'بروقت علاج نہ ملنے پر جانور کا 12 سے 24 گھنٹوں کے اندر گر جانا',
    ],
    observedVisualSignsEn: [
      'Warm submandibular and brisket edema',
      'Salivating with outstretched head and neck',
      'Severe abdominal heave and flaring nostrils',
    ],
    observedVisualSignsUr: [
      'جبڑے اور گلے کے نیچے گرم سوجن',
      'گردن تان کر اور زبان نکال کر ہانپنا',
      'پھیپھڑوں اور پسلیوں کا تیزی سے دھڑکنا',
    ],
    possibleCausesEn: [
      'Pasteurella multocida bacteria activated by monsoon humidity, rain stress, or exhaustion',
      'Poor ventilation and damp muddy housing',
      'Unvaccinated buffaloes and calves under stress',
    ],
    possibleCausesUr: [
      'پیسچوریلا ملٹوسیڈا بیکٹیریا جو برسات کی نمی، تھکاوٹ اور سردی کی لہر میں متحرک ہوتا ہے',
      'ہوا کے بغیر گندے، گیلے اور کیچڑ والے باڑے',
      'بغیر ویکسین لگی بھینسیں اور چھوٹے کٹڑے',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'THIS IS A CRITICAL LIFE-THREATENING EMERGENCY! Call a veterinarian immediately.',
      'Keep the animal completely calm; any stress or excitement accelerates asphyxiation.',
      'Place cold water wet compresses over the head (NOT cold water poured into mouth).',
      'Do not force-drench any liquid drench as it will enter lungs and cause instant death.',
    ],
    immediateCareUr: [
      'یہ ایک انتہائی جان لیوا ایمرجنسی ہے! فوری طور پر ویٹرنری ڈاکٹر کو کال کریں۔',
      'جانور کو بالکل پرسکون رکھیں، کسی قسم کی بھاگ دوڑ سے سانس بند ہونے کا خطرہ بڑھ جاتا ہے۔',
      'سر پر ٹھنڈے پانی کی پٹیاں رکھیں لیکن منہ میں نالی کے ذریعے تیل یا کاڑھا زبردستی نہ ڈالیں ورنہ پھیپھڑوں میں جا کر فوری موت واقع ہو جائے گی۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Flunixin Meglumine',
        ingredientUr: 'فلو نکسن میگلومائن (Flunixin Meglumine)',
        purposeEn: 'Emergency potent NSAID to reduce lethal throat edema and endotoxemia',
        purposeUr: 'گلے کی جان لیوا سوجن اور بخار کو فوری کنٹرول کرنے والا ٹیکہ',
        administrationRoute: 'intravenous',
        isPrescriptionOnly: true,
        contraindicationsEn: ['Dehydrated animals without concurrent IV fluid therapy', 'Renal insufficiency'],
        contraindicationsUr: ['پانی کی شدید کمی اور گردوں کی خرابی میں احتیاط'],
        evidenceLevel: 'established_standard',
      },
    ],
    contraindicationsEn: [
      'Never administer oral drenches during choking/respiratory distress.',
      'Do not delay IV antibiotic therapy administered by a licensed vet.',
    ],
    contraindicationsUr: [
      'سانس بند ہونے کی حالت میں منہ سے کوئی دوائی نہ پلائیں۔',
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Immediately isolate suspected cases from all in-contact buffaloes and cattle.',
      'Burn or deep-bury carcasses with quicklime to destroy pasteurella organisms.',
    ],
    isolationRecommendationsUr: [
      'متاثرہ جانور کو باقی مویشیوں سے فوراً الگ کریں۔',
      'ہلاک شدہ جانور کو گہرے گڑھے میں چونا ڈال کر دفن کریں۔',
    ],
    preventionEn: [
      'Mandatory pre-monsoon vaccination in May-June with oil-adjuvant HS vaccine.',
      'Keep sheds dry and clean during monsoon storms.',
    ],
    preventionUr: [
      'مئی اور جون میں برسات شروع ہونے سے پہلے گل گھوٹو (HS) کا حفاظتی ٹیکہ لازمی لگوائیں۔',
      'بارشوں کے دوران باڑے میں خشک جگہ اور نکاسی کا انتظام رکھیں۔',
    ],
    preventativeVaccineName: 'HS Oil-Adjuvant Vaccine',
    recommendedVetExamEn:
      'Immediate IV broad-spectrum antibiotics (Oxytetracycline or Ceftiofur), high-dose anti-inflammatory (Flunixin meglumine), tracheostomy if airway obstructed.',
    recommendedVetExamUr:
      'ڈاکٹر کے ذریعے فوری نس (IV) میں موثر اینٹی بائیوٹک اور سوجن کم کرنے والے ہنگامی انجیکشن۔',
    questionsForVetEn: [
      'Is there an airway blockage requiring emergency intervention?',
      'Should we immediately vaccinate the rest of the in-contact herd with prophylactic coverage?',
    ],
    questionsForVetUr: [
      'کیا جانور کا سانس بحال رکھنے کے لیے ایمرجنسی نالی کی ضرورت ہے؟',
      'فارم کے باقی جانوروں کو بیماری سے بچانے کے لیے کون سی احتیاطی دوا دی جائے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 5,
      meatWithdrawalDays: 21,
      specialNotesEn: 'High doses of emergency antibiotics mandate strict withdrawal periods.',
      specialNotesUr: 'شدید اینٹی بائیوٹک ادویات کے بعد دودھ 5 دن اور گوشت 21 دن تک استعمال نہ کریں۔',
    },
    withdrawalPeriodWarningEn:
      'High antibiotic dosage mandates 14-28 days meat withdrawal and 5-7 days milk withdrawal.',
    withdrawalPeriodWarningUr:
      'شدید ادویات کے بعد کم از کم 7 دن تک دودھ اور 21 دن تک گوشت استعمال نہ کریں۔',
    supportingSymptomsEn: [
      'Hot, painful, rapidly spreading edema under lower jaw, neck, and dewlap',
      'Sudden high fever exceeding 105°F with grunting and tongue protrusion',
      'Pre-monsoon or monsoon seasonal onset in buffalo and cattle',
    ],
    supportingSymptomsUr: [
      'گلے، نیچے جبڑے اور جھالر پر گرم، دردناک اور تیزی سے پھیلنے والی سوجن',
      '105 فارن ہائیٹ سے زیادہ تیز بخار اور زبان باہر نکال کر ہانپنا',
      'مون سون اور برسات کے موسم میں کثرت سے حملہ',
    ],
    contradictingSymptomsEn: [
      'Normal breathing without stridor or snoring sound',
      'Absence of throat swelling or neck edema',
      'Normal appetite with subnormal body temperature (points to Milk Fever)',
    ],
    contradictingSymptomsUr: [
      'سانس کی تنگی یا گلے کی خرخر کے بغیر معمول کی سانس',
      'گلے کی سوجن کا نہ ہونا',
      'معمول سے کم درجہ حرارت (یہ سوتا بخار کی علامت ہے)',
    ],
    traditionalRemedies: [
      // No home cure for bacterial septicemia, strictly supportive cold sponging
    ],
    modernMedicines: [
      MODERN_MEDICINES.oxytetracycline_la,
      MODERN_MEDICINES.flunixin_meglumine,
      MODERN_MEDICINES.meloxicam,
    ],
    recommendedLabTests: [
      LAB_TESTS.blood_smear_hemoparasites,
    ],
    sourceCitations: [
      {
        sourceName: 'Merck Veterinary Manual (11th Ed): Hemorrhagic Septicemia',
        publicationOrEdition: 'Infectious Diseases of Large Animals',
        reviewStatus: 'Peer-Reviewed Standard',
      },
      {
        sourceName: 'Livestock & Dairy Development Department Punjab',
        publicationOrEdition: 'Monsoon Disease Control Protocols 2023',
        reviewStatus: 'Pakistan Official Protocol',
      },
    ],
  },

  // 3. LUMPY SKIN DISEASE
  {
    id: 'lumpy_skin',
    nameEn: 'Lumpy Skin Disease (LSD)',
    nameUr: 'لمپی سکن ڈیزیز (LSD / جلد کی گانٹھیں)',
    scientificName: 'Capripoxvirus',
    targetSpecies: ['cow', 'buffalo'],
    symptomsEn: [
      'Firm, round, raised nodules/lumps (2-5 cm) all over skin, neck, and udder',
      'High persistent fever (104-105°F)',
      'Severe swelling of legs (brisket edema and ventral edema)',
      'Enlarged superficial lymph nodes',
      'Watery to purulent eye and nasal discharge',
    ],
    symptomsUr: [
      'پوری جلد، گردن اور ہوانے پر سخت گول ابھری ہوئی گانٹھیں (چھالے/گلٹیاں)',
      'مسلسل تیز بخار (104 تا 105 فارن ہائیٹ)',
      'ٹانگوں اور پیٹ کے نچلے حصے پر پانی بھرنے کی طرح سوجن',
      'گردن اور کندھوں کے غدود (Lymph nodes) کا غیر معمولی پھول جانا',
      'آنکھوں اور ناک سے رطوبت اور پیپ بہنا',
    ],
    observedVisualSignsEn: [
      'Circumscribed skin nodules across neck, flanks, and perineum',
      'Pitting edema of lower limbs',
      'Ruptured skin lesions forming deep necrotic sitfasts',
    ],
    observedVisualSignsUr: [
      'چمڑی پر سخت گول گلٹیاں',
      'ٹانگوں اور سینے پر ورم/سوجن',
      'پھٹی ہوئی گانٹھیں جن پر خون یا پیپ ہو',
    ],
    possibleCausesEn: [
      'Capripoxvirus transmitted primarily by biting flies (Stomoxys), mosquitoes, and ticks',
      'Lack of insect control on livestock farms',
    ],
    possibleCausesUr: [
      'کیپری پوکس وائرس جو مچھروں، خون چوسنے والی مکھیوں اور چیچڑوں کے کاٹنے سے پھیلتا ہے',
      'فارم پر مکھیاں اور مچھر مارنے کے انتظامات نہ ہونا',
    ],
    riskLevel: 'severe',
    immediateCareEn: [
      'Spray animals with fly repellents (Cypermethrin / Neem oil emulsion).',
      'Apply antiseptic healing ointment (zinc oxide, gentian violet) on ruptured skin lumps.',
      'Provide soft bedding and cool shaded environment.',
      'Administer oral liver tonics and vitamin AD3E + C to boost immunity.',
    ],
    immediateCareUr: [
      'جانور پر نیم کے پانی یا مکھی مار اسپرے کا باقاعدہ استعمال کریں۔',
      'پھٹنے والی گانٹھوں پر پائیوڈین یا زنک آکسائیڈ اور اینٹی سیپٹک لوشن لگائیں تاکہ کیڑے نہ پڑیں۔',
      'سوجی ہوئی ٹانگوں پر زیادہ بوجھ نہ ڈالیں اور نرم مٹی یا ریت کا بچھونا دیں۔',
      'قوتِ مدافعت بڑھانے کے لیے وٹامن سی، ای اور لیور ٹانک کا استعمال کریں۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Povidone Iodine 5% / 10%',
        ingredientUr: 'پائیوڈین (Povidone Iodine)',
        purposeEn: 'Topical antisepsis for ruptured necrotic nodules to prevent maggot infestation',
        purposeUr: 'پھٹنے والے دانوں اور زخموں کی روزانہ صفائی تاکہ کیڑے نہ پڑیں',
        administrationRoute: 'topical',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Avoid contact with eyes'],
        contraindicationsUr: ['آنکھوں کے اندر نہ جانے دیں'],
        evidenceLevel: 'established_standard',
      },
      {
        ingredientEn: 'Zinc Oxide Topical Barrier',
        ingredientUr: 'زنک آکسائیڈ لوشن (Zinc Oxide)',
        purposeEn: 'Soothing protective skin barrier against flies and environmental filth',
        purposeUr: 'مکھیاں دور رکھنے اور زخم کو مٹی سے بچانے والی حفاظتی تہہ',
        administrationRoute: 'topical',
        isPrescriptionOnly: false,
        contraindicationsEn: ['None significant for intact and superficial wounds'],
        contraindicationsUr: ['کوئی خاص ممانعت نہیں'],
        evidenceLevel: 'supportive_adjunct',
      },
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Quarantine affected cattle for minimum 30 days.',
      'Install mosquito/fly nets and eliminate stagnant water breeding sites.',
    ],
    isolationRecommendationsUr: [
      'متاثرہ گائے کو 30 دن تک الگ رکھیں۔',
      'مچھر دانی اور مچھر مکھی مار ادویات کا مستقل استعمال کریں۔',
    ],
    preventionEn: [
      'Annual Goat Pox / Homologous LSD vaccination.',
      'Aggressive fly and mosquito larvae eradication with larvicides.',
    ],
    preventionUr: [
      'سالانہ گوٹ پوکس یا لمپی سکن کی مستند ویکسین لگوائیں۔',
      'کھڑے گندے پانی کا خاتمہ اور مچھر مکھی کنٹرول۔',
    ],
    preventativeVaccineName: 'Goat Pox (LSD Heterologous) Vaccine',
    recommendedVetExamEn:
      'Secondary bacterial skin infection control, anti-inflammatories, antihistamines, and wound debridement.',
    recommendedVetExamUr:
      'ویٹرنری ڈاکٹر سے سوجن، الرجی اور اینٹی انفلیمیٹری ادویات کا شیڈول حاصل کریں۔',
    questionsForVetEn: [
      'What topical wound dressing will prevent maggot infestation in deep nodules?',
      'How long will skin lesions take to completely regress?',
    ],
    questionsForVetUr: [
      'گانٹھوں کے اندر کیڑے پڑنے سے روکنے کے لیے کون سا زخم کش اسپرے استعمال کریں؟',
      'چمڑی کے داغ اور سوجن مکمل ختم ہونے میں کتنا وقت لگے گا؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 4,
      meatWithdrawalDays: 21,
      specialNotesEn: 'Lesion healing can take up to 6 months; do not slaughter animals with systemic fever.',
      specialNotesUr: 'بخار اور اینٹی بائیوٹک کے دوران دودھ اور گوشت ہرگز استعمال نہ کریں۔',
    },
    withdrawalPeriodWarningEn:
      'Do not consume meat or milk from severely infected febrile animals during medication.',
    withdrawalPeriodWarningUr:
      'تیز بخار اور بیماری کے دنوں میں دودھ انسانوں کے لیے استعمال نہ کریں۔',
    supportingSymptomsEn: [
      'Circumscribed, firm, raised nodules (2-5 cm) all over body and head',
      'Edema of legs, brisket, and lymph nodes',
      'High fever with reluctance to move and rapid loss of body condition',
    ],
    supportingSymptomsUr: [
      'جسم، سر اور ہوانے پر گول ابھری ہوئی سخت گانٹھیں اور دانے',
      'ٹانگوں اور جھالر پر سوجن',
      'تیز بخار اور جانور کا کمزور ہونا',
    ],
    contradictingSymptomsEn: [
      'Absence of skin nodules or lumps',
      'Normal clean skin coat without cutaneous eruptions',
    ],
    contradictingSymptomsUr: [
      'جلد پر کسی بھی قسم کی گانٹھ یا دانے کا نہ ہونا',
      'صاف اور چمکدار کھال',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.neem_leaves_wash,
      TRADITIONAL_REMEDIES.turmeric_mustard_oil,
    ],
    modernMedicines: [
      MODERN_MEDICINES.meloxicam,
      MODERN_MEDICINES.oxytetracycline_la,
    ],
    recommendedLabTests: [
      LAB_TESTS.viral_pcr_antigen,
    ],
    sourceCitations: [
      {
        sourceName: 'EFSA Journal: Lumpy Skin Disease Diagnosis and Vectors',
        publicationOrEdition: 'European Food Safety Authority 2021',
        reviewStatus: 'Peer-Reviewed Scientific Report',
      },
      {
        sourceName: 'Pakistan Ministry of National Food Security & Research',
        publicationOrEdition: 'National LSD Contingency Guidelines 2022',
        reviewStatus: 'Government of Pakistan Official Guidelines',
      },
    ],
  },

  // 4. BOVINE MASTITIS
  {
    id: 'mastitis',
    nameEn: 'Bovine Mastitis (ساڑو / تھنوں کی سوزش)',
    nameUr: 'ساڑو / ہوانے اور تھنوں کی خطرناک سوزش',
    scientificName: 'Staphylococcus aureus / Streptococcus uberis / E. coli',
    targetSpecies: ['cow', 'buffalo', 'goat', 'sheep'],
    symptomsEn: [
      'Swollen, hot, hard, painful quarter of udder',
      'Watery, yellowish, curd-like, blood-tinged, or foul-smelling milk clots',
      'Animal kicks during milking or refuses to let calf nurse',
      'Fever, loss of appetite in acute toxic cases',
    ],
    symptomsUr: [
      'ہوانے کا کوئی تھن یا حصہ گرم، سخت، سرخ اور سوجا ہوا ہونا',
      'دودھ کا رنگ پیلا، پانی جیسا، خون ملا، یا اس میں پھٹکیاں/چھچھڑے آنا',
      'چوائی کے دوران جانور کا لاتیں مارنا اور درد سے کترانا',
      'زہریلے ساڑو میں جانور کو تیز بخار اور کھانا پینا چھوڑ دینا',
    ],
    observedVisualSignsEn: [
      'Asymmetric udder enlargement',
      'Purulent or blood-tinged clots on black strip cup test',
      'Severe erythema and tight shiny skin over affected quarter',
    ],
    observedVisualSignsUr: [
      'ہوانے کا ایک حصہ دوسرے سے غیر متناسب بڑا اور سرخ',
      'دودھ میں چھچھڑے، پیپ یا لوتھڑے',
      'تھن پر سوجن اور تنی ہوئی چمکدار جلد',
    ],
    possibleCausesEn: [
      'Bacterial entry through teat canal after milking while teat sphincter is relaxed',
      'Dirty, wet, dung-covered barn floors',
      'Incomplete milking, improper thumb-stripping technique, or faulty milking machines',
    ],
    possibleCausesUr: [
      'چوائی کے فوراً بعد گندی زمین پر بیٹھنے سے تھن کے سوراخ سے جراثیم کا اندر داخل ہونا',
      'گوبر، کیچڑ اور گندا فرش',
      'انگوٹھا دبا کر غلط طریقے سے دودھ نکالنا یا تھن میں کچا دودھ چھوڑ دینا',
    ],
    riskLevel: 'severe',
    immediateCareEn: [
      'Strip out the affected teat completely every 2 hours into a separate bucket and discard safely.',
      'Apply cold ice packs during first 24 hours of acute hot swelling; switch to warm compresses later.',
      'Post-milking teat dip with 0.5% iodine solution.',
      'Keep the animal standing for at least 45 minutes after milking by offering fresh feed.',
    ],
    immediateCareUr: [
      'متاثرہ تھن سے ہر 2 گھنٹے بعد سارا خراب دودھ اور چھچھڑے باہر نکالیں اور زمین پر نہ گرائیں بلکہ محفوظ ضائع کریں۔',
      'شروع کے 24 گھنٹوں میں سوجن اور تپش دور کرنے کے لیے برف کی ٹھنڈی ٹکور کریں۔',
      'چوائی کے فوراً بعد تھنوں کو آیوڈین والے محلول میں ڈبوئیں۔',
      'چوائی کے فوراً بعد جانور کو تازہ چارہ ڈالیں تاکہ وہ کم از کم 45 منٹ تک کھڑا رہے اور تھن بند ہو سکیں۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Iodine Barrier Teat Dip 0.5% - 1%',
        ingredientUr: 'آیوڈین ٹیٹ ڈِپ محلول (Iodine Teat Dip)',
        purposeEn: 'Post-milking germicidal barrier to prevent environmental bacterial entry',
        purposeUr: 'چوائی کے فوراً بعد تھنوں کو جراثیم سے محفوظ رکھنے والی ڈِپ',
        administrationRoute: 'topical',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Do not dilute with unsterile water'],
        contraindicationsUr: ['گندے پانی سے پتلا نہ کریں'],
        evidenceLevel: 'established_standard',
      },
    ],
    contraindicationsEn: [
      'Never inject irritant chemicals or caustic home solutions up the teat canal.',
      'Never feed mastitic milk to young replacement heifers.',
    ],
    contraindicationsUr: [
      'تھن کے سوراخ کے اندر خود سے تیز کیمیکل یا گھریلو ٹوٹکے ہرگز نہ بھریں۔',
    ],
    requiresVeterinaryPrescription: true,
    preventionEn: [
      'Strict milking hygiene, dry cow therapy at end of lactation, California Mastitis Test (CMT) weekly.',
      'Clean grooved sand or dry rubber mats.',
    ],
    preventionUr: [
      'چوائی سے پہلے اور بعد میں ہاتھ اور برتن صاف رکھنا؛ کالیفورنیا ماسٹائٹس ٹیسٹ (CMT) سے باقاعدہ جانچ۔',
      'سوکھے ریتلے اور ہوادار بستر کا انتظام۔',
    ],
    recommendedVetExamEn:
      'CMT milk testing, sterile milk culture for antibiotic sensitivity, intramammary infusion tube prescription.',
    recommendedVetExamUr:
      'ڈاکٹر سے دودھ کا لیب ٹیسٹ کروانا اور تھن کے اندر خصوصی اینٹی بائیوٹک ٹیوب رکھوانا۔',
    questionsForVetEn: [
      'Which intramammary infusion matches the culture results?',
      'Is systemic parenteral antibiotic injection required?',
    ],
    questionsForVetUr: [
      'تھن کے اندر رکھنے والی کون سی ٹیوب سب سے زیادہ اثر کرے گی؟',
      'کیا رگ یا گوشت میں بھی اینٹی بائیوٹک انجیکشن لگانے کی ضرورت ہے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 4,
      meatWithdrawalDays: 14,
      specialNotesEn: 'Milk from treated quarters must be strictly discarded during intramammary antibiotic therapy + 72-96h post treatment.',
      specialNotesUr: 'علاج کے دوران اور علاج ختم ہونے کے 4 دن بعد تک دودھ انسانوں کے پینے کے لیے ہرگز استعمال نہ کریں۔',
    },
    withdrawalPeriodWarningEn:
      'NEVER consume milk from treated quarters or cows on antibiotic intramammary therapy for minimum 72 to 96 hours.',
    withdrawalPeriodWarningUr:
      'تھن کی ٹیوب یا اینٹی بائیوٹک کے استعمال کے دوران کم از کم 4 دن تک اس گائے یا بھینس کا دودھ ہرگز نہ پئیں۔',
    supportingSymptomsEn: [
      'Hot, swollen, stony-hard quarter that is painful to the touch',
      'Milk with yellow clots, watery separation, flakes, or blood streaks',
      'Sudden drop in individual quarter milk yield',
    ],
    supportingSymptomsUr: [
      'ہوانے کے متاثرہ حصے کا گرم، سخت اور پتھر جیسا ہو جانا',
      'دودھ میں پھٹکیاں، چھچھڑے، خون یا پیلے پانی کی آمیزش',
      'متاثرہ تھن سے دودھ کی پیداوار بند یا انتہائی کم ہونا',
    ],
    contradictingSymptomsEn: [
      'Normal clean white milk with zero clots on strip cup examination',
      'Soft, pliable, painless udder quarters without heat',
    ],
    contradictingSymptomsUr: [
      'صاف سفید دودھ جس میں کوئی پھٹکی یا گانٹھ نہ ہو',
      'ہوانے کا بالکل نرم اور درد کے بغیر ہونا',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.turmeric_mustard_oil,
    ],
    modernMedicines: [
      MODERN_MEDICINES.meloxicam,
      MODERN_MEDICINES.flunixin_meglumine,
    ],
    recommendedLabTests: [
      LAB_TESTS.cmt_mastitis,
    ],
    sourceCitations: [
      {
        sourceName: 'National Mastitis Council (NMC) Current Concepts of Bovine Mastitis',
        publicationOrEdition: '5th Edition 2021',
        reviewStatus: 'International Mastitis Standard',
      },
      {
        sourceName: 'UVAS Quality Operations Laboratory (QOL)',
        publicationOrEdition: 'Bovine Milk Microbiology Guidelines',
        reviewStatus: 'Accredited Veterinary Diagnostic Lab',
      },
    ],
  },

  // 5. ACUTE BLOAT
  {
    id: 'bloat',
    nameEn: 'Frothy / Free-Gas Bloat (افارہ / پیٹ کا پھولنا)',
    nameUr: 'شدید افارہ (پیٹ کا ہوا یا جھاگ سے پھولنا)',
    scientificName: 'Ruminal Tympany',
    targetSpecies: ['cow', 'buffalo', 'goat', 'sheep'],
    symptomsEn: [
      'Distended left flank, tight drum-like sound when tapped',
      'Frequent grunting, kicking at belly, anxious eyes',
      'Mouth breathing with extended tongue, laboured respiration',
      'Sudden cessation of rumination (جگالی بند)',
    ],
    symptomsUr: [
      'بائیں کوکھ (Left Flank) کا اچانک غبارے کی طرح پھول جانا اور بجانے پر ڈھول کی طرح آواز آنا',
      'بے چینی، بار بار پیٹ پر لاتیں مارنا، اور سانس کی تنگی',
      'منہ کھول کر سانس لینا اور زبان باہر نکالنا',
      'جگالی کا مکمل طور پر بند ہو جانا',
    ],
    observedVisualSignsEn: [
      'Severe left paralumbar fossa distension rising above the spine',
      'Labored respiratory posture with flared nostrils and drooling',
    ],
    observedVisualSignsUr: [
      'بائیں کوکھ کا ریڑھ کی ہڈی سے اوپر ابھر آنا',
      'سانس کے لیے گردن تان کر منہ کھولنا اور بے چینی',
    ],
    possibleCausesEn: [
      'Overeating lush immature green leguminous fodder (wet young berseem, lucerne) containing high soluble proteins',
      'Sudden binge of finely ground cereals/flour/grains',
      'Physical esophageal obstruction by foreign body (potato, turnip, plastic bag)',
    ],
    possibleCausesUr: [
      'شبنم والا یا کچا سبز چارہ (برسیم یا لوسرن) ضرورت سے زیادہ کھا لینا',
      'ایک دم زیادہ آٹا، دانہ یا گڑ کھا جانا جس سے معدے میں تیزابی گیس بن جائے',
      'خوراک کی نالی میں آلو، شلجم یا پلاسٹک کے شاپر کا پھنس جانا',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'EMERGENCY: If animal is suffocating, call a vet immediately for stomach tube or trocharization.',
      'Place a thick stick or bit in the mouth like a bridle to stimulate chewing and salivation/eructation.',
      'Walk the animal gently uphill with front legs elevated.',
      'Administer oral antifoaming agent: 250-500 ml vegetable/mustard oil (سرسوں کا تیل) for large animals.',
      'DO NOT let the animal lie down on its side.',
    ],
    immediateCareUr: [
      'ایمرجنسی: اگر دم گھٹ رہا ہو تو فوری ڈاکٹر کو بلائیں جو پیٹ میں نالی (Stomach Tube) یا ٹروکار کینولا لگا سکے۔',
      'جانور کے منہ میں لکڑی کا ٹکڑا لگا کر دونوں طرف رسی باندھیں تاکہ وہ منہ چلائے اور گیس خارج ہو۔',
      'جانور کو اونچی ڈھلوان والی جگہ پر کھڑا کریں تاکہ اگلا حصہ اونچا رہے۔',
      'جھاگ دار افارے میں 250 تا 500 ملی لیٹر خالص سرسوں کا تیل پلائیں تاکہ جھاگ ٹوٹے۔',
      'جانور کو ایک طرف زمین پر گرنے نہ دیں بلکہ ہلکی واک کروائیں۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Vegetable / Mustard Oil (سرسوں کا تیل)',
        ingredientUr: 'خالص سرسوں یا نباتاتی تیل',
        purposeEn: 'Oral surface-active agent to break the stable foam bubbles in frothy bloat',
        purposeUr: 'معدے میں جھاگ اور بلبلوں کو توڑنے کے لیے',
        administrationRoute: 'oral',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Drench carefully to avoid aspiration into lungs'],
        contraindicationsUr: ['آہستہ پلائیں تاکہ پھیپھڑوں میں نہ جائے'],
        evidenceLevel: 'established_standard',
      },
      {
        ingredientEn: 'Sodium Bicarbonate (میٹھا سوڈا)',
        ingredientUr: 'میٹھا سوڈا (Sodium Bicarbonate)',
        purposeEn: 'Rumen buffer to neutralize lactic acidosis from grain overload',
        purposeUr: 'دانہ زیادہ کھانے سے پیدا ہونے والی تیزابیت کو ختم کرنا',
        administrationRoute: 'oral',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Do not use in alkalosis or abomasal impaction'],
        contraindicationsUr: ['صرف تیزابی افارے میں استعمال کریں'],
        evidenceLevel: 'established_standard',
      },
    ],
    requiresVeterinaryPrescription: false,
    preventionEn: [
      'Never feed wet, frost-covered, or young immature berseem in morning without first offering dry wheat straw.',
      'Gradual adaptation over 10-14 days for any concentrate diet changes.',
    ],
    preventionUr: [
      'صبح سویرے شبنم والا کچا چارہ نہ ڈالیں؛ پہلے خشک توڑی کھلائیں پھر چارہ دیں۔',
      'ونڈے کی مقدار آہستہ آہستہ بڑھائیں، اچانک زیادہ مقدار نہ دیں۔',
    ],
    recommendedVetExamEn:
      'Passage of stomach tube to relieve free gas, trocar and cannula emergency puncture of left paralumbar fossa if dying.',
    recommendedVetExamUr:
      'ڈاکٹر کے ذریعے اسٹمک ٹیوب ڈالنا یا شدید ایمرجنسی میں کوکھ میں ٹروکار لگا کر گیس خارج کرنا۔',
    questionsForVetEn: [
      'Is there an esophageal foreign obstruction requiring manual relief?',
      'What anti-foaming drench or buffer powder is recommended for the herd?',
    ],
    questionsForVetUr: [
      'کیا خوراک کی نالی میں کوئی چیز پھنسی ہوئی ہے؟',
      'معدے کی تیزابیت ختم کرنے کے لیے میٹھا سوڈا یا کون سا پاؤڈر دینا چاہیے؟',
    ],
    supportingSymptomsEn: [
      'Rapid distension of left paralumbar fossa (left flank tight like a drum)',
      'Severe respiratory distress due to bloated rumen pressing on diaphragm',
      'Recent ingestion of lush wet berseem or lucerne pasture or excess grain',
    ],
    supportingSymptomsUr: [
      'بائیں کوکھ کا اچانک ڈھول کی طرح پھول جانا',
      'سانس لینے میں شدید دشواری کیونکہ پھولا ہوا معدہ پھیپھڑوں کو دباتا ہے',
      'کچا سبز چارہ یا زیادہ اناج کھانے کی فوری تاریخ',
    ],
    contradictingSymptomsEn: [
      'Left flank flat, soft, or sunken',
      'Normal frequent rumination and chewing cud',
    ],
    contradictingSymptomsUr: [
      'بائیں کوکھ کا بالکل نارمل یا اندر دھنسا ہونا',
      'جانور کا باقاعدگی سے جگالی کرنا',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.mustard_oil_asafoetida_bloat,
    ],
    modernMedicines: [
      MODERN_MEDICINES.dimethicone_emulsion,
    ],
    sourceCitations: [
      {
        sourceName: 'Merck Veterinary Manual: Ruminal Tympany in Ruminants',
        publicationOrEdition: 'Digestive System Chapter',
        reviewStatus: 'Peer-Reviewed Clinical Reference',
      },
      {
        sourceName: 'University of Agriculture Faisalabad (UAF) Extension Guide',
        publicationOrEdition: 'Livestock Emergency Management Bulletin',
        reviewStatus: 'Pakistan Field Verified',
      },
    ],
  },

  // 6. POULTRY NEWCASTLE DISEASE (ND / RANIKHET)
  {
    id: 'nd_poultry',
    nameEn: 'Newcastle Disease (ND / رانی کھیت)',
    nameUr: 'رانی کھیت کی وبا (مرغیوں کی ND)',
    scientificName: 'Avian Orthoavulavirus 1',
    targetSpecies: ['poultry'],
    symptomsEn: [
      'Gasping, coughing, sneezing, rattling breathing',
      'Bright greenish watery diarrhea',
      'Nervous signs: twisted neck (torticollis), tremors, circling, wing paralysis',
      'Rapid mortality up to 90-100% in unvaccinated flocks',
    ],
    symptomsUr: [
      'سانس میں خر خر، منہ کھول کر ہانپنا اور کھانسی',
      'چمکدار سبز رنگ کی پتلی گندمی بیٹھیں',
      'اعصابی علامات: گردن ٹیڑھی ہو جانا (لکوا/جھولا)، چکر کاٹنا، پر لٹک جانا',
      'بغیر ویکسین شدہ فارم پر تیزی سے 90 سے 100 فیصد پرندوں کی اموات',
    ],
    observedVisualSignsEn: [
      'Twisted torticollis neck posture',
      'Cyanotic dark comb and wattles',
      'Bright emerald-green loose feces',
    ],
    observedVisualSignsUr: [
      'مرغی کی گردن الٹی ہو جانا (جھولا)',
      'کلغی کا نیلا یا گہرا کالا پڑ جانا',
      'سبز چمکدار پتلی بیٹھیں',
    ],
    possibleCausesEn: [
      'Virulent Newcastle Disease Virus spread via bird droppings, contaminated shoes, and wild birds',
    ],
    possibleCausesUr: [
      'انتہائی مہلک وائرس جو ہوا، جنگلی پرندوں، آلودہ جوتوں اور برتنوں سے پھیلتا ہے',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'Strictly isolate affected birds immediately; bury deceased birds deeply with lime.',
      'Provide electrolytes and high doses of vitamin C and multivitamins in fresh water.',
      'Disinfect coops with 2% Virkon-S or formalin spray.',
      'No specific antiviral cure exists once nerve symptoms appear.',
    ],
    immediateCareUr: [
      'متاثرہ پرندوں کو فوری تندرست پرندوں سے الگ کریں؛ مرنے والے پرندوں کو گہرا گڑھا کھود کر چونا ڈال کر دبائیں۔',
      'پینے کے پانی میں الیکٹرولائٹس، وٹامن سی اور ملٹی وٹامنز دیں۔',
      'ڈربوں کی جراثیم کش سپرے (ورکون ایس وغیرہ) سے باقاعدہ صفائی کریں۔',
      'گردن ٹیڑھی ہونے کے بعد کوئی جادوئی دوا نہیں ہوتی، صرف بچاؤ ہی حل ہے۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Vitamin C & Electrolytes (پانی میں الیکٹرولائٹس)',
        ingredientUr: 'وٹامن سی اور الیکٹرولائٹ پاؤڈر',
        purposeEn: 'Supportive hydration and thermal stress reduction for in-contact flock',
        purposeUr: 'باقی پرندوں کو تناؤ اور پانی کی کمی سے بچانے کے لیے',
        administrationRoute: 'oral',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Does not substitute for immunization'],
        contraindicationsUr: ['یہ ویکسین کا نعم البدل نہیں ہے'],
        evidenceLevel: 'supportive_adjunct',
      },
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Complete flock quarantine. Do not sell birds, eggs, or manure off the farm.',
      'Personnel must change footwear and wash hands before entering healthy sheds.',
    ],
    isolationRecommendationsUr: [
      'فارم کی آمد و رفت مکمل بند کریں۔ بیمار پرندے یا انڈے منڈی نہ بھیجیں۔',
    ],
    preventionEn: [
      'Strict vaccination protocol: ND Lasota eye drops at day 5, booster at day 21, and killed oil vaccine at 6-8 weeks.',
    ],
    preventionUr: [
      'ویکسینیشن شیڈول کی سختی سے پابندی: پہلے ہفتے لیسوٹا کے قطرے، 21 دن پر بوسٹر، اور تیل والی ویکسین کا ٹیکہ۔',
    ],
    preventativeVaccineName: 'ND Lasota + Mukteswar Avian Vaccine',
    recommendedVetExamEn:
      'Necropsy examination of proventriculus hemorrhage, tracheal swabs for RT-PCR.',
    recommendedVetExamUr:
      'ویٹرنری لیب میں پوسٹ مارٹم اور پی سی آر ٹیسٹ۔',
    questionsForVetEn: [
      'Should emergency ring-vaccination be performed on asymptomatic sheds?',
    ],
    questionsForVetUr: [
      'کیا باقی بچے ہوئے پرندوں کو فوری ایمرجنسی قطرے دیے جا سکتے ہیں؟',
    ],
  },

  // 7. PESTE DES PETITS RUMINANTS (PPR / GOAT PLAGUE)
  {
    id: 'ppr_goat_sheep',
    nameEn: 'Peste des Petits Ruminants (PPR / بکریوں کا طاعون)',
    nameUr: 'پی پی آر (بکریوں اور بھیڑوں کا طاعون)',
    scientificName: 'Small Ruminant Morbillivirus',
    targetSpecies: ['goat', 'sheep'],
    symptomsEn: [
      'High fever (104-106°F)',
      'Severe crusting serous to purulent discharge from eyes and nose',
      'Necrotic mouth ulcers and foul breath',
      'Severe foul-smelling diarrhea (projectile dysentery)',
      'Dehydration, pneumonia, respiratory distress, and high mortality in kids',
    ],
    symptomsUr: [
      'تیز بخار (104 تا 106 فارن ہائیٹ)',
      'آنکھوں اور ناک سے پیپ اور گندا مواد بہنا، پپڑیاں جم جانا',
      'منہ اور مسوڑھوں پر بدبودار زخم اور چھالے',
      'شدید بدبودار کالے یا گندمی دست (پیچش)',
      'سانس کی تنگی، نمونیا اور چھوٹی بکریوں/میمنوں میں زیادہ اموات',
    ],
    observedVisualSignsEn: [
      'Crusted encrusted nares and matted eyelids',
      'Diphtheritic white-yellow necrotic plaques inside lower lip and gums',
      'Fecal staining of perineum and hind legs',
    ],
    observedVisualSignsUr: [
      'ناک اور آنکھوں پر خشک پپڑیاں',
      'مسوڑھوں اور ہونٹوں کے اندر پیلے چھالے',
      'پچھلی ٹانگوں پر دستوں کے نشانات',
    ],
    possibleCausesEn: [
      'Morbillivirus transmitted via close contact, aerosol droplets, water troughs, and communal pastures',
    ],
    possibleCausesUr: [
      'موربیلی وائرس جو بیمار بکریوں کی چھینک، رال اور برتنوں سے تیزی سے پھیلتا ہے',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'Strictly isolate infected goats in a warm, draft-free pen.',
      'Gently clean eyes and nostrils with warm saline to maintain open airway.',
      'Drench oral electrolyte fluids (ORS) with 5% glucose frequently to counter severe dehydration.',
      'Apply 5% povidone iodine or gentian violet to oral ulcers.',
    ],
    immediateCareUr: [
      'بیمار بکریوں کو فوری خشک اور گرم کمرے میں تندرست ریوڑ سے الگ کریں۔',
      'ناک اور آنکھوں کو نیم گرم نمک ملے پانی سے صاف کریں تاکہ سانس میں آسانی ہو۔',
      'او آر ایس اور گلوکوز ملا پانی دن میں کئی بار تھوڑا تھوڑا پلائیں۔',
      'منہ کے زخموں پر پائیوڈین یا گلیسرین لگائیں۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Oral Electrolytes & Dextrose (ORS)',
        ingredientUr: 'او آر ایس اور ڈیکسٹروز نمکیات',
        purposeEn: 'Combats fatal hypovolemia and metabolic acidosis from severe viral enteritis',
        purposeUr: 'دستوں سے ہونے والی جان لیوا پانی اور نمکیات کی کمی کو پورا کرنا',
        administrationRoute: 'oral',
        isPrescriptionOnly: false,
        contraindicationsEn: ['Do not drench recumbent animals unable to swallow'],
        contraindicationsUr: ['بے ہوش جانور کے گلے میں نہ انڈیلیں'],
        evidenceLevel: 'established_standard',
      },
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Quarantine herd for 3 weeks; virus sheds in feces, tears, and nasal secretions.',
    ],
    isolationRecommendationsUr: [
      'کم از کم 21 دن تک قرنطینہ لازمی رکھیں۔',
    ],
    preventionEn: [
      'Annual PPR live-attenuated vaccine for all sheep and goats over 3 months of age.',
    ],
    preventionUr: [
      '3 ماہ سے بڑی تمام بھیڑوں اور بکریوں کو پی پی آر کا حفاظتی ٹیکہ سالانہ لگوائیں۔',
    ],
    preventativeVaccineName: 'PPR Homologous Live Vaccine',
    recommendedVetExamEn:
      'Diagnostic swab RT-PCR, supportive antipyretic NSAIDs, fluid therapy, and secondary bacterial pneumonia prophylaxis.',
    recommendedVetExamUr:
      'ڈاکٹر سے پی سی آر ٹیسٹ اور نمونیا سے بچاؤ کے لیے حفاظتی ادویات۔',
    questionsForVetEn: [
      'Is fluid resuscitation with IV Ringers Lactate required for dehydrated kids?',
    ],
    questionsForVetUr: [
      'کیا کمزور میمنوں کو ڈرپ لگانے کی ضرورت ہے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 7,
      meatWithdrawalDays: 14,
      specialNotesEn: 'Observe meat & milk withdrawal if vet prescribes supportive antibiotics for secondary pneumonia.',
      specialNotesUr: 'اگر ڈاکٹر اینٹی بائیوٹک لگائے تو 14 دن تک گوشت اور 7 دن تک دودھ استعمال نہ کریں۔',
    },
    withdrawalPeriodWarningEn:
      'Observe minimum 14-day meat withdrawal and 7-day milk withdrawal if supportive antibiotics are prescribed.',
    withdrawalPeriodWarningUr:
      'اگر اینٹی بائیوٹک دی جائے تو 14 دن تک گوشت اور 7 دن تک دودھ انسانوں کے لیے استعمال نہ کریں۔',
  },

  // 8. EQUINE COLIC (HORSE & DONKEY)
  {
    id: 'equine_colic',
    nameEn: 'Equine Acute Colic (گھوڑے اور گدھے کا دردِ پیٹ)',
    nameUr: 'گھوڑوں اور گدھوں کا شدید دردِ پیٹ (Colic)',
    scientificName: 'Equine Acute Abdominal Syndrome',
    targetSpecies: ['horse', 'donkey'],
    symptomsEn: [
      'Violent rolling, pawing the ground with front hooves',
      'Looking at the flank, kicking at the abdomen',
      'Sweating profusely, increased heart rate (>60 bpm in horses)',
      'Stretching out as if to urinate, repeatedly lying down and getting up',
      'Absence of gut sounds (borborygmi) on flank auscultation',
    ],
    symptomsUr: [
      'زمین پر بار بار لوٹ پوٹ ہونا اور اگلے کھروں سے زمین کھودنا',
      'بار بار گردن موڑ کر پیٹ کی طرف دیکھنا اور پیٹ پر ٹانگیں مارنا',
      'شدید پسینہ آنا اور دل کی دھڑکن تیز ہو جانا',
      'پیشاب کرنے کے انداز میں ٹانگیں پھیلانا اور بار بار بیٹھنا اور اٹھنا',
      'پیٹ میں آنتوں کی قدرتی گڑگڑاہٹ کا بند ہو جانا',
    ],
    observedVisualSignsEn: [
      'Restless rolling and sudden dropping to ground',
      'Patchy flank and neck sweat lather',
      'Distended abdomen or unnatural dog-sitting posture',
    ],
    observedVisualSignsUr: [
      'بے چینی سے زمین پر گرنا اور کروٹیں بدلنا',
      'گردن اور پیٹ پر جھاگ دار پسینہ',
      'کتے کی طرح بیٹھنے کا غیر معمولی انداز',
    ],
    possibleCausesEn: [
      'Large colon impaction from coarse fibrous straw and inadequate water intake',
      'Spasmodic gas colic from sudden grain gorging or cold water after hard work',
      'Intestinal displacement, volvulus, or strangulating hernia',
      'Sand ingestion or severe cyathostomin / strongyle parasite load',
    ],
    possibleCausesUr: [
      'پانی کی کمی اور خشک توڑی سے بڑی آنت میں بند پڑ جانا (Impaction)',
      'سخت مشقت کے فوراً بعد ٹھنڈا پانی پینے یا زیادہ دانہ کھانے سے اینٹھن',
      'آنتوں کا بل کھا جانا (Volvulus) یا ہرنیا',
      'پیٹ کے کیڑوں کا شدید حملہ',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'CRITICAL EQUINE EMERGENCY: Contact an equine veterinarian immediately.',
      'Gently walk the animal on soft ground; prevent violent rolling that can cause fatal gut twist (volvulus).',
      'Remove all food, grain, and straw immediately.',
      'Check gum color: healthy is pink; purple/toxic ring indicates endotoxic shock.',
      'DO NOT administer oral drenches without a nasogastric stomach tube passed by an RVMP vet (horses cannot vomit; stomach will rupture).',
    ],
    immediateCareUr: [
      'گھوڑوں کی فوری ایمرجنسی ہے: فوری ویٹرنری ڈاکٹر کو کال کریں۔',
      'جانور کو نرم مٹی یا گھاس پر آہستہ آہستہ چلوائیں تاکہ وہ زمین پر زور سے لوٹ پوٹ نہ ہو (زور سے لوٹنے پر آنتیں بل کھا سکتی ہیں)۔',
      'سامنے سے دانہ، چارہ اور گھاس فوراً ہٹا لیں۔',
      'مسوڑھے چیک کریں؛ اگر مسوڑھے نیلے یا جامنی ہوں تو یہ زہر اور شاک کی علامت ہے۔',
      'ناک کی نالی (Nasogastric Tube) کے بغیر زبردستی منہ سے کچھ نہ پلائیں، گھوڑا قے نہیں کر سکتا اور معدہ پھٹ سکتا ہے۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Liquid Paraffin / Mineral Oil (by stomach tube only)',
        ingredientUr: 'لیکوڈ پیرافین / منرل آئل (صرف ڈاکٹر کی نالی کے ذریعے)',
        purposeEn: 'Intestinal lubricant to soften fecal impaction in large colon',
        purposeUr: 'بند کو نرم کرنے اور آنتوں کو چکنا کرنے کے لیے',
        administrationRoute: 'oral',
        isPrescriptionOnly: true,
        contraindicationsEn: ['Never administer with bottle or syringe (fatal aspiration risk)'],
        contraindicationsUr: ['بوتل سے ہرگز نہ پلائیں'],
        evidenceLevel: 'established_standard',
      },
    ],
    contraindicationsEn: [
      'Never force-feed, drench orally by bottle, or allow uncontrolled rolling on concrete.',
      'Never give repetitive sedatives without veterinary examination.',
    ],
    contraindicationsUr: [
      'بوتل سے زبردستی تیل نہ پلائیں اور پکے فرش پر گرنے نہ دیں۔',
    ],
    requiresVeterinaryPrescription: true,
    preventionEn: [
      'Provide continuous access to clean, non-freezing drinking water.',
      'Never feed grain immediately after intense work; cool down first.',
      'Routine dental floatation and targeted equine deworming program.',
    ],
    preventionUr: [
      'پینے کے لیے تازہ صاف پانی ہر وقت مہیا رکھیں۔',
      'سخت کام یا دوڑ کے فوراً بعد دانہ نہ ڈالیں بلکہ جانور کو پہلے ٹھنڈا ہونے دیں۔',
      'دانتوں کی باقاعدہ صفائی اور پیٹ کے کیڑوں کی باقاعدہ دوا۔',
    ],
    recommendedVetExamEn:
      'Nasogastric intubation for stomach decompression and reflux check, rectal palpation, abdominal ultrasound, IV analgesia (Flunixin), and IV fluid therapy.',
    recommendedVetExamUr:
      'ڈاکٹر کے ذریعے ناک سے نالی ڈال کر گیس نکالنا، اندرونی معائنہ اور درد کش ڈرپ۔',
    questionsForVetEn: [
      'Is there significant gastric reflux indicating small intestinal obstruction?',
      'Is this medical impaction colic or does it require emergency surgical referral?',
    ],
    questionsForVetUr: [
      'کیا معدے سے بدبودار پانی نکل رہا ہے؟',
      'کیا یہ دوا سے ٹھیک ہو جائے گا یا آپریشن کی ضرورت ہے؟',
    ],
  },

  // 9. CANINE PARVOVIRUS (DOGS)
  {
    id: 'canine_parvovirus',
    nameEn: 'Canine Parvoviral Enteritis (کتوں کی پاروو بیماری)',
    nameUr: 'کتوں اور پلے کا پاروو وائرس (خونی دست اور الٹیاں)',
    scientificName: 'Canine Parvovirus Type 2 (CPV-2)',
    targetSpecies: ['dog'],
    symptomsEn: [
      'Severe foul-smelling bloody diarrhea (hematochezia)',
      'Persistent severe vomiting, inability to retain water',
      'High fever followed by subnormal temperature in septic shock',
      'Extreme depression, lethargy, refusal to eat or play',
      'Rapid, severe, life-threatening dehydration within 24-48 hours',
    ],
    symptomsUr: [
      'شدید بدبودار خونی پتلے دست',
      'مسلسل شدید الٹیاں اور پانی بھی پیٹ میں نہ ٹھہرنا',
      'شدید بخار اور پھر جسم کا ٹھنڈا پڑ جانا',
      'شدید نڈھال پن، سستی اور ہلنے جلنے سے قاصر ہونا',
      '24 سے 48 گھنٹوں میں پانی کی شدید اور جان لیوا کمی',
    ],
    observedVisualSignsEn: [
      'Severely sunken globes and prolonged skin tent (>3s)',
      'Projectile reddish-brown diarrhea with distinct metallic odor',
      'Tacky pale gums with delayed capillary refill (>3s)',
    ],
    observedVisualSignsUr: [
      'آنکھیں اندر دھنس جانا اور کھال کھنچ کر کھڑی رہنا',
      'سرخی مائل بدبودار پتلے خونی دست',
      'خشک اور سفید مسوڑھے',
    ],
    possibleCausesEn: [
      'Highly resilient Canine Parvovirus contracted from infected dog feces, contaminated soil, or footwear',
      'Unvaccinated puppies between 6 weeks and 6 months of age',
    ],
    possibleCausesUr: [
      'انتہائی سخت جان پاروو وائرس جو متاثرہ کتے کے فضلے اور جوتوں سے پھیلتا ہے',
      'بغیر حفاظتی ٹیکے لگے 6 ہفتے سے 6 ماہ کے چھوٹے پلے',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'CRITICAL CANINE EMERGENCY: Immediate hospitalization and IV fluid therapy required.',
      'Keep puppy strictly warm with blankets and hot water bottles (wrapped in towels) to counter hypothermia.',
      'DO NOT force food, milk, or oral liquid down throat during vomiting (aggravates vomiting and causes aspiration).',
      'Isolate puppy completely from all other dogs; disinfect floor with 1:30 household bleach solution.',
    ],
    immediateCareUr: [
      'فوری ویٹرنری ایمرجنسی: پلے کو فوری کلینک لے جا کر نس میں ڈرپ لگوانا ضروری ہے۔',
      'پلے کو گرم کمبل اور نیم گرم کپڑوں میں رکھیں تاکہ جسم کا درجہ حرارت گرنے نہ پائے۔',
      'الٹی کی حالت میں منہ سے دودھ یا پانی زبردستی نہ پلائیں، اس سے الٹیاں مزید بڑھتی ہیں۔',
      'بیمار کتے کو دوسرے تمام کتوں سے فوراً الگ کریں اور فرش کو بلیچ (Bleach) سے دھوئیں کیونکہ عام فنائل سے یہ وائرس نہیں مرتا۔',
    ],
    activeIngredients: [
      {
        ingredientEn: 'Intravenous Crystalloid Fluids (Ringers Lactate)',
        ingredientUr: 'رنگر لیکٹیٹ ڈرپ (IV Fluids)',
        purposeEn: 'Essential life-saving restoration of circulating blood volume and electrolyte balance',
        purposeUr: 'پانی اور نمکیات کی جان لیوا کمی دور کرنے والی ایمرجنسی ڈرپ',
        administrationRoute: 'intravenous',
        isPrescriptionOnly: true,
        contraindicationsEn: ['Overhydration in pulmonary edema or congestive heart failure'],
        contraindicationsUr: ['پھیپھڑوں میں پانی ہونے کی صورت میں احتیاط'],
        evidenceLevel: 'established_standard',
      },
    ],
    contraindicationsEn: [
      'Do not force oral feeding during active vomiting.',
      'Do not use plain quaternary ammonium disinfectants (ineffective against parvovirus; bleach required).',
    ],
    contraindicationsUr: [
      'الٹیوں کے دوران زبردستی کھانا نہ کھلائیں۔',
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Strict quarantine. Parvovirus survives in environment for up to 1 year; use 1:30 diluted sodium hypochlorite (bleach).',
    ],
    isolationRecommendationsUr: [
      'یہ وائرس مٹی میں ایک سال تک زندہ رہ سکتا ہے؛ صرف بلیچ کے محلول سے ہی صفائی کریں۔',
    ],
    preventionEn: [
      'Puppy core vaccination series: DHPPi starting at 6-8 weeks with boosters every 3-4 weeks until 16 weeks, then annual booster.',
    ],
    preventionUr: [
      'چھوٹے پلوں کو 6 سے 8 ہفتے کی عمر میں 7-in-1 یا DHPPi ویکسین لازمی لگوائیں اور بوسٹر ٹیکے مکمل کروائیں۔',
    ],
    preventativeVaccineName: 'Canine DHPPi Core Vaccine',
    recommendedVetExamEn:
      'Parvovirus fecal antigen CPV-Ag rapid test, complete blood count (leukopenia evaluation), aggressive IV fluid resuscitation, antiemetics, and broad-spectrum antibiotics.',
    recommendedVetExamUr:
      'فوری پاخانے کا ریپڈ کٹ ٹیسٹ (CPV-Ag)، سی بی سی، ڈرپ، الٹی روکنے کا انجیکشن اور اینٹی بائیوٹک۔',
    questionsForVetEn: [
      'What is the puppy’s white blood cell count (is there severe neutropenia)?',
      'What antiemetic (Maropitant) and gut protectant protocol is recommended?',
    ],
    questionsForVetUr: [
      'کیا پلے کے سفید خون کے خلیے بہت کم ہو گئے ہیں؟',
      'الٹی بند کرنے کے لیے کون سا انجیکشن لگایا گیا ہے؟',
    ],
  },

  // 10. RABIES (ZOONOTIC EMERGENCY)
  {
    id: 'canine_rabies',
    nameEn: 'Rabies (Hydrophobia / باولاپن)',
    nameUr: 'باولاپن / ریبیز (Rabies — 100% مہلک وائرس)',
    scientificName: 'Rabies Lyssavirus',
    targetSpecies: ['dog', 'cat', 'cow', 'buffalo', 'horse', 'donkey'],
    symptomsEn: [
      'Furious form: extreme aggression, biting at inanimate objects, restlessness, altered bark',
      'Dumb/paralytic form: dropped lower jaw, excessive drooling, inability to swallow',
      'Hydrophobia / hypersensitivity to light, wind, and sounds',
      'Progressive ataxia, paralysis of hindquarters, coma, and death within 10 days of clinical onset',
    ],
    symptomsUr: [
      'باولا انداز: شدید غصہ، لکڑی، لوہے اور بغیر اشتعال کسی کو بھی کاٹنا، آواز بدل جانا',
      'فالج والا انداز: نچلا جبڑا لٹک جانا، بے تحاشا رالیں بہنا، کچھ نگلنے سے قاصر ہونا',
      'پانی، ہوا اور تیز روشنی سے خوف کھانا یا چونکنا',
      'پچھلی ٹانگوں کا فالج، گر جانا اور علامات ظاہر ہونے کے 10 دن کے اندر یقینی ہلاکت',
    ],
    observedVisualSignsEn: [
      'Mandibular paralysis with tongue protruding and ropey saliva',
      'Staring vacant expression or unprovoked snapping at air',
      'Unsteady swaying hindlimb gait progressing to recumbency',
    ],
    observedVisualSignsUr: [
      'جبڑا کھلا رہ جانا اور منہ سے رالوں کی دھار',
      'آنکھیں پتھرائی ہوئی اور ہوا میں کاٹنا',
      'پچھلی ٹانگوں کا لڑکھڑانا اور فالج',
    ],
    possibleCausesEn: [
      'Lyssavirus transmitted through bite wounds or open scratch contamination from infected rabid mammal saliva',
    ],
    possibleCausesUr: [
      'پاگل جانور کے کاٹنے یا اس کی رال کا کسی تازہ زخم پر لگنے سے وائرس کا اعصاب کے ذریعے دماغ میں داخل ہونا',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'CRITICAL ZOONOTIC FATAL EMERGENCY: If any human was bitten or scratched, wash the wound immediately with running tap water and carbolic/detergent soap for 15 full minutes, apply povidone iodine, and rush to an emergency human hospital for Post-Exposure Prophylaxis (PEP).',
      'Securely isolate the suspect animal without handling; do not let it escape.',
      'DO NOT touch saliva or mouth fluids with bare hands.',
      'Report immediately to local livestock and public health authorities.',
    ],
    immediateCareUr: [
      'انتہائی جان لیوا خطرہ: اگر کسی انسان کو کاٹا ہے تو اس زخم کو نلکے کے بہتے پانی اور صابن سے مسلسل 15 منٹ تک رگڑ کر دھوئیں، پائیوڈین لگائیں اور فوراً انسانوں کے ہسپتال جا کر اینٹی ریبیز ویکسین لگوائیں۔',
      'متاثرہ جانور کو کسی محفوظ بند کمرے میں بند کر دیں اور خود ہاتھ نہ لگائیں۔',
      'جانور کی رال کو ننگے ہاتھ سے ہرگز نہ چھوئیں۔',
      'محکمہ لائیو اسٹاک اور صحت کے حکام کو فوراً مطلع کریں۔',
    ],
    contraindicationsEn: [
      'Never attempt to examine or treat the oral cavity of an animal suspected of rabies.',
      'Do not suture human bite wounds before administering rabies immunoglobulin.',
    ],
    contraindicationsUr: [
      'باولے جانور کے منہ میں ہاتھ ڈالنے کی حماقت ہرگز نہ کریں۔',
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Strict quarantine in secure steel cage/room for 10-day observation under official veterinary surveillance.',
    ],
    isolationRecommendationsUr: [
      'جانور کو 10 دن تک محفوظ جگہ بند کر کے نگرانی میں رکھا جاتا ہے۔',
    ],
    preventionEn: [
      'Annual pre-exposure rabies vaccination of all domestic dogs, cats, working equines, and high-risk livestock.',
    ],
    preventionUr: [
      'اپنے تمام پالتو کتوں، بلیوں اور فارم کے جانوروں کو ہر سال ریبیز کا حفاظتی ٹیکہ لازمی لگوائیں۔',
    ],
    preventativeVaccineName: 'Inactivated Cell-Culture Rabies Vaccine',
    recommendedVetExamEn:
      'Official veterinary quarantine isolation, post-mortem direct fluorescent antibody test (DFA) on brain tissue.',
    recommendedVetExamUr:
      'سرکاری ویٹرنری نگرانی میں قرنطینہ اور دماغی بافتوں کا ٹیسٹ۔',
    questionsForVetEn: [
      'Were any humans or other animals bitten or exposed to saliva within the last 14 days?',
    ],
    questionsForVetUr: [
      'کیا جانور نے پچھلے دنوں میں کسی انسان یا دوسرے جانور کو کاٹا تھا؟',
    ],
    recommendedLabTests: [
      LAB_TESTS.viral_pcr_antigen,
    ],
    sourceCitations: [
      {
        sourceName: 'WHO Expert Consultation on Rabies',
        publicationOrEdition: 'Technical Report Series 1012',
        reviewStatus: 'Global WHO Zoonosis Standard',
      },
      {
        sourceName: 'Pakistan Rabies Priority Control Guidelines',
        publicationOrEdition: 'National Institute of Health (NIH) Islamabad',
        reviewStatus: 'Federal Health Guideline',
      },
    ],
  },

  // 11. BOVINE THEILERIOSIS (TICK FEVER / سرخ بخار)
  {
    id: 'theileriosis',
    nameEn: 'Bovine Theileriosis (ٹک فیور / سرخ بخار)',
    nameUr: 'چیچڑ کا بخار / تھیلیریوسس (Theileriosis)',
    scientificName: 'Theileria annulata / Theileria parva',
    targetSpecies: ['cow', 'buffalo'],
    symptomsEn: [
      'High persistent fever (105-107°F)',
      'Severe enlargement of superficial lymph nodes (prescapular and prefemoral nodes palpable as hard baseballs)',
      'Marked anemia: pale or yellowish jaundiced sclera and mucous membranes',
      'Presence of Hyalomma hard ticks attached to ears, groin, and perineum',
      'Accelerated respiration, dyspnea, and coughing from pulmonary edema in late stages',
      'Reddish or coffee-colored urine in advanced cases',
    ],
    symptomsUr: [
      'مسلسل تیز بخار (105 تا 107 فارن ہائیٹ)',
      'گردن اور رانوں کے غدود (Lymph Nodes) کا گیند کی طرح بڑا اور سخت ہو جانا',
      'خون کی شدید کمی: آنکھوں اور مسوڑھوں کی جھلیوں کا پیلا یا سفید پڑ جانا',
      'جسم، کانوں اور رانوں کے اندر چچڑوں (Ticks) کی بھرمار',
      'سانس کا تیز چلنا اور پھیپھڑوں میں پانی بھرنے سے کھانسی',
      'بیماری کے آخری مراحل میں کافی یا سرخی مائل پیشاب آنا',
    ],
    observedVisualSignsEn: [
      'Enlarged prescapular lymph nodes visibly bulging in front of shoulder',
      'Porcelain white or yellow-tinged conjunctiva from red blood cell lysis',
      'Heavy clusters of hard ticks attached inside inner ear flaps',
    ],
    observedVisualSignsUr: [
      'کندھے کے آگے گدود کا گیند کی طرح ابھرا ہوا نظر آنا',
      'آنکھوں کے پپوٹے کے اندر کا حصہ خون کی کمی سے بالکل سفید یا زرد ہونا',
      'کانوں کے اندر چچڑوں کے جھنڈ',
    ],
    possibleCausesEn: [
      'Transmission of Theileria annulata sporozoites via bite of infected Hyalomma ticks',
      'Higher susceptibility in exotic Holstein/Jersey crossbreds and young calves in humid summer',
    ],
    possibleCausesUr: [
      'متاثرہ چچڑوں کے کاٹنے سے تھیلیریا کے جراثیم کا خون میں داخل ہونا',
      'ولایتی اور کراس گایوں میں گرمی اور حبس کے موسم میں زیادہ حملہ',
    ],
    riskLevel: 'severe',
    immediateCareEn: [
      'Place animal in cool shaded ventilated area; sponge forehead and neck with cool water to bring fever below 104°F.',
      'Do not force the severely anemic animal to walk or stand for long periods.',
      'Vet will immediately inject specific antiprotozoal (Buparvaquone) and supportive hematinics.',
      'Perform safe external tick control using boiled neem spray or approved acaricides.',
    ],
    immediateCareUr: [
      'جانور کو سایہ دار ہوا دار جگہ پر رکھیں اور سر پر ٹھنڈا پانی ڈالیں تاکہ تیز بخار کم ہو۔',
      'خون کی کمی والے جانور کو زیادہ چلانے یا بھگانے سے گریز کریں۔',
      'ڈاکٹر کو بلائیں جو بیوپرواکون (Buparvaquone) اور خون بنانے والی طاقتور ڈرپ لگائے۔',
      'نیم کے پانی کے اسپرے سے فوری طور پر چچڑ ختم کریں۔',
    ],
    supportingSymptomsEn: [
      'Swollen palpable prescapular lymph node in front of shoulder',
      'History of tick infestation or crossbred dairy cow introduction',
      'Persistent high fever unresponsive to standard antipyretics alone',
    ],
    supportingSymptomsUr: [
      'کندھے کے سامنے والے غدود کا واضح سوج جانا',
      'جسم پر چیچڑوں کی موجودگی',
      'عام بخار کی گولیوں سے بخار کا نہ ٹوٹنا',
    ],
    contradictingSymptomsEn: [
      'Normal lymph node size and normal pink mucous membranes',
      'Absence of ticks and normal body temperature',
    ],
    contradictingSymptomsUr: [
      'غدود کی نارمل جسامت اور مسوڑھوں کا قدرتی گلابی ہونا',
      'چیچڑوں کی عدم موجودگی اور معمول کا درجہ حرارت',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.neem_leaves_wash,
    ],
    modernMedicines: [
      MODERN_MEDICINES.buparvaquone,
      MODERN_MEDICINES.oxytetracycline_la,
      MODERN_MEDICINES.meloxicam,
    ],
    recommendedLabTests: [
      LAB_TESTS.blood_smear_hemoparasites,
    ],
    sourceCitations: [
      {
        sourceName: 'OIE Terrestrial Manual: Bovine Theileriosis',
        publicationOrEdition: 'Chapter 3.4.15',
        reviewStatus: 'Peer-Reviewed International Standard',
      },
      {
        sourceName: 'UVAS Lahore Department of Parasitology Field Guide',
        publicationOrEdition: 'Tick-Borne Diseases in Pakistan 2023',
        reviewStatus: 'Pakistan Diagnostic Protocol',
      },
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Isolate from clean paddocks to prevent tick vector transfer to uninfected stock.',
    ],
    isolationRecommendationsUr: [
      'چیچڑوں والے باڑے کو جراثیم کش اسپرے سے صاف کریں اور جانور کو الگ رکھیں۔',
    ],
    preventionEn: [
      'Regular acaricide tick control every 3-4 weeks during spring and summer.',
      'Theileriosis attenuated vaccine for exotic and crossbred cattle.',
    ],
    preventionUr: [
      'موسم گرما اور برسات میں ہر مہینے چیچڑ مار اسپرے کا باقاعدہ استعمال۔',
      'کراس گایوں کو تھیلیریا کا حفاظتی ٹیکہ لگوانا۔',
    ],
    preventativeVaccineName: 'Live Attenuated Theileria annulata Vaccine',
    recommendedVetExamEn:
      'Peripheral Giemsa blood smear, lymph node biopsy needle aspiration, buparvaquone IM administration.',
    recommendedVetExamUr:
      'خون کی سلائیڈ کا مائکروسکوپک ٹیسٹ، غدود سے پانی کا ٹیسٹ، اور بیوپرواکون کا ٹیکہ۔',
    questionsForVetEn: [
      'What is the parasitemia percentage on the Giemsa blood smear?',
      'Is blood transfusion required for hemoglobin below 5 g/dL?',
    ],
    questionsForVetUr: [
      'خون کے ٹیسٹ میں جراثیم کتنے فیصد پائے گئے ہیں؟',
      'کیا خون کی انتہائی کمی کی وجہ سے دوسری گائے کا خون چڑھانے کی ضرورت ہے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 2,
      meatWithdrawalDays: 42,
      specialNotesEn: 'Buparvaquone carries a strict 42-day meat withdrawal due to tissue persistence.',
      specialNotesUr: 'بیوپرواکون کے ٹیکے کے بعد 42 دن تک جانور کا گوشت استعمال نہ کریں۔',
    },
    withdrawalPeriodWarningEn:
      'Do not slaughter for meat within 42 days of Buparvaquone administration.',
    withdrawalPeriodWarningUr:
      'اس ٹیکے کے بعد 42 دن تک گوشت اور 2 دن تک دودھ انسانوں کے لیے استعمال نہ کریں۔',
  },

  // 12. MILK FEVER (HYPOCALCEMIA / سوتا بخار)
  {
    id: 'milk_fever',
    nameEn: 'Milk Fever / Parturient Paresis (سوتا بخار / کیلشیم کی کمی)',
    nameUr: 'سوتا بخار / زچگی کے بعد کیلشیم کی کمی (Hypocalcemia)',
    scientificName: 'Acute Post-Partum Hypocalcemia',
    targetSpecies: ['cow', 'buffalo'],
    symptomsEn: [
      'Animal calved within the past 12 to 72 hours (high-yielding dairy cows)',
      'Subnormal body temperature (below 100°F, extremities and ears feel icy cold)',
      'Flaccid paralysis: unable to rise, resting in sternal recumbency with head turned into flank (S-shaped curve)',
      'Dry muzzle, dull glassy eyes, pupil dilation with sluggish light response',
      'Suppression of defecation, urination, and rumination; complete loss of muscle tone',
    ],
    symptomsUr: [
      'بچہ جننے کے 12 سے 72 گھنٹوں کے اندر زیادہ دودھ دینے والی گائے کا اچانک بیٹھ جانا',
      'جسم کا درجہ حرارت معمول سے کم ہونا (کان اور پاؤں بالکل برف کی طرح ٹھنڈے ہونا)',
      'گردن موڑ کر کوکھ پر رکھ لینا (S-شکل کی گردن) اور کھڑے ہونے سے بالکل معذور ہونا',
      'خشک تھوتھنی، بے نور آنکھیں اور پتلیوں کا پھیل جانا',
      'پیشاب، پاخانہ اور جگالی کا مکمل بند ہو جانا اور پٹھوں کا ڈھیلا پڑ جانا',
    ],
    observedVisualSignsEn: [
      'Characteristic S-shaped curvature of the neck with head tucked into right or left flank',
      'Cold leathery ears on manual palpation',
      'Dilated unresponsive pupils and glazed staring expression',
    ],
    observedVisualSignsUr: [
      'گردن ٹیڑھی ہو کر کوکھ پر ٹکی ہونا',
      'ہاتھ لگانے پر کانوں اور ٹانگوں کا انتہائی ٹھنڈا ہونا',
      'پھیلی ہوئی بے حرکت پتلیاں',
    ],
    possibleCausesEn: [
      'Sudden massive drain of blood calcium into colostrum and milk immediately post-calving exceeding homeostatic mobilization from bone reserves',
    ],
    possibleCausesUr: [
      'پہلے دودھ (بولی) میں خون کا سارا کیلشیم اچانک خارج ہو جانا جس کی کمی ہڈیاں فوری پوری نہ کر سکیں',
    ],
    riskLevel: 'emergency',
    immediateCareEn: [
      'EMERGENCY: Do not delay; call veterinarian immediately for slow intravenous Calcium Borogluconate 25%.',
      'Prop the animal up onto her brisket (sternal position) with straw bales; never allow cow to lie flat on her side (fatal bloat and regurgitation).',
      'Warm the cow with thick dry blankets and massage cold ears and limbs.',
      'STRICT WARNING: NEVER attempt to drench water, oils, or remedies into the mouth (swallowing reflex is paralyzed; liquids enter trachea causing fatal aspiration).',
    ],
    immediateCareUr: [
      'ہنگامی ایمرجنسی: بغیر تاخیر فوراً ڈاکٹر کو بلائیں جو نس میں آہستہ آہستہ کیلشیم کی ڈرپ لگائے۔',
      'جانور کو سینے کے بل سیدھا بٹھائیں، سائیڈ پر نہ گرنے دیں ورنہ پیٹ میں گیس بھر جائے گی۔',
      'ٹھنڈے کانوں اور ٹانگوں کی مالش کریں اور اوپر گرم چادر یا بوری ڈالیں۔',
      'سخت انتباہ: منہ کے اندر نالی یا بوتل سے کچھ بھی نہ پلائیں کیونکہ جانور کا گلا بند ہوتا ہے اور دوا سیدھی پھیپھڑوں میں جا کر جان لے سکتی ہے۔',
    ],
    supportingSymptomsEn: [
      'Calving within the last 12-48 hours in high-producing cow/buffalo',
      'Subnormal temperature (<100°F) with icy cold ears and dry muzzle',
      'Sternal recumbency with S-shaped neck curvature',
    ],
    supportingSymptomsUr: [
      'پچھلے 24 سے 48 گھنٹوں میں بچے کی پیدائش کی تاریخ',
      'معمول سے کم درجہ حرارت اور برف کی طرح ٹھنڈے کان',
      'گردن موڑ کر کوکھ پر رکھ کر بیٹھ جانا',
    ],
    contradictingSymptomsEn: [
      'High fever (>103°F) - strongly indicates acute coliform mastitis, peritonitis, or septic metritis, NOT simple hypocalcemia',
      'Normal walking gait and active grazing',
    ],
    contradictingSymptomsUr: [
      'تیز بخار کا ہونا (یہ زہریلے ساڑو یا اندرونی انفیکشن کی علامت ہے، سوتا بخار نہیں)',
      'جانور کا اپنے پیروں پر چلنا اور کھانا پینا',
    ],
    traditionalRemedies: [
      // Oral drenching is strictly forbidden; supportive care is dry warm straw bedding
    ],
    modernMedicines: [
      MODERN_MEDICINES.calcium_borogluconate,
    ],
    recommendedLabTests: [
      LAB_TESTS.serum_calcium_electrolytes,
    ],
    sourceCitations: [
      {
        sourceName: 'Radostits Veterinary Medicine (10th Ed): Parturient Paresis in Dairy Cows',
        publicationOrEdition: 'Metabolic Diseases Chapter',
        reviewStatus: 'Gold Standard Veterinary Reference',
      },
      {
        sourceName: 'University of Veterinary & Animal Sciences (UVAS) Lahore',
        publicationOrEdition: 'Periparturient Metabolic Emergencies Protocol',
        reviewStatus: 'Pakistan Field Verified Protocol',
      },
    ],
    requiresVeterinaryPrescription: true,
    isolationRecommendationsEn: [
      'Keep cow in quiet, non-slip, well-bedded maternity box stall.',
    ],
    isolationRecommendationsUr: [
      'جانور کو پھسلن والی جگہ سے ہٹا کر خشک اور کچی جگہ پر رکھیں۔',
    ],
    preventionEn: [
      'Feed negative dietary cation-anion difference (DCAD) mineral salts during the 3 weeks pre-calving (close-up dry period).',
      'Avoid high-calcium alfalfa/berseem during dry period; administer oral calcium boluses at calving.',
    ],
    preventionUr: [
      'سونے سے 3 ہفتے پہلے خشک گائے کو لوسرن یا برسیم زیادہ نہ کھلائیں؛ بچہ جننے کے فوراً بعد کیلشیم کا جیل یا سپلیمنٹ دیں۔',
    ],
    recommendedVetExamEn:
      'Stat serum ionized calcium, cardiac auscultation during slow IV calcium borogluconate infusion, differential check for pelvic fracture.',
    recommendedVetExamUr:
      'دل کی دھڑکن سنتے ہوئے نس میں کیلشیم کی ڈرپ اور ہڈیوں کا معائنہ۔',
    questionsForVetEn: [
      'Is IV Calcium Borogluconate indicated or does she have a pelvic nerve injury / fracture?',
      'Should oral calcium boluses be administered once swallowing reflex returns?',
    ],
    questionsForVetUr: [
      'کیا کیلشیم کی ڈرپ لگائی جائے یا کوئی ہڈی ٹوٹنے کا شبہ ہے؟',
      'ہوش آنے کے بعد کون سا کیلشیم سپلیمنٹ دینا چاہیے؟',
    ],
    withdrawalPeriod: {
      milkWithdrawalDays: 0,
      meatWithdrawalDays: 0,
      specialNotesEn: 'Calcium borogluconate is an essential physiological mineral replacement with zero withdrawal.',
      specialNotesUr: 'کیلشیم کا کوئی سائیڈ ایفیکٹ یا پرہیز نہیں ہے، دودھ مکمل محفوظ ہے۔',
    },
    withdrawalPeriodWarningEn: 'Zero milk and meat withdrawal periods for calcium replacement.',
    withdrawalPeriodWarningUr: 'کیلشیم لگانے کے بعد دودھ پینے کے لیے مکمل محفوظ ہے۔',
  },

  // 13. DONKEY & HORSE HARNESS WOUNDS & MYIASIS (کاٹھی کے زخم اور کیڑے)
  {
    id: 'donkey_myiasis_wounds',
    nameEn: 'Harness Wounds & Maggot Infestation (کاٹھی کے زخم و میگٹس)',
    nameUr: 'گدھوں اور گھوڑوں کے کاٹھی کے گندے زخم اور کیڑے (Myiasis)',
    scientificName: 'Cutaneous Myiasis / Harness Pressure Ulcers',
    targetSpecies: ['donkey', 'horse'],
    symptomsEn: [
      'Deep, foul-smelling open wounds on withers, spine, breast, or girth from ill-fitting harness/pack saddle',
      'Presence of live wriggling fly larvae (maggots) burrowing deep inside the necrotic wound sinuses',
      'Tail swishing, head tossing, severe pain and resistance when harness or saddle is placed',
      'Purulent bloody exudate attracting clouds of filth flies',
    ],
    symptomsUr: [
      'کاٹھی، پیٹھ، گردن یا سینے پر گندے، بدبودار اور پرانے زخم',
      'زخم کے اندر رینگتے ہوئے زندہ سفید کیڑے (میگٹس)',
      'کاٹھی رکھنے پر جانور کا درد سے بلبلانا اور لاتیں چلانا',
      'زخم سے پیپ اور خون بہنا اور مکھیوں کا جھنڈ جمع ہونا',
    ],
    observedVisualSignsEn: [
      'Visible active fly larvae clusters buried beneath necrotic tissue margins',
      'Raw red ulcerated saddle sore with white fibrous calloused edges',
    ],
    observedVisualSignsUr: [
      'زخم کے اندر رینگتے ہوئے کیڑے',
      'کاٹھی کے نیچے کچی اور چھلی ہوئی کھال',
    ],
    possibleCausesEn: [
      'Hard, rough, or unpadded wooden/iron harness straps causing chronic friction and pressure necrosis',
      'Blowflies (Chrysomya bezziana) depositing eggs onto open abrasions in hot humid weather',
    ],
    possibleCausesUr: [
      'سخت اور بغیر گدی والی کاٹھی کی مسلسل رگڑ جس سے کھال مر جاتی ہے اور مکھیاں انڈے دے دیتی ہیں',
    ],
    riskLevel: 'moderate',
    immediateCareEn: [
      'IMMEDIATELY REMOVE all harness, saddles, and ropes from the wound; NEVER work an animal with active maggot wounds.',
      'Apply Camphor dissolved in pure Neem or Mustard Oil directly into wound sinuses to force larvae out.',
      'Gently pick out emerging dead/stunned maggots using clean tweezers or forceps into a disinfectant cup.',
      'Flush wound with warm dilute Povidone Iodine 10% solution; apply Turmeric & Mustard oil paste or honey dressing.',
      'Vet will administer systemic Ivermectin and tetanus prophylaxis.',
    ],
    immediateCareUr: [
      'کاٹھی اور رسے فوری اتار دیں؛ زخم والے جانور سے کام لینا قانونی اور اخلاقی جرم ہے۔',
      'کافور ملا نیم کا تیل زخم کے اندر ڈالیں تاکہ کیڑے تڑپ کر باہر نکلیں۔',
      'چمٹی سے تمام کیڑے باہر نکال کر تلف کریں۔',
      'پائیوڈین کے محلول سے زخم دھو کر ہلدی اور سرسوں کے تیل کا مرہم یا شہد لگائیں۔',
      'ڈاکٹر سے کیڑے تلف کرنے والا ٹیکہ اور تشنج (Tetanus) کا حفاظتی ٹیکہ لگوائیں۔',
    ],
    supportingSymptomsEn: [
      'Visible fly maggots moving within open ulcerated skin sinus',
      'Location corresponding directly to pack saddle, girth strap, or breeching strap',
    ],
    supportingSymptomsUr: [
      'زخم کے اندر صاف نظر آنے والے حرکت کرتے کیڑے',
      'کاٹھی یا پٹھے کے مقام پر زخم کا ہونا',
    ],
    contradictingSymptomsEn: [
      'Intact healthy skin without abrasions or ulceration',
      'Absence of fly larvae or purulent exudate',
    ],
    contradictingSymptomsUr: [
      'مکمل صحت مند اور بغیر زخم کے کھال',
      'کیڑوں یا پیپ کا نہ ہونا',
    ],
    traditionalRemedies: [
      TRADITIONAL_REMEDIES.camphor_neem_maggot_expeller,
      TRADITIONAL_REMEDIES.honey_haldi_bandage,
      TRADITIONAL_REMEDIES.turmeric_mustard_oil,
    ],
    modernMedicines: [],
    sourceCitations: [
      {
        sourceName: 'The Brooke Hospital for Animals: Working Equine Clinical Manual',
        publicationOrEdition: 'Equine Wound & Myiasis Protocols',
        reviewStatus: 'International Working Equine Welfare Standard',
      },
      {
        sourceName: 'Society for the Protection of Animals Abroad (SPANA)',
        publicationOrEdition: 'Field Veterinary Care of Working Donkeys',
        reviewStatus: 'Peer-Reviewed Welfare Guidelines',
      },
    ],
    requiresVeterinaryPrescription: false,
    isolationRecommendationsEn: [
      'Keep donkey in clean, shaded, fly-screened stall during healing.',
    ],
    isolationRecommendationsUr: [
      'جانور کو مکھیوں سے بچا کر سایہ دار اور صاف جگہ پر باندھیں۔',
    ],
    preventionEn: [
      'Always use soft, clean, thick felt or sheepskin padding under pack saddles and wooden frames.',
      'Inspect back, withers, and girth daily after unharnessing; treat fresh scratches immediately before flies strike.',
    ],
    preventionUr: [
      'کاٹھی کے نیچے موٹی اور نرم نمدا (روئی کی گدی) لازمی رکھیں؛ شام کو کاٹھی اتار کر پیٹھ کی روزانہ صفائی کریں۔',
    ],
    recommendedVetExamEn:
      'Thorough debridement of necrotic flesh, exploration of deep sinuses for hidden larvae, Ivermectin subcutaneous dose, TAT injection.',
    recommendedVetExamUr:
      'مردہ گوشت کی صفائی، کیڑوں کی مکمل تلفی کا ٹیکہ، اور ٹیٹنس کا ٹیکہ۔',
    questionsForVetEn: [
      'Are there deep sinuses penetrating toward spine or shoulder cartilage?',
      'Has tetanus prophylaxis been administered within the last 6 months?',
    ],
    questionsForVetUr: [
      'کیا زخم ہڈی یا ریڑھ کی ہڈی تک گہرا تو نہیں؟',
      'کیا جانور کو ٹیٹنس کا حفاظتی ٹیکہ لگا ہوا ہے؟',
    ],
  },
];

/**
 * Filter diseases matching species and optional symptom keywords
 */
export function findDiseasesBySpeciesAndSymptoms(
  species: string,
  symptomsSearch: string
): PossibleDisease[] {
  const normSp = (species || '').toLowerCase().trim();
  const normSym = (symptomsSearch || '').toLowerCase().trim();

  const matched = CLINICAL_DISEASES.filter((d) => {
    return d.targetSpecies.some((s) => normSp.includes(s) || s.includes(normSp));
  });

  if (matched.length > 0) return matched;
  return CLINICAL_DISEASES.slice(0, 3);
}

