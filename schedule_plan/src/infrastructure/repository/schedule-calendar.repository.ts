import { UpdateWriteOpResult } from "mongoose";
import { IScheduleCalendarEntity, ScheduleCalendarEntity } from "../entities/schedule-calendar.entity";

class ScheduleCalendarRepository {
    constructor() { }

    async createScheduleCalendar(scheduleCalendar: any): Promise<IScheduleCalendarEntity> {
        return await ScheduleCalendarEntity.create(scheduleCalendar);
    }

    async findScheduleCalendarByUserId(userId: number): Promise<IScheduleCalendarEntity | null> {
        return await ScheduleCalendarEntity.findOne({ userId: userId });
    }

    async updateScheduleCalendar(userId: number, scheduleCalendar: any): Promise<UpdateWriteOpResult> {
        return await ScheduleCalendarEntity.updateOne({ userId: userId }, scheduleCalendar);
    }

    async findScheduleCalendarByDate(userId: number, date: Date): Promise<IScheduleCalendarEntity | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return await ScheduleCalendarEntity.findOne({ userId: userId, startDate: { $gte: startOfDay, $lte: endOfDay } });
    }
}

export const scheduleCalendarRepository = new ScheduleCalendarRepository();
