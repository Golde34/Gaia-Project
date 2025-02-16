import mongoose from 'mongoose';
import { type DBHelper } from './interfaces/db.interface';

mongoose.set('strictQuery', false);

export class MongoHelper implements DBHelper {
    private readonly connectUrl: string;
    constructor(
        public host: string,
        public port: number,
        public database: string,
        public username: string,
        public password: string
    ) {
        const params: string[] = [];

        this.connectUrl = 'mongodb';
        if (!port) {
            this.connectUrl += '+srv';
        }
        this.connectUrl += '://';
        if (username && password) {
            this.connectUrl += `${this.username}:${this.password}@`;
        }
        this.connectUrl += `${this.host}`;
        if (port) {
            this.connectUrl += `:${this.port}`;
        }
        params.push(`retryWrites=true`);
        params.push(`w=majority`);
        this.connectUrl += `/${this.database}?${params.join('&')}`;
    }

    async connect(): Promise<void> {
        try {
            await mongoose.connect(this.connectUrl);
        } catch (error) {
            console.log(error);
        }
    }

    disconnect(): void {
        throw new Error("Method not implemented.");
    }
}