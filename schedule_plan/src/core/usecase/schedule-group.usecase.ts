import { IResponse } from "../common/response";
import { schedulePlanService } from "../services/schedule-plan.service";

class ScheduleGroupUsecase {
    constructor() {}

    async createScheduleGroup(scheduleGroup: any): Promise<IResponse | undefined> {
        try {
            console.log('Create schedule group: ', scheduleGroup);
            const schedulePlan = await schedulePlanServicr.findSchedulePlanByUserId(scheduleTask.userId);
            if (schedulePlan === undefined || schedulePlan === null) {
                console.error(`Cannot find schedule plan by user id: ${scheduleTask.userId}`);
                return msg400(`Cannot find schedule plan by user id: ${scheduleTask.userId}`);
            }
            const task = scheduleTaskMapper.restCreateTaskMapper(scheduleTask, schedulePlan._id);
            const createdScheduleTask = await scheduleTaskService.createScheduleTask(task);
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