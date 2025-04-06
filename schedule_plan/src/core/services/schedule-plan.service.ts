import CacheSingleton from "../../infrastructure/cache/internal-cache/cache-singleton";
import { authServiceAdapter } from "../../infrastructure/client/auth-service.adapter";
import { ISchedulePlanEntity } from "../../infrastructure/entities/schedule-plan.entity";
import { schedulePlanRepository } from "../../infrastructure/repository/schedule-plan.repository";
import { returnInternalServiceErrorResponse } from "../../kernel/utils/return-result";
import { IResponse, msg200, msg400, msg500 } from "../common/response";
import { InternalCacheConstants } from "../domain/constants/constants";
import { ActiveStatus } from "../domain/enums/enums";

class SchedulePlanService {
    constructor(
        public schedulePlanCache = CacheSingleton.getInstance().getCache(),
    ) { }

    async createSchedulePlan(userId: number): Promise<any> {
        const existedSchedulePlan = await schedulePlanRepository.findSchedulePlanByUserId(userId);
        if (existedSchedulePlan !== null) {
            return existedSchedulePlan;
        }
        const schedulePlan = {
            userId: userId,
            startDate: new Date(),
            activeStatus: ActiveStatus.active,
            activeTaskBatch: 0,
            isTashBatchActive: false
        }
        return await schedulePlanRepository.createSchedulePlan(schedulePlan);
    }

    async updateSchedulePlan(schedulePlanId: string, schedulePlan: any): Promise<IResponse> {
        try {
            const updateSchedulePlan = await schedulePlanRepository.updateSchedulePlan(schedulePlanId, schedulePlan);
            return msg200({
                message: (updateSchedulePlan as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async deleteSchedulePlan(schedulePlanId: string): Promise<IResponse> {
        try {
            const deleteSchedulePlan = await schedulePlanRepository.deleteSchedulePlan(schedulePlanId);
            return msg200({
                message: (deleteSchedulePlan as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async findSchedulePlanById(schedulePlanId: string): Promise<IResponse> {
        try {
            const schedulePlan = await schedulePlanRepository.findSchedulePlanById(schedulePlanId);
            return msg200({
                schedulePlan: schedulePlan
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async returnSchedulePlanByUserId(userId: number): Promise<IResponse> {
        try {
            const existedUser = await authServiceAdapter.checkExistedUser(userId);
            if (typeof existedUser === 'number') {
                return returnInternalServiceErrorResponse(existedUser, "Call auth service failed: ")
            }

            const schedulePlan = await schedulePlanRepository.findSchedulePlanByUserId(userId);
            let isScheduleExist: boolean = true;
            if (schedulePlan === null) {
                isScheduleExist = false;
            }
            return msg200({
                isScheduleExist
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async findSchedulePlanByUserId(userId: number): Promise<ISchedulePlanEntity | null> {
        try {
            const existedUser = await authServiceAdapter.checkExistedUser(userId);
            if (typeof existedUser === 'number') {
                return null;
            }
            const schedulePlanCache = this.schedulePlanCache.get(InternalCacheConstants.SCHEDULE_PLAN + userId);
            if (!schedulePlanCache) {
                const schedulePlan = await schedulePlanRepository.findSchedulePlanByUserId(userId); 
                if (!schedulePlan) {
                    console.error(`Cannot find schedule plan by user id: ${userId}`);
                    return null;
                }
                this.schedulePlanCache.set(InternalCacheConstants.SCHEDULE_PLAN + userId, schedulePlan);
                return schedulePlan;
            } else {
                console.log('Get schedule plan from cache: ', schedulePlanCache);
                return schedulePlanCache;
            }
        } catch (error: any) {
            console.error("Error on findSchedulePlanByUserId: ", error);
            return null;
        }
    }

    async updateTaskBatch(schedulePlan: ISchedulePlanEntity, activeBatch: number, isBatchActive: boolean): Promise<void> {
        try {
            schedulePlan.activeTaskBatch = activeBatch;
            schedulePlan.isTaskBatchActive = isBatchActive;
            await schedulePlanRepository.updateSchedulePlan(schedulePlan._id, schedulePlan);
        } catch (error: any) {
            console.error("Error on updateTaskBatch: ", error);
        }
    }

    async getSchedulePlanById(schedulePlanId: string): Promise<ISchedulePlanEntity | null> {
        try {
            return await schedulePlanRepository.findSchedulePlanById(schedulePlanId);
        } catch (error: any) {
            console.log("Cannot find schedule plan by id: ", schedulePlanId)
            return null;
        }
    }
}

export const schedulePlanService = new SchedulePlanService();