
import React, { memo, useState, useEffect } from 'react';
import { View, UserProfile } from '../types';
import { DashboardIcon, SoilIcon, LeafIcon, GuideIcon, MarketIcon, ProfileIcon, FertilizerIcon, IADSS_Icon } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex justify-center p-2">
      <div className="flex rounded-full bg-green-800/50 p-1 text-sm">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-1 rounded-full transition-colors duration-300 ${language === 'en' ? 'bg-amber-400 text-green-950 font-bold' : 'text-white hover:bg-white/10'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ta')}
          className={`px-4 py-1 rounded-full transition-colors duration-300 ${language === 'ta' ? 'bg-amber-400 text-green-950 font-bold' : 'text-white hover:bg-white/10'}`}
        >
          தமிழ்
        </button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem('agri-ai-user-profile');
      if (storedProfile) {
        try {
          setUserProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error("Failed to parse user profile from localStorage in Sidebar:", error);
          localStorage.removeItem('agri-ai-user-profile');
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);

    return () => {
      window.removeEventListener('profileUpdated', loadProfile);
    };
  }, []);


  const navItems = [
    { id: 'dashboard', icon: DashboardIcon, label: t('sidebar.dashboard') },
    { id: 'soil', icon: SoilIcon, label: t('sidebar.soilAndCrop') },
    { id: 'disease', icon: LeafIcon, label: t('sidebar.diseaseDiagnosis') },
    { id: 'guide', icon: GuideIcon, label: t('sidebar.farmingGuide') },
    { id: 'fertilizer', icon: FertilizerIcon, label: t('sidebar.fertilizerPlan') },
    { id: 'market', icon: MarketIcon, label: t('sidebar.marketPrices') },
  ] as const;
  
  const profileNavItem = { id: 'profile', icon: ProfileIcon, label: t('sidebar.profile') } as const;

  return (
    <aside className="w-20 md:w-64 bg-green-900 text-white flex flex-col transition-all duration-300 shadow-2xl">
      <div className="h-24 flex items-center justify-center md:justify-start md:pl-5 border-b border-white/10">
        <IADSS_Icon className="h-12 w-12 md:h-10 md:w-10 rounded-lg"/>
        <span className="hidden md:inline text-2xl font-bold ml-3 tracking-tight">{t('sidebar.title')}</span>
      </div>
      
      <LanguageSwitcher />

      <nav className="flex-grow pt-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center w-full py-3 px-7 transition-colors duration-200 group ${
              currentView === item.id
                ? 'bg-green-700 text-amber-300'
                : 'text-green-100 hover:bg-green-800/50'
            }`}
          >
            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${currentView === item.id ? '' : 'text-green-300 group-hover:text-white'}`} />
            <span className="ml-4 hidden md:inline font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 py-2">
        <button
        onClick={() => setView(profileNavItem.id)}
        className={`flex items-center w-full py-3 px-7 transition-colors duration-200 group ${
            currentView === profileNavItem.id
            ? 'bg-green-700 text-amber-300'
            : 'text-green-100 hover:bg-green-800/50'
        }`}
        >
          <profileNavItem.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${currentView === profileNavItem.id ? '' : 'text-green-300 group-hover:text-white'}`} />
          <span className="ml-4 hidden md:inline font-medium">{profileNavItem.label}</span>
        </button>
        
        {userProfile && (userProfile.name || userProfile.picture) && (
            <div className="p-4 flex items-center space-x-3">
                {userProfile.picture ? (
                    <img src={userProfile.picture} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-green-700 flex items-center justify-center ring-2 ring-green-600">
                        <ProfileIcon className="h-6 w-6 text-white"/>
                    </div>
                )}
                <div className="hidden md:block overflow-hidden">
                    <p className="font-semibold text-sm truncate text-white">{userProfile.name || 'User'}</p>
                    <p className="text-xs text-green-300 truncate">{userProfile.email || ''}</p>
                </div>
            </div>
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);
