export interface NetworkInfo {
  id: number;
  name: string;
  icon: string;
  alchemyNetwork: string;
  color: string;
  shortName: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  error: string | null;
}

export interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  collection: string;
  creator: string;
  format: string;
  thumbnail: string;
  animation_url?: string;
  network: NetworkInfo;
  technical: {
    triangles?: number;
    vertices?: number;
    materials?: number;
    textureSize?: number;
    fileSize?: number;
    animations?: number;
    storage?: {
      type: string;
      hash: string;
      url?: string;
    };
  };
  media?: Array<{ uri: string; type: string }>;
  raw_metadata?: any;
  contract?: {
    address: string;
  };
  tokenId?: string;
  model_urls?: Array<{ url: string; format: string }>;
} 