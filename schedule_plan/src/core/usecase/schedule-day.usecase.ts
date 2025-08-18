import { IResponse, msg200, msg400 } from "../common/response";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { ActiveStatus, ErrorStatus } from "../domain/enums/enums";
import { scheduleDayService } from "../services/schedule-day.service";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";
import { schedulePlanUsecase } from "./schedule-plan.usecase";

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

    async findDailyScheduleTasks(userId: number): Promise<IResponse | undefined> {
        let scheduleTasks: ScheduleTaskEntity[] = [];
        let message: string = "";
        try {
            const schedulePlan: SchedulePlanEntity | null = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                throw new Error("What the heck Schedule plan not found for user ID?: " + userId);
            }

            // Check if the schedule plan has been optimized
            if (schedulePlan.activeStatus === ActiveStatus.active
                && schedulePlan.isTaskBatchActive
                && schedulePlan.activeTaskBatch > 0) {
                scheduleTasks = await scheduleTaskService.getScheduleTaskByBatchNumber(
                    schedulePlan.id, schedulePlan.activeTaskBatch);
                message = "Optimized tasks successfully";
            } else {
                scheduleTasks = await scheduleTaskService.findTopKNewestTask(schedulePlan.id, 5);
                message = "Tasks are not optimized, should you want to optimize them?";
                // push kafka optimize request.
            }

            return msg200({
                message: message,
                tasks: scheduleTasks
            });
        } catch (error: any) {
            console.error("Error getting optimized tasks by user ID:", error.message);
            throw error;
        }
    }

    async generateDailyCalendar(userId: number, scheduleTasks: any[]): Promise<IResponse | undefined> {
        try {
            // get user time bubble query by userId and weekDay
            const weekDay: number = new Date().getDay();
            const timeBubble = await scheduleDayService.inquiryTimeBubbleByUserIdAndWeekday(userId, weekDay);
            // if the tasks dont have their tag, using ai to generate the tag
            // handleTaskTag()
            // after you get the tag for each task, trace back their project, their group task, and mark them a respective tag using asynchronous kafka flow
            // pushKafkaToUpdateTag();
            // match the tasks with the time bubble
            // matchTasksWithTimeBubble(timeBubble, scheduleTasks);
            // generate the daily calendar
            return msg200("Daily calendar generated successfully");
        } catch (error: any) {
            console.error("Error generating daily calendar:", error.message);
            return msg400("Error generating daily calendar");
        }
    }
}

export const scheduleDayUsecase = new ScheduleDayUsecase();