import { NextFunction, Request } from "express";
import { projectService } from "../../core/services/project.service";
import { IResponse } from "../../core/common/response";
import { plainToInstance } from "class-transformer";
import { ProjectRequestDto } from "../../core/domain/dtos/project.dto";

class ProjectController {

    constructor() { }
    
    async listAllProjects(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            return await projectService.getAllProjects(userId);
        } catch (err) {
            next(err);
        }
    }

    async getProjectById(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.getProject(id);
        } catch (err) {
            next(err);
        }
    }

    async createProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const createProjectObjectDto = plainToInstance(ProjectRequestDto, req.body);
            return await projectService.createProject(createProjectObjectDto);
        } catch (err) {
            next(err);
        }
    }

    async updateProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            const updateProjectObjectDto = plainToInstance(ProjectRequestDto, req.body);
            return await projectService.updateProject(id, updateProjectObjectDto);
        } catch (err) {
            next(err);
        }
    }

    async deleteProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.deleteProject(id);
        } catch (err) {
            next(err);
        }
    }

    async getGroupTasksInProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.getGroupTasksInProject(id);
        } catch (err) {
            next(err);
        }
    }

    async getProjectsWithGroupTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId = Number(req.params.userId);
            return await projectService.getProjectsWithGroupTasks(userId);
        } catch (err) {
            next(err);
        }
    }

    async updateProjectName(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.updateProjectName(id, req.body.name);
        } catch (err) {
            next(err);
        }
    }

    async updateProjectColor(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.updateProjectColor(id, req.body.color);
        } catch (err) {
            next(err);
        }
    }

    async archiveProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.archiveProject(id);
        } catch (err) {
            next(err);
        }
    }

    async enableProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const id = req.params.id;
            return await projectService.enableProject(id);
        } catch (err) {
            next(err);
        }
    }
}

export const projectController = new ProjectController();
