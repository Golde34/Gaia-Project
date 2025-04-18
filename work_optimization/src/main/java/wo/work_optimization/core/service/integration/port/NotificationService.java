package wo.work_optimization.core.service.integration.port;

import org.springframework.stereotype.Service;

import kafka.lib.java.adapter.producer.KafkaPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.constant.ErrorConstants;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.kafka.OptimizeTaskNotiMessage;
import wo.work_optimization.core.domain.kafka.base.KafkaBaseDto;
import wo.work_optimization.kernel.utils.ULID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final KafkaPublisher kafkaPublisher;

    public String sendOptimizeNotification(long userId, String optimizeStatus) {
        try {
            log.info("Sending optimize notification to user: {}", userId);
            OptimizeTaskNotiMessage data = OptimizeTaskNotiMessage.builder()
                    .userId(userId)
                    .optimizeStatus(optimizeStatus)
                    .errorStatus(Constants.ErrorStatus.INIT)
                    .notificationFlowId(ULID.nextULID())
                    .build();

            KafkaBaseDto<OptimizeTaskNotiMessage> message = data.toKafkaBaseDto(ErrorConstants.ErrorCode.SUCCESS,
                    ErrorConstants.ErrorMessage.SUCCESS);
            String messageId = ULID.nextULID();
            kafkaPublisher.pushAsync(message, messageId, TopicConstants.NotificationCommand.TOPIC,
                    Constants.WOConfiguration.KAFKA_CONTAINER_NAME, null);
            return data.getNotificationFlowId();
        } catch (Exception e) {
            log.error("Error sending optimize notification to user: {}", userId);
            // Send notification by rest
            return null;
        }
    }
}
