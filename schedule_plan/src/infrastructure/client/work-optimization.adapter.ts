import * as dotenv from 'dotenv';
import { buildDefaultHeaders } from '../../kernel/utils/build-headers';
import { HttpCodeMessage, HttpMethod } from '../../core/domain/enums/enums';
import { getInternalServiceErrorResponse } from '../../kernel/utils/return-result';

dotenv.config({ path: './src/.env' });
const workOptimizationServiceDomain = process.env.WORK_OPTIMIZATION_SERVICE_DOMAIN;

class WorkOptimizationAdapter {
    private registerTaskConfigURL: string;

    constructor() {
        if (!workOptimizationServiceDomain) {
            throw new Error("Work optimization service domain is not provided");
        }
        this.registerTaskConfigURL = workOptimizationServiceDomain + process.env.WORK_OPTIMIZATION_SERVICE_REGISTER_TASK_CONFIG_URL;
    }

    async registerTaskConfig(taskConfig: any): Promise<any> {
        try {
            const headers = buildDefaultHeaders({});
            const uri = this.registerTaskConfigURL;
            console.log(`Calling api to work optimization service...`);
            const response = await fetch(uri, {
                headers,
                method: HttpMethod.POST,
                body: JSON.stringify(taskConfig)
            });
            const data = await response.json();

            if (response.status === HttpCodeMessage.BAD_REQUEST && data.data === 'User already exists') {
                console.log("User already exists in work optimization service");
            } else if (response.status !== HttpCodeMessage.OK) {
                console.log("Failed to register task config in work optimization service");
                return getInternalServiceErrorResponse(response.status);
            }
            
            console.log("Response from work optimization service: ", data);
            return data.data;
        } catch (error: any) {
            console.log("Exception when calling work optimization service");
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR); 
        }
    }
}

export const workOptimizationAdapter = new WorkOptimizationAdapter();
