import { ulid } from "ulid";
import { createMessage } from "../../infrastructure/kafka/create-message";
import { KafkaConfig } from "../../infrastructure/kafka/kafka-config";
import { ITaskEntity } from "../domain/entities/task.entity";
import { KafkaCommand, KafkaTopic } from "../domain/enums/kafka.enums";

class ChatHubAdapterService {
    constructor(
        private kafkaConfig = new KafkaConfig(), 
    ) {}

    async pushCreateTaskResultMessage(task: ITaskEntity, groupTask: any, project: any, actionType: string): Promise<void> {
        const data = {
            task: {
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                startDate: task.startDate,
                deadline: task.deadline,
                duration: task.duration,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                activeStatus: task.activeStatus,
                groupTaskId: groupTask._id,
            },
            groupTaskId: groupTask._id,
            groupTaskTitle: groupTask.title,
            projectId: project._id,
            projectName: project.name,
            userId: task.userId,
            actionType,
        }
        const messages = [{
            key: ulid(),
            value: JSON.stringify(createMessage(
                KafkaCommand.CHAT_HUB_TASK_RESULT, '00', 'Successful', data
            ))
        }]
        console.log("Push kafka message: ", messages)
        this.kafkaConfig.produce(KafkaTopic.CHAT_HUB_RESULT, messages);
    }
}

export const chatHubAdapterService = new ChatHubAdapterService();