import { contributionCalendarRepository } from "../../infrastructure/repository/contribution-calendar.repository";
import ContributionCalendarEntity from "../domain/entities/contribution-calendar.entity";
import { ulid } from "ulid";


class ContributionCalendarService {
    constructor(
        private contributionCalendarRepoImpl = contributionCalendarRepository,
    ) { }

    async upsertContribution(userId: number, projectId: string, date: Date, commitCount: number): Promise<ContributionCalendarEntity | null> {
        try {
            const contribution = await this.contributionCalendarRepoImpl.findByUserIdAndProjectIdAndDate(userId, projectId, date);
            if (!contribution || contribution == null) {
                await ContributionCalendarEntity.create({
                    id: ulid(),
                    userId: userId,
                    projectId: projectId,
                    date: date,
                    commitCount: commitCount,
                })
            } else {
                await contribution.increment('commit_count', { by: commitCount });
            }
            return contribution;
        } catch (error) {
            console.error("Failed to create contribution: ", error);
            return null;
        }
    }

    async getContributionCalendar(userId: number): Promise<ContributionCalendarEntity[]> {
        try {
            return await this.contributionCalendarRepoImpl.findByUserId(userId);
        } catch (error) {
            console.error("Failed to get contribution calendar: ", error);
            return [];
        }
    }

    async getContributionCalendarByProject(userId: number, projectId: string): Promise<ContributionCalendarEntity[]> {
        try {
            return await this.contributionCalendarRepoImpl.findByUserIdAndProjectId(userId, projectId);
        } catch (error) {
            console.error("Failed to get contribution calendar by project: ", error);
            return [];
        }
    }
}

export const contributionCalendarService = new ContributionCalendarService();