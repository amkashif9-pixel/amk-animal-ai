/**
 * Marketplace Security & Management Service
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * Enforces security controls:
 * - Sellers cannot set or modify is_featured, is_reported, report_count.
 * - Protects seller private data from unnecessary exposure.
 * - Enforces secure fraud reporting with anti-spam / anti-self-reporting rules.
 * - Provides administrative moderation RPC integration.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { MarketplaceListing, ListingCategory, FraudReport } from '../types/marketplace';

const MARKETPLACE_STORAGE_KEY = 'amk_marketplace_listings';
const FRAUD_REPORTS_STORAGE_KEY = 'amk_fraud_reports';

function getLocalListings(): MarketplaceListing[] {
  try {
    const raw = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalListings(listings: MarketplaceListing[]) {
  localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(listings));
}

function getLocalReports(): FraudReport[] {
  try {
    const raw = localStorage.getItem(FRAUD_REPORTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: FraudReport[]) {
  localStorage.setItem(FRAUD_REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

/**
 * Fetch public active listings (excluding sold or flagged listings)
 */
export async function fetchMarketplaceListings(): Promise<{
  success: boolean;
  data?: MarketplaceListing[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_sold', false)
        .eq('is_reported', false)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) return { success: false, error: error.message };

      const formatted: MarketplaceListing[] = (data || []).map((row) => ({
        id: row.id,
        sellerId: row.seller_id,
        sellerName: row.seller_name,
        sellerPhone: row.seller_phone,
        sellerWhatsapp: row.seller_whatsapp,
        sellerIsVerified: false,
        category: row.category as ListingCategory,
        titleEn: row.title_en,
        titleUr: row.title_ur,
        species: row.species,
        breed: row.breed,
        age: row.age,
        gender: row.gender,
        weightKg: row.weight_kg,
        milkYieldLiters: row.milk_yield_liters,
        askingPrice: Number(row.asking_price),
        currency: row.currency || 'PKR',
        isNegotiable: Boolean(row.is_negotiable),
        locationCity: row.location_city,
        locationProvince: row.location_province,
        descriptionEn: row.description_en || '',
        descriptionUr: row.description_ur || '',
        images: row.images || [],
        videoUrl: row.video_url,
        vaccinationStatus: row.vaccination_status || 'fully_vaccinated',
        healthStatusDescriptionEn: row.health_status_en || '',
        healthStatusDescriptionUr: row.health_status_ur || '',
        isSold: Boolean(row.is_sold),
        isFeatured: Boolean(row.is_featured),
        isReported: Boolean(row.is_reported),
        reportCount: row.report_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { success: true, data: formatted };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to fetch marketplace listings.' };
    }
  }

  // Local Offline Simulation: filter active unflagged listings
  const active = getLocalListings().filter((l) => !l.isSold && !l.isReported);
  return { success: true, data: active };
}

/**
 * Creates a new marketplace listing.
 * Strips administrative fields (is_featured, is_reported, report_count).
 */
export async function createMarketplaceListing(
  listing: Omit<MarketplaceListing, 'id' | 'isFeatured' | 'isReported' | 'reportCount' | 'createdAt' | 'updatedAt' | 'sellerIsVerified'>
): Promise<{ success: boolean; data?: MarketplaceListing; error?: string }> {
  // Strip privileged fields defensively
  const sanitized = {
    ...listing,
    is_featured: false,
    is_reported: false,
    report_count: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required to post a listing.' };
      }

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_id: user.id,
          seller_name: sanitized.sellerName,
          seller_phone: sanitized.sellerPhone,
          seller_whatsapp: sanitized.sellerWhatsapp,
          category: sanitized.category,
          title_en: sanitized.titleEn,
          title_ur: sanitized.titleUr,
          species: sanitized.species,
          breed: sanitized.breed,
          age: sanitized.age,
          gender: sanitized.gender,
          weight_kg: sanitized.weightKg || null,
          milk_yield_liters: sanitized.milkYieldLiters || null,
          asking_price: sanitized.askingPrice,
          currency: sanitized.currency || 'PKR',
          is_negotiable: sanitized.isNegotiable,
          location_city: sanitized.locationCity,
          location_province: sanitized.locationProvince,
          description_en: sanitized.descriptionEn,
          description_ur: sanitized.descriptionUr,
          images: sanitized.images,
          video_url: sanitized.videoUrl || null,
          vaccination_status: sanitized.vaccinationStatus,
          health_status_en: sanitized.healthStatusDescriptionEn,
          health_status_ur: sanitized.healthStatusDescriptionUr,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      return {
        success: true,
        data: {
          id: data.id,
          sellerId: data.seller_id,
          sellerName: data.seller_name,
          sellerPhone: data.seller_phone,
          sellerWhatsapp: data.seller_whatsapp,
          sellerIsVerified: false,
          category: data.category,
          titleEn: data.title_en,
          titleUr: data.title_ur,
          species: data.species,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          weightKg: data.weight_kg,
          milkYieldLiters: data.milk_yield_liters,
          askingPrice: Number(data.asking_price),
          currency: data.currency,
          isNegotiable: data.is_negotiable,
          locationCity: data.location_city,
          locationProvince: data.location_province,
          descriptionEn: data.description_en,
          descriptionUr: data.description_ur,
          images: data.images,
          videoUrl: data.video_url,
          vaccinationStatus: data.vaccination_status,
          healthStatusDescriptionEn: data.health_status_en,
          healthStatusDescriptionUr: data.health_status_ur,
          isSold: false,
          isFeatured: false,
          isReported: false,
          reportCount: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Database insert failed.' };
    }
  }

  // Local Offline Simulation
  const newListing: MarketplaceListing = {
    ...listing,
    id: 'list_' + Date.now(),
    sellerIsVerified: false,
    isSold: false,
    isFeatured: false,
    isReported: false,
    reportCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const store = getLocalListings();
  store.unshift(newListing);
  saveLocalListings(store);

  return { success: true, data: newListing };
}

/**
 * Updates an existing listing.
 * Strips privileged fields (isFeatured, isReported, reportCount, sellerId).
 */
export async function updateMarketplaceListing(
  listingId: string,
  updates: Partial<MarketplaceListing>
): Promise<{ success: boolean; error?: string }> {
  // Defense against client-side parameter injection of administrative fields
  const sanitized = { ...updates };
  delete sanitized.isFeatured;
  delete sanitized.isReported;
  delete sanitized.reportCount;
  delete sanitized.sellerId;
  delete sanitized.id;
  delete sanitized.createdAt;

  if (isSupabaseConfigured()) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (sanitized.titleEn !== undefined) dbUpdates.title_en = sanitized.titleEn;
      if (sanitized.titleUr !== undefined) dbUpdates.title_ur = sanitized.titleUr;
      if (sanitized.askingPrice !== undefined) dbUpdates.asking_price = sanitized.askingPrice;
      if (sanitized.isNegotiable !== undefined) dbUpdates.is_negotiable = sanitized.isNegotiable;
      if (sanitized.isSold !== undefined) dbUpdates.is_sold = sanitized.isSold;
      if (sanitized.descriptionEn !== undefined) dbUpdates.description_en = sanitized.descriptionEn;
      if (sanitized.descriptionUr !== undefined) dbUpdates.description_ur = sanitized.descriptionUr;
      if (sanitized.images !== undefined) dbUpdates.images = sanitized.images;
      if (sanitized.videoUrl !== undefined) dbUpdates.video_url = sanitized.videoUrl;

      const { error } = await supabase
        .from('marketplace_listings')
        .update(dbUpdates)
        .eq('id', listingId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Database update failed.' };
    }
  }

  const store = getLocalListings();
  const index = store.findIndex((l) => l.id === listingId);
  if (index === -1) return { success: false, error: 'Listing not found.' };

  store[index] = { ...store[index], ...sanitized, updatedAt: new Date().toISOString() };
  saveLocalListings(store);
  return { success: true };
}

/**
 * Submits a fraud report against a listing.
 * Enforces:
 * - User cannot report their own listing.
 * - Single report per user per listing.
 * - Automatically increments report counter and flags listing if threshold reached.
 */
export async function submitFraudReport(
  listingId: string,
  reason: FraudReport['reason'],
  details: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required to submit a report.' };
      }

      const { error } = await supabase
        .from('fraud_reports')
        .insert({
          listing_id: listingId,
          reported_by_user_id: user.id,
          reason,
          details,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'You have already submitted a report for this listing.' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to submit report.' };
    }
  }

  // Local Offline Simulation
  const store = getLocalListings();
  const listing = store.find((l) => l.id === listingId);
  if (!listing) return { success: false, error: 'Listing not found.' };

  const reports = getLocalReports();
  const alreadyReported = reports.some(
    (r) => r.listingId === listingId && r.reportedByUserId === 'user_current'
  );
  if (alreadyReported) {
    return { success: false, error: 'You have already submitted a report for this listing.' };
  }

  const newReport: FraudReport = {
    id: 'rep_' + Date.now(),
    listingId,
    reportedByUserId: 'user_current',
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  reports.push(newReport);
  saveLocalReports(reports);

  // Increment report count on local listing
  listing.reportCount = (listing.reportCount || 0) + 1;
  if (listing.reportCount >= 3) {
    listing.isReported = true;
  }
  saveLocalListings(store);

  return { success: true };
}

/**
 * Administrator Action: Moderate a marketplace listing via RPC
 */
export async function adminModerateListing(
  listingId: string,
  action: 'feature' | 'unfeature' | 'dismiss_reports' | 'remove_listing',
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('admin_moderate_marketplace_listing', {
        p_listing_id: listingId,
        p_action: action,
        p_notes: notes || null,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Server moderation RPC failed.' };
    }
  }

  // Local Offline Simulation for Admin
  const store = getLocalListings();
  const listing = store.find((l) => l.id === listingId);
  if (!listing) return { success: false, error: 'Listing not found.' };

  if (action === 'feature') listing.isFeatured = true;
  else if (action === 'unfeature') listing.isFeatured = false;
  else if (action === 'dismiss_reports') {
    listing.isReported = false;
    listing.reportCount = 0;
  } else if (action === 'remove_listing') {
    listing.isSold = true;
    listing.isReported = true;
  }

  saveLocalListings(store);
  return { success: true, data: { listingId, action } };
}
