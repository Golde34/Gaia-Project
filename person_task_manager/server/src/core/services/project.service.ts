import { authServiceAdapter } from "../../infrastructure/client/auth-service.adapter";
import CacheSingleton from "../../infrastructure/internal-cache/cache-singleton";
import { levenshteinDistanceProject } from "../../kernel/util/levenshtein-algo";
import { returnInternalServiceErrorResponse } from "../../kernel/util/return-result";
import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { InternalCacheConstants } from "../domain/constants/constants";
import { EXCEPTION_PREFIX, PROJECT_EXCEPTION, PROJECT_NOT_FOUND } from "../domain/constants/error.constant";
import { IProjectEntity } from "../domain/entities/project.entity";
import { ActiveStatus, BooleanStatus, Status, TimeUnit } from "../domain/enums/enums";
import { projectStore } from "../port/store/project.store";
import { projectValidation } from "../validations/project.validation";
import { groupTaskService } from "./group-task.service";

const projectValidationImpl = projectValidation;

class ProjectService {
    constructor(
        private projectCache = CacheSingleton.getInstance().getCache()
    ) { }

    // Add Authen mechanism and try catch
    async createProject(project: any): Promise<IResponse> {
        if (project.color == null || project.color == "") {
            project.color = "indigo";
        }
        if (project.activeStatus == null || project.activeStatus === "") {
            project.activeStatus = ActiveStatus.active;
        }

        const defaultProject = await projectStore.checkDefaultProject(project.ownerId);
        if (defaultProject === null) {
            console.log("User does not have default project");
            project.isDefault = BooleanStatus.true;
        }

        const createProject = await projectStore.createProject(project);
        this.clearProjectCache(project.ownerId);

        return msg200({
            project: (createProject as any)
        });
    }

    async clearProjectCache(userId: number): Promise<void> {
        this.projectCache.clear(InternalCacheConstants.TASK_LIST + userId);
    }

    async updateProject(projectId: string, project: any): Promise<IResponse> {
        try {
            const existedProject = await projectValidationImpl.checkExistedProjectById(projectId);
            if (existedProject !== null) {
                const updateProject = await projectStore.updateOneProject(projectId, project);
                this.projectCache.clear(InternalCacheConstants.TASK_LIST + existedProject.ownerId);
                return msg200({
                    message: JSON.stringify(updateProject)
                });
            } else {
                return msg400("Project not found");
            }
        } catch (err: any) {
            return msg400(err.message.toString())
        }
    }

    async deleteProject(projectId: string): Promise<IResponse> {
        try {
            const existedProject = await projectValidationImpl.checkExistedProjectById(projectId);
            if (existedProject !== null) {

                // delete all group tasks in project
                const groupTasks = await projectStore.findOneProjectWithGroupTasks(projectId);
                if (groupTasks !== null) {
                    for (let i = 0; i < groupTasks.groupTasks.length; i++) {
                        await groupTaskService.deleteGroupTask(groupTasks.groupTasks[i], projectId);
                    }
                }

                const deleteProject = await projectStore.deleteOneProject(projectId);

                this.projectCache.clear(InternalCacheConstants.TASK_LIST + existedProject.ownerId);
                return msg200({
                    message: JSON.stringify(deleteProject)
                });
            } else {
                return msg400("Project not found");
            }
        } catch (err: any) {
            return msg400(err.message.toString())
        }
    }

    async getProject(projectId: string): Promise<IResponse> {
        const project = await projectStore.findOneProjectById(projectId);

        return msg200({
            project
        });
    }

    async getAllProjects(userId: number): Promise<IResponse> {
        try {
            const cacheProjects = this.projectCache.get(InternalCacheConstants.TASK_LIST + userId);
            if (cacheProjects !== undefined) {
                console.log('Returning cached all projects of userId: ', userId);
                return msg200({
                    projects: cacheProjects
                });
            }

            const projects = await projectStore.findAllProjectsByOwnerId(userId);
            this.projectCache.setKeyWithExpiry(InternalCacheConstants.TASK_LIST + userId, projects, 5, TimeUnit.MINUTE);
            return msg200({
                projects
            });
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getGroupTasksInProject(projectId: string): Promise<IResponse> {
        try {
            const groupTasksInProject = await projectStore.findAllActiveGroupTasksByProjectId(projectId);
            const groupTasks = groupTasksInProject?.groupTasks;

            return msg200({
                message: (groupTasks as any)
            });
        } catch (err: any) {
            return msg400(err.message.toString())
        }
    }

    async updateManyProjects(groupTaskId: string): Promise<IResponse> {
        const updateManyProjects = await projectStore.pullGroupTaskFromAllProjects(groupTaskId);

        return msg200({
            message: (updateManyProjects as any)
        });
    }

    async updateGroupTaskIdListInProject(projectId: string, groupTasks: string[]): Promise<IResponse> {
        const updateProject = await projectStore.updateGroupTaskIdListInProject(projectId, groupTasks);

        return msg200({
            message: (updateProject as any)
        });
    }

    async updateProjectName(projectId: string, name: string): Promise<IResponse> {
        try {
            const project = await projectValidationImpl.checkExistedProjectById(projectId);
            if (project !== null) {
                project.name = name;
                await projectStore.updateOneProject(projectId, project);
                this.clearProjectCache(project.ownerId);
                return msg200({
                    message: "Project name updated successfully"
                });
            }
            return msg400("Project not found");
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async updateProjectColor(projectId: string, color: string): Promise<IResponse> {
        try {
            const project = await projectValidationImpl.checkExistedProjectById(projectId);
            if (project !== null) {
                project.color = color;
                await projectStore.updateOneProject(projectId, project);
                this.clearProjectCache(project.ownerId);
                return msg200({
                    message: "Project name updated successfully"
                });
            }
            return msg400("Project not found");
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async archiveProject(projectId: string): Promise<IResponse | undefined> {
        try {
            const project = await projectStore.findOneActiveProjectById(projectId);
            if (project === null) {
                return msg400(PROJECT_NOT_FOUND);
            } else {
                await projectStore.archiveProject(projectId);
                return msg200({
                    message: "Project archived"
                });
            }
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async enableProject(projectId: string): Promise<IResponse | undefined> {
        try {
            const project = await projectStore.findOneInactiveProjectById(projectId);
            if (project === null) {
                return msg400(PROJECT_NOT_FOUND);
            }
            await projectStore.enableProject(projectId);
            return msg200({
                message: "Project enabled"
            });
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async checkExistedTasks(userId: number): Promise<IResponse> {
        try {
            const existedUser = await authServiceAdapter.checkExistedUser(userId);
            if (typeof existedUser === 'number') {
                return returnInternalServiceErrorResponse(existedUser, "Call auth service fail:")
            }

            const projects = await projectStore.findAllProjectsByOwnerId(userId);
            let isTaskExist: boolean;
            if (projects.length === 0) {
                isTaskExist = false;
            } else {
                isTaskExist = true;
            }
            return msg200({
                isTaskExist
            });
        } catch (err: any) {
            console.log("Could not check existed tasks: ", err);
            return msg400(err.message.toString());
        }
    }

    // MINI SERVICES

    async getProjectByGroupTaskId(groupTaskId: string): Promise<string> {
        try {
            const project = await projectStore.findOneProjectByGroupTaskId(groupTaskId);
            if (project === null) {
                return PROJECT_NOT_FOUND;
            } else {
                return project._id;
            }
        } catch (err: any) {
            return EXCEPTION_PREFIX + PROJECT_EXCEPTION
        }
    }

    async getProjectByName(userId: number, projectName: string): Promise<IProjectEntity | null | undefined> {
        try {
            let project: IProjectEntity | null;
            if (projectName.toLocaleLowerCase().toString() === 'default'
                || projectName === null || projectName === undefined) {
                project = await projectStore.checkDefaultProject(userId);
                if (project === null) {
                    console.log(`Project default not found`);
                    const createdProject = await this.createProject({
                        name: "Default",
                        status: Status.inProgress,
                        ownerId: userId,
                        isDefault: BooleanStatus.true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    project = createdProject.data.project; 
                }
            } else {
                const projects = await projectStore.findAllProjectsByOwnerId(userId);
                project = levenshteinDistanceProject(projectName, projects);
                if (project === null) {
                    console.log(`Project ${projectName} not found`);
                    return undefined;
                }
                console.log(`Project ${project.name} found from projectName: ${projectName}`);
            }
            return project;
        } catch (err: any) {
            console.log("Could not get project by name: ", err);
            return undefined;
        }
    }

    async findProjectsByUserId(userId: number): Promise<IProjectEntity[]> {
        try {
            const projects = await projectStore.findAllProjectsByOwnerId(userId);
            return projects;
        } catch (err: any) {
            console.log("Could not find projects by user id: ", err);
            return [];
        }
    }

    async findProjectByGroupTaskId(groupTaskId: string): Promise<IProjectEntity | undefined> {
        try {
            const project = await projectStore.findOneProjectByGroupTaskId(groupTaskId);
            if (project === null) return undefined;
            return project;
        } catch (err: any) {
            console.log("Could not find project by group task id: ", err);
            return undefined;
        }
    }

    async updateProjectTag(groupTask: any, tag: string): Promise<void> {
        try {
            const updatedProject = await projectStore.updateProjectTag(groupTask._id, tag);
            if (updatedProject === undefined) {
                console.log("Project has already had this tag");
                return;
            }
        } catch (error) {
            console.log("An error occurred white update project tag: ", error);
            throw error;
        }
    }
}

export const projectService = new ProjectService();