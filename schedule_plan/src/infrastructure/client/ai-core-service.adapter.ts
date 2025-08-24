import * as dotenv from 'dotenv';
import { buildDefaultHeaders } from '../../kernel/utils/build-headers';
import { HttpCodeMessage, HttpMethod } from '../../core/domain/enums/enums';
import { getInternalServiceErrorResponse } from '../../kernel/utils/return-result';

dotenv.config({ path: './src/.env' });
const aiCoreServiceDomain = process.env.AI_CORE_SERVICE_DOMAIN;

class AICoreAdapter {
    private tagTheTasksURL: string;

    constructor() {
        if (!aiCoreServiceDomain) {
            throw new Error("AI Core service domain is not provided");
        }
        this.tagTheTasksURL = aiCoreServiceDomain + process.env.AI_CORE_SERVICE_TAG_SCHEDULE_TASK;
    }

    async tagTheTasks(tagTasksRequest: any[]): Promise<any> {
        try {
            const headers = buildDefaultHeaders({});
            const uri = this.tagTheTasksURL;
            console.log(`Calling API to AI Core service...`);
            console.log("Request body: ", tagTasksRequest);
            const response = await fetch(uri, {
                headers,
                method: HttpMethod.POST,
                body: JSON.stringify(tagTasksRequest)
            });

            if (response.status !== 200) {
                return getInternalServiceErrorResponse(response.status);
            }
            const data = await response.json();
            console.log("Response from AI Core service: ", data);
            return data.data;
        } catch (error: any) {
            console.log("Exception when calling AI Core service");
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR);
        }
    }
}

export const aiCoreServiceAdapter = new AICoreAdapter();