import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { TaskDetailRequestDTO, TaskRequestDto } from "../domain/dtos/task.dto";
import { CRUDType, IsPrivateRoute, TaskDetail, TimeUnit } from "../domain/enums/enums";
import { taskService } from "../services/task.service";
import { buildCommonStringValue, isStringEmpty } from "../../kernel/util/string-utils";
import { GetGroupTaskProject } from "../domain/dtos/request_dtos/get-group-task-project.dto";
import { projectService } from "../services/project.service";
import { groupTaskService } from "../services/group-task.service";
import { scheduleTaskMapper } from "../port/mapper/schedule-task.mappter";
import { BAD_REQUEST, TASK_NOT_FOUND } from "../domain/constants/error.constant";

class TaskUsecase {
    constructor() { }

    async createTaskInGroupTask(task: TaskRequestDto, groupTaskId: string | undefined, isPrivate: IsPrivateRoute): Promise<IResponse> {
        try {
            // validate
            if (groupTaskId === undefined) return msg400('Group task not found');
            // convert
            if (task.priority) {
                task.priority = task.priority.map((item) => buildCommonStringValue(item.toString()));
            }
            const createdTask = await taskService.createTaskInGroupTask(task, groupTaskId);
            const taskResult = await taskService.handleAfterCreateTask(createdTask, groupTaskId);
            if (typeof taskResult === 'string') {
                return msg400(taskResult);
            }
            
            if (isPrivate === IsPrivateRoute.PUBLIC) {
                await taskService.pushKafkaToCreateTask(createdTask, groupTaskId);
            }
            return msg200({
                message: taskResult
            })
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async updateTask(taskId: string, updateTaskObjectDto: any, type: CRUDType): Promise<IResponse | undefined> {
        try {
            if (type === CRUDType.UPDATE_TYPE) {
                const taskResult = await taskService.updateTask(taskId, updateTaskObjectDto);
                return taskResult;
            }
            if (type === CRUDType.UPDATE_DIALOG_TYPE) {
                const taskResult = await taskService.updateTaskInDialog(taskId, updateTaskObjectDto);
                return taskResult;
            }
            return msg400('Invalid update type');
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getGroupTaskAndProject(taskId: string, groupTaskProjectObj: GetGroupTaskProject): Promise<IResponse> {
        try {
            // Check project existed by name
            const closestProject = await projectService.getProjectByName(groupTaskProjectObj.userId, groupTaskProjectObj.project);
            if (!closestProject) return msg400('Project not found');
            // Check project existed by name
            const closestGroupTask = await groupTaskService.getGroupTaskByName(closestProject, groupTaskProjectObj.groupTask);
            if (closestGroupTask === undefined) return msg400('Group task not found');
            // Verify taskId in groupTask in project
            const taskInGroupTask = await taskService.checkExistedTask(taskId, closestGroupTask);
            if (taskInGroupTask === true) {
                const mapGetGroupTaskProject = {
                    groupTaskId: closestGroupTask._id,
                    groupTaskName: closestGroupTask.title,
                    projectId: closestProject._id,
                    projectName: closestProject.name
                }
                return msg200(mapGetGroupTaskProject);
            }
            return msg400('Task not existed in group task');
        } catch (err: any) {
            console.log("Could not get group task and project: ", err);
            return msg400(err.message.toString());
        }
    }

    async getTaskTableByGroupTaskId(groupTaskId: string): Promise<IResponse> {
        try {
            const tasksResult = await taskService.getTaskTable(groupTaskId);
            return tasksResult;
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getTaskDetail(request: TaskDetailRequestDTO): Promise<IResponse> {
        try {
            console.log("Request: ", request);
            let taskDetail;
            let groupTask;
            let project;

            if (request.taskDetailType === TaskDetail.TASK_MANGER) {
                if (!request.taskId) return msg400('Task id is required');
                taskDetail = await taskService.getTaskDetail(request.taskId, null);
                if (!taskDetail) return msg400('Task detail not found');
                groupTask = await groupTaskService.getGroupTaskObjectByTaskId(request.taskId);
            } else if (request.taskDetailType === TaskDetail.SCHEDULE_PLAN) {
                if (!request.scheduleTaskId) return msg400('Schedule task id is required');
                taskDetail = await taskService.getTaskDetail(null, request.scheduleTaskId);
                if (!taskDetail) return msg400('Task detail not found');
                groupTask = await groupTaskService.getGroupTaskObjectByTaskId(taskDetail.taskId);
            } else {
                return msg400('Invalid task detail type');
            }

            if (!groupTask) return msg400('Group task not found');
            project = await projectService.findProjectByGroupTaskId(groupTask._id);
            if (!project) return msg400('Project not found');
            console.log("Project: ", project.ownerId, "UserId: ", request.userId);
            if (project.ownerId !== request.userId) return msg400('Unauthorized');

            const response = { taskDetail, groupTask, project };
            return msg200({ response });

        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getProjectByTaskId(taskId: string): Promise<IResponse> {
        try {
            const groupTask = await groupTaskService.getGroupTaskObjectByTaskId(taskId);
            if (!groupTask) return msg400('Group task not found');
            const project = await projectService.findProjectByGroupTaskId(groupTask._id);
            if (!project) return msg400('Project not found');
            return msg200(project);
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async createScheduleTask(scheduleTask: any, scheduleGroup: any, ownerId: number): Promise<IResponse> {
        try {
            // validate
            const project = await this.handleProjectWhenCreatScheduleTask(scheduleGroup, ownerId);
            if (project == null) return msg400('Error when create project for schedule task');

            const groupTask = await this.handleGroupTaskWhenCreateScheduletask(scheduleGroup, project.data.project.id);
            if (groupTask == null) return msg400('Error when create group task for schedule task');

            const groupTaskId = groupTask.id;
            const task = scheduleTaskMapper.mapTask(scheduleTask, ownerId);
            const createdTask = await taskService.createTaskInGroupTask(task, groupTaskId);
            const taskResult = await taskService.handleAfterCreateTask(createdTask, groupTaskId)
            if (typeof taskResult === 'string') {
                return msg400(taskResult);
            }
            const response = {
                task: taskResult,
                groupTaskId: groupTaskId,
                projectId: project.data.project.id,
            }
            console.log("Created schedule task response: ", response);
            return msg200(response);
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    private async handleProjectWhenCreatScheduleTask(scheduleGroup: any, ownerId: number): Promise<any | null> {
        let project;
        if (isStringEmpty(scheduleGroup.projectId)) {
            const mappedProject = scheduleTaskMapper.mapProject(scheduleGroup, ownerId);
            project = await projectService.createProject(mappedProject);
        } else {
            project = await projectService.getProject(scheduleGroup.projectId);
        }
        if (!project) return null;
        console.log("Project: ", project);
        return project;
    }

    private async handleGroupTaskWhenCreateScheduletask(scheduleGroup: any, projectId: string): Promise<any | null> {
        let groupTask;
        if (isStringEmpty(scheduleGroup.groupTaskId)) {
            const mappedGrouPTask = scheduleTaskMapper.mapGroupTask(scheduleGroup, projectId)
            groupTask = await groupTaskService.createGroupTaskToProject(mappedGrouPTask, projectId);
            if (typeof groupTask === 'string') {
                console.log("Error when create group task: ", groupTask);
                throw new Error(groupTask);
            }
        } else {
            groupTask = await groupTaskService.getGroupTask(scheduleGroup.groupTaskId);
        }
        console.log("Group task: ", groupTask);
        return groupTask;
    }

    async deleteScheduleTask(taskId: string): Promise<IResponse> {
        try {
            const groupTask = await groupTaskService.getGroupTaskObjectByTaskId(taskId);
            if (!groupTask) {
                return msg400('Group task not found');
            }

            if (groupTask.tasks.length > 1) {
                await taskService.deleteTask(taskId, groupTask._id);
                return msg200({ message: 'Delete task successfully' });
            }

            const project = await projectService.findProjectByGroupTaskId(groupTask._id);
            if (!project) {
                return msg400('Project not found');
            }

            if (project.groupTasks.length === 1) {
                await projectService.deleteProject(project._id);
                return msg200({ message: 'Delete project successfully' });
            }

            await groupTaskService.deleteGroupTask(groupTask._id, project._id);
            return msg200({ message: 'Delete task successfully' });

        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getDoneTasksOverview(userId: number): Promise<IResponse> {
        try {
            const timeUnit = TimeUnit.WEEK;
            const doneTasks = await taskService.getDoneTasks(userId, timeUnit);
            if (doneTasks === null) {
                return msg400(TASK_NOT_FOUND)
            }

            const result = await groupTaskService.returnDoneTasksDashboard(doneTasks);
            if (result === null) {
                return msg400(BAD_REQUEST)
            }
            return msg200({data: result});  
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getDoneTasks(userId: number, timeUnit: string): Promise<IResponse> {
        try {
            const doneTasks = await taskService.getDoneTasks(userId, timeUnit);
            if (doneTasks === null) {
                return msg400(TASK_NOT_FOUND)
            }
            return msg200({data: doneTasks});  
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }

    async getNotDoneTasks(userId: number, timeUnit: string): Promise<IResponse> {
        try {
            const notDoneTasks = await taskService.getNotDoneTasks(userId, timeUnit);
            if (notDoneTasks === null) {
                return msg400(TASK_NOT_FOUND)
            }
            return msg200({data: notDoneTasks});  
        } catch (err: any) {
            return msg400(err.message.toString());
        }
    }
}

export const taskUsecase = new TaskUsecase();
