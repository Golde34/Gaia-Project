import { KafkaCommand } from "../../core/domain/enums/kafka.enums";
import { commitUsecase } from "../../core/usecase/commit.usecase";

export const commitConsumerMessageHandler = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.CREATE_COMMIT:
            commitUsecase.createCommit(kafkaMessage.data);
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}