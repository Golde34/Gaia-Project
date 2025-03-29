import { IScheduleGroupEntity } from "../../infrastructure/entities/schedule-group.entity";
import KafkaHandler from "../../infrastructure/kafka/kafka-handler";
import { scheduleGroupRepository } from "../../infrastructure/repository/schedule-group.repository";

class ScheduleGroupService {
    kafkaHandler: KafkaHandler = new KafkaHandler();

    constructor() { }
    async createScheduleGroup(scheduleGroup: any): Promise<IScheduleGroupEntity> {
        try {
            const createdScheduleGroup = await scheduleGroupRepository.createScheduleGroup(scheduleGroup);
            console.log("Schedule group created successfully: ", scheduleGroup);
            return createdScheduleGroup;
        } catch (error: any) {
            throw new Error(error.message.toString());
        }
    }
}

export const scheduleGroupService = new ScheduleGroupService();