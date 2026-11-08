import { AnimalSpecies, AnimalBreed } from '../types/animal';

export const ALL_SPECIES: AnimalSpecies[] = [
  // Livestock
  {
    id: 'cow',
    name: 'Cow',
    nameUrdu: 'گائے',
    category: 'livestock',
    scientificName: 'Bos indicus / Bos taurus',
    icon: '🐮',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Major dairy and beef cattle adapted to tropical and temperate climates.',
    descriptionUr: 'پاکستان اور دنیا بھر میں دودھ اور گوشت کا سب سے اہم مویشی۔',
    commonBreedsCount: 6,
  },
  {
    id: 'buffalo',
    name: 'Buffalo',
    nameUrdu: 'بھینس',
    category: 'livestock',
    scientificName: 'Bubalus bubalis',
    icon: '🦬',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'The black gold of Pakistan, producing high-fat, rich dairy milk.',
    descriptionUr: 'پاکستان کا کالا سونا، 6 تا 8 فیصد مکھن فیٹ سے بھرپور دودھ پیدا کرنے والا جانور۔',
    commonBreedsCount: 3,
  },
  {
    id: 'goat',
    name: 'Goat',
    nameUrdu: 'بکری',
    category: 'livestock',
    scientificName: 'Capra hircus',
    icon: '🐐',
    imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Prolific small ruminants for milk, high quality mutton, and Eid-ul-Adha.',
    descriptionUr: 'گوشت، دودھ اور عید الاضحیٰ کے لیے پاکستان کا سب سے مقبول چھوٹا جانور۔',
    commonBreedsCount: 6,
  },
  {
    id: 'sheep',
    name: 'Sheep',
    nameUrdu: 'بھیڑ / چھترا',
    category: 'livestock',
    scientificName: 'Ovis aries',
    icon: '🐑',
    imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Wool and mutton producers with renowned breeds like Kajli and Lohi.',
    descriptionUr: 'خوبصورت اون اور لذیذ دنبہ/مٹن گوشت دینے والا اہم لائیو اسٹاک۔',
    commonBreedsCount: 5,
  },
  {
    id: 'bull',
    name: 'Bull / Ox',
    nameUrdu: 'بیل / سانڈ',
    category: 'livestock',
    scientificName: 'Bos indicus',
    icon: '🐂',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Stud breeding sires, heavy draft animals, and prized Qurbani livestock.',
    descriptionUr: 'نسل کشی کے سانڈ، بھاری وزن والے قربانی کے بیل اور کھیتی باڑی کے جانور۔',
    commonBreedsCount: 4,
  },
  {
    id: 'calf',
    name: 'Calf',
    nameUrdu: 'بچھڑا / کٹڑا',
    category: 'livestock',
    scientificName: 'Bos indicus / Bubalus bubalis',
    icon: '🐄',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Young dairy heifers and beef feedlot fattening calves.',
    descriptionUr: 'ڈیری کی مستقبل کی گائیں اور بیف فارمنگ کے لیے کٹڑے اور بچھڑے۔',
    commonBreedsCount: 4,
  },
  {
    id: 'camel',
    name: 'Camel',
    nameUrdu: 'اونٹ',
    category: 'livestock',
    scientificName: 'Camelus dromedarius',
    icon: '🐪',
    imageUrl: 'https://images.unsplash.com/photo-1563804803038-040183141ce7?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Desert ship adapted to harsh arid climates, therapeutic milk, and transport.',
    descriptionUr: 'صحرا کا جہاز، ادویاتی افادیت والے دودھ اور صحرائی و باربرداری کا مضبوط جانور۔',
    commonBreedsCount: 3,
  },
  {
    id: 'horse',
    name: 'Horse',
    nameUrdu: 'گھوڑا',
    category: 'livestock',
    scientificName: 'Equus caballus',
    icon: '🐎',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Equine companions for riding, polo, tent pegging (نیزہ بازی), and breeding.',
    descriptionUr: 'گھڑ سواری، نیزہ بازی، شاہی پروٹوکول اور ریس کے شاندار گھوڑے۔',
    commonBreedsCount: 4,
  },
  {
    id: 'donkey',
    name: 'Donkey',
    nameUrdu: 'گدھا',
    category: 'livestock',
    scientificName: 'Equus asinus',
    icon: '🫏',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Resilient draft and pack animals serving rural agrarian economies.',
    descriptionUr: 'دیہی معیشت اور بوجھ اٹھانے والا بے حد محنتی اور صابر جانور۔',
    commonBreedsCount: 3,
  },
  {
    id: 'mule',
    name: 'Mule',
    nameUrdu: 'خچر',
    category: 'livestock',
    scientificName: 'Equus mulus',
    icon: '🐴',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Hardy hybrid of male donkey and female horse, renowned for mountain stamina.',
    descriptionUr: 'گدھے اور گھوڑی کا ملاپ، پہاڑی راستوں پر غیر معمولی بوجھ اٹھانے کی صلاحیت۔',
    commonBreedsCount: 2,
  },

  // Poultry & Birds
  {
    id: 'hen',
    name: 'Hen / Chicken',
    nameUrdu: 'مرغی / چوزہ',
    category: 'poultry',
    scientificName: 'Gallus gallus domesticus',
    icon: '🐔',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Layers, broilers, and indigenous heritage breeds (Aseel, Desi, Misri).',
    descriptionUr: 'انڈے، گوشت اور شوق کے لیے اصیل، مصری، گولڈن اور دیسی مرغیاں۔',
    commonBreedsCount: 6,
  },
  {
    id: 'rooster',
    name: 'Rooster',
    nameUrdu: 'مرغا',
    category: 'poultry',
    scientificName: 'Gallus gallus domesticus',
    icon: '🐓',
    imageUrl: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Adult male chickens, including champion fighter Aseel sires and flock protectors.',
    descriptionUr: 'اصیل، فینسی اور دیسی باڑ کے سردار مرغے۔',
    commonBreedsCount: 5,
  },
  {
    id: 'duck',
    name: 'Duck',
    nameUrdu: 'بطخ',
    category: 'poultry',
    scientificName: 'Anas platyrhynchos domesticus',
    icon: '🦆',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Waterfowl for nutritious eggs, tender meat, and insect control.',
    descriptionUr: 'پانی کے پرندے جو بڑی تعداد میں انڈے اور کیڑے مکوڑوں کی قدرتی صفائی کرتے ہیں۔',
    commonBreedsCount: 3,
  },
  {
    id: 'turkey',
    name: 'Turkey',
    nameUrdu: 'ٹونکی / فیل مرغ',
    category: 'poultry',
    scientificName: 'Meleagris gallopavo',
    icon: '🦃',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Large domesticated poultry yielding heavy lean breast meat.',
    descriptionUr: 'بڑے وزن والے فیل مرغ جو قیمتی پروٹین اور فارمنگ کے لیے پالے جاتے ہیں۔',
    commonBreedsCount: 2,
  },
  {
    id: 'pigeon',
    name: 'Pigeon',
    nameUrdu: 'کبوتر',
    category: 'poultry',
    scientificName: 'Columba livia domestica',
    icon: '🕊️',
    imageUrl: 'https://images.unsplash.com/photo-1518992028180-664853473491?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Homing, high-flying, and ornamental show pigeons prized across the subcontinent.',
    descriptionUr: 'پاکستان کا روایتی شوق، اونچی اڑان والے (ٹیڈی، کمگر، سیالکوٹی) کبوتر۔',
    commonBreedsCount: 4,
  },
  {
    id: 'quail',
    name: 'Quail',
    nameUrdu: 'بٹیر',
    category: 'poultry',
    scientificName: 'Coturnix japonica',
    icon: '🐦',
    imageUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Fast-growing game birds producing delicious meat and high-protein eggs.',
    descriptionUr: '45 دنوں میں تیار ہونے والا منافع بخش چھوٹا پرندہ اور اس کے مقوی انڈے۔',
    commonBreedsCount: 2,
  },
  {
    id: 'parrot',
    name: 'Parrot / Domestic Bird',
    nameUrdu: 'طوطا / گھریلو پرندے',
    category: 'poultry',
    scientificName: 'Psittaciformes',
    icon: '🦜',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Ringnecks, Raw, Cockatiels, and Budgerigars kept as companion aviaries.',
    descriptionUr: 'گھروں میں رکھے جانے والے رنگین، بولنے والے طوطے اور فنچز۔',
    commonBreedsCount: 5,
  },

  // Pets
  {
    id: 'dog',
    name: 'Dog',
    nameUrdu: 'کتا',
    category: 'pets',
    scientificName: 'Canis lupus familiaris',
    icon: '🐕',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Guardians, farm herders, Bully Kutta, and loyal household companions.',
    descriptionUr: 'فارم کی حفاظت، محافظ اور گھر کے وفادار کتے (پاکستانی بلی کتا، جرمن شیفرڈ)۔',
    commonBreedsCount: 6,
  },
  {
    id: 'cat',
    name: 'Cat',
    nameUrdu: 'بلی',
    category: 'pets',
    scientificName: 'Felis catus',
    icon: '🐈',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    descriptionEn: 'Gentle domestic companions including Persian, Siamese, and native breeds.',
    descriptionUr: 'گھریلو پالتو بلیاں (پرشین، سیامی اور دیسی بلیاں)۔',
    commonBreedsCount: 4,
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    nameUrdu: 'خرگوش',
    category: 'pets',
    scientificName: 'Oryctolagus cuniculus',
    icon: '🐇',
    descriptionEn: 'Quiet, affectionate herbivore pets and specialty Angora fur producers.',
    descriptionUr: 'خوبصورت گھریلو پالتو خرگوش اور انگورا نسل۔',
    commonBreedsCount: 3,
  },
];

export const ALL_BREEDS: AnimalBreed[] = [
  // COWS
  {
    id: 'sahiwal_cow',
    speciesId: 'cow',
    name: 'Sahiwal Cow',
    nameUrdu: 'ساہیوال گائے',
    origin: 'Montgomery / Sahiwal District, Punjab, Pakistan',
    originUrdu: 'ضلع ساہیوال (منٹگمری)، پنجاب، پاکستان',
    scientificName: 'Bos indicus',
    physicalCharacteristicsEn:
      'Reddish-dun to deep brown coat, prominent hump, loose skin (dewlap), drooping navel flap, stumpy horns, and gentle eyes.',
    physicalCharacteristicsUr:
      'گہرا بادامی یا سرخ رنگ، اونچا کوہان، لٹکتا ہوا لمبا گل کمبل (Dewlap)، چھوٹے موٹے سینگ اور انتہائی پرسکون مزاج۔',
    averageLifespan: '15 - 18 Years',
    typicalWeightRange: 'Female: 350 - 450 kg | Male: 500 - 650 kg',
    maleFemaleDifferencesEn:
      'Bulls exhibit a substantial dark crest, heavily muscled shoulders, and majestic masculine neck folds. Cows have well-developed pendulous udders with uniformly spaced teats.',
    maleFemaleDifferencesUr:
      'سانڈ کا رنگ گردن کے پاس گہرا سیاہی مائل ہوتا ہے، کوہان بڑا اور جسم چوڑا ہوتا ہے؛ جبکہ گائے کا ہوانہ بڑا اور تھن متوازن ہوتے ہیں۔',
    feedingRequirementsEn:
      'Requires 30-40 kg green fodder (Berseem/Maize), 3-4 kg wheat straw (Bhoosa), and 1 kg Wanda concentrate per 2.5 liters of milk produced.',
    feedingRequirementsUr:
      'روزانہ 30 تا 40 کلو سبز چارہ، 3 تا 4 کلو گندم کی توڑی، اور ہر اڑھائی لیٹر دودھ پر ایک کلو متوازن ونڈا۔',
    housingEnvironmentEn:
      'Thrives in tropical heat up to 48°C. Requires well-ventilated dry sheds with ceiling fans and misters during hot peak summers.',
    housingEnvironmentUr:
      'گرمی اور حبس برداشت کرنے کی بے مثال صلاحیت (48 ڈگری سینٹی گریڈ تک)، ہوا دار شیڈ اور پینے کا ٹھنڈا پانی۔',
    reproductionInfoEn:
      'Age at first calving: 36-40 months. Gestation period: 283 days. Calving interval: 13-15 months.',
    reproductionInfoUr:
      'پہلی بار گابھن ہونے کی عمر: 36 تا 40 ماہ۔ مدتِ حمل: 283 دن۔ دو بچوں کے درمیان وقفہ: 13 تا 15 ماہ۔',
    careMaintenanceEn:
      'Regular tick bathing, twice-daily grooming, clean concrete/grooved rubber flooring, and clean ad-libitum drinking water.',
    careMaintenanceUr:
      'روزانہ کھرکھرا کرنا، چیچڑوں سے بچاؤ کے سپرے، ہوانہ کی صفائی اور 24 گھنٹے صاف پینے کا پانی۔',
    commonDiseases: [
      'Foot and Mouth Disease (FMD)',
      'Hemorrhagic Septicemia (HS)',
      'Mastitis (ساڑو)',
      'Lumpy Skin Disease (LSD)',
      'Tick Fever (Theileriosis)',
    ],
    vaccinationInfoEn:
      'FMD bi-annually (Spring & Autumn). HS before monsoon (May/June). Blackleg (BQ) in calves. LSD annually.',
    vaccinationInfoUr:
      'منہ کھر (FMD) سال میں دو بار (بہار اور خزاں)، گل گھوٹو (HS) مئی/جون میں، اور لمپی سکن (LSD) سالانہ۔',
    economicUsesEn:
      'Pakistan’s best dairy zebu cattle producing 2,500-3,500 liters of high A2 beta-casein rich milk per lactation.',
    economicUsesUr:
      'پاکستان کی بہترین دیسی ڈیری گائے، سالانہ 2500 تا 3500 لیٹر صحت بخش A2 پروٹین سے بھرپور دودھ۔',
    specialCareEn:
      'Protect from high humidity tick exposure; supplement with calcium borogluconate during high yield lactation.',
    specialCareUr:
      'برساتی موسم میں چیچڑوں اور تھلیریوسس سے بچاؤ؛ زیادہ دودھ کے دوران کیلشیم اور فاسفورس کی فراہمی۔',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cholistani_cow',
    speciesId: 'cow',
    name: 'Cholistani Cow (چولستانی)',
    nameUrdu: 'چولستانی گائے',
    origin: 'Cholistan Desert (Rohi), Bahawalpur, Punjab',
    originUrdu: 'صحرائے چولستان (روہی)، بہاولپور، پنجاب',
    scientificName: 'Bos indicus',
    physicalCharacteristicsEn:
      'White body with distinct black, brown, or red piebald spots/patches, medium ears, medium horns, and tight desert skin.',
    physicalCharacteristicsUr:
      'سفید جسم پر سیاہ، سرخ یا بھورے دھبے (چتکبری گائے)، درمیانے سینگ، اور صحرائی ماحول کے مطابق مضبوط جلد۔',
    averageLifespan: '14 - 17 Years',
    typicalWeightRange: 'Female: 320 - 400 kg | Male: 480 - 600 kg',
    maleFemaleDifferencesEn:
      'Cholistani bulls display a massive hump, strong stamina for walking dozens of kilometers in dunes, and bold speckled markings.',
    maleFemaleDifferencesUr:
      'سانڈ کا کوہان بڑا اور ریگستان میں طویل فاصلہ طے کرنے کی بھرپور طاقت ہوتی ہے؛ گائے ہلکی پھلکی اور دودھ والی ہوتی ہے۔',
    feedingRequirementsEn:
      'High digestive efficiency on coarse desert grasses, tree loppings, and dry roughage supplemented with 2-3 kg Wanda.',
    feedingRequirementsUr:
      'خشک گھاس، کیکر کے پتے اور روہی کے خود رو پودوں پر پلنے کی صلاحیت، ڈیری فارم پر 2 سے 3 کلو ونڈا۔',
    housingEnvironmentEn:
      'Extremely hardy, tolerates scorching temperatures exceeding 50°C and arid dry winds.',
    housingEnvironmentUr:
      'شدید ترین گرمی (50 ڈگری سینٹی گریڈ) اور قحط سالی برداشت کرنے والا انتہائی مضبوط جانور۔',
    reproductionInfoEn:
      'First calving at 38-42 months. Natural desert breeding adaptability with strong maternal instincts.',
    reproductionInfoUr:
      'پہلی پیدائش: 38 تا 42 ماہ۔ قدرتی بریڈنگ میں انتہائی فعال اور بچوں کی زبردست دیکھ بھال۔',
    careMaintenanceEn: 'Periodic deworming against internal flukes, salt licks always available.',
    careMaintenanceUr: 'پیٹ کے کیڑوں سے بچاؤ کی دوا اور نمک کا ڈھیلا شیڈ میں ہر وقت رکھنا۔',
    commonDiseases: ['HS', 'FMD', 'Anthrax in arid zones', 'Camel fly / Tick bites'],
    vaccinationInfoEn: 'HS pre-monsoon, FMD biannually.',
    vaccinationInfoUr: 'گل گھوٹو ویکسین مئی/جون، اور منہ کھر سال میں دو بار۔',
    economicUsesEn: 'Dual-purpose milk and draft. Produces 1,500-2,200 liters of milk with 4.5% butterfat.',
    economicUsesUr: 'دودھ اور گوشت دونوں کے لیے بہترین؛ 1500 تا 2200 لیٹر چکنائی سے بھرپور دودھ۔',
    specialCareEn: 'Provide shaded watering points during extreme June/July heatwaves.',
    specialCareUr: 'جون جولائی کی شدید لو کے دوران سائے اور ٹھنڈے پانی کا انتظام۔',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'nili_ravi_buffalo',
    speciesId: 'buffalo',
    name: 'Nili-Ravi Buffalo (نیلی راوی)',
    nameUrdu: 'نیلی راوی بھینس',
    origin: 'Sutlej & Ravi River Valleys (Sahiwal, Okara, Pakpattan, Lahore)',
    originUrdu: 'وادیٔ ستلج اور راوی (اوکاڑہ، پاکپتن، ساہیوال، قصور)',
    scientificName: 'Bubalus bubalis',
    physicalCharacteristicsEn:
      'Jet black body with distinctive "Panj Kalyan" markings: white forehead star, white muzzle, white switch of tail, and white socks on all four legs. Tightly curled horns.',
    physicalCharacteristicsUr:
      'کالا سیاہ جسم اور پانچ سفید نشانات (پنج کلیان): ماتھے پر سفید پھول، منہ سفید، دم کی چھڑی سفید اور چاروں پاؤں سفید۔ گول مڑے ہوئے خوبصورت سینگ۔',
    averageLifespan: '18 - 22 Years',
    typicalWeightRange: 'Female: 500 - 650 kg | Male: 650 - 850 kg',
    maleFemaleDifferencesEn:
      'Bulls have gigantic broad chests, thick curly crests, and thick horns. Buffalo cows have wide triangular wedge-shaped hips and capacious square udders.',
    maleFemaleDifferencesUr:
      'سانڈ بھاری اور چوڑے سینے والا ہوتا ہے؛ مادہ بھینس پیچھے سے چوڑی (ٹرائینگل شیپ) اور بڑے چوکور ہوانے کی حامل ہوتی ہے۔',
    feedingRequirementsEn:
      'Heavy feeders: 50-60 kg green fodder (sorghum, berseem), 5-6 kg wheat straw, and 1 kg balanced Wanda per 2 liters of high-fat milk.',
    feedingRequirementsUr:
      'زیادہ خوراک کھانے والی: 50 تا 60 کلو سبز چارہ، 5 کلو توڑی، اور ہر دو لیٹر دودھ پر ایک کلو معیاری ونڈا۔',
    housingEnvironmentEn:
      'Requires wallowing ponds or sprinkler shower systems twice a day in summer due to sparse sweat glands.',
    housingEnvironmentUr:
      'پسینے کے غدود کم ہونے کی وجہ سے گرمیوں میں نہلانا یا فوارہ سسٹم (شاور) دن میں دو بار انتہائی ضروری ہے۔',
    reproductionInfoEn:
      'Gestation period: 310 days (approx 10 months 10 days). Tends to show silent heat in summer peak.',
    reproductionInfoUr:
      'مدتِ حمل: 310 دن (تقریباً 10 ماہ 10 دن)۔ گرمیوں میں خاموش ہیٹ (Silent Heat) کا امکان زیادہ ہوتا ہے۔',
    careMaintenanceEn: 'Wallowing/cooling at 11 AM and 3 PM during summer; hooves trimming.',
    careMaintenanceUr: 'گرمیوں میں پانی کا چھڑکاؤ، کھروں کی صفائی اور باقاعدہ کھرکھرا۔',
    commonDiseases: [
      'Hemorrhagic Septicemia (HS / گل گھوٹو)',
      'Mastitis (ساڑو)',
      'Milk Fever (hypocalcemia)',
      'Prolapse (پچھا دکھانا)',
      'FMD',
    ],
    vaccinationInfoEn:
      'HS vaccine is mandatory twice a year (May and November); FMD vaccine in February and September.',
    vaccinationInfoUr:
      'گل گھوٹو (HS) سال میں دو بار (مئی اور نومبر) لگانا لازمی ہے؛ منہ کھر سال میں دو بار۔',
    economicUsesEn:
      'The premier milk buffalo in the world, averaging 2,400 to 4,000+ liters of thick, 6.5-8% fat milk.',
    economicUsesUr:
      'دنیا کی سب سے بہترین دودھ دینے والی بھینس، اوسط پیداوار 2400 تا 4000+ لیٹر دودھ مع 7 فیصد چکنائی۔',
    specialCareEn:
      'Combat heat stress immediately; never let pregnant buffalo stay under direct 45°C sun without shade.',
    specialCareUr:
      'گرمی کے دباؤ سے بچائیں؛ گابھن بھینس کو تپتی دھوپ میں ہرگز نہ کھڑا کریں۔',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kundi_buffalo',
    speciesId: 'buffalo',
    name: 'Kundi Buffalo (کنڈی بھینس)',
    nameUrdu: 'کنڈی بھینس',
    origin: 'Sindh, Pakistan (along Indus River: Khairpur, Larkana, Hyderabad)',
    originUrdu: 'سندھ، پاکستان (دریائے سندھ کا طاس: خیرپور، لاڑکانہ، نوابشاہ، حیدرآباد)',
    scientificName: 'Bubalus bubalis',
    physicalCharacteristicsEn:
      'Jet black with hook-shaped (Kundi) horns curved backward and upward with an inward fishhook tip. Broad forehead.',
    physicalCharacteristicsUr:
      'چمکدار کالا رنگ، سینگ مچھلی کے کانٹے کی طرح پیچھے کی طرف مڑ کر کنڈی نما ہوتے ہیں۔ چوڑا ماتھا۔',
    averageLifespan: '18 - 20 Years',
    typicalWeightRange: 'Female: 450 - 550 kg | Male: 600 - 750 kg',
    maleFemaleDifferencesEn: 'Bulls are aggressive and muscular with thick hook horns.',
    maleFemaleDifferencesUr: 'سانڈ چست، پرجوش اور طاقتور ہوتا ہے؛ مادہ پرسکون اور دودھاری ہوتی ہے۔',
    feedingRequirementsEn: 'Similar to riverine buffaloes; thrives on Rhodes grass, Lucerne, and sugarcane tops.',
    feedingRequirementsUr: 'لوسرن، روڈس گھاس، کماد کے اگولے اور ڈیری ونڈا۔',
    housingEnvironmentEn: 'Adapted to Sindh’s hot humid climate, requires access to water canals or showers.',
    housingEnvironmentUr: 'سندھ کی گرمی اور نمی کے لیے موزوں، نہر میں بیٹھنے یا شاور کی ضرورت۔',
    reproductionInfoEn: 'Gestation 310 days. Calving interval around 14 months.',
    reproductionInfoUr: 'مدتِ حمل: 310 دن۔ دو سُوؤں کا درمیانی وقفہ: 14 ماہ۔',
    careMaintenanceEn: 'Shower twice daily, mastitis screening after each milking.',
    careMaintenanceUr: 'روزانہ نہلانا، چوائی کے بعد تھنوں کی صفائی اور جراثیم کش لوشن۔',
    commonDiseases: ['HS', 'Mastitis', 'Surra (Trypanosomiasis)', 'FMD'],
    vaccinationInfoEn: 'HS and FMD according to Sindh Livestock vaccination calendar.',
    vaccinationInfoUr: 'محکمہ لائیو اسٹاک سندھ کے شیڈول کے مطابق گل گھوٹو اور منہ کھر۔',
    economicUsesEn: 'High milk production (2,000-3,200 liters/lactation) with rich fat.',
    economicUsesUr: 'سندھ کی مشہور ڈیری بھینس، 2000 تا 3200 لیٹر دودھ۔',
    specialCareEn: 'Ensure high minerals in diet during peak monsoon when humidity is high.',
    specialCareUr: 'مون سون کی حبس کے دوران نمکیات اور منرل مکسچر کی وافر مقدار۔',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  },

  // GOATS
  {
    id: 'beetal_goat',
    speciesId: 'goat',
    name: 'Beetal Goat (بیتل بکری)',
    nameUrdu: 'بیتل بکری / امرتسری',
    origin: 'Punjab (Faisalabad, Sialkot, Gurdaspur, Lahore)',
    originUrdu: 'پنجاب (فیصل آباد، سیالکوٹ، لاہور، ملتان)',
    scientificName: 'Capra hircus',
    physicalCharacteristicsEn:
      'Roman nose (convex face), long pendulous twisted ears, spiral horns, long legs, coat colors vary from golden, black, white, to speckled (chhabra).',
    physicalCharacteristicsUr:
      'طوطے جیسی مڑی ہوئی ناک (رومن نوز)، لمبے لٹکتے ہوئے کان، چوڑے مضبوط کھر، اونچے پاؤں، رنگ سنہری، کالا، مکھا چینا یا چتکبرا۔',
    averageLifespan: '10 - 14 Years',
    typicalWeightRange: 'Female: 45 - 65 kg | Male: 75 - 110 kg',
    maleFemaleDifferencesEn:
      'Bucks grow impressive long spiral horns, bearded chins, heavy shoulders, and high masculine stature. Does have well-developed udders and high prolificacy.',
    maleFemaleDifferencesUr:
      'بکرے کے بڑے لہریے دار سینگ، لمبی داڑھی اور اونچا قد ہوتا ہے؛ بکریاں جڑواں اور تین بچے دینے میں مشہور ہیں۔',
    feedingRequirementsEn:
      'Browsers: prefers tree leaves (kikar, beri, peepal), green Lucerne/berseem, crushed grains (maize, barley), and Wanda 500g - 1kg daily.',
    feedingRequirementsUr:
      'بیری، کیکر کے پتے، لوسرن، مکئی، جو اور روزانہ 500 گرام سے 1 کلو بکریوں کا خصوصی ونڈا۔',
    housingEnvironmentEn:
      'Dry elevated slatted wooden flooring preferred. Sensitive to wet cold and mud rot.',
    housingEnvironmentUr:
      'خشک اور ہوادار باڑہ؛ زمین کی نمی اور کیچڑ سے بچاؤ کے لیے لکڑی کے تختے یا اونچی جالی دار فرش بہترین ہے۔',
    reproductionInfoEn:
      'Gestation: 150 days (5 months). High twinning rate (60-70% twins or triplets). Age of maturity: 8-12 months.',
    reproductionInfoUr:
      'مدتِ حمل: 150 دن (5 ماہ)۔ 60 سے 70 فیصد کیسز میں جڑواں اور تین بچے پیدا ہوتے ہیں۔',
    careMaintenanceEn: 'Trim hooves every 3 months; deworming every 3-4 months.',
    careMaintenanceUr: 'ہر 3 ماہ بعد کھروں کی تراش خراش؛ ہر 3 سے 4 ماہ بعد پیٹ کے کیڑوں کا شربت۔',
    commonDiseases: [
      'Enterotoxemia (ETV / پیٹ کا زہر)',
      'PPR (بکریوں کا طاعون)',
      'Contagious Caprine Pleuropneumonia (CCPP / نمونیا)',
      'Coccidiosis',
    ],
    vaccinationInfoEn:
      'ETV in March and October. PPR once in lifetime (or as per vet guideline). CCPP in winter onset.',
    vaccinationInfoUr:
      'ای ٹی وی (ETV) سال میں دو بار (مارچ اور اکتوبر)؛ پی پی آر (PPR) اور سی سی پی پی سردیوں کے آغاز میں۔',
    economicUsesEn:
      'Top choice for commercial meat and Eid-ul-Adha sacrifice; females produce 2-3 liters of milk daily.',
    economicUsesUr:
      'قربانی کے لیے سب سے زیادہ پسندیدہ اور مہنگا بکرا؛ بکریاں روزانہ 2 سے 3 لیٹر دودھ بھی دیتی ہیں۔',
    specialCareEn: 'Protect newly born kids from hypothermia in winter nights.',
    specialCareUr: 'سردیوں میں نومولود میمنوں کو ٹھنڈ سے بچائیں اور پیدائش کے فورا بعد ماں کی پہلی کِھس پلائیں۔',
    imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'teddy_goat',
    speciesId: 'goat',
    name: 'Teddy Goat (ٹیڈی بکری)',
    nameUrdu: 'ٹیڈی بکری',
    origin: 'Punjab, Pakistan',
    originUrdu: 'پنجاب، پاکستان',
    scientificName: 'Capra hircus',
    physicalCharacteristicsEn:
      'Compact, small to medium body, short erect ears, active posture, coat colors: white, brown, spotted, and black.',
    physicalCharacteristicsUr:
      'چھوٹا چست جسم، کھڑے چھوٹے کان، تیز رفتار اور سفید، چتکبرے یا بھورے رنگ۔',
    averageLifespan: '9 - 12 Years',
    typicalWeightRange: 'Female: 25 - 35 kg | Male: 35 - 50 kg',
    maleFemaleDifferencesEn: 'Bucks have stout horns and lively personality; does reproduce rapidly.',
    maleFemaleDifferencesUr: 'بکرا چھوٹے سینگوں والا پھرتیلا ہوتا ہے؛ بکریاں سال میں دو بار بچے دینے کی صلاحیت رکھتی ہیں۔',
    feedingRequirementsEn: 'Economical feeder; needs 3-4 kg green fodder and 250-400g grain mix.',
    feedingRequirementsUr: 'کم خرچ: 3 سے 4 کلو چارہ اور 300 گرام دلیہ یا ونڈا۔',
    housingEnvironmentEn: 'Very adaptable, requires minimal shed space.',
    housingEnvironmentUr: 'چھوٹی جگہ یا گھروں کی چھتوں پر بھی باآسانی پالی جا سکتی ہے۔',
    reproductionInfoEn: 'Extremely fertile; reaches sexual maturity at 6-8 months, frequent triplets and quads.',
    reproductionInfoUr: 'انتہائی زرخیز: 6 سے 8 ماہ کی عمر میں تیار، سال میں دو بار تین تین بچے دینے کی شہرت۔',
    careMaintenanceEn: 'Routine deworming, keep bedding dry.',
    careMaintenanceUr: 'باقاعدہ ڈی ورمنگ اور باڑے کی سوکھی مٹی۔',
    commonDiseases: ['PPR', 'ETV', 'Mange (کھجلی)', 'Pneumonia'],
    vaccinationInfoEn: 'ETV and PPR vaccines mandatory.',
    vaccinationInfoUr: 'ای ٹی وی اور پی پی آر حفاظتی ٹیکے۔',
    economicUsesEn: 'Rapid commercial breeding for meat multiplication.',
    economicUsesUr: 'تیز ترین گوشت کی پیداوار اور گھریلو فارمنگ کے لیے بہترین۔',
    specialCareEn: 'Careful monitoring of multi-kid litters to ensure all kids nurse.',
    specialCareUr: 'زیادہ بچے ہونے پر سب کو برابر دودھ ملنے کی تسلی کریں۔',
    imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80',
  },

  // SHEEP
  {
    id: 'kajli_sheep',
    speciesId: 'sheep',
    name: 'Kajli Sheep (کجلی چھترا)',
    nameUrdu: 'کجلی چھترا / بھیڑ',
    origin: 'Sargodha, Khushab, Mianwali, Gujranwala, Punjab',
    originUrdu: 'سرگودھا، خوشاب، میانوالی، گوجرانوالہ',
    scientificName: 'Ovis aries',
    physicalCharacteristicsEn:
      'Pure snow white body with prominent black rings around dark eyes (Kajal / کاجل), black tipped nose and ears, long Roman face, and graceful royal gait.',
    physicalCharacteristicsUr:
      'برف جیسا سفید جسم اور آنکھوں کے گرد خوبصورت سیاہ کاجل جیسے حلقے، کالے کان کے کنارے اور کالی تھوتھنی، طوطے جیسی ناک اور شاہانہ چال۔',
    averageLifespan: '10 - 13 Years',
    typicalWeightRange: 'Female: 40 - 55 kg | Male: 60 - 95 kg',
    maleFemaleDifferencesEn:
      'Rams possess large magnificent spiral horns or polling, thick chest, and fetch the highest prices in Eid Qurbani markets. Ewes are usually polled.',
    maleFemaleDifferencesUr:
      'چھترے کے بڑے خم دار سینگ، اونچی گردن اور عید پر لاکھوں روپے قیمت؛ مادہ کے سینگ نہیں ہوتے۔',
    feedingRequirementsEn:
      'Grazing pastures, green grasses, berseem, gram straw, oats, and protein Wanda 400-800g.',
    feedingRequirementsUr:
      'سبز چارہ، لوسرن، چنے کی کاٹ، جئی، اور 500 گرام اناج کا دلیہ۔',
    housingEnvironmentEn: 'Prefers open dry pens, cannot withstand waterlogged marshy grounds.',
    housingEnvironmentUr: 'خشک ریتلے یا کچے ہوادار باڑے، دلدلی زمین اور کیچڑ سے دور رکھیں۔',
    reproductionInfoEn: 'Gestation 150 days. Single or twin births. Strong seasonal estrus.',
    reproductionInfoUr: 'مدتِ حمل: 150 دن۔ عموماً ایک یا دو خوبصورت بچے پیدا ہوتے ہیں۔',
    careMaintenanceEn: 'Bi-annual wool shearing (Spring and Autumn), footbath copper sulfate.',
    careMaintenanceUr: 'سال میں دو بار اون کی کٹائی (بہار اور خزاں)، کھروں کا معائنہ۔',
    commonDiseases: ['Enterotoxemia (فٹ کلا)', 'Sheep Pox (چیچک)', 'PPR', 'Liver Fluke'],
    vaccinationInfoEn: 'ETV vaccine every 6 months; Sheep Pox annually.',
    vaccinationInfoUr: 'ای ٹی وی ہر 6 ماہ بعد؛ بھیڑوں کی چیچک (Sheep Pox) سالانہ۔',
    economicUsesEn:
      'The crown prince of Pakistani sacrificial sheep, prize-winning beauty competitions, wool, and mutton.',
    economicUsesUr:
      'قربانی کا سب سے خوبصورت اور قیمتی چھترا، مقابلہ حسن، اون اور لذیذ گوشت۔',
    specialCareEn: 'Keep wool clean before Qurbani; regular dusting against sheep keds and lice.',
    specialCareUr: 'اون کو صاف ستھرا رکھیں اور جوؤں سے بچاؤ کا پاؤڈر استعمال کریں۔',
    imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
  },

  // POULTRY - ASEEL
  {
    id: 'aseel_chicken',
    speciesId: 'hen',
    name: 'Aseel Chicken (اصیل مرغا / مرغی)',
    nameUrdu: 'اصیل مرغا / مرغی (میاں والی / امروہا)',
    origin: 'Punjab (Mianwali, Multan) & Sindh, Pakistan',
    originUrdu: 'میانوالی، ملتان، حیدرآباد، پاکستان',
    scientificName: 'Gallus gallus domesticus',
    physicalCharacteristicsEn:
      'Upright muscular posture, thick curved beak, broad skull, small pea comb, sparse hard feathers, and long sturdy bone shanks.',
    physicalCharacteristicsUr:
      'شیر جیسی کھڑی باوقار قامت، موٹی طوطے والی چونچ، چوڑا سر، چھوٹا تاگہ کلم، مضبوط خشک ٹانگیں اور سخت پر۔',
    averageLifespan: '8 - 12 Years',
    typicalWeightRange: 'Hen: 2.2 - 3.2 kg | Rooster: 3.5 - 5.5 kg',
    maleFemaleDifferencesEn:
      'Roosters are exceptionally courageous, fiercely territorial with long spurs. Hens are devoted broodies and protect chicks fiercely.',
    maleFemaleDifferencesUr:
      'مرغا غیر معمولی بہادر اور اونچے قد کا ہوتا ہے؛ مرغی انڈوں پر بیٹھنے (کُڑک) اور بچوں کی حفاظت میں لاجواب ہے۔',
    feedingRequirementsEn:
      'High protein grains (cracked wheat, millet/bajra, soaked almonds, boiled eggs, mutton mince) and clean water with vitamins.',
    feedingRequirementsUr:
      'گندم، باجرہ، بادام کی گری، ابلے انڈے کا چورا، اور وٹامن والا تازہ پانی۔',
    housingEnvironmentEn: 'Spacious individual pens or runs to prevent fighting injuries.',
    housingEnvironmentUr: 'کھلی اور دھوپ والی جگہ، ایک دوسرے سے لڑائی سے بچانے کے لیے الگ ڈربے۔',
    reproductionInfoEn: 'Seasonal layer (30-50 eggs/year); outstanding natural hatching success.',
    reproductionInfoUr: 'انڈے سالانہ 30 تا 50، قدرتی ہیچنگ اور کڑک ہونے میں دنیا کی بہترین نسل۔',
    careMaintenanceEn: 'Oil conditioning of legs, beak trimming if overgrown, daily sunlight.',
    careMaintenanceUr: 'ٹانگوں پر سرسوں کے تیل کی مالش، روزانہ صبح کی دھوپ۔',
    commonDiseases: [
      'Newcastle Disease (ND / رانی کھیت)',
      'Infectious Coryza (نزلہ)',
      'Fowl Pox (چیچک)',
      'Coccidiosis',
    ],
    vaccinationInfoEn: 'ND Lasota / Mukteswar eye drops and injection every 3 months. Fowl Pox at 8 weeks.',
    vaccinationInfoUr: 'رانی کھیت (ND) کے قطرے اور ٹیکہ ہر 3 ماہ بعد؛ چیچک کا ٹیکہ 8 ہفتے کی عمر میں۔',
    economicUsesEn: 'High value heritage fancy breed; champion show birds fetch hundreds of thousands of PKR.',
    economicUsesUr: 'شوقین حضرات کا قیمتی روایتی پرندہ؛ نایاب اصیل مرغے لاکھوں روپے میں فروخت ہوتے ہیں۔',
    specialCareEn: 'Never house two adult roosters in the same pen.',
    specialCareUr: 'دو جوان اصیل مرغوں کو کبھی ایک ہی باڑے میں اکٹھا بند نہ کریں۔',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
  },

  // PET - BULLY KUTTA
  {
    id: 'bully_kutta',
    speciesId: 'dog',
    name: 'Pakistani Bully Kutta (پاکستانی بلی کتا)',
    nameUrdu: 'پاکستانی بلی کتا (ماسٹیف)',
    origin: 'Punjab and Sindh, Pakistan',
    originUrdu: 'پنجاب اور سندھ، پاکستان',
    scientificName: 'Canis lupus familiaris',
    physicalCharacteristicsEn:
      'Giant mastiff stature, thick muscular neck, loose wrinkled skin around muzzle and dewlap, deep chest, white or harlequin/brindle coats.',
    physicalCharacteristicsUr:
      'دیوقامت ماسٹیف قد و قامت، موٹی عضلاتی گردن، منہ کے گرد ڈھیلی جھریاں دار کھال، چوڑا سینہ اور عموماً سفید یا چتکبرا رنگ۔',
    averageLifespan: '8 - 11 Years',
    typicalWeightRange: 'Female: 55 - 70 kg | Male: 70 - 90 kg',
    maleFemaleDifferencesEn:
      'Males reach up to 34 inches at withers with massive head power. Females are slightly smaller but equally protective.',
    maleFemaleDifferencesUr:
      'نر کتا 34 انچ اونچا اور 85 کلو تک وزنی ہو سکتا ہے؛ مادہ قد میں کچھ چھوٹی مگر فارم کی لاجواب محافظ۔',
    feedingRequirementsEn:
      'High calorie raw diet: 1.5 - 2.5 kg beef/chicken bones, organ meat, rice, and whole milk/curd.',
    feedingRequirementsUr:
      'روزانہ ڈیڑھ سے اڑھائی کلو گوشت، ہڈیاں، دلیہ، چاول اور دہی کا متوازن کھانا۔',
    housingEnvironmentEn: 'Large outdoor fenced acreage; not suitable for small apartments.',
    housingEnvironmentUr: 'کھلا رقبہ، وسیع فارم ہاؤس یا بڑا احاطہ؛ چھوٹے فلیٹ کے لیے ہرگز موزوں نہیں۔',
    reproductionInfoEn: 'Gestation 63 days. Litter size: 6 - 10 puppies. Strong mothering instinct.',
    reproductionInfoUr: 'مدتِ حمل: 63 دن۔ 6 تا 10 کتے کے بچے (پپیز) پیدا ہوتے ہیں۔',
    careMaintenanceEn: 'Firm alpha socialization from early puppyhood, joint supplements.',
    careMaintenanceUr: 'بچپن سے باقاعدہ تربیت (سوشلائزیشن) اور جوڑوں کی مضبوطی کے لیے کیلشیم۔',
    commonDiseases: ['Hip Dysplasia', 'Gastric Torsion / Bloat', 'Mange', 'Parvovirus'],
    vaccinationInfoEn: '7-in-1 / 8-in-1 core vaccination at 6, 9, 12 weeks; annual Rabies vaccine.',
    vaccinationInfoUr: '7-in-1 حفاظتی ویکسین اور سالانہ کتے کے پاگل پن (Rabies) کا ٹیکہ۔',
    economicUsesEn: 'Supreme livestock guardian and deterrent against farm thieves and wild predators.',
    economicUsesUr: 'لائیو اسٹاک فارم کا ناقابل تسخیر چوکیدار اور چوروں اور درندوں سے حفاظت۔',
    specialCareEn: 'Prevent bloat by avoiding vigorous exercise immediately after heavy meals.',
    specialCareUr: 'پیٹ کے مڑنے اور افارے سے بچانے کے لیے کھانا کھانے کے فوراً بعد بھاگ دوڑ نہ کروائیں۔',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
  },
];
