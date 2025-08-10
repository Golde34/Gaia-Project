import { IResponse, msg200 } from "../common/response";
import { schedulePlanService } from "../services/schedule-plan.service";

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
}

export const schedulePlanUsecase = new SchedulePlanUsecase;