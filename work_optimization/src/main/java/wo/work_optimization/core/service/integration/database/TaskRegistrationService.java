package wo.work_optimization.core.service.integration.database;

import org.springframework.data.util.Pair;
import wo.work_optimization.core.domain.dto.request.QueryTaskConfigRequestDTO;
import wo.work_optimization.core.domain.dto.request.TaskRegistrationRequestDTO;
import wo.work_optimization.core.domain.dto.response.RegisteredTaskConfigStatus;
import wo.work_optimization.core.domain.entity.TaskRegistration;

public interface TaskRegistrationService {
    TaskRegistration registerWorkOptimization(TaskRegistrationRequestDTO request);
    RegisteredTaskConfigStatus isTaskConfigExisted(QueryTaskConfigRequestDTO request);
    TaskRegistration getTaskRegistrationByUserId(Long userId);
    Pair<String, Boolean> checkExistedUser(Long userId);
}
