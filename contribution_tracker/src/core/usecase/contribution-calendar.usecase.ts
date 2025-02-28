import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { contributionCalendarService } from "../service/contribution-calendar.service";
import { projectCommitService } from "../service/project-commit.service";
import { userCommitService } from "../service/user-commit.service";

class ContributionCalendarUsecase {
    constructor(
        private contributionCalendarServiceImpl = contributionCalendarService,
        private userCommitServiceImpl = userCommitService,
        private projectCommitServiceImpl = projectCommitService,
    ) {}

    async getContributionCalendar(userId: number): Promise<IResponse> {
        try {
            console.log("getContributionCalendar userId: ", userId)
            const userCommits = await this.contributionCalendarServiceImpl.getContributionCalendar(userId);
            const userInfo = await this.userCommitServiceImpl.getUserGithubInfo(userId); 
            if (!userInfo) {
                throw new Error('WTF why userInfo null and we can still get user total commits?')
            }  
            return msg200({
                userCommits,
                userTotalCommits: userInfo.totalUserCommits
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