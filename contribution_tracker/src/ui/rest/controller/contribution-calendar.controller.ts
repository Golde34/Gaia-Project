import { Request, NextFunction } from "express";
import { IResponse } from "../../../core/common/response";
import { contributionCalendarUsecase } from "../../../core/usecase/contribution-calendar.usecase";

class ContributionCalendarController {
    constructor() {}

    async getContributionCalendar(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const userCommits = await contributionCalendarUsecase.getContributionCalendar(userId);
            return userCommits; 
        } catch (err) {
            next(err);
        }
    }

    async getContributionCalendarByProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            const projectId = req.params.projectId;
            const commits = await contributionCalendarUsecase.getContributionCalendarByProject(userId, projectId);
            return commits;
        } catch (err) {
            next(err);
        }
    }
}

export const contributionCalendarController = new ContributionCalendarController();