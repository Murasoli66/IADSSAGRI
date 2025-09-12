
import { SoilAnalysisRecord, DiseaseDiagnosisRecord } from '../types';

const DB_NAME = 'AgriAIDB';
const DB_VERSION = 1;
const SOIL_STORE = 'soilAnalyses';
const DISEASE_STORE = 'diseaseDiagnoses';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SOIL_STORE)) {
        db.createObjectStore(SOIL_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(DISEASE_STORE)) {
        db.createObjectStore(DISEASE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
    if (!db) {
        throw new Error("Database not initialized. Call initDB first.");
    }
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

// Soil Analysis functions
export const addSoilAnalysis = (record: Omit<SoilAnalysisRecord, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const store = getStore(SOIL_STORE, 'readwrite');
    const request = store.add(record);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getAllSoilAnalyses = (): Promise<SoilAnalysisRecord[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(SOIL_STORE, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as SoilAnalysisRecord[]).sort((a,b) => b.timestamp - a.timestamp));
    request.onerror = () => reject(request.error);
  });
};

// Disease Diagnosis functions
export const addDiseaseDiagnosis = (record: Omit<DiseaseDiagnosisRecord, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const store = getStore(DISEASE_STORE, 'readwrite');
    const request = store.add(record);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getAllDiseaseDiagnoses = (): Promise<DiseaseDiagnosisRecord[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(DISEASE_STORE, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as DiseaseDiagnosisRecord[]).sort((a, b) => b.timestamp - a.timestamp));
    request.onerror = () => reject(request.error);
  });
};
