import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_CHAINS } from '../../utils/constants';
import type { NetworkInfo } from '../../types/wallet';

interface NetworkContextType {
  selectedNetwork: NetworkInfo;
  setSelectedNetwork: (network: NetworkInfo) => void;
  availableNetworks: NetworkInfo[];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo>(SUPPORTED_CHAINS.ETHEREUM);
  const availableNetworks = Object.values(SUPPORTED_CHAINS);

  return (
    <NetworkContext.Provider
      value={{
        selectedNetwork,
        setSelectedNetwork,
        availableNetworks,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
} 