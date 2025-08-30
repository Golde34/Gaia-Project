package wo.work_optimization.core.usecase.kafka.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.dto.request.OptimizeTaskRestRequestDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.core.usecase.rest.TaskOptimizationUseCase;

@Service
@Slf4j
@RequiredArgsConstructor
public class OptimizeTaskListCommand extends CommandService<OptimizeTaskRestRequestDTO, String> {

    private final TaskMapper taskMapper;
    private final TaskOptimizationUseCase taskOptimizationUseCase;

    @Override
    public String command() {
        return TopicConstants.OptimizeCommand.OPTIMIZE_TASKS;
    } 

    @Override
    public OptimizeTaskRestRequestDTO mapKafkaObject(Object kafkaMessage) {
        OptimizeTaskRestRequestDTO message = taskMapper.toOptimizeTaskRestRequestDTO(kafkaMessage);
        log.info("OptimizeTaskListCommand mapKafkaObject: {}", message.toString());
        return message; 
    }

    @Override
    public void validateRequest(OptimizeTaskRestRequestDTO request) {
        // Add validation logic if necessary
        if (request.getUserId() == null || request.getOptimizedDate() == null) {
            throw new IllegalArgumentException("User ID and Optimized Date must not be null");
        }
    }

    @Override
    public String doCommand(OptimizeTaskRestRequestDTO request) {
        GeneralResponse<?> response = taskOptimizationUseCase.optimizeTaskByUser(request);
        log.info("Saved tasks: {}", response.getData().toString());
        return response.getStatus();
    }
}
