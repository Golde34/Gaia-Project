import { IsOptional, IsString } from "class-validator";
import { TaskTagRequest } from "./request_dtos/tag.dto";

export class TaskRequestDto {
    @IsString()
    title!: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsOptional()
    priority?: string[];
    @IsString()
    @IsOptional()
    status?: string;
    @IsString()
    @IsOptional()
    startDate?: Date;
    @IsString()
    @IsOptional()
    deadline?: Date;
    @IsString()
    @IsOptional()
    duration?: number;
    @IsOptional()
    subTasks?: string[];
    @IsOptional()
    comments?: string[];
    @IsString()
    @IsOptional()
    activeStatus?: string;
    @IsString()
    @IsOptional()
    tag?: string;
    @IsOptional()
    userId?: number;
}

export class UpdateTaskRequestDto {
    userId!: number;
    @IsString()
    taskId!: string;
    @IsString()
    title!: string;
    @IsString()
    description!: string;
    startDate!: Date;
    deadline!: Date;
    duration!: number;
    @IsString()
    status!: string;
    priority!: string[];
    taskOrder!: number;
    stopTime!: number;
    @IsString()
    scheduleTaskId!: string;
    @IsOptional()
    subTasks?: string[];
    @IsOptional()
    comments?: string[];
    @IsString()
    @IsOptional()
    activeStatus?: string;
    @IsString()
    @IsOptional()
    tag?: string;
}

export class GenerateTaskFromScratchRequestDTO {
    @IsString()
    title!: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsOptional()
    prioriry?: string[];
    @IsString()
    @IsOptional()
    status?: string;
    @IsString()
    @IsOptional()
    startDate?: Date;
    @IsString()
    @IsOptional()
    deadline?: Date;
    @IsString()
    @IsOptional()
    duration?: number;
    @IsString()
    projectId!: string;
    @IsString()
    @IsOptional()
    activeStatus?: string;
    @IsOptional()
    tag?: TaskTagRequest;
    @IsOptional()
    userId?: number;
}

export class UpdateTaskInDialogDTO {
    @IsString()
    title!: string;
    @IsString()
    @IsOptional()
    description?: string;
    tag!: TaskTagRequest;
    @IsString()
    status!: string;
}

export class TaskDetailRequestDTO {
    userId!: number;
    @IsOptional()
    @IsString()
    taskId?: string;
    @IsOptional()
    @IsString()
    scheduleTaskId?: string;
    @IsString()
    taskDetailType!: string;
}