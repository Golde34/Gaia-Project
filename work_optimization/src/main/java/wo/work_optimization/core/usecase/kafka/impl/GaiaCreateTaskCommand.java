package wo.work_optimization.core.usecase.kafka.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.TopicConstants;
import wo.work_optimization.core.port.client.TaskManagerServiceClient;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.ParentTaskStore;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.core.validation.TaskValidation;

@Service
@Slf4j
public class GaiaCreateTaskCommand extends CreateTaskCommand {

    public GaiaCreateTaskCommand(TaskManagerServiceClient taskManagerServiceClient, TaskStore taskStore, ParentTaskStore parentTaskStore, TaskMapper taskMapper, TaskValidation taskValidation) {
        super(taskManagerServiceClient, taskStore, parentTaskStore, taskMapper, taskValidation);
    }

    @Override
    public String command() {
        return TopicConstants.HandleTaskCommand.GAIA_CREATE_TASK;
    }
}