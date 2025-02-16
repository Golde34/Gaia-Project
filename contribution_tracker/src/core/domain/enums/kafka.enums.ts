export enum KafkaTopic {
    CREATE_COMMIT = 'task-manager.create-commit.topic',
    SYNC_GITHUB_COMMIT= "contribution-tracker.github-commit.topic"
}

export enum KafkaCommand {
    TM_CREATE_COMMIT = 'taskManagerCreateCommit',
    SP_CREATE_COMMIT = 'schedulePlanCreateCommit',
    SYNC_GITHUB_COMMIT = 'githubCommit',
    RESET_SYNCED_NUMBER = 'resetSyncedNumber'
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