import React from 'react';
import { useLanguage } from '../../i18n';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'monogram-only';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  variant = 'full',
}) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const iconSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-3xl',
    xl: 'text-2xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official AMK Monogram Crest */}
      <div
        className={`relative flex-shrink-0 ${iconSizes[size]} rounded-2xl p-[2px] bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-900 shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden`}
      >
        <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={`${import.meta.env.BASE_URL}amk-monogram.jpg`}
            alt="AMK Animal AI Monogram"
            className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col">
          <div className={`font-black tracking-tight text-slate-900 ${textSizes[size]} flex items-center gap-1.5 leading-none`}>
            <span className="text-emerald-800 font-extrabold">AMK</span>
            <span className="text-emerald-600 font-bold">Animal</span>
            <span className="bg-gradient-to-r from-emerald-600 to-green-800 bg-clip-text text-transparent font-black">AI</span>
          </div>
          {showTagline && (
            <span className="hidden sm:flex text-[11px] font-semibold text-emerald-800/80 leading-tight mt-1 items-center gap-1">
              <span>{isUrdu ? 'اعتماد • جدت • مہارت' : 'Trust • Innovation • Excellence'}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

