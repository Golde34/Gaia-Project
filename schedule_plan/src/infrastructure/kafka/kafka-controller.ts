import { KafkaTopic } from "../../core/domain/enums/kafka.enum";
import { handleCreateScheduleTaskMessage } from "../../ui/kafka/create-schedule-task.consumer";
import { handleTaskMessage } from "../../ui/kafka/handle-task.consumer";
import { optimizeTasksHandler } from "../../ui/kafka/optimize-task.consumer";
import { handlerSyncTaskMessage } from "../../ui/kafka/sync-task.consumer";
import { KafkaHandler } from "./kafka-handler";
import * as dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

export const kafkaController = async (kafkaHandler: KafkaHandler) => {
    const topics = getKafkaTopicsFromEnv();
    if (topics.length === 0) {
        console.log("No topics defined in environment variables");
        return;
    }
    console.log("Topics: ", topics);

    try {
        for (const topic of topics) {
            const handler = kafkaTopicHandlers[topic];
            if (handler) {
                await kafkaHandler.consume(topic, (message) => {
                    handler(message.value.toString());
                });
            } else {
                console.warn(`No handler defined for topic: ${topic}`);
            }
        }
    } catch (error) {
        console.error("Failed to subscribe to topics", error);
    }
};

const getKafkaTopicsFromEnv = (): string[] => {
    const topicVars = Object.keys(process.env).filter(key => key.startsWith("KAFKA_TOPICS."));
    const topics = topicVars.map(key => process.env[key] as string);
    return topics.filter(Boolean);
};

const kafkaTopicHandlers: Record<string, (message: string) => void> = {
    [KafkaTopic.HANDLE_TASK]: (message: string) => handleTaskMessage(message),
    [KafkaTopic.SYNC_SCHEDULE_TASK]: (message: string) => handlerSyncTaskMessage(message),
    [KafkaTopic.OPTIMIZE_SCHEDULE_TASK]: (message: string) => optimizeTasksHandler(message),
    [KafkaTopic.SCHEDULE_GROUP_CREATE_TASK]: (message: string) => handleCreateScheduleTaskMessage(message),
};
