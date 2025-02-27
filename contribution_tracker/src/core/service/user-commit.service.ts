import CacheSingleton from "../../infrastructure/cache/cache-singleton";
import { githubClientAdapter } from "../../infrastructure/client/github-client.adapter";
import { CTServiceConfigRepository } from "../../infrastructure/repository/ct-service-config.repository";
import { UserCommitRepository } from "../../infrastructure/repository/user-commit.repository";
import { InternalCacheConstants } from "../domain/constants/constants";
import UserCommitEntity from "../domain/entities/user-commit.entity";
import { TimeUnit } from "../domain/enums/enums";

class UserCommitService {
    constructor(
        private userCommitRepository = new UserCommitRepository(),
        private ctServiceConfigRepo = new CTServiceConfigRepository(),
        private userCommitCache = CacheSingleton.getInstance().getCache(),
        private githubClient = githubClientAdapter,
    ) { }

    async getUserGithubInfo(userId: number): Promise<any> {
        try {
            console.log("Getting user info: " + userId);
            const cachedUserGithubInfo = this.userCommitCache.get(InternalCacheConstants.USER_INFO_CACHE_KEY + userId);
            if (cachedUserGithubInfo) {
                console.log("Returning cached user info");
                return cachedUserGithubInfo;
            }
            console.log("Returning user info from db");
            let userGithubInfo = await this.userCommitRepository.findByUserId(userId);
            if (userGithubInfo === null || userGithubInfo === undefined) {
                userGithubInfo = await this.userCommitRepository.initUser(userId);
            } else {
                userGithubInfo = await this.userCommitRepository.updateUserState(userGithubInfo);
            }
            this.userCommitCache.set(InternalCacheConstants.USER_INFO_CACHE_KEY + userId, userGithubInfo);
            return userGithubInfo;
        } catch (error) {
            console.error("Error on getUserGithubInfo: ", error);
            return null;
        }
    }

    async clearUserCache(userId: number): Promise<void> {
        this.userCommitCache.clear(InternalCacheConstants.USER_INFO_CACHE_KEY + userId);
    }

    async verifyGithubAuthorization(code: string, state: string): Promise<any> {
        try {
            console.log("Verifying github authorization");
            const userGithubInfo = await this.userCommitRepository.verifyGithubAuthorization(state);
            if (userGithubInfo === undefined) {
                return null;
            }

            const configs = await this.ctServiceConfigRepo.findConfigByParamType("github_config");
            const githubSystemConfigs: { [key: string]: any } = {}
            for (const conf of configs) {
                githubSystemConfigs[conf.paramName] = conf.paramValue;
            }
            const body = {
                client_id: githubSystemConfigs.clientId,
                client_secret: githubSystemConfigs.clientSecret,
                code: code
            }

            const authorizedGithub = await this.githubClient.getGithubAccessToken(body);
            if (authorizedGithub !== null) {
                const updatedUser = await this.userCommitRepository.updateUserConsent(userGithubInfo, code, authorizedGithub);
                if (updatedUser === null) {
                    console.log('Something happened when authorized user in Github')
                    return null;
                }
                this.clearUserCache(updatedUser.userId);
                console.log("User info: ", updatedUser);
                return updatedUser;
            }
            return null;
        } catch (error) {
            console.error("Error on verifyGithubAuthorization: ", error);
            return null;
        }
    }

    async synchronizeUserGithub(userId: number): Promise<any> {
        try {
            console.log("Synchronizing user github");
            const userGithubInfo = await this.userCommitRepository.findByUserId(userId);
            if (userGithubInfo === null || userGithubInfo === undefined) {
                return null;
            }
            if (userGithubInfo.githubAccessToken === undefined) {
                return null;
            }

            const githubCommits = await this.githubClient.getGithubUserInfo(userGithubInfo.githubAccessToken);
            if (githubCommits !== null) {
                userGithubInfo.githubUrl = githubCommits.html_url;
                userGithubInfo.githubLoginName = githubCommits.login;
                const updatedUser = await this.userCommitRepository.synchronizeUserGithub(githubCommits.html_url, githubCommits.login,userGithubInfo.id);
                if (updatedUser === undefined) {
                    console.log('Something happened when synchronizing user in Github')
                    return null;
                }
                this.clearUserCache(updatedUser.userId);
                return updatedUser;
            }
            return null;
        } catch (error) {
            console.error("Error on synchronizeUserGithub: ", error);
            return null;
        }
    }

    async getUsers(): Promise<any> {
        try {
            const users = await this.userCommitRepository.findAll();
            console.log("Users: ", users);
            return users;
        } catch (error) {
            console.error("Error on getUsers: ", error);
            return null;
        }
    }

    async getUserGithubRepo(user: UserCommitEntity): Promise<any> {
        try {
            const cachedRepos = this.userCommitCache.get(InternalCacheConstants.GITHUB_REPOS_CACHE_KEY + user.userId);
            if (cachedRepos !== undefined) {
                console.log("Returning cached user repos");
                return cachedRepos;
            }
            if (user.githubAccessToken === undefined) {
                console.error("User has not authorized github");
                return null;
            }
            const repos = await this.githubClient.getGithubRepositories(user.githubAccessToken);
            this.userCommitCache.setKeyWithExpiry(InternalCacheConstants.GITHUB_REPOS_CACHE_KEY + user.userId, repos, 5, TimeUnit.MINUTE);
            return repos;
        } catch (error) {
            console.error("Error on getUserGithubRepo: ", error);
            return null;
        }
    }

    async updateTotalCommits(userId: number, totalCommitInDay: number, type: string): Promise<void> {
        try {
            if (type === "fullSyncMode") {
                this.userCommitRepository.updateTotalCommit(userId, totalCommitInDay);
            } 
        } catch (error) {
            console.error("Error on updateTotalCommits");
        }
    }
}

export const userCommitService = new UserCommitService();