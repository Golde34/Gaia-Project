import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { schedulePlanService } from "../../core/services/schedule-plan.service";

class SchedulePlanController {
    constructor() {}

    async registerSchedulePlan(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await schedulePlanService.createSchedulePlan(userId);
        } catch (error) {
            next(error);
        }
    }

    async scheduleForUser(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.params.userId;
            // return await schedulePlanService.scheduleForUser(userId);
            return undefined;
        } catch (error) {
            next(error);
        }
    }
}

export const schedulePlanController = new SchedulePlanController();