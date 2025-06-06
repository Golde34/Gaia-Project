import { randomUUID } from "crypto";
import ScheduleCalendarEntity from "../../core/domain/entities/schedule-calendar.entity";
import { Op } from "sequelize";

class ScheduleCalendarRepository {
    async createScheduleCalendar(scheduleCalendar: any): Promise<ScheduleCalendarEntity | undefined> {
        try {
            const newScheduleCalendar = {
                ...scheduleCalendar,
                id: randomUUID() 
            };
            return await ScheduleCalendarEntity.create(newScheduleCalendar);
        } catch (error) {
            console.error("Error creating schedule calendar:", error);
            throw new Error("Failed to create schedule calendar");
        }
    }

    async findScheduleCalendarByUserId(userId: number): Promise<ScheduleCalendarEntity | null> {
        try {
            return await ScheduleCalendarEntity.findOne({ where: { userId: userId } });
        } catch (error) {
            console.error("Error finding schedule calendar by userId:", error);
            throw new Error("Failed to find schedule calendar by userId");
        }
    }

    async updateScheduleCalendar(userId: number, scheduleCalendar: any): Promise<ScheduleCalendarEntity | null> {
        try {
            const [affectedCount, affectedRows] = await ScheduleCalendarEntity.update(scheduleCalendar, {
                where: { userId: userId },
                returning: true,
            });
            return affectedCount > 0 ? affectedRows[0] : null;
        } catch (error) {
            console.error("Error updating schedule calendar:", error);
            throw new Error("Failed to update schedule calendar");
        }
    }

    async findScheduleCalendarByDate(userId: number, date: Date): Promise<ScheduleCalendarEntity | null> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return await ScheduleCalendarEntity.findOne({
                where: {
                    userId: userId,
                    startDate: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay,
                    },
                },
            });
        } catch (error) {
            console.error("Error finding schedule calendar by date:", error);
            throw new Error("Failed to find schedule calendar by date");
        }
    }
}

export const scheduleCalendarRepository = new ScheduleCalendarRepository();