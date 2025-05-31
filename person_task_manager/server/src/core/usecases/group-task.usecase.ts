import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { GROUP_TASK_NOT_FOUND } from "../domain/constants/error.constant";
import { groupTaskService } from "../services/group-task.service";
import { groupTaskValidation } from "../validations/group-task.validation";

class GroupTaskUsecase {
    constructor(
        public groupTaskValidationImpl = groupTaskValidation,
        public groupTaskServiceImpl = groupTaskService,
    ) { }

    async calculateCompletedTasks(groupTaskId: string): Promise<IResponse> {
        try {
            if (!await this.groupTaskValidationImpl.checkExistedGroupTaskById(groupTaskId)) {
                return msg400(GROUP_TASK_NOT_FOUND);
            }
            const groupTask = await this.groupTaskServiceImpl.getGroupTask(groupTaskId);
            if (groupTask === null) {
                return msg400(GROUP_TASK_NOT_FOUND);
            }
            return await this.groupTaskServiceImpl.calculateCompletedTasks(groupTask);
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getGroupTask(groupTaskId: string): Promise<IResponse> {
        const groupTask = await this.groupTaskServiceImpl.getGroupTask(groupTaskId);
        return msg200({
            groupTask,
        });
    }

    async createGroupTaskToProject(groupTask: any, projectId: string): Promise<IResponse> {
        try {
            const createdGroupTask = await this.groupTaskServiceImpl.createGroupTaskToProject(groupTask, projectId);
            if (typeof createdGroupTask === "string") {
                return msg400(createdGroupTask);
            }
            return msg200({
                message: (createdGroupTask as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }
}

export const groupTaskUsecase = new GroupTaskUsecase();