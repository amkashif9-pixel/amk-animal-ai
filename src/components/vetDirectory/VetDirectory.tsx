import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { Veterinarian } from '../../types/vet';
import { getAllVeterinarians, subscribeToVets } from '../../services/vetService';
import {
  Stethoscope,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Star,
  Clock,
  Home,
  Video,
  Hospital,
  Compass,
} from 'lucide-react';

export const VetDirectory: React.FC = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [vets, setVets] = useState<Veterinarian[]>(() => getAllVeterinarians());
  const [searchCity, setSearchCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToVets((updatedList) => {
      setVets(updatedList);
    });
    return unsubscribe;
  }, []);

  const filteredVets = vets.filter((v) => {
    if (verifiedOnly && !v.isVerified) return false;
    if (selectedSpecialty !== 'all' && !v.specialties.includes(selectedSpecialty as any)) return false;
    if (searchCity.trim()) {
      const q = searchCity.toLowerCase();
      const match =
        v.districtCity.toLowerCase().includes(q) ||
        v.provinceState.toLowerCase().includes(q) ||
        v.nameEn.toLowerCase().includes(q) ||
        v.nameUr.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <span>{isUrdu ? 'مستند اور تصدیق شدہ ویٹرنری ڈاکٹرز' : 'Verified RVMP Doctors & Farm Consultants'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.vets.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.vets.subtitle}
        </p>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* City & District Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder={t.vets.searchCity}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">{t.vets.allSpecialties}</option>
              <option value="dairy">{isUrdu ? 'ڈیری و لائیو اسٹاک (گائے و بھینس)' : 'Dairy & Cattle Medicine'}</option>
              <option value="equine">{isUrdu ? 'گھوڑے و نیزہ بازی (Equine)' : 'Equine & Horses'}</option>
              <option value="surgery">{isUrdu ? 'سرجری و ایمرجنسی آپریشن' : 'Veterinary Surgery'}</option>
              <option value="small_animals">{isUrdu ? 'پالتو جانور (کتے و بلیاں)' : 'Pets & Small Animals'}</option>
              <option value="reproduction">{isUrdu ? 'تولید و مصنوعی تخم ریزی (AI)' : 'Reproduction & AI'}</option>
            </select>
          </div>

          {/* Verified Only Checkbox */}
          <div className="md:col-span-3 flex items-center justify-start md:justify-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.vets.verifiedOnly}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVets.map((vet) => (
          <div
            key={vet.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Doctor Avatar + License Status */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={vet.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                  alt={vet.nameEn}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-sm flex-shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {vet.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified RVMP</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {isUrdu ? vet.nameUr : vet.nameEn}
                  </h3>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    {vet.degrees}
                  </p>
                </div>
              </div>

              {/* Clinic & Location Details */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {isUrdu ? vet.clinicNameUr : vet.clinicNameEn}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    {isUrdu ? vet.fullAddressUr : vet.fullAddressEn}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{isUrdu ? vet.workingHoursUr : vet.workingHoursEn}</span>
                </div>
              </div>

              {/* Consultation Methods Badges */}
              <div className="pt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                {vet.consultationMethods.includes('farm_visit') && (
                  <span className="px-2 py-1 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    <span>{t.vets.farmVisit}</span>
                  </span>
                )}
                {vet.consultationMethods.includes('in_clinic') && (
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Hospital className="w-3 h-3" />
                    <span>{t.vets.inClinic}</span>
                  </span>
                )}
                {vet.consultationMethods.includes('emergency_24_7') && (
                  <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-600" />
                    <span>24/7 Emergency</span>
                  </span>
                )}
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`https://wa.me/${vet.whatsapp.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20Dr.%20${encodeURIComponent(vet.nameEn)},%20I%20am%20contacting%20you%20via%20AMK%20Animal%20AI%20platform%20for%20a%20veterinary%20consultation.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${vet.phone}`}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Call Clinic"
              >
                <Phone className="w-4 h-4" />
              </a>

              <a
                href={`https://www.openstreetmap.org/?mlat=${vet.latitude}&mlon=${vet.longitude}#map=16/${vet.latitude}/${vet.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title={t.vets.viewOnMap}
              >
                <Compass className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
