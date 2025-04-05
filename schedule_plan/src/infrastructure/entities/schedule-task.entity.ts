import mongoose from "mongoose";

export interface IScheduleTaskEntity extends Document {
    _id: string;
    taskId: string;
    title: string;
    priority: string[];
    status: string;
    startDate: Date;
    deadline: Date;
    duration: Number;
    activeStatus: string;
    preferenceLevel: Number;
    isSynchronizedWithWO: boolean;
    taskOrder: Number;
    weight: Number;
    stopTime: Number;
    taskBatch: Number;
    schedulePlanId: string;
    isNotify: boolean;
    createDate: Date;
    scheduleGroupId: string;
}

export const scheduleTaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        priority: {
            type: [String],
            required: true,
        },
        status: {
            type: String,
            required: false,
        },
        startDate: {
            type: Date,
            required: false,
        },
        deadline: {
            type: Date,
            required: false,
        },
        duration: {
            type: Number,
            required: true,
        },
        activeStatus: {
            type: String,
            required: true,
        },
        preferenceLevel: {
            type: Number,
            required: true,
        },
        taskId: {
            type: String,
            required: false,
        },
        isSynchronizedWithWO: {
            type: Boolean,
            required: false,        
        },
        taskOrder: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        },
        stopTime: {
            type: Number,
            required: false,
        },
        taskBatch: {
            type: Number,
            required: false,
        },
        schedulePlanId: {
            type: String,
            required: true,
        },
        isNotify: {
            type: Boolean,
            required: false,
        },
        createDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        scheduleGroupId: {
            type: String,
            required: false,
        }
    }, 
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        required: true,
    },
);

scheduleTaskSchema.virtual("id").get(function(this: IScheduleTaskEntity) {
    return this._id.toString();
});

export const ScheduleTaskEntity = mongoose.model<IScheduleTaskEntity>("ScheduleTask", scheduleTaskSchema);
