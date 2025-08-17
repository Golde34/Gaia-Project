import TimeBubblesEntity from "../../core/domain/entities/time-bubble.entity";

class TimeBubbleRepository {
    constructor() {}

    async generateTimeBubble(timeBubble: any): Promise<TimeBubblesEntity | undefined> {
        return await TimeBubblesEntity.create(timeBubble);
    }

    async deleteDraftTimeBubbles(userId: number, dayOfWeek: number, status: string): Promise<void> {
        try {
            await TimeBubblesEntity.destroy({
                where: {
                    userId: userId,
                    dayOfWeek: dayOfWeek,
                    status: status 
                }
            });
        } catch (error) {
            console.error("Error deleting draft time bubbles:", error);
        }
    } 

    async updateTimeBubbleStatus(userId: number, status: string): Promise<void> {
        try {
            await TimeBubblesEntity.update(
                { status: status },
                { where: { userId: userId } }
            ); 
        } catch (error: any) {
            console.error("Error updating time bubble status:", error.message);
        }
    }

    async findAllByUserId(userId: number): Promise<any> {
        try {
            return await TimeBubblesEntity.findAll({
                where: { userId: userId }
            });
        } catch (error: any) {
            console.error("Error finding time bubble config by user ID:", error.message);
            throw error;
        }
    }

    async findByUserIdAndWeekday(userId: number, weekDay: number): Promise<any> {
        try {
            return await TimeBubblesEntity.findOne({
                where: {
                    userId: userId,
                    dayOfWeek: weekDay
                }
            });
        } catch (error: any) {
            console.error("Error finding time bubble by user ID and weekday:", error.message);
            throw error;
        }
    }
}

export const timeBubbleRepository = new TimeBubbleRepository();