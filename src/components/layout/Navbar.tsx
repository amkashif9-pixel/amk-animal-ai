import React, { useState } from 'react';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { LanguageSwitch } from './LanguageSwitch';
import { UserRole } from '../../types/user';
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
  ShieldCheck,
  Beef,
  Menu,
  X,
  Settings,
  ChevronDown,
  User,
  Home,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenSettings,
  mobileMenuOpen: externalMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { user, loginAsDemo, isAdmin } = useAuth();
  const isProductionPublic = import.meta.env.PROD && !user;

  // Local state if not controlled externally
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isMenuOpen =
    externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;

  const toggleMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMobileMenuOpen((prev) => !prev);
    }
  };

  const closeMenu = () => {
    if (onToggleMobileMenu && isMenuOpen) {
      onToggleMobileMenu();
    } else {
      setInternalMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'scanner', label: t.nav.scanner, icon: Camera, category: 'ai' },
    { id: 'health', label: t.nav.health, icon: Activity, category: 'ai' },
    { id: 'marketPrice', label: t.nav.marketPrice, icon: Calculator, category: 'ai' },
    { id: 'meatYield', label: t.nav.meatYield, icon: Beef, category: 'ai' },
    { id: 'nutrition', label: t.nav.nutrition, icon: Wheat, category: 'farm' },
    { id: 'calendar', label: t.nav.calendar, icon: Calendar, category: 'farm' },
    { id: 'profiles', label: t.nav.profiles, icon: FolderHeart, category: 'farm' },
    { id: 'marketplace', label: t.nav.marketplace, icon: ShoppingBag, category: 'community' },
    { id: 'vets', label: t.nav.vets, icon: Stethoscope, category: 'community' },
    { id: 'chat', label: t.nav.chat, icon: MessageSquareText, category: 'community' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    closeMenu();
  };

  const handleRoleChange = (role: UserRole) => {
    loginAsDemo(role);
    setRoleDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left focus:outline-none group shrink-0 min-h-[44px]"
              aria-label="AMK Animal AI Home"
            >
              <Logo size="sm" className="sm:hidden" showTagline={false} />
              <Logo size="md" className="hidden sm:flex" />
            </button>

            {/* Desktop Navigation Links (xl screens only) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700/70'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Admin console button if admin */}
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentTab === 'admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t.nav.admin}</span>
                </button>
              )}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <LanguageSwitch />

              {/* Role Switcher Pill or Public Mode Badge (Desktop only) */}
              {isProductionPublic ? (
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 text-xs font-semibold select-none"
                  title={isUrdu ? 'پبلک کسان رسائی موڈ' : 'Public Farmer Access Mode'}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-900">
                    {isUrdu ? 'کسان رسائی' : 'Farmer Access'}
                  </span>
                </div>
              ) : (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 text-emerald-950 text-xs font-medium transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold capitalize text-emerald-900">
                      {user?.role === 'admin'
                        ? 'Admin'
                        : user?.role === 'veterinarian'
                        ? 'Doctor'
                        : user?.role === 'trader'
                        ? 'Trader'
                        : 'Farmer'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in text-xs">
                      <div className="px-3 py-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        Switch User Role
                      </div>
                      <button
                        onClick={() => handleRoleChange('farmer')}
                        className="w-full text-left px-3 py-2 hover:bg-brand-50 flex items-center justify-between text-slate-700 font-medium"
                      >
                        <span>🌾 Dairy / Livestock Farmer</span>
                        {user?.role === 'farmer' && <span className="text-brand-600 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => handleRoleChange('veterinarian')}
                        className="w-full text-left px-3 py-2 hover:bg-brand-50 flex items-center justify-between text-slate-700 font-medium"
                      >
                        <span>🩺 Licensed Vet (RVMP)</span>
                        {user?.role === 'veterinarian' && <span className="text-brand-600 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => handleRoleChange('admin')}
                        className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between text-amber-800 font-bold"
                      >
                        <span>🛡️ System Admin (amkashif)</span>
                        {user?.role === 'admin' && <span className="text-amber-600 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => handleRoleChange('trader')}
                        className="w-full text-left px-3 py-2 hover:bg-brand-50 flex items-center justify-between text-slate-700 font-medium"
                      >
                        <span>🐂 Mandi Trader (بیوپاری)</span>
                        {user?.role === 'trader' && <span className="text-brand-600 font-bold">✓</span>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* API Settings Trigger */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Multimodal AI Settings"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-emerald-800" />
              </button>

              {/* Mobile Menu Hamburger (Visible on < xl screens) */}
              <button
                onClick={toggleMenu}
                className="xl:hidden p-2 rounded-xl text-emerald-900 hover:bg-emerald-50 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-emerald-800" />
                ) : (
                  <Menu className="w-6 h-6 text-emerald-800" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Full Navigation Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            className="fixed inset-0 top-16 sm:top-20 bg-slate-900/40 backdrop-blur-xs z-40 xl:hidden animate-fade-in"
          />

          {/* Slide-down Drawer */}
          <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 bg-white z-50 overflow-y-auto px-4 py-5 shadow-2xl xl:hidden space-y-5 animate-fade-in pb-24">
            {/* Quick Home Button */}
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                currentTab === 'home'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${currentTab === 'home' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <span>{isUrdu ? 'مرکزی صفحہ (Home Page)' : 'Home Overview'}</span>
              </div>
              <span className="text-xs font-semibold opacity-80">
                {currentTab === 'home' ? '✓ Active' : '→'}
              </span>
            </button>

            {/* Section 1: AI Tools */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {isUrdu ? 'بنیادی اے آئی ٹولز (AI Capabilities)' : 'Core AI Tools'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'scanner', label: t.nav.scanner, sub: isUrdu ? 'تصویر و ویڈیو سے شناخت' : 'Breed & BCS Vision', icon: Camera },
                  { id: 'health', label: t.nav.health, sub: isUrdu ? 'بیماری و ابتدائی طبی امداد' : 'Clinical Triage & First Aid', icon: Activity },
                  { id: 'meatYield', label: t.nav.meatYield, sub: isUrdu ? 'صاف گوشت و منافع کا حساب' : 'Carcass Yield & Pricing', icon: Beef },
                  { id: 'marketPrice', label: t.nav.marketPrice, sub: isUrdu ? 'پاکستان منڈی کے ریٹس' : 'Livestock Market Valuation', icon: Calculator },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 shadow-xs'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs sm:text-sm font-extrabold truncate">{item.label}</span>
                        <span className={`block text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Farm Management */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {isUrdu ? 'فارم مینجمنٹ (Farm Records)' : 'Farm Management'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'profiles', label: t.nav.profiles, sub: isUrdu ? 'دودھ و ریوڑ ریکارڈ' : 'Herd & Milk Passports', icon: FolderHeart },
                  { id: 'nutrition', label: t.nav.nutrition, sub: isUrdu ? 'متوازن ونڈا راشن' : 'Dairy Feed Ration', icon: Wheat },
                  { id: 'calendar', label: t.nav.calendar, sub: isUrdu ? 'ویکسینیشن کیلنڈر' : 'Vaccine Schedules', icon: Calendar },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 shadow-xs'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs sm:text-sm font-extrabold truncate">{item.label}</span>
                        <span className={`block text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Community & Advisory */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {isUrdu ? 'کمیونٹی و مشاورت (Advisory & Market)' : 'Community & Advisory'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'chat', label: t.nav.chat, sub: isUrdu ? '24/7 اے آئی مشاورت' : 'Bilingual AI Consultant', icon: MessageSquareText },
                  { id: 'marketplace', label: t.nav.marketplace, sub: isUrdu ? 'مویشی خرید و فروخت' : 'Livestock Listings', icon: ShoppingBag },
                  { id: 'vets', label: t.nav.vets, sub: isUrdu ? 'ویٹرنری ڈاکٹرز' : 'Verified RVMP Doctors', icon: Stethoscope },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 shadow-xs'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs sm:text-sm font-extrabold truncate">{item.label}</span>
                        <span className={`block text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Console Access in Drawer */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>{t.nav.admin}</span>
                </div>
                <span>→</span>
              </button>
            )}

            {/* Footer Support in Drawer */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <a
                href="https://wa.me/923346682654"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +923346682654</span>
              </a>

              <button
                onClick={() => {
                  closeMenu();
                  onOpenSettings();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                <Settings className="w-4 h-4" />
                <span>{isUrdu ? 'اے آئی سیٹنگز (API Key)' : 'AI Settings'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
