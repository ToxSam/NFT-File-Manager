import React from 'react';
import NFTViewer from './components/NFTViewer';
import { AlchemyProvider } from './components/api/AlchemyContext';
import { Header } from './components/layout/Header';

const App: React.FC = () => {
  return (
    <AlchemyProvider>
      <div className="h-screen flex flex-col bg-[#13111a]">
        <Header />
        <div className="flex-1 h-[calc(100vh-98px)]">
          <NFTViewer />
        </div>
      </div>
    </AlchemyProvider>
  );
};

export default App; 