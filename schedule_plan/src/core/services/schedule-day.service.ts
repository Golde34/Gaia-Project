import { timeBubbleRepository } from "../../infrastructure/repositories/time-bubble.repo";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import { randomUUID } from "crypto";
import { ActiveStatus, ErrorStatus } from "../domain/enums/enums";

class ScheduleDayService {
    constructor() { }

    async generateScheduleConfig(schedule: any, schedulePlan: SchedulePlanEntity): Promise<string> {
        try {
            for (const day in schedule) {
                if (schedule.hasOwnProperty(day)) {
                    const activities = schedule[day];
                    for (const activity of activities) {
                        if (!activity.start || !activity.end || !activity.tag) {
                            throw new Error("Invalid activity data");
                        }
                        const timeBubble = await this.handleDraftScheduleConfig(schedulePlan, Number(day));  
                        console.log("Generated time bubble:", timeBubble);
                    }
                }
            }
            return ErrorStatus.SUCCESS; 
        } catch (error: any) {
            console.error("Error registering schedule config:", error);
            return error.message.toString();
        }
    }
    
    async handleDraftScheduleConfig(schedule: any, dayOfWeek: number): Promise<any> {
        try {
            await timeBubbleRepository.deleteDraftTimeBubbles(schedule.userId, dayOfWeek, ActiveStatus.draft);
            const timeBubble = this.buildTimeBubble(schedule, dayOfWeek, ActiveStatus.draft);
            const createdTimeBubble = await timeBubbleRepository.generateTimeBubble(timeBubble);
            return createdTimeBubble;
        } catch (error: any) {
            console.error("Error handling draft schedule config:", error);
            return error.message.toString();
        } 
    }

    private buildTimeBubble(schedule: any, dayOfWeek: number, status: string): any {
        return {
            id: randomUUID(),
            userId: schedule.userId,
            dayOfWeek: dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            tag: schedule.tag,
            status: status,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async updateTimeBubbleStatus(userId: number, status: string): Promise<void> {
        try {
            await timeBubbleRepository.updateTimeBubbleStatus(userId, status);
        } catch (error: any) {
            console.error("Error updating time bubble status:", error);
            throw error;
        }
    }
}

export const scheduleDayService = new ScheduleDayService();