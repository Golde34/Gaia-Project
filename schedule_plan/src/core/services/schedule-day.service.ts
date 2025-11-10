import KafkaHandler from "../../infrastructure/kafka/kafka-handler";
import { scheduleDayRepository } from "../../infrastructure/repositories/schedule-day.repo";
import { timeBubbleRepository } from "../../infrastructure/repositories/time-bubble.repo";
import { parseTime } from "../../kernel/utils/string-utils";
import { AssignedBubble } from "../domain/dto/assigned-bubble.dto";
import ScheduleDayBubbleEntity from "../domain/entities/schedule-day.entity";
import SchedulePlanEntity from "../domain/entities/schedule-plan.entity";
import ScheduleTaskEntity from "../domain/entities/schedule-task.entity";
import TimeBubblesEntity from "../domain/entities/time-bubble.entity";
import { ActiveStatus } from "../domain/enums/enums";
import { timeBubbleMapper } from "../mapper/time-bubble.mapper";

class ScheduleDayService {
    constructor(
        public kafkaHandler: KafkaHandler = new KafkaHandler(),
    ) { }

    async generateScheduleConfig(schedule: any, schedulePlan: SchedulePlanEntity): Promise<any> {
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
                        const timeBubble = timeBubbleMapper.buildTimeBubble(activity, schedulePlan, Number(day), ActiveStatus.draft);
                        await timeBubbleRepository.generateTimeBubble(timeBubble);
                    }
                }
            }
            return await this.getTimeBubbleConfig(schedulePlan.userId);
        } catch (error: any) {
            console.error("Error registering schedule config:", error);
            return error.message.toString();
        }
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

    async inquiryTimeBubbleByUserIdAndWeekday(userId: number, weekDay: number): Promise<any> {
        try {
            return await timeBubbleRepository.findByUserIdAndWeekday(userId, weekDay);
        } catch (error: any) {
            console.error("Error inquiring time bubble by user ID and weekday:", error);
            throw error;
        }
    }

    async matchScheduleTasksWithTimeBubble(weekDay: number, scheduleTasks: ScheduleTaskEntity[], timeBubbles: TimeBubblesEntity[]): Promise<AssignedBubble[]> {
        try {
            const results: AssignedBubble[] = [];
            const tags = ["work", "relax", "eat", "travel", "sleep"];

            // Group tasks by tag
            const taskMap = new Map<string, ScheduleTaskEntity[]>();
            for (const tag of tags) {
                taskMap.set(tag, scheduleTasks.filter(t => t.tag === tag));
            }

            // Track current task index + remaining duration for each tag
            const taskPointers = new Map<string, { index: number; remaining: number }>();
            for (const tag of tags) {
                const tagTasks = taskMap.get(tag) || [];
                if (tagTasks.length > 0) {
                    taskPointers.set(tag, {
                        index: 0,
                        remaining: tagTasks[0].duration * 60 // convert to minute,
                    });
                }
            }

            for (const bubble of timeBubbles) {
                const duration = parseTime(bubble.endTime) - parseTime(bubble.startTime);
                const matchedTag = tags.find(tag => bubble.tag === tag) || null;

                if (!matchedTag) {
                    continue;
                }

                const tagTasks = taskMap.get(matchedTag) || [];
                const pointer = taskPointers.get(matchedTag);

                if (!pointer || pointer.index >= tagTasks.length) {
                    results.push(this.mappingPointer(bubble, matchedTag, null, null, weekDay))
                    continue;
                }

                const primary = tagTasks[pointer.index];
                const backup = (pointer.index + 1 < tagTasks.length)
                    ? tagTasks[pointer.index + 1]
                    : null;

                results.push(this.mappingPointer(bubble, matchedTag, primary, backup, weekDay));

                // Reduce remaining time of primary task
                pointer.remaining -= duration
                if (pointer.remaining <= 0 && backup && typeof backup.duration === "number") {
                    pointer.index++
                    pointer.remaining = backup.duration * 60 + pointer.remaining
                } 
                // If finished, move to next task
                if (pointer.remaining <= 0) {
                    pointer.index++;
                    pointer.remaining = 0;
                    if (pointer.index < tagTasks.length) {
                        pointer.remaining = tagTasks[pointer.index].duration + pointer.remaining; // carry over excess time
                    }
                }
            }

            return results;
        } catch (error: any) {
            console.error("Error while match schedule tasks with time bubbles, ", error);
            throw new Error("Error while match schedule tasks with time bubbles")
        }
    }

    private mappingPointer(bubble: any, matchedTag: string, primary: any | null, backup: any | null, weekDay: number) {
        return {
            startTime: bubble.startTime,
            endTime: bubble.endTime,
            tag: matchedTag,
            primaryTaskId: primary?.taskId || null,
            primaryTaskTitle: primary?.title || null,
            backupTaskId: backup?.taskId || null,
            backupTaskTitle: backup?.title || null,
            weekDay: weekDay,
            timeBubbleId: bubble.id,
        }
    }

    async updateDailyCalendar(userId: number, assignedBubbleList: AssignedBubble[], weekDay: number): Promise<any[]> {
        try {
            const scheduleDayList = await scheduleDayRepository.findByWeekDay(userId, weekDay);
            if (scheduleDayList.length > 0) {
                await scheduleDayRepository.deleteScheduleDay(userId, weekDay);
            }

            const scheduleList = await Promise.all(
                assignedBubbleList.map(async (bubble) => {
                    const scheduleDay = await scheduleDayRepository.createScheduleDay(userId, bubble);
                    console.log(`Save scheduleday of user ${userId}: ${scheduleDay}`);
                    return scheduleDay;
                })
            );

            return scheduleList;
        } catch (error: any) {
            console.error("Error inquiring time bubble by user ID and weekday:", error);
            throw error;
        }
    }

    async returnDailyCalendar(userId: number): Promise<ScheduleDayBubbleEntity[]> {
        try {
            const weekDay: number = new Date().getDay();
            return await scheduleDayRepository.listScheduleDay(weekDay, userId);
        } catch (error: any) {
            console.error("Error returning daily calendar:", error);
            throw error;
        }
    }

    async editTimeBubbleConfig(timeBubble: any): Promise<any> {
        try {
            return await timeBubbleRepository.updateTimeBubble(timeBubble);
        } catch (error: any) {
            console.error("Error when updating time bubble config: ", error);
            throw error;
        }
    }

    async editScheduleDayBubble(timeBubbleId: string, timeBubble: any): Promise<any> {
        try {
            if (timeBubbleId != timeBubble.timeBubbleId) throw Error('Time bubble id was not matched');
            return await scheduleDayRepository.updateScheduleDay(timeBubble);
        } catch (error: any) {
            console.error("Error when updating schedule day bubble: ", error);
            throw error;
        }
    }
}

export const scheduleDayService = new ScheduleDayService();