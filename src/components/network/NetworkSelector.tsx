import React from 'react';
import { useNetwork } from './NetworkContext';
import type { NetworkInfo } from '../../types/wallet';

export const NetworkSelector: React.FC = () => {
  const { selectedNetwork, setSelectedNetwork, availableNetworks } = useNetwork();

  return (
    <div className="flex items-center gap-2">
      {availableNetworks.map((network) => (
        <button
          key={network.id}
          onClick={() => setSelectedNetwork(network)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            selectedNetwork.id === network.id
              ? 'bg-white/10 border border-white/20 text-white'
              : 'hover:bg-white/5 text-white/60 hover:text-white'
          }`}
          title={network.name}
          style={{ 
            borderColor: selectedNetwork.id === network.id ? `${network.color}40` : undefined,
            background: selectedNetwork.id === network.id ? `${network.color}10` : undefined
          }}
        >
          <img 
            src={network.icon} 
            alt={network.name} 
            className="w-6 h-6"
          />
          <span className="hidden sm:inline text-sm font-medium">{network.shortName}</span>
        </button>
      ))}
    </div>
  );
};

export const NetworkBadge: React.FC<{ network: NetworkInfo }> = ({ network }) => {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${network.color}15`,
        color: network.color,
        borderColor: `${network.color}30`,
        border: '1px solid'
      }}
    >
      <img 
        src={network.icon} 
        alt={network.name} 
        className="w-4 h-4"
      />
      <span>{network.shortName}</span>
    </div>
  );
}; 