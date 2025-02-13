import localforage from 'localforage';
import { CACHE_TIMES } from '../utils/constants';

export class CacheService {
  private static instance: CacheService;

  private constructor() {
    localforage.config({
      name: 'nft-viewer',
      version: 1.0,
    });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await localforage.getItem<{ data: T; timestamp: number }>(key);
      if (!cached) return null;

      const { data, timestamp } = cached;
      const now = Date.now();
      const cacheTime = CACHE_TIMES[key as keyof typeof CACHE_TIMES] || CACHE_TIMES.NFT_METADATA;

      if (now - timestamp > cacheTime * 1000) {
        await this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    try {
      await localforage.setItem(key, {
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }
}

export const cacheService = CacheService.getInstance(); 