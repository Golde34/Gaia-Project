import { ActiveStatus, BooleanStatus } from "../../../core/domain/enums/enums";
import { ITaskEntity } from "./task.entity";

export interface IGroupTaskEntity extends Document {
    _id: string;
    title: string;
    description: string;
    priority: string[];
    status: string;
    tasks: ITaskEntity["_id"][];
    totalTasks: number;
    completedTasks: number;
    ordinalNumber: number;
    createdAt: Date;
    updatedAt: Date;
    activeStatus: ActiveStatus;
    isDefault: BooleanStatus;
    projectId: string;
    tag: string;
}