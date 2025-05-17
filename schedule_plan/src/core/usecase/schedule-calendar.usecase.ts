import { ISchedulePlanEntity } from "../../infrastructure/entities/schedule-plan.entity";
import { IResponse, msg200, msg400 } from "../common/response";
import { scheduleCalendarService } from "../services/schedule-calendar.service";
import { scheduleTaskService } from "../services/schedule-task.service";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleGroupService } from "../services/schedule-group.service";

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

    async getDailyCalendar(userId: number): Promise<IResponse> {
        try {
            const scheduleCalendar = await scheduleCalendarService.findScheduleCalendarByDate(userId, new Date());
            if (!scheduleCalendar) {
                console.log(`User ${userId} has no schedule calendar for today.`);
                return msg200({
                    message: "User has no schedule calendar for today.",
                    tasks: []
                })
            }
            return msg200({
                message: "Get schedule calendar successfully.",
                tasks: scheduleCalendar.tasks
            })
        } catch (error: any) {
            console.error("Error on getDailyCalendar: ", error);
            return msg400("Cannot get schedule calendar!");
        }
    }

    async createDailyCalendar(body: any): Promise<IResponse> {
        try {
            let scheduleCalendar = await scheduleCalendarService.findScheduleCalendarByUserId(Number(body.userId));
            if (!scheduleCalendar) {
                console.error("Why schedule calendar is null with userId: ", body.userId);
                scheduleCalendar = await scheduleCalendarService.createScheduleCalendar(Number(body.userId));
            }

            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(Number(body.userId));
            if (!schedulePlan) {
                return msg400("Cannot find schedule plan for user!");
            }

            const userDailyTasks = await scheduleTaskService.findUserDailyTasks(schedulePlan._id, schedulePlan.activeTaskBatch, new Date())
            if (userDailyTasks == null || userDailyTasks.length === 0) {
                console.log(`User ${body.userId}  has no tasks, no need to schedule calendar.`);
                return msg200({
                    message: "User has no tasks, no need to schedule calendar.",
                    tasks: []
                })
            }

            scheduleCalendar.tasks = userDailyTasks.map((task) => task._id);

            await scheduleCalendarService.updateScheduleCalendar(Number(body.userId), scheduleCalendar);

            return msg200({
                message: "Create daily schedule calendar successfully.",
                scheduleCalendar
            });
        } catch (error: any) {
            console.error("Error on createDailyCalendar: ", error);
            return msg400("Cannot create schedule calendar!");
        }
    }

    async startDailyCalendar(userId: number): Promise<IResponse> {
        try {
            const scheduleCalendar = await scheduleCalendarService.findScheduleCalendarByDate(userId, new Date());
            if (!scheduleCalendar) {
                console.error(`User ${userId} has no schedule calendar for today.`);
                return await this.createDailyCalendar({userId: userId});
            }
            return msg200({
                message: "Get schedule calendar successfully.",
                tasks: scheduleCalendar.tasks
            })  
        } catch (error: any) {
            console.error("Error on startScheduleCalendar: ", error);
            return msg400("Cannot start schedule calendar!");
        }
    }
}

export const scheduleCalendarUsecase = new ScheduleCalendarUsecase();