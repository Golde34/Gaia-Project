import mongoose from "mongoose";
import { ActiveStatus } from "../../core/domain/enums/enums";
import { IScheduleTaskEntity } from "./schedule-task.entity";

export interface ISchedulePlanEntity extends Document {
    _id: string;
    userId: number;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    activeStatus: ActiveStatus; 
    tasks: IScheduleTaskEntity["_id"][];
    activeTaskBatch: number;
    isTaskBatchActive: boolean;
}

export const schedulePlanSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: false,
        },
        activeStatus: {
            type: String,
            enum: Object.values(ActiveStatus),
            default: ActiveStatus.active,
            required: true,
        },
        tasks: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "ScheduleTask",
            required: false,
        },
        activeTaskBatch: {
            type: Number,
            required: false,
        },
        isTaskBatchActive: {
            type: Boolean,
            required: false,
        },
    }, 
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        required: true,
    },
);

schedulePlanSchema.virtual("id").get(function(this: ISchedulePlanEntity) {
    return this._id.toString();
});

export const SchedulePlanEntity = mongoose.model<ISchedulePlanEntity>("SchedulePlan", schedulePlanSchema);