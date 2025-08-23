import ScheduleDayBubbleEntity from "../../core/domain/entities/schedule-day.entity";

class ScheduleDayRepository {
    constructor() { }

    async createScheduleDay(scheduleDay: any): Promise<ScheduleDayBubbleEntity | undefined> {
        return await ScheduleDayBubbleEntity.create(scheduleDay);
    }

    async listScheduleDay(userId: number): Promise<ScheduleDayBubbleEntity[]> {
        return await ScheduleDayBubbleEntity.findAll({ where: { userId: userId }});
    }
}

export const scheduleDayRepository = new ScheduleDayRepository();
