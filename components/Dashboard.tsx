
import React, { memo } from 'react';
import { View } from '../types';
import { SoilIcon, LeafIcon, GuideIcon, MarketIcon } from './icons';
import Weather from './Weather';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardProps {
  setView: (view: View) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = memo(({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
  >
    <div className="flex-shrink-0 text-green-600 bg-green-100 rounded-xl p-3 w-max group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <div className="mt-4 flex-grow">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600 mt-1 text-sm">{description}</p>
    </div>
    <div className="mt-4 text-sm font-semibold text-green-600 group-hover:underline">
      Go to section &rarr;
    </div>
  </button>
));

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">{t('dashboard.welcome')}</h1>
        <p className="text-slate-600 mt-2 text-lg">{t('dashboard.subtitle')}</p>
      </header>
      
      <Weather />
      
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={<SoilIcon className="h-10 w-10" />}
          title={t('dashboard.soilCardTitle')}
          description={t('dashboard.soilCardDesc')}
          onClick={() => setView('soil')}
        />
        <FeatureCard
          icon={<LeafIcon className="h-10 w-10" />}
          title={t('dashboard.diseaseCardTitle')}
          description={t('dashboard.diseaseCardDesc')}
          onClick={() => setView('disease')}
        />
        <FeatureCard
          icon={<GuideIcon className="h-10 w-10" />}
          title={t('dashboard.guideCardTitle')}
          description={t('dashboard.guideCardDesc')}
          onClick={() => setView('guide')}
        />
        <FeatureCard
          icon={<MarketIcon className="h-10 w-10" />}
          title={t('dashboard.marketCardTitle')}
          description={t('dashboard.marketCardDesc')}
          onClick={() => setView('market')}
        />
      </main>
    </div>
  );
};

export default Dashboard;
