package wo.work_optimization.core.usecase.kafka.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.domain.constant.ValidateConstants;
import wo.work_optimization.core.domain.dto.request.CreateTaskRequestDTO;
import wo.work_optimization.core.domain.dto.request.GetGroupTaskProjectRequestDTO;
import wo.work_optimization.core.domain.dto.response.GroupTaskAndProjectResponseDTO;
import wo.work_optimization.core.domain.entity.ParentTask;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.client.TaskManagerServiceClient;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.ParentTaskStore;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.core.usecase.kafka.CommandService;
import wo.work_optimization.core.validation.TaskValidation;
import wo.work_optimization.kernel.utils.DataUtils;

import java.text.ParseException;

@Service
@Slf4j
@RequiredArgsConstructor
public class CreateTaskCommand extends CommandService<CreateTaskRequestDTO, String> {

    private final TaskManagerServiceClient taskManagerServiceClient;
    private final TaskStore taskStore;
    private final ParentTaskStore parentTaskStore;
    private final TaskMapper taskMapper;
    private final TaskValidation taskValidation;

    @Override
    public String command() {
        return TopicConstants.HandleTaskCommand.CREATE_TASK;
    }

    @Override
    public CreateTaskRequestDTO mapKafkaObject(Object kafkaObjectDto) {
        return taskMapper.mapCreateTask(kafkaObjectDto);
    }

    @Override
    public void validateRequest(CreateTaskRequestDTO request) {
        if (ValidateConstants.FAIL == taskValidation.validateCreateTaskRequest(request)) {
            log.error("Task with originalId {} already exists", request.getTask().getId());
            throw new IllegalArgumentException("Validate fail by object existed!");
        }
    }

    @Override
    public String doCommand(CreateTaskRequestDTO request) {
        try {
            ParentTask parentTask = parentTaskNotExisted(request);
            if (DataUtils.isNullOrEmpty(parentTask)) {
                log.error("Parent task not existed");
                throw new IllegalArgumentException("Parent task not existed");
            }
            Task task = taskMapper.toEntity(request);
            task.setParentTask(parentTask);
            log.info("Add parent task id to task: {}", task);
            taskStore.createTask(task);

            return "OK";
        } catch (ParseException e) {
            log.error("Error while parsing date time", e);
            throw new IllegalArgumentException("Error while parsing date time");
        }
    }

    private ParentTask parentTaskNotExisted(CreateTaskRequestDTO request) {
        GetGroupTaskProjectRequestDTO tmRequest = GetGroupTaskProjectRequestDTO.builder()
                .userId(request.getUserId())
                .groupTask(request.getGroupTask())
                .project(request.getProject())
                .build();
        GroupTaskAndProjectResponseDTO tmResponse = taskManagerServiceClient.getGroupTaskAndProject(request.getTaskId(), tmRequest);
        if (DataUtils.isNullOrEmpty(tmResponse)) {
            return null;
        }
        ParentTask clientParentTask = ParentTask.builder()
                .groupTaskId(tmResponse.getGroupTaskId())
                .projectId(tmResponse.getProjectId())
                .groupTaskName(tmResponse.getGroupTaskName())
                .projectName(tmResponse.getProjectName())
                .userId(request.getUserId())
                .build();
        ParentTask existedParentTask = parentTaskStore.findByGroupTaskId(clientParentTask.getGroupTaskId()).orElse(null);
        if (DataUtils.isNullOrEmpty(existedParentTask)) {
            return parentTaskStore.createParentTask(clientParentTask);
        }
        return existedParentTask;
    }
}