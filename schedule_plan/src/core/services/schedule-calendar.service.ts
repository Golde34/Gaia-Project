import { scheduleCalendarRepository } from "../../infrastructure/repository/schedule-calendar.repository";

class ScheduleCalendarService {
    constructor() {}

    async createScheduleCalendar(userId: number): Promise<any> {
        const existedScheduleCalendar = await scheduleCalendarRepository.findScheduleCalendarByUserId(userId);
        if (existedScheduleCalendar !== null) {
            return existedScheduleCalendar;
        }
        const scheduleCalendar = {
            userId: userId,
            startDate: new Date(),
        }
        return await scheduleCalendarRepository.createScheduleCalendar(scheduleCalendar);
    }

    async findScheduleCalendarByUserId(userId: number): Promise<any> {
        try {
            const scheduleCalendar = await scheduleCalendarRepository.findScheduleCalendarByUserId(userId);
            return scheduleCalendar;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async updateScheduleCalendar(userId: number, scheduleCalendar: any): Promise<any> {
        try {
        const updateScheduleCalendar = await scheduleCalendarRepository.updateScheduleCalendar(userId, scheduleCalendar);
            return updateScheduleCalendar;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async findScheduleCalendarByDate(userId: number, date: Date): Promise<any> {
        try {
            const scheduleCalendar = await scheduleCalendarRepository.findScheduleCalendarByDate(userId, date);
            return scheduleCalendar;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    } 
}

export const scheduleCalendarService = new ScheduleCalendarService();
