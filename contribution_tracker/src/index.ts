import express, { Application, NextFunction, Request, Response } from "express";
import { config, validateEnvironmentVars } from "./kernel/config/general.configuration";
import { validateDBEnvironmentVars } from "./kernel/config/database.configuration";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import { msg200, msg405, sendResponse } from "./core/common/response-helpers";
import { commitRouter } from "./ui/rest/router/commit.router";
import { userCommitRouter } from "./ui/rest/router/user-commit.router";
import { KafkaConfig } from "./infrastructure/kafka/kafka-config";
import { kafkaController } from "./infrastructure/kafka/kafka-controller";
import { projectCommitRouter } from "./ui/rest/router/project-commit.router";
import PostgresDatabase from "./infrastructure/database/postgresql.db";

async function main(): Promise<void> {
    validateEnvironmentVars()
    validateDBEnvironmentVars()
    const db = new PostgresDatabase();
    console.log("PostgressDB: ", db.sequelize?.options.database)
    const kafkaConfig = new KafkaConfig();

    const app: Application = express()
    const port = process.env.LISTEN_PORT || 3003

    app.use(
        bodyParser.urlencoded({
            parameterLimit: 100000,
            limit: '50mb',
            extended: true
        }),
    );
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(cors())
    app.use(helmet())
    app.use(morgan("dev"))

    app.get("/status", (req: Request, res: Response) => {
        res.status(200).send(msg200("3003"))
    })
    app.use("/contribution-tracker/commit", commitRouter)
    app.use("/contribution-tracker/user-commit", userCommitRouter)
    app.use("/contribution-tracker/project-commit", projectCommitRouter)

    app.use((req: Request, res: Response, next: NextFunction) => {
        sendResponse(msg405("Method Not Allowed"), res, next);
    });

    app.listen(config.server.listenPort, () => {
        console.log(`Server is running on port ${port}`)
    });

    process.on('SIGNINT', () => {
        console.log('Server is shutting down')
        process.exit(0)
    });

    process.on('SIGTERM', () => {
        console.log('Server is shutting down')
        process.exit(0)
    })

    kafkaController(kafkaConfig);
}

main();