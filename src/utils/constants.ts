export const SUPPORTED_CHAINS = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    alchemyNetwork: 'eth-mainnet',
    color: '#627EEA',
    shortName: 'ETH'
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    alchemyNetwork: 'polygon-mainnet',
    color: '#8247E5',
    shortName: 'MATIC'
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    alchemyNetwork: 'arb-mainnet',
    color: '#2D374B',
    shortName: 'ARB'
  },
  OPTIMISM: {
    id: 10,
    name: 'Optimism',
    icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
    alchemyNetwork: 'opt-mainnet',
    color: '#FF0420',
    shortName: 'OP'
  },
  BASE: {
    id: 8453,
    name: 'Base',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    alchemyNetwork: 'base-mainnet',
    color: '#0052FF',
    shortName: 'BASE'
  }
} as const;

export const FILE_FORMATS = {
  MODEL_3D: ['glb', 'gltf', 'vrm'],
  IMAGE: ['png', 'jpg', 'jpeg', 'gif'],
  // Add more formats as needed
} as const;

export const CACHE_TIMES = {
  NFT_METADATA: 60 * 60, // 1 hour
  ASSET_PREVIEW: 24 * 60 * 60, // 24 hours
  WALLET_DATA: 5 * 60, // 5 minutes
} as const;

export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
]; 