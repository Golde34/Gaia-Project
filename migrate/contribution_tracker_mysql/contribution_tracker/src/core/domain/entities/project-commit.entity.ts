export interface ProjectCommitEntity {
    id: string;
    projectId: string;
    projectName?: string;
    githubRepo: string;
    githubRepoUrl: string;
    userCommitId?: number;
    userSynced: boolean;
    userNumberSynced: number;
    firstTimeSynced?: Date;
    lastTimeSynced?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}