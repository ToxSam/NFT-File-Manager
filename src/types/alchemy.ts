export interface AlchemyNFTResponse {
  ownedNfts: Array<{
    tokenId: string;
    title: string;
    description: string;
    media: Array<{
      format: string;
      thumbnail: string;
      uri?: string;
    }>;
    contract: {
      name: string;
      address: string;
    };
    tokenUri: {
      raw: string;
      gateway: string;
    };
    metadata?: {
      image?: string;
      animation_url?: string;
      external_url?: string;
      properties?: {
        files?: Array<{
          uri: string;
          type: string;
        }>;
        type?: string;
      };
    };
  }>;
  pageKey?: string;
  totalCount: number;
} 