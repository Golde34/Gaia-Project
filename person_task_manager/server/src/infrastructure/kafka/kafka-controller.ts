import * as dotenv from "dotenv";
import { KafkaConfig } from "./kafka-config";
import { KafkaTopic } from "../../core/domain/enums/kafka.enums";
import { handleGaiaCreateTaskMessage } from "../../ui/kafka/gaia-create-task.consumer";
import { handleUpdateTaskTagMessage } from "../../ui/kafka/update-task-tag.consumer";

dotenv.config({ path: "./src/.env" });

export const kafkaController = async (kafkaHandler: KafkaConfig) => {
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
    [KafkaTopic.GAIA_CREATE_TASK]: (message: string) => handleGaiaCreateTaskMessage(message),
    [KafkaTopic.UPDATE_TASK_TAG]: (message: string) => handleUpdateTaskTagMessage(message),
};
