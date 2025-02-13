import { walletService } from './wallet.service';
import { cacheService } from './cache.service';
import { SUPPORTED_CHAINS } from '../utils/constants';
import type { NFTMetadata, NetworkInfo } from '../types/wallet';

export class NFTService {
  private static instance: NFTService;
  // In-memory cache for quick network switching
  private memoryCache: Map<string, { data: NFTMetadata[], timestamp: number }> = new Map();
  private memoryCacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  private constructor() {}
  
  static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  private getAlchemyKey(): string {
    const customKey = localStorage.getItem('alchemyApiKey');
    if (!customKey) {
      throw new Error('Please set your Alchemy API key to continue');
    }
    return customKey;
  }

  async fetchNFTs(address: string, chainId: number, searchQuery?: string): Promise<NFTMetadata[]> {
    try {
      console.log('Fetching NFTs for:', { address, chainId, searchQuery });
      
      // Create a cache key that includes all relevant parameters
      const cacheKey = `nfts_${address}_${chainId}${searchQuery ? '_' + searchQuery : ''}`;
      
      // Check memory cache first (fastest)
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached && Date.now() - memoryCached.timestamp < this.memoryCacheDuration) {
        console.log('Retrieved NFTs from memory cache');
        return memoryCached.data;
      }
      
      // Try to get from persistent cache
      const cachedNFTs = await cacheService.get<NFTMetadata[]>(cacheKey);
      if (cachedNFTs) {
        console.log('Retrieved NFTs from persistent cache');
        // Update memory cache
        this.memoryCache.set(cacheKey, { data: cachedNFTs, timestamp: Date.now() });
        return cachedNFTs;
      }

      // Get network info from chainId
      const network = Object.values(SUPPORTED_CHAINS).find(n => n.id === chainId);
      if (!network) {
        throw new Error(`Network ${chainId} not supported`);
      }

      const apiKey = this.getAlchemyKey();
      const baseURL = `https://${network.alchemyNetwork}.g.alchemy.com/v2/${apiKey}`;
      
      // If not in any cache, fetch from Alchemy
      const nfts = await walletService.getNFTs(address, network, searchQuery);
      
      // Store in both caches
      await cacheService.set(cacheKey, nfts);
      this.memoryCache.set(cacheKey, { data: nfts, timestamp: Date.now() });
      
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  }

  async fetchNFTMetadata(tokenId: string, contractAddress: string): Promise<NFTMetadata> {
    try {
      const cacheKey = `nft_metadata_${contractAddress}_${tokenId}`;
      
      // Check memory cache first
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached && Date.now() - memoryCached.timestamp < this.memoryCacheDuration) {
        console.log('Retrieved NFT metadata from memory cache');
        return memoryCached.data[0]; // Metadata is stored as single-item array
      }
      
      // Try to get from persistent cache
      const cachedMetadata = await cacheService.get<NFTMetadata>(cacheKey);
      if (cachedMetadata) {
        console.log('Retrieved NFT metadata from persistent cache');
        // Update memory cache
        this.memoryCache.set(cacheKey, { data: [cachedMetadata], timestamp: Date.now() });
        return cachedMetadata;
      }

      // TODO: Implement actual metadata fetching
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      throw error;
    }
  }

  // Clean up old memory cache entries periodically
  private cleanMemoryCache() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > this.memoryCacheDuration) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const nftService = NFTService.getInstance(); 