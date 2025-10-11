package auth.authentication_service.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ErrorConstants {
    
    @UtilityClass
    public static class ErrorCode {
        public static final String SUCCESS = "00";
        public static final String FAIL = "99";
    }

    @UtilityClass
    public static class ErrorMessage {
        public static final String SUCCESS = "Success!";
        public static final String FAIL = "Fail!";
    }
}
