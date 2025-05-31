import { randomUUID } from "crypto"
import { convertPriority, convertWeekday } from "../../kernel/utils/convert-fields"
import { TaskStatus } from "../domain/enums/enums"

export const scheduleGroupMapper = {
    createGroupMapper(scheduleGroup: any, schedulePlanId: string): any {
        const [startHour, startMinute] = scheduleGroup.startHour.split(':').map(Number)
        const [endHour, endMinute] = scheduleGroup.endHour.split(':').map(Number)
        return {
            id: randomUUID(),
            schedulePlanId: schedulePlanId,
            projectId: scheduleGroup.projectId,
            groupTaskId: scheduleGroup.groupTaskId,
            title: scheduleGroup.title,
            priority: scheduleGroup.priority,
            status: scheduleGroup.status == undefined ? TaskStatus.TODO : scheduleGroup.status,
            startHour: startHour,
            startMinute: startMinute,
            endHour: endHour,
            endMinute: endMinute,
            duration: scheduleGroup.duration,
            preferenceLevel: convertPriority(scheduleGroup.priority),
            repeat: convertWeekday(scheduleGroup.repeat),
            isNotify: scheduleGroup.isNotify,
            activeStatus: scheduleGroup.activeStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
            isFailed: false,
        }
    },

    createDateByHour(now: Date, hour: string, minute: string): Date {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(hour), Number(minute))
    },
}
