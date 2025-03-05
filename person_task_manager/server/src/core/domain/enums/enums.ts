export enum DatabaseType {
    MYSQL = "mysql",
    MONGODB = "mongodb",
}

export enum Permission {
    readTask = "READ_TASK_SERVICE",
    writeTask = "WRITE_TASK_SERVICE",
}

export enum Priority {
    star = "Star",
    high = "High",
    medium = "Medium",
    low = "Low",
    custom = "Custom",
}

export enum Status {
    todo = "TODO",
    inProgress = "IN_PROGRESS",
    done = "DONE",
    pending = "PENDING",
    archived = "ARCHIVED",
}

export enum ActiveStatus {
    active = "ACTIVE",
    inactive = "INACTIVE",
}

export enum ServiceAcronym {
    AS = "authentication_service",
    GC = "gaia_connector",
    CLG = "client_gui",
    ML = "middleware_loader",
    SP = "schedule_plan",
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

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTION = "OPTION"
}

export enum BooleanStatus {
    true = 1,
    false = 0 
}

export enum IsPrivateRoute {
    PRIVATE = BooleanStatus.true,
    PUBLIC = BooleanStatus.false
}

export enum EventStatus {
    INIT = "INIT",
    TIMEOUT = "TIMEOUT",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export enum TaskDetail {
    TASK_MANGER = "TASK_MANAGER",
    SCHEDULE_PLAN = "SCHEDULE_PLAN",
}

export enum CRUDType {
    UPDATE_TYPE = "UPDATE",
    UPDATE_DIALOG_TYPE = "UPDATE_DIALOG"
}

export enum TimeUnit {
    SECOND = "seconds",
    MINUTE = "minutes",
    HOUR = "hours",
    DAY = "days",
    WEEK = "weeks",
    MONTH = "months",
    YEAR = "years",
}
