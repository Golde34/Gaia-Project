import { ulid } from "ulid";
import ScheduleGroupEntity from "../../core/domain/entities/schedule-group.entity";
import { Op } from "sequelize";
import { ActiveStatus } from "../../core/domain/enums/enums";

class ScheduleGroupRepository {
    constructor() {}

    async createScheduleGroup(scheduleGroup: any): Promise<ScheduleGroupEntity | undefined> {
        try {
            const newGroup = {
                ...scheduleGroup,
                id: ulid(),
            };
            return await ScheduleGroupEntity.create(newGroup);
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

    async updateScheduleGroup(scheduleGroup: any): Promise<ScheduleGroupEntity | null> {
        try {
            const [affectedCount, affectedRows] = await ScheduleGroupEntity.update(scheduleGroup, {
                where: { id: scheduleGroup.id },
                returning: true,
            });
            return affectedCount > 0 ? affectedRows[0] : null;
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
            return await ScheduleGroupEntity.findAll({
                where: {
                    activeStatus: ActiveStatus.active,
                    updateDate: { [Op.lt]: startOfDay },
                    repeat: weekDay,
                    isFailed: { [Op.or]: [null, false] },
                },
                limit: limit,
                order: [['schedulePlanId', 'ASC']],
            });
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
}

export const scheduleGroupRepository = new ScheduleGroupRepository();