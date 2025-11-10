import { NextFunction, Request, Response, Router } from "express";
import { returnResult } from "../../kernel/utils/return-result";
import { scheduleDayController } from "../controllers/schedule-day.controller";

export const scheduleDayRouter = Router();

const scheduleDayControllerImpl = scheduleDayController; 

scheduleDayRouter.get("/time-bubble-config/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleDayControllerImpl.getTimeBubbleConfig(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
);

scheduleDayRouter.post("/register-time-bubble",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleDayControllerImpl.registerScheduleConfig(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
);

scheduleDayRouter.get("/daily-schedule-tasks/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleDayControllerImpl.findOptimizedScheduleTasks(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
);

scheduleDayRouter.post("/generate-daily-calendar",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleTaskResult = await scheduleDayControllerImpl.generateDailyCalendar(req, next);
            return returnResult(scheduleTaskResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleDayRouter.post("/edit-time-bubble", 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updatedTimeBubble = await scheduleDayController.editTimeBubbleConfig(req, next);
            return returnResult(updatedTimeBubble, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleDayRouter.put("/delete-task-away-schedule",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pendingTask = await scheduleDayController.deleteTaskAwaySchedule(req, next);
            return returnResult(pendingTask, "FAIL", res, next);
        } catch (error: any) {
            next(error);
        }
    }
)

scheduleDayRouter.post("/generate-time-bubble", 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updatedTimeBubble = await scheduleDayController.generateScheduleConfig(req, next);
            return returnResult(updatedTimeBubble, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)