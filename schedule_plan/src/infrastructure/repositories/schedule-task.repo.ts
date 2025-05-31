import { Op, Sequelize } from "sequelize";
import ScheduleTaskEntity from "../../core/domain/entities/schedule-task.entity";
import { ActiveStatus, TaskStatus } from "../../core/domain/enums/enums";

class ScheduleTaskRepository {
    constructor() { }

    async createScheduleTask(scheduleTask: any): Promise<ScheduleTaskEntity | undefined> {
        return await ScheduleTaskEntity.create(scheduleTask);
    }

    async updateScheduleTask(scheduleTaskId: string, scheduleTask: any): Promise<ScheduleTaskEntity | null> {
        const [affectedCount, affectedRows] = await ScheduleTaskEntity.update(scheduleTask, {
            where: { id: scheduleTaskId },
            returning: true,
        });
        return affectedCount > 0 ? affectedRows[0] : null;
    }

    async deleteScheduleTask(scheduleTaskId: string): Promise<ScheduleTaskEntity | null> {
        const deletedCount = await ScheduleTaskEntity.destroy({ where: { id: scheduleTaskId } });
        return deletedCount > 0 ? await ScheduleTaskEntity.findByPk(scheduleTaskId) : null;
    }

    async findScheduleTaskById(scheduleTaskId: string): Promise<ScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findByPk(scheduleTaskId);
    }

    async isTaskSynchronized(taskId: string): Promise<boolean> {
        const scheduleTask = await ScheduleTaskEntity.findByPk(taskId);
        if (!scheduleTask) return false;
        return scheduleTask.isSynchronizedWithWO === true;
    }

    async findByScheduleTaskIdAndTaskId(scheduleTaskId: string, taskId: string): Promise<ScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findOne({ where: { id: scheduleTaskId, taskId: taskId } });
    }

    async syncScheduleTask(scheduleTaskId: string, isSync: boolean): Promise<ScheduleTaskEntity | null> {
        const [affectedCount, affectedRows] = await ScheduleTaskEntity.update({ isSynchronizedWithWO: isSync }, {
            where: { id: scheduleTaskId },
            returning: true,
        });
        return affectedCount > 0 ? affectedRows[0] : null;
    }

    async findScheduleTaskByTaskId(taskId: string): Promise<ScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findOne({ where: { taskId: taskId } });
    }

    async findTop10NewestTask(schedulePlanId: string): Promise<ScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.findAll({
            where: {
                schedulePlanId: schedulePlanId,
                status: { [Op.ne]: TaskStatus.DONE },
                activeStatus: ActiveStatus.active 
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
    }

    async findByTaskBatch(schedulePlanId: string, taskBatch: number): Promise<ScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.findAll({
            where: {
                schedulePlanId: schedulePlanId,
                taskBatch: taskBatch,
                status: { [Op.ne]: TaskStatus.DONE },
                activeStatus: ActiveStatus.active 
            },
            order: [['taskOrder', 'ASC']]
        });
    }

    async findAll(schedulePlanId: string): Promise<ScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.findAll({ where: { schedulePlanId: schedulePlanId } });
    }

    async findDistinctTaskBatch(schedulePlanId: string): Promise<number[]> {
        return await ScheduleTaskEntity.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('task_batch')), 'taskBatch']],
            where: { schedulePlanId: schedulePlanId, status: { [Op.ne]: TaskStatus.DONE } },
            raw: true
        }).then(results => results.map(result => result.taskBatch));
    }

    async findByScheduleGroup(scheduleGroupId: string): Promise<ScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.findAll({ where: { scheduleGroupId: scheduleGroupId } });
    }

    async findUserDailyTasks(schedulePlanId: string, taskBatch: number, date: Date): Promise<ScheduleTaskEntity[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await ScheduleTaskEntity.findAll({
            where: {
                schedulePlanId: schedulePlanId,
                taskBatch: taskBatch,
                createdAt: { [Op.between]: [startOfDay, endOfDay] },
                status: { [Op.ne]: TaskStatus.DONE },
                activeStatus: ActiveStatus.active 
            }
        });
    }
}

export const scheduleTaskRepository = new ScheduleTaskRepository();