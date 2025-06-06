import { taskManagerAdapter } from "../../infrastructure/client/task-manager.adapter";
import { createMessage } from "../../infrastructure/kafka/create-message";
import { KafkaHandler } from "../../infrastructure/kafka/kafka-handler";
import { scheduleTaskRepository } from "../../infrastructure/repositories/schedule-task.repo";
import { convertErrorCodeToBoolean } from "../../kernel/utils/convert-fields";
import { isStringEmpty } from "../../kernel/utils/string-utils";
import { IResponse, msg200, msg400, msg500 } from "../common/response";
import ScheduleGroupEntity from "../domain/entities/schedule-group.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { ErrorStatus } from "../domain/enums/enums";
import { KafkaCommand, KafkaTopic } from "../domain/enums/kafka.enum";
import { SyncScheduleTaskRequest } from "../domain/request/task.dto";
import { scheduleTaskMapper } from "../mapper/schedule-task.mapper";

class ScheduleTaskService {
    constructor(
        public kafkaHandler: KafkaHandler = new KafkaHandler(),
        public taskManagerAdapterImpl = taskManagerAdapter,
    ) { }

    async createScheduleTask(scheduleTask: any): Promise<IResponse> {
        try {
            scheduleTask.createdAt = new Date();
            const createScheduleTask = await scheduleTaskRepository.createScheduleTask(scheduleTask);
            return msg200({
                message: (createScheduleTask as any)
            });
        } catch (error: any) {
            return msg500(error.message.toString());
        }
    }

    async updateScheduleTask(scheduleTaskId: string, scheduleTask: any): Promise<IResponse> {
        try {
            const updateScheduleTask = await scheduleTaskRepository.updateScheduleTask(scheduleTaskId, scheduleTask);
            return msg200({
                message: (updateScheduleTask as any)
            });
        } catch (error: any) {
            return msg500(error.message.toString());
        }
    }

    async deleteScheduleTask(scheduleTaskId: string): Promise<IResponse> {
        try {
            const deleteScheduleTask = await scheduleTaskRepository.deleteScheduleTask(scheduleTaskId);
            return msg200({
                message: (deleteScheduleTask as any)
            });
        } catch (error: any) {
            return msg500(error.message.toString());
        }
    }

    async findScheduleTaskById(scheduleTaskId: string): Promise<IResponse> {
        try {
            const scheduleTask = await scheduleTaskRepository.findScheduleTaskById(scheduleTaskId);
            return msg200({
                scheduleTask: scheduleTask
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async pushCreateTaskKafkaMessage(taskId: string, scheduleTaskId: string, scheduleTaskName: string): Promise<void> {
        const data = scheduleTaskMapper.buildKafkaCreateTaskMapper(taskId, scheduleTaskId, scheduleTaskName);
        const messages = [{
            value: JSON.stringify(createMessage(
                KafkaCommand.CREATE_SCHEDULE_TASK, '00', 'Successful', data
            ))
        }]
        console.log("Push Kafka Message: ", messages);
        this.kafkaHandler.produce(KafkaTopic.CREATE_SCHEDULE_TASK, messages);
    }

    async syncScheduleTask(schedulePlanSyncMessage: SyncScheduleTaskRequest): Promise<boolean> {
        if (schedulePlanSyncMessage.taskSynchronizeStatus !== ErrorStatus.SUCCESS) return false;

        const scheduleTask = await scheduleTaskRepository.findByScheduleTaskIdAndTaskId(
            schedulePlanSyncMessage.scheduleTaskId,
            schedulePlanSyncMessage.taskId
        );

        console.log('Schedule task before synchronized: ', scheduleTask)
        if (scheduleTask) {
            await scheduleTaskRepository.syncScheduleTask(
                schedulePlanSyncMessage.scheduleTaskId,
                convertErrorCodeToBoolean(schedulePlanSyncMessage.taskSynchronizeStatus)
            );
            return true;
        }

        return false;
    }

    async pushKafkaOptimizeTask(schedulePlanSyncMessage: SyncScheduleTaskRequest, isSyncScheduleTask: boolean): Promise<void> {
        const data = scheduleTaskMapper.buildOptimizeTaskMapper(schedulePlanSyncMessage, isSyncScheduleTask);
        const messages = [{
            value: JSON.stringify(createMessage(
                KafkaCommand.OPTIMIZE_CREATING_TASK, '00', 'Successful', data
            ))
        }]
        console.log("Push Kafka Message: ", messages);
        this.kafkaHandler.produce(KafkaTopic.OPTIMIZE_TASK, messages);
    }

    async optimizeScheduleTask(listTasks: any): Promise<string> {
        if (!Array.isArray(listTasks) || listTasks.length === 0) {
            throw new Error("Invalid input: listTasks must be a non-empty array.");
        }

        try {
            await Promise.all(listTasks.map(async (scheduleTask: any) => {
                const task = await scheduleTaskRepository.findByScheduleTaskIdAndTaskId(scheduleTask.scheduleTaskId, scheduleTask.originalId);
                if (task) {
                    const newTask = scheduleTaskMapper.buildOptimizeScheduleTaskMapper(scheduleTask, task);
                    await scheduleTaskRepository.updateScheduleTask(scheduleTask.scheduleTaskId, newTask);
                }
            }
            ));
            console.log("Save database successfully");
            return "SUCCESS";
        } catch (error) {
            console.error("Error saving tasks to database:", error);
            return "FAILED";
        }
    }

    async findScheduleTaskByTaskId(taskId: string): Promise<ScheduleTaskEntity> {
        const scheduleTask = await scheduleTaskRepository.findScheduleTaskByTaskId(taskId);
        if (scheduleTask === null) {
            throw new Error("Task not found");
        }
        return scheduleTask;
    }

    async findTop10NewestTask(schedulePlanId: string): Promise<ScheduleTaskEntity[]> {
        return await scheduleTaskRepository.findTop10NewestTask(schedulePlanId);
    }

    async findByTaskBatch(schedulePlanId: string, taskBatch: number): Promise<ScheduleTaskEntity[]> {
        return await scheduleTaskRepository.findByTaskBatch(schedulePlanId, taskBatch);
    }

    async findAllBySchedulePlanId(schedulePlanId: string): Promise<ScheduleTaskEntity[]> {
        try {
            const scheduleTaskList = await scheduleTaskRepository.findAll(schedulePlanId);
            return scheduleTaskList;
        } catch (error) {
            console.error("Error on getScheduleBatchTask: ", error);
            return [];
        }
    }

    async getScheduleBatchTask(schedulePlanId: string): Promise<any> {
        try {
            const taskBatchList = (await scheduleTaskRepository.findDistinctTaskBatch(schedulePlanId))
                .filter((taskBatch: number) => taskBatch > 0);
            console.log("Task Batch List: ", taskBatchList);
            const result: { [key: string]: ScheduleTaskEntity[] } = {};
            await Promise.all(taskBatchList.map(async (taskBatch: number) => {
                const taskList = await scheduleTaskRepository.findByTaskBatch(schedulePlanId, taskBatch);
                console.log("Task List: ", taskList);
                result[taskBatch] = taskList;
            }))
            return result;
        } catch (error) {
            console.error("Error on getScheduleBatchTask: ", error);
            return [];
        }
    }

    async getScheduleTaskByBatchNumber(schedulePlanId: string, batchNumber: number): Promise<ScheduleTaskEntity[]> {
        try {
            return await scheduleTaskRepository.findByTaskBatch(schedulePlanId, batchNumber);
        } catch (error) {
            console.error("Error on getScheduleBatchTask: ", error);
            return [];
        }
    }

    async createTaskFromScheduleGroup(scheduleGroup: ScheduleGroupEntity, userId: number): Promise<ScheduleTaskEntity | null> {
        try {
            const scheduleTask = scheduleTaskMapper.buildTaskFromScheduleGroup(scheduleGroup);
            const response = await this.taskManagerAdapterImpl.createTask(scheduleTask, scheduleGroup, userId);
            if (typeof response === 'number') {
                return null;
            }
            if (isStringEmpty(scheduleGroup.projectId)) {
                scheduleGroup.projectId = response.projectId;
            }
            if (isStringEmpty(scheduleGroup.groupTaskId)) {
                scheduleGroup.groupTaskId = response.groupTaskId;
            }
            scheduleTask.taskId = response.task.id;
            const createdScheduleTask = await scheduleTaskRepository.createScheduleTask(scheduleTask);
            if (!createdScheduleTask) {
                console.error("Failed to create schedule task from schedule group");
                return null;
            }
            return createdScheduleTask;
        } catch (error) {
            console.error("Error on createTaskFromScheduleGroup: ", error);
            return null;
        }
    }

    async findScheduleTaskByScheduleGroup(scheduleGroupId: string): Promise<ScheduleTaskEntity[]> {
        try {
            const scheduleTask = await scheduleTaskRepository.findByScheduleGroup(scheduleGroupId);
            return scheduleTask;
        } catch (error) {
            console.error("Error on findScheduleTaskByScheduleGroup: ", error);
            return [];
        }
    }

    async deleteCommandToTMService(taskId: string): Promise<IResponse> {
        try {
            const deleteCommand = await this.taskManagerAdapterImpl.deleteTask(taskId);
            return msg200({
                message: (deleteCommand as any)
            });
        } catch (error: any) {
            return msg500(error.message.toString());
        }
    }

    async findUserDailyTasks(schedulePlanId: string, taskBatch: number, date: Date): Promise<ScheduleTaskEntity[] | null> {
        try {
            return await scheduleTaskRepository.findUserDailyTasks(schedulePlanId, taskBatch, date);
        } catch (error: any) {
            console.error("Error on findUserDailyTasks: ", error);
            return null;
        }
    }

    async optimizeDailyTasks(dailyTasks: ScheduleTaskEntity[]): Promise<ScheduleTaskEntity[]> {
        try {
            const scheduleGroupTasks = dailyTasks.filter((task) => task.scheduleGroupId !== null);
            const scheduleTasks = dailyTasks.filter((task) => task.scheduleGroupId === null);

            const startOfDay = new Date();
            startOfDay.setHours(7, 0, 0, 0); // start of day is 00:00:00
            // end of day is 23:00:00
            const endOfDay = new Date();
            endOfDay.setHours(23, 0, 0, 0); 

            function assignTasksToTimeSlots(tasks: any[], groupTasks: any[], startOfDay: Date, endOfDay: Date, defaultDurationMinutes: number = 60) {
                const occupiedSlots = groupTasks
                    .map(task => ({
                        start: new Date(task.startTime),
                        end: new Date(task.endTime)
                    }))
                    .sort((a, b) => a.start.getTime() - b.start.getTime());
            
                const freeSlots = [];
                let lastEnd = new Date(startOfDay);
            
                for (const slot of occupiedSlots) {
                    if (slot.start > lastEnd) {
                        freeSlots.push({ start: new Date(lastEnd), end: new Date(slot.start) });
                    }
                    lastEnd = slot.end > lastEnd ? slot.end : lastEnd;
                }

                if (lastEnd < endOfDay) {
                    freeSlots.push({ start: new Date(lastEnd), end: new Date(endOfDay) });
                }
            
                const nonGroupTasks = tasks
                    .filter(task => !task.scheduleGroupId)
                    .sort((a, b) => a.taskOrder - b.taskOrder);
            
                let taskIdx = 0;
                for (const slot of freeSlots) {
                    let slotTime = new Date(slot.start);
                    while (
                        taskIdx < nonGroupTasks.length &&
                        slotTime.getTime() + defaultDurationMinutes * 60000 <= slot.end.getTime()
                    ) {
                        const task = nonGroupTasks[taskIdx];
                        task.startTime = new Date(slotTime);
                        task.endTime = new Date(slotTime.getTime() + defaultDurationMinutes * 60000);
                        slotTime = new Date(task.endTime);
                        taskIdx++;
                    }
                    if (taskIdx >= nonGroupTasks.length) break;
                }
            
                return [...groupTasks, ...nonGroupTasks];
            }

            const sortedTasks = assignTasksToTimeSlots(scheduleTasks, scheduleGroupTasks, startOfDay, endOfDay);
            return sortedTasks;
        } catch (error: any) {
            console.error("Error on optimizeDailyTasks: ", error);
            return dailyTasks;
        }
    }
}

export const scheduleTaskService = new ScheduleTaskService();   
