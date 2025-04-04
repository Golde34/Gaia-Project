import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { TaskDetailRequestDTO, TaskRequestDto } from "../domain/dtos/task.dto";
import { CRUDType, IsPrivateRoute, TaskDetail } from "../domain/enums/enums";
import { taskService } from "../services/task.service";
import { buildCommonStringValue } from "../../kernel/util/string-utils";
import { GetGroupTaskProject } from "../domain/dtos/request_dtos/get-group-task-project.dto";
import { projectService } from "../services/project.service";
import { groupTaskService } from "../services/group-task.service";

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
            if (isPrivate === IsPrivateRoute.PUBLIC) {
                await taskService.pushKafkaToCreateTask(createdTask, groupTaskId);
            }
            return taskResult;
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
            if (closestProject === undefined) return msg400('Project not found');
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

    async createScheduleTask(scheduletask)
}

export const taskUsecase = new TaskUsecase();