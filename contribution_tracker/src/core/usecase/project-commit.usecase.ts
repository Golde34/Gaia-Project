import { msg200, msg400 } from "../common/response-helpers";
import { SyncProjectRepoDto } from "../domain/dtos/github-object.dto";
import ProjectCommitEntity from "../domain/entities/project-commit.entity";
import { githubRepoMapper, syncProjectRepoMapper } from "../mapper/project-commit.mapper";
import { commitService } from "../service/commit.service";
import { projectCommitService } from "../service/project-commit.service";
import { userCommitService } from "../service/user-commit.service";

class ProjectCommitUsecase {
    constructor(
        private userCommitServiceImpl = userCommitService,
        private projectCommitServiceImpl = projectCommitService,
        private commitServiceImpl = commitService,
    ) { }

    async getRepoGithubInfo(userId: number): Promise<any> {
        try {
            const user = await this.userCommitServiceImpl.getUserGithubInfo(userId);
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
            const request: SyncProjectRepoDto = syncProjectRepoMapper(body);
            return await this.projectCommitServiceImpl.syncProjectRepo(request);
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
            return await this.projectCommitServiceImpl.deleteProjectCommit(userId, projectId);
        } catch (error: any) {
            return msg400(error.message.toString());
        }
    }

    async refreshProjectCommits(userId: number, projectId: string, githubRepoUrl: string | null): Promise<any> {
        try {
            const user = await this.userCommitServiceImpl.getUserGithubInfo(userId);
            const project = await this.projectCommitServiceImpl.getProjectCommitsByProjectId(projectId);
            if (!project) {
                return msg400("Project not found");
            }
            const result = await this.commitServiceImpl.syncGithubCommit(user, project);
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
}

export const projectCommitUsecase = new ProjectCommitUsecase();