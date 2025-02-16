import { ulid } from "ulid";
import { ProjectCommitRepository } from "../../infrastructure/repository/project-commit.repository";
import { SyncProjectRepoDto } from "../domain/dtos/github-object.dto";
import { ProjectCommitEntity } from "../domain/entities/project-commit.entity";

class ProjectCommitService {
    constructor(
        private projectCommitRepository: ProjectCommitRepository = ProjectCommitRepository.getInstance(),
    ) { }

    async syncProjectRepo(request: SyncProjectRepoDto): Promise<string> {
        try {
            // find project commit by projectId and githubUrl, if it exists, return error
            console.log("Syncing project repo: ", request);
            const projectEntity: ProjectCommitEntity = {
                id: ulid(),
                userCommitId: request.userId,
                githubRepo: request.repoName,
                githubRepoUrl: request.repoUrl,
                projectId: request.projectId,
                projectName: request.projectName,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSynced: false,
                userNumberSynced: 0,
            }
            await this.projectCommitRepository.insert(projectEntity);
            return "Project repo synced";
        } catch (error) {
            console.error("Error on syncProjectRepo: ", error);
            return "Error on syncProjectRepo";
        }
    }

    async getProjectCommitsByUserId(userId: number): Promise<ProjectCommitEntity[]> {
        try {
            console.log("Getting project commits for user: ", userId);
            return await this.projectCommitRepository.findByCondition("user_commit_id = ?", [userId]);
        } catch (error) {
            console.error("Error on getProjectCommits: ", error);
            return [];
        }
    }

    async deleteProjectCommit(userId: number, projectId: string): Promise<ProjectCommitEntity | undefined> {
        try {
            const projectCommits: ProjectCommitEntity[] = await this.projectCommitRepository.findByCondition("user_commit_id = ? AND id = ?", [userId, projectId]);
            const projectCommit: ProjectCommitEntity | undefined = projectCommits[0];
            if (!projectCommit || !projectCommit.id) {
                console.error("Project commit not found for user: ", userId, " and project: ", projectId);
                return undefined;
            }
            console.log("Deleting project commit for user: ", userId, " and project: ", projectId);
            await this.projectCommitRepository.delete(projectCommit.id);
            return projectCommit;
        } catch (error) {
            console.error("Error on deleteProjectCommit: ", error);
            return undefined;
        }
    }

    async resetProjectCommitsSyncedTime(): Promise<void> {
        try {
            await this.projectCommitRepository.resetSyncedTime();
        } catch (error) {
            console.error("Error on updateProjectCommitsSyncedTime: ", error);
        }
    }

    async getBatchProjectCommits(limit: number): Promise<ProjectCommitEntity[]> {
        try {
            console.log("Getting batch project commits");
            return await this.projectCommitRepository.findBatch(limit, ["last_time_synced"], "ASC");
        } catch (error) {
            console.error("Error on getBatchProjectCommits: ", error);
            return [];
        }
    }

    async updateProjectCommitSynced(projectId: string, syncedNumber: number,
        lastTimeSynced: string, isProcess: boolean, firstTimeSynced: boolean): Promise<void> {
        try {
            console.log("Updating project commit synced: ", projectId);
            let userSynced = false;
            // TODO: Config of the number of synced time each user
            if (syncedNumber >= 5) {
                userSynced = true;
            }
            if (firstTimeSynced) {
                await this.projectCommitRepository.update(projectId, {
                    lastTimeSynced: lastTimeSynced,
                    userSynced: isProcess ? false : userSynced,
                    userNumberSynced: isProcess ? syncedNumber : syncedNumber + 1,
                    firstTimeSynced: new Date(),
                });
            } else {
                await this.projectCommitRepository.update(projectId, {
                    lastTimeSynced: lastTimeSynced,
                    userSynced: isProcess ? false : userSynced,
                    userNumberSynced: isProcess ? syncedNumber : syncedNumber + 1,
                });
            }
            console.log("Updated project commit synced successfully: ", projectId);
        } catch (error) {
            console.error("Error on updateProjectCommitSynced: ", error);
        }
    }

    async getProjectCommitsByProjectId(projectId: string): Promise<ProjectCommitEntity | undefined> {
        try {
            console.log("Getting project commits by project id: ", projectId);
            const projectCommits: ProjectCommitEntity[] = await this.projectCommitRepository.findByCondition("id = ?", [projectId]);
            return projectCommits[0];
        } catch (error) {
            console.error("Error on getProjectCommitsByProjectId: ", error);
            return undefined;
        }
    }
}

export const projectCommitService = new ProjectCommitService();