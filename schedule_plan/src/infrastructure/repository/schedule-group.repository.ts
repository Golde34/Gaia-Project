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

    async deleteScheduleGroup(scheduleGroupId: string): Promise<IScheduleGroupEntity> {
        const scheduleGroup = await ScheduleGroupEntity.findByIdAndDelete(scheduleGroupId);
        if (scheduleGroup) {
            return scheduleGroup;
        }
        throw new Error("Cannot delete schedule group!");
    }
}

export const scheduleGroupRepository = new ScheduleGroupRepository();
