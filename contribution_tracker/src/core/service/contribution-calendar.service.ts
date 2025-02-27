import { contributionCalendarRepository } from "../../infrastructure/repository/contribution-calendar.repository";
import ContributionCalendarEntity from "../domain/entities/contribution-calendar.entity";
import { ulid } from "ulid";


class ContributionCalendarService {
    constructor(
        private contributionCalendarRepoImpl = contributionCalendarRepository,
    ) {}
    
    async createContribution(userId: number, projectId: string, date: Date, commitCount: number): Promise<ContributionCalendarEntity | undefined> {
        try {
            // const contribution = this.contributionCalendarServiceImpl.createContribution(commit);
            const contribution = await ContributionCalendarEntity.create({
                id: ulid(),
                userId: userId,
                projectId: projectId,
                date: date,
                commitCount: commitCount,
            }) 
            return contribution;
        } catch (error) {
            console.error("Failed to create contribution: ", error);
            return undefined;
        }
    }

    async calculateTotalCommits(userId: number, date: Date): Promise<void> {
        try {
            const contribution = await this.contributionCalendarRepoImpl.findByUserIdAndProjectIdAndDate(userId, projectId, date);
            
        } catch (error) {
            console.error("Failed to calculate total commits")
            return;
        }
    }
}

export const contributionCalendarService = new ContributionCalendarService();