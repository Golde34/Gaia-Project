import { EMPTY_SENTENCE } from "../../domain/constants/constants";
import { IsString, IsOptional } from "class-validator";
import { ITaskEntity } from "../../domain/entities/task.entity";
import { UpdateTaskRequestDto } from "../../domain/dtos/task.dto";
import { GaiaCreateTaskDto } from "../../domain/dtos/request_dtos/gaia-create-task.dto";

export class KafkaCreateTaskMessage {
    @IsString()
    sentence: string = EMPTY_SENTENCE;
    @IsString()
    project: string | null = null;
    @IsString()
    groupTask: string | null = null;
    task!: ITaskEntity;
    @IsString()
    taskId?: string;
    userId!: number;
}

export const kafkaCreateTaskMapper = async (data: ITaskEntity, projectName: string | undefined, groupTaskName: string | undefined, userId: number)
    : Promise<KafkaCreateTaskMessage> => {
    const message = new KafkaCreateTaskMessage();
    message.task = data;
    message.taskId = data._id;
    message.project = projectName === undefined ? null : projectName;
    message.groupTask = groupTaskName === undefined ? null : groupTaskName;
    message.userId = userId;
    return message;
};

export class KafkaUpdateTaskMessage {
    userId!: number;
    @IsString()
    taskId!: string;
    @IsString()
    title!: string;
    @IsString()
    description!: string;
    @IsString()
    startDate!: Date;
    @IsString()
    deadline!: Date;
    @IsString()
    duration!: number;
    @IsString()
    status!: string;
    @IsString()
    priority!: string[];
    @IsString()
    taskOrder!: number;
    @IsString()
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

export const kafkaUpdateTaskMapper = async (updatedTask: ITaskEntity, updateRequest: UpdateTaskRequestDto) => {
    const message = new KafkaUpdateTaskMessage();
    message.userId = updateRequest.userId;
    message.taskId = updatedTask._id;
    message.title = updatedTask.title;
    message.description = updatedTask.description;
    message.startDate = updatedTask.startDate;
    message.deadline = updatedTask.deadline;
    message.duration = updatedTask.duration;
    message.status = updatedTask.status;
    message.priority = updatedTask.priority;
    message.taskOrder = updateRequest.taskOrder;
    message.stopTime = updateRequest.stopTime;
    message.scheduleTaskId = updateRequest.scheduleTaskId;
    message.subTasks = updatedTask.subTasks;
    message.comments = updatedTask.comments;
    message.activeStatus = updatedTask.activeStatus;
    // message.tag = updatedTask.tag; 
    return message;
}

export const kafkaGaiaCreateTaskMapper = (data: GaiaCreateTaskDto) => {
    const priorities = [data.priority];
    let startDate;
    if (!data.startDate || data.startDate == "now" || data.startDate == "today") {
        startDate = new Date();
    }
    let duration;
    if (!data.duration) {
        duration = 2;
    }
    let deadline;
    if (!data.deadline || data.deadline == "now" || data.deadline == "today") {
        deadline = new Date((startDate ?? new Date()).getTime() + (duration ?? 2) * 60 * 60 * 1000);
    }
    data.priority = priorities;
    data.startDate = startDate?.toDateString();
    data.duration = duration?.toString();
    data.deadline = deadline?.toDateString();
    return data;
}