import { NextFunction, Request, Response, Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { returnResult } from "../../kernel/util/return-result";
import { TASK_NO_RECORDS } from "../../core/domain/constants/error.constant";

export const dashboardRouter = Router();

const dashboardControllerImpl = dashboardController;

// get 3 top tasks
dashboardRouter.get("/top-tasks/:userId",
    // checkToken,
    // checkPermission(Permission.readTask),
    async (res: Request, req: Response, next: NextFunction): Promise<void> => {
        try {
            const dashboardResult = await dashboardControllerImpl.getTopTasks(res, next);
            returnResult(dashboardResult, TASK_NO_RECORDS, req, next);
        }
        catch (err) {
            next(err);
        }
    });

// check user created any projects or tasks in TM
dashboardRouter.get("/check-existed-tasks",
    async (res: Request, req: Response, next: NextFunction): Promise<void> => {
        try {
            const dashboardResult = await dashboardControllerImpl.checkExistedTasks(res, next);
            returnResult(dashboardResult, TASK_NO_RECORDS, req, next);
        }
        catch (err) {
            next(err);
        }
    }
)

// check all tasks finished in 1 week
dashboardRouter.get("/done-tasks/:userId",
    async (res: Request, req: Response, next: NextFunction): Promise<void> => {
        try {
            const dashboardResult = await dashboardControllerImpl.getDoneTasks(res, next);
            returnResult(dashboardResult, TASK_NO_RECORDS, req, next);
        }
        catch (err) {
            next(err);
        }
    }
)