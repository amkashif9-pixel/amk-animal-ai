import React from 'react';
import { useLanguage } from '../../i18n';
import { Logo } from '../common/Logo';
import { Phone, MessageCircle, Mail, MapPin, Shield, Heart } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  return (
    <footer className="bg-emerald-950 text-slate-200 pt-16 pb-12 border-t-4 border-emerald-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-3 inline-block shadow-lg border border-emerald-300">
              <Logo size="md" />
            </div>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {isUrdu
                ? 'پاکستان اور بین الاقوامی لائیو اسٹاک کا سب سے جدید، سائنسی اور قابلِ اعتماد اے آئی ویٹرنری پلیٹ فارم۔'
                : 'The premier AI-powered livestock identification, veterinary triage, meat yield estimation, and mandi trading platform.'}
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/923346682654"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-900/40"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp: +923346682654</span>
              </a>
            </div>
          </div>

          {/* Quick Platform Services */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              {isUrdu ? 'سروسز اور ماڈیولز' : 'Core Capabilities'}
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <button onClick={() => onNavigate('scanner')} className="hover:text-emerald-300 transition">
                  {t.nav.scanner}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('meatYield')} className="hover:text-emerald-300 transition">
                  {isUrdu ? 'گوشت کی پیداوار (Yield)' : 'Meat Yield Estimator'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('health')} className="hover:text-emerald-300 transition">
                  {t.nav.health}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketPrice')} className="hover:text-emerald-300 transition">
                  {t.nav.marketPrice}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nutrition')} className="hover:text-emerald-300 transition">
                  {t.nav.nutrition}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calendar')} className="hover:text-emerald-300 transition">
                  {t.nav.calendar}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-300 transition">
                  {t.nav.marketplace}
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Livestock */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
              {isUrdu ? 'لائیو اسٹاک اور پرندے' : 'Supported Animals'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>{isUrdu ? '• ڈیری گائے (ساہیوال، چولستانی، فریزن)' : '• Dairy Cattle (Sahiwal, Cholistani, Friesian)'}</li>
              <li>{isUrdu ? '• بھینس (نیلی راوی، کنڈی)' : '• Dairy Buffalo (Nili-Ravi, Kundi)'}</li>
              <li>{isUrdu ? '• بکریاں (بیتل، ٹیڈی، کاموری)' : '• Goats (Beetal, Teddy, Kamori)'}</li>
              <li>{isUrdu ? '• بھیڑ و چھترے (کجلی، لوہی، بلخی)' : '• Sheep & Rams (Kajli, Lohi, Balkhi)'}</li>
              <li>{isUrdu ? '• مرغیاں (اصیل، گولڈن مصری، دیسی)' : '• Poultry (Aseel, Desi, Misri Layers)'}</li>
              <li>{isUrdu ? '• گھوڑے، اونٹ اور پالتو کتے بلیاں' : '• Equines, Camels, Bully Kutta & Pets'}</li>
            </ul>
          </div>

          {/* Veterinary Legal Disclaimer */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4 flex items-center gap-1.5 text-amber-400">
              <Shield className="w-4 h-4" />
              <span>{isUrdu ? 'ویٹرنری قانونی انتباہ' : 'Veterinary Disclaimer'}</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isUrdu
                ? 'اس پلیٹ فارم پر موجود تمام معلومات اور تجاویز تعلیمی اور ابتدائی رہنمائی کے لیے ہیں۔ یہ کسی مستند ویٹرنری ڈاکٹر (RVMP) کے کلینیکل معائنے کا متبادل نہیں ہیں۔ ایمرجنسی میں فوری ڈاکٹر سے رابطہ کریں۔'
                : 'All diagnostic triage and nutrition metrics are provided for informational and preliminary reference only. Never administer prescription antibiotics or surgical interventions without physical examination by a registered veterinary medical practitioner (RVMP).'}
            </p>
          </div>
        </div>

        {/* Bottom Bar with Mandatory Signature */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span>© {new Date().getFullYear()} AMK Animal AI. All rights reserved.</span>
          </div>

          {/* Mandatory Brand Signature */}
          <div className="px-4 py-2 rounded-xl bg-forest-900/80 border border-forest-800 text-brand-300 font-semibold tracking-wide text-center">
            AMK Animal AI | By amkashif | WhatsApp: +923346682654
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for Animal Welfare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
