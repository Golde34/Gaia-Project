import { Router, Request, Response, NextFunction} from "express";
import { returnResult } from "../../../kernel/util/return-result";
import { PROJECT_NOT_FOUND, USER_NOT_FOUND } from "../../../core/domain/constants/error.constant";
import { contributionCalendarController } from "../controller/contribution-calendar.controller";

export const contributionRouter = Router();

const contributionControllerImpl = contributionCalendarController;

contributionRouter.get("/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userCommits = await contributionControllerImpl.getUserCommits(req, next);
        returnResult(userCommits, USER_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});

contributionRouter.get("/:userId/:projectId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userCommits = await contributionControllerImpl.getProjectCommits(req, next);
        returnResult(userCommits, PROJECT_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});
