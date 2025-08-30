import { UpdateWriteOpResult } from "mongoose";
import { DeleteResult } from "mongodb";
import { TaskTag } from "../../../core/domain/dtos/request_dtos/tag.dto";
import { UserTagEntity } from "../model-repository/user-tag.model";
import { ActiveStatus } from "../../../core/domain/enums/enums";
import { IUserTagEntity } from "../../../core/domain/entities/user-tag.entity";

class UserTagRepository {
    constructor() { }

    async createUserTag(tag: TaskTag): Promise<IUserTagEntity> {
        return await UserTagEntity.create(tag);
    }

    async updateUserTag(tagId: string, tag: TaskTag): Promise<UpdateWriteOpResult> {
        return await UserTagEntity.updateOne({ _id: tagId }, tag);
    }

    async deleteUserTag(tagId: string): Promise<DeleteResult> {
        return await UserTagEntity.deleteOne({ _id: tagId });
    }

    async findTagsByUserId(userId: string): Promise<IUserTagEntity[] | null> {
        return await UserTagEntity.find({
            ownerId: userId,
            ActiveStatus: ActiveStatus.active
        });
    }

    async findTagByUserIdAndTagName(userId: number, tagName: string): Promise<IUserTagEntity | null> {
        return await UserTagEntity.findOne({
            ownerId: userId,
            name: tagName,
            activeStatus: ActiveStatus.active
        });
    }

    async findOneTag(tagId: string): Promise<IUserTagEntity | null> {
        return await UserTagEntity.findOne({ _id: tagId });
    }

    async archiveTag(tagId: string): Promise<UpdateWriteOpResult> {
        return await UserTagEntity
            .updateOne({ _id: tagId },
                { activeStatus: ActiveStatus.inactive });
    }

    async enableTag(tagId: string): Promise<UpdateWriteOpResult> {
        return await UserTagEntity
            .updateOne({ _id: tagId },
                { activeStatus: ActiveStatus.active });
    }

    async findTagByTagId(tagId: string): Promise<IUserTagEntity | null> {
        return await UserTagEntity.findOne({ _id: tagId });
    }
}
export const userTagRepository = new UserTagRepository();