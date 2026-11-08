export type UserRole = 'farmer' | 'pet_owner' | 'veterinarian' | 'trader' | 'admin';

export type SubscriptionTier = 'free' | 'farmer_basic' | 'commercial_pro';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  farmName?: string;
  city?: string;
  province?: string;
  country: string;
  aiScansUsedThisMonth: number;
  aiScansMonthlyLimit: number;
  preferredLanguage: 'en' | 'ur';
  createdAt: string;
}
