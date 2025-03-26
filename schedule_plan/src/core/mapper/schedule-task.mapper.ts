import { IScheduleTaskEntity, ScheduleTaskEntity } from "../../infrastructure/entities/schedule-task.entity"
import { convertPriority } from "../../kernel/utils/convert-fields";
import { ActiveStatus, RepeatLevel } from "../domain/enums/enums";
import { KafkaCreateTaskMessage, KafkaOptimizeTaskMessage, SyncScheduleTaskRequest } from "../domain/request/task.dto";

export const scheduleTaskMapper = {

    kafkaCreateTaskMapper(data: any, schedulePlanId: string): IScheduleTaskEntity {
        return new ScheduleTaskEntity({
            taskId: data.task.id,
            title: data.task.title,
            priority: data.task.priority,
            status: data.task.status,
            startDate: data.task.startDate,
            deadline: data.task.deadline,
            duration: data.task.duration,
            activeStatus: data.task.activeStatus,
            preferenceLevel: convertPriority(data.task.priority),
            schedulePlanId: schedulePlanId,
            repeat: RepeatLevel.NONE, 
            isNotify: false,
        });
    },

    restCreateTaskMapper(scheduleTask: any, schedulePlanId: string): IScheduleTaskEntity {
        const [startHour, startMinute] = scheduleTask.startHour.split(':').map(Number)
        const [endHour, endMinute] = scheduleTask.endHour.split(':').map(Number)
        const now = new Date()
        const startDate = this.createDateByHour(now, startHour, startMinute)
        const endDate = this.createDateByHour(now, endHour, endMinute)
        return new ScheduleTaskEntity({
            title: scheduleTask.title,
            duration: scheduleTask.duration,
            description: scheduleTask.description,
            startDate: startDate,
            deadline: endDate,
            activeStatus: ActiveStatus.active,
            priority: scheduleTask.priority,
            preferenceLevel: convertPriority(scheduleTask.priority),
            schedulePlanId: schedulePlanId,
            repeat: scheduleTask.repeat,
            isNotify: true,
        })
    },

    createDateByHour(now: Date, hour: string, minute: string): Date {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(hour), Number(minute)) 
    },

    buildKafkaCreateTaskMapper(taskId: string, scheduleTaskId: string, scheduleTaskName: string ) {
        const message = new KafkaCreateTaskMessage()
        message.taskId = taskId
        message.scheduleTaskId = scheduleTaskId
        message.scheduleTaskName = scheduleTaskName
        return message
    },

    buildOptimizeTaskMapper(syncScheduleTaskRequest: SyncScheduleTaskRequest, isSync: boolean): KafkaOptimizeTaskMessage {
        const message = new KafkaOptimizeTaskMessage()
        message.taskId = syncScheduleTaskRequest.taskId
        message.scheduleTaskId = syncScheduleTaskRequest.scheduleTaskId
        message.workOptimTaskId = syncScheduleTaskRequest.workOptimTaskId
        message.isSync = isSync.toString()
        return message
    },

    buildOptimizeScheduleTaskMapper(optimizedTask: any, task: IScheduleTaskEntity): IScheduleTaskEntity {
        task.taskOrder = optimizedTask.taskOrder
        task.weight = optimizedTask.weight
        task.stopTime = optimizedTask.stopTime
        task.taskBatch = optimizedTask.taskBatch 
        return task;
    },

    kafkaUpdateTaskMapper(data: any, scheduleTask: IScheduleTaskEntity): IScheduleTaskEntity {
        scheduleTask.activeStatus = data.activeStatus
        scheduleTask.deadline = data.deadline
        scheduleTask.duration = data.duration
        scheduleTask.preferenceLevel = convertPriority(data.priority)
        scheduleTask.priority = data.priority
        scheduleTask.startDate = data.startDate
        scheduleTask.status = data.status
        scheduleTask.title = data.title
        scheduleTask.taskOrder = data.taskOrder
        scheduleTask.stopTime = data.stopTime
        return scheduleTask
    } 
}