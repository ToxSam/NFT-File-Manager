import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useAddressNFTFetching } from '../hooks/useAddressNFTFetching';
import ThreeDViewer from './viewers/ThreeDViewer';
import type { NFTMetadata } from '../types/wallet';
import { getModelUrl, convertToHttps } from '../utils/modelUtils';
import { NetworkBadge } from './network/NetworkSelector';
import { useNetwork } from './network/NetworkContext';

interface FileOption {
  type: string;
  url: string;
}

const NFTViewer: React.FC = () => {
  const { selectedNetwork } = useNetwork();
  const [activeTab, setActiveTab] = useState('3d');
  const [selectedAsset, setSelectedAsset] = useState<NFTMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  
  // Only fetch NFTs from address search
  const { nfts, loading } = useAddressNFTFetching(searchAddress, selectedNetwork);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [fileOptions, setFileOptions] = useState<FileOption[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Update search address when it changes in the URL or elsewhere
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const address = params.get('address');
      setSearchAddress(address);
    };

    // Initial check
    handleUrlChange();

    // Listen for URL changes
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('addressSearch', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('addressSearch', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    // Reset pagination when address changes
    setCurrentPage(1);
  }, [searchAddress]);

  const paginatedNfts = nfts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleModelLoaded = (stats: any) => {
    if (selectedAsset) {
      setSelectedAsset({
        ...selectedAsset,
        technical: {
          ...selectedAsset.technical,
          ...stats
        }
      });
    }
  };

  // When an NFT is selected, get all its 3D files
  useEffect(() => {
    if (!selectedAsset) {
      setFileOptions([]);
      setSelectedFileUrl(null);
      return;
    }

    const options: FileOption[] = [];

    // Add all model URLs from the new model_urls array
    if (selectedAsset.model_urls) {
      selectedAsset.model_urls.forEach(({ url, format }) => {
        options.push({
          type: format.toUpperCase(),
          url: url
        });
      });
    }

    setFileOptions(options);
    
    // Only set selected URL if none is selected or current selection is not in new options
    if (!selectedFileUrl || !options.some(opt => opt.url === selectedFileUrl)) {
      setSelectedFileUrl(options[0]?.url || null);
    }
  }, [selectedAsset]);

  const handleDownload = async () => {
    if (!selectedFileUrl) {
      console.error('No file URL selected');
      return;
    }

    try {
      // Array of IPFS gateways to try
      const ipfsGateways = [
        'https://ipfs.io/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://dweb.link/ipfs/'
      ];

      // Convert URL to HTTPS and handle IPFS URLs
      let downloadUrl = convertToHttps(selectedFileUrl);
      
      // If it's an IPFS URL, try different gateways
      if (downloadUrl.includes('/ipfs/')) {
        const ipfsHash = downloadUrl.split('/ipfs/')[1];
        
        // Try each gateway until one works
        let response;
        for (const gateway of ipfsGateways) {
          try {
            response = await fetch(`${gateway}${ipfsHash}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json, application/octet-stream, */*'
              },
              mode: 'cors'
            });
            if (response.ok) break;
          } catch (e) {
            console.log(`Gateway ${gateway} failed, trying next...`);
          }
        }
        
        if (!response || !response.ok) {
          throw new Error('Failed to fetch from all IPFS gateways');
        }

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        
        // Get file extension
        let extension = selectedFileUrl.split('.').pop()?.toLowerCase() || '';
        if (!extension) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('gltf')) extension = 'gltf';
          else if (contentType?.includes('glb')) extension = 'glb';
          else if (contentType?.includes('vrm')) extension = 'vrm';
          else extension = 'model';
        }

        // Download the file
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${selectedAsset?.name || 'model'}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
      } else {
        // For non-IPFS URLs, try direct download
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/octet-stream, */*'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        
        const extension = selectedFileUrl.split('.').pop()?.toLowerCase() || 'model';
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${selectedAsset?.name || 'model'}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-black via-[#1a0822] to-black text-white">
      <main className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-sm flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full bg-white/5 rounded-lg pl-4 pr-4 py-2 text-sm border border-white/5 focus:outline-none focus:border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-white/60">Loading...</div>
            ) : paginatedNfts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {paginatedNfts.map((nft, index) => (
                  <div 
                    key={`${nft.contract?.address || nft.id || index}-${nft.tokenId || index}`} 
                    className="w-full"
                  >
                    <button
                      onClick={() => {
                        setSelectedAsset(nft);
                      }}
                      className={`w-full p-4 flex items-start gap-3 transition-all ${
                        selectedAsset?.tokenId === nft.tokenId && 
                        selectedAsset?.contract?.address === nft.contract?.address &&
                        selectedAsset?.name === nft.name
                          ? 'bg-purple-500/20 border-l-4 border-l-purple-500 text-white' 
                          : 'text-white/60 hover:text-white hover:bg-white/5 border-b border-white/5'
                      }`}
                    >
                      <img
                        src={nft.thumbnail}
                        alt={nft.name}
                        className={`w-16 h-16 rounded bg-black/50 object-cover ${
                          selectedAsset?.tokenId === nft.tokenId && 
                          selectedAsset?.contract?.address === nft.contract?.address &&
                          selectedAsset?.name === nft.name
                            ? 'ring-2 ring-purple-500' : ''
                        }`}
                      />
                      <div className="flex-1 text-left">
                        <h3 className="font-medium mb-1">{nft.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white/60">{nft.collection}</p>
                          {nft.network && (
                            <NetworkBadge network={nft.network} />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-white/60">
                {searchAddress ? 'No NFTs found for this address.' : (
                  <div className="space-y-2">
                    <p>Enter an address above to view NFTs.</p>
                    <p>Enter an Alchemy API key to use this app, check the key button 🗝️ at the top right.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {paginatedNfts.length > 0 && (
            <div className="p-4 flex justify-center gap-2 border-t border-white/5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-[#1a1a1a] hover:bg-[#252525] px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {Math.ceil(nfts.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(nfts.length / itemsPerPage)}
                className="bg-[#1a1a1a] hover:bg-[#252525] px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Main View */}
        <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
          {selectedAsset ? (
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex flex-col h-full max-w-[1400px] mx-auto">
                {/* Preview Area */}
                <div className="flex-1 min-h-[450px] bg-black/40 rounded-lg mb-8 border border-white/5">
                  {activeTab === '3d' ? (
                    selectedFileUrl ? (
                      <ThreeDViewer 
                        key={selectedFileUrl}
                        modelUrl={selectedFileUrl}
                        onModelLoaded={handleModelLoaded}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/60">
                        No 3D model available
                      </div>
                    )
                  ) : (
                    <img
                      src={selectedAsset.thumbnail}
                      alt={selectedAsset.name}
                      className="max-h-full w-auto mx-auto"
                    />
                  )}
                </div>

                {/* Asset Info */}
                <div className="space-y-6">
                  {/* Title, Format Options, and Download */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                      <h2 className="text-2xl font-bold">{selectedAsset.name}</h2>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                          {fileOptions.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedFileUrl(option.url)}
                              className={`px-3 py-1 rounded-lg border transition-all ${
                                selectedFileUrl === option.url
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {option.type}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/20 transition-all text-white"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-black/20 rounded-lg p-4 border border-white/5">
                      <div>
                        <span className="text-white/40 block mb-1">Collection</span>
                        <p className="font-medium text-white">{selectedAsset.collection}</p>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Creator</span>
                        <p className="font-medium text-white">{selectedAsset.creator}</p>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Format</span>
                        <p className="font-medium text-white">{selectedAsset.format.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Network</span>
                        {selectedAsset?.network && (
                          <NetworkBadge network={selectedAsset.network} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description with Show More/Less */}
                  <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className={`relative ${!isDescriptionExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
                      <p className="text-white/60 mb-6">
                        {selectedAsset?.description || 'No description available'}
                      </p>
                      {!isDescriptionExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
                      )}
                    </div>
                    {selectedAsset?.description && selectedAsset.description.length > 100 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Model Stats */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                        <h4 className="text-sm font-medium text-white/40 mb-3">Model Statistics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/40">Triangles</span>
                            <span className="text-white">{selectedAsset.technical.triangles?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Vertices</span>
                            <span className="text-white">{selectedAsset.technical.vertices?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Materials</span>
                            <span className="text-white">{selectedAsset.technical.materials || '0'}</span>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                        <h4 className="text-sm font-medium text-white/40 mb-3">File Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/40">File Size</span>
                            <span className="text-white">{selectedAsset.technical.fileSize || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Animations</span>
                            <span className="text-white">{selectedAsset.technical.animations || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Format</span>
                            <span className="text-white">{selectedAsset.format.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Storage Info */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                        <h4 className="text-sm font-medium text-white/40 mb-3">Storage Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/40">Storage Type</span>
                            <span className="text-white">{selectedAsset.technical?.storage?.type || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/40">Hash</span>
                            <span className="text-white text-sm font-mono truncate max-w-[200px]" title={selectedAsset.technical?.storage?.hash || 'N/A'}>
                              {selectedAsset.technical?.storage?.hash || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/40">NFTScan</span>
                            <a 
                              href={`https://eth.nftscan.com/${selectedAsset.contract?.address}/${selectedAsset.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center gap-1"
                            >
                              View on NFTScan
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              Select an asset to view details
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NFTViewer; 