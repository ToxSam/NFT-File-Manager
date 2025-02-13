import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nftService } from '../nft.service';
import { walletService } from '../wallet.service';
import { cacheService } from '../cache.service';

vi.mock('../wallet.service');
vi.mock('../cache.service');

describe('NFTService', () => {
  const mockNFTs = [
    {
      id: '1',
      name: 'Test NFT',
      description: 'Test Description',
      format: 'glb',
      thumbnail: 'test.jpg',
      collection: 'Test Collection',
      creator: '0x123',
      technical: {
        storage: {
          type: 'IPFS',
          hash: 'test',
          gateway: 'test'
        }
      }
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