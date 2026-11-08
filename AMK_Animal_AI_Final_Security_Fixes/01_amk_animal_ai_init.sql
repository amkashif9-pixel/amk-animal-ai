-- AMK ANIMAL AI - FULL DATABASE ARCHITECTURE & MIGRATION SCRIPT
-- Brand: AMK Animal AI | By amkashif | WhatsApp: +923346682654

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal ON public.animal_health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_animal ON public.vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_city ON public.marketplace_listings(location_city);
CREATE INDEX IF NOT EXISTS idx_veterinarians_city ON public.veterinarians(district_city);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ-ONLY TABLES
ALTER TABLE public.animal_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinary_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public species are viewable by everyone" ON public.animal_species FOR SELECT USING (true);
CREATE POLICY "Public breeds are viewable by everyone" ON public.animal_breeds FOR SELECT USING (true);
CREATE POLICY "Public diseases are viewable by everyone" ON public.diseases FOR SELECT USING (true);
CREATE POLICY "Public vet guidance is viewable by everyone" ON public.veterinary_guidance FOR SELECT USING (true);
CREATE POLICY "Public mandi prices are viewable by everyone" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Public vets are viewable by everyone" ON public.veterinarians FOR SELECT USING (true);

-- USER RESTRICTED POLICIES
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Users can manage own animals" ON public.animals
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own animal images" ON public.animal_images
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_images.animal_id AND animals.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_images.animal_id AND animals.user_id = auth.uid())
    );

CREATE POLICY "Users can manage own animal analyses" ON public.animal_analysis
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own animal health records" ON public.animal_health_records
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_health_records.animal_id AND animals.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = animal_health_records.animal_id AND animals.user_id = auth.uid())
    );

CREATE POLICY "Users can manage own vaccinations" ON public.vaccinations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = vaccinations.animal_id AND animals.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.animals WHERE animals.id = vaccinations.animal_id AND animals.user_id = auth.uid())
    );

CREATE POLICY "Users can manage own feeding plans" ON public.feeding_plans
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active marketplace listings" ON public.marketplace_listings
    FOR SELECT USING (is_sold = false);

CREATE POLICY "Sellers can manage own listings" ON public.marketplace_listings
    FOR ALL USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can view own consultations" ON public.consultations
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id));

CREATE POLICY "Users can book consultations" ON public.consultations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and update own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit fraud reports" ON public.fraud_reports
    FOR INSERT WITH CHECK (auth.uid() = reported_by_user_id);

CREATE POLICY "Users can view own submitted fraud reports" ON public.fraud_reports
    FOR SELECT USING (auth.uid() = reported_by_user_id);

-- VETERINARIAN SELF-MANAGEMENT
CREATE POLICY "Veterinarians can update their own directory listing" ON public.veterinarians
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Veterinarians can update assigned consultations" ON public.consultations
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.veterinarians WHERE veterinarians.id = consultations.veterinarian_id));

-- 16. SERVER-SIDE AUTHORIZATION & ADMIN FUNCTIONS
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

-- Trigger to prevent self-role and subscription escalation
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Ordinary users cannot modify their own role from % to %.', OLD.role, NEW.role;
        END IF;
    END IF;

    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege Escalation Blocked: Subscription tier cannot be modified without administrative authorization.';
        END IF;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Immutable Identity: User ID cannot be modified.';
    END IF;

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

-- Allow system administrators to manage fraud reports and directory listings
CREATE POLICY "Admins can view and manage all fraud reports" ON public.fraud_reports
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can verify veterinarians" ON public.veterinarians
    FOR UPDATE USING (public.is_admin());

-- 17. SUPABASE STORAGE BUCKETS & OBJECT POLICIES
-- Ensure storage extension and schema are enabled
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('animal-photos', 'animal-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('marketplace-media', 'marketplace-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
    ('medical-records', 'medical-records', false, 15728640, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Animal Photos
CREATE POLICY "Users can upload own animal photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'animal-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can manage own animal photos"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'animal-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view animal photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'animal-photos');

-- Storage RLS: Marketplace Media
CREATE POLICY "Users can upload marketplace media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'marketplace-media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view marketplace media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'marketplace-media');

CREATE POLICY "Sellers can delete own marketplace media"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'marketplace-media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Medical Records (Strictly Private to Owner or Admin)
CREATE POLICY "Users can manage own medical documents"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'medical-records' AND (
        (storage.foldername(name))[1] = auth.uid()::text OR
        public.is_admin()
    )
)
WITH CHECK (
    bucket_id = 'medical-records' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

