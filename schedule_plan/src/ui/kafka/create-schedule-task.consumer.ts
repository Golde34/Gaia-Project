import { KafkaCommand } from "../../core/domain/enums/kafka.enum";
import { scheduleTaskUsecase } from "../../core/usecase/schedule-task.usecase";

export const handleCreateScheduleTaskMessage = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.SCHEDULE_GROUP_CREATE_TASK:
            scheduleTaskUsecase.handleScheduleGroupsCreateTask(kafkaMessage.displayTime, kafkaMessage.data)
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}