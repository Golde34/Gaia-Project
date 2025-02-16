import { KafkaCommand } from "../../core/domain/enums/kafka.enums";
import { commitUsecase } from "../../core/usecase/commit.usecase";

export const commitConsumerMessageHandler = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.TM_CREATE_COMMIT:
            commitUsecase.createCommit(kafkaMessage.data);
            break;
        case KafkaCommand.SP_CREATE_COMMIT:
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}