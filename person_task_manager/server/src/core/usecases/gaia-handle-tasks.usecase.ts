import { GaiaCreateTaskDto } from "../domain/dtos/request_dtos/gaia-create-task.dto";
import { groupTaskService } from "../services/group-task.service";
import { projectService } from "../services/project.service";
import { taskService } from "../services/task.service";

class GaiaHandleTasksUsecase {
    constructor(
        public projectServiceImpl = projectService,
        public groupTaskServiceImpl = groupTaskService,
        public taskServiceImpl = taskService,
    ) { }

    async createTask(task: GaiaCreateTaskDto) {
        const project = await this.projectServiceImpl.getProjectByName(task.userId, task.Project);
        if (!project) {
            throw new Error(`Project ${task.Project} not found`);
        }
        const groupTask = await this.groupTaskServiceImpl.getGroupTaskByName(project, task.GroupTask);
        if (!groupTask) {
            throw new Error(`Group task ${task.GroupTask} not found`);
        }

        const taskData = {
            ...task,
            GroupTask: groupTask._id,
            Project: project._id,
        };
        return this.taskServiceImpl.createTaskInGroupTask(taskData, groupTask._id);
    }
}

export const gaiaHandleTasksUsecase = new GaiaHandleTasksUsecase();