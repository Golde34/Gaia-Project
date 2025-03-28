import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";

class ScheduleGroupController {
    async createScheduleGroup(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const scheduleGroup = req.body.scheduleGroup;
            return undefined;
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleGroupController = new ScheduleGroupController();