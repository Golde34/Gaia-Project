import { IResponse, msg200 } from "../common/response";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import { ActiveStatus } from "../domain/enums/enums";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";

class SchedulePlanUsecase {
    constructor() { }

    async registerSchedulePlan(userId: number): Promise<IResponse> {
        var isScheduleExist = false;
        try {
            const schedulePlan = await schedulePlanService.createSchedulePlan(userId);
            console.log('Schedule Plan: ', schedulePlan);
            isScheduleExist = true;
            return msg200({
                isScheduleExist
            });
        } catch (error) {
            console.error("Error on create Schedule plan: ", error);
            return msg200({
                isScheduleExist
            });
        }
    }

    async findOptimizedScheduleTasksByUserId(userId: number): Promise<any> {
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
                scheduleTasks: scheduleTasks
            });
        } catch (error: any) {
            console.error("Error getting optimized tasks by user ID:", error.message);
            throw error;
        }
    }
}

export const schedulePlanUsecase = new SchedulePlanUsecase;