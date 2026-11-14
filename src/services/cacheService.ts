interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export const cacheService = {
  set: <T>(key: string, data: T, ttlMs = 60000): void => {
    memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
  },
  get: <T>(key: string): T | null => {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  },
  clear: (): void => {
    memoryCache.clear();
  }
};
