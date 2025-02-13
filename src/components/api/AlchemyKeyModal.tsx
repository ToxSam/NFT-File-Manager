import React, { useState } from 'react';
import { Key, X, Eye } from 'lucide-react';
import { useAlchemy } from './AlchemyContext';

interface AlchemyKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlchemyKeyModal: React.FC<AlchemyKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useAlchemy();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1625] rounded-xl p-8 w-[480px] relative text-gray-300 shadow-2xl border border-white/5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center mb-6">
          <Key className="text-purple-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-white">Set API Key</h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-white/80">Dear users, this project is meant to help you pick your own NFT files from your metadata.</p>
          
          <p className="text-white/80">Even though blockchain information is public, we still require a third-party solution to easily browse through it, which comes with associated costs.</p>
          
          <p className="text-white/80">This is a side project that was born out of my own necessity to access metadata files, so there are no plans to sustain the project financially.</p>
          
          <p className="text-white/80">An Alchemy API key is required to fetch NFT data from various blockchain networks. You can get a free API key from Alchemy in just a few steps:</p>
          
          <ol className="list-decimal list-inside space-y-2 ml-4 text-white/80">
            <li>Visit <a href="https://alchemy.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Alchemy's website</a></li>
            <li>Sign up for a free account</li>
            <li>Create a new app in your dashboard</li>
            <li>Copy your API key and paste it here</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 text-white border border-purple-500/20 focus:border-purple-500 focus:outline-none pr-10"
              placeholder="••••••••••••••••••••••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <Eye size={20} />
            </button>
          </div>
          
          <div className="text-sm text-white/60">
            Your API key will be stored locally and never shared.
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white rounded-lg border border-white/5 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500/20 text-white rounded-lg hover:bg-purple-500/30 border border-purple-500/20"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 