import { ISchedulePlanEntity } from "../../infrastructure/entities/schedule-plan.entity";
import { scheduleCalendarService } from "../services/schedule-calendar.service";
import { scheduleTaskService } from "../services/schedule-task.service";

class ScheduleCalendarUsecase {
    constructor() { }

    async updateScheduleTasksWithSchedulePlan(userId: number, schedulePlan: ISchedulePlanEntity): Promise<any> {
        const scheduleTasks = await scheduleTaskService.findByTaskBatch(schedulePlan._id, schedulePlan.activeTaskBatch);
        if (!scheduleTasks) {
            console.error(`Cannot find schedule tasks by schedule plan: ${schedulePlan._id}`);
            return;
        }
        const scheduleCalendar = await scheduleCalendarService.findScheduleCalendarByUserId(userId);
        scheduleCalendar.tasks = scheduleTasks
        const updatedScheduleCalendar = await scheduleCalendarService.updateScheduleCalendar(userId, scheduleCalendar);    
        return updatedScheduleCalendar;
    }
}

export const scheduleCalendarUsecase = new ScheduleCalendarUsecase();