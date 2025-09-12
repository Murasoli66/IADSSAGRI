
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const Loader = ({ message }: { message: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white/80 rounded-2xl backdrop-blur-sm">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      <p className="text-green-800 font-semibold">{t(message)}</p>
    </div>
  );
};

export default Loader;
