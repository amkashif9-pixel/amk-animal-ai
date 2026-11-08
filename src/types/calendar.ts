export type EventCategory =
  | 'vaccination'
  | 'deworming'
  | 'health_check'
  | 'gestation'
  | 'heat_cycle'
  | 'feeding_change'
  | 'grooming'
  | 'vet_appointment';

export interface CalendarReminder {
  id: string;
  animalId?: string;
  animalName?: string;
  titleEn: string;
  titleUr: string;
  category: EventCategory;
  dueDate: string;
  repeatFrequency?: 'none' | 'monthly' | 'quarterly' | 'bi-annual' | 'yearly';
  notesEn?: string;
  notesUr?: string;
  isCompleted: boolean;
  completedAt?: string;
  alertDaysBefore: number;
}
