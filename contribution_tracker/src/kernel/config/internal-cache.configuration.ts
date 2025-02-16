import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env'});

interface InternalCacheConfig {
    ttl: number;
    maxSize: number;
}

export const internalCacheConfig: InternalCacheConfig = {
    ttl: Number(String(process.env.INTERNAL_CACHE_TTL)) ?? 100,
    maxSize: Number(String(process.env.INTERNAL_CACHE_MAX_SIZE)) ?? 60000 
}