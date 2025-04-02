import { KafkaCommand } from "../../core/domain/enums/kafka.enum";

export const handleCreateScheduleTaskMessage = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.SCHEDULE_GRROUP_CREATE_TASK:
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}