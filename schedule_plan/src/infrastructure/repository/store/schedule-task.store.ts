import { UpdateWriteOpResult } from "mongoose";
import { IScheduleTaskEntity } from "../../entities/schedule-task.entity";
import { DeleteResult } from "mongodb";

export interface ScheduleTaskStore {
    createScheduleTask(task: any): Promise<IScheduleTaskEntity>;
    updateScheduleTask(taskId: string, task: any): Promise<UpdateWriteOpResult>;
    deleteScheduleTask(taskId: string): Promise<DeleteResult>;
    findScheduleTaskById(taskId: string): Promise<IScheduleTaskEntity | null>;
}