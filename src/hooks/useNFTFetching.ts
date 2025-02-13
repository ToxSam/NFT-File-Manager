import { useState, useEffect } from 'react';
import { useWallet } from '../components/wallet/WalletContext';
import { walletService } from '../services/wallet.service';
import type { NFTMetadata, NetworkInfo } from '../types/wallet';

export function useNFTFetching(searchQuery: string, network: NetworkInfo) {
  const { address } = useWallet();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNFTs() {
      if (!address) {
        setNfts([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedNFTs = await walletService.getNFTs(address, network, searchQuery);
        setNfts(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [address, network, searchQuery]);

  return { nfts, loading };
} 