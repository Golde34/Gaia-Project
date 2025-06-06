import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env' })

const REQUIRED_DB_ENV_VARS = [
    'DATABASE_HOST',
    'DATABASE_NAME',
    'DATABASE_PORT',
    'DATABASE_USERNAME',
    'DATABASE_PASSWORD',
];

interface DatabaseConfiguration {
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
    };
}

export const dbConfig: DatabaseConfiguration = {
    database: {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: Number(String(process.env.DATABASE_PORT)) ?? 5432,
        name: process.env.DATABASE_NAME ?? 'schedule_plan',
        username: process.env.DATABASE_USERNAME ?? 'root',
        password: process.env.DATABASE_PASSWORD ?? 'root',
    },
};

export const validateDBEnvironmentVars= (): void => {
    const missingRequirements: string[] = [];
    REQUIRED_DB_ENV_VARS.forEach((envVar) => {
        if (!(envVar in process.env)) {
            missingRequirements.push(envVar);
        }
    });
    if (missingRequirements.length !== 0) {
        throw new Error(`Missing required environment variables: ${missingRequirements.join(', ')}`);
    }
}