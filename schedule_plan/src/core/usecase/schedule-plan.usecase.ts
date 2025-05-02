import { IResponse, msg200 } from "../common/response";
import { scheduleCalendarService } from "../services/schedule-calendar.service";
import { schedulePlanService } from "../services/schedule-plan.service";

class SchedulePlanUsecase {
    constructor() {}

    async registerSchedulePlan(userId: number): Promise<IResponse> {
        var isScheduleExist = false;
        try {
            const schedulePlan = await schedulePlanService.createSchedulePlan(userId);
            console.log('Schedule Plan: ', schedulePlan );
            const scheduleCalendar = await scheduleCalendarService.createScheduleCalendar(userId);
            console.log('Schedule Calendar: ', scheduleCalendar );
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

export const schedulePlanUsecase = new SchedulePlanUsecase;