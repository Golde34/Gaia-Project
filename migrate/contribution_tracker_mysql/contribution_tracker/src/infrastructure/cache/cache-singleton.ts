import { internalCacheConfig } from "../../kernel/config/internal-cache.configuration";
import InternalCache from "./internal-cache";

class CacheSingleton {
    private static instance: CacheSingleton | null = null;
    private cache: InternalCache<any>;

    private constructor() {
        this.cache = new InternalCache(internalCacheConfig.maxSize, internalCacheConfig.ttl);
    }

    /**
     * Get the instance of the cache
     * 
     * @returns
     */
    public static getInstance(): CacheSingleton {
        if (!CacheSingleton.instance) {
            CacheSingleton.instance = new CacheSingleton();
        }
        return CacheSingleton.instance;
    }

    /**
     * Get the value from the cache
     * 
     * @param key 
     * @returns 
     */
    public getCache(): InternalCache<any> {
        return this.cache;
    }
}

export default CacheSingleton;