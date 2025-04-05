import mongoose from "mongoose";
import { ActiveStatus } from "../../core/domain/enums/enums";

export interface IScheduleGroupEntity extends Document {
    _id: string;
    schedulePlanId: string;
    projectId: string;
    groupTaskId: string;
    title: string;
    priority: string[];
    status: string;
    startHour: Number;
    startMinute: Number;
    endHour: Number;
    endMinute: Number;
    duration: Number;
    preferenceLevel: Number;
    repeat: string[];
    isNotify: boolean;
    activeStatus: ActiveStatus;
    isFailed: boolean;
    createDate: Date;
    updateDate: Date;
}

export const scheduleGroupSchema = new mongoose.Schema(
    {
        schedulePlanId: {
            type: String,
            required: true,
        },
        projectId: {
            type: String,
            required: false,
        },
        groupTaskId: {
            type: String,
            required: false,
        },
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
            default: "IN PROGRESS",
            required: false,
        },
        startHour: {
            type: Number,
            required: false,
        },
        startMinute: {
            type: Number,
            required: false,
        },
        endHour: {
            type: Number,
            required: false,
        },
        endMinute: {
            type: Number,
            required: false,
        },
        duration: {
            type: Number,
            required: false,
        },
        preferenceLevel: {
            type: Number,
            required: false,
        },
        repeat: {
            type: [String],
            required: false,
        },
        isNotify: {
            type: Boolean,
            required: false,
        },
        activeStatus: {
            type: String,
            enum: Object.values(ActiveStatus),
            default: ActiveStatus.active,
            required: true,
        },
        isFailed: {
            type: Boolean,
            require: false,
        }, 
        createDate: {
            type: Date,
            required: true,
        },
        updateDate: {
            type: Date,
            required: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        required: true,
    },
);

scheduleGroupSchema.virtual("id").get(function (this: IScheduleGroupEntity) {
    return this._id.toString();
});

export const ScheduleGroupEntity = mongoose.model<IScheduleGroupEntity>("ScheduleGroup", scheduleGroupSchema);
