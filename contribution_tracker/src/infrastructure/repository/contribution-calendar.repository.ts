import ContributionCalendarEntity from "../../core/domain/entities/contribution-calendar.entity";

export class ContributionCalendarRepository {
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