import React from 'react';
import { ThreeDViewer } from './ThreeDViewer';
import type { NFTMetadata } from '../../types/wallet';

export interface ViewerContainerProps {
  asset: NFTMetadata;
  onLoad?: () => void;
  onError?: (error: unknown) => void;
}

export const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  asset,
  onLoad,
  onError
}) => {
  // Add viewer selection logic based on asset type
  return (
    <div className="w-full aspect-video bg-black/20 rounded-lg overflow-hidden">
      <ThreeDViewer
        modelUrl={asset.technical.storage.url || asset.technical.storage.gateway}
        onModelLoaded={onLoad}
        onError={onError}
      />
    </div>
  );
}; 