import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { useAnimals } from '../../context/AnimalContext';
import { useAuth } from '../../context/AuthContext';
import {
  HealthAssessmentInput,
  HealthAssessmentResult,
  UploadedHealthMedia,
  MediaViewType,
  PossibleDisease,
  TraditionalRemedy,
  ModernMedicine,
} from '../../types/health';
import { triageAnimalHealth } from '../../services/aiService';
import {
  saveDiseaseAssessment,
  getUserDiseaseAssessments,
  updateDiseaseAssessmentOutcome,
} from '../../services/diseaseService';
import {
  formatSafeWithdrawalStatement,
  verifyRvmpLicense,
} from '../../data/modernMedicinesData';
import { extractVideoFrames } from '../../services/videoService';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Thermometer,
  Clock,
  HeartPulse,
  Stethoscope,
  Info,
  CheckCircle,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Printer,
  AlertOctagon,
  Upload,
  Camera,
  Film,
  X,
  FileCheck2,
  Syringe,
  MessageSquareText,
  Pill,
  ShieldCheck,
  ChevronRight,
  Eye,
  History,
  FileText,
  Scale,
  Baby,
  Beaker,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';

interface HealthAssistantProps {
  initialSpecies?: string;
  initialBreed?: string;
  initialMedia?: string[];
  onNavigateToVet?: () => void;
  onNavigateToChat?: (caseSummary: string) => void;
  onNavigateToCalendar?: (vaccineName?: string) => void;
  onNavigateToProfiles?: () => void;
}

export const HealthAssistant: React.FC<HealthAssistantProps> = ({
  initialSpecies = 'Cow',
  initialBreed = '',
  initialMedia = [],
  onNavigateToVet,
  onNavigateToChat,
  onNavigateToCalendar,
  onNavigateToProfiles,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { animals, addHealthRecord } = useAnimals();
  const { user } = useAuth();

  // Clinical Mode & Veterinary Licensing Gate (Farmer Mode vs Vet Mode)
  const isUserAuthenticatedVet = user?.role === 'veterinarian';
  const [clinicalMode, setClinicalMode] = useState<'farmer' | 'vet'>('farmer');
  const [verifiedRvmpLicense, setVerifiedRvmpLicense] = useState<string | null>(() => {
    return user?.role === 'veterinarian' ? 'PVMC-VERIFIED-ACCOUNT' : null;
  });
  const [showRvmpModal, setShowRvmpModal] = useState<boolean>(false);
  const [pvmcInput, setPvmcInput] = useState<string>('');
  const [pvmcDeclarationChecked, setPvmcDeclarationChecked] = useState<boolean>(false);
  const [pvmcError, setPvmcError] = useState<string>('');

  // Sync authenticated veterinarian status
  useEffect(() => {
    if (user?.role === 'veterinarian' && !verifiedRvmpLicense) {
      setVerifiedRvmpLicense('PVMC-VERIFIED-ACCOUNT');
    }
  }, [user?.role]);

  // Primary Demographics
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [species, setSpecies] = useState(initialSpecies);
  const [breed, setBreed] = useState(initialBreed);
  const [age, setAge] = useState('3 Years');
  const [gender, setGender] = useState('Female');
  const [weightKg, setWeightKg] = useState<number | undefined>(400);
  const [temperatureF, setTemperatureF] = useState<number | undefined>(undefined);
  const [durationDays, setDurationDays] = useState<number>(2);
  const [symptomSeverity, setSymptomSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');

  // Reproductive & Production Status
  const [isPregnant, setIsPregnant] = useState(false);
  const [pregnancyTrimester, setPregnancyTrimester] = useState<'first' | 'second' | 'third'>('second');
  const [isLactating, setIsLactating] = useState(true);
  const [isFoodProducing, setIsFoodProducing] = useState(true);

  // Vitals & Physiological Behavioral Shifts
  const [feedingDrinking, setFeedingDrinking] = useState<'normal' | 'reduced' | 'stopped' | 'excessive'>('reduced');
  const [waterIntake, setWaterIntake] = useState<'normal' | 'increased' | 'decreased' | 'refusing'>('decreased');
  const [milkProductionChange, setMilkProductionChange] = useState<
    'not_applicable' | 'normal' | 'mild_drop' | 'severe_drop' | 'completely_stopped' | 'abnormal_clots_blood'
  >('mild_drop');

  // Systems Review
  const [breathingPattern, setBreathingPattern] = useState<
    'normal' | 'rapid_shallow' | 'labored_wheezing' | 'coughing' | 'open_mouth_gasping'
  >('normal');
  const [rumenDigestion, setRumenDigestion] = useState<
    'normal' | 'mild_bloat' | 'severe_distended_tympany' | 'impaction_hard_rumen' | 'colic_kicking_belly'
  >('normal');
  const [stoolCondition, setStoolCondition] = useState<
    'normal' | 'watery_diarrhea' | 'bloody_mucus' | 'black_tarry' | 'hard_dry_pellets' | 'no_defecation'
  >('normal');
  const [urineCondition, setUrineCondition] = useState<
    'normal' | 'red_coffee_colored' | 'strained_painful' | 'frequent_scanty' | 'no_urination'
  >('normal');
  const [movementGait, setMovementGait] = useState<
    'normal' | 'limping' | 'stiff_reluctant' | 'circling_head_pressing' | 'inability_to_stand'
  >('normal');

  // Medical History & Antecedents
  const [previousDiseases, setPreviousDiseases] = useState('');
  const [recentVaccinations, setRecentVaccinations] = useState('');
  const [recentMedications, setRecentMedications] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');

  // UI Accordion toggles
  const [showSystemsReview, setShowSystemsReview] = useState(false);
  const [showHistorySection, setShowHistorySection] = useState(false);

  // Media Upload State
  const [uploadedMedia, setUploadedMedia] = useState<UploadedHealthMedia[]>(() =>
    initialMedia.map((url, i) => ({
      id: `media_init_${i}`,
      dataUrl: url,
      type: 'image',
      viewType: i === 0 ? 'close_up_lesion' : 'full_body',
      name: `Scan Photo ${i + 1}`,
    }))
  );
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Analysis & Treatment UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthAssessmentResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [treatmentTab, setTreatmentTab] = useState<'traditional' | 'modern'>('traditional');
  const [activeTab, setActiveTab] = useState<'triage' | 'history'>('triage');
  const [pastAssessments, setPastAssessments] = useState<HealthAssessmentResult[]>([]);

  // Follow-Up Modal / Editor State
  const [selectedAssessmentForOutcome, setSelectedAssessmentForOutcome] = useState<HealthAssessmentResult | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<
    'pending' | 'recovered' | 'improving' | 'unchanged' | 'deteriorated' | 'referred_hospital'
  >('recovered');
  const [vetNameInput, setVetNameInput] = useState('');
  const [confirmedDiagInput, setConfirmedDiagInput] = useState('');
  const [outcomeNotesInput, setOutcomeNotesInput] = useState('');
  const [outcomeSaveSuccess, setOutcomeSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const loadPastAssessments = async () => {
    const list = await getUserDiseaseAssessments();
    setPastAssessments(list);
  };

  useEffect(() => {
    loadPastAssessments();
  }, []);

  // Supported species covering all 9 categories
  const speciesOptions = [
    { id: 'cow', nameEn: 'Cow / Cattle', nameUr: 'گائے / بیل', icon: '🐄' },
    { id: 'buffalo', nameEn: 'Buffalo', nameUr: 'بھینس / کٹا', icon: '🐃' },
    { id: 'goat', nameEn: 'Goat', nameUr: 'بکرا / بکری', icon: '🐐' },
    { id: 'sheep', nameEn: 'Sheep', nameUr: 'بھیڑ / چھترا', icon: '🐑' },
    { id: 'poultry', nameEn: 'Poultry / Chicken', nameUr: 'مرغی / پولٹری', icon: '🐔' },
    { id: 'horse', nameEn: 'Horse', nameUr: 'گھوڑا / گھوڑی', icon: '🐎' },
    { id: 'donkey', nameEn: 'Donkey / Mule', nameUr: 'گدھا / خچر', icon: '🫏' },
    { id: 'dog', nameEn: 'Dog', nameUr: 'کتا / پالتو کتا', icon: '🐕' },
    { id: 'cat', nameEn: 'Cat', nameUr: 'بلی / پالتو بلی', icon: '🐈' },
  ];

  // Clinical symptoms checklist
  const symptomOptions = [
    { id: 'fever', labelEn: 'High Fever / Shivering', labelUr: 'تیز بخار / کپکپاہٹ', isUrgent: false },
    { id: 'severe_breathing', labelEn: 'Severe Labored Breathing / Grunting (Emergency)', labelUr: 'سانس میں شدید تنگی / خر خر (ہنگامی)', isUrgent: true },
    { id: 'severe_bloat', labelEn: 'Severe Left Flank Bloat / Drum-tight Tympany (Emergency)', labelUr: 'شدید افارہ / پیٹ کا غبارے کی طرح پھولنا (ہنگامی)', isUrgent: true },
    { id: 'cannot_stand', labelEn: 'Inability to Stand / Recumbent Downer (Emergency)', labelUr: 'زمین پر گر جانا / کھڑے ہونے سے معذوری (ہنگامی)', isUrgent: true },
    { id: 'severe_bleeding', labelEn: 'Severe Bleeding / Deep Spurting Wound (Emergency)', labelUr: 'شدید خون کا بہنا / گہرا زخم (ہنگامی)', isUrgent: true },
    { id: 'suspected_poisoning', labelEn: 'Suspected Poisoning / Urea / Pesticides (Emergency)', labelUr: 'زہر خوری / یوریا کھاد / زہریلی بوٹی کا شبہ (ہنگامی)', isUrgent: true },
    { id: 'seizures_tremors', labelEn: 'Seizures, Convulsions & Tremors (Emergency)', labelUr: 'دورے، اعصابی جھٹکے اور کپکپاہٹ (ہنگامی)', isUrgent: true },
    { id: 'severe_dehydration', labelEn: 'Severe Dehydration / Sunken Eyes / Skin Tent >3s', labelUr: 'شدید پانی کی کمی / آنکھیں اندر دھنس جانا', isUrgent: true },
    { id: 'mouth_blisters_salivation', labelEn: 'Mouth Blisters / Profuse Salivation (FMD)', labelUr: 'منہ کے چھالے / لمبی رالیں بہنا (منہ کھر)', isUrgent: false },
    { id: 'hoof_lesions_lameness', labelEn: 'Foot Ulcers / Hoof Lesions / Lameness', labelUr: 'کھروں کے درمیان زخم / لنگڑاہٹ', isUrgent: false },
    { id: 'throat_swelling', labelEn: 'Throat & Brisket Swelling (HS / Pasteurella)', labelUr: 'گلے اور گردن کی سوجن (گل گھوٹو)', isUrgent: false },
    { id: 'mastitis_udder_swelling', labelEn: 'Swollen Hot Udder / Milk Clots (Mastitis / ساڑو)', labelUr: 'ہوانے پر سوجن / دودھ میں چھچھڑے (ساڑو)', isUrgent: false },
    { id: 'skin_nodules', labelEn: 'Firm Round Skin Nodules / Lumps (LSD)', labelUr: 'جلد پر گول سخت گانٹھیں (لمپی سکن)', isUrgent: false },
    { id: 'tick_infestation_lymph', labelEn: 'Tick Infestation & Swollen Neck Glands (Theileriosis)', labelUr: 'چیچڑ اور گردن کے غدود کی سوجن (تھیلیریوسس)', isUrgent: false },
    { id: 'post_calving_downer', labelEn: 'Recent Calving + Cold Ears (Milk Fever / Hypocalcemia)', labelUr: 'زچگی کے بعد ٹھنڈے کان اور گر جانا (سوتا بخار)', isUrgent: true },
    { id: 'maggot_wound', labelEn: 'Ulcerated Sore with Live Maggots (Myiasis)', labelUr: 'کاٹھی کا زخم اور کیڑے پڑنا (میگٹس)', isUrgent: false },
    { id: 'diarrhea_foul', labelEn: 'Profuse Watery or Bloody Diarrhea', labelUr: 'بدبودار پتلے یا خونی دست', isUrgent: false },
    { id: 'colic_kicking_belly', labelEn: 'Violent Rolling / Kicking at Flank (Equine Colic)', labelUr: 'زمین پر لوٹ پوٹ ہونا، پیٹ پر لاتیں مارنا (Colic)', isUrgent: true },
  ];

  const handleToggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId]
    );
  };

  // Image Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, viewType: MediaViewType) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - uploadedMedia.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newMedia: UploadedHealthMedia = {
            id: 'media_' + Date.now() + Math.random().toString(36).substring(2, 5),
            dataUrl: reader.result,
            type: 'image',
            viewType,
            name: file.name,
          };
          setUploadedMedia((prev) => [...prev, newMedia].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Video Upload & Keyframe Extraction
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.type.includes('webm')) {
      setMediaError(isUrdu ? 'صرف MP4 یا WebM ویڈیو منتخب کریں۔' : 'Only MP4 or WebM videos are supported.');
      return;
    }

    setIsProcessingVideo(true);
    setVideoProgress(15);
    setMediaError(null);

    try {
      setVideoProgress(40);
      const frames = await extractVideoFrames(file, 4);
      setVideoProgress(90);

      const newMediaItems: UploadedHealthMedia[] = frames.map((f, i) => ({
        id: 'media_v_' + Date.now() + '_' + i,
        dataUrl: f.dataUrl,
        type: 'video',
        viewType: 'video_clip',
        name: `Video Keyframe (${f.timestampSeconds.toFixed(1)}s)`,
        timestampSeconds: f.timestampSeconds,
      }));

      setUploadedMedia((prev) => [...prev, ...newMediaItems].slice(0, 4));
      setVideoProgress(100);
    } catch (err: any) {
      setMediaError(err?.message || (isUrdu ? 'ویڈیو فریم حاصل نہ ہو سکے۔' : 'Could not extract video frames.'));
    } finally {
      setIsProcessingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (id: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  // Perform AI Health Assessment
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setSavedSuccess(false);

    const assessmentInput: HealthAssessmentInput = {
      species,
      breed,
      age,
      gender,
      weightKg: weightKg && weightKg > 0 ? Number(weightKg) : undefined,
      temperatureF: temperatureF && temperatureF > 0 ? Number(temperatureF) : undefined,
      symptoms: selectedSymptoms,
      symptomSeverity,
      customDescription,
      feedingDrinkingBehavior: feedingDrinking,
      waterIntake,
      milkProductionChange,
      breathingPattern,
      rumenDigestion,
      stoolCondition,
      urineCondition,
      movementGait,
      previousDiseases,
      recentVaccinations,
      recentMedications,
      durationDays: Number(durationDays) || 1,
      isPregnant,
      pregnancyTrimester: isPregnant ? pregnancyTrimester : undefined,
      isLactating,
      isFoodProducing,
      mediaFiles: uploadedMedia,
      animalId: selectedAnimalId || undefined,
      animalName: selectedAnimalId ? animals.find((a) => a.id === selectedAnimalId)?.name : undefined,
    };

    try {
      const evaluation = await triageAnimalHealth(assessmentInput);
      setResult(evaluation);
    } catch (e: any) {
      console.error('Triage failure:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save to Database / Local Records
  const handleSaveAssessment = async () => {
    if (!result) return;
    const saveRes = await saveDiseaseAssessment(result);
    if (saveRes.success) {
      setSavedSuccess(true);
      loadPastAssessments();
      if (selectedAnimalId) {
        addHealthRecord(selectedAnimalId, {
          condition: result.primaryMatches[0]?.nameEn || 'Health Evaluation',
          symptoms: result.input.symptoms.join(', ') || result.input.customDescription || 'General malaise',
          treatment: `Risk: ${result.overallRiskLevel}. Primary suspect: ${result.primaryMatches[0]?.nameEn}`,
          veterinarian: 'AMK AI Decision Support',
          resolved: false,
        });
      }
    }
  };

  // Save Clinical Outcome / Follow-up
  const handleSaveOutcome = async () => {
    if (!selectedAssessmentForOutcome) return;
    const updateRes = await updateDiseaseAssessmentOutcome(selectedAssessmentForOutcome.id, {
      vetConfirmed: true,
      confirmedDiagnosis: confirmedDiagInput || selectedAssessmentForOutcome.primaryMatches[0]?.nameEn,
      confirmedByVetName: vetNameInput || 'Attending Field Veterinarian',
      treatmentOutcome: outcomeStatus,
      followUpNotes: outcomeNotesInput,
    });

    if (updateRes.success) {
      setOutcomeSaveSuccess(true);
      setTimeout(() => {
        setOutcomeSaveSuccess(false);
        setSelectedAssessmentForOutcome(null);
        loadPastAssessments();
      }, 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ویٹرنری فیصلہ سازی کا معاون نظام' : 'Veterinary Decision Support'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              v2.4 Production
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t.health.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t.health.subtitle}
          </p>
        </div>

        {/* Tab Switching: Triage vs Past Records */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'triage'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isUrdu ? 'نئی تشخیص و علامات' : 'Clinical Triage'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              loadPastAssessments();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isUrdu ? 'محفوظ کیس ہسٹری' : 'Case History'}</span>
            {pastAssessments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                {pastAssessments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mandatory Non-Diagnosis Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
            {t.health.disclaimerTitle}
          </h4>
          <p className="leading-relaxed">
            {t.health.disclaimerText}
          </p>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* ========================================================================= */
        /* MEDICAL CASE HISTORY & FOLLOW-UP OUTCOMES TAB                            */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {isUrdu ? 'محفوظ طبی کیس ریکارڈ اور فالو اپ' : 'Saved Medical Case History & Follow-Up'}
              </h3>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'پچھلے تمام ٹرائیج ریکارڈز، ویٹرنری ڈاکٹر کی تصدیق اور علاج کے حتمی نتائج کا باضابطہ ٹریکر'
                  : 'Complete historical veterinary records with clinical outcomes and attending vet verification'}
              </p>
            </div>
          </div>

          {pastAssessments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">{isUrdu ? 'کوئی محفوظ شدہ کیس ریکارڈ نہیں ملا۔' : 'No recorded case history yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastAssessments.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-brand-300 bg-slate-50/50 hover:bg-white transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {item.input.species} {item.input.breed ? `— ${item.input.breed}` : ''}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        item.overallRiskLevel === 'emergency'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : item.overallRiskLevel === 'severe'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.overallRiskLevel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong className="text-slate-800">{isUrdu ? 'تشخیص کا شبہ:' : 'Suspected Condition:'}</strong>{' '}
                      {item.primaryMatches[0]?.nameEn}
                    </p>
                    <p className="line-clamp-2 text-[11px] text-slate-500">
                      <strong>{isUrdu ? 'علامات:' : 'Symptoms:'}</strong> {item.input.symptoms.join(', ') || item.input.customDescription}
                    </p>
                  </div>

                  {/* Outcome Badge */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">{isUrdu ? 'نتیجہ:' : 'Outcome:'}</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-800 border border-brand-200">
                        {item.treatmentOutcome || 'pending'}
                      </span>
                      {item.vetConfirmed && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold">
                          <Check className="w-3 h-3" /> Vet Confirmed
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssessmentForOutcome(item);
                        setOutcomeStatus(item.treatmentOutcome || 'recovered');
                        setVetNameInput(item.confirmedByVetName || '');
                        setConfirmedDiagInput(item.confirmedDiagnosis || item.primaryMatches[0]?.nameEn || '');
                        setOutcomeNotesInput(item.followUpNotes || '');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition"
                    >
                      {isUrdu ? 'نتیجہ درج کریں' : 'Update Outcome'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outcome Update Modal / Sub-drawer */}
          {selectedAssessmentForOutcome && (
            <div className="p-6 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-700" />
                  <span>{isUrdu ? 'طبی فالو اپ اور ویٹرنری تصدیق کا اندراج' : 'Record Clinical Outcome & Vet Follow-Up'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentForOutcome(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isUrdu ? 'علاج کا نتیجہ (Outcome)' : 'Clinical Outcome'}
                  </label>
                  <select
                    value={outcomeStatus}
                    onChange={(e: any) => setOutcomeStatus(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  >
                    <option value="recovered">{t.health.outcomeRecovered}</option>
                    <option value="improving">{t.health.outcomeImproving}</option>
                    <option value="unchanged">{t.health.outcomeUnchanged}</option>
                    <option value="deteriorated">{t.health.outcomeDeteriorated}</option>
                    <option value="referred_hospital">{t.health.outcomeReferred}</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isUrdu ? 'معائنہ کار ڈاکٹر کا نام' : 'Attending Vet Name'}
                  </label>
                  <input
                    type="text"
                    value={vetNameInput}
                    onChange={(e) => setVetNameInput(e.target.value)}
                    placeholder="e.g. Dr. Aslam RVMP (UVAS)"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isUrdu ? 'ڈاکٹر کی حتمی تصدیق شدہ تشخیص' : 'Confirmed Diagnosis'}
                  </label>
                  <input
                    type="text"
                    value={confirmedDiagInput}
                    onChange={(e) => setConfirmedDiagInput(e.target.value)}
                    placeholder="e.g. Foot and Mouth Disease (Type O)"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 text-xs block mb-1">
                  {isUrdu ? 'فالو اپ نوٹس و ہدایات' : 'Follow-Up Clinical Notes'}
                </label>
                <textarea
                  rows={2}
                  value={outcomeNotesInput}
                  onChange={(e) => setOutcomeNotesInput(e.target.value)}
                  placeholder={isUrdu ? 'جانور نے کتنے دنوں میں کھانا پینا شروع کیا؟ دودھ کی واپسی کیسی رہی؟' : 'Notes on recovery duration, milk return, or complications...'}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveOutcome}
                  className="py-2 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{outcomeSaveSuccess ? (isUrdu ? 'محفوظ ہو گیا!' : 'Saved!') : t.health.saveOutcome}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* CLINICAL TRIAGE & SYMPTOM ASSESSMENT INPUT                                */
        /* ========================================================================= */
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                {isUrdu ? '1. تفصیلی طبی علامات و جانور کی معلومات' : '1. Detailed Symptom Assessment & Clinical Vitals'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isUrdu
                  ? 'درست تشخیص کے لیے جانور کی نوع، وزن، بخار، خوراک، پیشاب، پاخانہ اور اعصابی علامات کا درست اندراج کریں'
                  : 'Enter precise physiological vitals, system changes, and medical antecedents for accurate AI differential screening'}
              </p>
            </div>

            {/* A. Animal Species Grid */}
            <div>
              <label className="font-bold text-xs text-slate-700 block mb-2 uppercase tracking-wider">
                {t.health.speciesLabel}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {speciesOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSpecies(opt.nameEn.split(' ')[0])}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      species.toLowerCase().includes(opt.id)
                        ? 'border-brand-600 bg-brand-50/80 text-brand-900 font-extrabold shadow-xs ring-2 ring-brand-400/30'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-[11px] leading-tight">{isUrdu ? opt.nameUr : opt.nameEn.split('/')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* B. Core Demographics & Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.health.breedLabel}
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Sahiwal, Nili Ravi, Beetal, Desi"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>{t.health.weightLabel}</span>
                  <span className="text-[10px] text-brand-700 font-bold">* For Dosing</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightKg || ''}
                    onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 420"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <Scale className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>{t.health.temperatureLabel}</span>
                  <span className="text-[10px] text-slate-400">Normal ~101.5°F</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureF || ''}
                    onChange={(e) => setTemperatureF(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 104.5"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <Thermometer className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.health.durationDays}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value) || 1)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>

            {/* C. Pregnancy, Lactation, and Food Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t.health.isPregnant}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPregnant(true)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      isPregnant ? 'bg-brand-600 text-white border-brand-700' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isUrdu ? 'ہاں (حاملہ ہے)' : 'Yes (Pregnant)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPregnant(false)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      !isPregnant ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isUrdu ? 'نہیں' : 'No'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {t.health.isLactating}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLactating(true)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      isLactating ? 'bg-brand-600 text-white border-brand-700' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isUrdu ? 'ہاں (دودھ دے رہا ہے)' : 'Yes (Milking)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLactating(false)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                      !isLactating ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {isUrdu ? 'خشک / نہیں' : 'Dry / No'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {t.health.feedingDrinking}
                </label>
                <select
                  value={feedingDrinking}
                  onChange={(e: any) => setFeedingDrinking(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                >
                  <option value="normal">{t.health.normal}</option>
                  <option value="reduced">{t.health.reduced}</option>
                  <option value="stopped">{t.health.stopped}</option>
                  <option value="excessive">{t.health.excessive}</option>
                </select>
              </div>
            </div>

            {/* D. Accordion: Comprehensive System-by-System Review */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSystemsReview((prev) => !prev)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition"
              >
                <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-brand-600" />
                  <span>{t.health.systemsReviewTitle}</span>
                </span>
                {showSystemsReview ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showSystemsReview && (
                <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs animate-fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.breathingLabel}</label>
                    <select
                      value={breathingPattern}
                      onChange={(e: any) => setBreathingPattern(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="normal">{isUrdu ? 'نارمل سانس' : 'Normal Breathing'}</option>
                      <option value="rapid_shallow">{isUrdu ? 'تیز اور اتھلی سانس' : 'Rapid & Shallow'}</option>
                      <option value="labored_wheezing">{isUrdu ? 'سانس میں گھڑگھڑاہٹ / خر خر' : 'Labored / Wheezing'}</option>
                      <option value="coughing">{isUrdu ? 'خشک یا تر کھانسی' : 'Persistent Coughing'}</option>
                      <option value="open_mouth_gasping">{isUrdu ? 'منہ کھول کر ہانپنا (ایمرجنسی)' : 'Open-Mouth Gasping (Emergency)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.rumenLabel}</label>
                    <select
                      value={rumenDigestion}
                      onChange={(e: any) => setRumenDigestion(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="normal">{isUrdu ? 'معمول کی جگالی' : 'Normal Rumination'}</option>
                      <option value="mild_bloat">{isUrdu ? 'ہلکی گیس / افارہ' : 'Mild Gas / Tympany'}</option>
                      <option value="severe_distended_tympany">{isUrdu ? 'شدید ڈھول نما افارہ (ایمرجنسی)' : 'Severe Drum-Tight Bloat'}</option>
                      <option value="impaction_hard_rumen">{isUrdu ? 'سخت بند / امپیکشن' : 'Hard Rumen Impaction'}</option>
                      <option value="colic_kicking_belly">{isUrdu ? 'پیٹ پر لاتیں مارنا (Colic)' : 'Colic / Kicking Belly'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.stoolLabel}</label>
                    <select
                      value={stoolCondition}
                      onChange={(e: any) => setStoolCondition(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="normal">{isUrdu ? 'معمول کا گوبر / لید' : 'Normal Consistency'}</option>
                      <option value="watery_diarrhea">{isUrdu ? 'پانی کی طرح پتلے دست' : 'Watery Diarrhea'}</option>
                      <option value="bloody_mucus">{isUrdu ? 'خونی یا لیس دار دست' : 'Bloody Mucus / Dysentery'}</option>
                      <option value="black_tarry">{isUrdu ? 'سیاہ رنگ کا گوبر (خون کا اثر)' : 'Black Tarry Stool (Melena)'}</option>
                      <option value="hard_dry_pellets">{isUrdu ? 'سخت خشک مینگنیاں' : 'Hard Constipated Pellets'}</option>
                      <option value="no_defecation">{isUrdu ? 'گوبر بالکل بند ہے' : 'No Defecation (>24h)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.urineLabel}</label>
                    <select
                      value={urineCondition}
                      onChange={(e: any) => setUrineCondition(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="normal">{isUrdu ? 'صاف زرد پیشاب' : 'Normal Clear Yellow'}</option>
                      <option value="red_coffee_colored">{isUrdu ? 'سرخ یا کافی جیسا پیشاب' : 'Red / Coffee Colored (Hemoglobinuria)'}</option>
                      <option value="strained_painful">{isUrdu ? 'درد اور رک رک کر آنا' : 'Painful Straining (Stranguria)'}</option>
                      <option value="frequent_scanty">{isUrdu ? 'بار بار تھوڑا تھوڑا' : 'Frequent & Scanty'}</option>
                      <option value="no_urination">{isUrdu ? 'پیشاب بالکل رک گیا ہے' : 'Complete Anuria (No Urine)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.movementLabel}</label>
                    <select
                      value={movementGait}
                      onChange={(e: any) => setMovementGait(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="normal">{isUrdu ? 'نارمل چال ڈھال' : 'Normal Active Walking'}</option>
                      <option value="limping">{isUrdu ? 'لنگڑاہٹ / پاؤں میں درد' : 'Limping / Lameness'}</option>
                      <option value="stiff_reluctant">{isUrdu ? 'اکڑاؤ اور سخت جسم' : 'Stiff Gait / Sawhorse Stance'}</option>
                      <option value="circling_head_pressing">{isUrdu ? 'چکر کاٹنا / دیوار سے سر ٹکرانا' : 'Circling / Head Pressing'}</option>
                      <option value="inability_to_stand">{isUrdu ? 'گر جانا اور کھڑے نہ ہو پانا' : 'Downer / Recumbent'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.milkProductionLabel}</label>
                    <select
                      value={milkProductionChange}
                      onChange={(e: any) => setMilkProductionChange(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="not_applicable">{isUrdu ? 'لاگو نہیں ہوتا' : 'Not Applicable'}</option>
                      <option value="normal">{isUrdu ? 'معمول کی پیداوار' : 'Normal Production'}</option>
                      <option value="mild_drop">{isUrdu ? 'معمولی کمی (10-20%)' : 'Mild Drop (10-20%)'}</option>
                      <option value="severe_drop">{isUrdu ? 'شدید کمی (50% سے زیادہ)' : 'Severe Drop (>50%)'}</option>
                      <option value="completely_stopped">{isUrdu ? 'دودھ بالکل بند' : 'Completely Stopped'}</option>
                      <option value="abnormal_clots_blood">{isUrdu ? 'دودھ میں پھٹکیاں یا خون' : 'Clots, Flakes, or Blood'}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* E. Accordion: Previous History & Antecedents */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHistorySection((prev) => !prev)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition"
              >
                <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>{isUrdu ? 'سابقہ بیماریوں، حفاظتی ٹیکوں اور ادویات کی ہسٹری' : 'Previous Medical History, Vaccines & Past Drugs'}</span>
                </span>
                {showHistorySection ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showHistorySection && (
                <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.previousDiseasesLabel}</label>
                    <input
                      type="text"
                      value={previousDiseases}
                      onChange={(e) => setPreviousDiseases(e.target.value)}
                      placeholder="e.g. Mastitis 6 months ago"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.vaccinationsHistoryLabel}</label>
                    <input
                      type="text"
                      value={recentVaccinations}
                      onChange={(e) => setRecentVaccinations(e.target.value)}
                      placeholder="e.g. FMD vaccine 4 months ago"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t.health.medicationsHistoryLabel}</label>
                    <input
                      type="text"
                      value={recentMedications}
                      onChange={(e) => setRecentMedications(e.target.value)}
                      placeholder="e.g. Oxytetracycline 2 days ago"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* F. Clinical Symptoms Multi-Select Pills */}
            <div>
              <label className="font-bold text-xs text-slate-700 block mb-2 uppercase tracking-wider">
                {t.health.symptomSelector}
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => handleToggleSymptom(sym.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        isSelected
                          ? sym.isUrgent
                            ? 'bg-red-600 text-white border-red-700 shadow-xs'
                            : 'bg-brand-700 text-white border-brand-800 shadow-xs'
                          : sym.isUrgent
                          ? 'bg-red-50/70 text-red-800 border-red-200 hover:bg-red-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sym.isUrgent && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isUrdu ? sym.labelUr : sym.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* G. Free-Text Clinical Description */}
            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">
                {t.health.describeSymptoms}
              </label>
              <textarea
                rows={3}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder={t.health.describePlaceholder}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            {/* H. Multimodal Media Upload Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-600" />
                    <span>{t.health.uploadMediaTitle}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t.health.uploadMediaSubtitle}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-slate-500">{uploadedMedia.length}/4</span>
              </div>

              {/* Upload Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'close_up_lesion')}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploadedMedia.length >= 4}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-brand-600" />
                  <span>{t.health.uploadCloseUpBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={uploadedMedia.length >= 4}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>{t.health.uploadFullBodyBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={uploadedMedia.length >= 4 || isProcessingVideo}
                  onClick={() => videoInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Film className="w-4 h-4 text-purple-600" />
                  <span>{isProcessingVideo ? `Extracting... ${videoProgress}%` : t.health.uploadVideoBtn}</span>
                </button>
              </div>

              {/* Media Preview Thumbnails */}
              {uploadedMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {uploadedMedia.map((m) => (
                    <div key={m.id} className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group aspect-video">
                      <img src={m.dataUrl} alt={m.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                        {m.viewType === 'close_up_lesion' ? t.health.tagCloseUp : m.viewType === 'video_clip' ? t.health.tagVideo : t.health.tagFullBody}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(m.id)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white opacity-90 hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Triage Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleAnalyze}
                className="w-full py-4 rounded-2xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>{isUrdu ? 'ویٹرنری فیصلہ سازی کا تجزیہ جاری ہے...' : 'Analyzing Multi-Symptom Evidence...'}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 text-brand-200" />
                    <span>{t.health.analyzeButton}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ANALYSIS RESULTS DASHBOARD & TREATMENT TABS                              */}
          {/* ========================================================================= */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Emergency Protocol Banner if Life-Threatening Signs Detected */}
              {result.detectedEmergency && result.emergencyProtocols.length > 0 && (
                <div className="p-6 rounded-3xl bg-red-600 text-white space-y-4 shadow-lg border-2 border-red-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AlertOctagon className="w-8 h-8 text-amber-300 animate-pulse shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-200">
                          {t.health.emergencyAlert}
                        </span>
                        <h3 className="text-xl font-black">
                          {isUrdu ? 'فوری جان لیوا خطرہ: ابتدائی طبی امداد پروٹوکول' : 'Immediate Life Support Protocols (Pre-Vet Actions)'}
                        </h3>
                      </div>
                    </div>
                    {onNavigateToVet && (
                      <button
                        type="button"
                        onClick={onNavigateToVet}
                        className="py-2 px-4 rounded-xl bg-white text-red-700 font-extrabold text-xs flex items-center gap-1.5 hover:bg-red-50 transition shadow-sm"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>{t.health.findEmergencyVet}</span>
                      </button>
                    )}
                  </div>

                  {result.emergencyProtocols.map((proto, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-red-700/80 border border-red-500/80 space-y-2 text-xs">
                      <h4 className="font-extrabold text-sm text-amber-200">
                        {isUrdu ? proto.titleUr : proto.titleEn}
                      </h4>
                      <div className="space-y-1">
                        <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                          {isUrdu ? 'ڈاکٹر کے پہنچنے تک فوری اقدامات:' : 'Actionable First-Aid Steps:'}
                        </span>
                        <ul className="space-y-1 text-red-50">
                          {(isUrdu ? proto.immediateStepsUr : proto.immediateStepsEn).map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="font-bold text-amber-300">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Analysis Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
                        {isUrdu ? 'کلینیکل سکریننگ رپورٹ' : 'Clinical Screening Assessment'}
                      </span>
                      {result.dataSource === 'live_ai' ? (
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>{isUrdu ? 'گوگل جیمنائی AI ویژن' : 'Live Gemini AI Vision'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>{isUrdu ? 'کلینیکل ویٹرنری ریفرنس معیار' : 'Clinical Reference Standard'}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {isUrdu ? result.primaryMatches[0]?.nameUr : result.primaryMatches[0]?.nameEn}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                        result.overallRiskLevel === 'emergency'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : result.overallRiskLevel === 'severe'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {result.overallRiskLevel} Risk
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {result.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>

                {/* Supporting vs Contradicting Symptoms Badges (Requirement 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Supporting Evidence */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 space-y-2">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t.health.supportingEvidence}</span>
                    </span>
                    <ul className="space-y-1 text-emerald-900">
                      {(isUrdu
                        ? result.primaryMatches[0]?.supportingSymptomsUr
                        : result.primaryMatches[0]?.supportingSymptomsEn
                      )?.map((sup, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold text-emerald-600">•</span>
                          <span>{sup}</span>
                        </li>
                      )) || (
                        <li className="italic text-emerald-700">
                          {isUrdu ? 'علامات کی عمومی مماثلت پائی گئی ہے۔' : 'General clinical symptom compatibility verified.'}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Contradicting Evidence */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{t.health.contradictingEvidence}</span>
                    </span>
                    <ul className="space-y-1 text-amber-900">
                      {(isUrdu
                        ? result.primaryMatches[0]?.contradictingSymptomsUr
                        : result.primaryMatches[0]?.contradictingSymptomsEn
                      )?.map((contra, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold text-amber-600">•</span>
                          <span>{contra}</span>
                        </li>
                      )) || (
                        <li className="italic text-amber-700">
                          {isUrdu ? 'کوئی واضح متضاد علامت نہیں پائی گئی۔' : 'No explicit contradictory symptoms detected.'}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Differential Diagnoses Ranked */}
                {result.differentialMatches.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                      {t.health.differentialDiagnoses}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {result.differentialMatches.map((diff) => (
                        <div key={diff.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                          <div className="font-bold text-slate-800">
                            {isUrdu ? diff.nameUr : diff.nameEn}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Risk: {diff.riskLevel} | Species: {diff.targetSpecies.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TWO DISTINCT TREATMENT TABS: TRADITIONAL VS MODERN (Requirement 3)       */}
                {/* ========================================================================= */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-lg text-slate-900">
                        {t.health.treatmentSectionTitle}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isUrdu
                          ? 'مستند روایتی دیسی نسخہ جات اور جدید ویٹرنری ایلوپیتھک ادویات کی علیحدہ رہنمائی'
                          : 'Segregated evidence-reviewed traditional remedies and verified modern pharmaceuticals'}
                      </p>
                    </div>

                    {/* Sub-Tabs: Traditional vs Modern */}
                    <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTreatmentTab('traditional')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          treatmentTab === 'traditional'
                            ? 'bg-white text-emerald-800 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.health.tabTraditional}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTreatmentTab('modern')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          treatmentTab === 'modern'
                            ? 'bg-white text-brand-800 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Pill className="w-3.5 h-3.5 text-brand-600" />
                        <span>{t.health.tabModern}</span>
                      </button>
                    </div>
                  </div>

                  {treatmentTab === 'traditional' ? (
                    /* TAB A: TRADITIONAL / DESI REMEDIES */
                    <div className="space-y-4 animate-fade-in">
                      {result.primaryMatches[0]?.traditionalRemedies &&
                      result.primaryMatches[0].traditionalRemedies.length > 0 ? (
                        result.primaryMatches[0].traditionalRemedies.map((remedy) => (
                          <div
                            key={remedy.id}
                            className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                              <h5 className="font-extrabold text-sm text-emerald-950">
                                {isUrdu ? remedy.nameUr : remedy.nameEn}
                              </h5>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>{remedy.evidenceQuality.replace(/_/g, ' ')}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <strong className="text-slate-800 block mb-1">
                                  {isUrdu ? 'اجزاء و مقدار:' : 'Ingredients:'}
                                </strong>
                                <ul className="space-y-0.5 text-slate-700">
                                  {(isUrdu ? remedy.ingredientsUr : remedy.ingredientsEn).map((ing, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="font-bold text-emerald-600">•</span>
                                      <span>{ing}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <strong className="text-slate-800 block mb-1">
                                  {isUrdu ? 'تیاری اور استعمال کا طریقہ:' : 'Preparation & Method:'}
                                </strong>
                                <p className="text-slate-700 leading-relaxed">
                                  {isUrdu ? remedy.preparationMethodUr : remedy.preparationMethodEn}
                                </p>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                              <span className="font-bold text-red-900 block text-[11px] uppercase">
                                {isUrdu ? 'ضروری احتیاط و نقصانات:' : 'Toxicity Warnings & Contraindications:'}
                              </span>
                              <p className="text-red-900 text-[11px] leading-relaxed">
                                {isUrdu ? remedy.risksAndSideEffectsUr : remedy.risksAndSideEffectsEn}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                          {isUrdu
                            ? 'اس مخصوص بیماری کے لیے کوئی سائنسی طور پر تصدیق شدہ روایتی نسخہ موجود نہیں ہے۔ نقصان دہ یا غیر مصدقہ گھریلو ٹوٹکے ہرگز استعمال نہ کریں۔'
                            : 'No evidence-reviewed traditional remedies are available for this specific condition. Avoid unverified folk remedies.'}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* TAB B: MODERN VETERINARY MEDICINES (FARMER MODE VS VET MODE) */
                    <div className="space-y-4 animate-fade-in">
                      {/* Clinical Mode Selector Bar */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                {isUrdu ? 'کلینیکل فیصلہ سازی کا موڈ:' : 'Clinical Decision Mode:'}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                  clinicalMode === 'farmer'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-brand-100 text-brand-800 border-brand-300'
                                }`}
                              >
                                {clinicalMode === 'farmer' ? t.health.farmerModeBadge : t.health.vetModeBadge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
                              {clinicalMode === 'farmer' ? t.health.farmerModeNotice : t.health.vetModeNotice}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => setClinicalMode('farmer')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                clinicalMode === 'farmer'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>{t.health.farmerMode}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (verifiedRvmpLicense) {
                                  setClinicalMode('vet');
                                } else {
                                  setPvmcError('');
                                  setShowRvmpModal(true);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                clinicalMode === 'vet'
                                  ? 'bg-brand-700 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>{t.health.vetMode}</span>
                              {verifiedRvmpLicense ? (
                                <CheckCircle className="w-3 h-3 text-emerald-300" />
                              ) : (
                                <Lock className="w-3 h-3 text-amber-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* RVMP Status Strip */}
                        {clinicalMode === 'vet' && verifiedRvmpLicense && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] gap-2">
                            {isUserAuthenticatedVet ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>
                                  {isUrdu
                                    ? `مستند ویٹرنری اکاؤنٹ (سرور اور ایڈمن سے مصدقہ): ${user?.email || verifiedRvmpLicense}`
                                    : `Authenticated Veterinarian Account (Server & Admin Verified): ${user?.email || verifiedRvmpLicense}`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-amber-900 font-bold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  {isUrdu
                                    ? `خود ساختہ رجسٹریشن نمبر: ${verifiedRvmpLicense} (کونسل API سے غیر مصدقہ — صرف فارمیٹ سیمولیشن موڈ)`
                                    : `Self-Declared Number: ${verifiedRvmpLicense} (Unverified by Official PVMC Council — Clinical Simulation Only)`}
                                </span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!isUserAuthenticatedVet) {
                                  setVerifiedRvmpLicense(null);
                                }
                                setClinicalMode('farmer');
                              }}
                              className="text-slate-500 hover:text-slate-800 underline font-medium self-start sm:self-center"
                            >
                              {isUrdu ? 'کسان موڈ پر واپس جائیں' : 'Switch to Farmer Mode'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Safety Banner */}
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">
                            {isUrdu
                              ? 'اہم قانونی و طبی انتباہ: تمام اینٹی بائیوٹکس اور ٹیکہ جات صرف لائسنس یافتہ ویٹرنری ڈاکٹر کی نگرانی میں لگوائیں'
                              : 'Veterinary Oversight Notice: All prescription antibiotics and injectables must be administered by or under the direct supervision of a licensed veterinarian (RVMP).'}
                          </strong>
                          <span className="text-[11px] text-amber-900/80">
                            {isUrdu
                              ? 'دوا کا غلط انتخاب، رگ کی بجائے گوشت میں غلط ٹیکہ، یا تیزی سے ڈرپ چڑھانا جانور کی فوری ہلاکت کا سبب بن سکتا ہے۔'
                              : 'Incorrect injection technique, improper route, or rapid infusion can cause immediate fatal cardiac arrest or irreversible muscular necrosis.'}
                          </span>
                        </div>
                      </div>

                      {result.primaryMatches[0]?.modernMedicines &&
                      result.primaryMatches[0].modernMedicines.length > 0 ? (
                        result.primaryMatches[0].modernMedicines.map((med) => {
                          const isVerified = med.verificationStatus === 'verified';
                          const hasCalculatedDose = !!med.calculatedDoseForWeight;
                          const withdrawalStatement = isUrdu
                            ? med.withdrawalStatementUr || formatSafeWithdrawalStatement(med, true)
                            : med.withdrawalStatementEn || formatSafeWithdrawalStatement(med, false);
                          const isUnverifiedWithdrawal =
                            !isVerified || med.milkWithdrawalDays === null || med.meatWithdrawalDays === null;

                          return (
                            <div
                              key={med.id}
                              className={`p-5 rounded-2xl border transition space-y-3.5 text-xs ${
                                isVerified
                                  ? 'border-slate-200 bg-white hover:border-brand-300'
                                  : 'border-amber-200 bg-amber-50/30'
                              }`}
                            >
                              {/* Header & Verification Badges */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-extrabold text-sm text-slate-900">
                                      {med.genericName}
                                    </h5>
                                    {med.drapStatus === 'verified_drap_registered' || med.drapStatus === 'verified_drap_import' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-700" />
                                        <span>DRAP Registered ({med.drapRegNumber || 'Form-7'})</span>
                                      </span>
                                    ) : med.drapStatus === 'unverified_pending_drap_record' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                                        <span>DRAP Record Unverified</span>
                                      </span>
                                    ) : med.drapStatus === 'not_registered_in_pakistan' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-rose-700" />
                                        <span>Not Registered in Pakistan</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                        Exempt Traditional
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-500 font-medium block mt-1 space-x-1">
                                    <span>{med.drugClass}</span>
                                    {med.brandName && (
                                      <span className="text-slate-800 font-bold"> • {med.brandName}</span>
                                    )}
                                    {med.pakistanManufacturerOrImporter && (
                                      <span className="text-slate-600"> • {med.pakistanManufacturerOrImporter}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      med.isPrescriptionRequired
                                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    }`}
                                  >
                                    {med.isPrescriptionRequired ? 'POM-V (Prescription)' : 'Over-the-Counter'}
                                  </span>
                                </div>
                              </div>

                              {/* Approved Indication */}
                              <div className="text-[11px] text-slate-700">
                                <strong className="text-slate-900">
                                  {isUrdu ? 'مستند استعمال و اثر:' : 'Approved Indication:'}{' '}
                                </strong>
                                <span>{isUrdu ? med.indicationsUr : med.indicationsEn}</span>
                              </div>

                              {/* ------------------------------------------------------------- */}
                              {/* MODE 1: FARMER MODE VIEW (Safe First Aid, Locked Syringes)    */}
                              {/* ------------------------------------------------------------- */}
                              {clinicalMode === 'farmer' ? (
                                <div className="space-y-2.5 pt-1">
                                  {/* Farmer Safe Usage Advisory */}
                                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                                    <strong className="block font-bold text-[11px] text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                                      <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{t.health.farmerSafeAdviceTitle}</span>
                                    </strong>
                                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                                      {isUrdu
                                        ? med.farmerSafeUsageAdviceUr || med.farmerSafeUsageAdviceEn
                                        : med.farmerSafeUsageAdviceEn}
                                    </p>
                                  </div>

                                  {/* Prescription Lock for POM-V */}
                                  {med.isPrescriptionRequired && (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                                      <div className="flex items-start gap-2">
                                        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                        <div>
                                          <strong className="block font-bold text-[11px] text-amber-900">
                                            {t.health.pomvNoticeFarmer}
                                          </strong>
                                          <p className="text-[11px] text-amber-900/80 mt-0.5">
                                            {isUrdu
                                              ? '🔒 سرنج کے ملی لیٹر اور ٹیکے کی مقدار کا حساب حادثاتی طور پر غلط رگ میں لگنے، رگ پھٹنے، یا جانور کی اچانک ہلاکت سے بچاؤ کے لیے کسان موڈ میں مقفل ہے۔ صرف مستند ویٹرنری ڈاکٹر (RVMP) ہی ٹیکہ لگانے کا مجاز ہے۔'
                                              : '🔒 Calibrated syringe dosages (mL) are locked in Farmer Mode to prevent accidental intra-vascular infusion, tissue necrosis, or fatal cardiac shock. Only a licensed RVMP may calculate and inject prescription drugs.'}
                                          </p>
                                        </div>
                                      </div>
                                      {onNavigateToVet && (
                                        <button
                                          type="button"
                                          onClick={onNavigateToVet}
                                          className="mt-1 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] transition flex items-center gap-1.5"
                                        >
                                          <PhoneCall className="w-3.5 h-3.5" />
                                          <span>{t.health.findEmergencyVet}</span>
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Mandatory Withdrawal Notice for Farmers */}
                                  <div
                                    className={`p-2.5 rounded-xl border text-[11px] ${
                                      isUnverifiedWithdrawal
                                        ? 'bg-amber-50 text-amber-950 border-amber-300'
                                        : 'bg-slate-50 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      {isUnverifiedWithdrawal ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      )}
                                      <div>
                                        <strong className="block font-bold">
                                          {isUrdu ? 'پرہیز کا دورانیہ (Withdrawal Period):' : 'Withdrawal Requirements:'}
                                        </strong>
                                        <span>{withdrawalStatement}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* ------------------------------------------------------------- */
                                /* MODE 2: VET MODE VIEW (RVMP Clinical Formulations & Dosing)   */
                                /* ------------------------------------------------------------- */
                                <div className="space-y-3 pt-1">
                                  {/* Veterinary Details Strip */}
                                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    <div>
                                      <strong className="text-slate-800 block">Active Ingredient: </strong>
                                      <span>
                                        {med.activeIngredient}
                                        {med.mgPerMlConcentration ? ` (${med.mgPerMlConcentration} mg/mL)` : ''}
                                      </span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-800 block">Route & Injection Limit: </strong>
                                      <span className="capitalize">
                                        {med.administrationRoute}
                                        {med.maxVolumePerInjectionSiteMl
                                          ? ` (Max ${med.maxVolumePerInjectionSiteMl} mL/site)`
                                          : ''}
                                      </span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-800 block">Pakistan Availability: </strong>
                                      <span className="capitalize">
                                        {med.pakistanAvailability?.replace(/_/g, ' ') || 'Unknown'}
                                      </span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-800 block">Approved Species: </strong>
                                      <span>{med.approvedSpecies?.join(', ') || 'None specified'}</span>
                                    </div>
                                    {med.drapRegNumber && (
                                      <div>
                                        <strong className="text-slate-800 block">DRAP Reg Number: </strong>
                                        <span className="font-mono text-slate-900 font-bold">{med.drapRegNumber}</span>
                                      </div>
                                    )}
                                    {med.regulatoryAuthority && (
                                      <div>
                                        <strong className="text-slate-800 block">Regulatory Authority: </strong>
                                        <span>
                                          {med.regulatoryAuthority} ({med.labelRevisionDate || 'Reviewed'})
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Scientific Dosage Engine */}
                                  <div
                                    className={`p-3.5 rounded-xl border space-y-2 ${
                                      hasCalculatedDose
                                        ? 'bg-brand-50/70 border-brand-200'
                                        : 'bg-amber-50/70 border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                                        <Scale className="w-3.5 h-3.5 text-brand-700" />
                                        <span>{t.health.dosageCalculator}</span>
                                      </span>
                                      {!isUserAuthenticatedVet && (
                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                          {isUrdu ? 'غیر مصدقہ سیمولیشن' : 'Unverified Simulation'}
                                        </span>
                                      )}
                                    </div>

                                    {!isUserAuthenticatedVet && (
                                      <div className="p-2 rounded-lg bg-amber-100/70 text-amber-950 text-[10px] flex items-center gap-1.5 border border-amber-200">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                        <span>
                                          {isUrdu
                                            ? 'یہ اکاؤنٹ پی وی ایم سی سے باضابطہ تصدیق شدہ نہیں ہے۔ یہ خوراک صرف کلینیکل جائزے کے لیے ہے۔'
                                            : 'Account unverified by official PVMC register. Doses shown for clinical review only.'}
                                        </span>
                                      </div>
                                    )}

                                    {hasCalculatedDose ? (
                                      <div className="space-y-1">
                                        <p className="font-mono text-brand-950 font-extrabold text-sm">
                                          {med.calculatedDoseForWeight}
                                        </p>
                                        <span className="text-[10px] text-slate-600 block">
                                          Standard Rate: {med.standardDosageRate} • Duration: {med.treatmentDuration}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <p className="font-medium text-amber-900 text-xs flex items-start gap-1.5">
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                          <span>
                                            {isUrdu
                                              ? med.dosageCalculationDisabledReasonUr ||
                                                'طبی وجوہات کی بنا پر خوراک کا خودکار حساب غیر فعال ہے۔'
                                              : med.dosageCalculationDisabledReasonEn ||
                                                'Dosage calculation disabled for safety.'}
                                          </span>
                                        </p>
                                        <span className="text-[10px] text-slate-500 block">
                                          Reference Guideline: {med.standardDosageRate} • Duration: {med.treatmentDuration}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Pregnancy & Lactation Restrictions */}
                                  {(!med.pregnancySafe || med.pregnancySafetyStatus !== 'safe_with_precautions') && (
                                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-950 border border-rose-200 text-[11px] space-y-0.5">
                                      <strong className="flex items-center gap-1 font-bold text-rose-800">
                                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                        <span>{t.health.pregnancyAlert}</span>
                                      </strong>
                                      <p>{isUrdu ? med.pregnancyWarningUr : med.pregnancyWarningEn}</p>
                                    </div>
                                  )}

                                  {/* Audited Withdrawal Statement Box */}
                                  <div
                                    className={`p-2.5 rounded-xl border text-[11px] ${
                                      isUnverifiedWithdrawal
                                        ? 'bg-amber-50 text-amber-950 border-amber-300'
                                        : 'bg-slate-50 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      {isUnverifiedWithdrawal ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      )}
                                      <div>
                                        <strong className="block font-bold">
                                          {isUrdu
                                            ? 'پرہیز کا دورانیہ (Withdrawal Period):'
                                            : 'Withdrawal Requirements:'}
                                        </strong>
                                        <span>{withdrawalStatement}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Precautions & Clinical Administration Advice */}
                                  {med.precautionsEn && med.precautionsEn.length > 0 && (
                                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 space-y-1 text-[11px]">
                                      <strong className="block font-bold text-slate-800">
                                        {isUrdu
                                          ? 'لازمی احتیاطی تدابیر اور انتباہ:'
                                          : 'Critical Precautions & Administration Advice:'}
                                      </strong>
                                      <ul className="list-disc list-inside space-y-0.5">
                                        {(isUrdu ? med.precautionsUr : med.precautionsEn).map((p, i) => (
                                          <li key={i}>{p}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                          {isUrdu
                            ? 'براہِ راست لائسنس یافتہ ویٹرنری ڈاکٹر سے نسخہ حاصل کریں۔ اینٹی بائیوٹکس کا غیر ضروری استعمال ممنوع ہے۔'
                            : 'Consult a licensed veterinarian for prescription antibiotics.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recommended Diagnostic Laboratory Tests (Requirement 2) */}
                {result.primaryMatches[0]?.recommendedLabTests &&
                  result.primaryMatches[0].recommendedLabTests.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                        <Beaker className="w-4 h-4 text-brand-700" />
                        <span>{t.health.labTestsTitle}</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.primaryMatches[0].recommendedLabTests.map((test) => (
                          <div key={test.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <span className="font-bold text-slate-900 block">
                              {isUrdu ? test.testNameUr : test.testNameEn}
                            </span>
                            <p className="text-[11px] text-slate-600">
                              {isUrdu ? test.purposeUr : test.purposeEn}
                            </p>
                            <span className="text-[10px] text-brand-700 font-semibold block">
                              Sample: {test.sampleType} | Turnaround: {test.expectedTurnaround}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Clarifying Follow-Up Questions (Requirement 2) */}
                {result.clarifyingQuestionsEn.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-600" />
                      <span>{t.health.clarifyingQuestions}</span>
                    </h5>
                    <ul className="space-y-1 text-slate-700">
                      {(isUrdu ? result.clarifyingQuestionsUr : result.clarifyingQuestionsEn).map((q, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-brand-600">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Authoritative Citations & Literature (Requirement 5) */}
                {result.primaryMatches[0]?.sourceCitations && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t.health.sourceCitationsTitle}</span>
                    </h5>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      {result.primaryMatches[0].sourceCitations.map((cit, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <span>• {cit.sourceName} ({cit.publicationOrEdition})</span>
                          <span className="text-[10px] text-slate-400 italic">{cit.reviewStatus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveAssessment}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{savedSuccess ? t.health.savedSuccess : t.health.saveToHerdHistory}</span>
                  </button>

                  {onNavigateToChat && (
                    <button
                      type="button"
                      onClick={() => {
                        const summary = `Animal: ${result.input.species} (${result.input.breed || 'Unknown'}). Suspected condition: ${result.primaryMatches[0]?.nameEn}. Reported symptoms: ${result.input.symptoms.join(', ')}. Details: ${result.input.customDescription}`;
                        onNavigateToChat(summary);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <MessageSquareText className="w-4 h-4 text-brand-600" />
                      <span>{t.health.discussWithAiVet}</span>
                    </button>
                  )}

                  {onNavigateToCalendar && result.primaryMatches[0]?.preventativeVaccineName && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCalendar(result.primaryMatches[0]?.preventativeVaccineName)}
                      className="py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Syringe className="w-4 h-4 text-purple-600" />
                      <span>{t.health.scheduleVaccine}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition ml-auto"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.health.printReport}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RVMP Professional Verification Modal */}
      {showRvmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {t.health.pvmcModalTitle}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pakistan Veterinary Medical Council Gate
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRvmpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t.health.pvmcModalSubtitle}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {isUrdu ? 'لازمی قانونی و تکنیکی انتباہ:' : 'Official Regulatory & Technical Notice:'}
                </strong>
                <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                  {isUrdu
                    ? 'پاکستان ویٹرنری کونسل کا کوئی خودکار لائیو API فی الوقت دستیاب نہیں ہے۔ یہاں لائسنس نمبر درج کرنے سے صرف نمبر کے فارمیٹ کی جانچ ہوتی ہے، کونسل سے براہِ راست رجسٹریشن نہیں۔ غیر مصدقہ اکاؤنٹس صرف کلینیکل سیمولیشن موڈ میں دیکھے جا سکتے ہیں۔ باضابطہ ویٹرنری اکاؤنٹ کے لیے ایڈمن سے تصدیق لازمی ہے۔'
                    : 'No automated live PVMC registry lookup service exists in Pakistan. Entering a registration number validates syntax format only, NOT official council registration. Unauthenticated accounts enter Simulation Mode and remain labeled as Unverified. Verified privileges require administrator verification.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.health.pvmcLicenseNumber}
                </label>
                <input
                  type="text"
                  value={pvmcInput}
                  onChange={(e) => {
                    setPvmcInput(e.target.value);
                    setPvmcError('');
                  }}
                  placeholder="e.g. PVMC-12345 or RVMP-6789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 uppercase"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pvmcDeclarationChecked}
                  onChange={(e) => setPvmcDeclarationChecked(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  {t.health.pvmcDeclaration}
                </span>
              </label>

              {pvmcError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pvmcError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!pvmcDeclarationChecked) {
                    setPvmcError(
                      isUrdu
                        ? 'براہ کرم قانونی اقرار نامے کے چیک باکس کی تصدیق کریں۔'
                        : 'You must confirm the legal RVMP declaration checkbox.'
                    );
                    return;
                  }
                  const rvmpCheck = verifyRvmpLicense(pvmcInput);
                  if (!rvmpCheck.isValid) {
                    setPvmcError(
                      isUrdu
                        ? 'لائسنس فارمیٹ غلط ہے۔ درست فارمیٹ درج کریں: مثلاً PVMC-12345 یا RVMP-6789'
                        : 'Invalid PVMC/RVMP registration number. Valid format: PVMC-12345 or RVMP-6789.'
                    );
                    return;
                  }
                  const cleanLicense = rvmpCheck.normalizedLicense || pvmcInput.trim().toUpperCase();
                  setVerifiedRvmpLicense(cleanLicense);
                  setClinicalMode('vet');
                  setShowRvmpModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t.health.pvmcVerifyBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRvmpModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                <span>{t.health.pvmcCancelBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
