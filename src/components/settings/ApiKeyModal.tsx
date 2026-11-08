import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import {
  getStoredApiKey,
  saveApiKey,
  isValidApiKeyFormat,
  testServerProxyConnection,
} from '../../services/aiService';
import { isSupabaseConfigured } from '../../services/supabase';
import {
  Key,
  CheckCircle,
  AlertTriangle,
  X,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  Database,
  Lock,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [testingProxy, setTestingProxy] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<{
    success: boolean;
    isConfigured: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const supabaseActive = isSupabaseConfigured();
  const isFormatValid = keyInput.trim() === '' || isValidApiKeyFormat(keyInput);

  const handleTestProxy = async () => {
    setTestingProxy(true);
    setProxyTestResult(null);
    try {
      const res = await testServerProxyConnection();
      setProxyTestResult(res);
    } catch (err: any) {
      setProxyTestResult({
        success: false,
        isConfigured: supabaseActive,
        message: err?.message || 'Server proxy connection failed.',
      });
    } finally {
      setTestingProxy(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveApiKey(keyInput);
    if (!res.success) {
      setSaveStatus(res.error || 'Failed to save key');
      return;
    }

    setSaveStatus(isUrdu ? 'سیٹنگز محفوظ ہو گئیں!' : 'Configuration securely saved!');
    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKeyInput('');
    saveApiKey('');
    setProxyTestResult(null);
    setSaveStatus(isUrdu ? 'کی ہٹا دی گئی' : 'Local key removed');
    setTimeout(() => setSaveStatus(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isUrdu ? 'اے آئی سیکیورٹی و پراکسی سیٹنگز' : 'Secure Multimodal AI Configuration'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'سرور سائیڈ جیمنائی پراکسی و زیرو ایکسپوزر آرکیٹیکچر' : 'Server-Side Gemini Edge Proxy & Zero-Leak Architecture'}
            </p>
          </div>
        </div>

        {/* Security Architecture Badge */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-1">
            <p className="font-bold">
              {isUrdu ? 'محفوظ زیرو براؤزر ایکسپوزر پروٹوکول' : 'Hardened Server Proxy Active'}
            </p>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              {isUrdu
                ? 'پلیٹ فارم کی حفاظت کے پیش نظر جیمنائی API کیز کلائنٹ براؤزر میں ایکسپوز نہیں کی جاتیں، بلکہ سپابیس والٹ (Supabase Vault) میں بطور سرور سیکرٹ محفوظ رہتی ہیں۔'
                : 'API credentials are never baked into client JavaScript bundles. Production vision scans and veterinary triage route through the server-side Supabase Edge Function proxy.'}
            </p>
          </div>
        </div>

        {/* Backend Status Box */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-slate-500" />
              {isUrdu ? 'کلاؤڈ پراکسی کی حالت:' : 'Cloud Proxy Backend:'}
            </span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                supabaseActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {supabaseActive
                ? isUrdu
                  ? 'آن لائن (سپابیس کنیکٹڈ)'
                  : 'Configured (Supabase)'
                : isUrdu
                ? 'آف لائن ویٹرنری ریفرنس موڈ'
                : 'Offline Clinical Reference Mode'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            {supabaseActive
              ? isUrdu
                ? 'سپابیس ایج پراکسی فعال ہے اور تمام ملٹی موڈل درخواستیں سرور والٹ کے ذریعے پراسیس ہوں گی۔'
                : 'Supabase Edge Proxy is configured. Multimodal AI requests authenticate through server vault.'
              : isUrdu
              ? 'کلاؤڈ کنفیگریشن نہ ہونے کی صورت میں سسٹم بغیر کسی تعطل کے معیاری آف لائن ویٹرنری کلینیکل ڈیٹا بیس استعمال کرتا ہے۔'
              : 'When cloud credentials are not active, the system safely operates using the offline veterinary clinical disease engine.'}
          </p>

          <div className="pt-1">
            <button
              type="button"
              disabled={testingProxy}
              onClick={handleTestProxy}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              {testingProxy ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
              ) : (
                <Database className="w-3.5 h-3.5 text-brand-600" />
              )}
              <span>
                {testingProxy
                  ? isUrdu
                    ? 'پراکسی ٹیسٹ جاری ہے...'
                    : 'Testing Server Proxy...'
                  : isUrdu
                  ? 'سرور پراکسی کنکشن ٹیسٹ کریں'
                  : 'Test Server Proxy Connection'}
              </span>
            </button>
          </div>
        </div>

        {/* Proxy Test Status Banner */}
        {proxyTestResult && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-start gap-2 border animate-fade-in ${
              proxyTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {proxyTestResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{proxyTestResult.message}</span>
          </div>
        )}

        {/* Optional Local Key Cleanup / Storage Section */}
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {isUrdu ? 'مقامی کی اوور رائیڈ (اختیاری ڈویلپر موڈ)' : 'Local Storage Key Override (Developer Testing)'}
              </label>
              {keyInput && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isFormatValid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {isFormatValid ? '✓ Valid Format' : '✗ Invalid Prefix'}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setProxyTestResult(null);
                }}
                placeholder="AIzaSy... or AQ...."
                className={`w-full pl-3 pr-16 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                  isFormatValid ? 'border-slate-200 focus:ring-brand-500' : 'border-red-300 focus:ring-red-500'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {keyInput && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                {isUrdu ? 'مقامی کی ختم کریں' : 'Clear Local Key'}
              </button>
            </div>
          )}

          {saveStatus && (
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <a
              href="https://supabase.com/docs/guides/functions/secrets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1 text-[11px]"
            >
              <span>{isUrdu ? 'سرور سیکرٹس گائیڈ' : 'Supabase Secrets Guide'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
              <button
                type="submit"
                disabled={!isFormatValid}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition shadow-md shadow-brand-600/20 disabled:opacity-50"
              >
                {isUrdu ? 'محفوظ کریں' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
