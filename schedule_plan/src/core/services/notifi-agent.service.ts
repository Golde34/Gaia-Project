import { ulid } from "ulid";
import { createMessage } from "../../infrastructure/kafka/create-message"
import KafkaHandler from "../../infrastructure/kafka/kafka-handler";
import { KafkaCommand, KafkaTopic } from "../domain/enums/kafka.enum"

class NotificationService {
    
    kafkaHandler: KafkaHandler = new KafkaHandler();

    async pushOptimNotification(userId: number, optimizeStatus: string, notificationFlowId: string): Promise<void> {
        const data = {
            "userId": userId,
            "optimizeStatus": optimizeStatus,
            "errorStatus": optimizeStatus,
            "notificationFlowId": notificationFlowId
        } 
        const messages = [{
            key: ulid().toLowerCase(),
            value: JSON.stringify(createMessage(
                KafkaCommand.OPTIMIZE_TASK, '00', 'Successful', data
            ))
        }]
        console.log("Push Kafka Message: ", messages);
        await this.kafkaHandler.produce(KafkaTopic.OPTIMIZE_TASK_NOTIFY, messages);
    }

    async pushRegisterCalendarNotification(userId: number, timeBubbles: any[]): Promise<void> {
        const data = {
            "userId": userId,
            "timeBubbles": timeBubbles
        }
        const messages = [{
            value: JSON.stringify(createMessage(
                KafkaCommand.GENERATE_SCHEDULE_CALENDAR, '00', 'Successful', data 
            ))
        }]
        const topic = KafkaTopic.GENERATE_TIME_BUBBLE;
        console.log(`Push Kafka Message: ${messages} topics ${topic}`, messages, " ");
        await this.kafkaHandler.produce(topic, messages);
    }
}

export const notificationService = new NotificationService();