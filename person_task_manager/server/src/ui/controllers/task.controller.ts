import { Request, NextFunction } from "express";
import { IResponse } from "../../core/common/response";
import { taskService } from "../../core/services/task.service";
import { plainToInstance } from "class-transformer";
import { TaskRequestDto, UpdateTaskInDialogDTO, UpdateTaskRequestDto } from "../../core/domain/dtos/task.dto";
import { groupTaskService } from "../../core/services/group-task.service";
import { EXCEPTION_PREFIX, GROUP_TASK_EXCEPTION, GROUP_TASK_NOT_FOUND, PROJECT_NOT_FOUND } from "../../core/domain/constants/error.constant";
import { taskUsecase } from "../../core/usecases/task.usecase";
import { CRUDType, IsPrivateRoute } from "../../core/domain/enums/enums";
import { GetGroupTaskProject } from "../../core/domain/dtos/request_dtos/get-group-task-project.dto";

class TaskController {
    constructor() {}

    async getAllTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            return await taskService.getAllTasks();
        } catch (err) {
            next(err);
        }
    }

    async getTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskService.getTask(taskId);
        } catch (err) {
            next(err);
        }
    }

    async getTasksByGroupTaskId(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            return await taskService.getTaskDashboard(groupTaskId);
        } catch (err) {
            next(err);
        }
    }

    async createTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;

            const createTaskObjectDto = plainToInstance(TaskRequestDto, bodyJson);
            const groupTaskId = bodyJson.groupTaskId;

            return await taskUsecase.createTaskInGroupTask(createTaskObjectDto, groupTaskId, IsPrivateRoute.PUBLIC);
        } catch (err) {
            next(err);
        }
    }

    async createPrivateTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;
            const createTaskObjectDto = plainToInstance(TaskRequestDto, bodyJson);
            const groupTaskId = bodyJson.groupTaskId;
            
            return await taskUsecase.createTaskInGroupTask(createTaskObjectDto, groupTaskId, IsPrivateRoute.PRIVATE);
        } catch (err) {
            next(err);
        }
    }

    async createScheduleTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const task = req.body.task;
            const scheduleGroup = req.body.scheduleGroup;
            const ownerId = req.body.ownerId;
            return await taskUsecase.createScheduleTask(task, scheduleGroup, ownerId);
        } catch (err) {
            next(err);
        }
    }

    async generateTaskWithoutGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;
            const projectId = bodyJson.projectId;
            const task = plainToInstance(TaskRequestDto, bodyJson)
            
            // generate new group task contains created task
            let groupTask = {
                title: task.title,
                description: task.description,
                status: task.status,
                ordinalNumber: 1,
                projectId: projectId
            }

            let groupTaskCreated;
            if (projectId) {
                groupTaskCreated = await groupTaskService.createGroupTaskFromTask(groupTask, projectId);
            } else {
                next(new Error(PROJECT_NOT_FOUND));
            }
            
            if (groupTaskCreated !== undefined) {
                return await taskUsecase.createTaskInGroupTask(task, groupTaskCreated, IsPrivateRoute.PUBLIC);
            }
            return undefined;
        } catch (err) {
            next(err);
        }
    }

    async updateTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;
            const taskId = req.params.id;

            const updateTaskObjectDto = plainToInstance(UpdateTaskRequestDto, bodyJson);
            return await taskUsecase.updateTask(taskId, updateTaskObjectDto, CRUDType.UPDATE_TYPE);
        } catch (err) {
            next(err);
        }
    }

    async updateTaskInDialog(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;
            const taskId = req.params.id;
            const task = plainToInstance(UpdateTaskInDialogDTO, bodyJson);
            
            return await taskUsecase.updateTask(taskId, task, CRUDType.UPDATE_DIALOG_TYPE);
        } catch (err) {
            next(err);
        }
    }

    async deleteTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            const groupTaskFindByTaskId = await groupTaskService.getGroupTaskByTaskId(taskId);
            if (groupTaskFindByTaskId === EXCEPTION_PREFIX+GROUP_TASK_EXCEPTION || groupTaskFindByTaskId === GROUP_TASK_NOT_FOUND) {
                next(new Error(GROUP_TASK_NOT_FOUND));
            }
            return await taskService.deleteTask(taskId, groupTaskFindByTaskId);
        } catch (err) {
            next(err);
        }
    }

    async deleteScheduleTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskUsecase.deleteScheduleTask(taskId);
        } catch (err) {
            next(err);
        }
    } 

    async getSubTasksByTaskId(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskService.getSubTasksInTask(taskId);
        } catch (err) {
            next(err);
        }
    }

    async getCommentsByTaskId(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskService.getCommentsInTask(taskId);
        } catch (err) {
            next(err);
        }
    } 

    async moveTaskToAnotherGroupTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const bodyJson = req.body;
            const taskId = req.params.id;
            const oldGroupTaskId = bodyJson.oldGroupTaskId;
            const newGroupTaskId = bodyJson.newGroupTaskId;

            return await taskService.moveTask(taskId, oldGroupTaskId, newGroupTaskId);
        } catch (err) {
            next(err);
        }
    }

    async archiveTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskService.archiveTask(taskId);
        } catch (err) {
            next(err);
        }
    }

    async enableTask(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskService.enableTask(taskId);
        } catch (err) {
            next(err);
        }
    }

    async getGroupTaskAndProject(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            const bodyJson = req.body;
            const getGroupTaskProjectDto = plainToInstance(GetGroupTaskProject, bodyJson);

            return await taskUsecase.getGroupTaskAndProject(taskId, getGroupTaskProjectDto);
        } catch (err) {
            next(err);
        }
    }

    async getTaskTableByGroupTaskId(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const groupTaskId = req.params.id;
            const tasksResult = await taskUsecase.getTaskTableByGroupTaskId(groupTaskId);

            return tasksResult;
        } catch (err) {
            next(err);
        }
    }

    async getTaskDetail(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const request = req.body;
            return await taskUsecase.getTaskDetail(request);
        } catch (err) {
            next(err);
        }
    }

    async getProjectByTaskId(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const taskId = req.params.id;
            return await taskUsecase.getProjectByTaskId(taskId);
        } catch (err) {
            next(err);
        }
    }

    async getDoneTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId: number = Number(req.params.userId);
            const timeUnit: string = String(req.query.timeUnit);
            return await taskUsecase.getDoneTasks(userId, timeUnit);
        }
        catch (err) {
            next(err);
        }
    }

    async getNotDoneTasks(req: Request, next: NextFunction): Promise<IResponse | undefined> {
        try {
            const userId: number = Number(req.query.id);
            const timeUnit: string = String(req.query.timeUnit); 
            return await taskUsecase.getNotDoneTasks(userId, timeUnit);
        } catch (err) {
            next(err);
        }
    }
}

export const taskController = new TaskController();