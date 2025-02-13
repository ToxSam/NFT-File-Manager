import React from 'react';
import { useWallet } from './WalletContext';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <div>
      {isConnected ? (
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-all"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
        </button>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-all"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}; 