export class AssignedBubble {
    id?: string;
    userId?: number;
    startTime?: string; // "HH:mm:ss" format
    endTime?: string; // "HH:mm:ss" format
    primaryTaskId: string | null = null;
    backupTaskId: string | null = null;
    primaryTaskTitle?: string;
    backupTaskTitle?: string;
    tag?: string;
    weekDay?: number;
    createdAt?: Date;
    updatedAt?: Date;
}