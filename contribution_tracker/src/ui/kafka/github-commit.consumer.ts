import { KafkaCommand } from "../../core/domain/enums/kafka.enums";
import { commitUsecase } from "../../core/usecase/commit.usecase";
import { projectCommitUsecase } from "../../core/usecase/project-commit.usecase";

export const githubCommitConsumerMessageHandler = (message: string) => {
    const kafkaMessage = JSON.parse(message);
    const cmd = kafkaMessage.cmd;
    switch (cmd) {
        case KafkaCommand.SYNC_GITHUB_COMMIT:
            commitUsecase.syncGithubCommits(kafkaMessage.data);
            break;
        case KafkaCommand.RESET_SYNCED_NUMBER:
            commitUsecase.resetSyncedNumber(kafkaMessage.data);
            break;
        case KafkaCommand.PROJECT_SYNC_GITHUB_COMMIT:
            projectCommitUsecase.syncProjectGithubCommits(kafkaMessage.data);
            break;
        default:
            console.warn("No handler for command: ", cmd);
    }
}