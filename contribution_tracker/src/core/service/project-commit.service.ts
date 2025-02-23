import { ulid } from "ulid";
import { ProjectCommitRepository } from "../../infrastructure/repository/project-commit.repository";
import { SyncProjectRepoDto } from "../domain/dtos/github-object.dto";
import ProjectCommitEntity from "../domain/entities/project-commit.entity";
import { CommitRepository } from "../../infrastructure/repository/commit.repository";
import { KafkaConfig } from "../../infrastructure/kafka/kafka-config";
import { KafkaCommand, ProducerKafkaTopic } from "../domain/enums/kafka.enums";
import { createMessage } from "../../infrastructure/kafka/create-message";

class ProjectCommitService {
    constructor(
        private projectCommitRepository = new ProjectCommitRepository,
        private commitRepository = new CommitRepository,
        private kafkaHandler = new KafkaConfig(),
    ) { }

    async syncProjectRepo(request: SyncProjectRepoDto): Promise<string> {
        try {
            console.log("Syncing project repo: ", request);
            const id = ulid();
            await ProjectCommitEntity.create({
                id: id,
                userCommitId: request.userId,
                githubRepo: request.repoName,
                githubRepoUrl: request.repoUrl,
                projectId: request.projectId,
                projectName: request.projectName,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSynced: false,
                userNumberSynced: 0,
            })

            await this.syncGithubCommit(request.userId, id);
            console.log("Project repo synced successfully");
            return "Project repo synced";
        } catch (error) {
            console.error("Error on syncProjectRepo: ", error);
            return "Error on syncProjectRepo";
        }
    }

    async syncGithubCommit(userId: number, projectId: string): Promise<void> {
        try {
            const messages = [{
                value: JSON.stringify(createMessage(
                    KafkaCommand.FULL_SYNC_GITHUB_COMMIT, '00', 'Successful', { userId, projectId } 
                ))
            }]
            console.log("Syncing github commit for project: ", projectId);
            await this.kafkaHandler.produce(ProducerKafkaTopic.FULL_SYNC_GITHUB_COMMIT, messages); 
        } catch (error) {
            console.error("Error on syncGithubCommit: ", error);
        }
    }

    async getProjectCommitsByUserId(userId: number): Promise<ProjectCommitEntity[]> {
        try {
            console.log("Getting project commits for user: ", userId);
            return await this.projectCommitRepository.findByUserCommitId(userId);
        } catch (error) {
            console.error("Error on getProjectCommits: ", error);
            return [];
        }
    }

    async deleteProjectCommit(userId: number, projectId: string): Promise<ProjectCommitEntity | undefined> {
        try {
            const projectCommits: ProjectCommitEntity[] = await this.projectCommitRepository.findByUserCommitIdAndId(userId, projectId);
            const projectCommit: ProjectCommitEntity | undefined = projectCommits[0];
            if (!projectCommit || !projectCommit.id) {
                console.error("Project commit not found for user: ", userId, " and project: ", projectId);
                return undefined;
            }
            console.log("Deleting project commit for user: ", userId, " and project: ", projectId);
            await this.projectCommitRepository.delete(projectCommit.id);
            await this.commitRepository.deleteAllCommitsByProjectId(projectCommit.id);
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
            return await this.projectCommitRepository.findBatch(limit, "ASC");
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
                    lastTimeSynced: new Date(lastTimeSynced),
                    userSynced: isProcess ? false : userSynced,
                    userNumberSynced: isProcess ? syncedNumber : syncedNumber + 1,
                    firstTimeSynced: new Date(),
                });
            } else {
                await this.projectCommitRepository.update(projectId, {
                    lastTimeSynced: new Date(lastTimeSynced),
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
            const projectCommit = await this.projectCommitRepository.findById(projectId);
            if (!projectCommit || !projectCommit.id) {
                console.error("Project commit not found for project: ", projectId);
                return undefined;
            }
            return projectCommit;
        } catch (error) {
            console.error("Error on getProjectCommitsByProjectId: ", error);
            return undefined;
        }
    }
}

export const projectCommitService = new ProjectCommitService();