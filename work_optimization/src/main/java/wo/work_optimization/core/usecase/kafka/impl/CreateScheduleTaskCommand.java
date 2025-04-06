package wo.work_optimization.core.usecase.kafka.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.dto.request.TaskObjRequestDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.service.integration.database.TaskService;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.kernel.utils.DataUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class CreateScheduleTaskCommand extends CommandService<TaskObjRequestDTO, String> {

    private final TaskService taskService;
    private final TaskMapper taskMapper;

    @Override
    public String command() {
        return TopicConstants.CreateScheduleTaskCommand.SCHEDULE_GROUP_CREATE_TASK;
    }

    @Override
    public TaskObjRequestDTO mapKafkaObject(Object kafkaObjectDto) {
        try {
            return taskMapper.mapUpdateTask(kafkaObjectDto); 
        } catch (Exception e) {
            log.error(String.format("Cannot map kafka object to entity: %s", e.getMessage()), e);
            return null;
        }
    }

    @Override
    public void validateRequest(TaskObjRequestDTO request) {
        return;
    }

    @Override
    public String doCommand(TaskObjRequestDTO request) {
        try {
            Task createdTask = taskService.getTaskByOriginalId(request.getTaskId()); 
            if (DataUtils.isNullOrEmpty(createdTask)) {
                log.error("Task not found with original id: {}", request.getTaskId());
                return "Task not found";
            }
            // Task task = taskMapper.toEntity(request);
            return "No good"; 
        } catch (Exception e) {
            log.error("Cannot save schedule task: {}", e.getMessage(), e);
            return "Save schedule task failed";
        }
    }
}
