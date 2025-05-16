import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleCalendarUsecase } from "../../core/usecase/schedule-calendar.usecase";

class ScheduleCalendarController {
    constructor() {}

    async getDailyCalendar(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.params.userId;
            // return await scheduleCalendarUsecase.getDailyCalendar(userId);
            return undefined;
        } catch (error) {
            next(error);
        }
    }

    async createDailyCalendar(req: Request, next: Function): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            // return await scheduleCalendarUsecase.createDailyCalendar(userId);
            return undefined;
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleCalendarController = new ScheduleCalendarController();