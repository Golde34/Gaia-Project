import { NextFunction, Request, Response, Router } from "express";
import { RequestValidator } from "../../core/common/error-handler";
import { ProjectRequestDto, UpdateColorDto } from "../../core/domain/dtos/project.dto";
import { updateNameRequestDto } from "../../core/domain/dtos/request_dtos/update-name-request.dto";
import { projectController } from "../controllers/project.controller";
import { ARCHIVE_PROJECT_FAILED, CREATE_PROJECT_FAILED, DELETE_PROJECT_FAILED, ENABLE_PROJECT_FAILED, GROUP_TASK_NOT_FOUND, PROJECT_NOT_FOUND, PROJECT_NO_RECORDS, UPDATE_PROJECT_FAILED } from "../../core/domain/constants/error.constant";
import { returnResult } from "../../kernel/util/return-result";

export const projectRouter = Router();

const projectControllerImpl = projectController;

// list all projects of the user
projectRouter.get("/all/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.listAllProjects(req, next);
        return returnResult(projectResult, PROJECT_NO_RECORDS, res, next);
    }
    catch (err) {
        next(err);
    }    
});

// list all projects with group tasks of the user
projectRouter.get("/group-task/:userId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.getProjectsWithGroupTasks(req, next);
        return returnResult(projectResult, PROJECT_NO_RECORDS, res, next);
    } catch (err) {
        next(err);
    }
});

// get one project
projectRouter.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.getProjectById(req, next);
        return returnResult(projectResult, PROJECT_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});

// create new project
projectRouter.post("/create", 
    RequestValidator.validateV2(ProjectRequestDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.createProject(req, next);
        return returnResult(projectResult, CREATE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});

// update project
projectRouter.put("/:id",
    RequestValidator.validateV2(ProjectRequestDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.updateProject(req, next);
        return returnResult(projectResult, UPDATE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});

// delete project
projectRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.deleteProject(req, next);
        return returnResult(projectResult, DELETE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});

// get all group tasks of a project
projectRouter.get("/:id/group-tasks", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.getGroupTasksInProject(req, next);
        return returnResult(projectResult, GROUP_TASK_NOT_FOUND, res, next);
    } catch (err) {
        next(err);
    }
});

// update Project name
projectRouter.put("/:id/update-name", 
    RequestValidator.validateV2(updateNameRequestDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projecResult = await projectControllerImpl.updateProjectName(req, next);
        return returnResult(projecResult, UPDATE_PROJECT_FAILED, res, next);
    }
    catch (err) {
        next(err);
    }
});

// update Project color
projectRouter.put("/:id/update-color",
    RequestValidator.validateV2(UpdateColorDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projecResult = await projectControllerImpl.updateProjectColor(req, next);
        return returnResult(projecResult, UPDATE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});

// archive project 
projectRouter.put("/:id/archive", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.archiveProject(req, next);
        return returnResult(projectResult, ARCHIVE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});

// enable project
projectRouter.put("/:id/enable", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectResult = await projectControllerImpl.enableProject(req, next);
        return returnResult(projectResult, ENABLE_PROJECT_FAILED, res, next);
    } catch (err) {
        next(err);
    }
});
