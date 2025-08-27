import { KafkaCommand } from "../../core/domain/enums/kafka.enums";
import { groupTaskService } from "../../core/services/group-task.service";
import { taskService } from "../../core/services/task.service";

export const handleUpdateTaskTagMessage = async (message: string) => {
    const data = JSON.parse(message);
    console.log("Received message: ", data);
    const cmd = data.cmd;
    switch (cmd) {
        case KafkaCommand.UPDATE_TASK_TAG:
            const tasks = data.data;
            if (Array.isArray(tasks)) {
                for (const task of tasks) {
                    if (task.taskId && task.tag) {
                        await taskService.updateTaskTag(task.taskId, task.tag);
                    } else {
                        console.warn("Invalid task data: ", task);
                    }
                }
            }
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}
