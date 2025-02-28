import { ContributionCalendarRepository } from "../../infrastructure/repository/contribution-calendar.repository";
import ContributionCalendarEntity from "../domain/entities/contribution-calendar.entity";
import { ulid } from "ulid";


class ContributionCalendarService {
    constructor(
        private contributionCalendarRepoImpl = new ContributionCalendarRepository,
    ) { }

    async upsertContribution(userId: number, projectId: string, date: string, commitCount: number): Promise<ContributionCalendarEntity | null> {
        try {
            const formattedDate = new Date(date)
            const contribution = await this.contributionCalendarRepoImpl.findByUserIdAndProjectIdAndDate(userId, projectId, formattedDate);
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

    async getContributionCalendar(userId: number): Promise<{ [key: string]: { level: number; commitCount: number } }[]> {
        try {
            const contributions = await this.contributionCalendarRepoImpl.findByUserId(userId);

            if (!contributions || contributions.length === 0) {
                return [];
            }

            const sortedContributions = contributions.sort((a, b) => b.date.getTime() - a.date.getTime());
            const endDate = new Date(sortedContributions[0].date); // Ngày commit mới nhất
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 365);

            const totalCommits = contributions.reduce((sum, contribution) => sum + contribution.commitCount, 0);
            const averageCommitPerDay = totalCommits / 365;

            const calculateLevel = (commitCount: number): number => {
                if (commitCount === 0) return 0;
                if (commitCount > 0 && commitCount <= averageCommitPerDay * 1) return 1;
                if (commitCount > averageCommitPerDay * 1 && commitCount <= averageCommitPerDay * 2) return 2;
                if (commitCount > averageCommitPerDay * 2 && commitCount <= averageCommitPerDay * 3) return 3;
                return 4;
            };

            const data: { [key: string]: { level: number; commitCount: number } }[] = [];

            contributions.forEach((contribution) => {
                const dateString = contribution.date.toISOString().slice(0, 10);
                data.push({
                    [dateString]: {
                        level: calculateLevel(contribution.commitCount),
                        commitCount: contribution.commitCount,
                    },
                });
            });

            return data;
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