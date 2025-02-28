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

    async findByUserId(userId: number): Promise<ContributionCalendarEntity[]> {
        try {
            return await ContributionCalendarEntity.findAll({
                where: {
                    userId
                }
            });
        } catch (error) {
            throw new Error('Failed to get contribution calendar');
        }
    }

    async findByUserIdAndProjectId(userId: number, projectId: string): Promise<ContributionCalendarEntity[]> {
        try {
            return await ContributionCalendarEntity.findAll({
                where: {
                    userId,
                    projectId
                }
            });
        } catch (error) {
            throw new Error('Failed to get contribution calendar by project');
        }
    }
}

export const contributionCalendarRepository = new ContributionCalendarRepository();