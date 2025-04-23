import { GaiaCreateTaskDto } from "../domain/dtos/request_dtos/gaia-create-task.dto";
import { chatHubAdapterService } from "../services/chat-hub-adapter.service";
import { groupTaskService } from "../services/group-task.service";
import { projectService } from "../services/project.service";
import { taskService } from "../services/task.service";

class GaiaHandleTasksUsecase {
    constructor(
        private projectServiceImpl = projectService,
        private groupTaskServiceImpl = groupTaskService,
        private taskServiceImpl = taskService,
        private chatHubAdapterServiceImpl = chatHubAdapterService,
    ) { }

    async createTask(task: GaiaCreateTaskDto): Promise<void> {
        const project = await this.projectServiceImpl.getProjectByName(task.userId, task.project);
        if (!project) {
            console.error(`Project ${task.project} not found`);
            return;
        }
        const groupTask = await this.groupTaskServiceImpl.getGroupTaskByName(project, task.groupTask);
        if (!groupTask) {
            console.error(`Group task ${task.groupTask} not found in project ${task.project}`);
            return;
        }

        const createdTask = await this.taskServiceImpl.createTaskInGroupTask(task, groupTask._id);
        await this.taskServiceImpl.handleAfterCreateTask(createdTask, groupTask._id);
        await this.chatHubAdapterServiceImpl.pushCreateTaskResultMessage(createdTask, project, groupTask, "createTask");
    }
}

export const gaiaHandleTasksUsecase = new GaiaHandleTasksUsecase();