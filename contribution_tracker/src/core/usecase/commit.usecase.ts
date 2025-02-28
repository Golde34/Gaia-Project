import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import ProjectCommitEntity from "../domain/entities/project-commit.entity";
import UserCommitEntity from "../domain/entities/user-commit.entity";
import { commitService } from "../service/commit.service";
import { projectCommitService } from "../service/project-commit.service";
import { userCommitService } from "../service/user-commit.service";
import { chunk } from "lodash";
import { format } from "date-fns";
import { contributionCalendarService } from "../service/contribution-calendar.service";

class CommitUsecase {
    constructor(
        private commitServiceImpl = commitService,
        private userCommitServiceImpl = userCommitService,
        private projectCommitServiceImpl = projectCommitService,
        private contributionCalendarServiceImpl = contributionCalendarService,
    ) { }

    // TODO
    async getUserCommits(userId: number): Promise<IResponse> {
        try {
            const userCommits = this.commitServiceImpl.getUserCommits(userId);
            return msg200({
                userCommits
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    // TODO
    async getProjectCommits(userId: number, projectId: string): Promise<IResponse> {
        try {
            const commits = this.commitServiceImpl.getProjectCommits(userId, projectId);
            return msg200({
                commits
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async createCommit(data: any): Promise<IResponse> {
        try {
            const commit = await this.commitServiceImpl.createCommit(data);
            if (!commit) {
                return msg400("Failed to create commit");
            }

            const contribution = await this.contributionCalendarServiceImpl.upsertContribution(data.userId, data.projectId, data.date, data.commitCount);

            return msg200({
                commit,
                contribution
            })
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    /**
     * Process to reset synced github commits number 
     * @param data
     * @returns void
     */
    async resetSyncedNumber(data: any): Promise<void> {
        try {
            console.log("Resetting synced number: ", data);
            await this.projectCommitServiceImpl.resetProjectCommitsSyncedTime();
            console.log("Reset synced number successfully");
        } catch (error: any) {
            console.error("Failed to reset synced number: ", error);
        }
    }

    /**
     * Process to sync github commits
     * 1. Sync all commits for each unsynced project
     * 2. Check if project needs to be synced or not
     * 3. Get all github commits for the user or these latest if the project is already synced
     * 4. Add github commit to the database
     * 5. Update project commits synced time
     * @param data 
     * @returns void
     */
    async syncGithubCommits(data: any): Promise<void> {
        console.log("Syncing github commit by project: ", data);
        const projects = await this.projectCommitServiceImpl.getBatchProjectCommits(200);
        const concurrency = 10;
        const chunkedProjects = chunk(projects, concurrency);

        for (const smallBatch of chunkedProjects) {
            await Promise.all(
                smallBatch.map(async (project) => {
                    if (!project.id || !project.userCommitId) return;
                    try {
                        const user = await this.userCommitServiceImpl.getUserGithubInfo(project.userCommitId);
                        const result = await this.syncGithubCommit(user, project);
                        if (result === undefined) {
                            throw new Error("Error on syncGithubCommit");
                        }
                        if (result === null) {
                            console.log("No new commits for project:", project.id);
                            return;
                        }
                        const { lastTimeSynced, firstTimeSynced } = result;

                        await this.projectCommitServiceImpl.updateProjectCommitSynced(
                            project.id,
                            project.userNumberSynced,
                            lastTimeSynced,
                            true,
                            firstTimeSynced
                        );
                    } catch (err) {
                        console.error(`Failed to sync project ${project.id}:`, err);
                    }
                })
            );
        }
        console.log("Finished syncing GitHub commits for batch:", data);
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
                commits = await this.commitServiceImpl.getAllCommitsRepo(user.githubLoginName, user.githubAccessToken, project.githubRepo);
                firstTimeSynced = true;
            } else {
                if (!project.lastTimeSynced) {
                    throw new Error("Project has firstTimeSynced=true but lastTimeSynced is missing");
                }
                console.log("Get latest commits for user: ", user.githubLoginName);
                const lastTimeSynced = format(new Date(project.lastTimeSynced), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
                commits = await this.commitServiceImpl.getLatestCommitsRepo(user.githubLoginName, user.githubAccessToken, project.githubRepo, lastTimeSynced);
            }

            if (!commits || commits.length === 0) {
                console.log("No new commits or failed to get commits for user:", user.githubLoginName);
                return null;
            }

            const isProjectNeedSync = await this.commitServiceImpl.isProjectNeedSync(commits[0], project);
            if (!isProjectNeedSync) {
                return null;
            }

            let timeStamp = new Date(commits[0].commit.committer.date);
            let commitCount = 0;
            for (const commit of commits) {
                await this.commitServiceImpl.addGithubCommit(user.userId, project.id, commit, user.githubLoginName);
                if (timeStamp != new Date(commit.commit.committer.date)) {
                    await this.contributionCalendarServiceImpl.upsertContribution(user.userId, project.id, timeStamp, commitCount);
                    timeStamp = new Date(commit.commit.committer.date);
                    commitCount = 0;
                } else {
                    commitCount += 1;
                }
            }
            await this.userCommitServiceImpl.updateTotalCommits(user.userId, commits.length, "fullSyncMode");
            await this.projectCommitServiceImpl.updateTotalCommits(user.userId, project.id, commits.length, "fullSyncMode");

            return {
                lastTimeSynced: format(new Date(commits[0].commit.committer.date), 'yyyy-MM-dd HH:mm:ss'),
                firstTimeSynced: firstTimeSynced,
            }

        } catch (error) {
            console.error("Error on syncGithubCommit:", error);
            return undefined;
        }
    }
}

export const commitUsecase = new CommitUsecase();