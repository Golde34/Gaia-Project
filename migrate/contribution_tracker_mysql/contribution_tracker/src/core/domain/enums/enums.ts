export enum DatabaseType {
    MYSQL = "mysql",
    MONGODB = "mongodb",
}

export enum CommitType {
    TASK = "task",
    SUBTASK = "subTask",
    GITHUB = "githubCommit",
    SCHEDULETASK = "scheduleTask",
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

export enum TimeUnit {
    SECOND = "seconds",
    MINUTE = "minutes",
    HOUR = "hours",
    DAY = "days",
    WEEK = "weeks",
    MONTH = "months",
    YEAR = "years",
}