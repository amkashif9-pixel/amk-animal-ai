-- ============================================================================
-- AMK ANIMAL AI - ADVANCED MEAT YIELD ESTIMATOR MIGRATION
-- Migration: 04_meat_yield_estimator.sql
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   1. meat_yield_configs: Admin-calibrated baseline dressing and carcass percentages.
--   2. meat_yield_estimates: Persistent store for user/farmer meat yield predictions.
--   3. slaughter_actual_records: Actual post-slaughter weights for empirical calibration.
--   4. RLS policies and safe SECURITY DEFINER functions.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SPECIES MEAT YIELD CONFIGURATIONS TABLE
-- ============================================================================
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

-- Trigger to auto-update updated_at on meat_yield_configs
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

DROP TRIGGER IF EXISTS trg_set_updated_at_meat_yield_configs ON public.meat_yield_configs;
CREATE TRIGGER trg_set_updated_at_meat_yield_configs
    BEFORE UPDATE ON public.meat_yield_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. USER MEAT YIELD ESTIMATES TABLE
-- ============================================================================
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

-- ============================================================================
-- 3. SLAUGHTER CALIBRATION RECORDS TABLE (Actual slaughterhouse trials)
-- ============================================================================
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

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_meat_yield_estimates_user ON public.meat_yield_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_meat_yield_estimates_animal ON public.meat_yield_estimates(animal_id);
CREATE INDEX IF NOT EXISTS idx_slaughter_records_species ON public.slaughter_actual_records(species);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.meat_yield_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meat_yield_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slaughter_actual_records ENABLE ROW LEVEL SECURITY;

-- meat_yield_configs policies
DROP POLICY IF EXISTS "Public can view active yield configs" ON public.meat_yield_configs;
CREATE POLICY "Public can view active yield configs" ON public.meat_yield_configs
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Admins can manage yield configs" ON public.meat_yield_configs;
CREATE POLICY "Admins can manage yield configs" ON public.meat_yield_configs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- meat_yield_estimates policies
DROP POLICY IF EXISTS "Users can view own meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can view own meat yield estimates" ON public.meat_yield_estimates
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can insert meat yield estimates" ON public.meat_yield_estimates
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own meat yield estimates" ON public.meat_yield_estimates;
CREATE POLICY "Users can delete own meat yield estimates" ON public.meat_yield_estimates
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- slaughter_actual_records policies
DROP POLICY IF EXISTS "Users can view own slaughter actuals" ON public.slaughter_actual_records;
CREATE POLICY "Users can view own slaughter actuals" ON public.slaughter_actual_records
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can log slaughter actual records" ON public.slaughter_actual_records;
CREATE POLICY "Users can log slaughter actual records" ON public.slaughter_actual_records
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can manage all slaughter records" ON public.slaughter_actual_records;
CREATE POLICY "Admins can manage all slaughter records" ON public.slaughter_actual_records
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. SEED SCIENTIFIC SPECIES BENCHMARKS
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
    'Kajli and Lohi breed carcass composition research standards.', true
),
(
    'dumba', 'Ram / Dumba (دنبہ / مینڈھا)', 'دنبہ / مینڈھا (Fat-Tailed Sheep)',
    48.0, 52.0, 56.0,
    62.0, 18.5, 18.0, 1.5,
    8.0, 5.0, 3.0, 4.0,
    'Balkhi / Hashtnagri fat-tailed sheep (includes rump/tail fat deposits).', true
)
ON CONFLICT (species) DO UPDATE SET
    base_dressing_pct_low = EXCLUDED.base_dressing_pct_low,
    base_dressing_pct_likely = EXCLUDED.base_dressing_pct_likely,
    base_dressing_pct_high = EXCLUDED.base_dressing_pct_high,
    base_boneless_yield_pct = EXCLUDED.base_boneless_yield_pct,
    base_bone_pct = EXCLUDED.base_bone_pct,
    base_fat_pct = EXCLUDED.base_fat_pct,
    updated_at = NOW();

-- Grants
GRANT SELECT ON public.meat_yield_configs TO public, anon, authenticated;
GRANT ALL ON public.meat_yield_configs TO service_role;
GRANT SELECT, INSERT, DELETE ON public.meat_yield_estimates TO authenticated;
GRANT ALL ON public.meat_yield_estimates TO service_role;
GRANT SELECT, INSERT ON public.slaughter_actual_records TO authenticated;
GRANT ALL ON public.slaughter_actual_records TO service_role;
