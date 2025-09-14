import { NextFunction, Request } from "express";
import { IResponse } from "../../core/common/response";
import { scheduleDayUsecase } from "../../core/usecase/schedule-day.usecase";

class ScheduleDayController {
    constructor() { }

    async getTimeBubbleConfig(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.params.userId;
            return await scheduleDayUsecase.getTimeBubbleConfig(Number(userId));
        } catch (error) {
            next(error);
        }
    }

    async registerScheduleConfig(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await scheduleDayUsecase.registerScheduleConfig(userId);
        } catch (error) {
            next(error);
        }
    }

    async findOptimizedScheduleTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.params.userId;
            return await scheduleDayUsecase.returnDailyCalendar(Number(userId));
        } catch (error) {
            next(error);
        }
    }

    async generateDailyCalendar(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            const dailyTasks = req.body.dailyTasks.tasks;
            return await scheduleDayUsecase.generateDailyCalendar(userId, dailyTasks);
        } catch (error) {
            next(error);
        }
    }

    async editTimeBubbleConfig(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            const timeBubble = req.body.timeBubble;
            return await scheduleDayUsecase.editTimeBubble(userId, timeBubble);
        } catch (error: any) {
            next(error);
        }
    }

    async deleteTaskAwaySchedule(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.body.userId);
            const taskId = req.body.taskId;
            return await scheduleDayUsecase.deleteTaskAwaySchedule(userId, taskId);
        } catch (error: any) {
            next(error);
        }
    }
}

export const scheduleDayController = new ScheduleDayController();