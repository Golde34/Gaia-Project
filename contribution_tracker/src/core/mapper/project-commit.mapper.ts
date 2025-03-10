import { GithubRepoDto, SyncProjectRepoDto } from "../domain/dtos/github-object.dto";

export const githubRepoMapper = (githubRepo: any): GithubRepoDto => {
    return {
        name: githubRepo.name,
        htmlUrl: githubRepo.html_url,
        description: githubRepo.description,
        owner: githubRepo.owner.login,
        language: githubRepo.language
    }
} 

export const syncProjectRepoMapper = (body: any): SyncProjectRepoDto => {
    return {
        userId: body.userId,
        projectId: body.project.id,
        projectName: body.project.name,
        repoName: body.repo.name,
        repoUrl: body.repo.htmlUrl
    }
} 

export const createCommitMapper = (kafkaMessage: any, projectCommitId: string, projectAndUserCommit: any): any => {
    if (kafkaMessage.taskId === null || kafkaMessage.taskId === undefined) {
        console.error("TaskId is required");
        return null;
    }
    return {
        taskId: kafkaMessage.taskId,
        content: kafkaMessage.title,
        date: kafkaMessage.finishDate,
        userId: projectAndUserCommit.data.ownerId,
        projectId: projectCommitId, 
    }
}
