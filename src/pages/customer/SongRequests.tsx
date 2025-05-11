import React, { useState } from 'react';
import SongRequestForm from '../../components/customer/SongRequestForm';
import SongQueue from '../../components/customer/SongQueue';

const SongRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'request'>('list');
  
  return (
    <div className="h-full">
      <header className="mb-4">
        <h1 className="text-xl font-bold">Canciones</h1>
        <p className="text-sm text-gray-500">
          Solicita canciones y mira la lista de reproducción
        </p>
      </header>
      
      <div className="mb-4 flex">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'list'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('list')}
        >
          Lista de canciones
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'request'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('request')}
        >
          Solicitar canción
        </button>
      </div>
      
      <div className="animate-fade-in">
        {activeTab === 'list' ? (
          <SongQueue />
        ) : (
          <SongRequestForm />
        )}
      </div>
    </div>
  );
};

export default SongRequests;