package wo.work_optimization.ui.kafka;

import org.springframework.stereotype.Component;

import kafka.lib.java.adapter.consumer.messagehandlers.KafkaMessageHandler;
import lombok.RequiredArgsConstructor;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.ui.kafka.util.ProcessMessage;

@Component
@RequiredArgsConstructor
public class UpdateTaskConsumer extends KafkaMessageHandler {
    
    private final ProcessMessage processor;

    @Override
    public String getTopic() {
        return TopicConstants.UpdateTaskCommand.TOPIC;
    }
    
    @Override
    public void processMessage(String message, String topic) {
        processor.process(message, topic);
    }
}
