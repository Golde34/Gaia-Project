import { IResponse, msg400 } from "../common/response";
import { ErrorStatus } from "../domain/enums/enums";
import { scheduleDayService } from "../services/schedule-day.service";
import { schedulePlanService } from "../services/schedule-plan.service";

class ScheduleDayUsecase {
    constructor() { }

    async registerScheduleConfig(userId: number, registerScheduleConfig: any): Promise<IResponse | undefined> {
        let schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId); 
        if (schedulePlan == null) {
            schedulePlan = await schedulePlanService.createSchedulePlan(userId) 
        }
        console.log("Created schedule plan: ", schedulePlan);
        if (!schedulePlan) {
            return msg400("Failed to create schedule plan");
        }

        const schedule = registerScheduleConfig.schedule;
        const scheduleConfigStatus = await scheduleDayService.registerScheduleConfig(schedule, schedulePlan);
        if (scheduleConfigStatus !== ErrorStatus.SUCCESS) {
            return msg400(scheduleConfigStatus);
        }

        const registerTaskConfig = registerScheduleConfig.totals
        const taskConfigStatus = await schedulePlanService.registerTaskConfig(schedulePlan, registerTaskConfig);

    } 
}

export const scheduleDayUsecase = new ScheduleDayUsecase();