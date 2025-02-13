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

export interface Eip1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
}

export interface NFTMetadata {
  id: string;
  name: string;
  description?: string;
  type: string;
  format: string;
  thumbnail?: string;
  collection?: string;
  creator?: string;
  technical: {
    triangles?: string;
    vertices?: string;
    materials?: string;
    textureSize?: string;
    animations?: string;
    fileSize?: string;
    storage: {
      type: string;
      hash: string;
      url?: string;
      gateway: string;
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