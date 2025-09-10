package wo.work_optimization.core.usecase.kafka.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.dto.request.UpdateTaskStatusRequestDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.kernel.utils.DataUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class UpdateTaskFieldCommand extends CommandService<UpdateTaskStatusRequestDTO, String> {

    private final TaskStore taskStore;
    private final TaskMapper taskMapper;

    @Override
    public String command() {
        return TopicConstants.UpdateTaskCommand.UPDATE_TASK_STATUS;
    }

    @Override
    public UpdateTaskStatusRequestDTO mapKafkaObject(Object kafkaObject) {
        return taskMapper.mapUpdateTaskStatus(kafkaObject);
    }
    
    @Override
    public void validateRequest(UpdateTaskStatusRequestDTO request) {
    }

    @Override
    public String doCommand(UpdateTaskStatusRequestDTO request) {
        try {
            Task task = taskStore.findTaskByOriginalId(request.getTaskId());
            if (DataUtils.isNullOrEmpty(task)) {
                log.error("Task with originalId {} not found", request.getTaskId());
                return "Task is not existed";
            }
            task.setStatus(request.getStatus());
            taskStore.save(task);
            return "Update task successfully";
        } catch (Exception e) {
            log.error("Error while updating task", e);
            throw new IllegalArgumentException("Error while updating task status");
        }
    }
}
