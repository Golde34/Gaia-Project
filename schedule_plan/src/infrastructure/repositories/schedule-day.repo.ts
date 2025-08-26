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
            primaryTaskId: assignedBubble.primaryTaskId,
            backupTaskId: assignedBubble.backupTaskId,
            primaryTaskTitle: assignedBubble.primaryTaskTitle,
            backupTaskTitle: assignedBubble.backupTaskTitle,
            createdAt: new Date(),
            updatedAt: new Date(),
        } 
        return await ScheduleDayBubbleEntity.create(scheduleDay);
    }

    async listScheduleDay(userId: number): Promise<ScheduleDayBubbleEntity[]> {
        return await ScheduleDayBubbleEntity.findAll({ where: { userId: userId }});
    }
}

export const scheduleDayRepository = new ScheduleDayRepository();
