import { IScheduleGroupEntity } from "../../entities/schedule-group.entity";

export interface ScheduleGroupStore {
    createScheduleGroup(scheduleGroup: any): Promise<IScheduleGroupEntity>;
}