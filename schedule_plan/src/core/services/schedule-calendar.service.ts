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
}

export const scheduleCalendarService = new ScheduleCalendarService();
