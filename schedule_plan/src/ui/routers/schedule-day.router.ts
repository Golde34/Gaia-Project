import { NextFunction, Request, Response, Router } from "express";
import { scheduleGroupController } from "../controllers/schedule-group.controller";
import { returnResult } from "../../kernel/utils/return-result";

export const scheduleDayRouter = Router();

const scheduleDayControllerImpl = scheduleGroupController; 

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