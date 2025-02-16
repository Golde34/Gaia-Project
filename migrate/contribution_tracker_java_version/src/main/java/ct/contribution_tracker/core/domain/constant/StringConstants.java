package ct.contribution_tracker.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class StringConstants {

    @UtilityClass
    public static class Platform {
        public static final String GITHUB = "github";
        public static final String TRELLO = "trello";
    }

    @UtilityClass
    public static class ParamType {
        public static final String GITHUB_TYPE = "github_config";
    }

    @UtilityClass
    public static class CustomHeader {
        public static String SERVICE_HEADER = "Service";
        public static String SERVICE_TOKEN_HEADER = "Service-Token";
        public static String AUTHORIZATION_HEADER = "Authorization";
    }
}
