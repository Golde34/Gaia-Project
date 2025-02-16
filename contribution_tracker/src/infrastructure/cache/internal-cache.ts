import { InternalCacheConstants } from "../../core/domain/constants/constants";

class InternalCache<T> {
    private cache: Map<string, { value: T, expiry: number }> = new Map();
    private maxSize: number;
    private ttl: number;

    constructor(maxSize: number, ttl: number) {
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    /**
     * Get the value from the cache
     * If the key is not found or the value has expired, return undefined
     * If the value is found, update the expiry time and return the value
     *  
     * @param key 
     * @returns 
     */
    public get(key: string): T | undefined {
        const internalKey = InternalCacheConstants.CACHE_PREFIX + key + InternalCacheConstants.CACHE_POSTFIX;        
        const cacheItem = this.cache.get(internalKey);

        if (!cacheItem || Date.now() > cacheItem.expiry) {
            if (cacheItem) {
                this.cache.delete(internalKey);
            }
            return undefined;
        }

        this.cache.delete(internalKey);
        this.cache.set(internalKey, cacheItem);
        return cacheItem.value;
    }

    /**
     * Set the value in the cache
     * If the cache is full, remove the oldest item
     * 
     * @param key 
     * @param value 
     */
    public set(key: string, value: T): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey);
            }
        }
        const expiry = Date.now() + this.ttl;
        this.cache.set(this.generateInternalCacheKey(key), { value, expiry });
    }

    /**
     * Set the value in the cache with a custom expiry time
     * If the expiry time is negative or zero, the key will not be added
     *
     * @param key The cache key
     * @param value The value to store in the cache
     * @param duration The duration after which the key should expire
     * @param timeUnit The unit of time (e.g., 'seconds', 'minutes', 'hours')
     */
    public setKeyWithExpiry(key: string, value: T, duration: number, timeUnit: 'seconds' | 'minutes' | 'hours'): void {
        if (duration <= 0) {
            console.warn(`Attempted to set cache key '${key}' with non-positive duration.`);
            return;
        }
        let expiryTime = Date.now();
        switch (timeUnit) {
            case 'seconds': 
                expiryTime += duration * 1000;
                break;
            case 'minutes':
                expiryTime += duration * 60 * 1000;
                break;
            case 'hours':
                expiryTime += duration * 60 * 60 * 1000;
                break;
            default:
                console.warn(`Invalid time unit '${timeUnit}' provided for cache key '${key}'.`);
                return;
        }
        const internalKey = this.generateInternalCacheKey(key);
        this.cache.set(internalKey, { value, expiry: expiryTime });
    }

    /**
     * Remove the value from the cache
     * 
     * @param key 
     */
    public clear(key: string): void {
        const internalKey = InternalCacheConstants.CACHE_PREFIX + key + InternalCacheConstants.CACHE_POSTFIX;
        this.cache.delete(internalKey);
    }
    
    /**
     * Clear the cache
     */
    public clearAll(): void {
        this.cache.clear();
    }

    /**
     * Generate internal cache key
     * 
     * @param key
     * @returns
     */
    public generateInternalCacheKey(key: string): string {
        return `${InternalCacheConstants.CACHE_PREFIX}${key}${InternalCacheConstants.CACHE_POSTFIX}`;
    }
}

export default InternalCache;