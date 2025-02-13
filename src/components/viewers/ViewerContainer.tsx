import React from 'react';
import { ThreeDViewer } from './ThreeDViewer';
import { VRMViewer } from './VRMViewer';

interface ViewerContainerProps {
  modelUrl: string;
  onModelLoaded?: (stats: any) => void;
}

export const ViewerContainer: React.FC<ViewerContainerProps> = ({ modelUrl, onModelLoaded }) => {
  const fileType = modelUrl.split('.').pop()?.toLowerCase();
  console.log('File type:', fileType);

  if (fileType === 'vrm') {
    console.log('Routing to VRMViewer');
    return <VRMViewer modelUrl={modelUrl} onModelLoaded={onModelLoaded} />;
  }

  console.log('Routing to ThreeDViewer');
  return <ThreeDViewer modelUrl={modelUrl} onModelLoaded={onModelLoaded} />;
}; 