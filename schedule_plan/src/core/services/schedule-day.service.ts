import { timeBubbleRepository } from "../../infrastructure/repositories/time-bubble.repo";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import { randomUUID } from "crypto";
import { ActiveStatus, ErrorStatus } from "../domain/enums/enums";
import { dayOfWeekMap } from "../domain/constants/constants";

class ScheduleDayService {
    constructor() { }

    async generateScheduleConfig(schedule: any, schedulePlan: SchedulePlanEntity): Promise<string> {
        try {
            for (const day in schedule) {
                if (schedule.hasOwnProperty(day)) {
                    const activities = schedule[day];
                    if (activities.length === 0) {
                        continue;
                    }
                    await timeBubbleRepository.deleteDraftTimeBubbles(schedulePlan.userId, Number(day), ActiveStatus.draft);
                    for (const activity of activities) {
                        if (!activity.start || !activity.end || !activity.tag) {
                            throw new Error("Invalid activity data");
                        }
                        const timeBubble = this.buildTimeBubble(activity, schedulePlan, Number(day), ActiveStatus.draft);
                        await timeBubbleRepository.generateTimeBubble(timeBubble);
                    }
                }
            }
            return ErrorStatus.SUCCESS;
        } catch (error: any) {
            console.error("Error registering schedule config:", error);
            return error.message.toString();
        }
    }

    private buildTimeBubble(activity: any, schedulePlan: SchedulePlanEntity, dayOfWeek: number, status: string): any {
        return {
            id: randomUUID(),
            userId: schedulePlan.userId,
            dayOfWeek: dayOfWeek,
            dayOfWeekStr: dayOfWeekMap[dayOfWeek],
            startTime: activity.start,
            endTime: activity.end,
            tag: activity.tag,
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

    async getTimeBubbleConfig(userId: number): Promise<any> {
        try {
            return await timeBubbleRepository.findAllByUserId(userId);
        } catch (error: any) {
            console.error("Error getting time bubble config:", error);
            throw error;
        }
    }

}

export const scheduleDayService = new ScheduleDayService();