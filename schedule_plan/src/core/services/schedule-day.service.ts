import { timeBubbleRepository } from "../../infrastructure/repositories/time-bubble.repo";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import { randomUUID } from "crypto";
import { ErrorStatus } from "../domain/enums/enums";

class ScheduleDayService {
    constructor() { }

    async registerScheduleConfig(schedule: any, schedulePlan: SchedulePlanEntity): Promise<string> {
        try {
            for (const day in schedule) {
                if (schedule.hasOwnProperty(day)) {
                    const activities = schedule[day];
                    for (const activity of activities) {
                        if (!activity.start || !activity.end || !activity.tag) {
                            throw new Error("Invalid activity data");
                        }
                        const timeBubble = {
                            id: randomUUID(),
                            userId: schedulePlan.userId,
                            dayOfWeek: parseInt(day, 10),
                            startTime: activity.start,
                            endTime: activity.end,
                            tag: activity.tag,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        const scheduleBubble = await timeBubbleRepository.generateTimeBubble(timeBubble); 
                        console.log("Generated time bubble:", scheduleBubble);
                    }
                }
            }
            return ErrorStatus.SUCCESS; 
        } catch (error: any) {
            console.error("Error registering schedule config:", error);
            return error.message.toString();
        }
    }
}

export const scheduleDayService = new ScheduleDayService();