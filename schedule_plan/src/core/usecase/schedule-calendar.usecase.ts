import { create } from "domain";
import { ISchedulePlanEntity } from "../../infrastructure/entities/schedule-plan.entity";
import { IResponse, msg200, msg400 } from "../common/response";
import { scheduleCalendarService } from "../services/schedule-calendar.service";
import { scheduleTaskService } from "../services/schedule-task.service";
import { IScheduleCalendarEntity } from "../../infrastructure/entities/schedule-calendar.entity";
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
            let dailyScheduleCalendar: any = null;
            const scheduleCalendar = await scheduleCalendarService.findScheduleCalendarByUserId(Number(body.userId));
            if (!scheduleCalendar) {
                console.error(`Why the user ${body.userId} has no schedule calendar?`);
                const createdScheduleCalendar = await scheduleCalendarService.createScheduleCalendar(Number(body.userId));
                dailyScheduleCalendar = createdScheduleCalendar;
            }
            // clear all tasks in schedule calendar
            dailyScheduleCalendar.tasks = [];
            // get all schedule tasks user has to do today
            dailyScheduleCalendar.tasks = await this.getUserDailyTasks(Number(body.userId));
            return msg200({
                message: "Create daily schedule calendar successfully.",
                scheduleCalendar: dailyScheduleCalendar
            })
        } catch (error: any) {
            console.error("Error on createDailyCalendar: ", error);
            return msg400("Cannot create schedule calendar!");
        }
    }

    private async getUserDailyTasks(userId: number): Promise<any> {
        let tasks = [];
        const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
        if (!schedulePlan) {
            console.error(`Cannot find schedule plan by user id: ${userId}`);
            throw new Error(`Cannot find schedule plan by user id: ${userId}`);
        }
        const scheduleTasks = await scheduleTaskService.getScheduleTaskByBatchNumber(schedulePlan._id, schedulePlan.activeTaskBatch);
        tasks = scheduleTasks.map((task) => task._id);
        const groupScheduleTasks = await scheduleGroupService.getTasksInAllScheduleGroups(schedulePlan._id, new Date()); 
        tasks = tasks.concat(groupScheduleTasks.map((task: { _id: any; }) => task._id));
        return tasks; 
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