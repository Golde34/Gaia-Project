import { UpdateWriteOpResult } from "mongoose";
import { IScheduleCalendarEntity, ScheduleCalendarEntity } from "../entities/schedule-calendar.entity";

class ScheduleCalendarRepository {
    constructor() {}

    async createScheduleCalendar(scheduleCalendar: any): Promise<IScheduleCalendarEntity> {
        return await ScheduleCalendarEntity.create(scheduleCalendar);
    }

    async findScheduleCalendarByUserId(userId: number): Promise<IScheduleCalendarEntity | null> {
        return await ScheduleCalendarEntity.findOne({ userId: userId });
    }

    async updateScheduleCalendar(userId: number, scheduleCalendar: any): Promise<UpdateWriteOpResult> {
        return await ScheduleCalendarEntity.updateOne({ userId: userId }, scheduleCalendar);
    }        
}

export const scheduleCalendarRepository = new ScheduleCalendarRepository();
