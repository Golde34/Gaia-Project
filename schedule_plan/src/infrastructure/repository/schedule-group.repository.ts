import { IScheduleGroupEntity, ScheduleGroupEntity } from "../entities/schedule-group.entity";
import { ScheduleGroupStore } from "./store/schedule-group.store";

class ScheduleGroupRepository implements ScheduleGroupStore {
    constructor() {}

    async createScheduleGroup(scheduleGroup: IScheduleGroupEntity): Promise<IScheduleGroupEntity> {
        return await ScheduleGroupEntity.create(scheduleGroup);
    }

    async listScheduleGroup(schedulePlanId: string): Promise<IScheduleGroupEntity[]> {
        return await ScheduleGroupEntity.find({ schedulePlanId: schedulePlanId });
    }
}

export const scheduleGroupRepository = new ScheduleGroupRepository();
