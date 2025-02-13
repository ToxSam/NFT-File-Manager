import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from './WalletContext';

export const WalletConnect: React.FC = () => {
  const { isConnected, connect, disconnect, address, error } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
          isConnected 
            ? 'bg-[#1a0822]/50 text-white/80 border border-purple-500/20' 
            : 'bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
      >
        <Wallet className="w-4 h-4" />
        {isConnected ? 
          `${address?.slice(0, 6)}...${address?.slice(-4)}` : 
          'Connect Wallet'
        }
      </button>
      {error && (
        <div className="absolute top-full mt-2 w-full p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}; 