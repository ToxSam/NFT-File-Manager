import React from 'react';
import { Search } from 'lucide-react';
import { AssetCard } from '../shared/AssetCard';
import { useNFTFetching } from '../../hooks/useNFTFetching';
import type { NFTMetadata } from '../../types/wallet';

interface SidebarProps {
  onSelectAsset: (asset: NFTMetadata) => void;
  selectedAsset: NFTMetadata | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectAsset,
  selectedAsset,
  searchQuery,
  onSearchChange,
}) => {
  const { nfts, loading, error } = useNFTFetching(searchQuery);

  return (
    <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-sm flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/5 focus:outline-none focus:border-white/10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-white/60">Loading assets...</div>
        ) : error ? (
          <div className="p-4 text-red-400">{error.toString()}</div>
        ) : nfts.length === 0 ? (
          <div className="p-4 text-white/60">
            {searchQuery ? 'No matching assets found' : 'No assets found'}
          </div>
        ) : (
          nfts.map((asset) => (
            <AssetCard
              key={`${asset.id}-${asset.creator}-${Math.random()}`}
              asset={asset}
              onClick={() => onSelectAsset(asset)}
              isSelected={selectedAsset?.id === asset.id}
            />
          ))
        )}
      </div>
    </div>
  );
}; 