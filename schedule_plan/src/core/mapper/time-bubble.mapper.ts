import { randomUUID } from "crypto";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import { dayOfWeekMap } from "../domain/constants/constants";

export const timeBubbleMapper = {
    buildTimeBubble(activity: any, schedulePlan: SchedulePlanEntity, dayOfWeek: number, status: string): any {
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
}