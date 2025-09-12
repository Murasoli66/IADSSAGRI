
import React, { useState } from 'react';
import { FarmingTask } from '../types.ts';
import { getFarmingSchedule } from '../services/geminiService.ts';
import Loader from './Loader.tsx';
import { useTranslation } from '../contexts/LanguageContext.tsx';

const CACHE_KEY = 'agri-ai-farming-schedules';

const FarmingGuide: React.FC = () => {
  const popularCrops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Tomato"];
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [schedule, setSchedule] = useState<FarmingTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { t, language } = useTranslation();
  const langName = language === 'en' ? 'English' : 'Tamil';

  const getCachedSchedules = (): { [crop: string]: FarmingTask[] } => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      console.error("Failed to parse cached schedules:", e);
      return {};
    }
  };

  const handleGetSchedule = async () => {
    if (!selectedCrop) return;
    
    setIsLoading(true);
    setError(null);
    setSchedule([]);
    setIsOfflineData(false);

    const cachedSchedules = getCachedSchedules();
    const cachedData = cachedSchedules[selectedCrop];

    if (cachedData) {
      setSchedule(cachedData);
      setIsOfflineData(true);
    }

    if (navigator.onLine) {
      try {
        const result = await getFarmingSchedule(selectedCrop, langName);
        setSchedule(result);
        setIsOfflineData(false); 
        cachedSchedules[selectedCrop] = result;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedSchedules));
      } catch (err) {
        if (!cachedData) {
          setError(err instanceof Error ? err.message : t('farmingGuide.errorMessage'));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!cachedData) {
        setError(t('farmingGuide.offlineError'));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">{t('farmingGuide.title')}</h1>
        <p className="text-slate-600 mt-2 text-lg">{t('farmingGuide.subtitle')}</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="block w-full sm:w-auto flex-grow p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">{t('farmingGuide.selectCrop')}</option>
            {popularCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
          </select>
          <button
            onClick={handleGetSchedule}
            disabled={!selectedCrop || isLoading}
            className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            {isLoading ? t('farmingGuide.loadingButton') : t('farmingGuide.getGuideButton')}
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        {isLoading && !schedule.length && <div className="flex justify-center"><Loader message="farmingGuide.loaderMessage"/></div>}
        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        {schedule.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('farmingGuide.scheduleTitle', { crop: selectedCrop })}</h2>
                {isOfflineData && (
                    <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                        {t('farmingGuide.cachedData')}
                    </span>
                )}
            </div>
            <div className="relative border-l-4 border-green-200 ml-6 mt-8">
              {schedule.map(task => (
                <div key={task.week} className="mb-10 pl-12 relative">
                  <div className="absolute -left-7 top-0 flex items-center justify-center bg-green-600 text-white rounded-full h-14 w-14 font-bold text-lg shadow-md ring-8 ring-white">
                    {task.week}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 ml-4">
                    <h3 className="font-semibold text-lg text-slate-800">{task.task}</h3>
                    <p className="text-slate-600 mt-1">{task.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmingGuide;
