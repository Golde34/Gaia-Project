import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { schedulePlanUsecase } from "../../core/usecase/schedule-plan.usecase";

class SchedulePlanController {
    constructor() {}

    async registerSchedulePlan(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await schedulePlanUsecase.registerSchedulePlan(userId);
        } catch (error) {
            next(error);
        }
    }
}

export const schedulePlanController = new SchedulePlanController();