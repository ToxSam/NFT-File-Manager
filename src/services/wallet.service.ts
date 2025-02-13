import { Alchemy, Network } from '@alch/alchemy-sdk';
import { SUPPORTED_CHAINS } from '../utils/constants';
import type { NFTMetadata, NetworkInfo } from '../types/wallet';
import type { AlchemyNFTResponse } from '../types/alchemy';

export class WalletService {
  private static instance: WalletService;
  private alchemyInstances: Map<number, Alchemy> = new Map();
  private retryDelay = 1000; // Start with 1 second delay
  private maxRetries = 3;
  // Memory cache for quick network switching
  private memoryCache: Map<string, { data: NFTMetadata[], timestamp: number }> = new Map();
  private memoryCacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {
    this.initializeAlchemyInstances();
  }

  private initializeAlchemyInstances(): void {
    const apiKey = localStorage.getItem('alchemyApiKey');
    if (!apiKey) {
      console.log('Alchemy Key available:', false);
      return;
    }

    // Clear existing instances
    this.alchemyInstances.clear();

    // Initialize Alchemy instances for each network
    Object.values(SUPPORTED_CHAINS).forEach(network => {
      // @ts-expect-error - Known issue with Alchemy SDK types
      this.alchemyInstances.set(network.id, new Alchemy({
        apiKey,
        network: network.alchemyNetwork as Network
      }));
    });
  }

  public updateApiKey(): void {
    const newApiKey = localStorage.getItem('alchemyApiKey');
    if (!newApiKey) return;
    
    // Clear existing instances
    this.alchemyInstances.clear();
    
    // Initialize new instances with the new API key
    Object.values(SUPPORTED_CHAINS).forEach(network => {
      // @ts-expect-error - Known issue with Alchemy SDK types
      this.alchemyInstances.set(network.id, new Alchemy({
        apiKey: newApiKey,
        network: network.alchemyNetwork as Network
      }));
    });

    // Clear memory cache when API key changes
    this.memoryCache.clear();
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private getAlchemyInstance(networkId: number): Alchemy {
    const instance = this.alchemyInstances.get(networkId);
    if (!instance) {
      throw new Error('No Alchemy instance available. Please set your API key first.');
    }
    return instance;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429 && retries < this.maxRetries) {
        console.log(`Rate limited, waiting ${this.retryDelay}ms before retry ${retries + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        // Exponential backoff
        this.retryDelay *= 2;
        return this.fetchWithRetry(url, options, retries + 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`Request failed, retrying... (${retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        this.retryDelay *= 2;
        return this.fetchWithRetry(url, options, retries + 1);
      }
      throw error;
    }
  }

  async getNFTs(address: string, network: NetworkInfo, searchQuery?: string) {
    try {
      if (!address) {
        throw new Error('Address is required');
      }

      // Create cache key
      const cacheKey = `nfts_3d_${address}_${network.id}${searchQuery ? '_' + searchQuery : ''}`;

      // Check memory cache first
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached && Date.now() - memoryCached.timestamp < this.memoryCacheDuration) {
        console.log('Retrieved 3D NFTs from memory cache');
        return memoryCached.data;
      }

      console.log(`Fetching NFTs for address: ${address} on ${network.name}`);

      let allNFTs: NFTMetadata[] = [];
      let pageKey: string | undefined = undefined;
      
      do {
        // Add delay between pagination requests
        if (pageKey) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between pages
        }

        const response = await this.fetchNFTs(address, network, pageKey, searchQuery);
        console.log('Raw API Response:', response);
        
        // Format NFTs and check for 3D ones
        const formattedNFTs = this.formatNFTResponse(response, network);
        const filtered3DNFTs = await Promise.all(
          formattedNFTs.map(async nft => {
            const is3D = await this.check3DModel(nft);
            return is3D ? nft : null;
          })
        ).then(nfts => nfts.filter((nft): nft is NFTMetadata => nft !== null));
        
        // Add any found 3D NFTs to our collection
        allNFTs = [...allNFTs, ...filtered3DNFTs];
        
        // Continue pagination until we've checked all NFTs
        pageKey = response.pageKey;
        
      } while (pageKey);

      console.log(`Total 3D NFTs fetched from ${network.name}:`, allNFTs.length);

      // Store in memory cache
      this.memoryCache.set(cacheKey, { data: allNFTs, timestamp: Date.now() });
      
      return allNFTs;

    } catch (error) {
      console.error(`Error in getNFTs for ${network.name}:`, error);
      throw error;
    }
  }

  private async fetchNFTs(
    address: string, 
    network: NetworkInfo,
    pageKey?: string,
    searchQuery?: string
  ): Promise<AlchemyNFTResponse> {
    if (!address) {
      throw new Error('Address is required');
    }

    const alchemy = this.getAlchemyInstance(network.id);
    const baseURL = `https://${network.alchemyNetwork}.g.alchemy.com/v2/${localStorage.getItem('alchemyApiKey')}`;

    const params = new URLSearchParams();
    params.append('owner', address);
    params.append('withMetadata', 'true');
    params.append('excludeFilters[]', 'SPAM');
    params.append('pageSize', '20');
    params.append('refreshCache', 'true');
    params.append('tokenUriTimeoutInMs', '30000');
    params.append('omitMetadata', 'false');

    if (pageKey) {
      params.append('pageKey', pageKey);
    }

    if (searchQuery) {
      params.append('nameOrSymbol', searchQuery);
    }

    const url = `${baseURL}/getNFTs?${params}`;
    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    return await response.json();
  }

  private formatNFTResponse(nfts: AlchemyNFTResponse, network: NetworkInfo) {
    if (!nfts?.ownedNfts) {
      console.warn('No NFTs found in response');
      return [];
    }

    return nfts.ownedNfts.map((nft: any) => {
      // Find the 3D model URLs
      const modelUrls = this.find3DModelUrl(nft);
      
      // Get the format from media or file extension
      let format = 'unknown';
      if (nft.media?.[0]?.format) {
        format = nft.media[0].format.toLowerCase();
      } else if (modelUrls.length > 0) {
        const match = modelUrls[0].url.match(/\.(glb|gltf|vrm)$/i);
        if (match) format = match[1].toLowerCase();
      }
      
      return {
        id: nft.tokenId || '',
        name: nft.title || 'Untitled',
        description: nft.description || '',
        type: 'NFT',
        format: format,
        thumbnail: nft.media?.[0]?.thumbnail || '',
        collection: nft.contract?.name || 'Unknown Collection',
        creator: nft.contract?.name || nft.contract?.address || 'Unknown Creator',
        contract: {
          address: nft.contract?.address || ''
        },
        tokenId: nft.tokenId || '',
        network,
        technical: {
          triangles: '0',
          vertices: '0',
          materials: '0',
          textureSize: '0',
          fileSize: '0',
          animations: '0',
          storage: {
            type: 'IPFS',
            hash: nft.tokenUri?.raw || '',
            url: modelUrls.length > 0 ? modelUrls[0].url : '',
            gateway: nft.tokenUri?.gateway || ''
          }
        },
        media: nft.media,
        raw_metadata: nft.metadata,
        model_urls: modelUrls
      } as NFTMetadata;
    });
  }

  private find3DModelUrl(nft: any): { url: string; format: string }[] {
    const prioritizedFormats = ['glb', 'vrm', 'gltf'];
    const modelUrls: { url: string; format: string; priority: number }[] = [];
    const seenUrls = new Set<string>(); // Track unique URLs

    // Helper to add URL with priority
    const addModelUrl = (url: string | undefined, format?: string) => {
      if (!url) return;
      
      // Clean the URL
      const cleanUrl = url.replace(/\[.*?\]\((.*?)\)/g, '$1')
                         .replace(/\\n/g, '')
                         .replace(/\n/g, '')
                         .replace(/([^:])\/\//g, '$1/')
                         .replace(/\)+$/, '');
      
      // Skip if we've seen this URL before
      if (seenUrls.has(cleanUrl.toLowerCase())) return;
      seenUrls.add(cleanUrl.toLowerCase());
      
      // Determine format if not provided
      if (!format) {
        const match = cleanUrl.toLowerCase().match(/\.(glb|gltf|vrm)$/i);
        format = match?.[1]?.toLowerCase();
      }
      
      if (format) {
        const priority = prioritizedFormats.indexOf(format.toLowerCase());
        if (priority !== -1) {
          modelUrls.push({ url: cleanUrl, format, priority });
        }
      }
    };

    // 1. Check direct VRM URL
    if (nft.metadata?.vrm_url) {
      addModelUrl(nft.metadata.vrm_url, 'vrm');
    }

    // 2. Check animation_details pattern
    if (nft.metadata?.animation_details?.format?.toLowerCase() === 'glb' && 
        (nft.metadata.animation || nft.metadata.animation_url)) {
      addModelUrl(nft.metadata.animation || nft.metadata.animation_url, 'glb');
    }

    // 3. Parse description for URLs
    if (nft.metadata?.description) {
      const urlMatches = nft.metadata.description.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
      if (urlMatches) {
        urlMatches.forEach((match: string) => {
          const url = match.match(/\((https?:\/\/[^\s)]+)\)/)?.[1];
          if (url) {
            // Check if it's a 3D model format
            const formatMatch = match.toLowerCase().match(/\.(glb|vrm|gltf)/);
            if (formatMatch) {
              addModelUrl(url, formatMatch[1]);
            }
          }
        });
      }
    }

    // 4. Check existing patterns
    if (nft.metadata?.animation_url) {
      addModelUrl(nft.metadata.animation_url);
    }

    // Check properties.files array
    nft.metadata?.properties?.files?.forEach((f: any) => {
      addModelUrl(f.uri);
    });

    // Check media array
    if (Array.isArray(nft.media)) {
      nft.media.forEach((m: any) => {
        if (m.uri?.match(/\.(glb|gltf|vrm)$/i) ||
            m.format?.toLowerCase().includes('model')) {
          addModelUrl(m.uri);
        }
      });
    }

    // Check raw metadata for any additional URLs
    if (nft.metadata) {
      Object.entries(nft.metadata).forEach(([key, value]) => {
        if (typeof value === 'string' && value.match(/\.(glb|gltf|vrm)$/i)) {
          addModelUrl(value);
        }
      });
    }

    // Sort by priority and return unique URLs
    modelUrls.sort((a, b) => a.priority - b.priority);
    return modelUrls.map(({ url, format }) => ({ url, format }));
  }

  private detectFormat(nft: NFTMetadata): string {
    // Check all possible URLs in the NFT metadata
    const urlsToCheck = [
      nft.technical?.storage?.gateway,
      (nft as any).animation_url,
      (nft as any).image_url,
      (nft as any).external_url
    ].filter(Boolean);

    for (const url of urlsToCheck) {
      if (typeof url === 'string') {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith('.glb')) return 'glb';
        if (lowerUrl.endsWith('.gltf')) return 'gltf';
        if (lowerUrl.endsWith('.vrm')) return 'vrm';
      }
    }

    // Check media array
    const media = (nft as any).media;
    if (Array.isArray(media)) {
      for (const item of media) {
        // Check format
        if (item.format) {
          const format = item.format.toLowerCase();
          if (format.includes('gltf') || format.includes('glb') || format.includes('vrm')) {
            return format;
          }
        }
        // Check URI
        if (item.uri) {
          const uri = item.uri.toLowerCase();
          if (uri.endsWith('.glb')) return 'glb';
          if (uri.endsWith('.gltf')) return 'gltf';
          if (uri.endsWith('.vrm')) return 'vrm';
        }
      }
    }

    return 'unknown';
  }

  private filter3DNFTs(nfts: NFTMetadata[]) {
    return nfts.filter(nft => {
      // Log full metadata for debugging
      console.log('Checking NFT:', {
        name: nft.name,
        rawMetadata: (nft as any).raw_metadata,
        tokenUri: (nft as any).tokenUri,
        media: (nft as any).media,
        urls: {
          image: (nft as any).image,
          animation_url: (nft as any).animation_url,
          external_url: (nft as any).external_url,
          image_url: (nft as any).image_url,
        },
        properties: (nft as any).properties,
      });

      const metadata = nft as any;
      
      // Check raw metadata for any 3D file references
      if (metadata.raw_metadata) {
        const rawData = JSON.stringify(metadata.raw_metadata).toLowerCase();
        console.log('Raw metadata:', rawData);
        if (rawData.includes('.glb') || rawData.includes('.gltf') || rawData.includes('.vrm') ||
            rawData.includes('model/gltf') || rawData.includes('model/vrm')) {
          console.log('Found 3D model in raw metadata');
          return true;
        }
      }

      // Check token URI for 3D file references
      if (metadata.tokenUri?.gateway) {
        const gatewayUrl = metadata.tokenUri.gateway.toLowerCase();
        console.log('Token URI:', gatewayUrl);
        if (gatewayUrl.includes('.glb') || gatewayUrl.includes('.gltf') || gatewayUrl.includes('.vrm')) {
          console.log('Found 3D model in token URI');
          return true;
        }
      }

      // Check media array
      if (Array.isArray(metadata.media)) {
        console.log('Media array:', metadata.media);
        for (const item of metadata.media) {
          // Check format
          if (item.format) {
            const format = item.format.toLowerCase();
            if (format.includes('model') || format.includes('gltf') || format.includes('vrm')) {
              console.log('Found 3D model in media format:', format);
              return true;
            }
          }
          // Check URI
          if (item.uri) {
            const uri = item.uri.toLowerCase();
            if (uri.endsWith('.glb') || uri.endsWith('.gltf') || uri.endsWith('.vrm')) {
              console.log('Found 3D model in media URI:', uri);
              return true;
            }
          }
        }
      }

      // Check all possible URLs
      const allUrls = [
        metadata.image,
        metadata.animation_url,
        metadata.external_url,
        metadata.image_url,
        ...(metadata.properties?.files?.map((f: any) => f.uri) || [])
      ].filter(Boolean);

      console.log('All URLs:', allUrls);

      for (const url of allUrls) {
        if (typeof url === 'string') {
          const lowerUrl = url.toLowerCase();
          if (lowerUrl.includes('.glb') || lowerUrl.includes('.gltf') || lowerUrl.includes('.vrm')) {
            console.log('Found 3D model in URL:', url);
            return true;
          }
        }
      }

      // Check MIME types
      const mimeTypes = [
        metadata.properties?.type,
        metadata.mime_type,
        ...(metadata.properties?.files?.map((f: any) => f.type) || [])
      ].filter(Boolean);

      console.log('MIME types:', mimeTypes);

      for (const type of mimeTypes) {
        if (typeof type === 'string') {
          const lowerType = type.toLowerCase();
          if (lowerType.includes('model') || lowerType.includes('gltf') || lowerType.includes('vrm')) {
            console.log('Found 3D model in MIME type:', type);
            return true;
          }
        }
      }

      return false;
    });
  }

  private async check3DModel(nft: NFTMetadata): Promise<boolean> {
    // Check raw metadata for any 3D file references
    const metadata = nft as any;
    
    if (metadata.raw_metadata) {
      const rawData = JSON.stringify(metadata.raw_metadata).toLowerCase();
      if (rawData.includes('.glb') || rawData.includes('.gltf') || rawData.includes('.vrm') ||
          rawData.includes('model/gltf') || rawData.includes('model/vrm')) {
        console.log('Found 3D model in raw metadata');
        return true;
      }
    }

    // Check token URI for 3D file references
    if (metadata.tokenUri?.gateway) {
      const gatewayUrl = metadata.tokenUri.gateway.toLowerCase();
      if (gatewayUrl.includes('.glb') || gatewayUrl.includes('.gltf') || gatewayUrl.includes('.vrm')) {
        console.log('Found 3D model in token URI');
        return true;
      }
    }

    // Check media array
    if (Array.isArray(metadata.media)) {
      for (const item of metadata.media) {
        if (item.format?.toLowerCase().includes('model') || 
            item.format?.toLowerCase().includes('gltf') || 
            item.format?.toLowerCase().includes('vrm') ||
            item.uri?.toLowerCase().match(/\.(glb|gltf|vrm)$/)) {
          console.log('Found 3D model in media');
          return true;
        }
      }
    }

    // Check all possible URLs
    const allUrls = [
      metadata.image,
      metadata.animation_url,
      metadata.external_url,
      metadata.image_url,
      ...(metadata.properties?.files?.map((f: any) => f.uri) || [])
    ].filter(Boolean);

    for (const url of allUrls) {
      if (typeof url === 'string' && url.toLowerCase().match(/\.(glb|gltf|vrm)$/)) {
        console.log('Found 3D model in URL:', url);
        return true;
      }
    }

    return false;
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

  transformNFTData(nftData: any): NFTMetadata {
    const modelUrls = this.find3DModelUrl(nftData);
    
    return {
      id: nftData.id,
      name: nftData.name || 'Untitled',
      description: nftData.description,
      format: modelUrls[0]?.format || 'unknown',
      thumbnail: nftData.thumbnail,
      collection: nftData.collection,
      creator: nftData.creator,
      contract: {
        address: nftData.contract?.address
      },
      tokenId: nftData.tokenId,
      network: nftData.network,
      technical: {
        triangles: nftData.technical?.triangles?.toString(),
        vertices: nftData.technical?.vertices?.toString(),
        materials: nftData.technical?.materials?.toString(),
        textureSize: nftData.technical?.textureSize?.toString(),
        fileSize: nftData.technical?.fileSize?.toString(),
        animations: nftData.technical?.animations?.toString(),
        storage: {
          type: nftData.technical?.storage?.type || 'unknown',
          hash: nftData.technical?.storage?.hash || '',
          url: nftData.technical?.storage?.url,
          gateway: nftData.technical?.storage?.gateway || ''
        }
      },
      media: nftData.media,
      raw_metadata: nftData.raw_metadata,
      model_urls: modelUrls,
      type: nftData.type || 'NFT'  // Add required type field
    } as NFTMetadata;
  }
}

export const walletService = WalletService.getInstance(); 