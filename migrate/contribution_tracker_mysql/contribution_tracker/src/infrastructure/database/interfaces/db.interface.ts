export interface DBHelper {
    host: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    connect: () => void;
    disconnect: () => void;
}