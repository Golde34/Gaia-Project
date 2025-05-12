import { NextFunction, Request, Response, Router } from "express";
import { schedulePlanController } from "../controllers/schedule-plan.controller";

export const schedulePlanRouter = Router();

const schedulePlanControllerImpl = schedulePlanController;

schedulePlanRouter.post("/schedule-for-user/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const schedulePlanResult = await schedulePlanControllerImpl.scheduleForUser(req, next);
            return schedulePlanResult;
        } catch (error) {
            next(error);
        }
    }
);
