import { Router, type Request, Response, NextFunction } from "express";
import { returnResult } from "../../kernel/utils/return-result";
import { scheduleController } from "../controllers/schedule.controller";

export const scheduleTaskRouter = Router();

const scheduleTaskControllerImpl = scheduleController;

scheduleTaskRouter.get("/get-task-list/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleTaskControllerImpl.getTaskList(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
);

scheduleTaskRouter.get("/get-batch-task/:userId", 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleTaskControllerImpl.getBatchTask(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleTaskRouter.post("/choose-batch-task", 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleTaskControllerImpl.chooseBatchTask(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleTaskRouter.post("/get-schedule-task",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sheduleTaskResult = await scheduleTaskControllerImpl.getScheduleTask(req, next);
            return returnResult(sheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)
