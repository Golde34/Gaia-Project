import { IScheduleGroupEntity, ScheduleGroupEntity } from "../entities/schedule-group.entity";
import { ScheduleGroupStore } from "./store/schedule-group.store";

class ScheduleGroupRepository implements ScheduleGroupStore {
    constructor() {}

    async createScheduleGroup(scheduleGroup: IScheduleGroupEntity): Promise<IScheduleGroupEntity> {
        return await ScheduleGroupEntity.create(scheduleGroup);
    }
}

export const scheduleGroupRepository = new ScheduleGroupRepository();
