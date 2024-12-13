import { IScheduleTaskEntity } from "../../infrastructure/entities/schedule-task.entity";
import { IResponse, msg200, msg400 } from "../common/response";
import { OptimizeScheduleTaskMessage, SyncScheduleTaskRequest } from "../domain/request/task.dto";
import { scheduleTaskMapper } from "../mapper/schedule-task.mapper";
import { notificationService } from "../services/notifi-agent.service";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";
import { schedulePlanUsecase } from "./schedule-plan.usecase";

class ScheduleTaskUsecase {
    constructor() { }

    async createScheduleTaskByKafka(scheduleTask: any): Promise<void> {
        try {
            let schedulePlan = await schedulePlanService.findSchedulePlanByUserId(scheduleTask.userId);
            if (!schedulePlan) {
                console.error("Cannot find schedule plan by user id: ", scheduleTask.userId);
                schedulePlan = await schedulePlanUsecase.createSchedulePlan(scheduleTask.userId);
                if (!schedulePlan) {
                    throw new Error("Failed to create schedule plan");
                }
            }

            const task = scheduleTaskMapper.kafkaCreateTaskMapper(scheduleTask, schedulePlan._id);
            const result = await scheduleTaskService.createScheduleTask(task);
            console.log('Result: ', result);

            const { id: scheduleTaskId, title: scheduleTaskName } = result.data.message;
            scheduleTaskService.pushKafkaCreateScheduleTaskMessage(task.taskId, scheduleTaskId, scheduleTaskName);
        } catch (error) {
            console.error("Error on createScheduleTask: ", error);
        }
    }
    async createScheduleTaskByRest(scheduleTask: any): Promise<IResponse> {
        try {
            return await scheduleTaskService.createScheduleTask(scheduleTask);
        } catch (error) {
            console.error("Error on createScheduleTask: ", error);
            return msg400("Cannot create schedule task!");
        }
    }

    async syncScheduleTask(schedulePlanSyncMessage: SyncScheduleTaskRequest): Promise<void> {
        try {
            const scheduleTaskValidation = await scheduleTaskService.syncScheduleTask(schedulePlanSyncMessage)
            console.log('Schedule task is synchronized!: ', scheduleTaskValidation);
            if (!scheduleTaskValidation) {
                console.log('Push this error to logging tracker, i dont know what is goin on if we cant sync schedule task yet.')
                // Push to logging tracker to handle error case
            }
            scheduleTaskService.pushKafkaOptimizeTask(schedulePlanSyncMessage, scheduleTaskValidation);
        } catch (error) {
            console.error("Error on syncScheduleTask: ", error);
        }
    }

    async optimizeScheduleTask(schedulePlanOptimizeMessage: OptimizeScheduleTaskMessage): Promise<void> {
        try {
            const validateUser = await schedulePlanService.findSchedulePlanByUserId(schedulePlanOptimizeMessage.userId);
            if (!validateUser) {
                console.log('Push this error to logging tracker, user validate fail need to check the whole account.')
            } else {
                const optimizedTask = await scheduleTaskService.optimizeScheduleTask(schedulePlanOptimizeMessage.tasks)
                await schedulePlanService.updateTaskBatch(validateUser, 0, true);
                // Push notification
                await notificationService.pushNotification(schedulePlanOptimizeMessage.userId, optimizedTask, schedulePlanOptimizeMessage.notificationFlowId);
            }
        } catch (error) {
            console.error("Error on optimizeScheduleTask: ", error);
        }
    }

    async updateScheduleTask(task: any): Promise<void> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(task.id);
            const updateScheduletask = scheduleTaskMapper.kafkaUpdateTaskMapper(task, scheduleTask);
            console.log('Update schedule task: ', updateScheduletask);
            scheduleTaskService.updateScheduleTask(updateScheduletask._id, updateScheduletask);
        } catch (error) {
            console.error("Error on updateScheduleTask: ", error);
        }
    }

    async deleteScheduleTaskByKafka(taskId: any): Promise<void> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
            const result = await scheduleTaskService.deleteScheduleTask(scheduleTask._id);
            console.log('Result: ', result);
        } catch (error) {
            console.error("Error on deleteScheduleTask: ", error);
        }
    }

    async deleteTask(taskId: any): Promise<IResponse> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
            return await scheduleTaskService.deleteScheduleTask(scheduleTask._id);
        } catch (error) {
            console.error("Error on deleteScheduleTask: ", error);
            return msg400("Cannot delete schedule task!");
        }
    }

    async getListScheduleTaskByUserId(userId: number): Promise<IScheduleTaskEntity[] | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }

            const { _id: schedulePlanId, activeTaskBatch, isTaskBatchActive } = schedulePlan;

            if (isTaskBatchActive && activeTaskBatch > 0) {
                const scheduleTaskList = await scheduleTaskService.findByTaskBatch(schedulePlanId, activeTaskBatch);
                if (scheduleTaskList.length > 0) {
                    return scheduleTaskList;
                }

                await schedulePlanService.updateTaskBatch(schedulePlan, 0, false);
                return scheduleTaskService.findTop10NewestTask(schedulePlanId);
            }

            if (isTaskBatchActive && activeTaskBatch === 0) {
                return [];
            }

            if (activeTaskBatch === 0) {
                return scheduleTaskService.findTop10NewestTask(schedulePlanId);
            }

            return undefined;
        } catch (error) {
            console.error("Error on getListScheduleTaskByUserId: ", error);
            return undefined
        }
    }

    async getScheduleBatchTask(userId: number): Promise<any | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }

            const scheduleTaskList = scheduleTaskService.getScheduleBatchTask(schedulePlan._id);
            return scheduleTaskList;
        } catch (error) {
            console.error("Error on getScheduleBatchTask: ", error);
            return undefined;
        }
    }

    async chooseScheduleBatchTask(userId: number, batchNumber: number): Promise<IResponse | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }
            schedulePlan.activeTaskBatch = batchNumber;
            await schedulePlanService.updateSchedulePlan(schedulePlan._id, schedulePlan);

            const taskBatch = await scheduleTaskService.getScheduleTaskByBatchNumber(schedulePlan._id, batchNumber);
            return msg200({
                scheduleTaskBatch: taskBatch
            })
        } catch (error) {
            console.error("Error on chooseScheduleBatchTask: ", error);
            return msg400("Cannot choose schedule batch task!");
        }
    }

    async getScheduleTask(id: string): Promise<IResponse | undefined> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(id);
            return msg200({ scheduleTask });
        } catch (error) {
            console.error("Error on getScheduleTask: ", error);
            return msg400("Cannot get schedule task!");
        }
    }
}

export const scheduleTaskUsecase = new ScheduleTaskUsecase();