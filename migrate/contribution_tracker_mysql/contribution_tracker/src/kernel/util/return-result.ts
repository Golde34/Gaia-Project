import { NextFunction, Response } from "express";
import { msg400, msg401, msg403, msg500, sendResponse } from "../../core/common/response-helpers";
import { HttpCodeMessage } from "../../core/domain/enums/enums";

export function returnResult(result: any, errorMessage: string, res: Response, next: NextFunction) {
    if (result) {
        sendResponse(result, res, next);
    } else {
        sendResponse(msg400(errorMessage), res, next);
    }
}

export function getInternalServiceErrorResponse(status: number): Promise<number> {
    switch (status) {
        case 403:
            return Promise.resolve(HttpCodeMessage.FORBIDDEN);
        case 400:
            return Promise.resolve(HttpCodeMessage.BAD_REQUEST);
        case 401:
            return Promise.resolve(HttpCodeMessage.UNAUTHORIZED);
        case 500:
            return Promise.resolve(HttpCodeMessage.INTERNAL_SERVER_ERROR);
        default:
            return Promise.resolve(HttpCodeMessage.INTERNAL_SERVER_ERROR);
    }
}

export function returnInternalServiceErrorResponse(status:number, data: any) {
    switch (status) {
        case 403:
            return msg403(data + " Forbidden");
        case 400:
            return msg400(data + " Bad Request");
        case 401:
            return msg401(data + " Unauthorized");
        case 500:
            return msg500(data + " Internal Server Error");
        default:
            return msg500(data + " Internal Server Error");
    }
}