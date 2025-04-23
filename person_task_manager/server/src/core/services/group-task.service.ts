import CacheSingleton from "../../infrastructure/internal-cache/cache-singleton";
import { levenshteinDistanceGroupTasks, levenshteinDistanceProject } from "../../kernel/util/levenshtein-algo";
import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { InternalCacheConstants } from "../domain/constants/constants";
import { ARCHIVE_GROUP_TASK_FAILED, CREATE_GROUP_TASK_FAILED, ENABLE_GROUP_TASK_FAILED, EXCEPTION_PREFIX, GROUP_TASK_EXCEPTION, GROUP_TASK_NOT_FOUND, PROJECT_NOT_FOUND } from "../domain/constants/error.constant";
import { IGroupTaskEntity } from "../domain/entities/group-task.entity";
import { IProjectEntity } from "../domain/entities/project.entity";
import { ITaskEntity } from "../domain/entities/task.entity";
import { BooleanStatus } from "../domain/enums/enums";
import { groupTaskStore } from "../port/store/group-task.store";
import { projectStore } from "../port/store/project.store";
import { taskStore } from "../port/store/task.store";
import { groupTaskValidation } from "../validations/group-task.validation";
import { projectService } from "./project.service";
import { taskService } from "./task.service";

const projectServiceImpl = projectService;
const groupTaskValidationImpl = groupTaskValidation;

class GroupTaskService {
    constructor(
        public taskStoreImpl = taskStore,
        public groupTaskCache = CacheSingleton.getInstance().getCache()
    ) { }

    async createGroupTaskToProject(groupTask: any, projectId: string): Promise<IResponse> {
        try {
            // groupTask = await this.checkDefaultGroupTask(groupTask);
            groupTask.projectId = projectId;

            const createGroupTask = await groupTaskStore.createGroupTask(groupTask);
            const groupTaskId = (createGroupTask as any)._id;

            if (await groupTaskValidationImpl.checkExistedGroupTaskInProject(groupTaskId, projectId) === false) { // not exist
                projectServiceImpl.updateProject(projectId, { $push: { groupTasks: groupTaskId } });
                return msg200({
                    message: (createGroupTask as any)
                });
            } else {
                await groupTaskStore.deleteGroupTask(groupTaskId);
                return msg400(CREATE_GROUP_TASK_FAILED);
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async checkDefaultGroupTask(groupTask: any): Promise<IGroupTaskEntity> {
        const defaultGroupTask = await groupTaskStore.checkDefaultGroupTask(groupTask.projectId);
        if (defaultGroupTask.length === 0 || defaultGroupTask === null) {
            console.log("Project does not have default group task");
            groupTask.isDefault = BooleanStatus.true;
            return groupTask;
        }
        return groupTask;
    }

    // This fucntion does not response to client
    async createGroupTaskFromTask(groupTask: any, projectId: string): Promise<string | undefined> {
        try {
            // groupTask = await this.checkDefaultGroupTask(groupTask);
            groupTask.projectId = projectId;

            const createGroupTask = await groupTaskStore.createGroupTask(groupTask);
            const groupTaskId = (createGroupTask as any)._id;

            if (await groupTaskValidationImpl.checkExistedGroupTaskInProject(groupTaskId, projectId) === false) { // not exist
                projectServiceImpl.updateProject(projectId, { $push: { groupTasks: groupTaskId } });
                return groupTaskId;
            } else {
                return undefined;
            }
        } catch (error: any) {
            console.log(error.message.toString());
            return undefined;
        }
    }

    async updateGroupTask(groupTaskId: string, groupTask: any): Promise<IResponse> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {

                const updateGroupTask = await groupTaskStore.updateGroupTask(groupTaskId, groupTask);

                return msg200({
                    message: (updateGroupTask as any)
                });
            } else {
                return msg400(GROUP_TASK_NOT_FOUND);
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async deleteGroupTask(groupTaskId: string, projectId: string): Promise<IResponse> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {
                // delete all tasks in group task
                const tasks = await groupTaskStore.findGroupTaskWithTasks(groupTaskId);
                if (tasks !== null) {
                    for (let i = 0; i < tasks.tasks.length; i++) {
                        await taskService.deleteTask(tasks.tasks[i], groupTaskId);
                    }
                }
                const deleteGroupTask = await groupTaskStore.deleteGroupTask(groupTaskId);
                await projectStore.pullGrouptaskFromProject(projectId, groupTaskId);

                return msg200({
                    message: (deleteGroupTask as any)
                });
            } else {
                return msg400('Group task not found');
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getGroupTask(groupTaskId: string): Promise<IGroupTaskEntity | null> {
        try {
            const groupTaskCache = this.groupTaskCache.get(InternalCacheConstants.GROUP_TASK + groupTaskId)
            if (groupTaskCache) {
                console.log('Get groupTask from cache');
                return groupTaskCache; 
            }
            console.log('Get task table from database');
            const groupTask = await groupTaskStore.findGroupTaskById(groupTaskId);
            this.groupTaskCache.set(InternalCacheConstants.GROUP_TASK + groupTaskId, groupTask);
            return groupTask;
        } catch (error) {
            console.log();
            return null;
        }
    }

    async getGroupTaskByTaskId(taskId: string): Promise<string> {
        try {
            const groupTask = await groupTaskStore.findGroupTasksByTaskId(taskId);
            if (groupTask === null || groupTask === undefined) {
                return GROUP_TASK_NOT_FOUND;
            } else {
                return groupTask._id;
            }
        } catch (err: any) {
            console.log(err.message.toString());
            return EXCEPTION_PREFIX + GROUP_TASK_EXCEPTION;
        }
    }

    async getTasksInGroupTaskByTimestamp(groupTaskId: string, startDate: string, endDate: string): Promise<IResponse> {
        const startDateTimeStamp = new Date(startDate);
        const endDateTimeStamp = new Date(endDate);
        const getTasksInGroupTask = await groupTaskStore.findTasksInGrouptaskByTimeStamp(groupTaskId, startDateTimeStamp, endDateTimeStamp);
        const getTasks = getTasksInGroupTask?.tasks;

        return msg200({
            message: (getTasks as any)
        });
    }

    async updateManyTasksInGroupTask(taskId: string): Promise<IResponse> {
        const updateManyGroupTasks = await groupTaskStore.pullTaskFromGroupTask(taskId);

        return msg200({
            message: (updateManyGroupTasks as any)
        });
    }

    async updateGroupTaskName(groupTaskId: string, name: string): Promise<IResponse> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {
                const groupTask = await groupTaskStore.findGroupTaskById(groupTaskId);
                if (groupTask === null) {
                    return msg400(GROUP_TASK_NOT_FOUND);
                } else {
                    groupTask.title = name;
                    await groupTaskStore.updateGroupTask(groupTaskId, groupTask);
                    return msg200({
                        message: 'Group task name updated successfully'
                    });
                }
            }
            return msg400(GROUP_TASK_NOT_FOUND);
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async calculateCompletedTasks(groupTask: IGroupTaskEntity): Promise<IResponse> {
        const groupTaskCache = this.groupTaskCache.get(InternalCacheConstants.TASK_COMPLETED + groupTask._id);
        if (!groupTaskCache) {
            console.log("Calculate completed tasks");
            const totalTasks = groupTask.tasks.length;
            let completedTasks = 0;
            for (let i = 0; i < groupTask.tasks.length; i++) {
                const taskId = groupTask.tasks[i];
                const task = await this.taskStoreImpl.findTaskById(taskId);
                if (task !== null) {
                    if (task.status === 'DONE') {
                        completedTasks++;
                    }
                } else {
                    continue;
                }
            }
            groupTask.totalTasks = totalTasks;
            groupTask.completedTasks = completedTasks;
            await groupTaskStore.updateGroupTask(groupTask._id, groupTask);
            this.groupTaskCache.set(InternalCacheConstants.TASK_COMPLETED + groupTask._id, groupTask);
            return msg200({
                groupTask,
            });
        } else {
            console.log("Get list completed tasks from cache");
            return msg200({
                groupTask: groupTaskCache,
            });
        }
    }

    async updateOrdinalNumber(projectId: string, groupTaskId: string): Promise<IResponse> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {
                const project = await projectStore.findOneProjectById(projectId);
                if (project === null) {
                    return msg400(PROJECT_NOT_FOUND);
                } else {
                    const groupTasks = project.groupTasks;
                    const groupTaskIndex = groupTasks.indexOf(groupTaskId);
                    if (groupTaskIndex > -1) {
                        // Remove the group task from its current position
                        groupTasks.splice(groupTaskIndex, 1);
                        // Move the group task to the beginning of the array
                        groupTasks.unshift(groupTaskId);
                    }
                    projectServiceImpl.updateGroupTaskIdListInProject(projectId, groupTasks);
                    return msg200({
                        message: 'Ordinal number in group task updated successfully'
                    });
                }
            } else {
                return msg400(GROUP_TASK_NOT_FOUND);
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async archiveGroupTask(groupTaskId: string): Promise<IResponse | undefined> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {
                const groupTask = await groupTaskStore.findOneActiveGroupTaskById(groupTaskId);
                if (groupTask === null) {
                    return msg400(ARCHIVE_GROUP_TASK_FAILED);
                } else {
                    await groupTaskStore.archiveGroupTask(groupTaskId);
                    return msg200({
                        message: 'Group task archive'
                    });
                }
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async enableGroupTask(groupTaskId: string): Promise<IResponse | undefined> {
        try {
            if (await groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId) === true) {
                const groupTask = await groupTaskStore.findOneInactiveGroupTaskById(groupTaskId);
                if (groupTask === null) {
                    return msg400(ENABLE_GROUP_TASK_FAILED);
                } else {
                    await groupTaskStore.enableGroupTask(groupTaskId);
                    return msg200({
                        message: 'Group task enabled'
                    });
                }
            }
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async findGroupTaskByName(groupTaskTitle: string, userId: string, project: string): Promise<IResponse | undefined> {
        try {
            const userIdInt = parseInt(userId.valueOf());
            const userProjects = await projectStore.findAllProjectsByOwnerId(userIdInt);

            const foundedProject = levenshteinDistanceProject(project, userProjects);
            if (foundedProject === null) {
                return msg400(PROJECT_NOT_FOUND);
            }

            const groupTasks = await Promise.all(
                foundedProject.groupTasks.map(groupTaskId => groupTaskStore.findGroupTaskById(groupTaskId))
            );

            const foundedGroupTask = levenshteinDistanceGroupTasks(groupTaskTitle, groupTasks);
            if (foundedGroupTask === null) {
                return msg400(GROUP_TASK_NOT_FOUND);
            }

            return msg200({ message: foundedGroupTask });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getGroupTaskByName(project: IProjectEntity, groupTaskTitle: string): Promise<IGroupTaskEntity | undefined> {
        try {
            const groupTasks = await Promise.all(
                project.groupTasks.map(groupTaskId => groupTaskStore.findGroupTaskById(groupTaskId))
            );

            const foundedGroupTask = levenshteinDistanceGroupTasks(groupTaskTitle, groupTasks);
            if (foundedGroupTask === null) {
                return undefined;
            }

            return foundedGroupTask;
        } catch (error: any) {
            return undefined;
        }
    }

    async getGroupTaskObjectByTaskId(taskId: string): Promise<IGroupTaskEntity | undefined> {
        try {
            const groupTask = await groupTaskStore.findGroupTasksByTaskId(taskId);
            if (groupTask === null || groupTask === undefined) {
                return undefined;
            }
            return groupTask;
        } catch (error: any) {
            console.log(error.message.toString());
            return undefined;
        }
    }

    async returnDoneTasksDashboard(doneTasks: ITaskEntity[]): Promise<Record<string, any> | null> {
        try {
            const groupTaskMap = new Map<string, { count: number, groupTaskId: string }>();
            doneTasks.forEach((task: ITaskEntity) => {
                const groupId = task.groupTaskId.toString();
                if (groupTaskMap.has(groupId)) {
                    groupTaskMap.get(groupId)!.count++;
                } else {
                    groupTaskMap.set(groupId, { count: 1, groupTaskId: groupId });
                }
            });

            const groupTasks = await Promise.all(
                Array.from(groupTaskMap.keys()).map(async (groupTaskId) => {
                    const groupTask = await this.getGroupTask(groupTaskId)
                    return groupTask;
                })
            );

            const groupTaskLookup = new Map(
                groupTasks.filter(groupTask => groupTask !== null).map(groupTask => [groupTask!._id.toString(), groupTask!])
            );
            const result = Array.from(groupTaskMap.values()).map(group => {
                const groupTask = groupTaskLookup.get(group.groupTaskId);
                return {
                    ...group,
                    projectId: groupTask ? groupTask.projectId : null,
                    name: groupTask ? groupTask.title : null,
                };
            });

            return result;
        } catch (error) {
            console.log("An error occurred white get done task dashboard: ", error);
            return null;
        }
    }
}

export const groupTaskService = new GroupTaskService();