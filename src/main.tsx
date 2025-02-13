import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletProvider } from './components/wallet/WalletContext';
import { NetworkProvider } from './components/network/NetworkContext';
import './index.css';

// Polyfills
window.global = window;
window.process = { env: { NODE_ENV: import.meta.env.MODE } };

console.log('Alchemy Key available:', !!import.meta.env.VITE_ALCHEMY_KEY);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NetworkProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </NetworkProvider>
  </React.StrictMode>
); 