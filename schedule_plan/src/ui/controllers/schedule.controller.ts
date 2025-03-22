import { NextFunction, Request } from "express";
import { IResponse, msg200 } from "../../core/common/response";
import { schedulePlanService } from "../../core/services/schedule-plan.service";
import { scheduleTaskUsecase } from "../../core/usecase/schedule-task.usecase";

class ScheduleController {
    constructor() {}

    async checkExistedSchedules(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = req.body.userId;
            return await schedulePlanService.returnSchedulePlanByUserId(userId);
        } catch (error) {
            next(error);
        }
    }

    async getTaskList(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = parseInt(req.params.userId, 10);
            const scheduleTaskList = await scheduleTaskUsecase.getListTaskByUserId(userId);
            return msg200({
                scheduleTaskList
            })
        } catch (error) {
            next(error);
        }
    }

    async getBatchTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = parseInt(req.params.userId, 10);
            const scheduleBatchTask = await scheduleTaskUsecase.getBatchTask(userId);
            if (!scheduleBatchTask) {
                return msg200({
                    message: "No schedule batch task found!"
                })
            }
            return msg200({
                scheduleBatchTask
            })
        } catch (error) {
            next(error);
        }
    } 

    async chooseBatchTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const batchNumber = req.body.batchNumber;
            const userId = req.body.userId;
            return await scheduleTaskUsecase.chooseBatchTask(userId, batchNumber);
        } catch (error) {
            next(error);
        }
    }

    async getScheduleTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.body.taskId;
            const scheduleTaskId = req.body.scheduleTaskId;
            return await scheduleTaskUsecase.getScheduleTask(taskId, scheduleTaskId);
        } catch (error) {
            next(error);
        }
    }

    async getScheduleTaskList(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.body.userId);
            return await scheduleTaskUsecase.getScheduleTaskList(userId);
        } catch (error) {
            next(error);
        }
    }

    async createScheduleTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const scheduleTask = req.body.scheduleTask;
            return await scheduleTaskUsecase.createScheduleTask(scheduleTask);
        } catch (error) {
            next(error);
        }
    }
}

export const scheduleController = new ScheduleController();