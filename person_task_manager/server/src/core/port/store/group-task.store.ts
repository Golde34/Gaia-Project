import { UpdateWriteOpResult } from "mongoose";
import { groupTaskRepository } from "../../../infrastructure/database/repository/group-task.repository";
import { DeleteResult } from "mongodb";
import { IGroupTaskEntity } from "../../domain/entities/group-task.entity";

class GroupTaskStore {
    constructor() { }

    async createGroupTask(groupTask: any): Promise<IGroupTaskEntity> {
        return await groupTaskRepository.createGroupTask(groupTask);
    }

    async updateGroupTask(groupTaskId: string, groupTask: any): Promise<UpdateWriteOpResult> {
        return await groupTaskRepository.updateOneGroupTask(groupTaskId, groupTask);
    }

    async deleteGroupTask(groupTaskId: string): Promise<DeleteResult> {
        return await groupTaskRepository.deleteOneProject(groupTaskId);
    }

    async findGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await groupTaskRepository.findOneGroupTaskById(groupTaskId);
    }

    async findGroupTaskWithTasks(groupTaskId: string): Promise<IGroupTaskEntity> {
        return await groupTaskRepository.findOneGroupTaskWithTasks(groupTaskId);
    }

    async findGroupTasksByTaskId(taskId: string): Promise<IGroupTaskEntity | undefined | null> {
        return await groupTaskRepository.findGroupTasksByTaskId(taskId);
    }

    async findTasksInGrouptaskByTimeStamp(groupTaskId: string, startDate: Date, endDate: Date): Promise<any | null> {
        return await groupTaskRepository.findTasksInGrouptaskByTimeStamp(groupTaskId, startDate, endDate);
    }

    async pullTaskFromGroupTask(taskId: string): Promise<UpdateWriteOpResult> {
        return await groupTaskRepository.pullTaskFromGroupTask(taskId);
    }

    async findOneActiveGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await groupTaskRepository.findOneActiveGroupTaskById(groupTaskId);
    }

    async findOneInactiveGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await groupTaskRepository.findOneInactiveGroupTaskById(groupTaskId);
    }

    async archiveGroupTask(groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await groupTaskRepository.archiveGroupTask(groupTaskId);
    }

    async enableGroupTask(groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await groupTaskRepository.enableGroupTask(groupTaskId);
    }

    async pushTaskToGroupTask(groupTaskId: string, taskId: string): Promise<UpdateWriteOpResult> {
        return await groupTaskRepository.pushTaskToGroupTask(groupTaskId, taskId);
    }

    async pullTaskFromSpecifiedGroupTask(groupTaskId: string, taskId: string): Promise<UpdateWriteOpResult> {
        console.log(`Pulling task ${taskId} from group task ${groupTaskId}`);
        return await groupTaskRepository.pullTaskFromSpecifiedGroupTask(groupTaskId, taskId);
    }

    async findActiveTasksInActiveGroupTask(groupTaskId: string): Promise<any> {
        return await groupTaskRepository.findActiveTasksInActiveGroupTask(groupTaskId);
    }

    async checkDefaultGroupTask(projectId: string): Promise<IGroupTaskEntity[]> {
        return await groupTaskRepository.findDefaultGroupTaskByProjectId(projectId);
    } 

    async checkExistedTask(taskId: string, groupTaskId: string): Promise<boolean> {
        return await groupTaskRepository.checkExitedTask(taskId, groupTaskId);
    }
}

export const groupTaskStore = new GroupTaskStore();