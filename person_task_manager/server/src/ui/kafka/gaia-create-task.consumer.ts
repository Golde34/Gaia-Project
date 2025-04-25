import { KafkaCommand } from "../../core/domain/enums/kafka.enums";
import { gaiaHandleTasksUsecase } from "../../core/usecases/gaia-handle-tasks.usecase";

export const handleGaiaCreateTaskMessage = async (message: string) => {
    const data = JSON.parse(message);
    console.log("Received message: ", data);
    const cmd = data.cmd;
    switch (cmd) {
        case KafkaCommand.GAIA_CREATE_TASK:
            gaiaHandleTasksUsecase.createTask(data.data)
            break;
        default:
            console.warn("No handler for command: ", cmd); 
    }
}