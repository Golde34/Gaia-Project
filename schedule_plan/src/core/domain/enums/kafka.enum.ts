export enum KafkaTopic {
    CREATE_TASK = "task-manager.create-task.topic",
    CREATE_SCHEDULE_TASK = "schedule-plan.create-schedule-task.topic",
    SYNC_SCHEDULE_TASK = "schedule-plan.sync-schedule-task.topic",
    OPTIMIZE_TASK = "work-optimization.optimize-task.topic",
    OPTIMIZE_SCHEDULE_TASK = "schedule-plan.optimize-task.topic",
    OPTIMIZE_TASK_NOTIFY = "notify-agent.optimize-task-notify.topic",
    DELETE_TASK = "task-manager.delete-task.topic",
    UPDATE_TASK = "task-manager.update-task.topic",
    SCHEDULE_GROUP_CREATE_TASK = "schedule-plan.schedule-group-create-task.topic",
}

export enum KafkaCommand {
    TM_CREATE_TASK = "taskManagerCreateTask",
    GAIA_CREATE_TASK = "gaiaCreateTask",
    CREATE_SCHEDULE_TASK = "schedulePlanCreateTask",
    OPTIMIZE_CREATING_TASK = "optimizeCreatingTask",
    SYNC_SCHEDULE_TASK = "syncScheduleTask",
    OPTIMIZE_SCHEDULE_TASK = "optimizeScheduleTask",
    OPTIMIZE_TASK = "optimizeTask",
    UPDATE_TASK = "updateTask",
    DELETE_TASK = "deleteTask",
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