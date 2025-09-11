package wo.work_optimization.core.service.factory.strategy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.dto.request.OptimizeTaskRestRequestDTO;
import wo.work_optimization.core.domain.entity.ParentTask;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.service.factory.strategy.connector.StrategyService;
import wo.work_optimization.core.service.integration.database.TaskService;
import wo.work_optimization.kernel.utils.DataUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AllTasksStrategy extends StrategyService {

    private final TaskService taskService;

    @Override
    public String strategy() {
        return "all";
    }

    @Override
    public List<Task> doStrategy(OptimizeTaskRestRequestDTO request, List<ParentTask> parentTasks) {
        final String activeStatus = Constants.ActiveStatus.ACTIVE_STR;
        final Set<String> excludedStatuses = Set.of(Constants.TaskStatus.DONE, Constants.TaskStatus.PENDING);
        return taskService.getAllTasks(parentTasks).stream()
                .filter(task -> activeStatus.equals(task.getActiveStatus())
                        && !excludedStatuses.contains(task.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public void validateRequest(OptimizeTaskRestRequestDTO request) {
        if (DataUtils.isNullOrEmpty(request.getUserId())) {
            throw new IllegalArgumentException("User id is required");
        }
    }

    @Override
    public List<Task> queryTasks(OptimizeTaskRestRequestDTO request, List<ParentTask> parentTasks) {
        return taskService.getAllTasks(parentTasks);
    }
}
