export type ListingCategory =
  | 'cattle'
  | 'buffalo'
  | 'goats'
  | 'sheep'
  | 'poultry'
  | 'horses'
  | 'donkeys'
  | 'pets'
  | 'other';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerIsVerified: boolean;
  category: ListingCategory;
  titleEn: string;
  titleUr: string;
  species: string;
  breed: string;
  age: string;
  gender: 'male' | 'female' | 'castrated';
  weightKg?: number;
  milkYieldLiters?: number;
  askingPrice: number;
  currency: string;
  isNegotiable: boolean;
  locationCity: string;
  locationProvince: string;
  mandiMarketName?: string;
  descriptionEn: string;
  descriptionUr: string;
  images: string[];
  videoUrl?: string;
  vaccinationStatus: 'fully_vaccinated' | 'partially_vaccinated' | 'not_vaccinated' | 'unknown';
  healthStatusDescriptionEn: string;
  healthStatusDescriptionUr: string;
  isSold: boolean;
  isFeatured: boolean;
  isSample?: boolean;
  isReported: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FraudReport {
  id: string;
  listingId: string;
  reportedByUserId: string;
  reason: 'fake_price' | 'stolen_photos' | 'wrong_breed' | 'sick_animal' | 'fraud_seller' | 'other';
  details: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'listing_removed';
}
