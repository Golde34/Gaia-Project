import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env'});

interface ValkeyConfig {
    valkey: {
        redisHost: string;
        redisPort: number;
        redisPassword: string;
    }
}

export const valkeyConfig: ValkeyConfig = {
    valkey: {
        redisHost: process.env.REDIS_HOST ?? 'localhost',
        redisPort: parseInt(process.env.REDIS_PORT ?? '6379'),
        redisPassword: process.env.REDIS_PASSWORD ?? ''
    }
}