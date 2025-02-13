import React from 'react';
import { Download } from 'lucide-react';
import { ViewerContainer } from '../viewers/ViewerContainer';
import type { NFTMetadata } from '../../types/wallet';

interface MainViewProps {
  selectedAsset: NFTMetadata | null;
}

export const MainView: React.FC<MainViewProps> = ({ selectedAsset }) => {
  const handleDownload = async () => {
    if (!selectedAsset) return;
    // TODO: Implement download functionality
    window.open(selectedAsset.technical.storage.gateway, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
      {selectedAsset ? (
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Preview Area */}
          <ViewerContainer
            asset={selectedAsset}
            onLoad={() => console.log('Asset loaded')}
            onError={(error) => console.error('Error loading asset:', error)}
          />

          {/* Asset Info */}
          <div className="grid grid-cols-12 gap-8 mt-8">
            <div className="col-span-8">
              <h2 className="text-2xl font-bold mb-2">{selectedAsset.name}</h2>
              <p className="text-white/60 mb-6">{selectedAsset.description}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-white/40">Collection</span>
                  <p className="font-medium text-white">{selectedAsset.collection}</p>
                </div>
                <div>
                  <span className="text-white/40">Creator</span>
                  <p className="font-medium text-white">{selectedAsset.creator}</p>
                </div>
                <div>
                  <span className="text-white/40">Format</span>
                  <p className="font-medium text-white">{selectedAsset.format.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Asset
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white/40">
          Select an asset to view details
        </div>
      )}
    </div>
  );
}; 