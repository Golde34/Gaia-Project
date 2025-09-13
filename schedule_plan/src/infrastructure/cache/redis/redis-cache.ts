import { createClient, createCluster, RedisClientType, RedisClusterType } from "redis";
import { valkeyConfig } from "../../../kernel/config/valkey.configuration";

class RedisClient {
    private static instance: RedisClusterType | null = null;
    // private static instance: RedisClientType | null = null;

    private constructor() { }

    // public static async getInstance(): Promise<RedisClientType> {
    public static async getInstance(): Promise<RedisClusterType> {
        if (!RedisClient.instance) {
            RedisClient.instance = createCluster({
                rootNodes: [
                    {
                        url: `redis://${valkeyConfig.valkey.redisHost}:${valkeyConfig.valkey.redisPort}`,
                    },
                ],
                defaults: {
                    password: valkeyConfig.valkey.redisPassword,
                },
            });

            // RedisClient.instance = createClient({
            //     url: `redis://${valkeyConfig.valkey.redisHost}:${valkeyConfig.valkey.redisPort}`,
            //     password: valkeyConfig.valkey.redisPassword,
            // });

            RedisClient.instance.on("error", (error: any) => {
                console.error("Redis Cluster error: " + error);
            });

            await RedisClient.instance.connect();
            console.log("Connected to Redis Cluster successfully");
        }

        return RedisClient.instance;
    }

    public static async disconnect(): Promise<void> {
        if (RedisClient.instance) {
            await RedisClient.instance.disconnect();
            RedisClient.instance = null;
            console.log("Disconnected from Redis Cluster");
        }
    }
}

export default RedisClient;
