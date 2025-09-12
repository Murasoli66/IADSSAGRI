

import React, { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Chatbot from './components/Chatbot.tsx';
import { View } from './types.ts';
import Loader from './components/Loader.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { initDB } from './services/dbService.ts';

const Dashboard = lazy(() => import('./components/Dashboard.tsx'));
const SoilAnalysis = lazy(() => import('./components/SoilAnalysis.tsx'));
const DiseaseDiagnosisComponent = lazy(() => import('./components/DiseaseDiagnosis.tsx'));
const FarmingGuide = lazy(() => import('./components/FarmingGuide.tsx'));
const MarketPrices = lazy(() => import('./components/MarketPrices.tsx'));
const Profile = lazy(() => import('./components/Profile.tsx'));
const FertilizerPlan = lazy(() => import('./components/FertilizerPlan.tsx'));

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };
    initializeDatabase();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={setCurrentView} />;
      case 'soil':
        return <SoilAnalysis />;
      case 'disease':
        return <DiseaseDiagnosisComponent />;
      case 'guide':
        return <FarmingGuide />;
      case 'fertilizer':
        return <FertilizerPlan />;
      case 'market':
        return <MarketPrices />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  const PageLoader = () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader message="loader.page" />
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto bg-slate-100">
        <Suspense fallback={<PageLoader />}>
          {renderView()}
        </Suspense>
      </main>
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}


export default App;
