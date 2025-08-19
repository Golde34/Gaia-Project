import { IResponse, msg200, msg400 } from "../common/response";
import ScheduleGroupEntity from "../domain/entities/schedule-group.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { OptimizeScheduleTaskMessage, SyncScheduleTaskRequest } from "../domain/request/task.dto";
import { scheduleTaskMapper } from "../mapper/schedule-task.mapper";
import { notificationService } from "../services/notifi-agent.service";
import { scheduleGroupService } from "../services/schedule-group.service";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";

class ScheduleTaskUsecase {
    constructor() { }

    async createScheduleTaskByKafka(scheduleTask: any): Promise<void> {
        try {
            const schedulePlan = await schedulePlanService.createSchedulePlan(scheduleTask.userId);
            if (!schedulePlan) {
                throw new Error("Failed to create schedule plan");
            }

            const task = scheduleTaskMapper.kafkaCreateTaskMapper(scheduleTask, schedulePlan.id);
            const result = await scheduleTaskService.createScheduleTask(task);
            console.log('Result: ', result);

            const { id: scheduleTaskId, title: scheduleTaskName } = result.data.message;
            scheduleTaskService.pushCreateTaskKafkaMessage(task.taskId, scheduleTaskId, scheduleTaskName);
        } catch (error) {
            console.error("Error on createScheduleTask: ", error);
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
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(task.taskId);
            const updateScheduletask = scheduleTaskMapper.kafkaUpdateTaskMapper(task, scheduleTask);
            console.log('Update schedule task: ', updateScheduletask);
            await scheduleTaskService.updateScheduleTask(updateScheduletask.id, updateScheduletask);
        } catch (error) {
            console.error("Error on updateScheduleTask: ", error);
        }
    }

    async deleteScheduleTaskByKafka(taskId: any): Promise<void> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
            const result = await scheduleTaskService.deleteScheduleTask(scheduleTask.id);
            console.log('Result: ', result);
        } catch (error) {
            console.error("Error on deleteScheduleTask: ", error);
        }
    }

    async deleteTask(taskId: any): Promise<IResponse> {
        try {
            const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
            return await scheduleTaskService.deleteScheduleTask(scheduleTask.id);
        } catch (error) {
            console.error("Error on deleteScheduleTask: ", error);
            return msg400("Cannot delete schedule task!");
        }
    }

    async getListTaskByUserId(userId: number): Promise<ScheduleTaskEntity[] | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }

            console.log('Get List schedule task by schedule plan: ', schedulePlan.id);
            const { id: schedulePlanId, activeTaskBatch, isTaskBatchActive } = schedulePlan;

            if (isTaskBatchActive && activeTaskBatch > 0) {
                const scheduleTaskList = await scheduleTaskService.findByTaskBatch(schedulePlanId, activeTaskBatch);
                console.log("Get task list by active task batch: ", scheduleTaskList);
                if (scheduleTaskList.length > 0) {
                    return scheduleTaskList;
                }
                console.log("No task found in active task batch, update task batch to 0");
                await schedulePlanService.updateTaskBatch(schedulePlan, 0, false);
                return scheduleTaskService.findTopKNewestTask(schedulePlanId, 10);
            }

            if (isTaskBatchActive && activeTaskBatch === 0) {
                return [];
            }

            if (activeTaskBatch === 0) {
                return scheduleTaskService.findTopKNewestTask(schedulePlanId, 10);
            }

            return undefined;
        } catch (error) {
            console.error("Error on getListScheduleTaskByUserId: ", error);
            return undefined
        }
    }

    async getBatchTask(userId: number): Promise<any | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }

            return await scheduleTaskService.getScheduleBatchTask(schedulePlan.id);
        } catch (error) {
            console.error("Error on getScheduleBatchTask: ", error);
            return undefined;
        }
    }

    async chooseBatchTask(userId: number, batchNumber: number): Promise<IResponse | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }
            schedulePlan.activeTaskBatch = batchNumber;
            await schedulePlanService.updateSchedulePlan(schedulePlan.id, schedulePlan);

            const taskBatch = await scheduleTaskService.getScheduleTaskByBatchNumber(schedulePlan.id, batchNumber);
            return msg200({
                scheduleTaskBatch: taskBatch
            })
        } catch (error) {
            console.error("Error on chooseScheduleBatchTask: ", error);
            return msg400("Cannot choose schedule batch task!");
        }
    }

    async getScheduleTask(taskId: string | undefined, scheduleTaskId: string | undefined): Promise<IResponse | undefined> {
        try {
            if (taskId === undefined && scheduleTaskId === undefined) {
                return msg400("Task id or schedule task id is required!");
            }
            if (taskId === undefined || taskId == null || taskId == "null") {
                const scheduleTask = await scheduleTaskService.findScheduleTaskById(scheduleTaskId as string);
                return msg200({ scheduleTask });
            }
            if (scheduleTaskId === undefined || scheduleTaskId == null || scheduleTaskId == "null") {
                const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
                return msg200({ scheduleTask });
            }
            if (scheduleTaskId !== undefined && taskId !== undefined) {
                const scheduleTask = await scheduleTaskService.findScheduleTaskByTaskId(taskId);
                if (scheduleTask.id !== scheduleTaskId) {
                    return msg400("Task id and schedule task id are not matched!");
                }
                return msg200({ scheduleTask });
            }
        } catch (error) {
            console.error("Error on getScheduleTask: ", error);
            return msg400("Cannot get schedule task!");
        }
    }

    async handleScheduleGroupsCreateTask(displayTime: Date, kafkaData: any): Promise<any> {
        console.log('Schedule Group Create Task day: ' + displayTime + ' id: ' + kafkaData);
        try {
            const limit = 100;
            const maxRetry = 3;
            const today = new Date(displayTime);
            const failedScheduleMap: Record<string, number> = {}
            let hasMore = true;

            while (hasMore) {
                const scheduleGroups: ScheduleGroupEntity[] = await scheduleGroupService.findAllScheduleGroupsToCreateTask(limit, today);

                if (scheduleGroups.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const scheduleGroup of scheduleGroups) {
                    let createdTask = null;
                    try {
                        await this.createScheduleTask(scheduleGroup, createdTask, today, failedScheduleMap);
                    } catch (err) {
                        await this.rollbackCreateScheduleTask(scheduleGroup.id, createdTask, maxRetry, err, failedScheduleMap);
                    }
                }
            }
        } catch (error: any) {
            console.error("Fatal error in scheduleGroupCreateTask:", error);
            throw new Error(error.message.toString());
        }
    }

    private async createScheduleTask(scheduleGroup: ScheduleGroupEntity, createdTask: any, today: Date, failedScheduleMap: Record<string, number>): Promise<any> {
        const schedulePlan = await schedulePlanService.getSchedulePlanById(scheduleGroup.schedulePlanId);
        if (schedulePlan == null) {
            console.error("Task creation failed because of schedule plan not existed, scheduleGroupId: ", scheduleGroup.id)
            throw new Error("Task creation fail because schedule plan not found");
        }

        createdTask = await scheduleTaskService.createTaskFromScheduleGroup(scheduleGroup, schedulePlan.userId)
        if (!createdTask) {
            console.error("Task creation failed with schedule group: ", scheduleGroup);
            throw new Error("Task creation failed");
        }

        await scheduleGroupService.updateRotationDay(scheduleGroup, today); 
        delete failedScheduleMap[scheduleGroup.id]
    }

    private async rollbackCreateScheduleTask(scheduleGroupId: string, createdTask: any, maxRetry: number,
        err: any, failedScheduleMap: Record<string, number>): Promise<any> {
        console.error("Error creating task or updating scheduleGroup:", err);
        failedScheduleMap[scheduleGroupId] = (failedScheduleMap[scheduleGroupId] || 0) + 1;

        // Delete created task if it exists
        if (createdTask !== null) {
            console.log(`Deleting task : ${createdTask}`);
            await scheduleTaskService.deleteCommandToTMService(createdTask.taskId);
            await scheduleTaskService.deleteScheduleTask(createdTask.id);
        }

        if (failedScheduleMap[scheduleGroupId] >= maxRetry) {
            console.error(`Exceeded retires for ${scheduleGroupId}: Sending to error queue.`);
            // push to logging tracker to handle error
            await scheduleGroupService.markAsFail(scheduleGroupId);
        }
    }

    async getActiveTaskBatch(userId: number): Promise<IResponse | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }

            const scheduleTasks = await scheduleTaskService.getScheduleTaskByBatchNumber(schedulePlan.id, schedulePlan.activeTaskBatch);
            return msg200({
                activeTaskBatch: scheduleTasks
            })
        } catch (error) {
            console.error("Error on getScheduleTasksBatch: ", error);
            return undefined;
        }
    }
}

export const scheduleTaskUsecase = new ScheduleTaskUsecase();