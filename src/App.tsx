import React, { useState } from 'react';
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

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfc] selection:bg-emerald-600 selection:text-white">
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
