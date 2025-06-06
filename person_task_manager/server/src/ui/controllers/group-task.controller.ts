import { NextFunction, Request } from "express";
import { groupTaskService } from "../../core/services/group-task.service";
import { IResponse } from "../../core/common/response";
import { plainToInstance } from "class-transformer";
import { GroupTaskRequestDto } from "../../core/domain/dtos/group-task.dto";
import { projectService } from "../../core/services/project.service";
import { EXCEPTION_PREFIX, PROJECT_EXCEPTION, PROJECT_NOT_FOUND } from "../../core/domain/constants/error.constant";
import { groupTaskUsecase } from "../../core/usecases/group-task.usecase";

class GroupTaskController {

    constructor() {}

    async getGrouptaskById(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const groupTaskResult = await groupTaskUsecase.getGroupTask(groupTaskId);
            
            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async createGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;

            const createGroupTaskObjectDto = plainToInstance(GroupTaskRequestDto, bodyJson);
            const projectId = bodyJson.projectId;
            const groupTaskResult = await groupTaskUsecase.createGroupTaskToProject(createGroupTaskObjectDto, projectId);
           
            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async updateGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;

            const groupTaskId = req.params.id;
            const groupTask = plainToInstance(GroupTaskRequestDto, bodyJson);
            const groupTaskResult = await groupTaskService.updateGroupTask(groupTaskId, groupTask);
            
            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async deleteGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const projectFindByGroupTaskId = await projectService.getProjectByGroupTaskId(groupTaskId);
            if (projectFindByGroupTaskId === PROJECT_NOT_FOUND || projectFindByGroupTaskId === EXCEPTION_PREFIX+PROJECT_EXCEPTION) {
                next(new Error(PROJECT_NOT_FOUND));
            }
            const groupTaskResult = await groupTaskService.deleteGroupTask(groupTaskId, projectFindByGroupTaskId);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    } 

    async updateGroupTaskName(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const groupTaskResult = await groupTaskService.updateGroupTaskName(groupTaskId, req.body.name);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async calculateCompletedTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const totalTasksResult = await groupTaskUsecase.calculateCompletedTasks(groupTaskId);

            return totalTasksResult;
        } catch (err) {
            next(err);
        }
    }

    async updateOrdinalNumber(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;

            const groupTaskId = req.params.id;
            const projectId = bodyJson.projectId;
            const groupTaskResult = await groupTaskService.updateOrdinalNumber(projectId, groupTaskId);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async archiveGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const groupTaskResult = await groupTaskService.archiveGroupTask(groupTaskId);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async enableGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const groupTaskResult = await groupTaskService.enableGroupTask(groupTaskId);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }

    async findGroupTaskByName(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            // get params in header
            const groupName = req.query.name as string;
            const userId = req.query.userId as string;
            const project = req.query.project as string;
            const groupTaskResult = await groupTaskService.findGroupTaskByName(groupName, userId, project);

            return groupTaskResult;
        } catch (err) {
            next(err);
        }
    }


}

export const groupTaskController = new GroupTaskController();