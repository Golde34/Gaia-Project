import ScheduleGroupEntity from "../../core/domain/entities/schedule-group.entity";
import { Op } from "sequelize";
import { ActiveStatus } from "../../core/domain/enums/enums";

class ScheduleGroupRepository {
    constructor() { }

    async createScheduleGroup(scheduleGroup: any): Promise<ScheduleGroupEntity | undefined> {
        try {
            return await ScheduleGroupEntity.create(scheduleGroup);
        } catch (error) {
            console.error("Error creating schedule group:", error);
            throw new Error("Failed to create schedule group");
        }
    }

    async listScheduleGroup(schedulePlanId: string): Promise<ScheduleGroupEntity[]> {
        try {
            return await ScheduleGroupEntity.findAll({ where: { schedulePlanId: schedulePlanId } });
        } catch (error) {
            console.error("Error listing schedule groups:", error);
            throw new Error("Failed to list schedule groups");
        }
    }

    async updateScheduleGroupUpdatedDate(scheduleGroup: any, today: Date): Promise<ScheduleGroupEntity | null> {
        try {
            console.log("Today's date for update:", today);
            scheduleGroup.set({
                updatedAt: today,
            })
            await scheduleGroup.save();

            const existedGroup = await ScheduleGroupEntity.findByPk(scheduleGroup.id);
            console.log("Existed schedule group:", existedGroup);
            return existedGroup; 
        } catch (error) {
            console.error("Error updating schedule group:", error);
            throw new Error("Failed to update schedule group");
        }
    }

    async deleteScheduleGroup(scheduleGroupId: string): Promise<ScheduleGroupEntity | null> {
        try {
            const deletedGroup = await ScheduleGroupEntity.destroy({ where: { id: scheduleGroupId } });
            return deletedGroup ? await ScheduleGroupEntity.findByPk(scheduleGroupId) : null;
        } catch (error) {
            console.error("Error deleting schedule group:", error);
            throw new Error("Failed to delete schedule group");
        }
    }

    async findAllScheduleGroupsToCreateTask(limit: number, date: Date): Promise<ScheduleGroupEntity[]> {
        try {
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const weekDay = date.getDay().toString();
            const scheduleGroups = await ScheduleGroupEntity.findAll({
                where: {
                    activeStatus: ActiveStatus.active,
                    updatedAt: { [Op.lt]: startOfDay },
                    repeat: { [Op.contains]: [String(weekDay)] },
                    isFailed: { [Op.in]: [null, false] }
                },
                limit: limit,
                order: [['schedulePlanId', 'ASC']],
            });
            return scheduleGroups;
        } catch (error) {
            console.error("Error finding schedule groups to create task:", error);
            throw new Error("Failed to find schedule groups to create task");
        }
    }

    async markAsFail(scheduleGroupId: string): Promise<ScheduleGroupEntity | null> {
        try {
            const [affectedCount, affectedRows] = await ScheduleGroupEntity.update(
                { isFailed: true },
                { where: { id: scheduleGroupId }, returning: true }
            );
            return affectedCount > 0 ? affectedRows[0] : null;
        } catch (error) {
            console.error("Error marking schedule group as failed:", error);
            throw new Error("Failed to mark schedule group as failed");
        }
    }

    async findById(scheduleGroupId: string): Promise<ScheduleGroupEntity | null> {
        try {
            return await ScheduleGroupEntity.findByPk(scheduleGroupId);
        } catch (error) {
            console.error("Error finding schedule group by ID:", error);
            throw new Error("Failed to find schedule group by ID");
        }
    }
}

export const scheduleGroupRepository = new ScheduleGroupRepository();