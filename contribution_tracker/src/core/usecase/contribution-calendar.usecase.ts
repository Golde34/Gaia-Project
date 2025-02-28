import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { contributionCalendarService } from "../service/contribution-calendar.service";

class ContributionCalendarUsecase {
    constructor(
        private contributionCalendarServiceImpl = contributionCalendarService,
    ) {}

    async getContributionCalendar(userId: number): Promise<IResponse> {
        try {
            const userCommits = this.contributionCalendarServiceImpl.getContributionCalendar(userId);
            return msg200({
                userCommits
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getContributionCalendarByProject(userId: number, projectId: string): Promise<IResponse> {
        try {
            const commits = this.contributionCalendarServiceImpl.getContributionCalendarByProject(userId, projectId);
            return msg200({
                commits
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }
}

export const contributionCalendarUsecase = new ContributionCalendarUsecase();