import { KafkaCommand } from "../../core/domain/enums/kafka.enums";

export const handleCreateScheduleTaskMessage = async (message: string) => {
    const data = JSON.parse(message);
    console.log("Received message: ", data);
    const cmd = data.cmd;
    switch (cmd) {
        case KafkaCommand.CREATE_SCHEDULE_TASK:
            break;
        default:
            console.warn("No handler for command: ", cmd); 
    } 
}