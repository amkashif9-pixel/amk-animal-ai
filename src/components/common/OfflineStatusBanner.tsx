import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { WifiOff, Wifi, CheckCircle2, X } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineAlert(true);
      const timer = setTimeout(() => {
        setShowOnlineAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showOnlineAlert) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-between transition-all animate-fade-in z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-100 shrink-0" />
          <span>
            {isUrdu
              ? '✅ انٹرنیٹ کنکشن بحال ہو گیا ہے (آن لائن موڈ)'
              : '✅ Internet connection restored (Online Mode)'}
          </span>
        </div>
      </div>
    );
  }

  if (!isOffline || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shadow-md relative z-40 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-white/20 shrink-0">
            <WifiOff className="w-4 h-4 text-amber-100" />
          </span>
          <span className="leading-snug">
            {isUrdu
              ? '📶 آپ آف لائن ہیں۔ فکر نہ کریں! تمام ریکارڈز، کلینیکل رولز اور حساب کتاب انٹرنیٹ کے بغیر کام کر رہے ہیں۔'
              : '📶 You are offline. Don\'t worry! All clinical rules, herd records & calculators work 100% offline.'}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-200 hover:text-white rounded-md shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
