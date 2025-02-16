import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { ctConfigurationService } from "../service/ct-service-config.service";
import { userCommitService } from "../service/user-commit.service";

class UserCommitUsecase {
    constructor(
        public userCommitServiceImpl = userCommitService,
        public ctServiceConfigImpl = ctConfigurationService,
    ) { }

    async getUserGithubInfo(userId: number): Promise<IResponse> {
        try {
            const userGithubInfo = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            if (userGithubInfo === null) {
                return msg400("Error on getUserGithubInfo");
            }
            const ctServiceConfig = await this.ctServiceConfigImpl.getConfigByParamType("github_config");
            if (ctServiceConfig === null) {
                return msg400("Error on getConfigByParamType");
            }
            return msg200({
                userGithubInfo: userGithubInfo,
                githubConfiguration: ctServiceConfig
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async verifyGithubAuthorization(code: string, state: string): Promise<IResponse> {
        try {
            const userGithubInfo = await this.userCommitServiceImpl.verifyGithubAuthorization(code, state);
            if (userGithubInfo === null) {
                return msg400("Error on verifyGithubAuthorization");
            }
            return msg200({
                userGithubInfo: userGithubInfo
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async synchronizeUserGithub(userId: number): Promise<IResponse> {
        try {
            const userGithubInfo = await this.userCommitServiceImpl.synchronizeUserGithub(userId);
            if (userGithubInfo === null) {
                return msg400("Error on synchronizeUserGithub");
            }
            return msg200({
                userGithubInfo: userGithubInfo
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }
}

export const userCommitUsecase = new UserCommitUsecase();