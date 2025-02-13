import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nftService } from '../nft.service';
import { walletService } from '../wallet.service';
import { cacheService } from '../cache.service';
import type { NFTMetadata } from '../../types/wallet';
import { SUPPORTED_CHAINS } from '../../utils/constants';

vi.mock('../wallet.service');
vi.mock('../cache.service');

describe('NFTService', () => {
  const mockNFTs: NFTMetadata[] = [
    {
      id: '1',
      name: 'Test NFT',
      description: 'Test Description',
      type: 'NFT',
      format: 'glb',
      thumbnail: 'test.jpg',
      collection: 'Test Collection',
      creator: '0x123',
      network: SUPPORTED_CHAINS.ETHEREUM,
      technical: {
        triangles: '0',
        vertices: '0',
        materials: '0',
        textureSize: '0',
        fileSize: '0',
        animations: '0',
        storage: {
          type: 'IPFS',
          hash: 'test',
          url: 'test.glb',
          gateway: 'test'
        }
      },
      contract: {
        address: '0x123'
      },
      tokenId: '1',
      media: [],
      model_urls: [{ url: 'test.glb', format: 'glb' }]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches NFTs from cache if available', async () => {
    vi.mocked(cacheService.get).mockResolvedValueOnce(mockNFTs);
    
    const result = await nftService.fetchNFTs('0x123', 1);
    
    expect(result).toEqual(mockNFTs);
    expect(walletService.getNFTs).not.toHaveBeenCalled();
  });

  it('fetches NFTs from wallet service if not in cache', async () => {
    vi.mocked(cacheService.get).mockResolvedValueOnce(null);
    vi.mocked(walletService.getNFTs).mockResolvedValueOnce(mockNFTs);
    
    const result = await nftService.fetchNFTs('0x123', 1);
    
    expect(result).toEqual(mockNFTs);
    expect(walletService.getNFTs).toHaveBeenCalledWith('0x123', 1);
    expect(cacheService.set).toHaveBeenCalledWith('nfts_0x123_1', mockNFTs);
  });
}); 