import React from 'react';
import { useLanguage } from '../../i18n';
import { Globe } from 'lucide-react';

export const LanguageSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('ur')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          language === 'ur'
            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-urdu'
            : 'text-slate-600 hover:text-slate-900 font-urdu'
        }`}
        title="پاکستانی اردو"
      >
        <span className="text-base leading-none">🇵🇰</span>
        <span>اردو</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          language === 'en'
            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-sans'
            : 'text-slate-600 hover:text-slate-900 font-sans'
        }`}
        title="English"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>English</span>
      </button>
    </div>
  );
};
