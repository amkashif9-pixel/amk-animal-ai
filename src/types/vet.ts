export type ConsultationMethod = 'in_clinic' | 'farm_visit' | 'tele_consultation' | 'emergency_24_7';

export interface Veterinarian {
  id: string;
  nameEn: string;
  nameUr: string;
  degrees: string; // e.g. "DVM, M.Phil (Clinical Medicine), RVMP"
  licenseNumber?: string;
  isVerified: boolean;
  verificationType?: 'manual_physical_inspection' | 'unverified';
  verifiedByAdmin?: string;
  verifiedAt?: string;
  manualVerificationDocRef?: string; // Documented proof reference for manual audit
  verificationNotes?: string;
  clinicNameEn: string;
  clinicNameUr: string;
  photoUrl?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  provinceState: string;
  districtCity: string;
  fullAddressEn: string;
  fullAddressUr: string;
  latitude: number;
  longitude: number;
  experienceYears: number;
  servicesEn: string[];
  servicesUr: string[];
  specialties: ('dairy' | 'equine' | 'poultry' | 'small_animals' | 'surgery' | 'reproduction')[];
  consultationMethods: ConsultationMethod[];
  rating: number;
  reviewCount: number;
  workingHoursEn: string;
  workingHoursUr: string;
}
