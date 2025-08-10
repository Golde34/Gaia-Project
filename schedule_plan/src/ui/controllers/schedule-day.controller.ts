import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleDayUsecase } from "../../core/usecase/schedule-day.usecase";

class ScheduleDayController {
    constructor() { }

    async registerScheduleConfig(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            const registerScheduleConfig = req.body.registerScheduleConfig;
            console.log(`Registering schedule config for user: ${userId}`);
            return await scheduleDayUsecase.registerScheduleConfig(userId, registerScheduleConfig);
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleDayController = new ScheduleDayController();