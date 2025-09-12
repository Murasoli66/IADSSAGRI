
import React, { useState } from 'react';
import { MarketPrice } from '../types.ts';
import { getMarketPrices } from '../services/geminiService.ts';
import Loader from './Loader.tsx';
import { useTranslation } from '../contexts/LanguageContext.tsx';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);


const CACHE_KEY = 'agri-ai-market-prices';

const MarketPrices: React.FC = () => {
    const popularCrops = ["Rice", "Wheat", "Maize", "Cotton", "Onion", "Potato"];
    const [selectedCrop, setSelectedCrop] = useState<string>("");
    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOfflineData, setIsOfflineData] = useState(false);
    const { t, language } = useTranslation();
    const langName = language === 'en' ? 'English' : 'Tamil';

    const getCachedPrices = (): { [crop: string]: MarketPrice[] } => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : {};
        } catch (e) {
            console.error("Failed to parse cached prices:", e);
            return {};
        }
    };

    const handleGetPrices = async () => {
        if (!selectedCrop) return;
        setIsLoading(true);
        setError(null);
        setPrices([]);
        setIsOfflineData(false);

        const cachedPrices = getCachedPrices();
        const cachedData = cachedPrices[selectedCrop];

        if (cachedData) {
            setPrices(cachedData);
            setIsOfflineData(true);
        }

        if (navigator.onLine) {
            try {
                const result = await getMarketPrices(selectedCrop, langName);
                setPrices(result);
                setIsOfflineData(false);
                cachedPrices[selectedCrop] = result;
                localStorage.setItem(CACHE_KEY, JSON.stringify(cachedPrices));
            } catch (err) {
                 if (!cachedData) {
                    setError(err instanceof Error ? err.message : t('marketPrices.errorMessage'));
                }
            } finally {
                setIsLoading(false);
            }
        } else {
             if (!cachedData) {
                setError(t('marketPrices.offlineError'));
            }
            setIsLoading(false);
        }
    };

    const TrendIndicator = ({ trend }: { trend: 'stable' | 'rising' | 'falling' }) => {
        const styles = {
            rising: 'text-green-700 bg-green-100',
            falling: 'text-red-700 bg-red-100',
            stable: 'text-slate-700 bg-slate-100',
        };
        const icons = {
            rising: '↑',
            falling: '↓',
            stable: '→',
        };
        const trendKey = `marketPrices.trends.${trend}` as const;
        const trendText = t(trendKey);

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${styles[trend]}`}>
                {icons[trend]} {trendText}
            </span>
        );
    };

    const chartData = {
        labels: prices[0]?.historical_prices.map(h => h.date),
        datasets: prices.map((market, index) => {
            const colors = [
                { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' },
                { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' },
                { border: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.1)' },
            ];
            const color = colors[index % colors.length];

            return {
                label: market.market_name,
                data: market.historical_prices.map(h => h.price),
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: true,
                tension: 0.3,
            };
        }),
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: t('marketPrices.chartTitle', { crop: selectedCrop }),
                font: { size: 16 }
            },
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'day' as const,
                    tooltipFormat: 'MMM d, yyyy',
                },
                title: {
                    display: true,
                    text: t('marketPrices.chartDateAxis'),
                }
            },
            y: {
                title: {
                    display: true,
                    text: t('marketPrices.chartPriceAxis'),
                }
            }
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-slate-900">{t('marketPrices.title')}</h1>
                <p className="text-slate-600 mt-2 text-lg">{t('marketPrices.subtitle')}</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="block w-full sm:w-auto flex-grow p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">{t('marketPrices.selectCrop')}</option>
                        {popularCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                    </select>
                    <button
                        onClick={handleGetPrices}
                        disabled={!selectedCrop || isLoading}
                        className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                    >
                        {isLoading ? t('marketPrices.fetchingButton') : t('marketPrices.getPricesButton')}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && !prices.length && <div className="flex justify-center"><Loader message="marketPrices.loaderMessage" /></div>}
                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
                
                {prices.length > 0 && (
                    <div className="space-y-8">
                         <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200/80">
                            <Line options={chartOptions} data={chartData} />
                         </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
                            <div className="p-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">{t('marketPrices.pricesFor', { crop: selectedCrop })}</h2>
                                {isOfflineData && (
                                    <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                                        {t('farmingGuide.cachedData')}
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('marketPrices.marketNameHeader')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('marketPrices.priceHeader')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('marketPrices.trendHeader')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {prices.map(price => (
                                            <tr key={price.market_name}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{price.market_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">₹ {price.current_price.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><TrendIndicator trend={price.trend} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPrices;