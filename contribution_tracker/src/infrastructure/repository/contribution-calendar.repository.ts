import { Op, or } from "sequelize";
import ContributionCalendarEntity from "../../core/domain/entities/contribution-calendar.entity";

export class ContributionCalendarRepository {

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
                },
                order: [['date', 'DESC']]
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

    async deleteAllContributionsByProjectId(projectId: string): Promise<void> {
        try {
            await ContributionCalendarEntity.destroy({ where: { projectId } });
        } catch (error) {
            throw new Error('Failed to delete all contributions by project id');
        }
    }

    async findByUserIdAndBetweenDate(userId: number, startDate: Date, endDate: Date): Promise<ContributionCalendarEntity[]> {
        try {
            return await ContributionCalendarEntity.findAll({
                where: {
                    userId,
                    date: {
                        [Op.gte]: startDate, 
                        [Op.lte]: endDate    
                    }
                }
            });
        } catch (error) {
            throw new Error('Failed to get contribution calendar by user id and between date');
        }
    }
}