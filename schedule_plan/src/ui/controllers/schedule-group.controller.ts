import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleGroupUsecase } from "../../core/usecase/schedule-group.usecase";

class ScheduleGroupController {
    async createScheduleGroup(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const scheduleGroup = req.body.scheduleGroup;
            const userId = Number(req.body.userId);
            return await scheduleGroupUsecase.createScheduleGroup(scheduleGroup, userId);
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleGroupController = new ScheduleGroupController();