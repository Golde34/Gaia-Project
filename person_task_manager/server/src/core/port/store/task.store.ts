import { UpdateWriteOpResult } from "mongoose";
import { taskRepository } from "../../../infrastructure/database/repository/task.repository";
import { DeleteResult } from "mongodb";
import { ITaskEntity } from "../../domain/entities/task.entity";

class TaskStore {
    constructor() { }

    async createTask(task: any): Promise<ITaskEntity> {
        return await taskRepository.createTask(task);
    }

    async updateTask(taskId: string, task: any): Promise<ITaskEntity | null> {
        await taskRepository.updateTask(taskId, task);
        return this.findTaskById(taskId);
    }

    async deleteTask(taskId: string): Promise<DeleteResult> {
        return await taskRepository.deleteTask(taskId);
    }

    async findTaskById(taskId: string): Promise<ITaskEntity | null> {
        return await taskRepository.findOneTask(taskId);
    }

    async findTaskWithSubTasks(taskId: string): Promise<ITaskEntity | null> {
        return await taskRepository.findTaskWithSubTasks(taskId);
    }   

    async findTaskWithComments(taskId: string): Promise<ITaskEntity | null> {
        return await taskRepository.findTaskWithComments(taskId);
    }

    async findAllTasks(): Promise<ITaskEntity[]> {
        return await taskRepository.findAllTasks();
    }

    async pullSubTasksInTask(subTaskId: string): Promise<UpdateWriteOpResult> {
        return await taskRepository.pullSubTasksInTask(subTaskId);
    }

    async pullCommentsInTask(commentId: string): Promise<UpdateWriteOpResult> {
        return await taskRepository.pullCommentsInTask(commentId);
    }

    async findActiveTaskById(taskId: string): Promise<ITaskEntity | null> {
        return await taskRepository.findOneActiveTask(taskId);
    }

    async findInactiveTaskById(taskId: string): Promise<ITaskEntity | null> {
        return await taskRepository.findOneInactiveTask(taskId);
    }

    async archiveTask(taskId: string): Promise<UpdateWriteOpResult> {
        return await taskRepository.archiveTask(taskId);
    }

    async enableTask(taskId: string): Promise<UpdateWriteOpResult> {
        return await taskRepository.enableTask(taskId);
    }

    async getTopTasks(userId: number, limit: number): Promise<ITaskEntity[] | null> {
        return await taskRepository.getTopTasks(userId, limit);
    }
    
    async updateGroupTaskId(taskId: string, newGroupTaskId: string): Promise<UpdateWriteOpResult> {
        return await taskRepository.updateGroupTaskId(taskId, newGroupTaskId);
    }

    async getDoneTasksFromDateToDate(userId: number, fromDate:Date, toDate: Date): Promise<ITaskEntity[]> {
        return await taskRepository.getDoneTasksFromDateToDate(userId, fromDate, toDate);
    }
}

export const taskStore = new TaskStore();