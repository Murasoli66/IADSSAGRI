
import React from 'react';
import { CloseIcon } from './icons';

interface MapModalProps {
  query: string;
  title: string;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ query, title, onClose }) => {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="map-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 id="map-modal-title" className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close map view">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-grow">
          <iframe
            title="Nearby Shops Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapSrc}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
