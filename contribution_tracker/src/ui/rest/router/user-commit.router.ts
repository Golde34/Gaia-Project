import { NextFunction, Request, Response, Router } from "express";
import { userCommitController } from "../controller/user-commit.controller";
import { returnResult } from "../../../kernel/util/return-result";
import { INTERNAL_SERVER_ERROR } from "../../../core/domain/constants/error.constant";

export const userCommitRouter = Router();

const userCommitControllerImpl = userCommitController;

userCommitRouter.get("/get-user-github-info/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userGithubInfo = await userCommitControllerImpl.getUserGithubInfo(req, next);
        returnResult(userGithubInfo, INTERNAL_SERVER_ERROR, res, next);
    } catch (err) {
        next(err);
    }
})

userCommitRouter.post("/authorize", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userGithubInfo = await userCommitControllerImpl.verifyGithubAuthorization(req, next);
        returnResult(userGithubInfo, INTERNAL_SERVER_ERROR, res, next);
    } catch (err) {
        next(err);
    }
})

userCommitRouter.get("/synchronize/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userGithubInfo = await userCommitControllerImpl.synchronizeUserGithub(req, next);
        returnResult(userGithubInfo, INTERNAL_SERVER_ERROR, res, next);
    } catch (err) {
        next(err);
    }
})
