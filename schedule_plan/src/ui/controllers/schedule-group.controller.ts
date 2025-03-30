import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleGroupUsecase } from "../../core/usecase/schedule-group.usecase";

class ScheduleGroupController {
    async createScheduleGroup(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const scheduleGroup = req.body;
            return await scheduleGroupUsecase.createScheduleGroup(scheduleGroup, Number(scheduleGroup.userId));
        } catch (error) {
            next(error);
        }
    }

    async listScheduleGroup(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.query.userId;
            return await scheduleGroupUsecase.getScheduleGroupList(Number(userId));
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleGroupController = new ScheduleGroupController();