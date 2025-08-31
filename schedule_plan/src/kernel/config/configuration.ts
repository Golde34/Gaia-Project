import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env'});

const REQUIRED_ENV_VARS = [
    'LISTEN_PORT',
];

interface Configuration {
    server: {
        listenPort: number;
    };
    kafka: {
        bootstrapServers: string;
        groupId: string;
    };
}

export const config: Configuration = {
    server: {
        listenPort: Number(String(process.env.LISTEN_PORT)) ?? 3002,
    },
    kafka: {
        bootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'localhost:9094',
        groupId: process.env.KAFKA_GROUP_ID ?? 'schedule-plan'
    }
};

export const validateEnvironmentVars = (): void => {
    const missingRequirements: string[] = [];
    REQUIRED_ENV_VARS.forEach((envVar) => {
        if (!(envVar in process.env)) {
            missingRequirements.push(envVar);
        }
    });
    if (missingRequirements.length !== 0) {
        throw new Error(`Missing required environment variables: ${missingRequirements.join(', ')}`);
    }
}