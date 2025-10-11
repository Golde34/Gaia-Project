package auth.authentication_service.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class TopicConstants {

    @UtilityClass
    public static class UserTopic {
        public static final String CREATE_USER_TOPIC = "auth-service.create-user.topic";
    }  
}
