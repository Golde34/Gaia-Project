import CacheSingleton from "../../infrastructure/cache/internal-cache/cache-singleton";
import { scheduleGroupRepository } from "../../infrastructure/repositories/schedule-group.repo";
import { InternalCacheConstants } from "../domain/constants/constants";
import ScheduleGroupEntity from "../domain/entities/schedule-group.entity";

class ScheduleGroupService {
    constructor(
        public scheduleGroupCache = CacheSingleton.getInstance().getCache(),
    ) { }

    async createScheduleGroup(scheduleGroup: any): Promise<ScheduleGroupEntity> {
        try {
            const createdScheduleGroup = await scheduleGroupRepository.createScheduleGroup(scheduleGroup);
            if (!createdScheduleGroup) {
                throw new Error("Failed to create schedule group");
            }
            console.log("Schedule group created successfully: ", scheduleGroup);
            this.clearScheduleGroupCache(scheduleGroup.schedulePlanId);
            return createdScheduleGroup;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    private clearScheduleGroupCache(schedulePlanId: string) {
        this.scheduleGroupCache.clear(InternalCacheConstants.SCHEDULE_GROUP_LIST + schedulePlanId);
    }

    async listScheduleGroup(schedulePlanId: string): Promise<ScheduleGroupEntity[]> {
        try {
            const groupListCache = this.scheduleGroupCache.get(InternalCacheConstants.SCHEDULE_GROUP_LIST + schedulePlanId);
            if (!groupListCache) {
                const scheduleGroups = await scheduleGroupRepository.listScheduleGroup(schedulePlanId);
                this.scheduleGroupCache.set(InternalCacheConstants.SCHEDULE_GROUP_LIST + schedulePlanId, scheduleGroups);
                return scheduleGroups;
            }
            console.log("Schedule group list from cache: ", groupListCache);
            return groupListCache;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async updateRotationDay(scheduleGroup: ScheduleGroupEntity, today: Date): Promise<void> {
        try {
            const updatedScheduleGroup = await scheduleGroupRepository.updateRotationDay(scheduleGroup, today);
            if (updatedScheduleGroup === true) {
                this.clearScheduleGroupCache(scheduleGroup.schedulePlanId);
                console.log("Schedule group updated successfully: ", updatedScheduleGroup);
                return;
            }
            throw new Error("Failed to update schedule group");
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async deleteScheduleGroup(scheduleGroupId: string): Promise<ScheduleGroupEntity | null> {
        try {
            const deletedScheduleGroup = await scheduleGroupRepository.deleteScheduleGroup(scheduleGroupId);
            console.log("Deleted schedule group: ", deletedScheduleGroup);
            if (deletedScheduleGroup) {
                console.log("Schedule group deleted successfully: ", deletedScheduleGroup);
                this.clearScheduleGroupCache(deletedScheduleGroup.schedulePlanId);
                console.log("Cache cleared for schedule plan ID: ", deletedScheduleGroup.schedulePlanId);
            }
            return deletedScheduleGroup;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async findAllScheduleGroupsToCreateTask(limit: number, date: Date): Promise<any> {
        try {
            const scheduleGroups = await scheduleGroupRepository.findAllScheduleGroupsToCreateTask(limit, date);
            console.log(scheduleGroups.length >= 1 ? scheduleGroups.map((group: ScheduleGroupEntity) => group.title) : "No schedule groups found");
            return scheduleGroups;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async markAsFail(scheduleGroupId: string): Promise<any> {
        try {
            return await scheduleGroupRepository.markAsFail(scheduleGroupId);
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }

    async findById(scheduleGroupId: string): Promise<ScheduleGroupEntity | null> {
        try {
            return await scheduleGroupRepository.findById(scheduleGroupId);
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }
}

export const scheduleGroupService = new ScheduleGroupService();