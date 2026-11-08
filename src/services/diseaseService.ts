/**
 * Animal Disease Detection & Veterinary Treatment Persistence Service
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * Supports live Supabase storage and offline fallback simulation.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { HealthAssessmentResult } from '../types/health';

const DISEASE_ASSESSMENTS_STORAGE_KEY = 'amk_disease_assessments_records';

/**
 * Save disease assessment record to Supabase or local storage fallback
 */
export async function saveDiseaseAssessment(
  assessment: HealthAssessmentResult
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const mediaMeta = (assessment.input.mediaFiles || []).map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        viewType: m.viewType,
        timestampSeconds: m.timestampSeconds,
      }));

      const primary = assessment.primaryMatches[0];
      const diffIds = assessment.differentialMatches.map((d) => d.id);
      const emergencyTypes = assessment.emergencyProtocols.map((p) => p.emergencyType);

      const { data, error } = await supabase
        .from('disease_assessments')
        .insert({
          user_id: user?.id || null,
          animal_id: assessment.input.animalId || null,
          species: assessment.input.species,
          breed: assessment.input.breed || null,
          animal_name: assessment.input.animalName || null,
          reported_symptoms: assessment.input.symptoms,
          custom_description: assessment.input.customDescription || null,
          rectal_temperature_f: assessment.input.temperatureF || null,
          duration_days: assessment.input.durationDays || 1,
          detected_emergency: assessment.detectedEmergency,
          emergency_types: emergencyTypes,
          overall_risk_level: assessment.overallRiskLevel,
          primary_condition_id: primary?.id || null,
          primary_condition_name_en: primary?.nameEn || null,
          primary_condition_name_ur: primary?.nameUr || null,
          differential_condition_ids: diffIds,
          confidence_score: assessment.confidenceScore,
          confidence_label: assessment.confidenceLabel,
          media_count: assessment.input.mediaFiles?.length || 0,
          media_metadata: mediaMeta,
          full_assessment_payload: assessment,
          vet_confirmed: assessment.vetConfirmed || false,
          confirmed_diagnosis: assessment.confirmedDiagnosis || null,
          confirmed_by_vet_name: assessment.confirmedByVetName || null,
          treatment_outcome: assessment.treatmentOutcome || 'pending',
          follow_up_notes: assessment.followUpNotes || null,
          follow_up_date: assessment.followUpDate || null,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Supabase disease assessment insert error, falling back to local storage:', error);
      } else if (data?.id) {
        return { success: true, id: data.id };
      }
    } catch (e: any) {
      console.warn('Supabase saveDiseaseAssessment exception, falling back:', e);
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(DISEASE_ASSESSMENTS_STORAGE_KEY);
    const list: HealthAssessmentResult[] = raw ? JSON.parse(raw) : [];
    // Keep max 50 recent assessments
    const updated = [assessment, ...list.filter((a) => a.id !== assessment.id)].slice(0, 50);
    localStorage.setItem(DISEASE_ASSESSMENTS_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, id: assessment.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed saving locally' };
  }
}

/**
 * Retrieve saved disease assessments for current user
 */
export async function getUserDiseaseAssessments(): Promise<HealthAssessmentResult[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('disease_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data.map((row) => row.full_assessment_payload as HealthAssessmentResult);
      }
    } catch (e) {
      console.warn('Failed retrieving assessments from Supabase, checking local storage:', e);
    }
  }

  try {
    const raw = localStorage.getItem(DISEASE_ASSESSMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a disease assessment record
 */
export async function deleteDiseaseAssessment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('disease_assessments')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  }

  try {
    const raw = localStorage.getItem(DISEASE_ASSESSMENTS_STORAGE_KEY);
    if (raw) {
      const list: HealthAssessmentResult[] = JSON.parse(raw);
      const filtered = list.filter((a) => a.id !== id);
      localStorage.setItem(DISEASE_ASSESSMENTS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Update follow-up clinical outcome and veterinary verification for an assessment
 */
export async function updateDiseaseAssessmentOutcome(
  id: string,
  update: {
    vetConfirmed: boolean;
    confirmedDiagnosis?: string;
    confirmedByVetName?: string;
    treatmentOutcome: 'pending' | 'recovered' | 'improving' | 'unchanged' | 'deteriorated' | 'referred_hospital';
    followUpNotes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const followUpDate = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('disease_assessments')
        .update({
          vet_confirmed: update.vetConfirmed,
          confirmed_diagnosis: update.confirmedDiagnosis || null,
          confirmed_by_vet_name: update.confirmedByVetName || null,
          treatment_outcome: update.treatmentOutcome,
          follow_up_notes: update.followUpNotes || null,
          follow_up_date: followUpDate,
        })
        .eq('id', id);

      if (error) {
        console.warn('Supabase updateOutcome error, updating locally:', error);
      } else {
        return { success: true };
      }
    } catch (e: any) {
      console.warn('Supabase updateOutcome exception:', e);
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(DISEASE_ASSESSMENTS_STORAGE_KEY);
    if (raw) {
      const list: HealthAssessmentResult[] = JSON.parse(raw);
      const index = list.findIndex((a) => a.id === id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          vetConfirmed: update.vetConfirmed,
          confirmedDiagnosis: update.confirmedDiagnosis,
          confirmedByVetName: update.confirmedByVetName,
          treatmentOutcome: update.treatmentOutcome,
          followUpNotes: update.followUpNotes,
          followUpDate,
        };
        localStorage.setItem(DISEASE_ASSESSMENTS_STORAGE_KEY, JSON.stringify(list));
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed updating outcome locally' };
  }
}
