import mongoose from "mongoose";
import { ActiveStatus } from "../../core/domain/enums/enums";

export interface ISchedulePlanEntity extends Document {
    _id: string;
    userId: number;
    startDate: Date;
    endDate: Date;
    activeStatus: ActiveStatus; 
    activeTaskBatch: number;
    isTaskBatchActive: boolean;
}

export const schedulePlanSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
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