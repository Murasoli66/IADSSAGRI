
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { CropRecommendation, DiseaseDiagnosis, FarmingTask, MarketPrice, ChatMessage, WeatherData, FertilizerTask } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAiClient = (): GoogleGenAI | null => {
    if (ai) {
        return ai;
    }
    
    const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

    if (!API_KEY) {
        console.error("API key is not configured. This is required for AI features to work.");
        return null;
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};

// Utility to handle file to base64 conversion
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const aiNotConfiguredError = "AI Service is not configured. Please ensure the API key is set up correctly.";


export const getCropRecommendationsFromImage = async (imageFile: File, language: string): Promise<CropRecommendation[]> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const textPart = { text: `You are an expert soil scientist and agronomist. Analyze this image of soil to determine its type (e.g., sandy, clay, loam), texture, and infer potential characteristics like drainage and fertility. Based on your visual analysis, recommend the top 3 most suitable crops. For each crop, provide a short reason for its suitability and a brief overview of its market demand. Provide the response in ${language}.` };

  try {
    const aiClient = getAiClient();
    if (!aiClient) throw new Error(aiNotConfiguredError);
    
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        crop_name: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        market_demand: { type: Type.STRING },
                    },
                    required: ["crop_name", "reason", "market_demand"],
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error getting crop recommendations from image:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get crop recommendations from image.");
  }
};

export const diagnosePlantDisease = async (imageFile: File, language: string): Promise<DiseaseDiagnosis> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: `You are a plant pathologist. Analyze this image of a plant leaf. Identify potential diseases, confidence score (Low, Medium, or High), symptoms, and suggest organic and chemical treatments. If the plant is healthy, indicate that. Also, suggest a list of 2-3 common chemical names or active ingredients for pesticides that can treat this disease if it's not healthy. Provide the response in ${language}.` };
    
    try {
        const aiClient = getAiClient();
        if (!aiClient) throw new Error(aiNotConfiguredError);

        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        is_healthy: { type: Type.BOOLEAN },
                        disease_name: { type: Type.STRING },
                        confidence: { type: Type.STRING, enum: ["Low", "Medium", "High", "N/A"] },
                        symptoms: { type: Type.STRING },
                        organic_treatment: { type: Type.STRING },
                        chemical_treatment: { type: Type.STRING },
                        recommended_pesticides: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["is_healthy", "disease_name", "confidence", "symptoms", "organic_treatment", "chemical_treatment"],
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error diagnosing plant disease:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to diagnose plant disease.");
    }
};


export const getFarmingSchedule = async (crop: string, language: string): Promise<FarmingTask[]> => {
    const prompt = `Generate a simplified 12-week farming schedule for ${crop}, from sowing to near-harvest. For each week, provide a key task and a brief detail. Provide the response in ${language}.`;
    try {
        const aiClient = getAiClient();
        if (!aiClient) throw new Error(aiNotConfiguredError);

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            week: { type: Type.INTEGER },
                            task: { type: Type.STRING },
                            details: { type: Type.STRING },
                        },
                        required: ["week", "task", "details"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error getting farming schedule:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get farming schedule.");
    }
};

export const getFertilizerSchedule = async (crop: string, startDate: string, endDate: string, language: string): Promise<{schedule: FertilizerTask[], fertilizer_types: string[]}> => {
    const prompt = `Generate a simplified fertilizer schedule for ${crop} from a start date of ${startDate} to an end date of ${endDate}. The schedule should be broken down by week number from the start date. For each entry, provide the week number, a key task, the type of fertilizer to use (e.g., 'NPK 10-20-20', 'Urea', 'Compost'), and brief details. Also, provide a separate summary list of the main fertilizer types mentioned. Provide the response in ${language}.`;
    try {
        const aiClient = getAiClient();
        if (!aiClient) throw new Error(aiNotConfiguredError);

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    week: { type: Type.INTEGER },
                                    task: { type: Type.STRING },
                                    fertilizer_type: { type: Type.STRING },
                                    details: { type: Type.STRING },
                                },
                                required: ["week", "task", "fertilizer_type", "details"]
                            }
                        },
                        fertilizer_types: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["schedule", "fertilizer_types"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting fertilizer schedule:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get fertilizer schedule.");
    }
};

export const getMarketPrices = async (crop: string, language: string): Promise<MarketPrice[]> => {
    const prompt = `Provide realistic, simulated current market prices for ${crop} in three different major markets in India. For each market, include the current price per quintal, a market trend indicator (stable, rising, falling), and a 7-day historical price array. The historical data should be for the past 7 days, with each entry containing a date (YYYY-MM-DD format, ending today) and a price. Provide the response in ${language}.`;
    try {
        const aiClient = getAiClient();
        if (!aiClient) throw new Error(aiNotConfiguredError);

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            market_name: { type: Type.STRING },
                            current_price: { type: Type.NUMBER },
                            trend: { type: Type.STRING, enum: ["stable", "rising", "falling"] },
                            historical_prices: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        date: { type: Type.STRING },
                                        price: { type: Type.NUMBER },
                                    },
                                    required: ["date", "price"]
                                }
                            }
                        },
                        required: ["market_name", "current_price", "trend", "historical_prices"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error getting market prices:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get market prices.");
    }
};

export const getWeatherForecast = async (latitude: number, longitude: number, language: string): Promise<WeatherData> => {
    const prompt = `You are a weather forecasting service. Provide a realistic, simulated weather forecast for the location at latitude ${latitude} and longitude ${longitude}. Give me the city/area name, the current weather (temperature in Celsius, a short description, humidity percentage, and wind speed in km/h), and a 5-day forecast. For the 5-day forecast, provide the day of the week, max and min temperatures, and a short weather description for each day. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. The next 5 days should be the subsequent days of the week. Provide the response in ${language}.`;

    try {
        const aiClient = getAiClient();
        if (!aiClient) throw new Error(aiNotConfiguredError);

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        current: {
                            type: Type.OBJECT,
                            properties: {
                                temperature: { type: Type.NUMBER },
                                description: { type: Type.STRING },
                                humidity: { type: Type.NUMBER },
                                wind_speed: { type: Type.NUMBER },
                            },
                            required: ["temperature", "description", "humidity", "wind_speed"]
                        },
                        forecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    max_temp: { type: Type.NUMBER },
                                    min_temp: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                },
                                required: ["day", "max_temp", "min_temp", "description"]
                            }
                        }
                    },
                    required: ["location", "current", "forecast"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting weather forecast:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get weather data from AI service.");
    }
};


export const startChat = (language: string) => {
    try {
        const aiClient = getAiClient();
        if (!aiClient) { // Check if client is available
            chat = null;
            return;
        }

        const langInstruction = language === 'Tamil' 
            ? "You must respond only in Tamil."
            : "You must respond only in English.";

        chat = aiClient.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are 'IADSS Bot', a friendly and helpful AI assistant for farmers. Your goal is to provide clear, concise, and practical advice on agriculture. Use emojis to be friendly. Keep answers simple. ${langInstruction}`,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
    } catch (error) {
        console.error("Failed to start chat:", error);
        chat = null; // Ensure chat is null if initialization fails
    }
};

export async function* streamChat(message: string, language: string) {
    if (!chat) {
        startChat(language);
        if (!chat) { // Check again after attempting to start
            yield "Sorry, the chat service is currently unavailable. Please check the API key configuration.";
            return;
        }
    }
    
    try {
        const result = await (chat as Chat).sendMessageStream({
            message: message,
        });

        for await (const chunk of result) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in streaming chat:", error);
        yield "Sorry, I encountered an error. Please try again.";
    }
}