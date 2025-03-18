import { ISchedulePlanEntity } from "../../infrastructure/entities/schedule-plan.entity";
import { IResponse, msg200 } from "../common/response";
import { schedulePlanService } from "../services/schedule-plan.service";

class SchedulePlanUsercase {
    constructor() {}

    async registerSchedulePlan(userId: number): Promise<IResponse> {
        var isScheduleExist = false;
        try {
            const result = await schedulePlanService.createSchedulePlan(userId);
            console.log('Result: ', result);
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

    // async createSchedulePlan(userId: number): Promise<ISchedulePlanEntity | null> {
    //     try {
    //         const result = await schedulePlanService.createSchedulePlan(userId);
    //         console.log('Result: ', result);
    //         return result;
    //     } catch (error) {
    //         console.error("Error on create Schedule plan: ", error);
    //         return null;
    //     }
    // }
}

export const schedulePlanUsecase = new SchedulePlanUsercase;