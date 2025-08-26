import { randomUUID } from "crypto";
import { convertPriority } from "../../kernel/utils/convert-fields";
import ScheduleGroupEntity from "../domain/entities/schedule-group.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { ActiveStatus, RepeatLevel } from "../domain/enums/enums";
import { KafkaCreateTaskMessage, KafkaOptimizeTaskMessage, SyncScheduleTaskRequest } from "../domain/request/task.dto";

export const scheduleTaskMapper = {

    kafkaCreateTaskMapper(data: any, schedulePlanId: string): any {
        return {
            id: randomUUID(),
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
        };
    },

    buildKafkaCreateTaskMapper(taskId: string, scheduleTaskId: string, scheduleTaskName: string) {
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

    buildOptimizeScheduleTaskMapper(optimizedTask: any, task: ScheduleTaskEntity): ScheduleTaskEntity {
        task.taskOrder = optimizedTask.taskOrder
        task.weight = optimizedTask.weight
        task.stopTime = optimizedTask.stopTime
        task.taskBatch = optimizedTask.taskBatch
        return task;
    },

    kafkaUpdateTaskMapper(data: any, scheduleTask: ScheduleTaskEntity): ScheduleTaskEntity {
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
    },

    buildTaskFromScheduleGroup(scheduleGroup: ScheduleGroupEntity): any {
        console.log('Schedule group: ', scheduleGroup)
        // startDate = today but have schedule.startHour and schedule.startMinute
        const startDate = new Date(new Date().setHours(Number(scheduleGroup.startHour), Number(scheduleGroup.startMinute), 0, 0));
        const deadline = new Date(new Date().setHours(Number(scheduleGroup.endHour), Number(scheduleGroup.endMinute), 0, 0));
        return {
            id: randomUUID(),
            title: scheduleGroup.title === undefined ? "" : scheduleGroup.title,
            priority: scheduleGroup.priority === undefined ? [] : scheduleGroup.priority,
            status: scheduleGroup.status === undefined ? "TODO" : scheduleGroup.status,
            startDate: startDate,
            deadline: deadline,
            duration: scheduleGroup.duration === undefined ? 0 : scheduleGroup.duration,
            activeStatus: ActiveStatus.active,
            preferenceLevel: convertPriority(scheduleGroup.priority),
            schedulePlanId: scheduleGroup.schedulePlanId,
            isNotify: scheduleGroup.isNotify === undefined ? false : scheduleGroup.isNotify,
            scheduleGroupId: scheduleGroup.id,
            repeat: RepeatLevel.WEEKLY,
            isSynchronizedWithWO: false
        };
    },

    buidlOptimizeTaskListKafkaMessage(userId: number): any {
        return {
            userId: userId,
            optimizedDate: new Date().toLocaleDateString("vi-VN"),
        };
    },

    mapDailyTasksToScheduleTasks(dailyTasks: any): ScheduleTaskEntity[] {
        if (Array.isArray(dailyTasks)) {
            return dailyTasks.map(task => {
                const scheduleTask = new ScheduleTaskEntity();
                scheduleTask.id = task.id;
                scheduleTask.title = task.title;
                scheduleTask.priority = task.priority;
                scheduleTask.status = task.status;
                scheduleTask.startDate = task.startDate;
                scheduleTask.deadline = task.deadline;
                scheduleTask.duration = task.duration;
                scheduleTask.activeStatus = task.activeStatus;
                scheduleTask.preferenceLevel = convertPriority(task.priority);
                scheduleTask.tag = task.tag;
                scheduleTask.taskId = task.taskId;
                scheduleTask.schedulePlanId = task.schedulePlanId;
                scheduleTask.isNotify = task.isNotify || false;
                scheduleTask.taskOrder = task.taskOrder || 0;
                scheduleTask.weight = task.weight || 0;
                scheduleTask.stopTime = task.stopTime || 0;
                scheduleTask.taskBatch = task.taskBatch || 0;
                return scheduleTask;
            });
        }
        throw new Error("dailyTasks is not an array")
    }
}