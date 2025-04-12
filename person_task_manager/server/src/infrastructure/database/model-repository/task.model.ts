import mongoose, { Schema } from "mongoose";
import { ActiveStatus } from "../../../core/domain/enums/enums";
import { ITaskEntity } from "../../../core/domain/entities/task.entity";

export const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        priority: {
            type: [String],
            required: true,
        },
        status: {
            type: String,
            required: true,
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
            required: false,
        },
        subTasks: {
            type: [Schema.Types.ObjectId],
            ref: 'SubTask',
            required: false,
        },
        comments: {
            type: [Schema.Types.ObjectId],
            ref: 'Comment',
            required: false,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        updatedAt: {
            type: Date,
            required: true,
        },
        activeStatus: {
            type: String,
            enum: Object.values(ActiveStatus),
            default: ActiveStatus.active,
        },
        groupTaskId: {
            type: String,
            required: false,
        },
        userId: {
            type: Number,
            required: false,
        },
        tag: {
            type: [Schema.Types.ObjectId],
            ref: 'Tag',
            required: false,
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

taskSchema.virtual("id").get(function () {
    return this._id.toString();
});

export const TaskEntity = mongoose.model<ITaskEntity>("Task", taskSchema);