import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletService } from '../../services/wallet.service';

interface AlchemyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const AlchemyContext = createContext<AlchemyContextType | undefined>(undefined);

export const AlchemyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    // Try to get the API key from localStorage on initial load
    const stored = localStorage.getItem('alchemyApiKey');
    return stored || null;
  });

  const setApiKey = (key: string) => {
    localStorage.setItem('alchemyApiKey', key);
    setApiKeyState(key);
    // Update WalletService
    WalletService.getInstance().updateApiKey();
  };

  const clearApiKey = () => {
    localStorage.removeItem('alchemyApiKey');
    setApiKeyState(null);
  };

  // Initialize WalletService with stored key on mount
  useEffect(() => {
    const stored = localStorage.getItem('alchemyApiKey');
    if (stored) {
      WalletService.getInstance().updateApiKey();
    }
  }, []);

  return (
    <AlchemyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </AlchemyContext.Provider>
  );
};

export const useAlchemy = () => {
  const context = useContext(AlchemyContext);
  if (context === undefined) {
    throw new Error('useAlchemy must be used within an AlchemyProvider');
  }
  return context;
}; 