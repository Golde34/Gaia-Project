import { AssignedBubble } from "../../core/domain/dto/assigned-bubble.dto";
import ScheduleDayBubbleEntity from "../../core/domain/entities/schedule-day.entity";
import { randomUUID } from "crypto";

class ScheduleDayRepository {
    constructor() { }

    async createScheduleDay(userId: number, assignedBubble: AssignedBubble): Promise<ScheduleDayBubbleEntity | undefined> {
        const scheduleDay = {
            id: randomUUID(),
            userId: userId,
            tag: assignedBubble.tag,
            startTime: assignedBubble.startTime,
            endTime: assignedBubble.endTime,
            weekDay: assignedBubble.weekDay,
            primaryTaskId: assignedBubble.primaryTaskId,
            backupTaskId: assignedBubble.backupTaskId,
            primaryTaskTitle: assignedBubble.primaryTaskTitle,
            backupTaskTitle: assignedBubble.backupTaskTitle,
            createdAt: new Date(),
            updatedAt: new Date(),
        } 
        return await ScheduleDayBubbleEntity.create(scheduleDay);
    }

    async deleteScheduleDay(userId: number, weekDay: number): Promise<number> {
        return await ScheduleDayBubbleEntity.destroy({ where: { userId: userId, weekDay: weekDay }});
    }

    async findByWeekDay(userId: number, weekDay: number): Promise<ScheduleDayBubbleEntity[]> {
        return await ScheduleDayBubbleEntity.findAll({ where: { userId: userId, weekDay: weekDay }});
    }

    async listScheduleDay(weekDay: number, userId: number): Promise<ScheduleDayBubbleEntity[]> {
        return await ScheduleDayBubbleEntity.findAll({
            where: { weekDay: weekDay, userId: userId },
            order: [['startTime', 'ASC']]
        })
    }
}

export const scheduleDayRepository = new ScheduleDayRepository();
