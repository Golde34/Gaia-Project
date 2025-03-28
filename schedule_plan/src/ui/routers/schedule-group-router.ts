import { Router, type Request, Response, NextFunction } from "express";
import { returnResult } from "../../kernel/utils/return-result";
import { scheduleGroupController } from "../controllers/schedule-group.controller";

export const scheduleGroupRouter = Router();

const scheduleGroupControllerImpl = scheduleGroupController;

scheduleGroupRouter.post("/create-schedule-group", 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleGroupResult = await scheduleGroupControllerImpl.createScheduleGroup(req, next);
            return returnResult(scheduleGroupResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)
