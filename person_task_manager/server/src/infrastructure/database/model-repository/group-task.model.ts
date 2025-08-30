import mongoose, { Schema } from "mongoose";
import { ActiveStatus, BooleanStatus } from "../../../core/domain/enums/enums";
import { IGroupTaskEntity } from "../../../core/domain/entities/group-task.entity";

export const groupTaskSchema = new mongoose.Schema(
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
        tasks: {
            type: [Schema.Types.ObjectId],
            ref: 'Task',
            required: false,
        },
        totalTasks: {
            type: Number,
            required: false,
        },
        completedTasks: {
            type: Number,
            required: false,
        },
        ordinalNumber: {
            type: Number,
            required: false,
        },
        createdAt: {
            type: Date,
            required: false,
        },
        updatedAt: {
            type: Date,
            required: false,
        },
        activeStatus: {
            type: String,
            enum: Object.values(ActiveStatus),
            default: ActiveStatus.active,
        },
        isDefault: {
            type: String,
            enum: Object.values(BooleanStatus),
            default: BooleanStatus.false,
            required: false,
        },
        projectId: {
            type: String,
            required: false,
        },
        tag: {
            type: String,
            required: false,
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

groupTaskSchema.virtual("id").get(function () {
    return this._id.toString();
});



export const GroupTaskEntity = mongoose.model<IGroupTaskEntity>("GroupTask", groupTaskSchema);