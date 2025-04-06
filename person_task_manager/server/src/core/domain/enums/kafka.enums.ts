export enum KafkaTopic {
    // Producer 
    OPTIMIZE_TASK = 'task-manager.optimize-task.topic',
    HANDLE_TASK = 'task-manager.handle-task.topic',
    UPLOAD_FILE = 'task-manager.upload-note-file.topic',
    // Consumer
    CREATE_SCHEDULE_TASK = "schedule-plan.create-schedule-task.topic",
}

export enum KafkaCommand {
    CREATE_TASK = 'taskManagerCreateTask',
    UPLOAD_FILE = 'uploadFile',
    UPLOAD_UPDATED_FILE = 'uploadUpdatedFile',
    UPDATE_TASK = 'updateTask',
    DELETE_TASK = 'deleteTask',
    CREATE_COMMIT = 'createCommit',
    CREATE_SCHEDULE_TASK = 'scheduleGroupCreateTask'
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