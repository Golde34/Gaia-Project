import { IsOptional, IsString } from "class-validator";

export class GaiaCreateTaskDto {
    userId!: number;
    @IsString()
    ActionType!: string;
    @IsString()
    Project!: string;
    @IsString()
    GroupTask!: string;
    @IsString()
    Title!: string;
    Status!: string;
    Priority!: string;
    @IsOptional()
    Duration?: string;
    @IsOptional()
    StartDate?: string;
    @IsOptional()
    Deadline?: string;
}