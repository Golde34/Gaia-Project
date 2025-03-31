import CacheSingleton from "../../infrastructure/cache/internal-cache/cache-singleton";
import { IResponse, msg200, msg400 } from "../common/response";
import { scheduleGroupMapper } from "../mapper/schedule-group.mapper";
import { scheduleGroupService } from "../services/schedule-group.service";
import { schedulePlanService } from "../services/schedule-plan.service";

class ScheduleGroupUsecase {
    constructor(
        public scheduleGroupCache = CacheSingleton.getInstance().getCache(),
    ) { }

    async createScheduleGroup(scheduleGroup: any, userId: number): Promise<IResponse | undefined> {
        try {
            console.log('Create schedule group: ', scheduleGroup);
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                return msg400(`Cannot find schedule plan by user id: ${userId}`);
            }
            const group = scheduleGroupMapper.createGroupMapper(scheduleGroup, schedulePlan._id);
            const createScheduleGroup = await scheduleGroupService.createScheduleGroup(group);
            console.log('Created schedule group: ', group);
            return msg200(createScheduleGroup);
        } catch (error) {
            console.error("Error on createScheduleTask: ", error);
            return msg400("Cannot create schedule task!");
        }
    }

    async getScheduleGroupList(userId: number): Promise<IResponse | undefined> {
        try {
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                throw new Error(`Cannot find schedule plan by user id: ${userId}`);
            }
            console.log('Get schedule task list by schedule plan: ', schedulePlan._id);
            const scheduleGroups = await scheduleGroupService.listScheduleGroup(schedulePlan._id);
            if (scheduleGroupService) {
                return msg200({
                    scheduleGroups
                })
            }
            return msg400("Cannot get schedule task list!");
        } catch (error) {
            console.error("Error on getScheduleTaskList: ", error);
            return msg400("Cannot get schedule task list!");
        }
    }

    async deleteScheduleGroup(scheduleGroupId: string): Promise<IResponse | undefined> {
        try {
            const scheduleGroup = await scheduleGroupService.deleteScheduleGroup(scheduleGroupId);
            if (scheduleGroup) {
                return msg200(scheduleGroup);
            }
            return msg400("Cannot delete schedule group!");
        } catch (error) {
            console.error("Error on deleteScheduleTask: ", error);
            return msg400("Cannot delete schedule task!");
        }
    }
}

export const scheduleGroupUsecase = new ScheduleGroupUsecase();