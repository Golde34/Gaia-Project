import { KafkaCommand } from "../../core/domain/enums/kafka.enum";
import { scheduleTaskUsecase } from "../../core/usecase/schedule-task.usecase";

export const handleDeleteTaksmessage = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.DELETE_TASK:
            scheduleTaskUsecase.deleteScheduleTaskByKafka(kafkaMessage.data)
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}