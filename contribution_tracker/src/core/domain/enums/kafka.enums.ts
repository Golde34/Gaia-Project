export enum ConsumerKafkaTopic {
    CREATE_COMMIT = 'task-manager.update-task.topic',
    SYNC_GITHUB_COMMIT= "contribution-tracker.github-commit.topic",
}

export enum ProducerKafkaTopic {
    FULL_SYNC_GITHUB_COMMIT = "contribution-tracker.full-sync-github-commit.topic",
}

export enum KafkaCommand {
    SYNC_GITHUB_COMMIT = 'githubCommit',
    FULL_SYNC_GITHUB_COMMIT = 'fullSyncGithubCommit',
    RESET_SYNCED_NUMBER = 'resetSyncedNumber',
    PROJECT_SYNC_GITHUB_COMMIT = 'projectSyncGithubCommit',
    CREATE_COMMIT = 'createCommit',
}

export class KafkaMessage {
    constructor(
        public cmd: KafkaCommand,
        public errorCode: string,
        public errorMessage: string,
        public displayTime: string,
        public data: any
    ){}
}