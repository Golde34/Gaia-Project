import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { TaskTag } from "../domain/dtos/request_dtos/tag.dto";
import { userTagStore } from "../port/store/user-tag.store";
import { EXISTED, EXISTED_MESSAGE, NOT_EXISTED, NOT_EXISTED_MESSAGE } from "../domain/constants/constants";
import { userTagValidation } from "../validations/user-tag.validation";
import { IUserTagEntity } from "../domain/entities/user-tag.entity";

class UserTagService {
    constructor(
        public userTagValidationImpl = userTagValidation,
    ) {}

    async createUserTag(userTag: TaskTag): Promise<IResponse> {
        try {
            if (await userTagValidation.checkExistedTagByUserIdAndTagName(userTag.ownerId, userTag.name) === EXISTED) {
                return msg400(EXISTED_MESSAGE.replace('%s', userTag.name))
            }
            
            const createUserTagResult = await userTagStore.createUserTag(userTag);
            return msg200({
                message: (createUserTagResult as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async updateUserTag(tagId: string, tag: TaskTag): Promise<IResponse> {
        try {
            if (await userTagValidation.checkExistedTagByTagId(tagId) === NOT_EXISTED) {
                return msg400(NOT_EXISTED_MESSAGE.replace('%s', tagId));
            }

            await userTagStore.updateUserTag(tagId, tag);
            const updateUserTag = await userTagStore.findOneTag(tagId);
            return msg200({
                message: (updateUserTag as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async deleteUserTag(tagId: string): Promise<IResponse> {
        try {
            if (await userTagValidation.checkExistedTagByTagId(tagId) === NOT_EXISTED) {
                return msg400(NOT_EXISTED_MESSAGE.replace('%s', tagId));
            }

            const deleteUserTagResult = await userTagStore.deleteUserTag(tagId);
            return msg200({
                message: (deleteUserTagResult as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async findUserTag(tagId: string): Promise<IResponse> {
        try { 
            const getUserTagResult = await userTagStore.findOneTag(tagId);
            return msg200({
                message: (getUserTagResult as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async archiveTag(tagId: string): Promise<IResponse> {
        try {
            if (await userTagValidation.checkExistedTagByTagId(tagId) === NOT_EXISTED) {
                return msg400(NOT_EXISTED_MESSAGE.replace('%s', tagId));
            }

            const archieveTagResult = await userTagStore.archiveTag(tagId);
            return msg200({
                message: (archieveTagResult as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async enableTag(tagId: string): Promise<IResponse> {
        try {
            if (await userTagValidation.checkExistedTagByTagId(tagId) === NOT_EXISTED) {
                return msg400(NOT_EXISTED_MESSAGE.replace('%s', tagId));
            }

            const enableTagResult = await userTagStore.enableTag(tagId);
            return msg200({
                message: (enableTagResult as any)
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }
}

export const userTagService = new UserTagService();