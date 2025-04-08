import { IScheduleGroupEntity, ScheduleGroupEntity } from "../../infrastructure/entities/schedule-group.entity"
import { convertPriority, convertWeekday } from "../../kernel/utils/convert-fields"

export const scheduleGroupMapper = {
    createGroupMapper(scheduleGroup: any, schedulePlanId: string): IScheduleGroupEntity{
        const [startHour, startMinute] = scheduleGroup.startHour.split(':').map(Number)
        const [endHour, endMinute] = scheduleGroup.endHour.split(':').map(Number)
        return  new ScheduleGroupEntity({
            schedulePlanId: schedulePlanId,
            projectId: scheduleGroup.projectId,
            groupTaskId: scheduleGroup.groupTaskId,
            title: scheduleGroup.title,
            priority: scheduleGroup.priority,
            status: scheduleGroup.status,
            startHour: startHour,
            startMinute: startMinute,
            endHour: endHour,
            endMinute: endMinute,
            duration: scheduleGroup.duration,
            preferenceLevel: convertPriority(scheduleGroup.priority),
            repeat: convertWeekday(scheduleGroup.repeat),
            isNotify: scheduleGroup.isNotify,
            acitveStatus: scheduleGroup.acitveStatus,
            createDate: new Date(),
            updateDate: new Date(),
            isFailed: false,
        })
    },

    createDateByHour(now: Date, hour: string, minute: string): Date {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(hour), Number(minute))
    },
}
