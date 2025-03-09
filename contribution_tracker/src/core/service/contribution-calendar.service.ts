import { format } from "date-fns";
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

    async getContributionCalendar(userId: number): Promise<any[]> {
        try {
            const contributions = await this.contributionCalendarRepoImpl.findByUserId(userId);

            if (!contributions || contributions.length === 0) {
                return [];
            }

            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 365);
            console.log(`startDate contribution calendar of user ${userId}: `, startDate);
            console.log(`endDate contribution calendar of user ${userId}: `, endDate);

            const filteredContributions = contributions.filter((contribution) => {
                const contributionDate = new Date(contribution.date);
                return contributionDate >= startDate && contributionDate <= endDate;
            });

            const totalCommits = filteredContributions.reduce((sum, contribution) => sum + contribution.commitCount, 0);
            const averageCommitPerDay = totalCommits / 365;

            const calculateLevel = (commitCount: number): number => {
                if (commitCount === 0) return 0;
                if (commitCount > 0 && commitCount <= averageCommitPerDay * 1) return 1;
                if (commitCount > averageCommitPerDay * 1 && commitCount <= averageCommitPerDay * 2) return 2;
                if (commitCount > averageCommitPerDay * 2 && commitCount <= averageCommitPerDay * 3) return 3;
                return 4;
            };

            const data: { [key: string]: { level: number; commitCount: number } }[] = [];

            filteredContributions.forEach((contribution) => {
                const dateString = contribution.date.toISOString().slice(0, 10);
                data.push({
                    [dateString]: {
                        level: calculateLevel(contribution.commitCount),
                        commitCount: contribution.commitCount,
                    },
                });
            });

            return [data, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')];
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

    async compareCommits(userId: number): Promise<any> {
        try {
            const endDate = new Date();
            let startDate = new Date();
            let previousStartDate = new Date();

            startDate.setDate(endDate.getDate() - 7);
            previousStartDate.setDate(endDate.getDate() - 14);

            console.log(`Time Range - startDate: ${startDate.toString()}, endDate: ${endDate.toString()}, previousStartDate: ${previousStartDate.toString()}`);

            const [contributions, previousContributions] = await Promise.all([
                this.contributionCalendarRepoImpl.findByUserIdAndBetweenDate(userId, startDate, endDate),
                this.contributionCalendarRepoImpl.findByUserIdAndBetweenDate(userId, previousStartDate, startDate),
            ]);

            return this.formatChartData(contributions, previousContributions, endDate.toISOString());

        } catch (error) {
            console.error("Failed to compare commits: ", error);
            return null;
        }
    }

    private formatChartData(contributions: any[], previousContributions: any[], endDate: string): any[] {
        const dataMap = new Map<string, { date: string, "Week Commit": number, "Previous Week Commit": number }>();

        const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleString('en-US', { weekday: 'short' });

        [...contributions, ...previousContributions].forEach(commit => {
            const formattedDate = formatDate(commit.date);
            if (!dataMap.has(formattedDate)) {
                dataMap.set(formattedDate, { date: formattedDate, "Week Commit": 0, "Previous Week Commit": 0 });
            }
            const entry = dataMap.get(formattedDate)!;
            if (contributions.includes(commit)) {
                entry["Week Commit"] += commit.commitCount;
            } else {
                entry["Previous Week Commit"] += commit.commitCount;
            }
        });

        console.log("dataMap: ", dataMap);

        const fullWeekData: any[] = [];
        let currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() - 6);

        Array.from({ length: 7 }).forEach(() => {
            const formattedDate = formatDate(currentDate.toISOString());
            if (!dataMap.has(formattedDate)) {
                dataMap.set(formattedDate, { date: formattedDate, "Week Commit": 0, "Previous Week Commit": 0 });
            }
            fullWeekData.push(dataMap.get(formattedDate)!);
            currentDate.setDate(currentDate.getDate() + 1);
        });

        console.log("fullWeekData: ", fullWeekData);

        return fullWeekData;
    }

    async deleteContributionByProjectId(projectId: string): Promise<any> {
        try {
            await this.contributionCalendarRepoImpl.deleteAllContributionsByProjectId(projectId);
        } catch (error) {
            console.error("Failed to delete contribution by project id: ", error);
        }
    }
}

export const contributionCalendarService = new ContributionCalendarService();