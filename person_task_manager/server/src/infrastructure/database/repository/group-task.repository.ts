import { DeleteResult, ObjectId } from "mongodb";
import { GroupTaskEntity } from "../model-repository/group-task.model";
import { UpdateWriteOpResult } from "mongoose";
import { ActiveStatus, BooleanStatus, Status } from "../../../core/domain/enums/enums";
import { ProjectEntity } from "../model-repository/project.model";
import { IGroupTaskEntity } from "../../../core/domain/entities/group-task.entity";

class GroupTaskRepository {
    constructor() { }

    async createGroupTask(groupTask: any): Promise<IGroupTaskEntity> {
        return await GroupTaskEntity.create(groupTask);
    }

    async updateOneGroupTask(groupTaskId: string, groupTask: any): Promise<UpdateWriteOpResult> {
        return await GroupTaskEntity.updateOne({ _id: groupTaskId }, groupTask);
    }

    async deleteOneProject(grouptaskId: string): Promise<DeleteResult> {
        return await GroupTaskEntity.deleteOne({ _id: grouptaskId });
    }

    async findOneGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await GroupTaskEntity.findOne({ _id: groupTaskId });
    }

    async findOneGroupTaskWithTasks(grouptaskId: string): Promise<IGroupTaskEntity> {
        return await GroupTaskEntity.findOne({ _id: grouptaskId }).select('tasks');
    }

    async findOneActiveGroupTaskWithTasks(groupTaskId: string): Promise<IGroupTaskEntity> {
        return await GroupTaskEntity
            .findOne({ _id: groupTaskId, activeStatus: ActiveStatus.active })
            .select('tasks');
    }

    async findGroupTasksByTaskId(taskId: string): Promise<IGroupTaskEntity | undefined | null> {
        return await GroupTaskEntity.findOne({ tasks: taskId })
    }

    async findTasksInGrouptaskByTimeStamp(groupTaskId: string, startDate: Date, endDate: Date): Promise<any | null> {
        const tasks = await GroupTaskEntity.findOne({ _id: groupTaskId })
            .populate({
                path: 'tasks',
                match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            })
            .exec();
        return tasks;
    };

    async pullTaskFromGroupTask(taskId: string): Promise<UpdateWriteOpResult> {
        return await GroupTaskEntity.updateMany({ tasks: taskId }, { $pull: { tasks: taskId } });
    }

    async findOneActiveGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await GroupTaskEntity
            .findOne({ _id: groupTaskId, activeStatus: ActiveStatus.active });
    }

    async findOneInactiveGroupTaskById(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        return await GroupTaskEntity
            .findOne({ _id: groupTaskId, activeStatus: ActiveStatus.inactive });
    }

    async archiveGroupTask(groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await GroupTaskEntity
            .updateOne({ _id: groupTaskId },
                { activeStatus: ActiveStatus.inactive },
                { status: Status.archived });
    }

    async enableGroupTask(groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await GroupTaskEntity
            .updateOne({ _id: groupTaskId },
                { activeStatus: ActiveStatus.active });
    }

    async pushTaskToGroupTask(groupTaskId: string, taskId: string): Promise<UpdateWriteOpResult> {
        return await GroupTaskEntity
            .updateOne({ _id: groupTaskId }, { $push: { tasks: taskId } });
    }

    async pullTaskFromSpecifiedGroupTask(groupTaskId: string, taskId: string): Promise<UpdateWriteOpResult> {
        const groupId = new ObjectId(groupTaskId);  
        const taskObjectId = new ObjectId(taskId);  

        try {
            return await GroupTaskEntity
                .updateOne(
                    { _id: groupId },  
                    { $pull: { tasks: taskObjectId } }  
                );
        } catch (error) {
            console.error('Error during pull operation:', error);
            throw error;
        }
    }

    async findActiveTasksInActiveGroupTask(groupTaskId: string): Promise<any> {
        return await GroupTaskEntity
            .findOne({ _id: groupTaskId, activeStatus: ActiveStatus.active })
            .populate({
                path: 'tasks',
                match: { activeStatus: ActiveStatus.active }
            });
    }

    async findDefaultGroupTaskByProjectId(projectId: string): Promise<IGroupTaskEntity[]> {
        return await ProjectEntity.find({ projectId: projectId, activeStatus: ActiveStatus.active, isDefault: BooleanStatus.true })
    }

    async checkExitedTask(taskId: string, groupTaskId: string): Promise<boolean> {
        const groupTask = await GroupTaskEntity.findOne({ _id: groupTaskId });
        return groupTask?.tasks.includes(taskId) ? true : false;
    }

    async findGroupTaskByTaskId(taskId: string): Promise<IGroupTaskEntity | null> {
        return await GroupTaskEntity.findOne({ tasks: taskId });
    }

    async updateGroupTaskTag(taskId: string, tag: string): Promise<IGroupTaskEntity | null> {
        await GroupTaskEntity.updateOne({ tasks: taskId }, { $set: { tag: tag } });
        return await GroupTaskEntity.findOne({ tasks: taskId });
    }
}

export const groupTaskRepository = new GroupTaskRepository();