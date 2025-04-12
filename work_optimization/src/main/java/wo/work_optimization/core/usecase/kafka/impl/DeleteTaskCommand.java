package wo.work_optimization.core.usecase.kafka.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.kernel.utils.DataUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeleteTaskCommand extends CommandService<String, String> {
    
    private final TaskStore taskStore;
    private final TaskMapper taskMapper;

    @Override
    public String command() {
        return TopicConstants.DeleteTaskCommand.DELETE_TASK;
    }

    @Override
    public String mapKafkaObject(Object kafkaObjectDto) {
        return taskMapper.mapDeleteTask(kafkaObjectDto);
    }

    @Override
    public void validateRequest(String request) {
        if (DataUtils.isNullOrEmpty(request)) {
            log.error("Task with originalId {} not existed", request);
            throw new IllegalArgumentException("Task not existed");
        }
    }

    @Override
    public String doCommand(String request) {
        try {
            Task task = taskStore.findTaskByOriginalId(request);
            if (DataUtils.isNullOrEmpty(task)) {
                log.error("Task with originalId {} not existed", request);
                return "Task not existed";
            }
            taskStore.deleteTask(task);
            return "Delete task successfully";
        } catch (Exception e)  {
            log.error("Error while deleting task", e);
            throw new IllegalArgumentException("Error while deleting task");
        }
    }
}
 