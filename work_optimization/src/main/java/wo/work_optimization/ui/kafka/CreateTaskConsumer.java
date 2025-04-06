package wo.work_optimization.ui.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import kafka.lib.java.adapter.consumer.messagehandlers.KafkaMessageHandler;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.usecase.kafka.CommandFactory;
import wo.work_optimization.kernel.utils.ExtractKafkaMessage;

@Component
public class CreateTaskConsumer extends KafkaMessageHandler {

    @Autowired
    private CommandFactory commandHandleFactory;

    @Override
    public String getTopic() {
        return TopicConstants.HandleTaskCommand.TOPIC;
    }

    @Override
    public void processMessage(String message, String topic) {
        String cmd = ExtractKafkaMessage.getCommand(message);
        commandHandleFactory.getCommand(cmd).process(message, cmd);
    }
}
