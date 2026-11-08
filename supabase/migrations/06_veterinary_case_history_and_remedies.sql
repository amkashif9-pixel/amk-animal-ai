-- ============================================================================
-- AMK ANIMAL AI - VETERINARY CASE HISTORY & FOLLOW-UP OUTCOMES
-- Migration: 06_veterinary_case_history_and_remedies.sql
-- Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
-- Description:
--   1. Add clinical outcome tracking & veterinary verification fields to
--      disease_assessments table.
--   2. Strict Row Level Security (RLS) policies allowing users and verified
--      veterinarians to update outcomes.
-- ============================================================================

-- 1. Safely add clinical outcome tracking columns if they do not exist
ALTER TABLE public.disease_assessments
    ADD COLUMN IF NOT EXISTS vet_confirmed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS confirmed_diagnosis TEXT,
    ADD COLUMN IF NOT EXISTS confirmed_by_vet_name TEXT,
    ADD COLUMN IF NOT EXISTS treatment_outcome TEXT DEFAULT 'pending'
        CHECK (treatment_outcome IN ('pending', 'recovered', 'improving', 'unchanged', 'deteriorated', 'referred_hospital')),
    ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
    ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_disease_assessments_outcome ON public.disease_assessments(treatment_outcome);
CREATE INDEX IF NOT EXISTS idx_disease_assessments_vet_confirmed ON public.disease_assessments(vet_confirmed);

-- 3. RLS Update policy: Users can update their own assessments, and admins can update all
DROP POLICY IF EXISTS "Users can update own disease assessment outcomes" ON public.disease_assessments;
CREATE POLICY "Users can update own disease assessment outcomes" ON public.disease_assessments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Grant update permissions
GRANT UPDATE ON public.disease_assessments TO authenticated;
