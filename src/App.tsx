import React, { useState, useEffect } from 'react';
import { useLanguage } from './i18n';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { AnimalScanner } from './components/scanner/AnimalScanner';
import { HealthAssistant } from './components/health/HealthAssistant';
import { PriceEstimator } from './components/market/PriceEstimator';
import { MeatYieldEstimator } from './components/meatYield/MeatYieldEstimator';
import { NutritionPlanner } from './components/nutrition/NutritionPlanner';
import { VaccinationCalendar } from './components/calendar/VaccinationCalendar';
import { AnimalList } from './components/profiles/AnimalList';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { VetDirectory } from './components/vetDirectory/VetDirectory';
import { AiVeterinaryChat } from './components/chat/AiVeterinaryChat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApiKeyModal } from './components/settings/ApiKeyModal';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

const TAB_ALIASES: Record<string, string> = {
  '': 'home',
  home: 'home',
  scanner: 'scanner',
  scan: 'scanner',
  camera: 'scanner',
  health: 'health',
  disease: 'health',
  'market-price': 'marketPrice',
  marketprice: 'marketPrice',
  price: 'marketPrice',
  mandi: 'marketPrice',
  'meat-yield': 'meatYield',
  meatyield: 'meatYield',
  meat: 'meatYield',
  nutrition: 'nutrition',
  feed: 'nutrition',
  diet: 'nutrition',
  calendar: 'calendar',
  vaccination: 'calendar',
  vaccines: 'calendar',
  profiles: 'profiles',
  animals: 'profiles',
  herd: 'profiles',
  marketplace: 'marketplace',
  bazaar: 'marketplace',
  mandi_bazaar: 'marketplace',
  vets: 'vets',
  'vet-directory': 'vets',
  doctors: 'vets',
  chat: 'chat',
  'ai-chat': 'chat',
  consultation: 'chat',
  admin: 'admin',
};

const resolveTabFromLocation = (): string => {
  if (typeof window === 'undefined') return 'home';

  // Check window.location.hash (e.g. #/scanner, #scanner, #/meat-yield)
  if (window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    const cleanHash = rawHash.split('?')[0].replace(/\/+$/, '');
    if (TAB_ALIASES[cleanHash]) {
      return TAB_ALIASES[cleanHash];
    }
  }

  // Check URL query search param (?tab=scanner or ?section=scanner)
  try {
    const params = new URLSearchParams(window.location.search);
    const paramTab = (params.get('tab') || params.get('section'))?.toLowerCase().trim();
    if (paramTab && TAB_ALIASES[paramTab]) {
      return TAB_ALIASES[paramTab];
    }
  } catch (e) {
    // Ignore URLSearchParams error in restricted environments
  }

  // Check URL pathname (e.g. /amk-animal-ai/scanner or /scanner from SPA fallback)
  try {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1]?.toLowerCase().trim();
    if (last && last !== 'amk-animal-ai' && last !== 'index.html' && TAB_ALIASES[last]) {
      return TAB_ALIASES[last];
    }
  } catch (e) {
    // Ignore pathname parsing errors
  }

  return 'home';
};

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => resolveTabFromLocation());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [navParams, setNavParams] = useState<{
    species?: string;
    breed?: string;
    weightKg?: number;
    bcs?: number;
    initialMedia?: string[];
    caseSummary?: string;
    vaccineName?: string;
  }>({});

  useEffect(() => {
    const syncTabWithUrl = () => {
      const tab = resolveTabFromLocation();
      setCurrentTab(tab);
    };

    window.addEventListener('hashchange', syncTabWithUrl);
    window.addEventListener('popstate', syncTabWithUrl);

    // Initial sync
    const initialTab = resolveTabFromLocation();
    if (initialTab !== 'home' && window.location.hash) {
      setCurrentTab(initialTab);
    }

    return () => {
      window.removeEventListener('hashchange', syncTabWithUrl);
      window.removeEventListener('popstate', syncTabWithUrl);
    };
  }, []);

  const handleNavigate = (
    tab: string,
    params?: {
      species?: string;
      breed?: string;
      weightKg?: number;
      bcs?: number;
      initialMedia?: string[];
      caseSummary?: string;
      vaccineName?: string;
    }
  ) => {
    if (params) setNavParams(params);
    setCurrentTab(tab);

    // Sync URL hash
    if (typeof window !== 'undefined') {
      const targetHash = tab === 'home' ? '' : `#/${tab}`;
      if (tab === 'home') {
        if (window.location.hash) {
          history.pushState(null, '', window.location.pathname + window.location.search);
        }
      } else if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfc] selection:bg-emerald-600 selection:text-white">
      {/* PWA Mobile App Install Banner */}
      <PwaInstallPrompt />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => handleNavigate(tab)}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentTab === 'scanner' && (
          <AnimalScanner
            onNavigateToHealth={(species, breed, initialMedia) => handleNavigate('health', { species, breed, initialMedia })}
            onNavigateToPrice={(species, breed) => handleNavigate('marketPrice', { species, breed })}
            onNavigateToMeatYield={(species, breed, weightKg, bcs) => handleNavigate('meatYield', { species, breed, weightKg, bcs })}
          />
        )}

        {currentTab === 'health' && (
          <HealthAssistant
            initialSpecies={navParams.species || 'Cow'}
            initialBreed={navParams.breed || ''}
            initialMedia={navParams.initialMedia}
            onNavigateToVet={() => handleNavigate('vets')}
            onNavigateToChat={(summary) => handleNavigate('chat', { caseSummary: summary })}
            onNavigateToCalendar={(vaccineName) => handleNavigate('calendar', { vaccineName })}
            onNavigateToProfiles={() => handleNavigate('profiles')}
          />
        )}

        {currentTab === 'marketPrice' && (
          <PriceEstimator
            initialSpecies={navParams.species || 'Cow'}
            initialBreed={navParams.breed || 'Sahiwal Cow'}
            onNavigateToMarketplace={() => handleNavigate('marketplace')}
            onNavigateToMeatYield={(species, breed, weightKg) => handleNavigate('meatYield', { species, breed, weightKg })}
          />
        )}

        {currentTab === 'meatYield' && (
          <MeatYieldEstimator
            initialSpecies={navParams.species}
            initialBreed={navParams.breed}
            initialWeightKg={navParams.weightKg}
            initialBcs={navParams.bcs}
            onNavigateToScanner={() => handleNavigate('scanner')}
            onNavigateToPrice={() => handleNavigate('marketPrice', { species: navParams.species, breed: navParams.breed })}
          />
        )}

        {currentTab === 'nutrition' && (
          <NutritionPlanner />
        )}

        {currentTab === 'calendar' && (
          <VaccinationCalendar initialFilter={navParams.vaccineName} />
        )}

        {currentTab === 'profiles' && (
          <AnimalList
            onNavigateToMeatYield={(species, breed, weightKg) => handleNavigate('meatYield', { species, breed, weightKg })}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplaceView />
        )}

        {currentTab === 'vets' && (
          <VetDirectory />
        )}

        {currentTab === 'chat' && (
          <AiVeterinaryChat initialCaseSummary={navParams.caseSummary} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Footer with Brand Signature */}
      <Footer onNavigate={handleNavigate} />

      {/* Multimodal AI API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default AppContent;
