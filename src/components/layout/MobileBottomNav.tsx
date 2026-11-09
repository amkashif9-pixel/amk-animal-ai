import React from 'react';
import { useLanguage } from '../../i18n';
import { Home, Camera, Activity, Beef, Menu, X } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  isMenuOpen,
  onToggleMenu,
}) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const quickItems = [
    { id: 'home', label: isUrdu ? 'ہوم' : 'Home', icon: Home },
    { id: 'scanner', label: isUrdu ? 'سکینر' : 'Scanner', icon: Camera },
    { id: 'health', label: isUrdu ? 'صحت' : 'Health', icon: Activity },
    { id: 'meatYield', label: isUrdu ? 'گوشت' : 'Yield', icon: Beef },
  ];

  return (
    <nav
      className="xl:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto px-1">
        {quickItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id && !isMenuOpen;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 hover:text-emerald-800 font-medium'
              }`}
              style={{ minHeight: '44px' }}
            >
              {isActive && (
                <span className="absolute top-1 w-8 h-1 rounded-full bg-emerald-600" />
              )}
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-100/70 text-emerald-800' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* 5th item: More Menu Toggle */}
        <button
          onClick={onToggleMenu}
          className={`flex flex-col items-center justify-center gap-0.5 transition-all relative ${
            isMenuOpen
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-emerald-800 font-medium'
          }`}
          style={{ minHeight: '44px' }}
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMenuOpen && (
            <span className="absolute top-1 w-8 h-1 rounded-full bg-emerald-600" />
          )}
          <div
            className={`p-1 rounded-xl transition-colors ${
              isMenuOpen ? 'bg-emerald-100 text-emerald-800' : ''
            }`}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </div>
          <span className="text-[10px] leading-none">
            {isMenuOpen ? (isUrdu ? 'بند کریں' : 'Close') : isUrdu ? 'مینو' : 'Menu'}
          </span>
        </button>
      </div>
    </nav>
  );
};
