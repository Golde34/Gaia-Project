export enum DatabaseType {
    MYSQL = "mysql",
    MONGODB = "mongodb",
    POSTGRES = "postgres",
}

export enum CommitType {
    TASK = "task",
    GITHUB = "github",
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
}
