import { Router, Request, Response, NextFunction} from "express";
import { returnResult } from "../../../kernel/util/return-result";
import { PROJECT_NOT_FOUND, USER_NOT_FOUND } from "../../../core/domain/constants/error.constant";
import { commitController } from "../controller/commit.controller";

export const commitRouter = Router();

const commitControllerImpl = commitController;

commitRouter.get("/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userCommits = await commitControllerImpl.getUserCommits(req, next);
        returnResult(userCommits, USER_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});

commitRouter.get("/:userId/:projectId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userCommits = await commitControllerImpl.getProjectCommits(req, next);
        returnResult(userCommits, PROJECT_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});
