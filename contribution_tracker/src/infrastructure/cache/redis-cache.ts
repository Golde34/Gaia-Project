import { createClient, RedisClientType } from "redis";
import { valkeyConfig } from "../../kernel/config/valkey.configuration";

class RedisClient {
    private static instance: RedisClientType | null = null;

    private constructor() {}

    public static async getInstance(): Promise<RedisClientType> {
        if (!RedisClient.instance) {
            RedisClient.instance = createClient({
                url: 'redis://' + valkeyConfig.valkey.redisHost + ':' + valkeyConfig.valkey.redisPort, 
                password: valkeyConfig.valkey.redisPassword  
            });

            RedisClient.instance.on('error', (error) => {
                console.error('Redis error: ' + error);
            });

            await RedisClient.instance.connect();
            console.log('Connected to Redis successfully');
        }
        
        return RedisClient.instance;
    }

    public static async disconnect(): Promise<void> {
        if (RedisClient.instance) {
            await RedisClient.instance.disconnect();
            RedisClient.instance = null
            console.log('Disconnected from Redis');
        }
    }
}

export default RedisClient;