import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { ALL_SPECIES, ALL_BREEDS } from '../../data/speciesData';
import {
  Camera,
  Activity,
  Calculator,
  Wheat,
  Calendar,
  FolderHeart,
  ShoppingBag,
  Stethoscope,
  MessageSquareText,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  Play,
  HeartHandshake,
  Award,
  Beef,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, params?: { species?: string; breed?: string }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'livestock' | 'poultry' | 'pets'>('all');

  const faqs = [
    {
      qEn: 'How does the AMK Animal AI Scanner identify breeds and health conditions?',
      qUr: 'اے ایم کے اینیمل اے آئی سکینر نسل اور بیماریوں کی شناخت کیسے کرتا ہے؟',
      aEn: 'Our platform uses high-precision multimodal vision intelligence combined with a verified veterinary decision engine. It evaluates coat patterns, horn curvature, muzzle dentition, body condition scores (BCS), and visible symptoms while strictly declaring scientific confidence levels without fabricating certainty.',
      aUr: 'ہمارا پلیٹ فارم جدید ترین ملٹی موڈل ویژن انٹیلیجنس اور تصدیق شدہ ویٹرنری ڈیٹا بیس کو یکجا کرتا ہے۔ یہ جانور کے چہرے، سینگ، کھر، باڈی سکور (BCS) اور ظاہری علامات کا تجزیہ کر کے سائنسی بنیادوں پر رپورٹ تیار کرتا ہے۔',
    },
    {
      qEn: 'Does the AI Health Assistant replace an in-person veterinarian?',
      qUr: 'کیا اے آئی ہیلتھ اسسٹنٹ اصلی ویٹرنری ڈاکٹر کا متبادل ہے؟',
      aEn: 'No. The AI Health Assistant provides preliminary clinical triage, emergency detection, and supportive first-aid protocols. It never prescribes dangerous antibiotics or injections without veterinary oversight. For emergencies, always contact a licensed RVMP veterinarian.',
      aUr: 'ہرگز نہیں۔ یہ سسٹم صرف ابتدائی طبی امداد، خطرے کی سطح اور احتیاطی تدابیر بتاتا ہے۔ یہ کسی مستند ویٹرنری ڈاکٹر (RVMP) کے معائنے کا نعم البدل نہیں ہے۔ ڈاکٹر کے مشورے کے بغیر اینٹی بائیوٹک یا خطرناک انجیکشن کبھی خود سے نہ لگائیں۔',
    },
    {
      qEn: 'How accurate is the Animal Mandi Price Estimator for Pakistan?',
      qUr: 'پاکستان کی مویشی منڈیوں کے لیے پرائس کیلکولیٹر کتنا درست ہے؟',
      aEn: 'Valuations are calculated using live bodyweight baselines, dentition factors (دوندہ، چوگا), milk yield (L/day), and district trends across major livestock markets like Shahpur Kanjra, Multan, and Faisalabad. It provides approximate fair market ranges.',
      aUr: 'یہ تخمینہ جانور کے زندہ وزن، دانتوں کی عمر (دوندہ، چوگا)، روزانہ دودھ کی پیداوار، اور پنجاب و سندھ کی مرکزی مویشی منڈیوں کے تازہ ترین رجحانات کے مطابق شفاف تخمینہ پیش کرتا ہے۔',
    },
    {
      qEn: 'Can I track individual animal medical passports and daily milk yields?',
      qUr: 'کیا میں اپنے جانوروں کا میڈیکل پاسپورٹ اور روزانہ دودھ کا ریکارڈ رکھ سکتا ہوں؟',
      aEn: 'Yes! The "My Animals" module allows you to register individual ear-tag profiles, log daily morning and evening milk yields, track weight growth trends, and export printable medical passports.',
      aUr: 'جی ہاں! "میرے جانور" ماڈیول میں آپ ہر گائے، بھینس یا بکرے کا الگ شناختی پروفائل بنا سکتے ہیں، روزانہ دودھ درج کر سکتے ہیں، اور پرنٹ کے قابل میڈیکل پاسپورٹ ڈاؤن لوڈ کر سکتے ہیں۔',
    },
  ];

  const filteredSpecies =
    selectedCategoryTab === 'all'
      ? ALL_SPECIES
      : ALL_SPECIES.filter((s) => s.category === selectedCategoryTab);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-emerald-100">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Monogram Emblem Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-950 shadow-sm animate-fade-in">
              <img
                src={`${import.meta.env.BASE_URL}amk-monogram.jpg`}
                alt="AMK Monogram"
                className="w-6 h-6 rounded-full object-cover shadow-xs border border-emerald-500"
              />
              <span className="text-xs font-bold tracking-wide uppercase text-emerald-800">
                {isUrdu ? 'اے ایم کے اینیمل اے آئی • اعتماد • جدت • مہارت' : 'AMK Animal AI • Trust • Innovation • Excellence'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {isUrdu ? (
                <>
                  ہر جانور کی درست <span className="text-emerald-700">شناخت</span> اور سائنسی <span className="text-emerald-700">نگہداشت</span>
                </>
              ) : (
                <>
                  Know Every Animal.{' '}
                  <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 bg-clip-text text-transparent">
                    Understand Every Need.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              {t.hero.subtitle}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('scanner')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5" />
                <span>{t.hero.scanNow}</span>
              </button>

              <button
                onClick={() => onNavigate('meatYield')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-300 font-bold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2.5 transition"
              >
                <Beef className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'گوشت کی پیداوار (Yield)' : 'Meat Yield Estimator'}</span>
              </button>

              <button
                onClick={() => onNavigate('health')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2.5 transition"
              >
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>{t.hero.healthCheck}</span>
              </button>
            </div>

            {/* Hero Visual Livestock Card with AMK Watermark */}
            <div className="pt-6">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-200 shadow-2xl shadow-emerald-900/10 max-w-4xl mx-auto group">
                <img
                  src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80"
                  alt="AMK Elite Livestock in Green Pasture"
                  className="w-full h-64 sm:h-80 object-cover transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${import.meta.env.BASE_URL}amk-monogram.jpg`}
                        alt="AMK Monogram"
                        className="w-12 h-12 rounded-xl border border-white/40 shadow-lg object-cover"
                      />
                      <div>
                        <span className="text-sm font-black tracking-wide text-white block">
                          AMK Animal Vision & Triage
                        </span>
                        <span className="text-xs text-emerald-200 font-medium">
                          {isUrdu ? 'تصدیق شدہ نسل، لائیو وزن اور بیماریوں کی سائنسی تفریق' : 'Scientific Breed Identification, Live Weight & Veterinary Triage'}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{isUrdu ? 'اے آئی ایکٹو ہے' : 'AI Active & Ready'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Metrics Strip */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-emerald-100 max-w-2xl mx-auto text-center">
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block">10,000+</span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {t.hero.activeFarmers}
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 block">98.4%</span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {t.hero.accuracyRate}
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block">250+</span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {t.hero.verifiedVets}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE ACTION MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'اے ایم کے سمارٹ ٹیکنالوجی' : 'Next-Gen Livestock Tools'}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isUrdu ? 'پلیٹ فارم کے بنیادی ماڈیولز' : 'Comprehensive AI Capabilities'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {isUrdu
              ? 'جانوروں کے علاج، خوراک، منڈی، گوشت کی پیداوار اور شناخت کے تمام جدید ٹولز ایک ہی جگہ پر'
              : 'Engineered for dairy farmers, veterinary surgeons, feedlot operators, and livestock traders'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Scanner */}
          <div
            onClick={() => onNavigate('scanner')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80"
                alt="AI Animal Scanner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multimodal Vision</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.scannerTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.scannerDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'سکین شروع کریں' : 'Launch Vision Scanner'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 2: AI Meat Yield Estimator */}
          <div
            onClick={() => onNavigate('meatYield')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80"
                alt="AI Meat Yield Estimator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Beef className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carcass & Meat Yield</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {isUrdu ? 'اے آئی گوشت کی پیداوار کیلکولیٹر' : 'AI Meat Yield Estimator'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isUrdu
                    ? 'ذبح سے قبل زندہ وزن، کارکس وزن، بون لیس، ہڈی اور چربی کے سائنسی تناسب کا درست تخمینہ۔'
                    : 'Accurate pre-slaughter live weight, dressing percentage, boneless meat, bone, and fat distribution.'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'گوشت کا تخمینہ لگائیں' : 'Calculate Meat Yield'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 3: Health Assistant */}
          <div
            onClick={() => onNavigate('health')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80"
                alt="Veterinary Health Assistant"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clinical Triage</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.healthTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.healthDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'علامات کی جانچ' : 'Check Symptoms'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 4: Mandi Price Estimator */}
          <div
            onClick={() => onNavigate('marketPrice')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80"
                alt="Mandi Price Estimator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fair Valuation</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.marketTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.marketDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'منڈی قیمت معلوم کریں' : 'Estimate Mandi Price'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 5: Nutrition Planner */}
          <div
            onClick={() => onNavigate('nutrition')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80"
                alt="Nutrition Planner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                <span>Balanced Feeding</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.nutritionTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.nutritionDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'راشن شیڈول بنائیں' : 'Calculate Ration'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 6: Care Calendar */}
          <div
            onClick={() => onNavigate('calendar')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
                alt="Vaccination Calendar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preventive Care</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.calendarTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.calendarDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'کیلنڈر دیکھیں' : 'View Calendar'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 7: Animal Profiles */}
          <div
            onClick={() => onNavigate('profiles')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"
                alt="Herd Management"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <FolderHeart className="w-3.5 h-3.5 text-emerald-600" />
                <span>Herd Passport</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.profilesTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.profilesDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'ریوڑ مینیج کریں' : 'Open Herd Passport'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 8: Marketplace */}
          <div
            onClick={() => onNavigate('marketplace')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
                alt="Animal Marketplace"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Trading</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.marketplaceTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.marketplaceDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'منڈی دیکھیں' : 'Browse Livestock'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 9: Find a Vet */}
          <div
            onClick={() => onNavigate('vets')}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
                alt="Veterinary Doctors"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>RVMP Doctors</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t.features.vetsTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.features.vetsDesc}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                <span>{isUrdu ? 'ڈاکٹرز کی فہرست' : 'Find RVMP Doctor'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ANIMAL CATEGORIES EXPLORER (Requirement 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isUrdu ? 'جانوروں کی اقسام اور نسلی انسائیکلوپیڈیا' : 'Expandable Animal Species & Breeds Catalog'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isUrdu
                ? 'تمام عام اور نایاب فارمی مویشی، پولٹری اور پالتو جانور'
                : 'Scientific taxonomy, physical traits, average weight ranges, and production metrics'}
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold">
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCategoryTab === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategoryTab('livestock')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCategoryTab === 'livestock' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              {isUrdu ? 'مویشی' : 'Livestock'}
            </button>
            <button
              onClick={() => setSelectedCategoryTab('poultry')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCategoryTab === 'poultry' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              {isUrdu ? 'پرندے' : 'Poultry'}
            </button>
            <button
              onClick={() => setSelectedCategoryTab('pets')}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCategoryTab === 'pets' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              {isUrdu ? 'پالتو' : 'Pets'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredSpecies.map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigate('scanner', { species: s.name })}
              className="p-3.5 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 shadow-xs hover:shadow-lg transition cursor-pointer group text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 shadow-xs border border-emerald-100 bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-3xl">{s.icon}</span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {isUrdu ? s.nameUrdu : s.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">
                {s.scientificName}
              </span>
              <span className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {s.commonBreedsCount} Breeds
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'عام سوالات و جوابات' : 'Knowledge & FAQ'}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isUrdu ? 'اکثر پوچھے جانے والے سوالات' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-brand-700 transition"
                >
                  <span>{isUrdu ? faq.qUr : faq.qEn}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {isUrdu ? faq.aUr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
