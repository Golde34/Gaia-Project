import { UpdateWriteOpResult } from "mongoose";
import { DeleteResult } from "mongodb";
import { IScheduleTaskEntity, ScheduleTaskEntity } from "../entities/schedule-task.entity";
import { ScheduleTaskStore } from "./store/schedule-task.store";
import { ActiveStatus } from "../../core/domain/enums/enums";

class ScheduleTaskRepository implements ScheduleTaskStore {
    constructor() {}

    async createScheduleTask(scheduleTask: any): Promise<IScheduleTaskEntity> {
        return await ScheduleTaskEntity.create(scheduleTask);
    }
    
    async updateScheduleTask(scheduleTaskId: string, scheduleTask: any): Promise<UpdateWriteOpResult> {
        return await ScheduleTaskEntity.updateOne({ _id: scheduleTaskId }, scheduleTask);
    }

    async deleteScheduleTask(scheduleTaskId: string): Promise<DeleteResult> {
        return await ScheduleTaskEntity.deleteOne({ _id: scheduleTaskId });
    }

    async findScheduleTaskById(scheduleTaskId: string): Promise<IScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findById(scheduleTaskId);
    }

    async isTaskSynchronized(taskId: string): Promise<boolean> {
        return await ScheduleTaskEntity.exists({ isSynchronizedWithWO: true, taskId: taskId }) !== null;
    }

    async findByScheduleTaskIdAndTaskId(scheduleTaskId: string, taskId: string): Promise<IScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findOne({ _id: scheduleTaskId, taskId: taskId });
    }

    async syncScheduleTask(scheduleTaskId: string, isSync: boolean): Promise<UpdateWriteOpResult> {
        return await ScheduleTaskEntity.updateOne({ _id: scheduleTaskId}, {isSynchronizedWithWO: isSync});
    }

    async findScheduleTaskByTaskId(taskId: string): Promise<IScheduleTaskEntity | null> {
        return await ScheduleTaskEntity.findOne({ taskId: taskId });
    }

    async findTop10NewestTask(schedulePlanId: string): Promise<IScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.find({ schedulePlanId: schedulePlanId, status: { $ne: 'DONE' }, activeStatus: ActiveStatus.active }).sort({ createdAt: -1 }).limit(10);
    }

    async findByTaskBatch(schedulePlanId: string, taskBatch: number): Promise<IScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.find({ schedulePlanId: schedulePlanId, taskBatch: taskBatch, 
            status: { $ne: 'DONE' }, activeStatus: ActiveStatus.active }).sort({ taskOrder: 1 });
    }

    async findAll(schedulePlanId: string): Promise<IScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.find({ schedulePlanId: schedulePlanId });
    }

    async findDistinctTaskBatch(schedulePlanId: string): Promise<number[]> {
        return await ScheduleTaskEntity.distinct('taskBatch', { schedulePlanId: schedulePlanId, status: { $ne: 'DONE'} });
    }

    async findScheduleTasksByUserId(schedulePlanId: string): Promise<IScheduleTaskEntity[]> {
        return await ScheduleTaskEntity.find({ schedulePlanId: schedulePlanId, isNotify: true }); 
    }
}

export const scheduleTaskRepository = new ScheduleTaskRepository();