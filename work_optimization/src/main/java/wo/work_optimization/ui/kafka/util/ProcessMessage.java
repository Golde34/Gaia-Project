package wo.work_optimization.ui.kafka.util;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.usecase.kafka.CommandConnector;
import wo.work_optimization.core.usecase.kafka.CommandFactory;
import wo.work_optimization.kernel.utils.DataUtils;
import wo.work_optimization.kernel.utils.ExtractKafkaMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProcessMessage {

    private final CommandFactory commandFactory;

    public void process(String message, String topic) {
        String cmd = ExtractKafkaMessage.getCommand(message);
        CommandConnector commandConnector = commandFactory.getCommand(cmd);
        if (DataUtils.isNullOrEmpty(commandConnector)) {
            log.error("Command {} not found", cmd);
            return;
        }
        commandConnector.process(message, cmd);
        log.info("Processed command: {} with message: {}", cmd, message);
    }
}
