export enum KafkaTopic {
    OPTIMIZE_TASK = 'task-manager.optimize-task.topic',
    CREATE_TASK = 'task-manager.create-task.topic',
    UPLOAD_FILE = 'task-manager.upload-note-file.topic',
    DELETE_TASK = 'task-manager.delete-task.topic',
    UPDATE_TASK = 'task-manager.update-task.topic',
}

export enum KafkaCommand {
    CREATE_TASK = 'taskManagerCreateTask',
    UPLOAD_FILE = 'uploadFile',
    UPLOAD_UPDATED_FILE = 'uploadUpdatedFile',
    UPDATE_TASK = 'updateTask',
    DELETE_TASK = 'deleteTask',
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