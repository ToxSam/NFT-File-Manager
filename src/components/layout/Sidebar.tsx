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

  if (loading) {
    return <div className="p-4 text-white/60">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (nfts.length === 0) {
    return <div className="p-4 text-white/60">No NFTs found</div>;
  }

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
        {nfts.map((asset) => (
          <button
            key={`${asset.contract?.address || asset.id || Math.random()}-${asset.tokenId || Math.random()}`}
            onClick={() => onSelectAsset(asset)}
            className={`w-full p-4 flex items-start gap-3 transition-all ${
              selectedAsset?.id === asset.id
                ? 'bg-purple-500/20 border-l-4 border-l-purple-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-b border-white/5'
            }`}
          >
            {asset.thumbnail && (
              <img
                src={asset.thumbnail}
                alt={asset.name}
                className={`w-16 h-16 rounded bg-black/50 object-cover ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-purple-500' : ''
                }`}
              />
            )}
            <div className="flex-1 text-left">
              <h3 className="font-medium mb-1">{asset.name}</h3>
              <p className="text-sm text-white/40 truncate">{asset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 