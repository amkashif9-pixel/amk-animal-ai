-- AMK ANIMAL AI - SECURITY REMEDIATION MIGRATION (02_security_remediation.sql)
-- Brand: AMK Animal AI | By amkashif | WhatsApp: +923346682654
-- Remediates: Privilege escalation on user_profiles, security definer search_path,
-- and separates SELECT/UPDATE policies on user profiles.

-- 1. HARDEN SECURITY DEFINER FUNCTION WITH SAFE search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 2. REPLACE OVERLY PERMISSIVE "FOR ALL" POLICY ON user_profiles
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;

-- Separate SELECT Policy: Users view own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

-- Separate UPDATE Policy: Users can only update their own record
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. POSTGRESQL TRIGGER TO PREVENT SELF-ROLE AND SUBSCRIPTION ESCALATION
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent ordinary authenticated users from altering their role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Ordinary users cannot modify their own role from % to %.', OLD.role, NEW.role;
        END IF;
    END IF;

    -- Prevent ordinary users from granting themselves commercial or pro tiers
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Subscription tier cannot be modified without administrative authorization.';
        END IF;
    END IF;

    -- Prevent modifying the account owner's UUID
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Immutable Identity: User ID cannot be modified.';
    END IF;

    -- Prevent resetting monthly AI scans used directly from client
    IF NEW.ai_scans_used_this_month < OLD.ai_scans_used_this_month AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Quota Tampering Blocked: AI scan usage counters cannot be reset by clients.';
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
