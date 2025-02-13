import { useState, useEffect } from 'react';
import { walletService } from '../services/wallet.service';
import type { NFTMetadata, NetworkInfo } from '../types/wallet';

export function useAddressNFTFetching(address: string | null, network: NetworkInfo) {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNFTs() {
      if (!address) {
        setNfts([]);
        setError(null);
        return;
      }

      // Basic address validation
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError('Invalid Ethereum address format');
        setNfts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedNFTs = await walletService.getNFTs(address, network);
        setNfts(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Error fetching NFTs. Please try again.');
        setNfts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [address, network]);

  return { nfts, loading, error };
} 