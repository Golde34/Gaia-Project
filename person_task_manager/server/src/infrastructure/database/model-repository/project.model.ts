import mongoose, { Schema } from "mongoose";
import { ActiveStatus, BooleanStatus } from "../../../core/domain/enums/enums";
import { IProjectEntity } from "../../../core/domain/entities/project.entity";

export const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: false,
        },
        groupTasks: {
            type: [Schema.Types.ObjectId],
            ref: 'GroupTask',
            required: false,
        },
        ownerId: {
            type: Number,
            required: true,
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
            required: true,
        },
        isDefault: {
            type: String,
            enum: Object.values(BooleanStatus),
            default: BooleanStatus.false,
            required: false,
        },
        tag: {
            type: [String],
            required: false,
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

projectSchema.virtual("id").get(function () {
    return this._id.toString();
});

export const ProjectEntity = mongoose.model<IProjectEntity>("Project", projectSchema);