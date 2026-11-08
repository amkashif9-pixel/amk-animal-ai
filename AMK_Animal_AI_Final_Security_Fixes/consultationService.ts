/**
 * Consultation Service
 * Brand: AMK Animal AI | Author: amkashif | WhatsApp: +923346682654
 * 
 * Enforces role-based separation:
 * - Customers can book consultations and cancel pending/confirmed appointments.
 * - Customers CANNOT write or modify prescriptions or complete appointments.
 * - Only assigned veterinarians (or platform admins) can write prescriptions
 *   and update clinical consultation status.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ConsultationMethod } from '../types/vet';

export type ConsultationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  userId: string;
  veterinarianId: string;
  animalId?: string;
  consultationDate: string;
  consultationMethod: ConsultationMethod;
  status: ConsultationStatus;
  symptomNotes?: string;
  prescriptionNotes?: string;
  createdAt: string;
}

const CONSULTATIONS_STORAGE_KEY = 'amk_consultations_store';

function getLocalConsultations(): Consultation[] {
  try {
    const raw = localStorage.getItem(CONSULTATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConsultations(records: Consultation[]) {
  localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(records));
}

/**
 * Fetch consultations for the currently authenticated user (customer or veterinarian)
 */
export async function fetchConsultations(): Promise<{ success: boolean; data?: Consultation[]; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('consultation_date', { ascending: false });

      if (error) return { success: false, error: error.message };

      const formatted: Consultation[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        veterinarianId: row.veterinarian_id,
        animalId: row.animal_id,
        consultationDate: row.consultation_date,
        consultationMethod: row.consultation_method,
        status: row.status,
        symptomNotes: row.symptom_notes,
        prescriptionNotes: row.prescription_notes,
        createdAt: row.created_at,
      }));

      return { success: true, data: formatted };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to fetch consultations from database.' };
    }
  }

  return { success: true, data: getLocalConsultations() };
}

/**
 * Customer Action: Book a consultation.
 * Strips any prescriptionNotes and strictly sets status to 'pending'.
 */
export async function bookConsultation(input: {
  veterinarianId: string;
  animalId?: string;
  consultationDate: string;
  consultationMethod: ConsultationMethod;
  symptomNotes?: string;
}): Promise<{ success: boolean; data?: Consultation; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required to book a consultation.' };
      }

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          veterinarian_id: input.veterinarianId,
          animal_id: input.animalId || null,
          consultation_date: input.consultationDate,
          consultation_method: input.consultationMethod,
          status: 'pending',
          symptom_notes: input.symptomNotes || null,
          prescription_notes: null, // Strictly null on booking
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          veterinarianId: data.veterinarian_id,
          animalId: data.animal_id,
          consultationDate: data.consultation_date,
          consultationMethod: data.consultation_method,
          status: data.status,
          symptomNotes: data.symptom_notes,
          prescriptionNotes: data.prescription_notes,
          createdAt: data.created_at,
        },
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Database booking failed.' };
    }
  }

  // Local Offline Simulation
  const newConsultation: Consultation = {
    id: 'consult_' + Date.now(),
    userId: 'user_current',
    veterinarianId: input.veterinarianId,
    animalId: input.animalId,
    consultationDate: input.consultationDate,
    consultationMethod: input.consultationMethod,
    status: 'pending',
    symptomNotes: input.symptomNotes,
    createdAt: new Date().toISOString(),
  };

  const store = getLocalConsultations();
  store.unshift(newConsultation);
  saveLocalConsultations(store);

  return { success: true, data: newConsultation };
}

/**
 * Customer Action: Cancel an active consultation
 */
export async function cancelConsultation(consultationId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'cancelled' })
        .eq('id', consultationId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to cancel consultation.' };
    }
  }

  const store = getLocalConsultations();
  const target = store.find((c) => c.id === consultationId);
  if (!target) return { success: false, error: 'Consultation not found.' };

  target.status = 'cancelled';
  saveLocalConsultations(store);
  return { success: true };
}

/**
 * Veterinarian / Admin Action: Write clinical prescription notes.
 * Customers are strictly blocked by PostgreSQL RLS trigger.
 */
export async function savePrescription(
  consultationId: string,
  prescriptionNotes: string
): Promise<{ success: boolean; error?: string }> {
  if (!prescriptionNotes || prescriptionNotes.trim() === '') {
    return { success: false, error: 'Prescription notes cannot be empty.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ prescription_notes: prescriptionNotes.trim() })
        .eq('id', consultationId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save prescription.' };
    }
  }

  const store = getLocalConsultations();
  const target = store.find((c) => c.id === consultationId);
  if (!target) return { success: false, error: 'Consultation not found.' };

  target.prescriptionNotes = prescriptionNotes.trim();
  saveLocalConsultations(store);
  return { success: true };
}

/**
 * Veterinarian / Admin Action: Update status (confirm or complete)
 */
export async function updateConsultationStatus(
  consultationId: string,
  status: 'confirmed' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', consultationId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update consultation status.' };
    }
  }

  const store = getLocalConsultations();
  const target = store.find((c) => c.id === consultationId);
  if (!target) return { success: false, error: 'Consultation not found.' };

  target.status = status;
  saveLocalConsultations(store);
  return { success: true };
}
