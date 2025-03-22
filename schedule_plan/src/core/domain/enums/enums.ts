export enum ActiveStatus {
    active = "ACTIVE",
    inactive = "INACTIVE",
}

export enum Priority {
    star = 1,
    high = 0.9,
    medium = 0.8,
    low = 0.5
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTION = "OPTION"
}

export enum ServiceAcronym {
    AS = "authentication_service",
    GC = "gaia_connector",
    CLG = "client_gui",
    ML = "middleware_loader",
    TM = "task_manager",
    WO = "work_optimization",
    GAIA = "GAIA",
    CMC = "camera_cv",
}

export enum HttpCodeMessage {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export enum ErrorStatus {
    INIT = "INIT",
    SUCCESS = "SUCCESS",
    FAIL = "FAIL",
    TIMEOUT = "TIMEOUT",
}

export enum RepeatLevel {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}