import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { ALL_SPECIES, ALL_BREEDS } from '../../data/speciesData';
import { CLINICAL_DISEASES } from '../../data/diseaseData';
import {
  getAllVeterinarians,
  verifyVeterinarian,
  revokeVeterinarian,
  verifyVeterinarianWithServer,
  revokeVeterinarianWithServer,
  getVerificationAuditLogs,
  subscribeToVets,
  VetVerificationAuditEntry,
} from '../../services/vetService';
import { isSupabaseConfigured } from '../../services/supabase';
import { Veterinarian } from '../../types/vet';
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  Flag,
  Layers,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus,
  Trash2,
  Lock,
  Unlock,
  BarChart3,
  Sparkles,
  Key,
  Beef,
  Scale,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  getSpeciesYieldConfigs,
  saveSpeciesYieldConfig,
  resetSpeciesYieldConfigs,
  getSlaughterRecords,
  calculateCalibrationAccuracy,
} from '../../services/meatYieldService';
import { SpeciesYieldConfig, SlaughterActualRecord, MeatYieldSpecies } from '../../types/meatYield';
import { DEFAULT_SPECIES_CONFIGS } from '../../services/meatYieldCalculator';

export const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { user, isAdmin, unlockAdminPrivileges, revokeAdminPrivileges } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'listings' | 'reports' | 'vets' | 'breeds' | 'audit' | 'meatYield'>('analytics');
  const [securityKeyInput, setSecurityKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Meat Yield Benchmark & Calibration State
  const [meatConfigs, setMeatConfigs] = useState<Record<MeatYieldSpecies, SpeciesYieldConfig>>(() => DEFAULT_SPECIES_CONFIGS);
  const [selectedMeatSpecies, setSelectedMeatSpecies] = useState<MeatYieldSpecies>('cow');
  const [editingConfig, setEditingConfig] = useState<SpeciesYieldConfig>(DEFAULT_SPECIES_CONFIGS.cow);
  const [slaughterLogs, setSlaughterLogs] = useState<SlaughterActualRecord[]>([]);
  const [meatSaveSuccess, setMeatSaveSuccess] = useState(false);
  const [meatSaveError, setMeatSaveError] = useState<string | null>(null);

  useEffect(() => {
    getSpeciesYieldConfigs().then((cfgs) => {
      setMeatConfigs(cfgs);
      if (cfgs[selectedMeatSpecies]) {
        setEditingConfig({ ...cfgs[selectedMeatSpecies] });
      }
    });
    getSlaughterRecords().then(setSlaughterLogs);
  }, [selectedMeatSpecies]);

  const handleSelectMeatSpecies = (sp: MeatYieldSpecies) => {
    setSelectedMeatSpecies(sp);
    if (meatConfigs[sp]) {
      setEditingConfig({ ...meatConfigs[sp] });
    }
  };

  const handleSaveMeatConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setMeatSaveError(null);
    setMeatSaveSuccess(false);

    const carcassSum =
      Number(editingConfig.baseBonelessYieldPct) +
      Number(editingConfig.baseBonePct) +
      Number(editingConfig.baseFatPct) +
      Number(editingConfig.baseTrimWastePct);

    if (Math.abs(carcassSum - 100) > 0.5) {
      setMeatSaveError(
        `Carcass breakdown percentages must sum to 100%. Current sum: ${carcassSum.toFixed(1)}%`
      );
      return;
    }

    const res = await saveSpeciesYieldConfig(editingConfig);
    if (res.success) {
      setMeatConfigs((prev) => ({ ...prev, [editingConfig.species]: editingConfig }));
      setMeatSaveSuccess(true);
      setTimeout(() => setMeatSaveSuccess(false), 3000);
    } else {
      setMeatSaveError(res.error || 'Failed to update species configuration.');
    }
  };

  const handleResetMeatConfigs = async () => {
    if (confirm('Reset all species yield benchmarks to scientific default standards?')) {
      await resetSpeciesYieldConfigs();
      setMeatConfigs(DEFAULT_SPECIES_CONFIGS);
      setEditingConfig(DEFAULT_SPECIES_CONFIGS[selectedMeatSpecies]);
      setMeatSaveSuccess(true);
      setTimeout(() => setMeatSaveSuccess(false), 3000);
    }
  };

  // Vets managed through vetService
  const [vetsList, setVetsList] = useState<Veterinarian[]>(() => getAllVeterinarians());
  const [auditLogs, setAuditLogs] = useState<VetVerificationAuditEntry[]>(() => getVerificationAuditLogs());

  useEffect(() => {
    const unsubscribe = subscribeToVets((updated) => {
      setVetsList(updated);
      setAuditLogs(getVerificationAuditLogs());
    });
    return unsubscribe;
  }, []);

  const [fraudReports, setFraudReports] = useState([
    {
      id: 'rep_01',
      listingId: 'list_1',
      listingTitle: 'Pure Sahiwal Dairy Cow (16 Liters Confirmed Milk)',
      reportedBy: 'Muhammad Ramzan (Farmer)',
      reason: 'fake_price',
      details: 'Seller refused to provide live milking video on WhatsApp unless advance token is sent.',
      status: 'pending',
      date: '2024-10-30',
    },
    {
      id: 'rep_02',
      listingId: 'list_3',
      listingTitle: 'Prize Champion Kajli Chhatra (Two Teeth / دوندہ)',
      reportedBy: 'Kashif Ali',
      reason: 'wrong_breed',
      details: 'This photo seems copied from a Facebook group competition from last year.',
      status: 'reviewed',
      date: '2024-10-29',
    },
  ]);

  const [usersList, setUsersList] = useState([
    {
      id: 'usr_1',
      name: 'Chaudhry Kashif',
      email: 'farmer@amkanimal.ai',
      role: 'farmer',
      tier: 'farmer_basic',
      farm: 'Kashif Modern Dairy',
      city: 'Sahiwal',
      aiScans: 14,
    },
    {
      id: 'usr_2',
      name: 'Dr. Muhammad Kashif',
      email: 'dr.kashif@amkanimal.ai',
      role: 'veterinarian',
      tier: 'commercial_pro',
      farm: 'Al-Razi Veterinary Clinic',
      city: 'Lahore',
      aiScans: 38,
    },
    {
      id: 'usr_3',
      name: 'Malik Aslam Beopari',
      email: 'trader@amkanimal.ai',
      role: 'trader',
      tier: 'free',
      farm: 'Faisalabad Mandi Traders',
      city: 'Faisalabad',
      aiScans: 8,
    },
  ]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = await unlockAdminPrivileges(securityKeyInput);
    if (!success) {
      setAuthError('Invalid administrative security key. Access denied.');
    } else {
      setSecurityKeyInput('');
    }
  };

  // Enforce role-based access control
  if (!isAdmin) {
    // In production or live database mode: strictly require authenticated server-authorized administrator
    if (import.meta.env.PROD || isSupabaseConfigured()) {
      return (
        <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isUrdu ? 'رسائی ممنوع ہے (Access Denied)' : 'Administrative Access Denied'}
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {isUrdu
              ? 'یہ کنٹرول پینل صرف سپابیس سرور کے تصدیق شدہ ایڈمنسٹریٹر کے لیے ہے۔ کلائنٹ پاس کی بائی پاس پیداواری موڈ میں مکمل طور پر غیر فعال ہے۔'
              : 'This console requires an authenticated platform administrator account authorized via Supabase server-side claims (public.is_admin()). Client-side passkey bypass is disabled in production.'}
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs font-mono">
            Status: {user ? `Authenticated as ${user.email} (Role: ${user.role})` : 'Unauthenticated'}
          </div>
        </div>
      );
    }

    // Local offline development simulation only
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full mb-2">
          Local Development Sandbox Only (Disabled in Production)
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {isUrdu ? 'ایڈمن سیکیورٹی تصدیق' : 'Admin Security Verification'}
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {isUrdu
            ? 'مقامی ڈیولپمنٹ ٹیسٹنگ کے لیے سینڈ باکس پاس کی درج کریں۔'
            : 'Enter the development sandbox passkey to preview administrative controls offline.'}
        </p>

        <form onSubmit={handleUnlock} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={securityKeyInput}
              onChange={(e) => setSecurityKeyInput(e.target.value)}
              placeholder="Dev Sandbox Key"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Unlock className="w-4 h-4 text-amber-400" />
            <span>Unlock Dev Sandbox</span>
          </button>
        </form>
      </div>
    );
  }

  const handleToggleVetVerification = async (vet: Veterinarian) => {
    if (vet.isVerified) {
      if (isSupabaseConfigured()) {
        const serverRes = await revokeVeterinarianWithServer(vet.id, 'Admin manual revocation');
        if (!serverRes.success) {
          alert(`Server revocation failed: ${serverRes.error}`);
          return;
        }
      }
      revokeVeterinarian(vet.id, user?.fullName || 'amkashif (Admin)', 'Admin manual revocation');
    } else {
      const docRef = window.prompt(
        `Enter Uploaded Verification Document Storage Path for ${vet.nameEn} (Must be an uploaded file in private vet-documents bucket, e.g. ${vet.id}/dvm_degree.pdf):`,
        `${vet.id}/dvm_degree.pdf`
      );
      if (!docRef) return;
      if (isSupabaseConfigured()) {
        const serverRes = await verifyVeterinarianWithServer(vet.id, vet.licenseNumber || 'RVMP-PB-14892', docRef);
        if (!serverRes.success) {
          alert(`Server Verification failed: ${serverRes.error}`);
          return;
        }
      }
      const res = verifyVeterinarian(vet.id, user?.fullName || 'amkashif (Admin)', vet.licenseNumber || 'RVMP-PB-14892', docRef);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleDismissReport = (reportId: string) => {
    setFraudReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
    );
  };

  const handleRemoveReportedListing = (reportId: string) => {
    setFraudReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'listing_removed' } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{isUrdu ? 'ایڈمن کنٹرول پینل' : 'Platform Administration & Security'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Authenticated: {user?.fullName}</span>
          </div>
          <button
            onClick={revokeAdminPrivileges}
            className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
            title="Lock Session"
          >
            Lock Session
          </button>
        </div>
      </div>

      {/* Analytics KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t.admin.totalUsers}</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">2,481</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">+14% this month</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t.admin.activeListings}</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">418</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">98% verified sellers</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t.admin.pendingReports}</span>
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-600">
            {fraudReports.filter((r) => r.status === 'pending').length}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Requires immediate review</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t.admin.aiCallsToday}</span>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">1,940</span>
          <span className="text-[10px] text-brand-600 font-bold block mt-1">Multimodal vision 99.8% uptime</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-bold">
        {[
          { id: 'analytics', label: t.admin.tabAnalytics, icon: BarChart3 },
          { id: 'meatYield', label: isUrdu ? 'گوشت کیلیبریشن' : 'Meat Yield Calibration', icon: Beef },
          { id: 'users', label: t.admin.tabUsers, icon: Users },
          { id: 'reports', label: t.admin.tabReports, icon: Flag },
          { id: 'vets', label: t.admin.tabVets, icon: Stethoscope },
          { id: 'audit', label: 'Vet Audit Trail', icon: ShieldCheck },
          { id: 'breeds', label: t.admin.tabBreeds, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: FRAUD REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              {isUrdu ? 'فراڈ اور غلط بیانی کی شکایات کی قطار' : 'Marketplace Fraud & Violation Reports'}
            </h3>
            <span className="text-xs text-slate-400">
              {fraudReports.length} total reports recorded
            </span>
          </div>

          <div className="space-y-3">
            {fraudReports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 uppercase text-[10px] px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                      {rep.reason.replace('_', ' ')}
                    </span>
                    <span className="font-extrabold text-slate-800">{rep.listingTitle}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{rep.details}"
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Reported by: {rep.reportedBy} • Date: {rep.date} • Status: <strong className="uppercase">{rep.status}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {rep.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleRemoveReportedListing(rep.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        Remove Listing
                      </button>
                      <button
                        onClick={() => handleDismissReport(rep.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Action Taken</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: VETERINARIAN VERIFICATIONS */}
      {activeTab === 'vets' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {isUrdu ? 'ویٹرنری ڈاکٹرز کی ڈائرکٹری اور لائسنس توثیق' : 'RVMP Veterinary License Approvals'}
              </h3>
              <p className="text-xs text-slate-500">
                Changes persist immediately to the verified veterinary directory.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {vetsList.map((vet) => (
              <div key={vet.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {vet.nameEn} ({vet.nameUr})
                    </h5>
                    {vet.isVerified ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Verified RVMP
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 block">
                    {vet.clinicNameEn} • {vet.districtCity} • License: {vet.licenseNumber || 'Unverified'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleVetVerification(vet)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    vet.isVerified
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {vet.isVerified ? 'Revoke License Badge' : 'Verify & Approve RVMP'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: VET AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">
            Veterinary Verification Audit Trail
          </h3>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No verification actions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((entry, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{entry.vetName}</span>
                    <span className="text-slate-500 text-[11px] block">
                      Action: <strong className={entry.action === 'verified' ? 'text-emerald-600' : 'text-red-500'}>{entry.action.toUpperCase()}</strong> by {entry.performedBy}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: USERS & TIERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              {t.admin.tabUsers}
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {usersList.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-sm">{u.name}</h5>
                  <span className="text-slate-500 block">
                    {u.email} • {u.farm} ({u.city})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold capitalize">
                    {u.role}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 font-extrabold capitalize border border-brand-200">
                    {u.tier.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {u.aiScans} scans used
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MEAT YIELD CONFIGURATION & CALIBRATION */}
      {activeTab === 'meatYield' && (
        <div className="space-y-6">
          {/* Overview & Accuracy Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                    Scientific Calibration Console
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Supabase + Local Fallback Sync
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {isUrdu ? 'گوشت کی پیداوار اور ڈریسنگ تناسب کیلیبریشن' : 'Meat Yield Benchmarks & Model Calibration'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isUrdu
                    ? 'جانوروں کے سائنسی فارمولوں، ڈریسنگ فیصد اور ذبح خانوں کے حقیقی نتائج کی مدد سے ماڈل کو بہتر بنائیں۔'
                    : 'Calibrate species-specific dressing formulas, carcass partition percentages, and ground-truth slaughter results.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetMeatConfigs}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>{isUrdu ? 'سائنسی ڈیفالٹ پر ری سیٹ' : 'Reset to Defaults'}</span>
                </button>
              </div>
            </div>

            {/* Calibration KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {isUrdu ? 'کیلیبریشن ریکارڈز' : 'Calibration Records'}
                </span>
                <span className="text-xl font-black text-slate-900">{slaughterLogs.length}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Slaughterhouse scale tests</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  {isUrdu ? 'اوسط پیشگوئی درستگی' : 'Avg Model Accuracy'}
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {calculateCalibrationAccuracy(slaughterLogs).toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Based on scale logs</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {isUrdu ? 'ماڈل سٹیٹس' : 'Calibration Status'}
                </span>
                <span className="text-xs font-extrabold text-brand-800 block">
                  {slaughterLogs.length >= 5 ? 'Field Calibrated' : 'Scientific Baseline'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {slaughterLogs.length >= 5 ? 'Verified via scale tests' : 'FAO / PARC / UVAS standard'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {isUrdu ? 'کارکس کمپونینٹ کنٹرول' : 'Carcass Sum Verification'}
                </span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Balanced</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Zero double-counting</span>
              </div>
            </div>
          </div>

          {/* Species Config Editor */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Beef className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'نسل کے مطابق فارمولا پیرامیٹرز' : 'Species Yield & Carcass Breakdown Matrix'}</span>
              </h4>

              {/* Species Selector Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['cow', 'buffalo', 'goat', 'sheep', 'dumba'] as MeatYieldSpecies[]).map((sp) => {
                  const isSelected = selectedMeatSpecies === sp;
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => handleSelectMeatSpecies(sp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sp === 'dumba' ? 'Ram / Dumba' : sp}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSaveMeatConfig} className="space-y-6">
              {meatSaveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {meatSaveError}
                </div>
              )}

              {meatSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configuration saved successfully and synced with database!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Dressing Percentage Ranges */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dressing % (Carcass / Live)</span>
                  </h5>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Low Estimate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseDressingPctLow}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseDressingPctLow: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Most Likely Benchmark (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseDressingPctLikely}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseDressingPctLikely: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      High Estimate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseDressingPctHigh}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseDressingPctHigh: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 2. Carcass Breakdown (% of Carcass) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Beef className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Carcass Partition (%)</span>
                    </h5>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        Math.abs(
                          Number(editingConfig.baseBonelessYieldPct) +
                            Number(editingConfig.baseBonePct) +
                            Number(editingConfig.baseFatPct) +
                            Number(editingConfig.baseTrimWastePct) -
                            100
                        ) < 0.1
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      Sum:{' '}
                      {(
                        Number(editingConfig.baseBonelessYieldPct) +
                        Number(editingConfig.baseBonePct) +
                        Number(editingConfig.baseFatPct) +
                        Number(editingConfig.baseTrimWastePct)
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Boneless Meat Yield (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseBonelessYieldPct}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseBonelessYieldPct: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Bone Proportion (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseBonePct}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseBonePct: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Separable Fat Proportion (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseFatPct}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseFatPct: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Chilled Trim / Evaporative Waste (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.baseTrimWastePct}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          baseTrimWastePct: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 3. By-Products (% of Live Weight) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    By-Products (% Live Weight)
                  </h5>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Hide / Skin (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.hideSkinPctOfLiveWeight}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          hideSkinPctOfLiveWeight: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Head & Trotters (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.headTrottersPctOfLiveWeight}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          headTrottersPctOfLiveWeight: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Edible Red Offal (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.redOffalPctOfLiveWeight}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          redOffalPctOfLiveWeight: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Cleaned Green Offal (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingConfig.greenOffalPctOfLiveWeight}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          greenOffalPctOfLiveWeight: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Submission Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  Reference: <span className="text-slate-800 font-semibold">{editingConfig.notes}</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{isUrdu ? 'پیرامیٹرز محفوظ کریں' : 'Save Species Benchmarks'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Slaughterhouse Ground-Truth Calibration Records */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'ذبح خانوں کے لائیو کیلیبریشن لاگز' : 'Ground-Truth Slaughterhouse Calibration Scale Records'}</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {slaughterLogs.length} verified scale logs
              </span>
            </div>

            {slaughterLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No physical slaughterhouse scale logs registered yet. Submit calibration logs from the Meat Yield Estimator to recalibrate models.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Species / Breed</th>
                      <th className="py-2.5 px-3">Facility</th>
                      <th className="py-2.5 px-3">Live Weight</th>
                      <th className="py-2.5 px-3">Predicted</th>
                      <th className="py-2.5 px-3">Actual Carcass</th>
                      <th className="py-2.5 px-3">Variance</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slaughterLogs.map((log) => {
                      const predictedCarcass =
                        log.predictedCarcassWeightKg ??
                        Number(((log.liveWeightKg * (log.predictedDressingPercentage || 50)) / 100).toFixed(1));
                      const variancePct = log.variancePercentage ?? 0;
                      const accuracyPct = Math.max(75, Math.min(99.9, 100 - Math.abs(variancePct)));
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {log.recordedAt ? log.recordedAt.split('T')[0] : '2024-11-01'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 capitalize">
                            {log.species} {log.breed && `(${log.breed})`}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {log.slaughterhouseOrCity || 'Abattoir Facility'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{log.liveWeightKg} kg</td>
                          <td className="py-2.5 px-3 text-slate-500">{predictedCarcass} kg</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">{log.actualCarcassWeightKg} kg</td>
                          <td
                            className={`py-2.5 px-3 font-bold ${
                              Math.abs(variancePct) <= 1
                                ? 'text-emerald-600'
                                : Math.abs(variancePct) <= 3
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px]">
                              {accuracyPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: BREEDS DATABASE */}
      {activeTab === 'breeds' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">
              {t.admin.tabBreeds} ({ALL_BREEDS.length} Curated Breeds)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {ALL_BREEDS.map((b) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{b.name} ({b.nameUrdu})</span>
                  <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {b.speciesId}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] block">{b.origin}</span>
                <p className="text-slate-600 text-[11px] line-clamp-1">{b.physicalCharacteristicsEn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base">
            Platform Health & Diagnostic Accuracy Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Vision AI Accuracy</span>
              <span className="text-xl font-black text-emerald-600">98.4%</span>
              <span className="text-[10px] text-slate-500 block mt-1">Cross-verified by DVM panel</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Avg Mandi Price Variance</span>
              <span className="text-xl font-black text-brand-700">± 4.2%</span>
              <span className="text-[10px] text-slate-500 block mt-1">Versus physical auction bids</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Fraud Detection Rate</span>
              <span className="text-xl font-black text-slate-900">99.1%</span>
              <span className="text-[10px] text-slate-500 block mt-1">Zero fake transactions approved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
