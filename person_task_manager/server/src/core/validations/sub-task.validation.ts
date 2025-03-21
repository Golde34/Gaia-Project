import { SubTaskEntity } from "../../infrastructure/database/model-repository/sub-task.model";
import { TaskEntity } from "../../infrastructure/database/model-repository/task.model";

export const subTaskValidation = {
    async checkExistedSubTaskBySubTaskId(subTaskId: string): Promise<boolean> {
        try {
            const existedSubTask = await SubTaskEntity.findOne({ _id: subTaskId }) != null
            return existedSubTask;
        } catch (error: any) {
            console.log(error.message.toString());
            return false;
        }
    },

    async checkExistedSubTaskByTitle(mission: string): Promise<boolean> {
        try {
            const existedSubTask = await SubTaskEntity.findOne({ mission: mission }) != null
            return existedSubTask;
        } catch (error: any) {
            console.log(error.message.toString());
            return false;
        }
    },

    async checkExistedSubTaskInTask(subTaskId: string, taskId: string): Promise<boolean> {
        try {
            const task = TaskEntity.findOne({ _id: taskId, subTasks: subTaskId });
            return task != null;
        } catch (error: any) {
            console.log(error.message.toString());
            return false;
        }
    },
}