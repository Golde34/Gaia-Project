export enum KafkaTopic {
    // Producer 
    OPTIMIZE_TASK = 'task-manager.optimize-task.topic',
    CREATE_TASK = 'task-manager.create-task.topic',
    UPLOAD_FILE = 'task-manager.upload-note-file.topic',
    DELETE_TASK = 'task-manager.delete-task.topic',
    UPDATE_TASK = 'task-manager.update-task.topic',
    CHAT_HUB_RESULT = 'task-manager.chat-hub-result.topic',
    // Consumer
    CREATE_SCHEDULE_TASK = "schedule-plan.create-schedule-task.topic",
    GAIA_CREATE_TASK = "chat-hub.create-task.topic",
}

export enum KafkaCommand {
    CREATE_TASK = 'taskManagerCreateTask',
    UPLOAD_FILE = 'uploadFile',
    UPLOAD_UPDATED_FILE = 'uploadUpdatedFile',
    UPDATE_TASK = 'updateTask',
    DELETE_TASK = 'deleteTask',
    CREATE_COMMIT = 'createCommit',
    CREATE_SCHEDULE_TASK = 'scheduleGroupCreateTask',
    GAIA_CREATE_TASK = 'gaiaCreateTask',
    CHAT_HUB_TASK_RESULT = 'taskResult',
}

export class KafkaMessage {
    constructor(
        public cmd: KafkaCommand,
        public errorCode: string,
        public errorMessage: string,
        public displayTime: string,
        public data: any
    ) { }
}