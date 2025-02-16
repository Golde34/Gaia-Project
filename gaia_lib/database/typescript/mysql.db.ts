import { dbConfig } from "../../kernel/config/database.configuration";
import mysql from 'mysql2/promise';

class MySQLHelper {
    private static instance: MySQLHelper | null = null;
    private pool: mysql.Pool | null = null;

    private constructor() {
        this.pool = mysql.createPool({
            host: dbConfig.database.host,
            port: dbConfig.database.port,
            user: dbConfig.database.username,
            password: dbConfig.database.password,
            database: dbConfig.database.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }

    public static getInstance(): MySQLHelper {
        if (!MySQLHelper.instance) {
            MySQLHelper.instance = new MySQLHelper();
        }
        return MySQLHelper.instance;
    }

    public getPool(): mysql.Pool {
        if (!this.pool) {
            throw new Error('Database pool is not initialized');
        }
        return this.pool;
    }

    public async closePool(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            console.log('MySQL pool closed');
        }
    }
}

export default MySQLHelper;
