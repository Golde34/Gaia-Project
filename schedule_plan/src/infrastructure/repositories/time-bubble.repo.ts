import TimeBubblesEntity from "../../core/domain/entities/time-bubble.entity";

class TimeBubbleRepository {
    constructor() {}

    async generateTimeBubble(timeBubble: any): Promise<TimeBubblesEntity | undefined> {
        return await TimeBubblesEntity.create(timeBubble);
    }
}

export const timeBubbleRepository = new TimeBubbleRepository();