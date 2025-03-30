import CacheSingleton from "../../infrastructure/cache/internal-cache/cache-singleton";
import { IScheduleGroupEntity } from "../../infrastructure/entities/schedule-group.entity";
import { scheduleGroupRepository } from "../../infrastructure/repository/schedule-group.repository";
import { InternalCacheConstants } from "../domain/constants/constants";

class ScheduleGroupService {
    constructor(
        public scheduleGroupCache = CacheSingleton.getInstance().getCache(),
    ) { }

    async createScheduleGroup(scheduleGroup: any): Promise<IScheduleGroupEntity> {
        try {
            const createdScheduleGroup = await scheduleGroupRepository.createScheduleGroup(scheduleGroup);
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

    async listScheduleGroup(schedulePlanId: string): Promise<IScheduleGroupEntity[]> {
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
}

export const scheduleGroupService = new ScheduleGroupService();