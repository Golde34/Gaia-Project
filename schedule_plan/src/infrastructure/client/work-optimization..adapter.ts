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
        this.registerTaskConfigURL = workOptimizationServiceDomain + process.env.WORK_OPTIMIZATION_SERVICE_OPTIMIZE_SCHEDULE;
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

            if (response.status !== 200) {
                return getInternalServiceErrorResponse(response.status);
            }
            const data = await response.json();
            console.log("Response from work optimization service: ", data);
            return data.data;
        } catch (error: any) {
            console.log("Exception when calling work optimization service");
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR); 
        }
    }
}

export const workOptimizationAdapter = new WorkOptimizationAdapter();
