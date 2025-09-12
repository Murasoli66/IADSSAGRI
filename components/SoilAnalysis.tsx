
import React, { useState, useRef, useEffect } from 'react';
import { CropRecommendation, SoilAnalysisRecord } from '../types';
import { getCropRecommendationsFromImage } from '../services/geminiService';
import { addSoilAnalysis, getAllSoilAnalyses } from '../services/dbService';
import Loader from './Loader';
import { useTranslation } from '../contexts/LanguageContext';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const SoilAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SoilAnalysisRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useTranslation();
  const langName = language === 'en' ? 'English' : 'Tamil';

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const pastAnalyses = await getAllSoilAnalyses();
        setHistory(pastAnalyses);
      } catch (err) {
        console.error("Failed to load soil analysis history:", err);
      }
    };
    loadHistory();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRecommendations([]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    if (!navigator.onLine) {
        setError(t('soilAnalysis.offlineError'));
        return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const result = await getCropRecommendationsFromImage(selectedFile, langName);
      setRecommendations(result);
      
      const imageDataUrl = await fileToDataURL(selectedFile);
      const newRecord: Omit<SoilAnalysisRecord, 'id'> = {
        imageDataUrl,
        recommendations: result,
        timestamp: Date.now(),
      };
      await addSoilAnalysis(newRecord);
      const updatedHistory = await getAllSoilAnalyses();
      setHistory(updatedHistory);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('soilAnalysis.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistoryItem = (item: SoilAnalysisRecord) => {
    setPreview(item.imageDataUrl);
    setRecommendations(item.recommendations);
    setSelectedFile(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">{t('soilAnalysis.title')}</h1>
        <p className="text-slate-600 mt-2 text-lg">{t('soilAnalysis.subtitle')}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 self-start text-slate-800">{t('soilAnalysis.uploadTitle')}</h2>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/50 transition-colors duration-300">
            {preview ? <img src={preview} alt="Soil preview" className="max-h-64 w-full h-auto object-contain mx-auto rounded-lg shadow-md" /> : (
              <div className="text-slate-500 flex flex-col items-center">
                <svg className="h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="mt-4 block text-base font-semibold">{t('soilAnalysis.uploadButton')}</span>
              </div>
            )}
          </button>
          {selectedFile && (
            <div className="mt-4 w-full text-center">
              <p className="text-sm text-slate-600 truncate">{t('soilAnalysis.fileLabel')}: {selectedFile.name}</p>
              <button onClick={handleAnalyze} disabled={isLoading} className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg">
                {isLoading ? t('soilAnalysis.analyzingButton') : t('soilAnalysis.analyzeButton')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">{t('soilAnalysis.recommendationsTitle')}</h2>
          {isLoading && <Loader message="soilAnalysis.loaderMessage" />}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 border-l-4 border-green-500 rounded-r-lg bg-slate-50/80">
                  <h3 className="text-lg font-bold text-green-800">{index + 1}. {rec.crop_name}</h3>
                  <p className="mt-2 text-sm text-slate-700"><strong>{t('soilAnalysis.reasonLabel')}:</strong> {rec.reason}</p>
                  <p className="mt-1 text-sm text-slate-700"><strong>{t('soilAnalysis.marketDemandLabel')}:</strong> {rec.market_demand}</p>
                </div>
              ))
            ) : (!isLoading && !error && <p className="text-slate-500 pt-4">{t('soilAnalysis.placeholder')}</p>)}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('soilAnalysis.historyTitle')}</h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map(item => (
              <div key={item.id} className="border border-slate-200/80 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <img src={item.imageDataUrl} alt="Soil history" className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                  <p className="text-sm font-semibold truncate mt-1 text-slate-800">{item.recommendations[0].crop_name}</p>
                  <button onClick={() => viewHistoryItem(item)} className="mt-2 w-full text-xs bg-green-100 text-green-800 font-bold py-1.5 px-2 rounded-md hover:bg-green-200 transition-colors">{t('soilAnalysis.viewButton')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">{t('soilAnalysis.noHistory')}</p>
        )}
      </div>
    </div>
  );
};

export default SoilAnalysis;
