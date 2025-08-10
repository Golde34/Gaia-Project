import { KafkaCommand } from "../../core/domain/enums/kafka.enum";
import { scheduleDayUsecase } from "../../core/usecase/schedule-day.usecase";

export const generateScheduleCalendarHandler = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.GENERATE_SCHEDULE_CALENDAR:
            const userId = Number(kafkaMessage.data.userId);
            const schedule = kafkaMessage.data.response;
            scheduleDayUsecase.registerScheduleConfig(userId, schedule);
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}