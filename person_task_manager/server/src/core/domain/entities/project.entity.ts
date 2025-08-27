
import { ActiveStatus, BooleanStatus } from "../enums/enums";
import { IGroupTaskEntity } from "./group-task.entity";

export interface IProjectEntity extends Document {
    _id: string;
    name: string;
    description: string;
    status: string;
    color: string;
    groupTasks: IGroupTaskEntity["_id"][];
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
    activeStatus: ActiveStatus;
    isDefault: BooleanStatus;
    tag: string[];
}