import { IsOptional, IsString } from "class-validator";

export class GithubRepoDto {
    @IsString()
    name!: string;
    @IsString()
    htmlUrl!: string;
    @IsString()
    description!: string;
    @IsString()
    owner!: string;
    @IsString()
    language!: string;
}

export class SyncProjectRepoDto {
    @IsString()
    userId!: number;
    @IsString()
    projectId!: string;
    @IsString()
    @IsOptional()
    projectName?: string;
    @IsString()
    repoName!: string;
    @IsString()
    repoUrl!: string;
}