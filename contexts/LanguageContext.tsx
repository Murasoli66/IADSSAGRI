import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Language = 'en' | 'ta';
type Translations = { [key: string]: any };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const fetchWithTimeout = (resource: RequestInfo, options: RequestInit = {}, timeout = 8000): Promise<Response> => {
    const controller = new AbortController();
    const signal = controller.signal;
    options.signal = signal;

    const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
            controller.abort();
            reject(new Error('Network request timed out.'));
        }, timeout);
    });

    return Promise.race([
        fetch(resource, options),
        timeoutPromise
    ]);
};

const fetchTranslations = async (lang: Language): Promise<Translations> => {
  const response = await fetchWithTimeout(`/locales/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch translations for ${lang} with status: ${response.status}`);
  }
  return response.json();
};

const getInitialLanguage = (): Language => {
    try {
        const storedLang = localStorage.getItem('agri-ai-language');
        if (storedLang === 'en' || storedLang === 'ta') {
            return storedLang;
        }
    } catch (error) {
        console.warn("Could not access localStorage to get language:", error);
    }
    return 'en';
};

const InitialLoader = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-600"></div>
    </div>
);


export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const newTranslations = await fetchTranslations(language);
        setTranslations(newTranslations);
      } catch (error) {
        console.error(`Failed to load translations for '${language}'. Attempting fallback to 'en'.`, error);
        try {
          // Attempt to load English as a fallback
          const fallbackTranslations = await fetchTranslations('en');
          setTranslations(fallbackTranslations);
          // If the selected language failed, reset to English
          if (language !== 'en') {
              setLanguage('en');
          }
        } catch (fallbackError) {
          console.error("CRITICAL: Fallback to English translations also failed.", fallbackError);
          setTranslations({}); // On complete failure, use empty object so app can still render.
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    try {
        localStorage.setItem('agri-ai-language', lang);
    } catch (error) {
        console.warn("Could not access localStorage to set language:", error);
    }
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: { [key: string]: string }): string => {
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => acc && acc[currentKey], translations);

    if (typeof result === 'string' && replacements) {
        Object.keys(replacements).forEach(placeholder => {
            result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacements[placeholder]);
        });
    }
    
    // Ensure we always return a string to prevent React from crashing
    if (typeof result !== 'string') {
        return key;
    }

    return result;
  };

  if (isLoading) {
      return <InitialLoader />;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
