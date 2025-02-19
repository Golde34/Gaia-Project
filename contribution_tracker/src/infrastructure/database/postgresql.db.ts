import { Sequelize } from "sequelize-typescript";
import { dbConfig } from "../../kernel/config/database.configuration";
import CommitEntity from "../../core/domain/entities/commit.entity";

const postgresqlConfig = {
    HOST: dbConfig.database.host,
    USER: dbConfig.database.username,
    PASSWORD: dbConfig.database.password,
    DB: dbConfig.database.name,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

class PostgresDatabase {
    public sequelize: Sequelize | undefined;

    constructor() {
        this.connectToDatabase();
    }

    private async connectToDatabase() {
        this.sequelize = new Sequelize({
            database: postgresqlConfig.DB,
            username: postgresqlConfig.USER,
            password: postgresqlConfig.PASSWORD,
            host: postgresqlConfig.HOST,
            dialect: "postgres",
            pool: {
                max: postgresqlConfig.pool.max,
                min: postgresqlConfig.pool.min,
                acquire: postgresqlConfig.pool.acquire,
                idle: postgresqlConfig.pool.idle
            },
            models: [__dirname + '/../../core/domain/entities/*.entity.ts'],
            logging: false
        });
        await this.sequelize
            .authenticate()
            .then(() => {
                console.log("Connection has been established successfullly");
            })
            .catch((err) => {
                console.error("Unable to connect to the database", err);
            })
    }
}



export default PostgresDatabase;