import { UpdateWriteOpResult } from "mongoose";
import { ActiveStatus } from "../../core/domain/enums/enums";
import { IScheduleGroupEntity, ScheduleGroupEntity } from "../entities/schedule-group.entity";
import { ScheduleGroupStore } from "./store/schedule-group.store";

class ScheduleGroupRepository implements ScheduleGroupStore {
    constructor() { }

    async createScheduleGroup(scheduleGroup: IScheduleGroupEntity): Promise<IScheduleGroupEntity> {
        return await ScheduleGroupEntity.create(scheduleGroup);
    }

    async listScheduleGroup(schedulePlanId: string): Promise<IScheduleGroupEntity[]> {
        return await ScheduleGroupEntity.find({ schedulePlanId: schedulePlanId });
    }

    async updateScheduleGroup(scheduleGroup: IScheduleGroupEntity): Promise<UpdateWriteOpResult> {
        return await ScheduleGroupEntity.updateOne({ _id: scheduleGroup._id }, scheduleGroup);
    }

    async deleteScheduleGroup(scheduleGroupId: string): Promise<IScheduleGroupEntity> {
        const scheduleGroup = await ScheduleGroupEntity.findByIdAndDelete(scheduleGroupId);
        if (scheduleGroup) {
            return scheduleGroup;
        }
        throw new Error("Cannot delete schedule group!");
    }

    async findAllScheduleGroupsToCreateTask(limit: number, date: Date): Promise<IScheduleGroupEntity[]> {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return await ScheduleGroupEntity.find({
            activeStatus: ActiveStatus.active, updateDate: { $lt: startOfDay },
            $or: [{ isFailed: null }, { isFailed: false }]
        }).limit(limit);
    }

    async markAsFail(scheduleGroupId: string): Promise<UpdateWriteOpResult> {
        return await ScheduleGroupEntity.updateOne({ _id: scheduleGroupId }, { isFailed: true });
    }
}

export const scheduleGroupRepository = new ScheduleGroupRepository();
