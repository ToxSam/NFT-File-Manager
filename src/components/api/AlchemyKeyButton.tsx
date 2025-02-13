import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { useAlchemy } from './AlchemyContext';
import { AlchemyKeyModal } from './AlchemyKeyModal';
import { createPortal } from 'react-dom';

export const AlchemyKeyButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { apiKey } = useAlchemy();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        title={apiKey ? "Change API Key" : "Set API Key"}
      >
        <Key
          size={20}
          className={`${apiKey ? 'text-cyan-500' : 'text-gray-400'} hover:text-cyan-400`}
        />
      </button>
      
      {isModalOpen && createPortal(
        <AlchemyKeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}; 