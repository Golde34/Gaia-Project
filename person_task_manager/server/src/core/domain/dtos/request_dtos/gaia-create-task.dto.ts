import { IsOptional, IsString } from "class-validator";

export class GaiaCreateTaskDto {
    userId!: number;
    @IsString()
    actionType!: string;
    @IsString()
    project!: string;
    @IsString()
    groupTask!: string;
    @IsString()
    title!: string;
    status!: string;
    priority!: string;
    @IsOptional()
    duration?: string;
    @IsOptional()
    startDate?: string;
    @IsOptional()
    deadline?: string;
}