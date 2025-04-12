import { ICommentEntity } from "./comment.entity";
import { IUserTagEntity } from "./user-tag.entity";
import { ISubTaskEntity } from "./sub-task.entity";
import { ActiveStatus } from "../../../core/domain/enums/enums";

export interface ITaskEntity extends Document {
    _id: string;
    title: string;
    description: string;
    priority: string[];
    status: string;
    startDate: Date;
    deadline: Date;
    duration: number;
    subTasks: ISubTaskEntity["_id"][];
    comments: ICommentEntity["_id"][];
    createdAt: Date;
    updatedAt: Date;
    activeStatus: ActiveStatus;
    groupTaskId: string;
    userId: number;
    tag: IUserTagEntity 
}

