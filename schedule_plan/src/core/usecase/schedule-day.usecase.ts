import { IResponse, msg200, msg400 } from "../common/response";
import { ActiveStatus, ErrorStatus } from "../domain/enums/enums";
import { scheduleDayService } from "../services/schedule-day.service";
import { schedulePlanService } from "../services/schedule-plan.service";

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
}

export const scheduleDayUsecase = new ScheduleDayUsecase();