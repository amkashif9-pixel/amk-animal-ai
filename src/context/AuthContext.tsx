import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types/user';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import {
  isCurrentAdminSessionValid,
  verifyAdminKey,
  verifyAdminWithServer,
  clearAdminSession,
} from '../services/adminAuthService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminSessionActive: boolean;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  incrementAiUsage: () => boolean;
  unlockAdminPrivileges: (securityKey: string) => Promise<boolean> | boolean;
  revokeAdminPrivileges: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  farmer: {
    id: 'user_farmer_1',
    email: 'farmer@amkanimal.ai',
    fullName: 'Chaudhry Kashif',
    phone: '+923346682654',
    role: 'farmer',
    subscriptionTier: 'farmer_basic',
    farmName: 'Kashif Modern Dairy & Stud Farm',
    city: 'Sahiwal',
    province: 'Punjab',
    country: 'Pakistan',
    aiScansUsedThisMonth: 3,
    aiScansMonthlyLimit: 50,
    preferredLanguage: 'ur',
    createdAt: '2024-01-15T00:00:00Z',
  },
  admin: {
    id: 'user_admin_amk',
    email: 'admin@amkanimal.ai',
    fullName: 'amkashif (System Admin)',
    phone: '+923346682654',
    role: 'admin',
    subscriptionTier: 'commercial_pro',
    farmName: 'AMK Animal AI HQ',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    aiScansUsedThisMonth: 12,
    aiScansMonthlyLimit: 9999,
    preferredLanguage: 'ur',
    createdAt: '2023-01-01T00:00:00Z',
  },
  veterinarian: {
    id: 'user_vet_1',
    email: 'dr.kashif@amkanimal.ai',
    fullName: 'Dr. Muhammad Kashif (RVMP)',
    phone: '+923346682654',
    role: 'veterinarian',
    subscriptionTier: 'commercial_pro',
    farmName: 'Al-Razi Veterinary Clinic',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    aiScansUsedThisMonth: 15,
    aiScansMonthlyLimit: 200,
    preferredLanguage: 'ur',
    createdAt: '2024-02-10T00:00:00Z',
  },
  trader: {
    id: 'user_trader_1',
    email: 'trader@amkanimal.ai',
    fullName: 'Malik Aslam Beopari',
    phone: '+923007654321',
    role: 'trader',
    subscriptionTier: 'free',
    city: 'Faisalabad',
    province: 'Punjab',
    country: 'Pakistan',
    aiScansUsedThisMonth: 8,
    aiScansMonthlyLimit: 10,
    preferredLanguage: 'ur',
    createdAt: '2024-04-01T00:00:00Z',
  },
  pet_owner: {
    id: 'user_pet_1',
    email: 'petlover@amkanimal.ai',
    fullName: 'Zainab Fatima',
    phone: '+923214567890',
    role: 'pet_owner',
    subscriptionTier: 'free',
    city: 'Islamabad',
    province: 'Federal',
    country: 'Pakistan',
    aiScansUsedThisMonth: 2,
    aiScansMonthlyLimit: 10,
    preferredLanguage: 'en',
    createdAt: '2024-03-20T00:00:00Z',
  },
};

const USER_STORAGE_KEY = 'amk_animal_ai_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // In production, do NOT initialize with a default demo account
    if (import.meta.env.PROD && !isSupabaseConfigured()) {
      return null;
    }

    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Defense against localStorage role poisoning:
        // A user cannot elevate to admin simply by modifying localStorage
        if (parsed?.role === 'admin' && !isCurrentAdminSessionValid()) {
          parsed.role = 'farmer';
        }
        return parsed;
      } catch (e) {
        return import.meta.env.PROD ? null : DEMO_USERS.farmer;
      }
    }
    return import.meta.env.PROD ? null : DEMO_USERS.farmer;
  });

  const [isAdminSessionActive, setIsAdminSessionActive] = useState<boolean>(() => {
    return isCurrentAdminSessionValid();
  });

  const [isServerAdminVerified, setIsServerAdminVerified] = useState<boolean>(false);

  // Sync state changes to storage
  useEffect(() => {
    if (user) {
      // Never persist administrative role in plain localStorage without active valid session
      const sanitized = { ...user };
      if (sanitized.role === 'admin' && !isCurrentAdminSessionValid() && !isServerAdminVerified) {
        sanitized.role = 'farmer';
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      clearAdminSession();
      setIsAdminSessionActive(false);
      setIsServerAdminVerified(false);
    }
  }, [user, isServerAdminVerified]);

  // Check Supabase session and server-side admin claims on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Check server-side is_admin RPC
          supabase.rpc('is_admin').then(({ data: hasAdminClaim }) => {
            setIsServerAdminVerified(Boolean(hasAdminClaim));
          });

          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const formattedUser: UserProfile = {
                  id: profile.id,
                  email: profile.email,
                  fullName: profile.full_name,
                  phone: profile.phone || '',
                  role: profile.role,
                  subscriptionTier: profile.subscription_tier,
                  farmName: profile.farm_name,
                  city: profile.city,
                  province: profile.province,
                  country: profile.country || 'Pakistan',
                  aiScansMonthlyLimit: profile.ai_scans_monthly_limit,
                  aiScansUsedThisMonth: profile.ai_scans_used_this_month,
                  preferredLanguage: profile.preferred_language,
                  createdAt: profile.created_at,
                };
                setUser(formattedUser);
              }
            });
        }
      });
    }
  }, []);

  const loginAsDemo = (role: UserRole) => {
    // Production builds completely disable demo role elevation
    if (import.meta.env.PROD) {
      console.error('Demo authentication is disabled in production builds.');
      return;
    }

    const demo = DEMO_USERS[role] || DEMO_USERS.farmer;
    setUser(demo);
    if (role === 'admin') {
      verifyAdminKey('amk923346682654');
      setIsAdminSessionActive(true);
    } else {
      clearAdminSession();
      setIsAdminSessionActive(false);
      setIsServerAdminVerified(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAdminSession();
    setIsAdminSessionActive(false);
    setIsServerAdminVerified(false);
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const unlockAdminPrivileges = async (securityKey: string): Promise<boolean> => {
    // In live backend mode, verify exclusively with server RPC
    if (isSupabaseConfigured()) {
      const serverResult = await verifyAdminWithServer();
      if (serverResult.success) {
        setIsServerAdminVerified(true);
        setIsAdminSessionActive(true);
        return true;
      }
      return false;
    }

    // In local development simulation only (strictly blocked in production)
    if (!import.meta.env.PROD) {
      const valid = verifyAdminKey(securityKey, user?.email);
      if (valid) {
        setIsAdminSessionActive(true);
        return true;
      }
    }

    return false;
  };

  const revokeAdminPrivileges = () => {
    clearAdminSession();
    setIsAdminSessionActive(false);
    setIsServerAdminVerified(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    // Security: Block client-side modification of privilege fields
    const sanitized = { ...updates };
    delete sanitized.role;
    delete sanitized.subscriptionTier;
    delete sanitized.aiScansMonthlyLimit;
    delete (sanitized as any).email;
    delete (sanitized as any).aiScansUsedThisMonth;
    delete (sanitized as any).id;
    delete (sanitized as any).createdAt;

    if (isSupabaseConfigured() && user) {
      const dbUpdates: Record<string, any> = {};
      if (sanitized.fullName !== undefined) dbUpdates.full_name = sanitized.fullName;
      if (sanitized.phone !== undefined) dbUpdates.phone = sanitized.phone;
      if (sanitized.farmName !== undefined) dbUpdates.farm_name = sanitized.farmName;
      if (sanitized.city !== undefined) dbUpdates.city = sanitized.city;
      if (sanitized.province !== undefined) dbUpdates.province = sanitized.province;
      if (sanitized.country !== undefined) dbUpdates.country = sanitized.country;
      if (sanitized.preferredLanguage !== undefined) dbUpdates.preferred_language = sanitized.preferredLanguage;

      supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed updating profile in Supabase:', error.message);
          }
        });
    }

    setUser({ ...user, ...sanitized });
  };

  const incrementAiUsage = (): boolean => {
    if (!user) return true;
    if (user.role === 'admin') return true;
    if (user.aiScansUsedThisMonth >= user.aiScansMonthlyLimit) {
      return false;
    }
    setUser({
      ...user,
      aiScansUsedThisMonth: user.aiScansUsedThisMonth + 1,
    });
    return true;
  };

  // Authoritative admin evaluation:
  // In production / live backend: Requires genuine server-side admin claim (public.is_admin())
  // In dev simulation: Requires admin role claim AND valid in-memory session
  const isAdmin = isSupabaseConfigured()
    ? Boolean(user?.role === 'admin' && isServerAdminVerified)
    : Boolean(user?.role === 'admin' && isAdminSessionActive && !import.meta.env.PROD);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isAdminSessionActive,
        loginAsDemo,
        logout,
        updateProfile,
        incrementAiUsage,
        unlockAdminPrivileges,
        revokeAdminPrivileges,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
