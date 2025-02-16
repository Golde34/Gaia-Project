import { NextFunction, Request } from "express";
import { IResponse } from "../../../core/common/response";
import { userCommitUsecase } from "../../../core/usecase/user-commit.usecase";

class UserCommitController {
    constructor() {}

    async getUserGithubInfo(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const userGithubInfo = await userCommitUsecase.getUserGithubInfo(userId);
            return userGithubInfo;
        } catch (err) {
            next(err);
        }
    }

    async verifyGithubAuthorization(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const code = req.body.code;
            const state = req.body.state;
            const userGithubInfo = await userCommitUsecase.verifyGithubAuthorization(code, state);
            return userGithubInfo;
        } catch (err) {
            next(err);
        }
    }

    async synchronizeUserGithub(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const userGithubInfo = await userCommitUsecase.synchronizeUserGithub(userId);
            return userGithubInfo;
        } catch (err) {
            next(err);
        }
    }
}

export const userCommitController = new UserCommitController();