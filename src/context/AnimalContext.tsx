import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnimalProfile } from '../types/animal';

interface AnimalContextType {
  animals: AnimalProfile[];
  addAnimal: (animal: Omit<AnimalProfile, 'id' | 'createdAt' | 'updatedAt'>) => AnimalProfile;
  updateAnimal: (id: string, updates: Partial<AnimalProfile>) => void;
  deleteAnimal: (id: string) => void;
  getAnimalById: (id: string) => AnimalProfile | undefined;
  addMilkRecord: (animalId: string, morningLiters: number, eveningLiters: number) => void;
  addWeightRecord: (animalId: string, weightKg: number, notes?: string) => void;
  addVaccinationRecord: (
    animalId: string,
    record: { vaccineName: string; dateAdministered: string; nextDueDate: string; administeredBy?: string }
  ) => void;
  addHealthRecord: (
    animalId: string,
    record: { condition: string; symptoms: string; treatment: string; veterinarian?: string; resolved: boolean }
  ) => void;
}

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

const ANIMALS_STORAGE_KEY = 'amk_animal_ai_herd';

const DEFAULT_HERD: AnimalProfile[] = [
  {
    id: 'animal_rani_01',
    name: 'Rani (رانی)',
    tagNumber: 'PK-SWL-042',
    species: 'Cow',
    breed: 'Sahiwal Cow',
    gender: 'female',
    dobOrAge: '4 Years (چوگا)',
    photos: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
    ],
    purchasePrice: 380000,
    currentEstimatedValue: 460000,
    weightRecords: [
      { date: '2024-01-10', weightKg: 390, notes: 'Post-calving baseline' },
      { date: '2024-03-15', weightKg: 410, notes: 'Peak lactation' },
      { date: '2024-06-01', weightKg: 425, notes: 'Steady condition' },
    ],
    milkRecords: [
      { date: '2024-10-25', morningLiters: 8.5, eveningLiters: 6.5, totalLiters: 15.0 },
      { date: '2024-10-26', morningLiters: 8.2, eveningLiters: 7.0, totalLiters: 15.2 },
      { date: '2024-10-27', morningLiters: 8.8, eveningLiters: 6.8, totalLiters: 15.6 },
      { date: '2024-10-28', morningLiters: 9.0, eveningLiters: 7.2, totalLiters: 16.2 },
      { date: '2024-10-29', morningLiters: 8.7, eveningLiters: 6.9, totalLiters: 15.6 },
      { date: '2024-10-30', morningLiters: 9.1, eveningLiters: 7.1, totalLiters: 16.2 },
      { date: '2024-10-31', morningLiters: 8.9, eveningLiters: 7.3, totalLiters: 16.2 },
    ],
    healthHistory: [
      {
        id: 'hh_1',
        date: '2024-04-12',
        condition: 'Mild Subclinical Mastitis (ہلکا ساڑو)',
        symptoms: 'Flakes in morning milk fore-stripping',
        diagnosis: 'Streptococcal infection early stage',
        veterinarian: 'Dr. Muhammad Kashif (RVMP)',
        treatment: 'Intramammary herbal ointment and frequent stripping for 3 days',
        resolved: true,
      },
    ],
    vaccinationRecords: [
      {
        id: 'vac_1',
        vaccineName: 'FMD Trivalent Vaccine',
        dateAdministered: '2024-03-01',
        nextDueDate: '2024-09-01',
        administeredBy: 'Livestock Dept Punjab',
        batchNumber: 'FMD-2401',
      },
      {
        id: 'vac_2',
        vaccineName: 'HS Oil Adjuvant Vaccine',
        dateAdministered: '2024-05-15',
        nextDueDate: '2025-05-15',
        administeredBy: 'Dr. Muhammad Kashif',
        batchNumber: 'HS-PB-88',
      },
    ],
    reproductionRecords: [
      {
        id: 'rep_1',
        heatDate: '2024-05-02',
        inseminationDate: '2024-05-03',
        pregnancyCheckedDate: '2024-07-15',
        isPregnant: true,
        expectedCalvingDate: '2025-02-10',
        notes: 'Inseminated with Pure Sahiwal Bull Semen (Chak 5/11L stud)',
      },
    ],
    feedingNotes: '35 kg Green Berseem + 4 kg Wheat Straw + 6 kg Dairy Wanda 18% CP daily.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-31T00:00:00Z',
  },
  {
    id: 'animal_heer_02',
    name: 'Heer (ہیر)',
    tagNumber: 'PK-OKR-109',
    species: 'Buffalo',
    breed: 'Nili-Ravi Buffalo',
    gender: 'female',
    dobOrAge: '5 Years (چھگی)',
    photos: [
      'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
    ],
    purchasePrice: 480000,
    currentEstimatedValue: 550000,
    weightRecords: [
      { date: '2024-02-01', weightKg: 580, notes: 'Good dairy flesh' },
      { date: '2024-07-20', weightKg: 610, notes: 'Mid lactation' },
    ],
    milkRecords: [
      { date: '2024-10-25', morningLiters: 9.5, eveningLiters: 8.5, totalLiters: 18.0 },
      { date: '2024-10-26', morningLiters: 9.8, eveningLiters: 8.4, totalLiters: 18.2 },
      { date: '2024-10-27', morningLiters: 9.6, eveningLiters: 8.7, totalLiters: 18.3 },
      { date: '2024-10-28', morningLiters: 10.0, eveningLiters: 8.5, totalLiters: 18.5 },
      { date: '2024-10-29', morningLiters: 9.7, eveningLiters: 8.6, totalLiters: 18.3 },
      { date: '2024-10-30', morningLiters: 10.1, eveningLiters: 8.9, totalLiters: 19.0 },
      { date: '2024-10-31', morningLiters: 10.0, eveningLiters: 8.8, totalLiters: 18.8 },
    ],
    healthHistory: [],
    vaccinationRecords: [
      {
        id: 'vac_3',
        vaccineName: 'HS Oil Adjuvant Vaccine',
        dateAdministered: '2024-05-10',
        nextDueDate: '2024-11-10',
        administeredBy: 'Dr. Kashif',
      },
    ],
    reproductionRecords: [],
    feedingNotes: '55 kg chopped green maize silage, 5 kg bhoosa, 8 kg balanced wanda.',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-10-31T00:00:00Z',
  },
  {
    id: 'animal_sultan_03',
    name: 'Sultan (سلطان)',
    tagNumber: 'PK-SGD-77',
    species: 'Sheep',
    breed: 'Kajli Sheep',
    gender: 'male',
    dobOrAge: '2.5 Years (دوندہ)',
    photos: [
      'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
    ],
    purchasePrice: 120000,
    currentEstimatedValue: 240000,
    weightRecords: [
      { date: '2024-01-01', weightKg: 62 },
      { date: '2024-05-01', weightKg: 78 },
      { date: '2024-10-01', weightKg: 89, notes: 'Heavy Qurbani show condition' },
    ],
    milkRecords: [],
    healthHistory: [],
    vaccinationRecords: [
      {
        id: 'vac_4',
        vaccineName: 'ETV (Enterotoxemia) Vaccine',
        dateAdministered: '2024-03-20',
        nextDueDate: '2024-09-20',
        administeredBy: 'Civil Vet Hospital Sargodha',
      },
    ],
    reproductionRecords: [],
    feedingNotes: 'High protein crushed gram, crushed barley, desi ghee drench monthly, green Lucerne.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-31T00:00:00Z',
  },
];

export const AnimalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animals, setAnimals] = useState<AnimalProfile[]>(() => {
    const saved = localStorage.getItem(ANIMALS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_HERD;
      }
    }
    return DEFAULT_HERD;
  });

  useEffect(() => {
    localStorage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify(animals));
  }, [animals]);

  const addAnimal = (data: Omit<AnimalProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAnimal: AnimalProfile = {
      ...data,
      id: 'animal_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAnimals((prev) => [newAnimal, ...prev]);
    return newAnimal;
  };

  const updateAnimal = (id: string, updates: Partial<AnimalProfile>) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  };

  const deleteAnimal = (id: string) => {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
  };

  const getAnimalById = (id: string) => {
    return animals.find((a) => a.id === id);
  };

  const addMilkRecord = (animalId: string, morningLiters: number, eveningLiters: number) => {
    const today = new Date().toISOString().split('T')[0];
    const total = morningLiters + eveningLiters;
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        const existing = a.milkRecords.filter((r) => r.date !== today);
        return {
          ...a,
          milkRecords: [...existing, { date: today, morningLiters, eveningLiters, totalLiters: total }],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addWeightRecord = (animalId: string, weightKg: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        return {
          ...a,
          weightRecords: [...a.weightRecords, { date: today, weightKg, notes }],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addVaccinationRecord = (
    animalId: string,
    record: { vaccineName: string; dateAdministered: string; nextDueDate: string; administeredBy?: string }
  ) => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        return {
          ...a,
          vaccinationRecords: [
            ...a.vaccinationRecords,
            { ...record, id: 'vac_' + Date.now() },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addHealthRecord = (
    animalId: string,
    record: { condition: string; symptoms: string; treatment: string; veterinarian?: string; resolved: boolean }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        return {
          ...a,
          healthHistory: [
            ...a.healthHistory,
            { ...record, id: 'hh_' + Date.now(), date: today },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  return (
    <AnimalContext.Provider
      value={{
        animals,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        getAnimalById,
        addMilkRecord,
        addWeightRecord,
        addVaccinationRecord,
        addHealthRecord,
      }}
    >
      {children}
    </AnimalContext.Provider>
  );
};

export const useAnimals = () => {
  const context = useContext(AnimalContext);
  if (!context) {
    throw new Error('useAnimals must be used within an AnimalProvider');
  }
  return context;
};
