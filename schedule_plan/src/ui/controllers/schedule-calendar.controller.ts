import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleCalendarUsecase } from "../../core/usecase/schedule-calendar.usecase";

class ScheduleCalendarController {
    constructor() {}

    async registerScheduleCalendar(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            const scheduleCalendar = req.body.scheduleCalendar;
            // return await scheduleCalendarUsecase.registerScheduleCalendar(userId, scheduleCalendar);
            return undefined;
        } catch (error) {
            next(error);
        }
    }

    async getDailyCalendar(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            return await scheduleCalendarUsecase.getDailyCalendar(userId);
        } catch (error) {
            next(error);
        }
    }

    async createDailyCalendar(req: Request, next: Function): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await scheduleCalendarUsecase.createDailyCalendar(userId);
        } catch (error) {
            next(error);
        }
    }
    async startDailyCalendar(req: Request, next: Function): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await scheduleCalendarUsecase.startDailyCalendar(userId);
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleCalendarController = new ScheduleCalendarController();