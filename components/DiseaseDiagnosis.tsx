

import React, { useState, useRef, useEffect } from 'react';
import { DiseaseDiagnosis, DiseaseDiagnosisRecord } from '../types';
import { diagnosePlantDisease } from '../services/geminiService';
import { addDiseaseDiagnosis, getAllDiseaseDiagnoses } from '../services/dbService';
import Loader from './Loader';
import { useTranslation } from '../contexts/LanguageContext';
import MapModal from './MapModal';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const DiseaseDiagnosisComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DiseaseDiagnosisRecord[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useTranslation();
  const langName = language === 'en' ? 'English' : 'Tamil';
  
  useEffect(() => {
    const loadHistory = async () => {
        try {
            const pastDiagnoses = await getAllDiseaseDiagnoses();
            setHistory(pastDiagnoses);
        } catch (err) {
            console.error("Failed to load disease diagnosis history:", err);
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
      setDiagnosis(null);
      setError(null);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;

    if (!navigator.onLine) {
        setError(t('diseaseDiagnosis.offlineError'));
        return;
    }

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    try {
      const result = await diagnosePlantDisease(selectedFile, langName);
      setDiagnosis(result);

      const imageDataUrl = await fileToDataURL(selectedFile);
      const newRecord: Omit<DiseaseDiagnosisRecord, 'id'> = {
        imageDataUrl,
        diagnosis: result,
        timestamp: Date.now(),
      };
      await addDiseaseDiagnosis(newRecord);
      const updatedHistory = await getAllDiseaseDiagnoses();
      setHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('diseaseDiagnosis.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistoryItem = (item: DiseaseDiagnosisRecord) => {
    setPreview(item.imageDataUrl);
    setDiagnosis(item.diagnosis);
    setSelectedFile(null);
    window.scrollTo(0, 0);
  }

  const handleViewMap = () => {
    if (!diagnosis || !diagnosis.recommended_pesticides?.length) return;

    const pesticides = diagnosis.recommended_pesticides.join(' or ');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setMapQuery(`pesticide shops near ${latitude},${longitude} selling ${pesticides}`);
            setIsMapOpen(true);
        },
        () => {
            // Fallback if location is denied
            setMapQuery(`pesticide shops in India selling ${pesticides}`);
            setIsMapOpen(true);
        }
    );
  };


  return (
    <>
    {isMapOpen && <MapModal query={mapQuery} title={t('diseaseDiagnosis.mapModalTitle')} onClose={() => setIsMapOpen(false)} />}
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-slate-900">{t('diseaseDiagnosis.title')}</h1>
        <p className="text-slate-600 mt-2 text-lg">{t('diseaseDiagnosis.subtitle')}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 self-start text-slate-800">{t('soilAnalysis.uploadTitle')}</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/50 transition-colors duration-300">
                {preview ? <img src={preview} alt="Leaf preview" className="max-h-64 w-full h-auto object-contain mx-auto rounded-lg shadow-md" /> : (
                <div className="text-slate-500 flex flex-col items-center">
                    <svg className="h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="mt-4 block text-base font-semibold">{t('diseaseDiagnosis.uploadButton')}</span>
                </div>
                )}
            </button>
            {selectedFile && (
                <div className="mt-4 w-full text-center">
                <p className="text-sm text-slate-600 truncate">{t('diseaseDiagnosis.fileLabel')}: {selectedFile.name}</p>
                <button onClick={handleDiagnose} disabled={isLoading} className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg">
                    {isLoading ? t('diseaseDiagnosis.diagnosingButton') : t('diseaseDiagnosis.diagnoseButton')}
                </button>
                </div>
            )}
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">{t('diseaseDiagnosis.resultsTitle')}</h2>
          {isLoading && <Loader message="diseaseDiagnosis.loaderMessage" />}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
          
          {diagnosis ? (
            diagnosis.is_healthy ? (
              <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                <h3 className="font-bold text-lg">{t('diseaseDiagnosis.healthyStatus')}</h3>
                <p>{t('diseaseDiagnosis.healthyMessage')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-red-700">{diagnosis.disease_name}</h3>
                  {diagnosis.confidence && (<p className="text-sm text-slate-500">{t('diseaseDiagnosis.confidenceLabel')}: <strong>{diagnosis.confidence}</strong></p>)}
                </div>
                <div><h4 className="font-semibold text-slate-800">{t('diseaseDiagnosis.symptomsLabel')}</h4><p className="text-sm text-slate-600">{diagnosis.symptoms}</p></div>
                <div><h4 className="font-semibold text-slate-800">{t('diseaseDiagnosis.organicTreatmentLabel')}</h4><p className="text-sm text-slate-600">{diagnosis.organic_treatment}</p></div>
                <div><h4 className="font-semibold text-slate-800">{t('diseaseDiagnosis.chemicalTreatmentLabel')}</h4><p className="text-sm text-slate-600">{diagnosis.chemical_treatment}</p></div>
                {diagnosis.recommended_pesticides && diagnosis.recommended_pesticides.length > 0 && (
                    <div className="pt-4 border-t mt-4 border-slate-200">
                        <h4 className="font-semibold text-slate-800">{t('diseaseDiagnosis.findTreatmentNearby')}</h4>
                        <p className="text-sm text-slate-600 mb-2">{t('diseaseDiagnosis.suggestedChemicals')}: {diagnosis.recommended_pesticides.join(', ')}</p>
                        <button onClick={handleViewMap} className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                            {t('diseaseDiagnosis.viewMapButton')}
                        </button>
                    </div>
                )}
              </div>
            )
          ) : (!isLoading && !error && <p className="text-slate-500 pt-4">{t('diseaseDiagnosis.placeholder')}</p>)}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('diseaseDiagnosis.historyTitle')}</h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map(item => (
              <div key={item.id} className="border border-slate-200/80 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <img src={item.imageDataUrl} alt="Diagnosis history" className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                  <p className={`text-sm font-semibold truncate mt-1 ${item.diagnosis.is_healthy ? 'text-green-700' : 'text-red-700'}`}>
                    {item.diagnosis.is_healthy ? t('diseaseDiagnosis.healthyStatusShort') : item.diagnosis.disease_name}
                  </p>
                  <button onClick={() => viewHistoryItem(item)} className="mt-2 w-full text-xs bg-green-100 text-green-800 font-bold py-1.5 px-2 rounded-md hover:bg-green-200 transition-colors">{t('diseaseDiagnosis.viewButton')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">{t('diseaseDiagnosis.noHistory')}</p>
        )}
      </div>
    </div>
    </>
  );
};

export default DiseaseDiagnosisComponent;
