import * as dotenv from 'dotenv';
import { getInternalServiceErrorResponse } from '../../kernel/utils/return-result';
import { HttpCodeMessage, HttpMethod } from '../../core/domain/enums/enums';
import { buildDefaultHeaders } from '../../kernel/utils/build-headers';

dotenv.config({ path: './src/.env' });
const taskManagerServiceDomain = process.env.TASK_MANAGER_SERVICE_DOMAIN;

class TaskManagerAdapter {
    private createTaskURL: string;

    constructor() {
        if (!taskManagerServiceDomain) {
            throw new Error("Task manager service domain is not provided");
        }
        this.createTaskURL = taskManagerServiceDomain + process.env.TASK_MANAGER_SERVICE_CREATE_TASK;
    }

    async createTask(task: any, scheduleGroup: any, userId: number): Promise<any> {
        try {
            const headers = buildDefaultHeaders({});
            const uri = this.createTaskURL;
            console.log(`Calling api to task manager service...`);
            const body = {
                task: task,
                scheduleGroup: scheduleGroup,
                ownerId: userId
            }
            const response = await fetch(uri, {
                headers,
                method: HttpMethod.POST,
                body: JSON.stringify(body)
            });

            if (response.status !== 200) {
                return getInternalServiceErrorResponse(response.status);
            }
            const data = await response.json();
            return data.data.message;
        } catch (error: any) {
            console.log("Exception when calling task manager service");
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR); 
        }
    }
}

export const taskManagerAdapter = new TaskManagerAdapter();
