import React from 'react';
import { Box, Image, Github } from 'lucide-react';
import { NetworkSelector } from '../network/NetworkSelector';
import { AddressSearch } from '../address/AddressSearch';
import { AlchemyKeyButton } from '../api/AlchemyKeyButton';

export const Header: React.FC = () => {
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col border-b border-white/5">
      {/* Main Header */}
      <header className="bg-black/40 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="text-xl font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              NFT File Manager <span className="opacity-60 text-2xl">🗿</span>
            </button>

            {/* View Type Selector */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-white text-sm border border-purple-500/20">
                <Box size={18} />
                3D Models
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 text-sm border border-white/5">
                <Image size={18} />
                Images
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 ml-auto">
            <NetworkSelector />
            <AlchemyKeyButton />
            <a
              href="https://github.com/ToxSam/NFT-File-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="View on GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Address Search Bar */}
      <div className="bg-black/40 backdrop-blur-sm px-4 py-3">
        <AddressSearch />
      </div>
    </div>
  );
}; 