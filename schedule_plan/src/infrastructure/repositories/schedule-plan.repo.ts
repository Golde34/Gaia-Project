import { randomUUID } from "crypto";
import SchedulePlanEntity from "../../core/domain/entities/schedule-plan.entity";

class SchedulePlanRepository {
    constructor() {}

    async createSchedulePlan(schedulePlan: any): Promise<SchedulePlanEntity> {
        try {
            const newSchedulePlan = {
                ...schedulePlan,
                id: randomUUID(), 
            }
            return await SchedulePlanEntity.create(newSchedulePlan);
        } catch (error) {
            console.error("Error creating schedule plan:", error);
            throw new Error("Failed to create schedule plan");
        }
    }

    async updateSchedulePlan(scheduleId: string, schedulePlan: any): Promise<SchedulePlanEntity | null> {
        try {
            const [affectedCount, affectedRows] = await SchedulePlanEntity.update(schedulePlan, {
                where: { id: scheduleId },
                returning: true,
            });
            return affectedCount > 0 ? affectedRows[0] : null;
        } catch (error) {
            console.error("Error updating schedule plan:", error);
            throw new Error("Failed to update schedule plan");
        }
    }

    async deleteSchedulePlan(scheduleId: string): Promise<void> {
        try {
            const deletedCount = await SchedulePlanEntity.destroy({ where: { id: scheduleId } });
            if (deletedCount === 0) {
                throw new Error("Schedule plan not found");
            }
        } catch (error) {
            console.error("Error deleting schedule plan:", error);
            throw new Error("Failed to delete schedule plan");
        }
    }

    async findSchedulePlanById(scheduleId: string): Promise<SchedulePlanEntity | null> {
        try {
            return await SchedulePlanEntity.findOne({ where: { id: scheduleId } });
        } catch (error) {
            console.error("Error finding schedule plan by ID:", error);
            throw new Error("Failed to find schedule plan by ID");
        }
    }

    async findSchedulePlanByUserId(userId: number): Promise<SchedulePlanEntity | null> {
        try {
            return await SchedulePlanEntity.findOne({ where: { userId: userId } });
        } catch (error) {
            console.error("Error finding schedule plan by user ID:", error);
            throw new Error("Failed to find schedule plan by user ID");
        }
    }
}

export const schedulePlanRepository = new SchedulePlanRepository();