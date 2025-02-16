import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env'});

interface KafkaConfig {
    kafka: {
        bootstrapServers: string[];
        groupId: string;
    }
}

export const config: KafkaConfig = {
    kafka: {
        bootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',') ?? [],
        groupId: process.env.KAFKA_GROUP_ID ?? 'task-manager'
    }
}

