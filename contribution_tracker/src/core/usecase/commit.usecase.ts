import { IResponse } from "../common/response";
import { msg200, msg400 } from "../common/response-helpers";
import { commitService } from "../service/commit.service";
import { projectCommitService } from "../service/project-commit.service";
import { userCommitService } from "../service/user-commit.service";
import { chunk } from "lodash";

class CommitUsecase {
    constructor(
        public commitServiceImpl = commitService,
        public userCommitServiceImpl = userCommitService,
        public projectCommitServiceImpl = projectCommitService,
        // public contributionCalendarServiceImpl = new ContributionCalendarUsecase()
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
            const commit = this.commitServiceImpl.createCommit(data);
            if (!commit) {
                return msg400("Failed to create commit");
            }
            // const contribution = this.contributionCalendarServiceImpl.createContribution(commit);

            return msg200({
                commit
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
                        const result = await this.commitServiceImpl.syncGithubCommit(user, project);
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

    syncGithubCommitsByProjectId(projectId: string): void {
        
    }
}

export const commitUsecase = new CommitUsecase();