import { runInBackground } from "../../kernel/utils/run-in-background";
import { IResponse, msg200, msg400 } from "../common/response";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { ActiveStatus, ErrorStatus } from "../domain/enums/enums";
import { scheduleTaskMapper } from "../mapper/schedule-task.mapper";
import { scheduleDayService } from "../services/schedule-day.service";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";
import { scheduleTaskUsecase } from "./schedule-task.usecase";

class ScheduleDayUsecase {
    constructor() { }

    async registerScheduleConfig(userId: number): Promise<IResponse | undefined> {
        const schedulePlan = await this.getSchedulePlanByUserId(userId);
        if (!schedulePlan) {
            return msg400("Failed to create schedule plan");
        }

        const updatedUserTimeBubble = await scheduleDayService.updateTimeBubbleStatus(userId, ActiveStatus.active);
        if (updatedUserTimeBubble !== undefined) {
            return msg400("Failed to update user time bubble status");
        }

        return msg200("Schedule plan created successfully");
    }

    async generateScheduleConfig(userId: number, registerScheduleConfig: any): Promise<boolean> {
        const schedulePlan = await this.getSchedulePlanByUserId(userId);
        if (!schedulePlan) {
            console.log("Failed to create schedule plan for user: ", userId);
            return false;
        }

        const schedule = registerScheduleConfig.schedule;
        const scheduleConfigStatus = await scheduleDayService.generateScheduleConfig(schedule, schedulePlan);
        if (scheduleConfigStatus !== ErrorStatus.SUCCESS) {
            console.log("Failed to register schedule config: ", scheduleConfigStatus);
            return false;
        }

        const registerOptimizeTaskConfig = await schedulePlanService.registerTaskConfig(schedulePlan, registerScheduleConfig);
        if (registerOptimizeTaskConfig !== ErrorStatus.SUCCESS) {
            console.log("Failed to register optimize task config: ", registerOptimizeTaskConfig);
            return false;
        }

        return true;
    }

    private async getSchedulePlanByUserId(userId: number): Promise<any | null> {
        try {
            let schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (schedulePlan == null) {
                schedulePlan = await schedulePlanService.createSchedulePlan(userId)
            }
            console.log("Created schedule plan: ", schedulePlan);
            return schedulePlan;
        } catch (error: any) {
            console.error("Error getting schedule plan by user ID:", error.message);
            return null;
        }
    }

    async getTimeBubbleConfig(userId: number): Promise<IResponse | undefined> {
        try {
            const timeBubbleConfig = await scheduleDayService.getTimeBubbleConfig(userId);
            if (!timeBubbleConfig) {
                return msg400("Failed to get time bubble config");
            }
            return msg200(timeBubbleConfig);
        } catch (error: any) {
            console.error("Error getting time bubble config:", error.message);
            return msg400("Error getting time bubble config");
        }
    }

    async returnDailyCalendar(userId: number): Promise<IResponse | undefined> {
        const dailyCalendar = await scheduleDayService.returnDailyCalendar(userId);
        if (dailyCalendar.length === 0 || !dailyCalendar) {
            return this.findDailyScheduleTasks(userId);
        }

        return msg200({
            message: "Daily calendar generated successfully",
            dailyCalendar: dailyCalendar
        });
    }

    async findDailyScheduleTasks(userId: number, topK: number = 5): Promise<IResponse> {
        const plan = await schedulePlanService.findSchedulePlanByUserId(userId);
        if (!plan) {
            throw new Error(`Schedule plan not found for user ID: ${userId}`);
        }

        const isActive = plan.activeStatus === ActiveStatus.active;
        const hasBatching = !!plan.isTaskBatchActive;
        const hasActiveBatch = (plan.activeTaskBatch ?? 0) > 0;

        if (isActive && hasBatching && hasActiveBatch) {
            const tasks = await scheduleTaskService.getScheduleTaskByBatchNumber(
                plan.id,
                plan.activeTaskBatch
            );
            return msg200({
                message: "Optimized tasks successfully.",
                tasks: tasks,
            });
        }

        const tasks = await scheduleTaskService.findTopKNewestTask(plan.id, topK);

        if (isActive && hasBatching && !hasActiveBatch) {
            scheduleTaskService
                .pushOptimizeTaskListKafkaMessage(userId)
                .catch((err: unknown) =>
                    console.error("Failed to enqueue optimize request:", err)
                );

            return msg200({
                message:
                    "Your optimization settings are set. Do you want to use this optimized list?",
                tasks: tasks,
            });
        }

        return msg200({
            message:
                "Tasks are not optimized yet. Please provide your optimization configuration to enable optimization.",
            tasks: tasks,
        });
    }

    async generateDailyCalendar(userId: number, dailyTasks: any[]): Promise<IResponse | undefined> {
        try {
            const [isValidate, tasks] = await this.getDailyTasks(userId, dailyTasks);
            if (!isValidate) return tasks; 
            const weekDay: number = new Date().getDay();
            const timeBubbles = await scheduleDayService.inquiryTimeBubbleByUserIdAndWeekday(userId, weekDay);
            const scheduleTasks: ScheduleTaskEntity[] = scheduleTaskMapper.mapDailyTasksToScheduleTasks(tasks);
            const taggedScheduleTasks = await scheduleTaskUsecase.tagScheduleTask(userId, scheduleTasks);
            if (taggedScheduleTasks === undefined) throw new Error("There's an error when tagged your task to make daily calendar");
            const assignedBubbleList = await scheduleDayService.matchScheduleTasksWithTimeBubble(weekDay, taggedScheduleTasks, timeBubbles);
            runInBackground(() => scheduleDayService.updateDailyCalendar(userId, assignedBubbleList, weekDay));

            return msg200({
                message: "Daily calendar generated successfully",
                dailyCalendar: assignedBubbleList 
            });
        } catch (error: any) {
            console.error("Error generating daily calendar:", error.message);
            return msg400("Error generating daily calendar");
        }
    }

    private async getDailyTasks(userId: number, dailyTasks: any[]): Promise<any> {
        let tasks = [];
        if (dailyTasks == undefined || dailyTasks == null
            || dailyTasks.length === 0 || Array.isArray(dailyTasks)) {
            const scheduleTasks = await scheduleTaskUsecase.findActiveTaskBatch(userId);
            if (scheduleTasks == undefined || scheduleTasks?.length == 0) {
                return [false, msg400("No active task batch found")];
            }
            tasks = scheduleTasks;
        } else {
            tasks = dailyTasks;
        }
        return [true, tasks];
    }

    async editTimeBubble(userId: number, timeBubble: any): Promise<IResponse | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId)
            if (!schedulePlan) return msg400("User is not existed or schedule plan is not created");
            const editedTimeBubbleConfig = await scheduleDayService.editTimeBubbleConfig(timeBubble);
            if (!editedTimeBubbleConfig) return msg400("Edit time bubble config failed");
            const editedScheduleDayBubble = await scheduleDayService.editScheduleDayBubble(editedTimeBubbleConfig.id, timeBubble)
            return msg200({
                timeBubble: editedScheduleDayBubble
            })
        } catch (error: any) {
            console.error("Error edit time bubble: ")
        }
    }
}

export const scheduleDayUsecase = new ScheduleDayUsecase();