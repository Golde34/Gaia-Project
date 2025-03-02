import { format } from "date-fns";
import { ulid } from "ulid";
import CacheSingleton from "../../infrastructure/cache/cache-singleton";
import { KafkaConfig } from "../../infrastructure/kafka/kafka-config";
import { githubClientAdapter } from "../../infrastructure/client/github-client.adapter";
import CommitEntity from "../domain/entities/commit.entity";
import UserCommitEntity from "../domain/entities/user-commit.entity";
import ProjectCommitEntity from "../domain/entities/project-commit.entity";
import { CommitType } from "../domain/enums/enums";
import { commitValidation } from "../validation/commit.validation";
import { CommitRepository } from "../../infrastructure/repository/commit.repository";

class CommitService {
    constructor(
        private kafkaConfig = new KafkaConfig(),
        private commitCache = CacheSingleton.getInstance().getCache(),
        private commitRepository = new CommitRepository(),
        private githubClient = githubClientAdapter,
        private commitValidationImpl = commitValidation
    ) { }

    async getAllCommitsRepo(userLoginName: string, githubAccessToken: string, githubRepo: string): Promise<any[]> {
        try {
            return await this.githubClient.getAllCommitsRepo(userLoginName, githubAccessToken, githubRepo);
        } catch (error) {
            console.error("Failed to get all commits for repo: ", githubRepo, error);
            return [];
        }
    }

    async getLatestCommitsRepo(userLoginName: string, githubAccessToken: string, githubRepo: string, lastTimeSynced: string): Promise<any[]> {
        try {
            return await this.githubClient.getLatestCommitsRepo(userLoginName, githubAccessToken, githubRepo, lastTimeSynced);
        } catch (error) {
            console.error("Failed to get latest commits for repo: ", githubRepo, error);
            return [];
        }
    }

    async syncGithubCommit(user: UserCommitEntity, project: ProjectCommitEntity): Promise<any | null | undefined> {
        try {
            if (!user.githubAccessToken || !user.githubLoginName) {
                return undefined;
            }

            let commits: any[] = [];
            let firstTimeSynced: boolean = false;
            if (!project.firstTimeSynced) {
                console.log("Get all commits for user: ", user.githubLoginName);
                commits = await this.githubClient.getAllCommitsRepo(user.githubLoginName, user.githubAccessToken, project.githubRepo);
                firstTimeSynced = true;
            } else {
                if (!project.lastTimeSynced) {
                    throw new Error("Project has firstTimeSynced=true but lastTimeSynced is missing");
                }
                console.log("Get latest commits for user: ", user.githubLoginName);
                const lastTimeSynced = format(new Date(project.lastTimeSynced), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
                commits = await this.githubClient.getLatestCommitsRepo(user.githubLoginName, user.githubAccessToken, project.githubRepo, lastTimeSynced);
            }

            if (!commits || commits.length === 0) {
                console.log("No new commits or failed to get commits for user:", user.githubLoginName);
                return null;
            }

            const isProjectNeedSync = await this.isProjectNeedSync(commits[0], project);
            if (!isProjectNeedSync) {
                return null;
            }

            for (const commit of commits) {
                if (!commit.commit || !commit.commit.committer) {
                    continue;
                }
                const committerName = commit.commit.committer.name;
                if (committerName !== user.githubLoginName) {
                    continue;
                }
                await this.addGithubCommit(user.userId, project.id, commit, user.githubLoginName);
            }

            return {
                lastTimeSynced: format(new Date(commits[0].commit.committer.date), 'yyyy-MM-dd HH:mm:ss'),
                firstTimeSynced: firstTimeSynced,
            }

        } catch (error) {
            console.error("Error on syncGithubCommit:", error);
            return undefined;
        }
    }

    async isProjectNeedSync(lastGithubCommit: any, projectCommit: ProjectCommitEntity): Promise<boolean> {
        try {
            if (!projectCommit || !projectCommit.id) {
                console.error("Project commit not found for project: ", projectCommit.id);
                return false;
            }

            const lastTimeSynced = projectCommit.lastTimeSynced;
            if (!lastTimeSynced) {
                console.log("User have never synced the project: ", projectCommit.id);
                return true;
            }
            if (!lastGithubCommit) {
                console.error("Last github commit not found for project: ", projectCommit.id);
                return false;
            }
            if (new Date(lastGithubCommit.commit.committer.date) > new Date(lastTimeSynced)) {
                console.log("Project needs to be synced: ", projectCommit.id);
                return true;
            }

            console.log("Project does not need to be synced: ", projectCommit.id);
            return false;
        } catch (error) {
            console.error("Error on isProjectNeedSync: ", error);
            return false;
        }
    }

    async addGithubCommit(userId: number, projectId: string, commit: any, githubLoginName: string): Promise<boolean> {
        try {
            if (!this.commitValidationImpl.validateGithubCommitCreation(commit, githubLoginName)) {
                return false;
            }
            await CommitEntity.create({
                id: ulid(),
                content: commit.commit.message,
                commitTime: new Date(format(new Date(commit.commit.committer.date), 'yyyy-MM-dd HH:mm:ss')),
                userId: userId,
                type: CommitType.GITHUB,
                projectId: projectId,
                githubCommitId: commit.sha,
                commitAuthor: commit.commit.author.name,
                committerName: commit.commit.committer.name,
                committerEmail: commit.commit.committer.email,
                githubCommitDate: new Date(format(new Date(commit.commit.committer.date), 'yyyy-MM-dd HH:mm:ss')),
                commitMessage: commit.commit.message,
                commitUrl: commit.html_url,
            })
            return true;
        } catch (error: any) {
            console.error("Failed to sync github commit: ", error);
            return false;
        }
    }

    async deleteCommitsByProjectId(projectId: string): Promise<void> {
        try {
            await this.commitRepository.deleteAllCommitsByProjectId(projectId);
        }
        catch (error: any) {
            console.error("Failed to delete commits by project id: ", error);
        }
    }

    async createCommit(commitObject: any): Promise<CommitEntity | null> {
        try {
            const commit = await CommitEntity.create({
                id: ulid(),
                content: commitObject.content,
                commitTime: commitObject.date,
                userId: commitObject.userId,
                type: CommitType.TASK,
                projectId: commitObject.projectId,
                taskId: commitObject.taskId,
                subTaskId: commitObject.subTaskId == null ? "" : commitObject.subTaskId,
                scheduleTaskId: commitObject.scheduleTaskId == null ? "" : commitObject.scheduleTaskId,
            })

            return commit;
        } catch (error: any) {
            console.error("Failed to create commit: ", error);
            return null;
        }
    }

    async getUserCommits(userId: number): Promise<CommitEntity[] | null> {
        return null;
    }

    async getProjectCommits(userId: number, projectId: string): Promise<CommitEntity[] | null> {
        return null;
    }


}

export const commitService = new CommitService();