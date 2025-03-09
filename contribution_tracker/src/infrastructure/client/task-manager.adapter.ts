import * as dotenv from 'dotenv';
import { buildDefaultHeaders } from '../../kernel/util/build-headers';
import axios from 'axios';
import { HttpCodeMessage, HttpMethod } from '../../core/domain/enums/enums';
import { getInternalServiceErrorResponse } from '../../kernel/util/return-result';

dotenv.config({ path: './src/.env' });
const taskManagerDomain = process.env.TASK_MANAGER_DOMAIN;

class TaskManagerAdapter {
    private getProjectInfo: string | undefined;
    constructor() {
        if (!taskManagerDomain) {
            throw new Error('TASK_MANAGER_DOMAIN is not defined');
        }
        this.getProjectInfo = taskManagerDomain + process.env.TASK_MANAGER_TASK_ROUTER  
    }

    async getProjectInfoByTaskId(taskId: string | null) {
        try {
            const header = {};
            const headers = buildDefaultHeaders(header); 
            const uri = `${this.getProjectInfo}/${taskId}/project`;
            console.log(`Calling api to task manager with uri: ${uri}`);
            const response = await axios.get(uri, {
                headers,
                method: HttpMethod.GET,
            });

            if (response.status !== 200) {
                return getInternalServiceErrorResponse(response.data);
            }

            return response.data;
        } catch (error) {
            console.error('Error when calling task manager api', error);
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR);
        }
    }
}

export const taskManagerAdapter = new TaskManagerAdapter();