import { IScheduleGroupEntity, ScheduleGroupEntity } from "../../infrastructure/entities/schedule-group.entity"

export const scheduleGroupMapper = {
    createGroupMapper(scheduleGroup: any, schedulePlanId: string): IScheduleGroupEntity{
        const [startHour, startMinute] = scheduleGroup.startHour.split(':').map(Number)
        const [endHour, endMinute] = scheduleGroup.endHour.split(':').map(Number)
        return  new ScheduleGroupEntity({
            schedulePlanId: schedulePlanId,
            groupTaskId: scheduleGroup.groupTaskId,
            title: scheduleGroup.title,
            priority: scheduleGroup.priority,
            status: scheduleGroup.status,
            startHour: startHour,
            startMinute: startMinute,
            endHour: endHour,
            endMinute: endMinute,
            preferenceLevel: scheduleGroup.preferenceLevel,
            repeat: scheduleGroup.repeat,
            isNotify: scheduleGroup.isNotify,
            createDate: new Date(),
            updateDate: new Date(),
        })
    },

    createDateByHour(now: Date, hour: string, minute: string): Date {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(hour), Number(minute))
    },
}
