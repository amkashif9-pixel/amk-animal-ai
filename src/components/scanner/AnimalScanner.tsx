import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n';
import { useAnimals } from '../../context/AnimalContext';
import { ScanPrediction } from '../../types/animal';
import { analyzeAnimalImages } from '../../services/aiService';
import { extractVideoFrames, ExtractedFrame } from '../../services/videoService';
import { ALL_SPECIES } from '../../data/speciesData';
import {
  Upload,
  Camera,
  Film,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookmarkPlus,
  Activity,
  Calculator,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Beef,
} from 'lucide-react';

interface AnimalScannerProps {
  onNavigateToHealth?: (species: string, breed?: string, initialMedia?: string[]) => void;
  onNavigateToPrice?: (species: string, breed?: string) => void;
  onNavigateToMeatYield?: (species: string, breed?: string, weightKg?: number, bcs?: number) => void;
}

export const AnimalScanner: React.FC<AnimalScannerProps> = ({
  onNavigateToHealth,
  onNavigateToPrice,
  onNavigateToMeatYield,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { addAnimal } = useAnimals();

  const parseWeightMidpoint = (range?: string): number | undefined => {
    if (!range) return undefined;
    const matches = range.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return undefined;
    const nums = matches.map(Number);
    if (nums.length === 1) return nums[0];
    return Math.round((nums[0] + nums[1]) / 2);
  };

  const parseBcsNumber = (bcsStr?: string): number | undefined => {
    if (!bcsStr) return undefined;
    const match = bcsStr.match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : undefined;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<ScanPrediction | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4);
    const newImages: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newImages.push(reader.result);
          if (newImages.length === files.length) {
            setImageFiles((prev) => [...prev, ...newImages].slice(0, 4));
            setPrediction(null);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Video Upload & Frame Extraction
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingVideo(true);
    setVideoProgress(10);
    setErrorMsg(null);

    try {
      const frames = await extractVideoFrames(file, 4, (pct) => {
        setVideoProgress(pct);
      });
      setExtractedFrames(frames);
      setImageFiles(frames.map((f) => f.dataUrl));
      setPrediction(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Video frame extraction failed. Please try a standard MP4 file.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Run Multimodal AI Vision Analysis
  const handleAnalyze = async () => {
    if (imageFiles.length === 0) {
      setErrorMsg(isUrdu ? 'براہ کرم پہلے جانور کی تصویر یا ویڈیو اپلوڈ کریں۔' : 'Please upload animal photos or a video first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await analyzeAnimalImages(imageFiles, selectedCategory || undefined);
      setPrediction(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Save Result as Animal Profile
  const handleSaveToHerd = () => {
    if (!prediction) return;
    addAnimal({
      name: `${prediction.breed} (${new Date().toLocaleDateString()})`,
      species: prediction.species,
      breed: prediction.breed,
      gender: prediction.gender === 'Male' ? 'male' : 'female',
      dobOrAge: prediction.estimatedAgeRange || 'Adult',
      photos: imageFiles.length > 0 ? imageFiles : [prediction.detailedBreedInfo?.imageUrl || ''],
      weightRecords: [
        {
          date: new Date().toISOString().split('T')[0],
          weightKg: prediction.species === 'Goat' || prediction.species === 'Sheep' ? 65 : 420,
          notes: 'Initial AI scan estimated baseline',
        },
      ],
      milkRecords: [],
      healthHistory: [],
      vaccinationRecords: [],
      reproductionRecords: [],
      feedingNotes: prediction.detailedBreedInfo?.feedingRequirementsEn || '',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Quick preset sample images for instant demo testing
  const handleLoadSample = (sampleSpecies: string) => {
    setSelectedCategory(sampleSpecies);
    if (sampleSpecies === 'cow') {
      setImageFiles(['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80']);
    } else if (sampleSpecies === 'buffalo') {
      setImageFiles(['https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80']);
    } else if (sampleSpecies === 'goat') {
      setImageFiles(['https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80']);
    } else {
      setImageFiles(['https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80']);
    }
    setPrediction(null);
  };

  const breedInfo = prediction?.detailedBreedInfo;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>{isUrdu ? 'ملٹی موڈل اے آئی اینیمل ویژن' : 'Multimodal Vision AI Scanner'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.scanner.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Category Filter Selector (Optional) */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>{t.scanner.manualCategoryOptional}</span>
          </label>
          <span className="text-xs text-slate-500">
            {selectedCategory ? `${selectedCategory.toUpperCase()}` : t.scanner.allCategories}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.scanner.allCategories}
          </button>
          {ALL_SPECIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedCategory(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === s.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s.icon}</span>
              <span>{isUrdu ? s.nameUrdu : s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Media Upload Box */}
        <div className="lg:col-span-6 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/80 hover:bg-brand-50/30 rounded-3xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 relative group flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoUpload}
            />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-brand-600 mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
              {t.scanner.uploadPrompt}
            </h3>
            <p className="text-xs text-slate-500 mb-4 px-2">
              {t.scanner.multiImageHint}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 text-xs font-semibold shadow-xs transition min-h-[44px]"
              >
                <Camera className="w-4 h-4 text-brand-600" />
                <span>{t.scanner.takePhoto}</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 text-xs font-semibold shadow-xs transition min-h-[44px]"
              >
                <Film className="w-4 h-4 text-brand-600" />
                <span>{t.scanner.uploadVideo}</span>
              </button>
            </div>
          </div>

          {/* Video Extraction Progress Bar */}
          {isProcessingVideo && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-brand-600 animate-spin" />
                  <span>{t.scanner.extractingFrames}</span>
                </span>
                <span>{videoProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Uploaded Images Preview Strip */}
          {imageFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                <span>
                  {isUrdu ? `تجزیے کے لیے تصاویر (${imageFiles.length})` : `Selected Media Frames (${imageFiles.length})`}
                </span>
                <button
                  type="button"
                  onClick={() => setImageFiles([])}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  {isUrdu ? 'صاف کریں' : 'Clear All'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {imageFiles.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
                    <img src={src} alt="Animal frame" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Demo Visual Specimen Cards */}
          <div className="pt-2">
            <span className="text-xs font-bold text-emerald-900 block mb-2">
              {isUrdu ? 'فوری ٹیسٹ کے لیے حقیقی نمونے (Sample Specimens):' : 'Or load real specimen photo for instant testing:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cow', nameEn: 'Sahiwal Cow', nameUr: 'ساہیوال گائے', img: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80' },
                { id: 'buffalo', nameEn: 'Nili-Ravi Buffalo', nameUr: 'نیلی راوی بھینس', img: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=300&q=80' },
                { id: 'goat', nameEn: 'Beetal Goat', nameUr: 'بیتل بکری', img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=300&q=80' },
                { id: 'sheep', nameEn: 'Kajli Sheep', nameUr: 'کجلی چھترا', img: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=300&q=80' },
              ].map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleLoadSample(spec.id)}
                  className="p-2 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center gap-2 group cursor-pointer"
                >
                  <img src={spec.img} alt={spec.nameEn} className="w-10 h-10 rounded-xl object-cover border border-emerald-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 block truncate">
                      {isUrdu ? spec.nameUr : spec.nameEn}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">{isUrdu ? 'ٹیسٹ لوڈ کریں' : 'Click to test'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || imageFiles.length === 0}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              isAnalyzing || imageFiles.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-brand-600 to-forest-800 hover:from-brand-500 hover:to-forest-700 shadow-brand-600/30'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t.scanner.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{isUrdu ? 'اے آئی کے ذریعے شناخت کریں' : 'Identify Animal with Multimodal AI'}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right: AI Identification Results Report */}
        <div className="lg:col-span-6">
          {!prediction ? (
            <div className="h-full min-h-[380px] bg-slate-50 border border-slate-200/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">
                {isUrdu ? 'شناختی رپورٹ کا انتظار' : 'Awaiting Animal Analysis'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {isUrdu
                  ? 'بائیں جانب جانور کی تصویر یا ویڈیو فریم اپلوڈ کریں اور "اے آئی کے ذریعے شناخت کریں" پر کلک کریں۔'
                  : 'Upload images or video frames on the left and trigger analysis to generate a complete veterinary breed dossier.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-6 animate-fade-in">
              {/* Header result banner */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      {prediction.species} ({prediction.speciesUrdu})
                    </span>
                    {prediction.dataSource === 'live_ai' ? (
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
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {isUrdu ? prediction.breedUrdu : prediction.breed}
                  </h3>
                  {breedInfo?.scientificName && (
                    <span className="text-xs italic text-slate-500 font-mono">
                      {breedInfo.scientificName}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{prediction.confidenceScore}%</span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {t.scanner.confidence}
                  </span>
                </div>
              </div>

              {/* Observed Traits Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.scanner.gender}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {prediction.gender || 'Unknown'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.scanner.estimatedAge}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {prediction.estimatedAgeRange || 'Adult'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.scanner.bodyCondition}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {prediction.bodyConditionScore || 'BCS 3.0 / 5'}
                  </span>
                </div>

                <div className="col-span-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.scanner.weightRange}
                  </span>
                  <span className="text-xs font-extrabold text-brand-800">
                    {prediction.estimatedWeightRange || '350 - 450 kg'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {isUrdu ? 'بصری معیار' : 'Specimen'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {t.scanner.aiVisualEstimate}
                  </span>
                </div>
              </div>

              {/* Distinguishing Features */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t.scanner.distinguishingFeatures}</span>
                </h5>
                <ul className="space-y-1.5">
                  {prediction.distinguishingFeatures?.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scientific Uncertainty & Purebred Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>{t.scanner.uncertaintyNotice}</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-900">
                  {isUrdu ? prediction.uncertaintyExplanationUr : prediction.uncertaintyExplanationEn}
                </p>
                <p className="leading-relaxed text-[10px] text-amber-800 italic">
                  {t.scanner.uncertaintyText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveToHerd}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <BookmarkPlus className="w-4 h-4 text-brand-400" />
                  <span>{saveSuccess ? (isUrdu ? 'ریکارڈ محفوظ ہو گیا!' : 'Saved to Records!') : t.scanner.saveToProfile}</span>
                </button>

                {onNavigateToHealth && (
                  <button
                    type="button"
                    onClick={() => onNavigateToHealth(prediction.species, prediction.breed, imageFiles)}
                    className="py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Activity className="w-4 h-4 text-brand-600" />
                    <span>{isUrdu ? 'صحت کی جانچ' : 'Health Check'}</span>
                  </button>
                )}

                {onNavigateToPrice && (
                  <button
                    type="button"
                    onClick={() => onNavigateToPrice(prediction.species, prediction.breed)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'منڈی قیمت' : 'Mandi Price'}</span>
                  </button>
                )}

                {onNavigateToMeatYield && (
                  <button
                    type="button"
                    onClick={() => {
                      const weight = parseWeightMidpoint(prediction.estimatedWeightRange);
                      const bcs = parseBcsNumber(prediction.bodyConditionScore);
                      onNavigateToMeatYield(prediction.species, prediction.breed, weight, bcs);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <Beef className="w-4 h-4 text-emerald-200" />
                    <span>{isUrdu ? 'گوشت تخمینہ' : 'Meat Yield'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Veterinary Breed Dossier (Requirement 5) */}
      {prediction && breedInfo && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest block mb-1">
              {t.scanner.verifiedBreedFact}
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              {isUrdu ? `${breedInfo.nameUrdu} — مکمل ویٹرنری معلوماتی فائل` : `${breedInfo.name} — Full Veterinary Breed Dossier`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isUrdu ? `ماخذ و علاقہ: ${breedInfo.originUrdu}` : `Origin & Geographic Distribution: ${breedInfo.origin}`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-700">
            {/* 1. Physical Characteristics */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '1. جسمانی خصوصیات' : '1. Physical Characteristics'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.physicalCharacteristicsUr : breedInfo.physicalCharacteristicsEn}
              </p>
            </div>

            {/* 2. Male & Female Differences */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '2. نر اور مادہ کا فرق' : '2. Male & Female Dimorphism'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.maleFemaleDifferencesUr : breedInfo.maleFemaleDifferencesEn}
              </p>
            </div>

            {/* 3. Lifespan & Adult Weight */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '3. اوسط عمر اور وزن' : '3. Lifespan & Adult Weight'}
              </h5>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">{isUrdu ? 'اوسط عمر:' : 'Lifespan:'}</span>
                <span className="font-bold">{breedInfo.averageLifespan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isUrdu ? 'بالغ وزن:' : 'Adult Weight:'}</span>
                <span className="font-bold">{breedInfo.typicalWeightRange}</span>
              </div>
            </div>

            {/* 4. Feeding Requirements */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '4. خوراک اور نیوٹریشن' : '4. Nutritional Requirements'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.feedingRequirementsUr : breedInfo.feedingRequirementsEn}
              </p>
            </div>

            {/* 5. Housing & Environment */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '5. ماحول اور باڑے کی ساخت' : '5. Housing & Climate'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.housingEnvironmentUr : breedInfo.housingEnvironmentEn}
              </p>
            </div>

            {/* 6. Reproduction Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '6. افزائشِ نسل اور حمل' : '6. Reproduction & Calving'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.reproductionInfoUr : breedInfo.reproductionInfoEn}
              </p>
            </div>

            {/* 7. Common Diseases */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '7. عام بیماریاں' : '7. Susceptible Diseases'}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {breedInfo.commonDiseases.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-medium text-[11px] border border-red-100">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* 8. Vaccination Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '8. حفاظتی ٹیکے (ویکسین)' : '8. Vaccination Schedule'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.vaccinationInfoUr : breedInfo.vaccinationInfoEn}
              </p>
            </div>

            {/* 9. Economic & Agricultural Uses */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-brand-800">
                {isUrdu ? '9. معاشی اور زرعی فوائد' : '9. Economic & Dairy Uses'}
              </h5>
              <p className="leading-relaxed">
                {isUrdu ? breedInfo.economicUsesUr : breedInfo.economicUsesEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
