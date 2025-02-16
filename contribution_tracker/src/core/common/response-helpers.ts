import { NextFunction, Response } from "express";
import { IResponse } from "./response";
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "./error-handler";

export function msg400(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Bad Request",
        errorCode: 400,
        errorMessage: message,
        data: null,
    };
}

export function msg401(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Unauthorized",
        errorCode: 401,
        errorMessage: message,
        data: null,
    };
}

export function msg403(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Forbidden",
        errorCode: 403,
        errorMessage: message,
        data: null,
    };
}

export function msg404(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Not Found",
        errorCode: 404,
        errorMessage: message,
        data: null,
    };
}

export function msg405(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Method Not Allowed",
        errorCode: 405,
        errorMessage: message,
        data: null,
    };
}

export function msg500(message: string): IResponse {
    return {
        status: "error",
        statusMessage: "Internal Server Error",
        errorCode: 500,
        errorMessage: message,
        data: null,
    };
}

export function msg200(data: any): IResponse {
    return {
        status: "success",
        statusMessage: "OK",
        errorCode: 200,
        errorMessage: "",
        data: data,
    };
}

export function sendResponse(result: IResponse, response: Response, next: NextFunction): void {
    try {
        switch (result.errorCode) {
            case 200: {
                response.status(200).send(result);
                break;
            }
            case 400: {
                response.status(400).send(result);
                break;
            }
            case 401: {
                response.status(401).send(result);
                break;
            }
            case 403: {
                response.status(403).send(result);
                break;
            }
            case 404: {
                response.status(404).send(result);
                break;
            }
            case 405: {
                response.status(405).send(result);
                break;
            }
            case 500: {
                response.status(500).send(result);
                break;
            }
        }
    } catch (err) {
        next(err);
    }
}