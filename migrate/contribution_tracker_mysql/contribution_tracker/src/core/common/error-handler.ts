import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";


export class APIError extends Error {
    statusCode: number;
    rawErrors: string[] = [];
    constructor(statuCode: number, message: string, rawError?: string[]) {
        super(message);

        this.statusCode = statuCode;
        if (rawError) {
            this.rawErrors = rawError;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends APIError {
    constructor(path: string) {
        super(StatusCodes.NOT_FOUND, `The requested path ${path} was not found`);
    }
}

export class BadRequestError extends APIError {
    constructor(message: string, rawErrors?: string[]) {
        super(StatusCodes.BAD_REQUEST, message, rawErrors);
    }
}

export class UnauthorizedError extends APIError {
    constructor(message: string) {
        super(StatusCodes.UNAUTHORIZED, message);
    }
}

export class ForbiddenError extends APIError {
    constructor(message: string) {
        super(StatusCodes.FORBIDDEN, message);
    }
}

export class InternalServerError extends APIError {
    constructor(message: string) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, message);
    }
}

type ExpressAsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const expressAsyncHandler =
    (handler: ExpressAsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch((error) => next(error));
    };

export class ErrorHandler {
    static handlerError = () => {
        return async (err: APIError, req: Request, res: Response, next: NextFunction) => {
            const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
            res.status(statusCode).send({
                status: false,
                message: err.message,
                rawErrors: err.rawErrors ?? [],
                stack: err.stack,
            });
        };
    };
}

export class RequestValidator {
    static validate = <T extends object>(classInstance: ClassConstructor<T>) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const convertObject = plainToInstance(classInstance, req.body.body);
            await validate(convertObject).then((errors) => {
                if (errors.length > 0) {
                    let rawErrors: string[] = [];
                    for (const errorItem of errors) {
                        rawErrors = rawErrors.concat(...rawErrors, Object.values(errorItem.constraints ?? []));
                    }
                    console.log(rawErrors);
                    const validateionErrorText = 'Request validation failed.';
                    next(new BadRequestError(validateionErrorText, rawErrors));
                }
            });
            next();
        }
    }

    static validateV2 = <T extends object>(classInstance: ClassConstructor<T>) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const convertObject = plainToInstance(classInstance, req.body);
            await validate(convertObject).then((errors) => {
                if (errors.length > 0) {
                    let rawErrors: string[] = [];
                    for (const errorItem of errors) {
                        rawErrors = rawErrors.concat(...rawErrors, Object.values(errorItem.constraints ?? []));
                    }
                    console.log(rawErrors);
                    const validateionErrorText = 'Request validation failed.';
                    next(new BadRequestError(validateionErrorText, rawErrors));
                }
            });
            next();
        }
    }
}