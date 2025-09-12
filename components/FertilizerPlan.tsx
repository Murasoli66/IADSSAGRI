

import React, { useState } from 'react';
import { FertilizerTask } from '../types';
import { getFertilizerSchedule } from '../services/geminiService';
import Loader from './Loader';
import { useTranslation } from '../contexts/LanguageContext';
import MapModal from './MapModal';

const FertilizerPlan: React.FC = () => {
  const popularCrops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Tomato"];
  const { t, language } = useTranslation();
  const langName = language === 'en' ? 'English' : 'Tamil';

  const today = new Date().toISOString().split('T')[0];
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const endDateDefault = threeMonthsLater.toISOString().split('T')[0];

  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [schedule, setSchedule] = useState<FertilizerTask[]>([]);
  const [fertilizerTypes, setFertilizerTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapQuery, setMapQuery] = useState('');

  const handleGetPlan = async () => {
    if (!selectedCrop) return;
    setIsLoading(true);
    setError(null);
    setSchedule([]);
    setFertilizerTypes([]);

    try {
      const result = await getFertilizerSchedule(selectedCrop, startDate, endDate, langName);
      setSchedule(result.schedule);
      setFertilizerTypes(result.fertilizer_types);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('fertilizerPlan.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewMap = () => {
    const fertilizers = fertilizerTypes.join(' or ');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapQuery(`fertilizer shops near ${latitude},${longitude} selling ${fertilizers}`);
        setIsMapOpen(true);
      },
      () => {
        setMapQuery(`fertilizer shops in India selling ${fertilizers}`);
        setIsMapOpen(true);
      }
    );
  };

  return (
    <>
    {isMapOpen && <MapModal query={mapQuery} title={t('fertilizerPlan.mapModalTitle')} onClose={() => setIsMapOpen(false)} />}
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">{t('fertilizerPlan.title')}</h1>
        <p className="text-slate-600 mt-2 text-lg">{t('fertilizerPlan.subtitle')}</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="crop-select" className="block text-sm font-medium text-slate-700">{t('fertilizerPlan.selectCrop')}</label>
            <select
              id="crop-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">{t('fertilizerPlan.selectCrop')}</option>
              {popularCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700">{t('fertilizerPlan.startDateLabel')}</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm"/>
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700">{t('fertilizerPlan.endDateLabel')}</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm"/>
          </div>
        </div>
        <div className="mt-6">
             <button
                onClick={handleGetPlan}
                disabled={!selectedCrop || isLoading}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
             >
                {isLoading ? t('fertilizerPlan.loadingButton') : t('fertilizerPlan.getPlanButton')}
            </button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading && <div className="flex justify-center"><Loader message="fertilizerPlan.loaderMessage"/></div>}
        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        {schedule.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('fertilizerPlan.scheduleTitle', { crop: selectedCrop })}</h2>
            <div className="relative border-l-4 border-blue-200 ml-6 mt-8">
              {schedule.map(task => (
                <div key={task.week} className="mb-10 pl-12 relative">
                  <div className="absolute -left-7 top-0 flex items-center justify-center bg-blue-600 text-white rounded-full h-14 w-14 font-bold text-lg shadow-md ring-8 ring-white">
                    {task.week}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 ml-4">
                    <h3 className="font-semibold text-lg text-slate-800">{task.task}</h3>
                    <p className="text-sm font-bold text-blue-800 mt-1">{t('fertilizerPlan.fertilizerLabel')}: {task.fertilizer_type}</p>
                    <p className="text-slate-600 mt-1">{task.details}</p>
                  </div>
                </div>
              ))}
            </div>
            {fertilizerTypes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">{t('fertilizerPlan.nearbyShopsTitle')}</h3>
                    <p className="text-sm text-slate-600 mb-2">Key supplies: {fertilizerTypes.join(', ')}</p>
                    <button onClick={handleViewMap} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                        {t('fertilizerPlan.viewMapButton')}
                    </button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FertilizerPlan;
