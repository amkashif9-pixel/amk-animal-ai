import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { useAnimals } from '../../context/AnimalContext';
import { AnimalProfile } from '../../types/animal';
import { ALL_SPECIES } from '../../data/speciesData';
import {
  FolderHeart,
  Plus,
  Trash2,
  Edit3,
  Printer,
  Calendar,
  Scale,
  Activity,
  Milk,
  Baby,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign,
  Tag,
  Syringe,
  CheckCircle,
  Beef,
} from 'lucide-react';

interface AnimalListProps {
  onNavigateToMeatYield?: (species: string, breed?: string, weightKg?: number) => void;
}

export const AnimalList: React.FC<AnimalListProps> = ({ onNavigateToMeatYield }) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const {
    animals,
    addAnimal,
    deleteAnimal,
    addMilkRecord,
    addWeightRecord,
    addVaccinationRecord,
  } = useAnimals();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'milk' | 'weight' | 'health' | 'reproduction'>('overview');

  // Quick Milk Log State
  const [quickMorningMilk, setQuickMorningMilk] = useState<number>(8.5);
  const [quickEveningMilk, setQuickEveningMilk] = useState<number>(7.0);

  // Quick Weight Log State
  const [quickWeightKg, setQuickWeightKg] = useState<number>(420);
  const [quickWeightNote, setQuickWeightNote] = useState<string>('');

  // Add Animal Modal State
  const [formName, setFormName] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formSpecies, setFormSpecies] = useState('Cow');
  const [formBreed, setFormBreed] = useState('Sahiwal');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'castrated'>('female');
  const [formAge, setFormAge] = useState('3 Years');
  const [formPrice, setFormPrice] = useState<number>(350000);
  const [formValue, setFormValue] = useState<number>(420000);
  const [formPhoto, setFormPhoto] = useState('');
  const [formFeeding, setFormFeeding] = useState('');

  const currentAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

  const handleAddAnimalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addAnimal({
      name: formName,
      tagNumber: formTag,
      species: formSpecies,
      breed: formBreed,
      gender: formGender,
      dobOrAge: formAge,
      purchasePrice: formPrice,
      currentEstimatedValue: formValue,
      photos: formPhoto
        ? [formPhoto]
        : ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      weightRecords: [{ date: new Date().toISOString().split('T')[0], weightKg: 400 }],
      milkRecords: [],
      healthHistory: [],
      vaccinationRecords: [],
      reproductionRecords: [],
      feedingNotes: formFeeding,
    });
    setSelectedAnimalId(created.id);
    setShowAddModal(false);
    setFormName('');
    setFormTag('');
  };

  const handleQuickAddMilk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnimal) return;
    addMilkRecord(currentAnimal.id, quickMorningMilk, quickEveningMilk);
  };

  const handleQuickAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnimal) return;
    addWeightRecord(currentAnimal.id, quickWeightKg, quickWeightNote);
    setQuickWeightNote('');
  };

  const handlePrintPassport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-2">
            <FolderHeart className="w-4 h-4 text-brand-600" />
            <span>{isUrdu ? 'ڈیجیٹل فارم و ریوڑ مینجمنٹ' : 'Digital Livestock Passport & Registry'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.profiles.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.profiles.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.profiles.addAnimal}</span>
          </button>
        </div>
      </div>

      {animals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <FolderHeart className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {isUrdu ? 'کوئی جانور رجسٹرڈ نہیں ہے' : 'No Animals Registered'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">{t.profiles.noAnimals}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            {t.profiles.addAnimal}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Animals List Strip */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isUrdu ? `رجسٹرڈ مویشی (${animals.length})` : `Registered Herd (${animals.length})`}
            </h4>

            <div className="space-y-2.5">
              {animals.map((anim) => {
                const isSelected = anim.id === currentAnimal?.id;
                return (
                  <div
                    key={anim.id}
                    onClick={() => setSelectedAnimalId(anim.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 bg-white shadow-xs ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={anim.photos[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80'}
                      alt={anim.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-extrabold text-slate-900 truncate">
                          {anim.name}
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {anim.gender}
                        </span>
                      </div>
                      <span className="text-xs text-brand-700 font-semibold block truncate">
                        {anim.breed} • {anim.species}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Tag: {anim.tagNumber || 'N/A'} • {anim.dobOrAge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Passport Dossier */}
          {currentAnimal && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src={currentAnimal.photos[0]}
                    alt={currentAnimal.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-md flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-[10px] font-bold uppercase">
                        {currentAnimal.species}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Tag: #{currentAnimal.tagNumber || 'SWL-042'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {currentAnimal.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {currentAnimal.breed} • {currentAnimal.dobOrAge} • {currentAnimal.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToMeatYield && (
                    <button
                      onClick={() => {
                        const latestWeight = currentAnimal.weightRecords.length > 0
                          ? currentAnimal.weightRecords[currentAnimal.weightRecords.length - 1].weightKg
                          : 400;
                        onNavigateToMeatYield(currentAnimal.species, currentAnimal.breed, latestWeight);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition"
                      title="Estimate Meat Yield"
                    >
                      <Beef className="w-4 h-4 text-emerald-600" />
                      <span>{isUrdu ? 'گوشت تخمینہ' : 'Meat Yield'}</span>
                    </button>
                  )}

                  <button
                    onClick={handlePrintPassport}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Print Medical Passport"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.profiles.exportPassport}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(t.profiles.confirmDelete)) {
                        deleteAnimal(currentAnimal.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title={t.profiles.deleteAnimal}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Overview, Milk Chart, Weight Chart, Health History */}
              <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'overview', label: isUrdu ? 'تفصیل و عمومی معلومات' : 'Overview & Financials' },
                  { id: 'milk', label: isUrdu ? 'روزانہ دودھ کی پیداوار' : 'Daily Milk Log' },
                  { id: 'weight', label: isUrdu ? 'وزن میں اضافہ' : 'Weight Trend' },
                  { id: 'health', label: isUrdu ? 'طبی تاریخ و ویکسین' : 'Health & Vaccines' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl transition ${
                      activeTab === tab.id
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Financials & Valuations */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        {t.profiles.purchasePrice}
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        PKR {currentAnimal.purchasePrice?.toLocaleString() || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                        {t.profiles.currentValue}
                      </span>
                      <span className="text-sm font-black text-emerald-800">
                        PKR {currentAnimal.currentEstimatedValue?.toLocaleString() || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        {isUrdu ? 'آخری ماپا گیا وزن' : 'Latest Weight'}
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {currentAnimal.weightRecords.length > 0
                          ? `${currentAnimal.weightRecords[currentAnimal.weightRecords.length - 1].weightKg} kg`
                          : '410 kg'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        {isUrdu ? 'اوسط دودھ' : 'Avg Milk'}
                      </span>
                      <span className="text-sm font-black text-brand-700">
                        {currentAnimal.milkRecords.length > 0
                          ? `${currentAnimal.milkRecords[currentAnimal.milkRecords.length - 1].totalLiters} L/day`
                          : '15.5 L/day'}
                      </span>
                    </div>
                  </div>

                  {/* Feeding Notes */}
                  {currentAnimal.feedingNotes && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {isUrdu ? 'مقررہ خوراک اور راشن' : 'Daily Feeding Ration'}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {currentAnimal.feedingNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MILK LOG */}
              {activeTab === 'milk' && (
                <div className="space-y-6">
                  {/* Quick Add Milk Record Bar */}
                  <form
                    onSubmit={handleQuickAddMilk}
                    className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-bold text-brand-950 flex items-center gap-1.5">
                      <Milk className="w-4 h-4 text-brand-600" />
                      <span>{isUrdu ? 'آج کا دودھ درج کریں:' : 'Log Today’s Milk Yield:'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="text-slate-600 font-semibold">{isUrdu ? 'صبح (L):' : 'AM (L):'}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={quickMorningMilk}
                        onChange={(e) => setQuickMorningMilk(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-slate-600 font-semibold">{isUrdu ? 'شام (L):' : 'PM (L):'}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={quickEveningMilk}
                        onChange={(e) => setQuickEveningMilk(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
                    >
                      {isUrdu ? 'محفوظ کریں' : 'Save Record'}
                    </button>
                  </form>

                  {/* Milk Yield Table / Chart Visualizer */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 flex justify-between uppercase tracking-wider text-[11px]">
                      <span>{isUrdu ? 'تاریخ' : 'Date'}</span>
                      <span>{isUrdu ? 'صبح' : 'Morning (AM)'}</span>
                      <span>{isUrdu ? 'شام' : 'Evening (PM)'}</span>
                      <span className="text-brand-700">{isUrdu ? 'کل پیداوار' : 'Total Liters'}</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {currentAnimal.milkRecords.map((r, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center text-slate-700 font-medium">
                          <span>{r.date}</span>
                          <span>{r.morningLiters} L</span>
                          <span>{r.eveningLiters} L</span>
                          <span className="font-extrabold text-brand-700">{r.totalLiters} Liters</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WEIGHT LOG */}
              {activeTab === 'weight' && (
                <div className="space-y-6">
                  {/* Quick Add Weight Form */}
                  <form
                    onSubmit={handleQuickAddWeight}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-brand-600" />
                      <span>{isUrdu ? 'نیا وزن درج کریں (kg):' : 'Log New Weight (kg):'}</span>
                    </span>

                    <input
                      type="number"
                      value={quickWeightKg}
                      onChange={(e) => setQuickWeightKg(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold"
                    />

                    <input
                      type="text"
                      placeholder={isUrdu ? 'نوٹ (مثلاً: چارے کے بعد)' : 'Note (e.g. Post weaning)'}
                      value={quickWeightNote}
                      onChange={(e) => setQuickWeightNote(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs flex-1 min-w-[140px]"
                    />

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
                    >
                      {isUrdu ? 'محفوظ کریں' : 'Save'}
                    </button>
                  </form>

                  {/* Meat Yield Estimator Callout */}
                  {onNavigateToMeatYield && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                          <Beef className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-emerald-950 block">
                            {isUrdu ? 'گوشت کی پیداوار اور تخمینہ لاگت' : 'Commercial Meat Yield & Carcass Analysis'}
                          </span>
                          <span className="text-[11px] text-emerald-700">
                            {isUrdu
                              ? 'اس جانور کے حالیہ ریکارڈ شدہ وزن کی بنیاد پر ڈریسنگ اور گوشت کا حساب لگائیں'
                              : 'Estimate dressing percentage, boneless meat, and butcher margins for this animal'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const latestWeight = currentAnimal.weightRecords.length > 0
                            ? currentAnimal.weightRecords[currentAnimal.weightRecords.length - 1].weightKg
                            : 400;
                          onNavigateToMeatYield(currentAnimal.species, currentAnimal.breed, latestWeight);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap transition shadow-xs"
                      >
                        {isUrdu ? 'تخمینہ شروع کریں' : 'Calculate Yield'}
                      </button>
                    </div>
                  )}

                  {/* Weight Log Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 flex justify-between uppercase tracking-wider text-[11px]">
                      <span>{isUrdu ? 'تاریخ' : 'Date'}</span>
                      <span>{isUrdu ? 'وزن' : 'Bodyweight (kg)'}</span>
                      <span>{isUrdu ? 'تفصیل / نوٹ' : 'Observation Notes'}</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {currentAnimal.weightRecords.map((w, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center text-slate-700 font-medium">
                          <span>{w.date}</span>
                          <span className="font-bold text-slate-900">{w.weightKg} kg</span>
                          <span className="text-slate-500 italic">{w.notes || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HEALTH & VACCINES */}
              {activeTab === 'health' && (
                <div className="space-y-6">
                  {/* Vaccinations Section */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Syringe className="w-4 h-4 text-emerald-600" />
                      <span>{t.profiles.vaccineHistory}</span>
                    </h5>

                    <div className="space-y-2">
                      {currentAnimal.vaccinationRecords.map((vac) => (
                        <div
                          key={vac.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{vac.vaccineName}</span>
                            <span className="text-[11px] text-slate-500">
                              Administered: {vac.dateAdministered} • Batch: {vac.batchNumber || 'N/A'}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                            Due: {vac.nextDueDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Health History */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-600" />
                      <span>{t.profiles.healthHistory}</span>
                    </h5>

                    {currentAnimal.healthHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        {isUrdu ? 'کوئی سابقہ بیماری رجسٹرڈ نہیں ہے۔' : 'No previous illness or clinical incidents recorded.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {currentAnimal.healthHistory.map((hh) => (
                          <div key={hh.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-900">{hh.condition}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                {hh.resolved ? 'Resolved' : 'Under Treatment'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">
                              Treatment: {hh.treatment} (Dr: {hh.veterinarian})
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Animal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {t.profiles.addAnimal}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAnimalSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.animalName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rani, Moti, Sultan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.tagNumber}
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="e.g. PK-SWL-042"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.species}
                  </label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Cow">Cow (گائے)</option>
                    <option value="Buffalo">Buffalo (بھینس)</option>
                    <option value="Goat">Goat (بکری)</option>
                    <option value="Sheep">Sheep (بھیڑ)</option>
                    <option value="Bull">Bull (بیل)</option>
                    <option value="Poultry">Poultry (مرغی)</option>
                    <option value="Dog">Dog (کتا)</option>
                    <option value="Horse">Horse (گھوڑا)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.breed}
                  </label>
                  <input
                    type="text"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    placeholder="e.g. Sahiwal Cow"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.gender}
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="female">Female (مادہ)</option>
                    <option value="male">Male (نر)</option>
                    <option value="castrated">Castrated (کھسی)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.dobOrAge}
                  </label>
                  <input
                    type="text"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="e.g. 3 Years (دوندہ)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.purchasePrice} (PKR)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {t.profiles.currentValue} (PKR)
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'تصویر کا لنک (URL)' : 'Photo URL (Optional)'}
                </label>
                <input
                  type="text"
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {isUrdu ? 'خوراک کی تفصیل / راشن' : 'Feeding Ration'}
                </label>
                <textarea
                  rows={2}
                  value={formFeeding}
                  onChange={(e) => setFormFeeding(e.target.value)}
                  placeholder="e.g. 35 kg berseem, 5 kg wanda daily..."
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
                  {isUrdu ? 'جانور رجسٹر کریں' : 'Register Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
