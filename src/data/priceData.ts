export interface MandiBenchmark {
  species: string;
  breed: string;
  basePricePerKgLiveWeight: number; // in PKR
  dairyYieldPerLiterBonus: number; // in PKR value added per liter
  qurbaniTeethMultiplier: Record<string, number>;
  pregnancyBonusMin: number;
  pregnancyBonusMax: number;
}

export const PAKISTAN_MANDI_BENCHMARKS: Record<string, MandiBenchmark> = {
  sahiwal_cow: {
    species: 'cow',
    breed: 'Sahiwal Cow',
    basePricePerKgLiveWeight: 650, // Rs 650/kg live weight
    dairyYieldPerLiterBonus: 12000, // +Rs 12,000 to total animal value per consistent liter/day
    qurbaniTeethMultiplier: {
      milk_teeth: 1.0,
      two_teeth: 1.25, // دوندہ prime
      four_teeth: 1.2,
      six_teeth: 1.05,
      full_mouth: 0.9,
    },
    pregnancyBonusMin: 30000,
    pregnancyBonusMax: 70000,
  },
  cholistani_cow: {
    species: 'cow',
    breed: 'Cholistani Cow',
    basePricePerKgLiveWeight: 620,
    dairyYieldPerLiterBonus: 10000,
    qurbaniTeethMultiplier: {
      milk_teeth: 1.0,
      two_teeth: 1.2,
      four_teeth: 1.15,
      six_teeth: 1.0,
      full_mouth: 0.85,
    },
    pregnancyBonusMin: 25000,
    pregnancyBonusMax: 50000,
  },
  nili_ravi_buffalo: {
    species: 'buffalo',
    breed: 'Nili-Ravi Buffalo',
    basePricePerKgLiveWeight: 700,
    dairyYieldPerLiterBonus: 18000, // Buffalo milk (high butterfat) commands massive price per liter
    qurbaniTeethMultiplier: {
      milk_teeth: 1.0,
      two_teeth: 1.2,
      four_teeth: 1.15,
      six_teeth: 1.0,
      full_mouth: 0.85,
    },
    pregnancyBonusMin: 40000,
    pregnancyBonusMax: 90000,
  },
  kundi_buffalo: {
    species: 'buffalo',
    breed: 'Kundi Buffalo',
    basePricePerKgLiveWeight: 660,
    dairyYieldPerLiterBonus: 15000,
    qurbaniTeethMultiplier: {
      milk_teeth: 1.0,
      two_teeth: 1.18,
      four_teeth: 1.12,
      six_teeth: 0.98,
      full_mouth: 0.85,
    },
    pregnancyBonusMin: 35000,
    pregnancyBonusMax: 75000,
  },
  beetal_goat: {
    species: 'goat',
    breed: 'Beetal Goat',
    basePricePerKgLiveWeight: 1100, // Goats command high meat/Qurbani rate per kg
    dairyYieldPerLiterBonus: 15000,
    qurbaniTeethMultiplier: {
      milk_teeth: 0.9,
      two_teeth: 1.4, // Prize دوندہ
      four_teeth: 1.25,
      six_teeth: 1.0,
      full_mouth: 0.8,
    },
    pregnancyBonusMin: 15000,
    pregnancyBonusMax: 35000,
  },
  teddy_goat: {
    species: 'goat',
    breed: 'Teddy Goat',
    basePricePerKgLiveWeight: 950,
    dairyYieldPerLiterBonus: 8000,
    qurbaniTeethMultiplier: {
      milk_teeth: 0.9,
      two_teeth: 1.25,
      four_teeth: 1.15,
      six_teeth: 0.95,
      full_mouth: 0.8,
    },
    pregnancyBonusMin: 10000,
    pregnancyBonusMax: 20000,
  },
  kajli_sheep: {
    species: 'sheep',
    breed: 'Kajli Sheep',
    basePricePerKgLiveWeight: 1200, // Premium Qurbani beauty markup
    dairyYieldPerLiterBonus: 5000,
    qurbaniTeethMultiplier: {
      milk_teeth: 0.95,
      two_teeth: 1.5, // Supreme prize Kajli
      four_teeth: 1.3,
      six_teeth: 1.05,
      full_mouth: 0.8,
    },
    pregnancyBonusMin: 15000,
    pregnancyBonusMax: 30000,
  },
  aseel_chicken: {
    species: 'hen',
    breed: 'Aseel Chicken',
    basePricePerKgLiveWeight: 3500, // Priced as heritage/game bird rather than commercial broiler
    dairyYieldPerLiterBonus: 0,
    qurbaniTeethMultiplier: {
      milk_teeth: 1.0,
      two_teeth: 1.2,
      four_teeth: 1.1,
      six_teeth: 1.0,
      full_mouth: 0.9,
    },
    pregnancyBonusMin: 0,
    pregnancyBonusMax: 0,
  },
  bully_kutta: {
    species: 'dog',
    breed: 'Bully Kutta',
    basePricePerKgLiveWeight: 1500,
    dairyYieldPerLiterBonus: 0,
    qurbaniTeethMultiplier: {
      milk_teeth: 1.3, // Puppies premium
      two_teeth: 1.2,
      four_teeth: 1.0,
      six_teeth: 0.8,
      full_mouth: 0.6,
    },
    pregnancyBonusMin: 20000,
    pregnancyBonusMax: 50000,
  },
};

export const MAJOR_MANDIS = [
  { id: 'lahore_kanjra', nameEn: 'Shahpur Kanjra Mandi (Lahore)', nameUr: 'شاہ پور کانجراں منڈی (لاہور)', province: 'Punjab' },
  { id: 'multan_mandi', nameEn: 'Bosan Road Livestock Market (Multan)', nameUr: 'مویشی منڈی بوسن روڈ (ملتان)', province: 'Punjab' },
  { id: 'faisalabad_mandi', nameEn: 'Narwala Road Mandi (Faisalabad)', nameUr: 'نڑوالا روڈ منڈی (فیصل آباد)', province: 'Punjab' },
  { id: 'sahiwal_mandi', nameEn: 'Sahiwal Central Mandi', nameUr: 'مرکزی مویشی منڈی (ساہیوال)', province: 'Punjab' },
  { id: 'karachi_sohrab', nameEn: 'Northern Bypass / Sohrab Goth (Karachi)', nameUr: 'ناردرن بائی پاس مویشی منڈی (کراچی)', province: 'Sindh' },
  { id: 'hyderabad_mandi', nameEn: 'Hala Naka Mandi (Hyderabad)', nameUr: 'ہالا ناکہ مویشی منڈی (حیدرآباد)', province: 'Sindh' },
  { id: 'peshawar_ring', nameEn: 'Ring Road Mandi (Peshawar)', nameUr: 'رنگ روڈ منڈی (پشاور)', province: 'KPK' },
  { id: 'quetta_mandi', nameEn: 'Eastern Bypass Mandi (Quetta)', nameUr: 'ایسٹرن بائی پاس منڈی (کوئٹہ)', province: 'Balochistan' },
  { id: 'islamabad_i12', nameEn: 'I-12 Livestock Market (Islamabad)', nameUr: 'مویشی منڈی I-12 (اسلام آباد)', province: 'Federal' },
];
