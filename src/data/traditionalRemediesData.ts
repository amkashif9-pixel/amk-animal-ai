/**
 * Evidence-Reviewed Traditional & Desi Veterinary Remedies
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * Rules:
 * 1. Only evidence-reviewed remedies are included.
 * 2. Scientific grade, benefits, risks, and species-specific toxicities are stated.
 * 3. Harmful/toxic folk remedies (battery acid, kerosene, engine oil, caustic agents) are strictly forbidden.
 */

import { TraditionalRemedy } from '../types/health';

export const TRADITIONAL_REMEDIES: Record<string, TraditionalRemedy> = {
  turmeric_mustard_oil: {
    id: 'turmeric_mustard_oil',
    nameEn: 'Turmeric & Pure Mustard Oil Antiseptic Paste (ہلدی اور سرسوں کا تیل)',
    nameUr: 'ہلدی اور خالص سرسوں کے تیل کا جراثیم کش لیپ',
    ingredientsEn: [
      '50g pure organic Turmeric powder (ہلدی سفوف)',
      '100ml cold-pressed Mustard Oil (خالص سرسوں کا تیل)',
    ],
    ingredientsUr: [
      '50 گرام خالص پسی ہوئی ہلدی',
      '100 ملی لیٹر خالص کولہو کا سرسوں کا تیل',
    ],
    preparationMethodEn:
      'Warm the mustard oil gently in a clean pan. Stir in the turmeric powder until a smooth thick golden paste forms. Allow to cool completely to body temperature before applying with clean gloved hands.',
    preparationMethodUr:
      'سرسوں کے تیل کو ہلکی آنچ پر نیم گرم کریں۔ اس میں ہلدی کا سفوف ڈال کر اچھی طرح ہلائیں تاوقتیکہ گاڑھا مرہم بن جائے۔ ٹھنڈا ہونے پر صاف دستانے سے زخم پر لگائیں۔',
    evidenceQuality: 'scientific_clinical_support',
    evidenceNotesEn:
      'Curcumin possesses well-documented anti-inflammatory, free-radical scavenging, and broad-spectrum antimicrobial activity in veterinary surgical wound models.',
    evidenceNotesUr:
      'ہلدی میں موجود کرکیومن (Curcumin) سائنسی طور پر سوزش ختم کرنے اور جراثیم کا خاتمہ کر کے گوشت بھرنے میں موثر ثابت ہوا ہے۔',
    benefitsEn:
      'Forms a protective insect-repellent barrier over superficial skin wounds, abrasions, foot cleft lesions in FMD, and castration incision edges.',
    benefitsUr:
      'سطحی زخموں، کھروں کے چھالوں اور کاٹھی کی رگڑ پر مکھیاں بیٹھنے سے روکتا ہے اور زخم جلدی بھرتا ہے۔',
    risksAndSideEffectsEn:
      'Mild localized staining. Not suitable for deep puncture wounds or internal cavities where anaerobic bacteria thrive.',
    risksAndSideEffectsUr:
      'گہرے سوراخ دار زخموں کے اندر نہ بھریں جہاں ہوا نہ پہنچتی ہو۔',
    contraindicationsEn: [
      'Do not pack inside deep contaminated puncture wounds.',
      'Do not apply near the eyeball or into the conjunctival sac.',
    ],
    contraindicationsUr: [
      'گہرے سوراخ والے زخموں کے اندر زبردستی نہ ٹھونسیں۔',
      'آنکھ کے اندر ہرگز نہ لگائیں۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Safe for cattle, buffalo, goats, sheep, horses, and donkeys.',
      'In cats, avoid excessive topical use due to grooming ingestion risks.',
    ],
    speciesSpecificToxicityWarningsUr: [
      'گائے، بھینس، بکری، بھیڑ اور گھوڑے/گدھے کے لیے مکمل محفوظ ہے۔ بلیوں میں چاٹنے سے گریز کروائیں۔',
    ],
    vetReviewStatus: 'Reviewed by UVAS Farm Animal Clinical Pathology Guidelines',
  },

  alum_mouth_wash: {
    id: 'alum_mouth_wash',
    nameEn: 'Potash Alum 2% Oral Antiseptic Rinse (پھٹکری کا ماؤتھ واش)',
    nameUr: 'پھٹکری کا 2 فیصد اینٹی سیپٹک ماؤتھ واش',
    ingredientsEn: [
      '20g pure Potash Alum crystals (خالص پھٹکری)',
      '1 Liter clean boiled and cooled lukewarm water',
    ],
    ingredientsUr: [
      '20 گرام خالص پھٹکری کی ڈلی کا باریک سفوف',
      '1 لیٹر ابلا ہوا نیم گرم صاف پانی',
    ],
    preparationMethodEn:
      'Dissolve 20 grams of powdered alum completely in 1 liter of warm water. Soak clean surgical gauze or clean cotton cloth in the solution and gently swab the blisters on the tongue, dental pad, and gums 2 to 3 times daily.',
    preparationMethodUr:
      '20 گرام پسی ہوئی پھٹکری کو ایک لیٹر نیم گرم پانی میں مکمل حل کریں۔ صاف نرم کپڑے یا روئی سے جانور کی زبان اور مسوڑھوں پر دن میں 2 سے 3 بار نرمی سے لگائیں۔',
    evidenceQuality: 'empirical_veterinary_consensus',
    evidenceNotesEn:
      'Potassium alum acts as a mild local astringent and protein precipitator, constricting capillaries, reducing oral pain, and promoting ulcer epithelialization in viral stomatitis.',
    evidenceNotesUr:
      'پھٹکری ایک محفوظ قابض دوا کے طور پر کام کرتی ہے جو منہ کے چھالوں کا پانی سکھا کر نئے خلیات بناتی ہے۔',
    benefitsEn:
      'Rapidly dries weeping oral blisters, diminishes painful hypersalivation, and facilitates earlier resumption of soft feed intake in FMD-affected ruminants.',
    benefitsUr:
      'منہ کے چھالوں کی جلن اور رال کو کم کرتی ہے اور جانور جلد نرم چارہ کھانا شروع کر دیتا ہے۔',
    risksAndSideEffectsEn:
      'Excessive concentration (>5%) can cause tissue irritation or mucosal drying.',
    risksAndSideEffectsUr:
      'تیز محلول (5 فیصد سے زیادہ) بنانے سے منہ کی جھلی میں جلن ہو سکتی ہے۔',
    contraindicationsEn: [
      'Never drench down the throat as a systemic stomach potion.',
      'Do not use dry alum powder directly on open bleeding ulcers.',
    ],
    contraindicationsUr: [
      'نالی یا بوتل سے پیٹ کے اندر نہ پلائیں۔',
      'سوکھا سفوف کچے زخم پر نہ چھڑکیں ورنہ شدید جلن ہوگی۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Approved for ruminants (cow, buffalo, sheep, goat). Do not use in poultry drinking systems.',
    ],
    speciesSpecificToxicityWarningsUr: [
      'گائے، بھینس، بھیڑ، بکری کے منہ کے لیے محفوظ ہے۔ پولٹری کے پانی میں نہ ملائیں۔',
    ],
    vetReviewStatus: 'Veterinary consensus recommendation in national FMD control guidelines',
  },

  mustard_oil_asafoetida_bloat: {
    id: 'mustard_oil_asafoetida_bloat',
    nameEn: 'Carminative Mustard Oil & Asafoetida Mixture (سرسوں کا تیل اور ہینگ برائے افارہ)',
    nameUr: 'سرسوں کے تیل اور ہینگ کا روایتی ہاضم مرکب برائے افارہ',
    ingredientsEn: [
      '250-400ml pure cold-pressed Mustard Oil for adult cattle/buffalo (50-80ml for sheep/goats)',
      '5-10g Asafoetida (ہینگ / Hing) dissolved in 50ml warm water',
      '15g crushed Ajwain seeds (اجوائن)',
    ],
    ingredientsUr: [
      '250 تا 400 ملی لیٹر خالص سرسوں کا تیل (بھیڑ بکری کے لیے 50 تا 80 ملی لیٹر)',
      '5 تا 10 گرام اصلی ہینگ (نیم گرم پانی میں حل شدہ)',
      '15 گرام پسی ہوئی اجوائن',
    ],
    preparationMethodEn:
      'Finely dissolve the asafoetida in warm water and blend into the mustard oil with the crushed ajwain. Administer slowly via the side of the mouth with animal head held in natural horizontal position. NEVER elevate head too high.',
    preparationMethodUr:
      'ہینگ کو نیم گرم پانی میں گھول کر سرسوں کے تیل اور اجوائن میں ملائیں۔ جانور کے سر کو زیادہ اونچا کیے بغیر منہ کے کونے سے آہستہ آہستہ پلائیں۔',
    evidenceQuality: 'empirical_veterinary_consensus',
    evidenceNotesEn:
      'Vegetable oils alter surface tension of ruminal fluid, coalescing small gas bubbles trapped in foam into free gas that can be eructated (belched). Asafoetida and ajwain stimulate ruminal motility.',
    evidenceNotesUr:
      'خالص سرسوں کا تیل جھاگ دار افارے میں باریک بلبلوں کی کششِ ثقل کو توڑ کر آزاد گیس میں بدلتا ہے جسے جانور ڈکار کے ذریعے نکال سکتا ہے۔',
    benefitsEn:
      'Provides immediate physical relief in mild-to-moderate pasture and frothy legume bloat before tympany compresses lungs.',
    benefitsUr:
      'سبز لوسرن یا برسین چرنے سے ہونے والے جھاگ دار افارے میں فوری آرام دیتا ہے۔',
    risksAndSideEffectsEn:
      'HIGH ASPIRATION RISK if drenched forcibly into a coughing, gasping, or struggling animal.',
    risksAndSideEffectsUr:
      'اگر جانور کھانس رہا ہو یا ہانپ رہا ہو تو زبردستی پلانے سے تیل پھیپھڑوں میں جا کر جان لیوا نمونیا کر سکتا ہے۔',
    contraindicationsEn: [
      'STRICTLY FORBIDDEN in choking animals with esophageal foreign body obstruction.',
      'Do not administer if animal is in severe respiratory distress or unable to swallow naturally.',
      'Do not use mineral engine oil, kerosene, or industrial lubricants.',
    ],
    contraindicationsUr: [
      'اگر جانور کے گلے میں کوئی آلو یا شلجم پھنسا ہو (Choking) تو تیل ہرگز نہ پلائیں۔',
      'اگر جانور دم توڑ رہا ہو یا گلے سے خر خر کر رہا ہو تو زبردستی کچھ نہ پلائیں۔',
      'مٹی کا تیل یا انجن کا جلا ہوا تیل پلانا سخت ممنوع اور جان لیوا ہے۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Strictly ruminant specific (cow, buffalo, sheep, goat). NEVER administer oral drench to horses (equine cecal colic requires nasogastric intubation by a licensed vet).',
    ],
    speciesSpecificToxicityWarningsUr: [
      'صرف گائے، بھینس، بکری اور بھیڑ کے لیے ہے۔ گھوڑوں اور گدھوں کو بوتل سے ہرگز نہ پلائیں ورنہ وہ فوراً مر سکتے ہیں۔',
    ],
    vetReviewStatus: 'Standard clinical first-aid protocol in rural veterinary dispensaries',
  },

  camphor_neem_maggot_expeller: {
    id: 'camphor_neem_maggot_expeller',
    nameEn: 'Camphor & Neem Oil Maggot Expeller (کافور اور نیم کا تیل برائے کیڑے/میگٹس)',
    nameUr: 'کافور اور نیم کے تیل کا روایتی نسخہ برائے میگٹ زدہ زخم',
    ingredientsEn: [
      '10g pure Camphor tablets (مشک کافور)',
      '100ml cold-pressed pure Neem Oil (خالص نیم کا تیل)',
    ],
    ingredientsUr: [
      '10 گرام مشک کافور کی ٹکیوں کا سفوف',
      '100 ملی لیٹر خالص نیم کا تیل',
    ],
    preparationMethodEn:
      'Crush the camphor tablets into a fine powder and dissolve completely in the neem oil. Pour or squirt directly into the deep wound cavity infested with fly maggots.',
    preparationMethodUr:
      'کافور کو باریک پیس کر نیم کے تیل میں اچھی طرح حل کریں۔ میگٹس (کیڑوں) والے گہرے زخم کے اندر سرنج یا روئی کی مدد سے ڈالیں۔',
    evidenceQuality: 'empirical_veterinary_consensus',
    evidenceNotesEn:
      'Camphor vapors rapidly irritate and suffocate Chrysomya bezziana larvae (screwworm/blowfly maggots), forcing them to evacuate deep tissue sinuses within minutes. Neem oil provides anti-larval and repelling action.',
    evidenceNotesUr:
      'کافور کی تیز خوشبو اور گیس زخم کے اندر چھپے کیڑوں کا دم گھونٹ کر انہیں باہر نکلنے پر مجبور کر دیتی ہے اور نیم کا تیل مکھیوں کو دوبارہ انڈے دینے سے روکتا ہے۔',
    benefitsEn:
      'Forces live maggots out of necrotic wounds, pack saddle sores on working donkeys, and dehorning cavities without traumatizing healthy tissue.',
    benefitsUr:
      'گدھوں اور گھوڑوں کی کاٹھی کے گہرے زخموں اور سینگ ٹوٹنے کے بعد پڑے ہوئے کیڑوں کو فوراً باہر نکالتا ہے۔',
    risksAndSideEffectsEn:
      'Mild stinging sensation on fresh granulating tissue.',
    risksAndSideEffectsUr:
      'تازہ گوشت پر ہلکی جلن ہو سکتی ہے۔',
    contraindicationsEn: [
      'Do not apply inside eye socket or ear canal with ruptured eardrum.',
      'Do not ingest orally.',
    ],
    contraindicationsUr: [
      'آنکھ کے اندر یا کان کے پردے کے اندر نہ ڈالیں۔',
      'پینے کے لیے استعمال نہ کریں۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Safe for topical use on equines (horses, donkeys, mules) and livestock. Keep away from cats.',
    ],
    speciesSpecificToxicityWarningsUr: [
      'گھوڑوں، گدھوں، گائے اور بکری کے بیرونی زخموں کے لیے انتہائی مفید ہے۔ بلیوں کے زخموں پر استعمال نہ کریں۔',
    ],
    vetReviewStatus: 'Endorsed by working equine welfare charities (The Brooke / SPANA guidelines)',
  },

  honey_haldi_bandage: {
    id: 'honey_haldi_bandage',
    nameEn: 'Medical Honey & Turmeric Healing Dressing (شہد اور ہلدی کی اینٹی سیپٹک مرہم)',
    nameUr: 'خالص شہد اور ہلدی کی جراثیم کش ڈریسنگ',
    ingredientsEn: [
      '50ml pure unadulterated raw Honey (خالص قدرتی شہد)',
      '15g organic fine Turmeric powder (خالص باریک ہلدی)',
    ],
    ingredientsUr: [
      '50 ملی لیٹر خالص قدرتی شہد',
      '15 گرام خالص پسی ہوئی ہلدی',
    ],
    preparationMethodEn:
      'Mix raw honey with turmeric to form a sticky golden ointment. Spread onto sterile gauze and apply over cleansed chronic non-healing ulcers or lacerations. Change bandage every 24-48 hours.',
    preparationMethodUr:
      'شہد اور ہلدی کو ملا کر لیس دار مرہم تیار کریں۔ جراثیم کش پٹی پر لگا کر زخم پر باندھیں۔ ہر 24 سے 48 گھنٹے بعد پٹی تبدیل کریں۔',
    evidenceQuality: 'scientific_clinical_support',
    evidenceNotesEn:
      'High osmolarity of honey draws lymph into wound, continuously dehydrating bacteria. Hydrogen peroxide enzymatic generation provides sustained non-cytotoxic bactericidal activity.',
    evidenceNotesUr:
      'شہد کی قدرتی مٹھاس اور ہائیڈروجن پر آکسائیڈ جراثیم کو خشک کر کے مارتے ہیں اور زخم کو بدبو سے پاک کر کے نیا گوشت بناتے ہیں۔',
    benefitsEn:
      'Accelerates healing of chronic dirty wounds, harness abrasions in working equines, and teat skin lesions.',
    benefitsUr:
      'گدھوں اور گھوڑوں کے کاٹھی کے پرانے نہ بھرنے والے زخموں اور کھرچن کو تیزی سے بھرتا ہے۔',
    risksAndSideEffectsEn:
      'Attracts flies if left unbandaged; must be covered with clean protective cotton gauze.',
    risksAndSideEffectsUr:
      'کھلا چھوڑنے پر مکھیاں آ سکتی ہیں، اس لیے اوپر جراثیم کش پٹی باندھنا لازمی ہے۔',
    contraindicationsEn: [
      'Do not leave unbandaged in fly-dense farm environments.',
    ],
    contraindicationsUr: [
      'مکھیوں والے ماحول میں پٹی کے بغیر کھلا نہ چھوڑیں۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Completely non-toxic for all 9 domestic species (dogs, cats, horses, donkeys, cows, buffaloes, sheep, goats, poultry).',
    ],
    speciesSpecificToxicityWarningsUr: [
      'تمام 9 اقسام کے جانوروں اور پرندوں کے لیے بیرونی طور پر 100 فیصد بے ضرر ہے۔',
    ],
    vetReviewStatus: 'Recognized in veterinary wound management textbooks globally',
  },

  neem_leaves_wash: {
    id: 'neem_leaves_wash',
    nameEn: 'Boiled Neem Decoction Ectoparasite Spray (نیم کے پتوں کا قہوہ برائے چچڑ و جوئیں)',
    nameUr: 'نیم کے پتوں کا ابلا ہوا قہوہ برائے چیچڑ اور جوئیں',
    ingredientsEn: [
      '250g fresh Neem tree leaves (تازہ نیم کے پتے)',
      '3 Liters clean water',
    ],
    ingredientsUr: [
      '250 گرام تازہ نیم کے پتے',
      '3 لیٹر صاف پانی',
    ],
    preparationMethodEn:
      'Boil the neem leaves in water for 25-30 minutes until water turns deep green. Allow to cool completely. Strain the liquid and pour into a hand sprayer. Mist all over animal body, inner thighs, ears, and under-tail folds.',
    preparationMethodUr:
      'نیم کے پتوں کو پانی میں 25 سے 30 منٹ تک ابالیں تاکہ پانی گہرا سبز ہو جائے۔ ٹھنڈا کر کے چھان لیں اور اسپرے بوتل میں بھر کر جانور کے جسم، کانوں اور رانوں پر چھڑکیں۔',
    evidenceQuality: 'scientific_clinical_support',
    evidenceNotesEn:
      'Azadirachtin present in neem leaves disrupts insect and tick ecdysone (molting hormone), inhibiting tick feeding and egg viability without chemical resistance.',
    evidenceNotesUr:
      'نیم میں موجود ازاڈیریکٹن (Azadirachtin) چیچڑوں اور جوؤں کی افزائشِ نسل کو روکتا ہے اور ان کے انڈے تلف کرتا ہے۔',
    benefitsEn:
      'Safe, organic tick and fly repellent for dairy cows, lactating goats, and young calves where synthetic organophosphate pesticides carry toxicity risks.',
    benefitsUr:
      'دودھ دینے والی گائے، بھینس اور چھوٹے میمنوں کے لیے چیچڑوں اور مکھیوں سے بچاؤ کا محفوظ اور قدرتی طریقہ ہے۔',
    risksAndSideEffectsEn:
      'Mild bitter taste if licked, which naturally discourages self-licking.',
    risksAndSideEffectsUr:
      'کڑوا ذائقہ ہے جس کی وجہ سے جانور خود کو چاٹتا نہیں جو کہ مفید ہے۔',
    contraindicationsEn: [
      'Avoid spraying directly into animal eyes.',
    ],
    contraindicationsUr: [
      'جانور کی آنکھوں کے اندر سیدھا اسپرے نہ کریں۔',
    ],
    speciesSpecificToxicityWarningsEn: [
      'Safe for all mammalian species and poultry.',
    ],
    speciesSpecificToxicityWarningsUr: [
      'تمام جانوروں اور پولٹری کے لیے محفوظ ہے۔',
    ],
    vetReviewStatus: 'Published in international ethno-veterinary research journals',
  },
};
