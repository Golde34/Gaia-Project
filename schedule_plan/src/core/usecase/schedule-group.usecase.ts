import { IResponse, msg200, msg400 } from "../common/response";
import { scheduleGroupMapper } from "../mapper/schedule-group.mapper";
import { scheduleTaskMapper } from "../mapper/schedule-task.mapper";
import { schedulePlanService } from "../services/schedule-plan.service";
import { scheduleTaskService } from "../services/schedule-task.service";

class ScheduleGroupUsecase {
    constructor() {}

    async createScheduleGroup(scheduleGroup: any, userId: number): Promise<IResponse | undefined> {
        try {
            console.log('Create schedule group: ', scheduleGroup);
            const schedulePlan = await schedulePlanService.findSchedulePlanByUserId(userId);
            if (!schedulePlan) {
                console.error(`Cannot find schedule plan by user id: ${userId}`);
                return msg400(`Cannot find schedule plan by user id: ${userId}`);
            }
            const group = scheduleGroupMapper.createGroupMapper(scheduleGroup, schedulePlan._id);
            const createdScheduleTask = await scheduleTaskService.createScheduleTask(group);
            console.log('Created schedule task: ', createdScheduleTask);
            return msg200({
                createdScheduleTask
            })
        } catch (error) {
            console.error("Error on createScheduleTask: ", error);
            return msg400("Cannot create schedule task!");
        }
    }
}

export const scheduleGroupUsecase = new ScheduleGroupUsecase();