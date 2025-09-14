package wo.work_optimization.core.service.integration.database;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.dto.request.OptimizeTaskRequestDTO;
import wo.work_optimization.core.domain.dto.response.OriginalTaskResponseDTO;
import wo.work_optimization.core.domain.entity.ParentTask;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.port.mapper.TaskMapper;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.infrastructure.client.adapter.TaskManagerServiceAdapter;
import wo.work_optimization.kernel.utils.DataUtils;

import java.text.ParseException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {

    private final TaskStore taskStore;
    private final TaskManagerServiceAdapter taskManagerServiceAdapter;
    private final TaskMapper taskMapper;

    public Task getTaskByOriginalId(String originalTaskId) throws ParseException {
        try {
            Task task = taskStore.findTaskByOriginalId(originalTaskId);
            if (DataUtils.isNullOrEmpty(task)) {
                // Call Task Manager service to get task by original id
                OriginalTaskResponseDTO originalTaskResponseDTO = taskManagerServiceAdapter
                        .getOriginalTask(originalTaskId);
                return taskMapper.toEntity(originalTaskResponseDTO);
            }
            return task;
        } catch (Exception e) {
            log.error("Error when get task by original id: {}", e.getMessage());
            return null;
        }
    }

    public Task getTask(OptimizeTaskRequestDTO request) {
        log.info("Get task by taskId: {}, optimTaskId: {}, scheduleTaskId: {}", request.getTaskId(),
                request.getWorkOptimTaskId(), request.getScheduleTaskId());
        Task task = taskStore.checkSyncTask(request.getTaskId(), request.getScheduleTaskId(),
                request.getWorkOptimTaskId());
        log.info("Task: {}", task);
        return task;
    }

    public List<Task> getAllTasks(List<ParentTask> parentTasks) {
        return parentTasks.stream()
                .flatMap(parentTask -> taskStore.findAllByParentId(parentTask.getId()).stream())
                .collect(Collectors.toList());
    }

    public List<Task> getTasksInDay(List<ParentTask> parentTasks, String date) {
        final String activeStatus = Constants.ActiveStatus.ACTIVE_STR;
        final Set<String> excludedStatuses = Set.of(Constants.TaskStatus.DONE,
                Constants.TaskStatus.PENDING);
        List<Task> tasksStartInDay = parentTasks.stream()
                .flatMap(parentTask -> {
                    try {
                        return taskStore.findAllByParentIdAndStartDate(parentTask.getId(), date).stream()
                                .filter(task -> activeStatus.equals(task.getActiveStatus())
                                        && !excludedStatuses.contains(task.getStatus()));
                    } catch (ParseException e) {
                        log.error("Error when get tasks start in day: {}", e.getMessage());
                        e.printStackTrace();
                        return null;
                    }
                })
                .collect(Collectors.toList());
        // all task that endDate must smaller than today
        List<Task> tasksNotDoneTilDay = parentTasks.stream()
                .flatMap(parentTask -> {
                    try {
                        return taskStore.findAllByParentIdAndEndDate(parentTask.getId(), date).stream();
                    } catch (ParseException e) {
                        log.error("Error when get tasks end in day: {}", e.getMessage());
                        e.printStackTrace();
                        return Stream.empty();
                    }
                })
                .collect(Collectors.toList());
        return Stream.concat(tasksStartInDay.stream(), tasksNotDoneTilDay.stream())
                .collect(Collectors.toList());
    }
}
