
export type View = 'dashboard' | 'soil' | 'disease' | 'guide' | 'market' | 'profile' | 'fertilizer';

export interface UserProfile {
  name: string;
  email: string;
  picture: string | null;
}

export interface CropRecommendation {
  crop_name: string;
  reason: string;
  market_demand: string;
}

export interface DiseaseDiagnosis {
  is_healthy: boolean;
  disease_name: string;
  confidence: 'Low' | 'Medium' | 'High' | null;
  symptoms: string;
  organic_treatment: string;
  chemical_treatment: string;
  recommended_pesticides?: string[];
}

export interface FarmingTask {
  week: number;
  task: string;
  details: string;
}

export interface FertilizerTask {
    week: number;
    task: string;
    fertilizer_type: string;
    details: string;
}

export interface MarketPrice {
  market_name: string;
  current_price: number;
  trend: 'stable' | 'rising' | 'falling';
  historical_prices: { date: string; price: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CurrentWeather {
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
}

export interface DailyForecast {
  day: string;
  max_temp: number;
  min_temp: number;
  description: string;
}

export interface WeatherData {
  location: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
}

// Types for IndexedDB records
export interface SoilAnalysisRecord {
  id?: number;
  imageDataUrl: string;
  recommendations: CropRecommendation[];
  timestamp: number;
}

export interface DiseaseDiagnosisRecord {
  id?: number;
  imageDataUrl: string;
  diagnosis: DiseaseDiagnosis;
  timestamp: number;
}