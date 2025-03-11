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
    ) { }

    async getContributionCalendar(userId: number): Promise<IResponse> {
        try {
            console.log("getContributionCalendar userId: ", userId)
            const [userCommits, startDate, endDate] = await this.contributionCalendarServiceImpl.getContributionCalendar(userId);
            const userInfo = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            if (!userInfo) {
                throw new Error('WTF why userInfo null and we can still get user total commits?')
            }
            return msg200({
                userCommits,
                userTotalCommits: userInfo.totalUserCommits,
                startDate,
                endDate
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getContributionCalendarByProject(userId: number, projectId: string): Promise<IResponse> {
        try {
            console.log("getContributionCalendar userId: ", userId)
            const [projectCommits, startDate, endDate] = await this.contributionCalendarServiceImpl.getContributionCalendarByProject(userId, projectId);
            const projectCommit = await this.projectCommitServiceImpl.getProjectCommitsByUserIdAndProjectId(userId, projectId);
            if (!projectCommit) {
                throw new Error('WTF why userInfo null and we can still get user total commits?')
            }
            return msg200({
                projectCommits,
                projectTotalCommits: projectCommit.totalProjectCommits,
                startDate,
                endDate
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async compareCommits(userId: number): Promise<IResponse> {
        try {
            const data = await this.contributionCalendarServiceImpl.compareCommits(userId);
            return msg200(data);
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }
}

export const contributionCalendarUsecase = new ContributionCalendarUsecase();