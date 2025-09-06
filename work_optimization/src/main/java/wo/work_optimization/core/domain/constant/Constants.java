package wo.work_optimization.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {

    @UtilityClass
    public static class HttpStatus {
        public static final String ERROR = "error";
        public static final String SUCCESS = "success";
    }

    @UtilityClass
    public static class HttpCodeMessage {
        public static final String OK = "OK";
        public static final String INVALID = "Invalid";
        public static final String NOT_FOUND = "Not Found";
        public static final String ALREADY_EXISTS = "Already Exists";
        public static final String UNAUTHORIZED = "Unauthorized";
        public static final String FORBIDDEN = "Forbidden";
        public static final String BAD_REQUEST = "Bad Request";
        public static final String INTERNAL_SERVER_ERROR = "Internal Server Error";
    }

    @UtilityClass
    public static class WOConfiguration {
        public static String SYSTEM_CACHE_RELOAD_MINUTE = "global.config.minute";

        public static String KAFKA_CONTAINER_NAME = "wo";
    }

    @UtilityClass
    public static class CustomHeader {
        public static String SERVICE_HEADER = "Service";
        public static String SERVICE_TOKEN_HEADER = "Service-Token";
        public static String AUTHORIZATION_HEADER = "Authorization";
    }

    @UtilityClass
    public static class ErrorMessage {
        public static String SUCCESS = "Success";

        public static String INVALID_REQUEST = "Invalid Request";
        public static String INTERNAL_SERVER_ERROR = "There's something wrong with the server";
        public static String NOT_FOUND = "Transaction Not Found";
        public static String USER_NOT_FOUND = "User Not Found";
        public static String EXISTED_USER = "User already exists";
        public static String TOTAL_TIME_IN_DAY_ERROR = "The total time in day must be 24 hours";
    }

    @UtilityClass
    public static class ErrorStatus {
        public static String SUCCESS = "SUCCESS";
        public static String FAIL = "FAIL";
        public static String TIMEOUT = "TIMEOUT";
        public static String INIT = "INIT";
    }

    @UtilityClass
    public static class ActiveStatus {
        public static final int ACTIVE = 1;
        public static final int INACTIVE = 0;
        public static final String ACTIVE_STR = "ACTIVE";
        public static final String INACTIVE_STR = "INACTIVE";
    }

    @UtilityClass
    public static class TaskStatus {
        public static final String DONE = "DONE";
        public static final String IN_PROGRESS = "IN_PROGRESS";
        public static final String PENDING = "PENDING";
        public static final String TODO = "TODO";
    }

    @UtilityClass
    public static class OptimizeVariables {
        public static final double EFFORT_BIAS = 0.09;
        public static final double ENJOYABILITY_BIAS = 0.5;
        public static final int BATCH_SIZE = 5;
        public static final double MAX_DURATION = 8;

        public static final int ERROR = -1;
        public static final double ERROR_DOUBLE = -1.0;
    }
}
