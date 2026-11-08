-- ============================================================================
-- AMK ANIMAL AI - PRODUCTION SECURITY FIXES MIGRATION
-- Migration: 03_final_security_fixes.sql
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   1. USER PROFILES: Column-level permissions, privileged field triggers,
--      server-side admin authorization (public.is_admin()).
--   2. VETERINARIANS: Tamper-proof verification columns, revoke broad self-update,
--      RPC admin_verify_veterinarian() with storage check, admin_revoke_veterinarian().
--   3. MARKETPLACE: Prevent seller tampering with is_featured, is_reported, report_count;
--      protect contact details, secure fraud reporting & moderation RPCs.
--   4. CONSULTATIONS: Separate customer and vet update permissions, restrict
--      prescriptions to assigned vets, restrict customer updates to cancellation.
--   5. SUBSCRIPTIONS & AI QUOTAS: Immutable subscriptions, persistent user_ai_quotas,
--      atomic consume_ai_scan_quota() with server-enforced limits, privileged reset RPC.
--   6. STORAGE: Private 'vet-documents' and 'medical-records' buckets with strict RLS
--      and file ownership validation.
--   7. MIGRATION REPEATABILITY: Idempotent statements, safe SECURITY DEFINER
--      with search_path = public, pg_temp, explicit REVOKE / GRANT.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SERVER-SIDE ADMINISTRATOR VERIFICATION FUNCTION
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
-- 2. USER PROFILES HARDENING (COLUMN-LEVEL SECURITY & INTEGRITY TRIGGER)
-- ============================================================================

-- Ensure updated_at column exists
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Clean up existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- RLS: SELECT
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- RLS: INSERT
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- RLS: UPDATE
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Column-Level Permissions on user_profiles
-- Revoke global UPDATE on table from general authenticated and anon roles
REVOKE UPDATE ON public.user_profiles FROM authenticated, anon, public;
-- Grant column-specific UPDATE to authenticated users (non-privileged fields only)
GRANT UPDATE (full_name, phone, farm_name, city, province, country, preferred_language) ON public.user_profiles TO authenticated;
-- Grant full table access to service_role
GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT ON public.user_profiles TO authenticated, anon;

-- Defense-in-depth trigger: Protect role, subscription_tier, AI quotas, email, id, created_at
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

    -- Prevent ordinary users from modifying email directly on user_profiles (must use Supabase auth email change)
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Security Restriction: Primary account email cannot be altered directly on profile.';
        END IF;
    END IF;

    -- Prevent ordinary users from increasing monthly scan limit
    IF NEW.ai_scans_monthly_limit IS DISTINCT FROM OLD.ai_scans_monthly_limit THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: AI scan limit cannot be altered without administrative authorization.';
        END IF;
    END IF;

    -- Prevent client tampering with monthly used counter
    -- Only allowed if admin OR internal quota consume transaction
    IF NEW.ai_scans_used_this_month IS DISTINCT FROM OLD.ai_scans_used_this_month THEN
        IF current_setting('amk.internal_quota_update', true) IS DISTINCT FROM 'true' AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Quota Tampering Blocked: AI scan counters cannot be directly updated by clients.';
        END IF;
    END IF;

    -- Immutable Identity & Timestamp
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

-- ============================================================================
-- 3. VETERINARIANS TABLE HARDENING & ADMIN VERIFICATION RPCs
-- ============================================================================

-- Add verification audit columns
ALTER TABLE public.veterinarians
    ADD COLUMN IF NOT EXISTS manual_verification_doc_ref TEXT,
    ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'unverified' CHECK (verification_type IN ('unverified', 'manual_physical_inspection', 'pvmc_registry_audit', 'revoked')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Drop unsafe self-management UPDATE policy from 01
DROP POLICY IF EXISTS "Veterinarians can update their own directory listing" ON public.veterinarians;
DROP POLICY IF EXISTS "Admins can verify veterinarians" ON public.veterinarians;
DROP POLICY IF EXISTS "Veterinarians can update own public profile fields" ON public.veterinarians;
DROP POLICY IF EXISTS "Admins have full access on veterinarians" ON public.veterinarians;

-- Safe RLS for Veterinarians:
-- Public can view active vet listings
-- Veterinarians can update only their own row
CREATE POLICY "Veterinarians can update own public profile fields" ON public.veterinarians
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access on veterinarians" ON public.veterinarians
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Column-level permissions on veterinarians:
-- Revoke general UPDATE from authenticated and anon
REVOKE UPDATE ON public.veterinarians FROM authenticated, anon, public;
-- Grant column-specific update to authenticated users (safe directory fields only)
GRANT UPDATE (name_en, name_ur, degrees, clinic_name_en, clinic_name_ur, photo_url, phone, whatsapp, email, province_state, district_city, full_address_en, full_address_ur, latitude, longitude, experience_years, services_en, services_ur, specialties) ON public.veterinarians TO authenticated;
GRANT ALL ON public.veterinarians TO service_role;

-- Trigger: Prevent tampering with verification badges, license number, and ratings
CREATE OR REPLACE FUNCTION public.enforce_veterinarian_verification_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If any verification or administrative column is changed, verify that caller is an authoritative administrator
    IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
       (NEW.license_number IS DISTINCT FROM OLD.license_number) OR
       (NEW.manual_verification_doc_ref IS DISTINCT FROM OLD.manual_verification_doc_ref) OR
       (NEW.verification_type IS DISTINCT FROM OLD.verification_type) OR
       (NEW.verified_by IS DISTINCT FROM OLD.verified_by) OR
       (NEW.verified_at IS DISTINCT FROM OLD.verified_at) OR
       (NEW.verification_notes IS DISTINCT FROM OLD.verification_notes) OR
       (NEW.rating IS DISTINCT FROM OLD.rating) OR
       (NEW.review_count IS DISTINCT FROM OLD.review_count) OR
       (NEW.user_id IS DISTINCT FROM OLD.user_id) OR
       (NEW.id IS DISTINCT FROM OLD.id) THEN
        
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

-- RPC Function: admin_verify_veterinarian
CREATE OR REPLACE FUNCTION public.admin_verify_veterinarian(
    p_vet_id UUID,
    p_license_number TEXT,
    p_manual_doc_ref TEXT,
    p_verification_type TEXT DEFAULT 'manual_physical_inspection',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_clean_license TEXT := upper(trim(p_license_number));
    v_clean_doc_ref TEXT := trim(p_manual_doc_ref);
    v_vet_record RECORD;
BEGIN
    -- 1. Strictly enforce Server-Side Administrator Check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only authenticated platform administrators can grant veterinarian verification.';
    END IF;

    -- 2. Validate RVMP license syntax
    IF v_clean_license IS NULL OR v_clean_license !~* '^RVMP-[A-Z]{2,3}-[0-9]{4,6}$' THEN
        RAISE EXCEPTION 'Invalid license number format. Must match standard RVMP pattern (e.g. RVMP-PB-14892).';
    END IF;

    -- 3. Strictly enforce mandatory manual verification document reference
    IF v_clean_doc_ref IS NULL OR length(v_clean_doc_ref) < 5 THEN
        RAISE EXCEPTION 'Verification Rejected: A valid documented manual verification reference is mandatory.';
    END IF;

    -- Fetch target veterinarian record
    SELECT * INTO v_vet_record FROM public.veterinarians WHERE id = p_vet_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veterinarian profile not found with ID %.', p_vet_id;
    END IF;

    -- 4. Require an actual uploaded file in the private 'vet-documents' bucket
    -- Also validates that the document path belongs to this veterinarian's user_id if linked
    IF NOT EXISTS (
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'vet-documents'
          AND (name = v_clean_doc_ref OR name LIKE '%' || v_clean_doc_ref)
          AND (
              v_vet_record.user_id IS NULL
              OR (storage.foldername(name))[1] = v_vet_record.user_id::text
              OR name LIKE v_vet_record.user_id::text || '/%'
              OR name LIKE p_vet_id::text || '/%'
          )
    ) THEN
        RAISE EXCEPTION 'Verification Rejected: Document "%" does not exist in the private vet-documents storage bucket or is not associated with this veterinarian. An authentic uploaded file is mandatory.', v_clean_doc_ref;
    END IF;

    -- 5. Update veterinarian profile with audit metadata
    UPDATE public.veterinarians
    SET is_verified = TRUE,
        license_number = v_clean_license,
        manual_verification_doc_ref = v_clean_doc_ref,
        verification_type = COALESCE(p_verification_type, 'manual_physical_inspection'),
        verified_by = v_admin_id,
        verified_at = NOW(),
        verification_notes = p_notes
    WHERE id = p_vet_id
    RETURNING * INTO v_vet_record;

    RETURN jsonb_build_object(
        'success', true,
        'vet_id', v_vet_record.id,
        'license_number', v_vet_record.license_number,
        'is_verified', true,
        'verified_by', v_admin_id,
        'verified_at', v_vet_record.verified_at,
        'manual_doc_ref', v_vet_record.manual_verification_doc_ref,
        'verification_type', v_vet_record.verification_type,
        'regulatory_notice', 'Manual degree and credential review completed by platform administrator. Does not constitute real-time government PVMC API verification.'
    );
END;
$$;

-- RPC Function: admin_revoke_veterinarian
CREATE OR REPLACE FUNCTION public.admin_revoke_veterinarian(
    p_vet_id UUID,
    p_reason TEXT DEFAULT 'Documentation review, license expiry, or administrative suspension'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_vet_record RECORD;
BEGIN
    -- 1. Strictly enforce Server-Side Administrator Check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only authenticated platform administrators can revoke veterinarian verification.';
    END IF;

    -- 2. Revoke verified badge and clear active verification reference
    UPDATE public.veterinarians
    SET is_verified = FALSE,
        verification_type = 'revoked',
        manual_verification_doc_ref = NULL,
        verified_by = NULL,
        verified_at = NULL,
        verification_notes = p_reason
    WHERE id = p_vet_id
    RETURNING * INTO v_vet_record;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veterinarian profile not found with ID %.', p_vet_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'vet_id', v_vet_record.id,
        'is_verified', false,
        'revocation_reason', p_reason,
        'revoked_by', v_admin_id,
        'revoked_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_verify_veterinarian(UUID, TEXT, TEXT, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_verify_veterinarian(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_revoke_veterinarian(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_veterinarian(UUID, TEXT) TO authenticated, service_role;

-- ============================================================================
-- 4. MARKETPLACE HARDENING (PREVENT SELLER PRIVILEGE TAMPERING & SECURE MODERATION)
-- ============================================================================

-- Drop overly broad policies
DROP POLICY IF EXISTS "Public can view active marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can manage own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Public can view active unflagged marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can view own listings regardless of status" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can insert own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Admins have full access on marketplace listings" ON public.marketplace_listings;

-- SELECT Policies:
-- Public can only view active, unflagged, unsold listings
CREATE POLICY "Public can view active unflagged marketplace listings" ON public.marketplace_listings
    FOR SELECT TO public
    USING (is_sold = false AND is_reported = false);

-- Sellers can view their own listings even if reported or sold; Admins view all
CREATE POLICY "Sellers can view own listings regardless of status" ON public.marketplace_listings
    FOR SELECT TO authenticated
    USING (auth.uid() = seller_id OR public.is_admin());

-- INSERT: Authenticated users can insert their own listings
CREATE POLICY "Sellers can insert own listings" ON public.marketplace_listings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = seller_id);

-- UPDATE: Sellers can update their own listings (fields bounded by column-level grant and trigger)
CREATE POLICY "Sellers can update own listings" ON public.marketplace_listings
    FOR UPDATE TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- DELETE: Sellers can delete their own listings
CREATE POLICY "Sellers can delete own listings" ON public.marketplace_listings
    FOR DELETE TO authenticated
    USING (auth.uid() = seller_id);

-- Admins full access
CREATE POLICY "Admins have full access on marketplace listings" ON public.marketplace_listings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Column-Level Permissions on marketplace_listings
REVOKE UPDATE ON public.marketplace_listings FROM authenticated, anon, public;
GRANT UPDATE (
    seller_name, seller_phone, seller_whatsapp, category, title_en, title_ur,
    species, breed, age, gender, weight_kg, milk_yield_liters, asking_price,
    currency, is_negotiable, location_city, location_province, description_en,
    description_ur, images, video_url, vaccination_status, health_status_en,
    health_status_ur, is_sold
) ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;

-- Trigger: Prevent sellers from setting or modifying is_featured, is_reported, report_count
CREATE OR REPLACE FUNCTION public.enforce_marketplace_listing_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Non-admins cannot insert listings that are pre-featured or pre-reported
        IF NOT public.is_admin() THEN
            NEW.is_featured := FALSE;
            NEW.is_reported := FALSE;
            NEW.report_count := 0;
        END IF;
        NEW.created_at := NOW();
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Only admins can change is_featured
        IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
            IF NOT public.is_admin() THEN
                RAISE EXCEPTION 'Permission Denied: Only platform administrators can feature or unfeature marketplace listings.';
            END IF;
        END IF;

        -- is_reported and report_count can only be modified by admin OR internal moderation trigger
        IF (NEW.is_reported IS DISTINCT FROM OLD.is_reported) OR (NEW.report_count IS DISTINCT FROM OLD.report_count) THEN
            IF current_setting('amk.internal_moderation', true) IS DISTINCT FROM 'true' AND NOT public.is_admin() THEN
                RAISE EXCEPTION 'Permission Denied: Sellers cannot modify fraud reports or moderation status on listings.';
            END IF;
        END IF;

        -- Immutable seller_id and listing id
        IF NEW.seller_id IS DISTINCT FROM OLD.seller_id THEN
            RAISE EXCEPTION 'Immutable Field: Seller ID cannot be reassigned.';
        END IF;

        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Immutable Field: Listing ID cannot be modified.';
        END IF;

        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_marketplace_listing_integrity ON public.marketplace_listings;
CREATE TRIGGER trg_enforce_marketplace_listing_integrity
BEFORE INSERT OR UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_marketplace_listing_integrity();

REVOKE EXECUTE ON FUNCTION public.enforce_marketplace_listing_integrity() FROM public, anon;

-- Secure Fraud Reporting Workflow
-- Unique constraint to prevent spamming duplicate reports from the same user on the same listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_fraud_reports_user_listing
    ON public.fraud_reports(listing_id, reported_by_user_id);

-- Trigger to validate fraud report submission and update listing counters
CREATE OR REPLACE FUNCTION public.handle_fraud_report_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    -- Verify listing exists and extract seller ID
    SELECT seller_id INTO v_seller_id FROM public.marketplace_listings WHERE id = NEW.listing_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target listing not found.';
    END IF;

    -- Prevent sellers from reporting their own listings
    IF v_seller_id = NEW.reported_by_user_id THEN
        RAISE EXCEPTION 'Invalid Action: Sellers cannot submit fraud reports against their own listings.';
    END IF;

    -- Enable internal moderation flag for atomic counter increment
    PERFORM set_config('amk.internal_moderation', 'true', true);

    -- Increment report count on the listing and flag if count reaches threshold (e.g. 3)
    UPDATE public.marketplace_listings
    SET report_count = COALESCE(report_count, 0) + 1,
        is_reported = CASE WHEN COALESCE(report_count, 0) + 1 >= 3 THEN TRUE ELSE is_reported END,
        updated_at = NOW()
    WHERE id = NEW.listing_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_fraud_report_submission ON public.fraud_reports;
CREATE TRIGGER trg_handle_fraud_report_submission
BEFORE INSERT ON public.fraud_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_fraud_report_submission();

REVOKE EXECUTE ON FUNCTION public.handle_fraud_report_submission() FROM public, anon;

-- Admin Moderation RPC: admin_moderate_marketplace_listing
CREATE OR REPLACE FUNCTION public.admin_moderate_marketplace_listing(
    p_listing_id UUID,
    p_action TEXT, -- 'feature', 'unfeature', 'dismiss_reports', 'remove_listing'
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_listing RECORD;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only platform administrators can moderate marketplace listings.';
    END IF;

    PERFORM set_config('amk.internal_moderation', 'true', true);

    IF p_action = 'feature' THEN
        UPDATE public.marketplace_listings
        SET is_featured = TRUE, updated_at = NOW()
        WHERE id = p_listing_id RETURNING * INTO v_listing;
    ELSIF p_action = 'unfeature' THEN
        UPDATE public.marketplace_listings
        SET is_featured = FALSE, updated_at = NOW()
        WHERE id = p_listing_id RETURNING * INTO v_listing;
    ELSIF p_action = 'dismiss_reports' THEN
        UPDATE public.marketplace_listings
        SET is_reported = FALSE, report_count = 0, updated_at = NOW()
        WHERE id = p_listing_id RETURNING * INTO v_listing;
    ELSIF p_action = 'remove_listing' THEN
        UPDATE public.marketplace_listings
        SET is_sold = TRUE, is_reported = TRUE, updated_at = NOW()
        WHERE id = p_listing_id RETURNING * INTO v_listing;
    ELSE
        RAISE EXCEPTION 'Invalid moderation action: %', p_action;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Marketplace listing not found with ID %.', p_listing_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'listing_id', v_listing.id,
        'action', p_action,
        'is_featured', v_listing.is_featured,
        'is_reported', v_listing.is_reported,
        'report_count', v_listing.report_count,
        'moderated_by', v_admin_id,
        'moderated_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_marketplace_listing(UUID, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_marketplace_listing(UUID, TEXT, TEXT) TO authenticated, service_role;

-- ============================================================================
-- 5. CONSULTATIONS (SEPARATE CUSTOMER & VET ROLES, PRESCRIPTION PROTECTION)
-- ============================================================================

-- Drop old consultation policies
DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can book consultations" ON public.consultations;
DROP POLICY IF EXISTS "Veterinarians can update assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users and assigned vets can view consultations" ON public.consultations;
DROP POLICY IF EXISTS "Customers can update own consultation status to cancelled" ON public.consultations;
DROP POLICY IF EXISTS "Assigned veterinarians can update consultation records" ON public.consultations;
DROP POLICY IF EXISTS "Admins have full access on consultations" ON public.consultations;

-- SELECT: Customers view their bookings, assigned veterinarians view their appointments, admins view all
CREATE POLICY "Users and assigned vets can view consultations" ON public.consultations
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id)
        OR public.is_admin()
    );

-- INSERT: Customers can book consultations with pending status and NO prescriptions
CREATE POLICY "Users can book consultations" ON public.consultations
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
        AND prescription_notes IS NULL
    );

-- UPDATE 1: Customers can ONLY update their own consultations to 'cancelled'
CREATE POLICY "Customers can update own consultation status to cancelled" ON public.consultations
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- UPDATE 2: Assigned veterinarians can update consultation records
CREATE POLICY "Assigned veterinarians can update consultation records" ON public.consultations
    FOR UPDATE TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id));

-- UPDATE 3: Admins have full access
CREATE POLICY "Admins have full access on consultations" ON public.consultations
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Trigger: Enforce consultation role boundaries & prescription protection
CREATE OR REPLACE FUNCTION public.enforce_consultation_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_customer BOOLEAN := (auth.uid() = OLD.user_id);
    v_is_assigned_vet BOOLEAN := EXISTS (
        SELECT 1 FROM public.veterinarians
        WHERE id = OLD.veterinarian_id AND user_id = auth.uid()
    );
    v_is_admin BOOLEAN := public.is_admin();
BEGIN
    -- Immutable identifiers
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Immutable Field: Consultation ID cannot be changed.';
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Immutable Field: Customer ID cannot be altered on consultation.';
    END IF;

    IF NEW.veterinarian_id IS DISTINCT FROM OLD.veterinarian_id THEN
        IF NOT v_is_admin THEN
            RAISE EXCEPTION 'Unauthorized: Veterinarian reassignment requires administrator authorization.';
        END IF;
    END IF;

    -- Admin bypasses role-specific checks
    IF v_is_admin THEN
        RETURN NEW;
    END IF;

    -- Block unassigned users
    IF NOT v_is_customer AND NOT v_is_assigned_vet THEN
        RAISE EXCEPTION 'Unauthorized: You are neither the customer nor the assigned veterinarian for this consultation.';
    END IF;

    -- Customer restrictions
    IF v_is_customer AND NOT v_is_assigned_vet THEN
        -- Customers must NEVER write or modify prescription notes
        IF NEW.prescription_notes IS DISTINCT FROM OLD.prescription_notes THEN
            RAISE EXCEPTION 'Unauthorized: Only the assigned licensed veterinarian can write or modify medical prescriptions.';
        END IF;

        -- Customers cannot modify clinical appointment details
        IF (NEW.consultation_method IS DISTINCT FROM OLD.consultation_method) OR
           (NEW.animal_id IS DISTINCT FROM OLD.animal_id) THEN
            RAISE EXCEPTION 'Unauthorized: Appointment core details cannot be altered after booking.';
        END IF;

        -- Customers may only transition status from pending or confirmed to cancelled
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF NEW.status != 'cancelled' OR OLD.status NOT IN ('pending', 'confirmed') THEN
                RAISE EXCEPTION 'Unauthorized: Customers can only cancel active consultations; they cannot confirm or complete them.';
            END IF;
        END IF;
    END IF;

    -- Veterinarian restrictions
    IF v_is_assigned_vet THEN
        -- Veterinarians cannot change animal or customer
        IF (NEW.user_id IS DISTINCT FROM OLD.user_id) OR
           (NEW.animal_id IS DISTINCT FROM OLD.animal_id) OR
           (NEW.consultation_method IS DISTINCT FROM OLD.consultation_method) THEN
            RAISE EXCEPTION 'Unauthorized: Consultation appointment links cannot be modified by the attending veterinarian.';
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

-- ============================================================================
-- 6. SUBSCRIPTIONS & PERSISTENT AI QUOTAS HARDENING
-- ============================================================================

-- Subscriptions Table Hardening
REVOKE ALL ON public.subscriptions FROM anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- User AI Quotas Table
CREATE TABLE IF NOT EXISTS public.user_ai_quotas (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    burst_count INT NOT NULL DEFAULT 0,
    burst_window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    daily_count INT NOT NULL DEFAULT 0,
    daily_window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_ai_quotas ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_ai_quotas FROM anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.user_ai_quotas FROM authenticated;
GRANT SELECT ON public.user_ai_quotas TO authenticated;
GRANT ALL ON public.user_ai_quotas TO service_role;

DROP POLICY IF EXISTS "Users can view own AI quota usage" ON public.user_ai_quotas;
CREATE POLICY "Users can view own AI quota usage" ON public.user_ai_quotas
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Atomic Quota Consumption RPC Function
-- Securely calculates limits on the server based on the user's role and tier.
-- Does NOT allow client callers to arbitrarily override rate or quota limits.
CREATE OR REPLACE FUNCTION public.consume_ai_scan_quota(
    p_burst_limit INT DEFAULT NULL,
    p_burst_window_seconds INT DEFAULT 60,
    p_daily_limit INT DEFAULT NULL,
    p_daily_window_seconds INT DEFAULT 86400
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_now TIMESTAMPTZ := NOW();
    v_quota RECORD;
    v_retry_after INT := 0;
    v_user_role TEXT;
    v_user_tier TEXT;
    v_monthly_limit INT;
    v_monthly_used INT;
    v_effective_burst_limit INT;
    v_effective_daily_limit INT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: JWT bearer token must be provided.';
    END IF;

    -- Fetch user profile data
    SELECT role, subscription_tier, ai_scans_monthly_limit, ai_scans_used_this_month
    INTO v_user_role, v_user_tier, v_monthly_limit, v_monthly_used
    FROM public.user_profiles
    WHERE id = v_user_id;

    -- Platform administrators have unlimited quota
    IF v_user_role = 'admin' OR public.is_admin() THEN
        RETURN jsonb_build_object(
            'allowed', true,
            'reason', 'admin_unlimited',
            'daily_remaining', 999999,
            'burst_remaining', 999999,
            'monthly_remaining', 999999
        );
    END IF;

    -- Server-Enforced Limits Based on Subscription Tier & Role
    -- Client-supplied parameters cannot grant higher limits than subscription permits
    IF v_user_tier = 'commercial_pro' OR v_user_role = 'veterinarian' THEN
        v_effective_burst_limit := 20;
        v_effective_daily_limit := 200;
        v_monthly_limit := COALESCE(v_monthly_limit, 200);
    ELSIF v_user_tier = 'farmer_basic' THEN
        v_effective_burst_limit := 10;
        v_effective_daily_limit := 50;
        v_monthly_limit := COALESCE(v_monthly_limit, 50);
    ELSE
        -- Free Tier default
        v_effective_burst_limit := 5;
        v_effective_daily_limit := 10;
        v_monthly_limit := COALESCE(v_monthly_limit, 10);
    END IF;

    -- If service_role or admin called with custom parameters, respect lower restrictions if tighter
    IF p_burst_limit IS NOT NULL AND p_burst_limit < v_effective_burst_limit THEN
        v_effective_burst_limit := p_burst_limit;
    END IF;
    IF p_daily_limit IS NOT NULL AND p_daily_limit < v_effective_daily_limit THEN
        v_effective_daily_limit := p_daily_limit;
    END IF;

    -- Check monthly subscription ceiling
    IF v_monthly_used >= v_monthly_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'error_code', 'MONTHLY_QUOTA_EXCEEDED',
            'reason', format('Monthly AI scan quota (%s scans) has been exhausted. Please upgrade your subscription tier.', v_monthly_limit),
            'retry_after', 86400
        );
    END IF;

    -- Initialize quota record if first interaction
    INSERT INTO public.user_ai_quotas (user_id, burst_count, burst_window_start, daily_count, daily_window_start, updated_at)
    VALUES (v_user_id, 0, v_now, 0, v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Lock user quota row for update to eliminate concurrent race conditions
    SELECT * INTO v_quota
    FROM public.user_ai_quotas
    WHERE user_id = v_user_id
    FOR UPDATE;

    -- Slide burst window (e.g. 60 seconds)
    IF EXTRACT(EPOCH FROM (v_now - v_quota.burst_window_start)) >= p_burst_window_seconds THEN
        v_quota.burst_count := 0;
        v_quota.burst_window_start := v_now;
    END IF;

    -- Slide daily window (e.g. 86400 seconds)
    IF EXTRACT(EPOCH FROM (v_now - v_quota.daily_window_start)) >= p_daily_window_seconds THEN
        v_quota.daily_count := 0;
        v_quota.daily_window_start := v_now;
    END IF;

    -- Enforce burst rate limit
    IF v_quota.burst_count >= v_effective_burst_limit THEN
        v_retry_after := CEIL(p_burst_window_seconds - EXTRACT(EPOCH FROM (v_now - v_quota.burst_window_start)));
        IF v_retry_after < 1 THEN v_retry_after := 1; END IF;
        RETURN jsonb_build_object(
            'allowed', false,
            'error_code', 'BURST_LIMIT_EXCEEDED',
            'reason', format('Burst limit reached: maximum %s scans per minute. Please retry after %s seconds.', v_effective_burst_limit, v_retry_after),
            'retry_after', v_retry_after
        );
    END IF;

    -- Enforce daily scan quota
    IF v_quota.daily_count >= v_effective_daily_limit THEN
        v_retry_after := CEIL(p_daily_window_seconds - EXTRACT(EPOCH FROM (v_now - v_quota.daily_window_start)));
        IF v_retry_after < 1 THEN v_retry_after := 1; END IF;
        RETURN jsonb_build_object(
            'allowed', false,
            'error_code', 'DAILY_LIMIT_EXCEEDED',
            'reason', format('Daily quota of %s scans exceeded for subscription tier. Please try again tomorrow.', v_effective_daily_limit),
            'retry_after', v_retry_after
        );
    END IF;

    -- Atomically increment burst and daily counters in user_ai_quotas
    UPDATE public.user_ai_quotas
    SET burst_count = v_quota.burst_count + 1,
        burst_window_start = v_quota.burst_window_start,
        daily_count = v_quota.daily_count + 1,
        daily_window_start = v_quota.daily_window_start,
        updated_at = v_now
    WHERE user_id = v_user_id;

    -- Atomically increment user_profiles monthly scan counter using internal bypass flag
    PERFORM set_config('amk.internal_quota_update', 'true', true);

    UPDATE public.user_profiles
    SET ai_scans_used_this_month = COALESCE(ai_scans_used_this_month, 0) + 1,
        updated_at = v_now
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'allowed', true,
        'burst_remaining', v_effective_burst_limit - (v_quota.burst_count + 1),
        'daily_remaining', v_effective_daily_limit - (v_quota.daily_count + 1),
        'monthly_remaining', v_monthly_limit - (COALESCE(v_monthly_used, 0) + 1)
    );
END;
$$;

-- Privileged Quota Reset Function (Admin / Trusted Backend Role Only)
CREATE OR REPLACE FUNCTION public.admin_reset_user_quota(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only platform administrators or service role can execute privileged quota operations.';
    END IF;

    -- Reset user_ai_quotas
    UPDATE public.user_ai_quotas
    SET burst_count = 0,
        daily_count = 0,
        burst_window_start = NOW(),
        daily_window_start = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Reset user_profiles monthly usage
    PERFORM set_config('amk.internal_quota_update', 'true', true);

    UPDATE public.user_profiles
    SET ai_scans_used_this_month = 0,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'reset_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ai_scan_quota(INT, INT, INT, INT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_scan_quota(INT, INT, INT, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_reset_user_quota(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_quota(UUID) TO authenticated, service_role;

-- ============================================================================
-- 7. STORAGE BUCKETS & OBJECT POLICIES (PRIVATE CREDENTIALS & MEDICAL DOCS)
-- ============================================================================

-- Create private storage buckets
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

-- Helper function to validate access to medical records
CREATE OR REPLACE FUNCTION public.can_access_medical_record(p_object_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    v_owner_id TEXT;
    v_caller_id UUID := auth.uid();
BEGIN
    IF v_caller_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Admins have global access
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    -- Extract folder owner ID from object path (format: <user_id>/...)
    v_owner_id := (storage.foldername(p_object_name))[1];
    IF v_owner_id = v_caller_id::text THEN
        RETURN TRUE;
    END IF;

    -- Check if caller is an attending veterinarian assigned to an active consultation with this customer
    IF EXISTS (
        SELECT 1 FROM public.consultations c
        JOIN public.veterinarians v ON v.id = c.veterinarian_id
        WHERE c.user_id::text = v_owner_id
          AND v.user_id = v_caller_id
          AND c.status IN ('confirmed', 'completed')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_medical_record(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_access_medical_record(TEXT) TO authenticated, service_role;

-- Clean existing storage policies
DROP POLICY IF EXISTS "Users can manage own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Veterinarians can upload verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Vets and Admins can view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Medical records insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Medical records select policy" ON storage.objects;
DROP POLICY IF EXISTS "Medical records delete policy" ON storage.objects;

-- Storage RLS: vet-documents (Strictly Private)
-- Only verified/registered veterinarians can upload their credentials into their own folder
CREATE POLICY "Veterinarians can upload verification docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'vet-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (SELECT 1 FROM public.veterinarians WHERE user_id = auth.uid())
);

-- Only the owner veterinarian and platform administrators can view verification documents
CREATE POLICY "Vets and Admins can view verification docs"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'vet-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

-- Only administrators can delete or manage verification documents
CREATE POLICY "Admins can manage verification docs"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'vet-documents' AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'vet-documents' AND public.is_admin()
);

-- Storage RLS: medical-records (Strictly Private)
-- Users can only upload into their own folder
CREATE POLICY "Medical records insert policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'medical-records'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Access validated against database ownership and consultation records
CREATE POLICY "Medical records select policy"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'medical-records'
    AND public.can_access_medical_record(name)
);

-- Users can delete their own medical records, Admins can manage all
CREATE POLICY "Medical records delete policy"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'medical-records'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

-- ============================================================================
-- 8. SAFE ONE-TIME ADMINISTRATOR PROVISIONING PROCEDURE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.provision_initial_administrator(
    p_admin_user_id UUID,
    p_confirmation_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_count INT;
BEGIN
    SELECT COUNT(*) INTO v_admin_count FROM public.user_profiles WHERE role = 'admin';
    
    IF v_admin_count > 0 AND p_confirmation_token != 'AMK_CONFIRM_ADDITIONAL_ADMIN' THEN
        RAISE EXCEPTION 'Provisioning Blocked: An administrator already exists on this platform. Explicit confirmation token is required.';
    END IF;

    UPDATE public.user_profiles
    SET role = 'admin',
        subscription_tier = 'commercial_pro',
        ai_scans_monthly_limit = 99999,
        updated_at = NOW()
    WHERE id = p_admin_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for ID: %. User must first register via Supabase Auth.', p_admin_user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_admin_user_id,
        'role', 'admin',
        'provisioned_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.provision_initial_administrator(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.provision_initial_administrator(UUID, TEXT) TO service_role;
