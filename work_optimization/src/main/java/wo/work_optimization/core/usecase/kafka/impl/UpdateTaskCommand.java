package wo.work_optimization.core.usecase.kafka.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.dto.request.TaskObjRequestDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.kernel.utils.DataUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class UpdateTaskCommand extends CommandService<TaskObjRequestDTO, String> {

    private final TaskStore taskStore;
    private final TaskMapper taskMapper;

    @Override
    public String command() {
        return TopicConstants.UpdateTaskCommand.UPDATE_TASK;
    }

    @Override
    public TaskObjRequestDTO mapKafkaObject(Object kafkaObjectDto) {
        return taskMapper.mapUpdateTask(kafkaObjectDto);
    }

    @Override
    public void validateRequest(TaskObjRequestDTO request) {
        if (DataUtils.isNullOrEmpty(request)) {
            log.error("Task with originalId {} not existed", request.getId());
            throw new IllegalArgumentException("Task not existed");
        }
    }

    @Override
    public String doCommand(TaskObjRequestDTO request) {
        try {
            Task task = taskStore.findTaskByOriginalId(request.getTaskId());
            if (DataUtils.isNullOrEmpty(task)) {
                log.error("Task with originalId {} not existed", request.getTaskId());
                return "Task not existed";
            }
            task = taskMapper.toEntity(request, task);
            log.info("Update task with originalId {}", request.getTaskId());
            taskStore.save(task);
            return "Update task successfully";
        } catch (Exception e)  {
            log.error("Error while updating task", e);
            throw new IllegalArgumentException("Error while updating task");
        }
    }

}
