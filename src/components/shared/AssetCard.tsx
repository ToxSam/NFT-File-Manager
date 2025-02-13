import React from 'react';
import { NFTMetadata } from '../../types/wallet';

interface AssetCardProps {
  asset: NFTMetadata;
  onClick: () => void;
  isSelected: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 border-b border-white/5 transition-all ${
        isSelected ? 'bg-[#1a0822]/50' : 'hover:bg-white/5'
      }`}
    >
      <img
        src={asset.thumbnail}
        alt={asset.name}
        className="w-16 h-16 rounded bg-black/50 object-cover"
      />
      <div className="flex-1 text-left">
        <h3 className="font-medium mb-1">{asset.name}</h3>
        <p className="text-sm text-white/60">{asset.collection}</p>
      </div>
    </button>
  );
}; 