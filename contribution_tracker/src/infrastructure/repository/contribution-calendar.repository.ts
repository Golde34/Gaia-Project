import ContributionCalendarEntity from "../../core/domain/entities/contribution-calendar.entity";

class ContributionCalendarRepository {

    async findByUserIdAndProjectIdAndDate(userId: number, projectId: string, date: Date): Promise<ContributionCalendarEntity | null> {
        try {
            const contributionCalendar = await ContributionCalendarEntity.findOne({
                where: {
                    userId,
                    projectId,
                    date,
                }
            });
            return contributionCalendar;
        } catch (error) {
            throw new Error('Failed to find contribution calendar by user id, project id and date');
        }
    }

    async updateTotalCommits()

    async syncFromValkeyToDB(valkeyContributionCalendar: any): Promise<void> {
        try {
            await ContributionCalendarEntity.upsert(valkeyContributionCalendar);
        } catch (error) {
            throw new Error('Failed to sync contribution calendar from valkey to db');
        }
    } 

    async insertToDB(contributionCalendar: any): Promise<void> {
        try {
            await ContributionCalendarEntity.create(contributionCalendar);
        } catch (error) {
            throw new Error('Failed to insert contribution calendar to db');
        }
    }
}

export const contributionCalendarRepository = new ContributionCalendarRepository();