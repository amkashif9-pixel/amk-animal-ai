-- ============================================================================
-- AMK ANIMAL AI - ADVANCED DISEASE DETECTION & VETERINARY TREATMENT MODULE
-- Migration: 05_disease_detection_and_treatment.sql
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   1. disease_assessments: User disease assessments with visual observations,
--      differential diagnoses, emergency flags, and treatment guidelines.
--   2. Row Level Security (RLS) policies protecting user medical data.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DISEASE ASSESSMENTS TABLE
-- ============================================================================
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disease_assessments_user ON public.disease_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_animal ON public.disease_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_species ON public.disease_assessments(species);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_risk ON public.disease_assessments(overall_risk_level);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_set_updated_at_disease_assessments ON public.disease_assessments;
CREATE TRIGGER trg_set_updated_at_disease_assessments
    BEFORE UPDATE ON public.disease_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.disease_assessments ENABLE ROW LEVEL SECURITY;

-- Users can view their own disease assessments; Admins can view all
DROP POLICY IF EXISTS "Users can view own disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can view own disease assessments" ON public.disease_assessments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert disease assessments
DROP POLICY IF EXISTS "Users can insert disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can insert disease assessments" ON public.disease_assessments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own disease assessments; Admins can delete any
DROP POLICY IF EXISTS "Users can delete own disease assessments" ON public.disease_assessments;
CREATE POLICY "Users can delete own disease assessments" ON public.disease_assessments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Admins have full management access
DROP POLICY IF EXISTS "Admins can manage all disease assessments" ON public.disease_assessments;
CREATE POLICY "Admins can manage all disease assessments" ON public.disease_assessments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Grants
GRANT SELECT, INSERT, DELETE ON public.disease_assessments TO authenticated;
GRANT ALL ON public.disease_assessments TO service_role;
