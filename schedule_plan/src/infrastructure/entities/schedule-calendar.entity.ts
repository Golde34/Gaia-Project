import mongoose from "mongoose";
import { IScheduleTaskEntity } from "./schedule-task.entity";

export interface IScheduleCalendarEntity extends Document {
    _id: string;
    userId: number;
    tasks: IScheduleTaskEntity["_id"][];
    startDate: Date;
}

export const scheduleCalendarSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
        },
        tasks: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "ScheduleTask",
            required: false,
        },
        startDate: {
            type: Date,
            required: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        required: true,
    },
);

scheduleCalendarSchema.virtual("id").get(function(this: IScheduleCalendarEntity) {
    return this._id.toString();
});

export const ScheduleCalendarEntity = mongoose.model<IScheduleCalendarEntity>("SchedulePlan", scheduleCalendarSchema);
