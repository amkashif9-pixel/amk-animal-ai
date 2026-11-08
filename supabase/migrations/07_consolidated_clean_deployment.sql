-- ============================================================================
-- AMK ANIMAL AI - CONSOLIDATED CLEAN DEPLOYMENT SCRIPT
-- Migration: 07_consolidated_clean_deployment.sql
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   Complete, idempotent, single-script deployment for Supabase Free Tier.
--   Encompasses all 18 core tables + 4 extended modules (meat yield, disease
--   assessments, and atomic AI quotas), complete server-side authorization,
--   tamper-proof integrity triggers, repeatable RLS policies, column-level
--   grants, storage bucket configurations, and seed calibration benchmarks.
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: COMPLETE DATABASE SCHEMA (ALL 23 DOMAIN TABLES)
-- ============================================================================

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'pet_owner', 'veterinarian', 'trader', 'admin')),
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'farmer_basic', 'commercial_pro')),
    farm_name TEXT,
    city TEXT,
    province TEXT,
    country TEXT DEFAULT 'Pakistan',
    ai_scans_monthly_limit INT DEFAULT 10,
    ai_scans_used_this_month INT DEFAULT 0,
    preferred_language TEXT DEFAULT 'ur' CHECK (preferred_language IN ('en', 'ur')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANIMAL SPECIES
CREATE TABLE IF NOT EXISTS public.animal_species (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('livestock', 'poultry', 'pets')),
    scientific_name TEXT,
    icon TEXT,
    description_en TEXT,
    description_ur TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ANIMAL BREEDS
CREATE TABLE IF NOT EXISTS public.animal_breeds (
    id TEXT PRIMARY KEY,
    species_id TEXT NOT NULL REFERENCES public.animal_species(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    origin_en TEXT,
    origin_ur TEXT,
    scientific_name TEXT,
    physical_characteristics_en TEXT,
    physical_characteristics_ur TEXT,
    average_lifespan TEXT,
    typical_weight_range TEXT,
    male_female_differences_en TEXT,
    male_female_differences_ur TEXT,
    feeding_requirements_en TEXT,
    feeding_requirements_ur TEXT,
    housing_environment_en TEXT,
    housing_environment_ur TEXT,
    reproduction_info_en TEXT,
    reproduction_info_ur TEXT,
    care_maintenance_en TEXT,
    care_maintenance_ur TEXT,
    vaccination_info_en TEXT,
    vaccination_info_ur TEXT,
    economic_uses_en TEXT,
    economic_uses_ur TEXT,
    special_care_en TEXT,
    special_care_ur TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANIMALS (User Herd / Pet Records)
CREATE TABLE IF NOT EXISTS public.animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tag_number TEXT,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'castrated')),
    dob_or_age TEXT,
    purchase_price NUMERIC(12,2),
    current_estimated_value NUMERIC(12,2),
    feeding_notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANIMAL IMAGES
CREATE TABLE IF NOT EXISTS public.animal_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ANIMAL ANALYSIS (AI Vision Scans)
CREATE TABLE IF NOT EXISTS public.animal_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    image_url TEXT,
    detected_species TEXT,
    detected_breed TEXT,
    confidence_score NUMERIC(5,2),
    confidence_label TEXT,
    detected_gender TEXT,
    estimated_age TEXT,
    body_condition_score TEXT,
    estimated_weight_range TEXT,
    uncertainty_explanation_en TEXT,
    uncertainty_explanation_ur TEXT,
    full_ai_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANIMAL HEALTH RECORDS
CREATE TABLE IF NOT EXISTS public.animal_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    condition_title TEXT NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    attending_vet_name TEXT,
    treatment_given TEXT,
    rectal_temperature_f NUMERIC(4,1),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DISEASES
CREATE TABLE IF NOT EXISTS public.diseases (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    scientific_name TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('mild', 'moderate', 'severe', 'emergency')),
    symptoms_en TEXT[],
    symptoms_ur TEXT[],
    possible_causes_en TEXT[],
    possible_causes_ur TEXT[],
    immediate_care_en TEXT[],
    immediate_care_ur TEXT[],
    prevention_en TEXT[],
    prevention_ur TEXT[],
    withdrawal_warning_en TEXT,
    withdrawal_warning_ur TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VETERINARY GUIDANCE
CREATE TABLE IF NOT EXISTS public.veterinary_guidance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id TEXT REFERENCES public.diseases(id) ON DELETE CASCADE,
    recommended_exam_en TEXT,
    recommended_exam_ur TEXT,
    questions_for_vet_en TEXT[],
    questions_for_vet_ur TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VACCINATIONS
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    date_administered DATE NOT NULL,
    next_due_date DATE NOT NULL,
    administered_by TEXT,
    batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FEEDING PLANS
CREATE TABLE IF NOT EXISTS public.feeding_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    species TEXT NOT NULL,
    weight_kg NUMERIC(6,2),
    daily_dry_matter_kg NUMERIC(5,2),
    green_fodder_kg NUMERIC(5,2),
    wheat_straw_kg NUMERIC(5,2),
    concentrate_wanda_kg NUMERIC(5,2),
    water_liters TEXT,
    crude_protein_pct TEXT,
    local_fodder_suggestions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MARKET PRICES (Historical & District Mandi Benchmarks)
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    mandi_location TEXT NOT NULL,
    district TEXT NOT NULL,
    province TEXT NOT NULL,
    avg_price_per_kg_live NUMERIC(10,2),
    dairy_yield_liter_bonus NUMERIC(10,2),
    min_price_sample NUMERIC(12,2),
    avg_price_sample NUMERIC(12,2),
    max_price_sample NUMERIC(12,2),
    benchmark_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    seller_phone TEXT NOT NULL,
    seller_whatsapp TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cattle', 'buffalo', 'goats', 'sheep', 'poultry', 'horses', 'donkeys', 'pets', 'other')),
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL,
    weight_kg NUMERIC(6,2),
    milk_yield_liters NUMERIC(5,2),
    asking_price NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'PKR',
    is_negotiable BOOLEAN DEFAULT TRUE,
    location_city TEXT NOT NULL,
    location_province TEXT NOT NULL,
    description_en TEXT,
    description_ur TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    vaccination_status TEXT DEFAULT 'fully_vaccinated',
    health_status_en TEXT,
    health_status_ur TEXT,
    is_sold BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_reported BOOLEAN DEFAULT FALSE,
    report_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. VETERINARIANS
CREATE TABLE IF NOT EXISTS public.veterinarians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    degrees TEXT NOT NULL,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    clinic_name_en TEXT,
    clinic_name_ur TEXT,
    photo_url TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    province_state TEXT NOT NULL,
    district_city TEXT NOT NULL,
    full_address_en TEXT,
    full_address_ur TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    experience_years INT DEFAULT 1,
    services_en TEXT[],
    services_ur TEXT[],
    specialties TEXT[],
    rating NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    manual_verification_doc_ref TEXT,
    verification_type TEXT DEFAULT 'unverified' CHECK (verification_type IN ('unverified', 'manual_physical_inspection', 'pvmc_registry_audit', 'revoked')),
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONSULTATIONS
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    consultation_date TIMESTAMPTZ NOT NULL,
    consultation_method TEXT NOT NULL CHECK (consultation_method IN ('in_clinic', 'farm_visit', 'tele_consultation', 'emergency_24_7')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    symptom_notes TEXT,
    prescription_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_ur TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'farmer_basic', 'commercial_pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. FRAUD REPORTS
CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    reported_by_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('fake_price', 'stolen_photos', 'wrong_breed', 'sick_animal', 'fraud_seller', 'other')),
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'listing_removed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. MEAT YIELD CONFIGS (Scientific Carcass Calibration Benchmarks)
CREATE TABLE IF NOT EXISTS public.meat_yield_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species TEXT UNIQUE NOT NULL CHECK (species IN ('cow', 'buffalo', 'goat', 'sheep', 'dumba')),
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    base_dressing_pct_low NUMERIC(5,2) NOT NULL,
    base_dressing_pct_likely NUMERIC(5,2) NOT NULL,
    base_dressing_pct_high NUMERIC(5,2) NOT NULL,
    base_boneless_yield_pct NUMERIC(5,2) NOT NULL,
    base_bone_pct NUMERIC(5,2) NOT NULL,
    base_fat_pct NUMERIC(5,2) NOT NULL,
    base_trim_waste_pct NUMERIC(5,2) NOT NULL,
    hide_skin_pct NUMERIC(5,2) NOT NULL,
    head_trotters_pct NUMERIC(5,2) NOT NULL,
    red_offal_pct NUMERIC(5,2) NOT NULL,
    green_offal_pct NUMERIC(5,2) NOT NULL,
    notes TEXT,
    is_official_benchmark BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. USER MEAT YIELD ESTIMATES
CREATE TABLE IF NOT EXISTS public.meat_yield_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    live_weight_kg NUMERIC(8,2) NOT NULL,
    gender TEXT,
    age_dentition TEXT,
    bcs INT,
    physical_build TEXT,
    dressing_method TEXT,
    predicted_carcass_weight_kg NUMERIC(8,2) NOT NULL,
    predicted_bone_in_meat_kg NUMERIC(8,2) NOT NULL,
    predicted_boneless_meat_kg NUMERIC(8,2) NOT NULL,
    predicted_bone_weight_kg NUMERIC(8,2),
    predicted_fat_weight_kg NUMERIC(8,2),
    predicted_dressing_pct NUMERIC(5,2) NOT NULL,
    low_carcass_kg NUMERIC(8,2),
    high_carcass_kg NUMERIC(8,2),
    full_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. SLAUGHTER ACTUAL CALIBRATION RECORDS
CREATE TABLE IF NOT EXISTS public.slaughter_actual_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    estimate_id UUID REFERENCES public.meat_yield_estimates(id) ON DELETE SET NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    live_weight_kg NUMERIC(8,2) NOT NULL,
    actual_carcass_weight_kg NUMERIC(8,2) NOT NULL,
    actual_bone_in_meat_kg NUMERIC(8,2),
    actual_boneless_meat_kg NUMERIC(8,2),
    actual_bone_kg NUMERIC(8,2),
    actual_fat_kg NUMERIC(8,2),
    actual_dressing_pct NUMERIC(5,2) NOT NULL,
    predicted_dressing_pct NUMERIC(5,2),
    variance_pct NUMERIC(5,2),
    slaughterhouse_city TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. DISEASE ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.disease_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    species TEXT NOT NULL,
    breed TEXT,
    animal_name TEXT,
    reported_symptoms TEXT[] DEFAULT '{}',
    custom_description TEXT,
    rectal_temperature_f NUMERIC(4,1),
    duration_days INT DEFAULT 1,
    detected_emergency BOOLEAN DEFAULT FALSE,
    emergency_types TEXT[] DEFAULT '{}',
    overall_risk_level TEXT NOT NULL CHECK (overall_risk_level IN ('mild', 'moderate', 'severe', 'emergency')),
    primary_condition_id TEXT,
    primary_condition_name_en TEXT,
    primary_condition_name_ur TEXT,
    differential_condition_ids TEXT[] DEFAULT '{}',
    confidence_score NUMERIC(5,2) DEFAULT 75.0,
    confidence_label TEXT DEFAULT 'Medium',
    media_count INT DEFAULT 0,
    media_metadata JSONB DEFAULT '[]',
    full_assessment_payload JSONB,
    vet_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_diagnosis TEXT,
    confirmed_by_vet_name TEXT,
    treatment_outcome TEXT DEFAULT 'pending' CHECK (treatment_outcome IN ('pending', 'recovered', 'improving', 'unchanged', 'deteriorated', 'referred_hospital')),
    follow_up_notes TEXT,
    follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. USER AI QUOTAS (Atomic Persistent Tracking)
CREATE TABLE IF NOT EXISTS public.user_ai_quotas (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    burst_count INT DEFAULT 0,
    burst_window_start TIMESTAMPTZ DEFAULT NOW(),
    daily_count INT DEFAULT 0,
    daily_window_start TIMESTAMPTZ DEFAULT NOW(),
    monthly_scans_used INT DEFAULT 0,
    monthly_scans_limit INT DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal ON public.animal_health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_animal ON public.vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_city ON public.marketplace_listings(location_city);
CREATE INDEX IF NOT EXISTS idx_veterinarians_city ON public.veterinarians(district_city);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_user_listing ON public.fraud_reports(reported_by_user_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_meat_yield_estimates_user ON public.meat_yield_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_slaughter_records_species ON public.slaughter_actual_records(species);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_user ON public.disease_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_risk ON public.disease_assessments(overall_risk_level);

-- ============================================================================
-- PART 3: SERVER-SIDE AUTHORIZATION & ADMIN FUNCTIONS
-- CRITICAL: Declared BEFORE any RLS policies or triggers reference them.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT (
        -- Trusted service_role token is administrative
        (NULLIF(current_setting('request.jwt.claim.role', true), '') = 'service_role')
        OR
        -- Authenticated user possessing active admin role in user_profiles
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        ))
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Secure Admin Bootstrap RPC
CREATE OR REPLACE FUNCTION public.initialize_admin_account(admin_email TEXT DEFAULT 'amkashif@amkanimal.ai')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    target_user_id UUID;
    result_data JSONB;
BEGIN
    IF LOWER(admin_email) <> 'amkashif@amkanimal.ai' THEN
        RAISE EXCEPTION 'Unauthorized: Only the official administrator account (%) can be bootstrapped via this RPC.', 'amkashif@amkanimal.ai';
    END IF;

    SELECT id INTO target_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(admin_email);

    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User account does not exist in auth.users yet. Please sign up first via Supabase Auth.'
        );
    END IF;

    INSERT INTO public.user_profiles (
        id, email, full_name, role, subscription_tier,
        ai_scans_monthly_limit, ai_scans_used_this_month, preferred_language
    )
    VALUES (
        target_user_id, admin_email, 'AMK Platform Admin', 'admin', 'commercial_pro',
        999999, 0, 'ur'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        subscription_tier = 'commercial_pro',
        ai_scans_monthly_limit = 999999,
        updated_at = NOW();

    result_data := jsonb_build_object(
        'success', true,
        'user_id', target_user_id,
        'email', admin_email,
        'role', 'admin',
        'tier', 'commercial_pro'
    );

    RETURN result_data;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.initialize_admin_account(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.initialize_admin_account(TEXT) TO authenticated, service_role;

-- Helper to update timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: TAMPER-PROOF INTEGRITY TRIGGERS & RPCs
-- ============================================================================

-- Profile Creation Trigger on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, email, full_name, role, subscription_tier,
        ai_scans_monthly_limit, ai_scans_used_this_month, preferred_language
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN LOWER(NEW.email) = 'amkashif@amkanimal.ai' THEN 'admin'
            ELSE 'farmer'
        END,
        CASE 
            WHEN LOWER(NEW.email) = 'amkashif@amkanimal.ai' THEN 'commercial_pro'
            ELSE 'free'
        END,
        CASE 
            WHEN LOWER(NEW.email) = 'amkashif@amkanimal.ai' THEN 999999
            ELSE 10
        END,
        0,
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ur')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Profile Role, Quota, and Identity Protection
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Role cannot be modified from % to % without administrative authorization.', OLD.role, NEW.role;
        END IF;
    END IF;

    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Subscription tier cannot be modified without administrative authorization.';
        END IF;
    END IF;

    IF NEW.ai_scans_monthly_limit IS DISTINCT FROM OLD.ai_scans_monthly_limit THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Monthly AI scan limit cannot be modified by clients.';
        END IF;
    END IF;

    IF NEW.email IS DISTINCT FROM OLD.email THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Security Restriction: Primary account email cannot be altered directly on profile.';
        END IF;
    END IF;

    IF NEW.ai_scans_used_this_month < OLD.ai_scans_used_this_month AND NOT public.is_admin() THEN
        IF current_setting('amk.internal_quota_update', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'Quota Tampering Blocked: AI scan usage counters cannot be reset by clients.';
        END IF;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Immutable Identity: User ID cannot be modified.';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Immutable Timestamp: Creation timestamp cannot be modified.';
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_role_integrity ON public.user_profiles;
CREATE TRIGGER trg_enforce_profile_role_integrity
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_role_integrity();

REVOKE EXECUTE ON FUNCTION public.enforce_profile_role_integrity() FROM public, anon;

-- Veterinarian Verification Protection Trigger
CREATE OR REPLACE FUNCTION public.enforce_veterinarian_verification_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
       (NEW.license_number IS DISTINCT FROM OLD.license_number) OR
       (NEW.rating IS DISTINCT FROM OLD.rating) OR
       (NEW.review_count IS DISTINCT FROM OLD.review_count) OR
       (NEW.user_id IS DISTINCT FROM OLD.user_id) OR
       (NEW.id IS DISTINCT FROM OLD.id) OR
       (NEW.manual_verification_doc_ref IS DISTINCT FROM OLD.manual_verification_doc_ref) OR
       (NEW.verification_type IS DISTINCT FROM OLD.verification_type) OR
       (NEW.verified_by IS DISTINCT FROM OLD.verified_by) OR
       (NEW.verified_at IS DISTINCT FROM OLD.verified_at) THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Only platform administrators can modify veterinarian verification status, licenses, ratings, or identity links.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_vet_verification_integrity ON public.veterinarians;
CREATE TRIGGER trg_enforce_vet_verification_integrity
BEFORE UPDATE ON public.veterinarians
FOR EACH ROW
EXECUTE FUNCTION public.enforce_veterinarian_verification_integrity();

REVOKE EXECUTE ON FUNCTION public.enforce_veterinarian_verification_integrity() FROM public, anon;

-- Admin Verify Veterinarian RPC (with document verification check)
CREATE OR REPLACE FUNCTION public.admin_verify_veterinarian(
    target_vet_id UUID,
    p_license_number TEXT,
    p_doc_ref TEXT,
    p_verification_type TEXT DEFAULT 'manual_physical_inspection',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    doc_exists BOOLEAN := FALSE;
    calling_admin UUID := auth.uid();
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only platform administrators can execute verification RPC.';
    END IF;

    IF p_license_number IS NULL OR TRIM(p_license_number) = '' THEN
        RAISE EXCEPTION 'Validation Failed: Valid RVMP/PVMC license number required.';
    END IF;

    IF p_doc_ref IS NULL OR TRIM(p_doc_ref) = '' THEN
        RAISE EXCEPTION 'Validation Failed: Document reference parameter cannot be empty.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'vet-documents'
          AND (name = p_doc_ref OR name LIKE '%' || p_doc_ref || '%')
    ) INTO doc_exists;

    IF NOT doc_exists THEN
        RAISE EXCEPTION 'Document Evidence Missing: The referenced verification document (%) does not exist in the private vet-documents storage bucket.', p_doc_ref;
    END IF;

    UPDATE public.veterinarians
    SET
        is_verified = TRUE,
        license_number = p_license_number,
        manual_verification_doc_ref = p_doc_ref,
        verification_type = p_verification_type,
        verified_by = calling_admin,
        verified_at = NOW(),
        verification_notes = p_notes
    WHERE id = target_vet_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veterinarian profile not found for id %', target_vet_id;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'vet_id', target_vet_id,
        'is_verified', TRUE,
        'verified_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_verify_veterinarian FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_verify_veterinarian TO authenticated, service_role;

-- Admin Revoke Veterinarian RPC
CREATE OR REPLACE FUNCTION public.admin_revoke_veterinarian(
    target_vet_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only platform administrators can execute revocation RPC.';
    END IF;

    UPDATE public.veterinarians
    SET
        is_verified = FALSE,
        verification_type = 'revoked',
        verification_notes = COALESCE(verification_notes || ' | REVOKED: ' || p_reason, 'REVOKED: ' || p_reason),
        verified_at = NOW()
    WHERE id = target_vet_id;

    RETURN jsonb_build_object('success', TRUE, 'vet_id', target_vet_id, 'is_verified', FALSE);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_revoke_veterinarian FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_veterinarian TO authenticated, service_role;

-- Marketplace Listing Integrity Trigger
CREATE OR REPLACE FUNCTION public.enforce_marketplace_listing_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (NEW.is_featured IS DISTINCT FROM OLD.is_featured) OR
       (NEW.is_reported IS DISTINCT FROM OLD.is_reported) OR
       (NEW.report_count IS DISTINCT FROM OLD.report_count) OR
       (NEW.seller_id IS DISTINCT FROM OLD.seller_id) OR
       (NEW.id IS DISTINCT FROM OLD.id) OR
       (NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Sellers cannot modify administrative listing properties (featured status, fraud counters, or seller ownership).';
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_marketplace_listing_integrity ON public.marketplace_listings;
CREATE TRIGGER trg_enforce_marketplace_listing_integrity
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_marketplace_listing_integrity();

REVOKE EXECUTE ON FUNCTION public.enforce_marketplace_listing_integrity() FROM public, anon;

-- Fraud Report Submission Trigger
CREATE OR REPLACE FUNCTION public.handle_fraud_report_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    target_seller UUID;
BEGIN
    SELECT seller_id INTO target_seller FROM public.marketplace_listings WHERE id = NEW.listing_id;
    IF target_seller = NEW.reported_by_user_id THEN
        RAISE EXCEPTION 'Conflict: Sellers cannot report their own marketplace listings.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.fraud_reports
        WHERE listing_id = NEW.listing_id AND reported_by_user_id = NEW.reported_by_user_id
    ) THEN
        RAISE EXCEPTION 'Duplicate: You have already submitted a fraud report for this listing.';
    END IF;

    UPDATE public.marketplace_listings
    SET
        report_count = report_count + 1,
        is_reported = TRUE,
        updated_at = NOW()
    WHERE id = NEW.listing_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_fraud_report ON public.fraud_reports;
CREATE TRIGGER trg_handle_fraud_report
BEFORE INSERT ON public.fraud_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_fraud_report_submission();

-- Admin Marketplace Listing Moderation RPC
CREATE OR REPLACE FUNCTION public.admin_moderate_marketplace_listing(
    target_listing_id UUID,
    p_action TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can moderate marketplace listings.';
    END IF;

    IF p_action = 'feature' THEN
        UPDATE public.marketplace_listings SET is_featured = TRUE, updated_at = NOW() WHERE id = target_listing_id;
    ELSIF p_action = 'unfeature' THEN
        UPDATE public.marketplace_listings SET is_featured = FALSE, updated_at = NOW() WHERE id = target_listing_id;
    ELSIF p_action = 'dismiss_fraud' THEN
        UPDATE public.marketplace_listings SET is_reported = FALSE, report_count = 0, updated_at = NOW() WHERE id = target_listing_id;
        UPDATE public.fraud_reports SET status = 'dismissed' WHERE listing_id = target_listing_id;
    ELSIF p_action = 'remove_listing' THEN
        UPDATE public.marketplace_listings SET is_sold = TRUE, is_featured = FALSE, updated_at = NOW() WHERE id = target_listing_id;
        UPDATE public.fraud_reports SET status = 'listing_removed' WHERE listing_id = target_listing_id;
    ELSE
        RAISE EXCEPTION 'Invalid moderation action: %', p_action;
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'action', p_action, 'listing_id', target_listing_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_marketplace_listing FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_marketplace_listing TO authenticated, service_role;

-- Consultation Integrity Trigger
CREATE OR REPLACE FUNCTION public.enforce_consultation_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    caller_is_vet BOOLEAN := FALSE;
    caller_is_owner BOOLEAN := FALSE;
BEGIN
    SELECT (auth.uid() = user_profiles.id) INTO caller_is_owner
    FROM public.user_profiles
    WHERE user_profiles.id = OLD.user_id;

    SELECT EXISTS (
        SELECT 1 FROM public.veterinarians
        WHERE veterinarians.id = OLD.veterinarian_id AND veterinarians.user_id = auth.uid()
    ) INTO caller_is_vet;

    IF public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF caller_is_owner AND NOT caller_is_vet THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF NEW.status <> 'cancelled' THEN
                RAISE EXCEPTION 'Customers may only update consultation status to cancelled.';
            END IF;
        END IF;

        IF NEW.prescription_notes IS DISTINCT FROM OLD.prescription_notes THEN
            RAISE EXCEPTION 'Only the assigned licensed veterinarian can write or modify medical prescriptions.';
        END IF;
    END IF;

    IF caller_is_vet THEN
        IF NEW.user_id IS DISTINCT FROM OLD.user_id OR
           NEW.veterinarian_id IS DISTINCT FROM OLD.veterinarian_id OR
           NEW.animal_id IS DISTINCT FROM OLD.animal_id THEN
            RAISE EXCEPTION 'Assigned appointments cannot be reassigned across patient IDs.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_consultation_integrity ON public.consultations;
CREATE TRIGGER trg_enforce_consultation_integrity
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_consultation_integrity();

REVOKE EXECUTE ON FUNCTION public.enforce_consultation_integrity() FROM public, anon;

-- AI Quota Management RPC (Atomic & Safe)
CREATE OR REPLACE FUNCTION public.consume_ai_scan_quota(
    p_user_id UUID,
    p_burst_limit INT DEFAULT 10,
    p_burst_window_sec INT DEFAULT 60,
    p_daily_limit INT DEFAULT 50,
    p_daily_window_sec INT DEFAULT 86400
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    q_row public.user_ai_quotas%ROWTYPE;
    u_role TEXT;
    u_tier TEXT;
    now_ts TIMESTAMPTZ := NOW();
    retry_secs INT := 0;
BEGIN
    SELECT role, subscription_tier INTO u_role, u_tier
    FROM public.user_profiles WHERE id = p_user_id;

    IF u_role = 'admin' OR u_tier = 'commercial_pro' THEN
        RETURN jsonb_build_object('allowed', TRUE, 'bypass', TRUE, 'reason', 'unlimited_tier');
    END IF;

    INSERT INTO public.user_ai_quotas (user_id, burst_count, burst_window_start, daily_count, daily_window_start, monthly_scans_used)
    VALUES (p_user_id, 0, now_ts, 0, now_ts, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO q_row
    FROM public.user_ai_quotas
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF EXTRACT(EPOCH FROM (now_ts - q_row.burst_window_start)) >= p_burst_window_sec THEN
        q_row.burst_count := 0;
        q_row.burst_window_start := now_ts;
    END IF;

    IF EXTRACT(EPOCH FROM (now_ts - q_row.daily_window_start)) >= p_daily_window_sec THEN
        q_row.daily_count := 0;
        q_row.daily_window_start := now_ts;
    END IF;

    IF q_row.burst_count >= p_burst_limit THEN
        retry_secs := CEIL(p_burst_window_sec - EXTRACT(EPOCH FROM (now_ts - q_row.burst_window_start)))::INT;
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'error_code', 'BURST_LIMIT_EXCEEDED',
            'retry_after', GREATEST(1, retry_secs),
            'message', 'Too many requests. Please wait before retrying.'
        );
    END IF;

    IF q_row.daily_count >= p_daily_limit THEN
        retry_secs := CEIL(p_daily_window_sec - EXTRACT(EPOCH FROM (now_ts - q_row.daily_window_start)))::INT;
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'error_code', 'DAILY_LIMIT_EXCEEDED',
            'retry_after', GREATEST(1, retry_secs),
            'message', 'Daily quota reached. Please try again tomorrow.'
        );
    END IF;

    UPDATE public.user_ai_quotas
    SET
        burst_count = q_row.burst_count + 1,
        burst_window_start = q_row.burst_window_start,
        daily_count = q_row.daily_count + 1,
        daily_window_start = q_row.daily_window_start,
        monthly_scans_used = q_row.monthly_scans_used + 1,
        updated_at = now_ts
    WHERE user_id = p_user_id;

    PERFORM set_config('amk.internal_quota_update', 'true', true);
    UPDATE public.user_profiles
    SET ai_scans_used_this_month = ai_scans_used_this_month + 1
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'allowed', TRUE,
        'burst_remaining', p_burst_limit - (q_row.burst_count + 1),
        'daily_remaining', p_daily_limit - (q_row.daily_count + 1)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ai_scan_quota FROM public, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_scan_quota TO authenticated, service_role;

-- Admin Reset Quota RPC
CREATE OR REPLACE FUNCTION public.admin_reset_user_quota(p_target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can reset user quotas.';
    END IF;

    UPDATE public.user_ai_quotas
    SET
        burst_count = 0,
        burst_window_start = NOW(),
        daily_count = 0,
        daily_window_start = NOW(),
        monthly_scans_used = 0,
        updated_at = NOW()
    WHERE user_id = p_target_user_id;

    PERFORM set_config('amk.internal_quota_update', 'true', true);
    UPDATE public.user_profiles
    SET ai_scans_used_this_month = 0
    WHERE id = p_target_user_id;

    RETURN jsonb_build_object('success', TRUE, 'user_id', p_target_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_reset_user_quota FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_quota TO authenticated, service_role;

-- Storage Helper: Check Medical Record Access
CREATE OR REPLACE FUNCTION public.can_access_medical_record(file_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    owner_id_str TEXT;
    owner_uuid UUID;
    caller_uuid UUID := auth.uid();
BEGIN
    IF caller_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    owner_id_str := (storage.foldername(file_path))[1];
    BEGIN
        owner_uuid := owner_id_str::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END IF;

    IF owner_uuid = caller_uuid THEN
        RETURN TRUE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.consultations c
        JOIN public.veterinarians v ON v.id = c.veterinarian_id
        WHERE c.user_id = owner_uuid
          AND v.user_id = caller_uuid
          AND c.status IN ('pending', 'confirmed', 'completed')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_medical_record FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_access_medical_record TO authenticated, service_role;

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY ENABLEMENT
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinary_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meat_yield_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meat_yield_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slaughter_actual_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_quotas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: REPEATABLE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Public Read-Only Catalogs
DROP POLICY IF EXISTS "Public species are viewable by everyone" ON public.animal_species;
CREATE POLICY "Public species are viewable by everyone" ON public.animal_species FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public breeds are viewable by everyone" ON public.animal_breeds;
CREATE POLICY "Public breeds are viewable by everyone" ON public.animal_breeds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public diseases are viewable by everyone" ON public.diseases;
CREATE POLICY "Public diseases are viewable by everyone" ON public.diseases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public vet guidance is viewable by everyone" ON public.veterinary_guidance;
CREATE POLICY "Public vet guidance is viewable by everyone" ON public.veterinary_guidance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public mandi prices are viewable by everyone" ON public.market_prices;
CREATE POLICY "Public mandi prices are viewable by everyone" ON public.market_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public vets are viewable by everyone" ON public.veterinarians;
CREATE POLICY "Public vets are viewable by everyone" ON public.veterinarians FOR SELECT USING (true);

-- User Profiles
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.user_profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Column Grants on user_profiles
REVOKE UPDATE ON public.user_profiles FROM authenticated, anon, public;
GRANT UPDATE (full_name, phone, farm_name, city, province, country, preferred_language) ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT, INSERT ON public.user_profiles TO authenticated;

-- Animals & Herds
DROP POLICY IF EXISTS "Users can manage own animals" ON public.animals;
CREATE POLICY "Users can manage own animals" ON public.animals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Animal Images
DROP POLICY IF EXISTS "Users can manage own animal images" ON public.animal_images;
CREATE POLICY "Users can manage own animal images" ON public.animal_images FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_images.animal_id AND animals.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_images.animal_id AND animals.user_id = auth.uid()));

-- Animal Analysis
DROP POLICY IF EXISTS "Users can manage own animal analyses" ON public.animal_analysis;
CREATE POLICY "Users can manage own animal analyses" ON public.animal_analysis FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Animal Health Records
DROP POLICY IF EXISTS "Users can manage own animal health records" ON public.animal_health_records;
CREATE POLICY "Users can manage own animal health records" ON public.animal_health_records FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_health_records.animal_id AND animals.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_health_records.animal_id AND animals.user_id = auth.uid()));

-- Vaccinations
DROP POLICY IF EXISTS "Users can manage own vaccinations" ON public.vaccinations;
CREATE POLICY "Users can manage own vaccinations" ON public.vaccinations FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = vaccinations.animal_id AND animals.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.animals WHERE animals.id = vaccinations.animal_id AND animals.user_id = auth.uid()));

-- Feeding Plans
DROP POLICY IF EXISTS "Users can manage own feeding plans" ON public.feeding_plans;
CREATE POLICY "Users can manage own feeding plans" ON public.feeding_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Marketplace Listings
DROP POLICY IF EXISTS "Public can view active marketplace listings" ON public.marketplace_listings;
CREATE POLICY "Public can view active marketplace listings" ON public.marketplace_listings FOR SELECT USING (is_sold = false);

DROP POLICY IF EXISTS "Sellers can manage own listings" ON public.marketplace_listings;
CREATE POLICY "Sellers can manage own listings" ON public.marketplace_listings FOR ALL TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

REVOKE UPDATE ON public.marketplace_listings FROM authenticated, anon, public;
GRANT UPDATE (category, title_en, title_ur, species, breed, age, gender, weight_kg, milk_yield_liters, asking_price, currency, is_negotiable, location_city, location_province, description_en, description_ur, images, video_url, vaccination_status, health_status_en, health_status_ur, is_sold, seller_name, seller_phone, seller_whatsapp) ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
GRANT SELECT, INSERT, DELETE ON public.marketplace_listings TO authenticated;
GRANT SELECT ON public.marketplace_listings TO anon;

-- Veterinarians Directory
DROP POLICY IF EXISTS "Veterinarians can update their own directory listing" ON public.veterinarians;
DROP POLICY IF EXISTS "Veterinarians can update own public profile fields" ON public.veterinarians;
CREATE POLICY "Veterinarians can update own public profile fields" ON public.veterinarians FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can verify veterinarians" ON public.veterinarians;
DROP POLICY IF EXISTS "Admins have full access on veterinarians" ON public.veterinarians;
CREATE POLICY "Admins have full access on veterinarians" ON public.veterinarians FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE UPDATE ON public.veterinarians FROM authenticated, anon, public;
GRANT UPDATE (name_en, name_ur, degrees, clinic_name_en, clinic_name_ur, photo_url, phone, whatsapp, email, province_state, district_city, full_address_en, full_address_ur, latitude, longitude, experience_years, services_en, services_ur, specialties) ON public.veterinarians TO authenticated;
GRANT ALL ON public.veterinarians TO service_role;
GRANT SELECT, INSERT ON public.veterinarians TO authenticated;
GRANT SELECT ON public.veterinarians TO anon;

-- Consultations
DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
CREATE POLICY "Users can view own consultations" ON public.consultations FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id) OR public.is_admin());

DROP POLICY IF EXISTS "Users can book consultations" ON public.consultations;
CREATE POLICY "Users can book consultations" ON public.consultations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers can update own consultation status to cancelled" ON public.consultations;
CREATE POLICY "Customers can update own consultation status to cancelled" ON public.consultations FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Assigned veterinarians can update consultation records" ON public.consultations;
CREATE POLICY "Assigned veterinarians can update consultation records" ON public.consultations FOR UPDATE TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id));

-- Notifications
DROP POLICY IF EXISTS "Users can view and update own notifications" ON public.notifications;
CREATE POLICY "Users can view and update own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fraud Reports
DROP POLICY IF EXISTS "Authenticated users can submit fraud reports" ON public.fraud_reports;
CREATE POLICY "Authenticated users can submit fraud reports" ON public.fraud_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by_user_id);

DROP POLICY IF EXISTS "Users can view own submitted fraud reports" ON public.fraud_reports;
CREATE POLICY "Users can view own submitted fraud reports" ON public.fraud_reports FOR SELECT TO authenticated USING (auth.uid() = reported_by_user_id);

DROP POLICY IF EXISTS "Admins can view and manage all fraud reports" ON public.fraud_reports;
CREATE POLICY "Admins can view and manage all fraud reports" ON public.fraud_reports FOR ALL TO authenticated USING (public.is_admin());

-- Meat Yield Configs
DROP POLICY IF EXISTS "Public can view active yield configs" ON public.meat_yield_configs;
CREATE POLICY "Public can view active yield configs" ON public.meat_yield_configs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage yield configs" ON public.meat_yield_configs;
CREATE POLICY "Admins can manage yield configs" ON public.meat_yield_configs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- User Meat Yield Estimates
DROP POLICY IF EXISTS "Users can view own meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can view own meat yield estimates" ON public.meat_yield_estimates FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can insert meat yield estimates" ON public.meat_yield_estimates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can delete own meat yield estimates" ON public.meat_yield_estimates FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Slaughter Actual Records
DROP POLICY IF EXISTS "Users can view own slaughter actuals" ON public.slaughter_actual_records;
CREATE POLICY "Users can view own slaughter actuals" ON public.slaughter_actual_records FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can log slaughter actual records" ON public.slaughter_actual_records;
CREATE POLICY "Users can log slaughter actual records" ON public.slaughter_actual_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can manage all slaughter records" ON public.slaughter_actual_records;
CREATE POLICY "Admins can manage all slaughter records" ON public.slaughter_actual_records FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Disease Assessments
DROP POLICY IF EXISTS "Users can view own disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can view own disease assessments" ON public.disease_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can insert disease assessments" ON public.disease_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own disease assessment outcomes" ON public.disease_assessments;
CREATE POLICY "Users can update own disease assessment outcomes" ON public.disease_assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can delete own disease assessments" ON public.disease_assessments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- User AI Quotas
DROP POLICY IF EXISTS "Users can view own AI quota" ON public.user_ai_quotas;
CREATE POLICY "Users can view own AI quota" ON public.user_ai_quotas FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access on AI quotas" ON public.user_ai_quotas;
CREATE POLICY "Admins have full access on AI quotas" ON public.user_ai_quotas FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- PART 7: STORAGE BUCKETS & OBJECT RLS POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('animal-photos', 'animal-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('marketplace-media', 'marketplace-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
    ('medical-records', 'medical-records', false, 15728640, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('vet-documents', 'vet-documents', false, 15728640, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Animal Photos
DROP POLICY IF EXISTS "Users can upload own animal photos" ON storage.objects;
CREATE POLICY "Users can upload own animal photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage own animal photos" ON storage.objects;
CREATE POLICY "Users can manage own animal photos" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'animal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view animal photos" ON storage.objects;
CREATE POLICY "Public can view animal photos" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'animal-photos');

-- Storage RLS: Marketplace Media
DROP POLICY IF EXISTS "Users can upload marketplace media" ON storage.objects;
CREATE POLICY "Users can upload marketplace media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'marketplace-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view marketplace media" ON storage.objects;
CREATE POLICY "Public can view marketplace media" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'marketplace-media');

DROP POLICY IF EXISTS "Sellers can delete own marketplace media" ON storage.objects;
CREATE POLICY "Sellers can delete own marketplace media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'marketplace-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Private Medical Records
DROP POLICY IF EXISTS "Users can manage own medical documents" ON storage.objects;
CREATE POLICY "Users can manage own medical documents" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'medical-records' AND public.can_access_medical_record(name))
WITH CHECK (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: Private Vet Verification Documents
DROP POLICY IF EXISTS "Vets can upload own verification documents" ON storage.objects;
CREATE POLICY "Vets can upload own verification documents" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vet-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Vets and Admins can view verification documents" ON storage.objects;
CREATE POLICY "Vets and Admins can view verification documents" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vet-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

-- ============================================================================
-- PART 8: SCIENTIFIC SEED BENCHMARKS
-- ============================================================================
INSERT INTO public.meat_yield_configs (
    species, name_en, name_ur,
    base_dressing_pct_low, base_dressing_pct_likely, base_dressing_pct_high,
    base_boneless_yield_pct, base_bone_pct, base_fat_pct, base_trim_waste_pct,
    hide_skin_pct, head_trotters_pct, red_offal_pct, green_offal_pct,
    notes, is_official_benchmark
) VALUES
(
    'cow', 'Cow / Cattle (گائے)', 'گائے / بیل (Cattle)',
    50.0, 53.0, 56.5,
    70.5, 18.0, 10.0, 1.5,
    7.0, 5.0, 3.0, 4.0,
    'UVAS & PARC Sahiwal/Cholistani cattle meat dressing trial benchmarks.', true
),
(
    'buffalo', 'Buffalo (بھینس / کٹا)', 'بھینس / کٹا (Water Buffalo)',
    47.0, 50.0, 53.0,
    68.5, 20.0, 9.5, 2.0,
    10.5, 5.5, 3.2, 4.5,
    'Nili-Ravi & Kundi young male buffalo dressing trial data (PFI / UVAS).', true
),
(
    'goat', 'Goat / Buck (بکری / بکرا)', 'بکرا / بکری (Caprine)',
    46.0, 49.0, 52.5,
    68.0, 21.0, 8.5, 2.5,
    7.5, 5.5, 3.2, 4.0,
    'Beetal, Kamori, and Teddy goat carcass yield standards in Punjab/Sindh.', true
),
(
    'sheep', 'Sheep (بھیڑ / چھترا)', 'بھیڑ / چھترا (Thin-Tailed Sheep)',
    45.0, 48.0, 51.0,
    66.0, 20.0, 12.5, 1.5,
    8.0, 5.0, 3.0, 4.0,
    'Kajli, Lohi, and Salt Range thin-tailed sheep carcass yield benchmarks.', true
),
(
    'dumba', 'Fat-Tailed Sheep / Dumba (دنبہ)', 'دنبہ (Fat-Tailed Dumba)',
    48.0, 51.5, 55.0,
    64.0, 17.5, 16.5, 2.0,
    8.5, 4.5, 3.0, 4.0,
    'Balkhi and Shinwari fat-tailed sheep (Dumba) carcass and tail-fat benchmarks.', true
)
ON CONFLICT (species) DO NOTHING;
