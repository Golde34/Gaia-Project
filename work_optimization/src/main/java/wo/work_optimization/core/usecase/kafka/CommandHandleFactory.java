package wo.work_optimization.core.usecase.kafka;

import jakarta.annotation.PostConstruct;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommandHandleFactory implements CommandFactory {

    public static final Map<String, CommandConnector> commandConnectorMap = new ConcurrentHashMap<>();
    private final List<CommandConnector> commandConnectors;

    @PostConstruct
    private void init() {
        commandConnectorMap.putAll(commandConnectors.stream()
                .collect(Collectors.toMap(CommandConnector::command, Function.identity())));
    }

    @Override
    public CommandConnector getCommand(@NonNull String command) {
        CommandConnector commandConnector = commandConnectorMap.get(command);
        return commandConnector;
    }
}
