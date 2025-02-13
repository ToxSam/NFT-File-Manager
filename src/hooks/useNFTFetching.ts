import { useState, useEffect } from 'react';
import { useWallet } from '../components/wallet/WalletContext';
import { walletService } from '../services/wallet.service';
import type { NFTMetadata, NetworkInfo } from '../types/wallet';
import { SUPPORTED_CHAINS } from '../utils/constants';

export function useNFTFetching(searchQuery: string, network?: NetworkInfo) {
  const { address } = useWallet();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!address) {
          setNfts([]);
          return;
        }

        const fetchedNFTs = await walletService.getNFTs(address, network || SUPPORTED_CHAINS.ETHEREUM, searchQuery);
        setNfts(fetchedNFTs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, network, searchQuery]);

  return { nfts, loading, error };
} 