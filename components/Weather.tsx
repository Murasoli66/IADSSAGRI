

import React, { useState, useEffect } from 'react';
import { getWeatherForecast } from '../services/geminiService';
import { WeatherData, DailyForecast } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

// Weather Icons
const SunIcon = ({ className }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> );
const CloudIcon = ({ className }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.5 4.5 0 002.25 15z" /></svg> );
const RainIcon = ({ className }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h5.25a3.75 3.75 0 003.75-3.75V10.5A3.75 3.75 0 0015.75 6h-5.25zm0 0V6.75m0 0v-1.5m0 1.5v-1.5m0 0V3.75M12 12.75v1.5m0 0v1.5m0-1.5v-1.5m0 0V9.75m5.25-1.5H9.75" /></svg> );
const PartlyCloudyIcon = ({ className }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636m12.364 12.364A5.25 5.25 0 0016.5 10.5a5.25 5.25 0 00-5.25-5.25H10.5a5.25 5.25 0 00-5.25 5.25v.75a4.5 4.5 0 004.5 4.5h3.75z" /></svg> );
const ThermometerIcon = ({ className }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 12.75V3" /></svg> );
const CACHE_KEY = 'agri-ai-weather-cache';

const WeatherIcon = ({ description, className }: { description: string, className?: string }) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('shower')) return <RainIcon className={className} />;
    if (desc.includes('partly cloudy')) return <PartlyCloudyIcon className={className} />;
    if (desc.includes('cloud')) return <CloudIcon className={className} />;
    if (desc.includes('sun') || desc.includes('clear')) return <SunIcon className={className} />;
    return <ThermometerIcon className={className} />;
};

const Weather: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const { t, language } = useTranslation();
    const langName = language === 'en' ? 'English' : 'Tamil';

    useEffect(() => {
        const loadCachedWeather = () => {
             try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    setWeatherData(data);
                    setLastUpdated(timestamp);
                }
            } catch (e) {
                console.error("Failed to parse cached weather:", e);
            }
        };

        loadCachedWeather();

        const fetchWeather = (lat: number, lon: number) => {
            setIsLoading(true);
            getWeatherForecast(lat, lon, langName)
                .then(data => {
                    setWeatherData(data);
                    setError(null);
                    const now = Date.now();
                    setLastUpdated(now);
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now }));
                })
                .catch(err => {
                    console.error(err);
                    if (!weatherData) { // Only set error if no cached data is available
                        setError(t('weather.fetchError'));
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        };

        navigator.geolocation.getCurrentPosition(
            position => fetchWeather(position.coords.latitude, position.coords.longitude),
            err => {
                console.warn(`Geolocation error (${err.code}): ${err.message}`);
                if (!weatherData) setError(t('weather.locationDenied'));
                // Fetch for default location if no cached data and geo fails
                if (!weatherData) fetchWeather(21.1458, 79.0882);
                else setIsLoading(false);
            }
        );
    }, [langName, t]);

    if (isLoading && !weatherData) {
        return <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl text-center text-slate-600 shadow-md">{t('weather.loaderMessage')}</div>;
    }
    
    if (error && !weatherData) {
        return <div className="p-6 bg-red-100 border border-red-300 rounded-2xl text-center text-red-700 shadow-md">{error}</div>;
    }

    if (!weatherData) return null;

    const { location, current, forecast } = weatherData;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{location}</h2>
                    <p className="text-slate-600">{t('weather.currentWeather')}</p>
                    {lastUpdated && <p className="text-xs text-slate-400 mt-1">{t('weather.lastUpdated')}: {new Date(lastUpdated).toLocaleTimeString()}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-amber-500"><WeatherIcon description={current.description} className="h-16 w-16 sm:h-20 sm:w-20" /></div>
                    <div>
                        <p className="text-5xl font-bold text-slate-900">{Math.round(current.temperature)}°C</p>
                        <p className="text-slate-600 capitalize">{current.description}</p>
                    </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1 text-right">
                    <p>{t('weather.humidity')}: <strong>{current.humidity}%</strong></p>
                    <p>{t('weather.wind')}: <strong>{current.wind_speed} km/h</strong></p>
                </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold mb-2 text-slate-800">{t('weather.forecastTitle')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {forecast.slice(0, 5).map((day: DailyForecast, index: number) => (
                        <div key={index} className="flex flex-col items-center bg-slate-100 p-3 rounded-xl text-center">
                            <p className="font-bold text-slate-800">{day.day.substring(0, 3)}</p>
                            <div className="my-2 text-blue-500"><WeatherIcon description={day.description} className="h-8 w-8"/></div>
                            <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">{Math.round(day.max_temp)}°</span> / {Math.round(day.min_temp)}°</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weather;
