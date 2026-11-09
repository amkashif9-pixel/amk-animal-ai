import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { Download, Smartphone, X, Check, Copy, Share2, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const installUrl = 'https://amk-animal-ai.vercel.app/';
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    'AMK Animal AI — لائیو مویشی اے آئی ایپ اپنے موبائل پر انسٹال کریں:\nhttps://amk-animal-ai.vercel.app/'
  )}`;

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);

      const dismissedState = localStorage.getItem('amk_pwa_banner_dismissed');
      if (dismissedState === 'true') {
        setIsDismissed(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
          setInstallPrompt(null);
        }
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('amk_pwa_banner_dismissed', 'true');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(installUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Banner on Mobile & Desktop */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-3 sm:px-4 py-2.5 shadow-md relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="p-1 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-100" />
            </span>
            <span>
              {isUrdu
                ? '📱 AMK Animal AI کو اپنے موبائل پر ایپ کی طرح انسٹال کریں'
                : '📱 Install AMK Animal AI as an app on your phone'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-emerald-800 font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? 'انسٹال کریں' : 'Install App'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 transition-colors"
              title={isUrdu ? 'واٹس ایپ پر لنک بھیجیں' : 'Send link via WhatsApp'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
            </a>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal for Manual Installation or WhatsApp Sharing */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-emerald-100 text-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {isUrdu ? 'موبائل پر انسٹال کرنے کا طریقہ' : 'How to Install on Mobile'}
                  </h3>
                  <p className="text-xs text-slate-500">AMK Animal AI Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Link Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-600">
                {isUrdu ? 'موبائل کے لیے ڈائریکٹ لنک:' : 'Direct Link for Mobile:'}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={installUrl}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'کاپی' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Easy Steps for Android and iPhone */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>{isUrdu ? 'اینڈرائیڈ (Chrome Browser):' : 'Android (Chrome):'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>{isUrdu ? 'کروم میں لنک کھولیں' : 'Open link in Chrome'}</li>
                  <li>
                    {isUrdu
                      ? 'اوپر دائیں جانب تین نقطوں (⋮) پر کلک کریں'
                      : 'Tap the 3 dots (⋮) in the top right'}
                  </li>
                  <li>
                    {isUrdu
                      ? '"Install app" یا "Add to Home screen" منتخب کریں'
                      : 'Tap "Install app" or "Add to Home screen"'}
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🍎</span>
                  <span>{isUrdu ? 'آئی فون (Safari Browser):' : 'iPhone (Safari):'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>{isUrdu ? 'سفاری میں لنک کھولیں' : 'Open link in Safari'}</li>
                  <li>
                    {isUrdu
                      ? 'نیچے شیئر بٹن (Share ⎋) دبائیں'
                      : 'Tap Share button (⎋) at the bottom'}
                  </li>
                  <li>
                    {isUrdu
                      ? '"Add to Home Screen" منتخب کریں'
                      : 'Select "Add to Home Screen"'}
                  </li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>{isUrdu ? 'اپنے واٹس ایپ پر بھیجیں' : 'Share to WhatsApp'}</span>
              </a>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
