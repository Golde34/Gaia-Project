package wo.work_optimization.core.service.factory.schedule.tabu;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.dto.request.GaiaAlgorithmDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.service.factory.schedule.connector.ScheduleService;
import wo.work_optimization.kernel.utils.DateTimeUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TabuSchedule extends ScheduleService<GaiaAlgorithmDTO, List<Task>> {

    private final TabuSearchHandler tabuSearchHandler;

    @Override
    public String method() {
        return "TabuSearch";
    }

    @Override
    public List<Task> doSchedule(GaiaAlgorithmDTO request) {
        return tabuSearchHandler.optimize(request);
    }

    @Override
    public GaiaAlgorithmDTO createRequest(List<Task> tasks, TaskRegistration taskRegistration, int batchIndex) {
        return GaiaAlgorithmDTO.builder()
                .userId(taskRegistration.getUserId())
                .tasks(tasks)
                .taskRegistration(taskRegistration)
                .batchIndex(batchIndex)
                .build();
    }

    @Override
    public List<List<Task>> sortTaskToBatches(double totalTime, List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return Collections.emptyList();
        }

        List<Task> sortedTasks = new ArrayList<>(tasks);
        sortedTasks.sort((task1, task2) -> Double.compare(
                scoreForBatching(task2),
                scoreForBatching(task1)
        ));

        double availableTime = totalTime > 0
                ? totalTime
                : sortedTasks.stream().mapToDouble(Task::getDuration).sum();
        double maxDuration = sortedTasks.stream()
                .mapToDouble(Task::getDuration)
                .max()
                .orElse(Constants.OptimizeVariables.MAX_DURATION);

        int batchSize = calculateBatchSize(sortedTasks.size(), availableTime, maxDuration);

        List<List<Task>> batches = new ArrayList<>();
        for (int index = 0; index < sortedTasks.size(); index += batchSize) {
            batches.add(new ArrayList<>(sortedTasks.subList(index, Math.min(index + batchSize, sortedTasks.size()))));
        }
        return batches;
    }

    private int calculateBatchSize(int taskCount, double availableTime, double maxDuration) {
        if (taskCount <= 0) {
            return 0;
        }

        double safeMaxDuration = Math.max(1.0, maxDuration);
        int estimated = (int) Math.floor(availableTime / safeMaxDuration);
        estimated = Math.max(1, estimated);
        estimated = Math.min(taskCount, estimated);

        int minimum = Math.min(taskCount, Constants.OptimizeVariables.BATCH_SIZE);
        int batchSize = Math.max(minimum, estimated);
        return Math.min(taskCount, batchSize);
    }

    private double scoreForBatching(Task task) {
        double urgency = 0.5;
        try {
            Duration toDeadline = Duration.between(LocalDateTime.now(),
                    DateTimeUtils.convertLongToLocalDateTime(task.getEndDate()));
            urgency = 1.0 / (1.0 + Math.max(0.0, toDeadline.toHours()));
        } catch (Exception ignored) {
            // Swallow conversion failure and keep default urgency
        }
        return urgency + task.getEnjoyability() - task.getEffort() + task.getPriority();
    }

    @Override
    public String mapResponse(List<Task> response) {
        return (response == null || response.isEmpty())
                ? Constants.ErrorStatus.FAIL
                : Constants.ErrorStatus.SUCCESS;
    }
}
