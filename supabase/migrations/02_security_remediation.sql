-- ============================================================================
-- AMK ANIMAL AI - SECURITY REMEDIATION MIGRATION (02_security_remediation.sql)
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   1. Harden is_admin() SECURITY DEFINER function with safe search_path and JWT role check.
--   2. Provide public.initialize_admin_account() secure admin bootstrapping RPC.
--   3. Secure user profile signup handler and immutable role/tier/quota trigger.
--   4. Prevent veterinarian self-verification and unauthorized license tampering.
--   5. Prevent marketplace sellers from tampering with is_featured, report_count, or seller_id.
--   6. Enforce column-level permissions on user_profiles, veterinarians, and marketplace_listings.
--   7. Ensure safe repeatability with DROP POLICY IF EXISTS and DROP TRIGGER IF EXISTS.
--   8. Review and verify Supabase storage bucket security.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HARDEN SECURITY DEFINER FUNCTION WITH SAFE search_path
-- CRITICAL: Declared first so all downstream policies can execute safely
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

-- ============================================================================
-- 2. SECURE ADMIN INITIALIZATION RPC
-- Bootstraps the platform administrator safely without exposing service_role
-- ============================================================================
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
    -- Only allow specified official admin email to be bootstrapped via this function
    IF LOWER(admin_email) <> 'amkashif@amkanimal.ai' THEN
        RAISE EXCEPTION 'Unauthorized: Only the official administrator account (%) can be bootstrapped via this RPC.', 'amkashif@amkanimal.ai';
    END IF;

    -- Locate user ID from auth.users
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(admin_email);

    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User account does not exist in auth.users yet. Please sign up first via Supabase Auth.'
        );
    END IF;

    -- Upsert profile with admin privileges
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        role,
        subscription_tier,
        ai_scans_monthly_limit,
        ai_scans_used_this_month,
        preferred_language
    )
    VALUES (
        target_user_id,
        admin_email,
        'AMK Platform Admin',
        'admin',
        'commercial_pro',
        999999,
        0,
        'ur'
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

-- ============================================================================
-- 3. SECURE USER PROFILES RLS & PRIVILEGE GUARDS
-- ============================================================================

-- Separate SELECT/INSERT/UPDATE policies with idempotent drops
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Column-level permissions on user_profiles
REVOKE UPDATE ON public.user_profiles FROM authenticated, anon, public;
GRANT UPDATE (full_name, phone, farm_name, city, province, country, preferred_language) ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT, INSERT ON public.user_profiles TO authenticated;

-- Hardened Trigger to prevent self-role, quota, and subscription escalation
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent ordinary users from altering role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Role cannot be modified from % to % without administrative authorization.', OLD.role, NEW.role;
        END IF;
    END IF;

    -- Prevent ordinary users from modifying subscription tier
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Subscription tier cannot be modified without administrative authorization.';
        END IF;
    END IF;

    -- Prevent ordinary users from increasing monthly AI scan limit
    IF NEW.ai_scans_monthly_limit IS DISTINCT FROM OLD.ai_scans_monthly_limit THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Monthly AI scan limit cannot be modified by clients.';
        END IF;
    END IF;

    -- Prevent modifying primary account email directly on profile
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Security Restriction: Primary account email cannot be altered directly on profile.';
        END IF;
    END IF;

    -- Prevent client tampering with monthly used counter
    IF NEW.ai_scans_used_this_month < OLD.ai_scans_used_this_month AND NOT public.is_admin() THEN
        IF current_setting('amk.internal_quota_update', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'Quota Tampering Blocked: AI scan usage counters cannot be reset by clients.';
        END IF;
    END IF;

    -- Immutable user ID
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Immutable Identity: User ID cannot be modified.';
    END IF;

    -- Immutable creation timestamp
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Immutable Timestamp: Account creation timestamp cannot be modified.';
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

-- ============================================================================
-- 4. VETERINARIAN INTEGRITY & VERIFICATION PROTECTION
-- ============================================================================

-- Ensure audit columns exist on veterinarians
ALTER TABLE public.veterinarians
    ADD COLUMN IF NOT EXISTS manual_verification_doc_ref TEXT,
    ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'unverified' CHECK (verification_type IN ('unverified', 'manual_physical_inspection', 'pvmc_registry_audit', 'revoked')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Trigger to prevent unauthorized self-verification or license tampering
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

-- Column permissions on veterinarians
REVOKE UPDATE ON public.veterinarians FROM authenticated, anon, public;
GRANT UPDATE (name_en, name_ur, degrees, clinic_name_en, clinic_name_ur, photo_url, phone, whatsapp, email, province_state, district_city, full_address_en, full_address_ur, latitude, longitude, experience_years, services_en, services_ur, specialties) ON public.veterinarians TO authenticated;
GRANT ALL ON public.veterinarians TO service_role;
GRANT SELECT, INSERT ON public.veterinarians TO authenticated;
GRANT SELECT ON public.veterinarians TO anon;

-- ============================================================================
-- 5. MARKETPLACE LISTING INTEGRITY & SELLER PRIVILEGE SEPARATION
-- ============================================================================

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

-- Column permissions on marketplace_listings
REVOKE UPDATE ON public.marketplace_listings FROM authenticated, anon, public;
GRANT UPDATE (category, title_en, title_ur, species, breed, age, gender, weight_kg, milk_yield_liters, asking_price, currency, is_negotiable, location_city, location_province, description_en, description_ur, images, video_url, vaccination_status, health_status_en, health_status_ur, is_sold, seller_name, seller_phone, seller_whatsapp) ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
GRANT SELECT, INSERT, DELETE ON public.marketplace_listings TO authenticated;
GRANT SELECT ON public.marketplace_listings TO anon;

-- ============================================================================
-- 6. SECURE NEW USER REGISTRATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        role,
        subscription_tier,
        ai_scans_monthly_limit,
        ai_scans_used_this_month,
        preferred_language
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

-- ============================================================================
-- 7. STORAGE BUCKET INTEGRITY
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
