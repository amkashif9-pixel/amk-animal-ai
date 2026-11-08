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
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenSettings }) => {
  const { t, language } = useLanguage();
  const { user, loginAsDemo, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'scanner', label: t.nav.scanner, icon: Camera },
    { id: 'health', label: t.nav.health, icon: Activity },
    { id: 'marketPrice', label: t.nav.marketPrice, icon: Calculator },
    { id: 'meatYield', label: t.nav.meatYield, icon: Beef },
    { id: 'nutrition', label: t.nav.nutrition, icon: Wheat },
    { id: 'calendar', label: t.nav.calendar, icon: Calendar },
    { id: 'profiles', label: t.nav.profiles, icon: FolderHeart },
    { id: 'marketplace', label: t.nav.marketplace, icon: ShoppingBag },
    { id: 'vets', label: t.nav.vets, icon: Stethoscope },
    { id: 'chat', label: t.nav.chat, icon: MessageSquareText },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    loginAsDemo(role);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none group"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Navigation Links */}
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

          {/* Right Action Bar: Language switch + Role Switcher + Settings + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 text-emerald-950 text-xs font-medium transition"
                title="Switch Demo Role"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold capitalize text-emerald-900">
                  {user?.role === 'admin'
                    ? 'Admin'
                    : user?.role === 'veterinarian'
                    ? 'Doctor (RVMP)'
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

            {/* API Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Multimodal AI Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t.nav.admin}</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Role: {user?.fullName}</span>
            <button
              onClick={() => handleRoleChange(user?.role === 'admin' ? 'farmer' : 'admin')}
              className="text-brand-600 font-semibold underline"
            >
              Toggle Admin / Farmer
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
