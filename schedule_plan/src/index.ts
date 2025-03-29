import express, { Application, NextFunction, Request, Response } from "express";
import { config, validateEnvironmentVars } from "./kernel/config/configuration";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { MongoHelper } from "./kernel/database/mongodb.db";
import { msg404, sendResponse } from "./core/common/response";
import { MSG404 } from "./core/domain/constants/string.constants";
import { dashboardRouter } from "./ui/routers/dashboard.router";
import { userRouter } from "./ui/routers/user.router";
import { KafkaHandler } from "./infrastructure/kafka/kafka-handler";
import { kafkaController } from "./infrastructure/kafka/kafka-controller";
import { scheduleTaskRouter } from "./ui/routers/schedule-task.router";
import { scheduleGroupRouter } from "./ui/routers/schedule-group-router";

async function main(): Promise<void> {
    validateEnvironmentVars();
    const kafkaHandler = new KafkaHandler();
    const applicationContext = "/schedule-plan";

    const mongoHelper = new MongoHelper(
        config.database.host,
        config.database.port,
        config.database.name,
        config.database.username,
        config.database.password,
    )
    await mongoHelper.connect();
    console.log("Connected to MongoDB");

    const app: Application = express();
    const port = config.server.listenPort;

    app.use(
        bodyParser.urlencoded({
            parameterLimit: 100000,
            limit: '50mb',
            extended: true,
        }),
    );
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    app.get("/status", (req: Request, res: Response) => {
        res.status(200).send("OK");
    })

    app.use(applicationContext + "/dashboard", dashboardRouter);
    app.use(applicationContext + "/user", userRouter);
    app.use(applicationContext + "/schedule", scheduleTaskRouter);
    app.use(applicationContext + "/schedule-group", scheduleGroupRouter);

    app.use((req: Request, res: Response, next: NextFunction) => {
        sendResponse(msg404(MSG404), res, next);
    });

    app.listen(config.server.listenPort, () => {
        console.log(`Server is running on port ${port}`);
    })

    // Kafka Consumer
    kafkaController(kafkaHandler); 
}

main();