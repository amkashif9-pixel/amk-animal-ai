import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { useAnimals } from '../../context/AnimalContext';
import { CalendarReminder, EventCategory } from '../../types/calendar';
import { VACCINE_PROTOCOLS, GESTATION_DAYS } from '../../data/vaccineData';
import {
  Calendar,
  Syringe,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Bell,
  Heart,
  Baby,
  Filter,
  Check,
  Trash2,
} from 'lucide-react';

interface VaccinationCalendarProps {
  initialFilter?: string;
}

export const VaccinationCalendar: React.FC<VaccinationCalendarProps> = ({ initialFilter }) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { animals } = useAnimals();

  // Local reminders state
  const [reminders, setReminders] = useState<CalendarReminder[]>([
    {
      id: 'rem_1',
      animalId: 'animal_rani_01',
      animalName: 'Rani (رانی)',
      titleEn: 'FMD Trivalent Autumn Booster Vaccination',
      titleUr: 'منہ کھر (FMD) خزاں بوسٹر ویکسینیشن',
      category: 'vaccination',
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      alertDaysBefore: 3,
      notesEn: 'Inject subcutaneously in neck fold (5ml). Keep vaccine chilled in ice pack.',
      notesUr: 'گردن کی جلد کے نیچے 5 ملی لیٹر ٹیکہ لگائیں۔ ویکسین کو برف میں ٹھنڈا رکھیں۔',
    },
    {
      id: 'rem_2',
      animalId: 'animal_heer_02',
      animalName: 'Heer (ہیر)',
      titleEn: 'HS (گل گھوٹو) Oil Adjuvant Pre-Winter Dose',
      titleUr: 'گل گھوٹو (HS) سرمائی حفاظتی ٹیکہ',
      category: 'vaccination',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      alertDaysBefore: 5,
    },
    {
      id: 'rem_3',
      animalId: 'animal_sultan_03',
      animalName: 'Sultan (سلطان)',
      titleEn: 'Albendazole Deworming Protocol for Sheep',
      titleUr: 'پیٹ کے کیڑوں کی دوا (ڈی ورمنگ البینڈازول)',
      category: 'deworming',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
      alertDaysBefore: 2,
    },
    {
      id: 'rem_4',
      animalId: 'animal_rani_01',
      animalName: 'Rani (رانی)',
      titleEn: 'Expected Calving Date (بچے کی پیدائش)',
      titleUr: 'بچے کی متوقع پیدائش (ڈیلیوری)',
      category: 'gestation',
      dueDate: '2025-02-10',
      isCompleted: false,
      alertDaysBefore: 7,
      notesEn: 'Prepare clean straw bedded maternity stall 10 days in advance.',
      notesUr: 'پیدائش سے دس دن قبل الگ صاف ستھرا ہوادار کمرہ تیار رکھیں۔',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newAnimalId, setNewAnimalId] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('vaccination');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (initialFilter && initialFilter.trim()) {
      setNewTitle(initialFilter);
      setShowAddModal(true);
    }
  }, [initialFilter]);

  // Gestation Calculator state
  const [gestationSpecies, setGestationSpecies] = useState('cow');
  const [breedingDate, setBreedingDate] = useState(new Date().toISOString().split('T')[0]);

  // Gestation Calculation
  const gestationDays = GESTATION_DAYS[gestationSpecies] || 283;
  const calcExpectedDate = () => {
    const d = new Date(breedingDate);
    d.setDate(d.getDate() + gestationDays);
    return d.toISOString().split('T')[0];
  };

  const handleToggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted, completedAt: !r.isCompleted ? new Date().toISOString() : undefined } : r
      )
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedAnimal = animals.find((a) => a.id === newAnimalId);
    const item: CalendarReminder = {
      id: 'rem_' + Date.now(),
      animalId: newAnimalId || undefined,
      animalName: matchedAnimal?.name || undefined,
      titleEn: newTitle,
      titleUr: newTitle,
      category: newCategory,
      dueDate: newDueDate,
      notesEn: newNotes,
      notesUr: newNotes,
      isCompleted: false,
      alertDaysBefore: 3,
    };
    setReminders((prev) => [item, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewNotes('');
  };

  const filteredReminders =
    activeCategory === 'all' ? reminders : reminders.filter((r) => r.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-3">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>{isUrdu ? 'ویکسینیشن اور فارم کیئر ٹریکر' : 'Immunization & Health Event Scheduler'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.calendar.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.calendar.subtitle}
        </p>
      </div>

      {/* Top Action Bar: Filters + Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          {[
            { id: 'all', label: t.calendar.allCategories },
            { id: 'vaccination', label: t.calendar.vaccinations },
            { id: 'deworming', label: t.calendar.deworming },
            { id: 'gestation', label: t.calendar.gestation },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.calendar.addReminder}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reminders List */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            <span>{t.calendar.upcomingEvents} ({filteredReminders.length})</span>
          </h4>

          {filteredReminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {isUrdu ? 'اس کیٹیگری میں کوئی شیڈول ایونٹ باقی نہیں ہے۔' : 'No scheduled reminders in this category.'}
              </p>
            </div>
          ) : (
            filteredReminders.map((rem) => {
              const isVaccine = rem.category === 'vaccination';
              const isGestation = rem.category === 'gestation';
              const isDeworming = rem.category === 'deworming';

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 bg-white shadow-xs ${
                    rem.isCompleted
                      ? 'border-slate-200 opacity-60'
                      : isVaccine
                      ? 'border-emerald-200 hover:border-emerald-400'
                      : isGestation
                      ? 'border-pink-200 hover:border-pink-400'
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  {/* Complete checkbox button */}
                  <button
                    onClick={() => handleToggleComplete(rem.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 ${
                      rem.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 text-transparent hover:text-slate-300'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isVaccine
                            ? 'bg-emerald-50 text-emerald-800'
                            : isGestation
                            ? 'bg-pink-50 text-pink-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {rem.category}
                      </span>
                      {rem.animalName && (
                        <span className="text-xs font-extrabold text-slate-800">
                          {rem.animalName}
                        </span>
                      )}
                    </div>

                    <h5
                      className={`text-sm font-bold text-slate-900 ${
                        rem.isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {isUrdu ? rem.titleUr : rem.titleEn}
                    </h5>

                    {rem.notesEn && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {isUrdu ? rem.notesUr : rem.notesEn}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-600 font-bold">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span>{t.calendar.dueDate}: {rem.dueDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Gestation Calculator + Protocol Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gestation Calculator Tool */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Baby className="w-5 h-5 text-pink-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t.calendar.gestationTitle}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isUrdu ? 'مادہ جانور کی نوع' : 'Female Animal Species'}
                </label>
                <select
                  value={gestationSpecies}
                  onChange={(e) => setGestationSpecies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="cow">Cow / گائے (283 days)</option>
                  <option value="buffalo">Buffalo / بھینس (310 days)</option>
                  <option value="goat">Goat / بکری (150 days)</option>
                  <option value="sheep">Sheep / بھیڑ (148 days)</option>
                  <option value="camel">Camel / اونٹنی (390 days)</option>
                  <option value="horse">Mare / گھوڑی (340 days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.calendar.serviceDate}
                </label>
                <input
                  type="date"
                  value={breedingDate}
                  onChange={(e) => setBreedingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 text-pink-950 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-800 block">
                  {t.calendar.expectedDate}
                </span>
                <span className="text-xl font-black text-pink-900 block">
                  {calcExpectedDate()}
                </span>
                <span className="text-[10px] text-pink-700 font-medium">
                  {isUrdu
                    ? `حمل کا اوسط دورانیہ: ${gestationDays} دن`
                    : `Average Gestation Length: ${gestationDays} days`}
                </span>
              </div>
            </div>
          </div>

          {/* Pakistan & Regional Vaccine Protocols Reference */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'مستند سرکاری ویکسینیشن شیڈول' : 'Standard Immunization Schedule'}</span>
            </h4>

            <div className="space-y-2 text-xs">
              {VACCINE_PROTOCOLS.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{isUrdu ? p.diseaseUr : p.diseaseEn}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {isUrdu ? p.frequencyUr : p.frequencyEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isUrdu ? p.recommendedMonthUr : p.recommendedMonthEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {t.calendar.addReminder}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'عنوان / یاد دہانی' : 'Reminder Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. HS Annual Booster Shot"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'متعلقہ جانور (اختیاری)' : 'Associated Animal (Optional)'}
                </label>
                <select
                  value={newAnimalId}
                  onChange={(e) => setNewAnimalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">{isUrdu ? 'پورے ریوڑ کے لیے' : 'Whole Herd / General'}</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {isUrdu ? 'کیٹیگری' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="vaccination">{t.calendar.vaccinations}</option>
                    <option value="deworming">{t.calendar.deworming}</option>
                    <option value="health_check">{t.calendar.healthChecks}</option>
                    <option value="gestation">{t.calendar.gestation}</option>
                    <option value="vet_appointment">{t.calendar.appointments}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.calendar.dueDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'اضافی نوٹس' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Dosage or veterinarian name..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
