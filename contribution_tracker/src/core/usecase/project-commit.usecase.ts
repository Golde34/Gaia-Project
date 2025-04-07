import { msg200, msg400 } from "../common/response-helpers";
import { SyncProjectRepoDto } from "../domain/dtos/github-object.dto";
import ProjectCommitEntity from "../domain/entities/project-commit.entity";
import { githubRepoMapper, syncProjectRepoMapper } from "../mapper/project-commit.mapper";
import { commitService } from "../service/commit.service";
import { contributionCalendarService } from "../service/contribution-calendar.service";
import { projectCommitService } from "../service/project-commit.service";
import { userCommitService } from "../service/user-commit.service";
import { commitUsecase } from "./commit.usecase";

class ProjectCommitUsecase {
    constructor(
        private userCommitServiceImpl = userCommitService,
        private projectCommitServiceImpl = projectCommitService,
        private commitUsecaseImpl = commitUsecase,
        private commitServiceImpl = commitService,
        private contributionServiceImpl = contributionCalendarService,
    ) { }

    async getRepoGithubInfo(userId: number): Promise<any> {
        try {
            const user = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            if (!user) {
                return msg400("User not found");
            }
            const repos = await this.userCommitServiceImpl.getUserGithubRepo(user);
            const githubRepos = repos.map((repo: any) => githubRepoMapper(repo));
            return msg200({
                githubRepos
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async syncProjectRepo(body: any): Promise<any> {
        try {
            const existedProject = await this.projectCommitServiceImpl.getProjectCommitsByProjectIdAndRepo(body.project.id, body.repo.name);
            if (existedProject || existedProject !== null) {
                return msg400("Project or repo are already synced");
            }

            const request: SyncProjectRepoDto = syncProjectRepoMapper(body);
            const syncedProject = await this.projectCommitServiceImpl.syncProjectRepo(request);

            return msg200({
                syncedProject
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async getProjectCommits(userId: number): Promise<any> {
        try {
            const projectCommits: ProjectCommitEntity[] = await this.projectCommitServiceImpl.getProjectCommitsByUserId(userId);
            return msg200({
                projectCommits: projectCommits
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async deleteProjectCommit(userId: number, projectId: string): Promise<any> {
        try {
            const deletedProjectCommit = await this.projectCommitServiceImpl.deleteProjectCommit(userId, projectId);
            if (deletedProjectCommit) {
                await this.commitServiceImpl.deleteCommitsByProjectId(projectId);
                await this.contributionServiceImpl.deleteContributionByProjectId(projectId);
                if (deletedProjectCommit.totalProjectCommits !== undefined) {
                    await this.userCommitServiceImpl.decrementUserCommits(userId, deletedProjectCommit.totalProjectCommits);
                }
                return msg200(deletedProjectCommit);
            }
            return msg200(deletedProjectCommit);
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async refreshProjectCommits(userId: number, projectId: string): Promise<any> {
        try {
            const user = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            if (!user) {
                return msg400("User not found");
            }
            const project = await this.projectCommitServiceImpl.getProjectCommitsById(projectId);
            if (!project) {
                return msg400("Project not found");
            }
            const result = await this.commitUsecaseImpl.syncGithubCommit(user, project);
            if (result === undefined) {
                return msg400("Error on syncGithubCommit");
            }
            if (result === null) {
                return msg200({
                    message: "No new commits in project" + project.projectName + " of user " + user.githubLoginName
                });
            }

            const { lastTimeSynced, firstTimeSynced } = result;

            await this.projectCommitServiceImpl.updateProjectCommitSynced(
                project.id,
                project.userNumberSynced,
                lastTimeSynced,
                false,
                firstTimeSynced
            );
            return msg200({
                message: "Project " + project.projectName + " of user " + user.githubLoginName + " synced successfully"
            });
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async syncProjectGithubCommits(data: any): Promise<void> {
        try {
            const projectId = data.projectId;
            const userId = data.userId;
            const user = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const project = await this.projectCommitServiceImpl.getProjectCommitsById(projectId);
            if (!project) {
                throw new Error("Project not found");
            }
            const result = await this.commitUsecaseImpl.syncGithubCommit(user, project);
            if (result === undefined) {
                throw new Error("Error on syncGithubCommit");
            }

            if (result === null) {
                console.log(`No need to sync in project ${project.projectName} of user ${user.githubLoginName}`);
                return;
            }

            const { lastTimeSynced, firstTimeSynced } = result;

            await this.projectCommitServiceImpl.updateProjectCommitSynced(
                project.id,
                project.userNumberSynced,
                lastTimeSynced,
                false,
                firstTimeSynced
            );
            console.log(`Project ${project.projectName} of user ${user.githubLoginName} synced successfully`);
        } catch (error: any) {
            console.error("Failed to sync user github commits: ", error);
        }
    }
}

export const projectCommitUsecase = new ProjectCommitUsecase();