package auth.authentication_service.core.services;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.constant.ErrorConstants;
import auth.authentication_service.core.domain.constant.TopicConstants;
import auth.authentication_service.core.domain.dto.KafkaBaseDto;
import auth.authentication_service.core.domain.entities.User;
import kafka.lib.java.adapter.producer.KafkaPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushKafkaMessage {

    private final KafkaPublisher kafkaPublisher;

    @Async
    public void pushCreateUserMessage(User user) {
        try {
            log.info("Push create user message: {}", user);
            KafkaBaseDto<User> message = KafkaBaseDto.<User>builder()
                    .cmd(Constants.KafkaCommand.CREATE_USER)
                    .errorCode(ErrorConstants.ErrorCode.SUCCESS)
                    .errorMessage(ErrorConstants.ErrorMessage.SUCCESS)
                    .data(user)
                    .build();
            kafkaPublisher.pushAsync(message, TopicConstants.UserTopic.CREATE_USER_TOPIC,
                    Constants.AuthConfiguration.KAFKA_CONTAINER_NAME, null);
            log.info("Sent kafka to create user");
        } catch (Exception e) {
            log.error("Error while pushing message to Kafka: {}", e.getMessage());
        }
    }
}
