import { IResponse, msg200 } from "../common/response";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import { ActiveStatus } from "../domain/enums/enums";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";

class SchedulePlanUsecase {
    constructor() {}

    async registerSchedulePlan(userId: number): Promise<IResponse> {
        var isScheduleExist = false;
        try {
            const schedulePlan = await schedulePlanService.createSchedulePlan(userId);
            console.log('Schedule Plan: ', schedulePlan );
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

    async optimizedAndListTasksByUserId(userId: number): Promise<any> {
        try {
            const schedulePlan: SchedulePlanEntity | null = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                throw new Error("What the heck Schedule plan not found for user ID?: " + userId);
            }
            // if (schedulePlan.activeStatus !== ActiveStatus.active
            //     || !schedulePlan.isTaskBatchActive
            //     || schedulePlan.activeTaskBatch <= 0) {
            //         await scheduleTaskService.optimizeTasks(userId)
            //     }
        } catch (error: any) {
            console.error("Error getting optimized tasks by user ID:", error.message);
            throw error;
        }
    }
}

export const schedulePlanUsecase = new SchedulePlanUsecase;