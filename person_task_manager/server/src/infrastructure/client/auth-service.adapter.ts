import { HttpCodeMessage, ServiceAcronym, HttpMethod } from "../../core/domain/enums/enums";
import { buildAuthorizationHeaders } from "../../kernel/util/build-headers";
import { getInternalServiceErrorResponse } from "../../kernel/util/return-result";
import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env'});
const authServiceDomain = process.env.AUTH_SERVICE_DOMAIN;

class AuthServiceAdapter {
    private getUserByUserId: string | undefined;

    constructor() {
        if (!authServiceDomain) {
            throw new Error("AUTH_SERVICE_DOMAIN is not defined");
        }
        this.getUserByUserId = authServiceDomain + process.env.AUTH_SERVICE_GET_USER_BY_ID;
    }

    async checkExistedUser(userId: number) {
        try {
            const headers = buildAuthorizationHeaders(ServiceAcronym.AS, userId, {});
            const uri = this.getUserByUserId+`${userId}`
            console.log(`Calling api to auth service: ${uri}`);
            const response = await fetch(uri, {
                headers,
                method: HttpMethod.GET,
            });
            
            if (response.status !== 200) {
                return getInternalServiceErrorResponse(response.status);
            }
            
            return response.json();
        } catch (error: any) {
            console.log("Exception when calling auth service");
            return getInternalServiceErrorResponse(HttpCodeMessage.INTERNAL_SERVER_ERROR);
        }
    }
}

export const authServiceAdapter = new AuthServiceAdapter();
