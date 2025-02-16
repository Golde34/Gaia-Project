import { Request, NextFunction } from "express";
import { IResponse } from "../../../core/common/response";
import { commitUsecase } from "../../../core/usecase/commit.usecase";

class CommitController {
    constructor() {}

    async getUserCommits(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const userCommits = await commitUsecase.getUserCommits(userId);
            return userCommits; 
        } catch (err) {
            next(err);
        }
    }

    async getProjectCommits(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const projectId = req.params.projectId;
            const commits = await commitUsecase.getProjectCommits(userId, projectId);
            return commits;
        } catch (err) {
            next(err);
        }
    } 
}

export const commitController = new CommitController();