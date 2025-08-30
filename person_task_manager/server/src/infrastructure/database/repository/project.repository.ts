import { DeleteResult } from "mongodb";
import { ProjectEntity } from "../model-repository/project.model";
import { UpdateWriteOpResult } from "mongoose";
import { ActiveStatus, BooleanStatus, Status } from "../../../core/domain/enums/enums";
import { IProjectEntity } from "../../../core/domain/entities/project.entity";

class ProjectRepository {
    constructor() { }

    async createProject(project: any): Promise<IProjectEntity> {
        return await ProjectEntity.create(project);
    }

    async updateOneProject(projectId: string, project: any): Promise<UpdateWriteOpResult> {
        return await ProjectEntity.updateOne({ _id: projectId }, project);
    }

    async deleteOneProject(projectId: string): Promise<DeleteResult> {
        return await ProjectEntity.deleteOne({ _id: projectId });
    }

    async findOneProjectById(projectId: string): Promise<IProjectEntity | null> {
        return await ProjectEntity.findOne({ _id: projectId });
    }

    async findOneProjectWithGroupTasks(projectId: string): Promise<IProjectEntity> {
        return await ProjectEntity
            .findOne({ _id: projectId, activeStatus: ActiveStatus.active })
            .select('groupTasks');
    }

    async findAllProjectsByOwnerId(ownerId: number): Promise<IProjectEntity[]> {
        return await ProjectEntity
            .find({ ownerId: ownerId, activeStatus: ActiveStatus.active });
    }

    async findAllActiveGroupTasksByProjectId(projectId: string): Promise<IProjectEntity | null> {
        return await ProjectEntity.findOne({ _id: projectId })
            .populate({
                path: 'groupTasks',
                match: { activeStatus: ActiveStatus.active },
            }).exec();
    }

    async pullGroupTaskFromAllProjects(groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await ProjectEntity
            .updateMany({ groupTasks: groupTaskId }, { $pull: { groupTasks: groupTaskId } });
    }

    async pullGrouptaskFromProject(projectId: string, groupTaskId: string): Promise<UpdateWriteOpResult> {
        return await ProjectEntity
            .updateOne({ _id: projectId }, { $pull: { groupTasks: groupTaskId } });
    }

    async updateGroupTaskIdListInProject(projectId: string, groupTasks: string[]): Promise<UpdateWriteOpResult> {
        return await ProjectEntity.updateOne({ _id: projectId }, { groupTasks: groupTasks });
    }

    async findOneActiveProjectById(projectId: string): Promise<IProjectEntity | null> {
        return await ProjectEntity
            .findOne({ _id: projectId, activeStatus: ActiveStatus.active });
    }

    async findOneInactiveProjectById(projectId: string): Promise<IProjectEntity | null> {
        return await ProjectEntity
            .findOne({ _id: projectId, activeStatus: ActiveStatus.inactive });
    }

    async findOneProjectByGroupTaskId(groupTaskId: string): Promise<IProjectEntity | null> {
        return await ProjectEntity.findOne({ groupTasks: groupTaskId })
    }

    async archiveProject(projectId: string): Promise<UpdateWriteOpResult> {
        return await ProjectEntity
            .updateOne({ _id: projectId },
                { activeStatus: ActiveStatus.inactive },
                { status: Status.archived });
    }

    async enableProject(projectId: string): Promise<UpdateWriteOpResult> {
        return await ProjectEntity
            .updateOne({ _id: projectId }, { activeStatus: ActiveStatus.active });
    }

    async findDefaultProjectByOwnerId(ownerId: number): Promise<IProjectEntity | null> {
        return await ProjectEntity
            .findOne({ ownerId: ownerId, activeStatus: ActiveStatus.active, isDefault: BooleanStatus.true });
    }

    async getOwnerIdByProjectId(projectId: string): Promise<number> {
        const project = await ProjectEntity.findOne({
            _id: projectId
        });
        return project?.ownerId ?? 0;
    }

    async updateProjectTag(groupTaskId: string, tag: string): Promise<UpdateWriteOpResult | undefined> {
        const project = await ProjectEntity.findOne({ groupTasks: groupTaskId });
        if (project !== null && project.tag.includes(tag)) {
            return undefined;
        }
        return await ProjectEntity.updateOne({ groupTasks: groupTaskId }, { $push: { tag: tag } });
    }
}

export const projectRepository = new ProjectRepository();