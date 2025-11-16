package wo.work_optimization.core.service.factory.schedule.gaia_algorithm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GaiaAlgorithm extends ScheduleService<GaiaAlgorithmDTO, List<Task>> {

    private final CustomCalculatedHandler algorithm;

    @Override
    public String method() {
        return "GaiaAlgorithm";
    }

    @Override
    public List<Task> doSchedule(GaiaAlgorithmDTO request) {
        return algorithm.optimize(request);
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
        double maxDuration = tasks.stream()
            .mapToDouble(Task::getDuration).max().orElse(Constants.OptimizeVariables.MAX_DURATION);
        tasks = this.sortTaskByPriority(tasks);
        List<List<Task>> taskBatches = new ArrayList<>();
        int batchSize = calculateUserBatchSize(tasks, totalTime, maxDuration); 
        for (int i = 0; i < tasks.size(); i += batchSize) {
            List<Task> batch = tasks.subList(i, Math.min(i + batchSize, tasks.size()));
            taskBatches.add(new ArrayList<>(batch));
        }
        return taskBatches;
    }

    private int calculateUserBatchSize(List<Task> tasks, double totalTime, double maxDuration) {
        int batchSize = (int) Math.floor(totalTime / maxDuration);
        return Math.max(Math.min(tasks.size(), batchSize), Constants.OptimizeVariables.BATCH_SIZE);
    }

    private List<Task> sortTaskByPriority(List<Task> tasks) {
        // Dynamic tuning of alpha, beta, gamma based on data dispersion
        // to balance contributions from timeFactor, enjoyability, and effort.
        double sumTF = 0, sumTF2 = 0;
        double sumEnjoy = 0, sumEnjoy2 = 0;
        double sumEffort = 0, sumEffort2 = 0;

        int n = Math.max(tasks.size(), 1);
        for (Task t : tasks) {
            double tf = 1.0 / (Duration.between(
                    DateTimeUtils.convertLongToLocalDateTime(t.getStartDate()), LocalDateTime.now()).toHours() + 1);
            double en = t.getEnjoyability();
            double ef = t.getEffort();

            sumTF += tf;
            sumTF2 += tf * tf;
            sumEnjoy += en;
            sumEnjoy2 += en * en;
            sumEffort += ef;
            sumEffort2 += ef * ef;
        }

        double varTF = Math.max(1e-9, (sumTF2 / n) - Math.pow(sumTF / n, 2));
        double varEnjoy = Math.max(1e-9, (sumEnjoy2 / n) - Math.pow(sumEnjoy / n, 2));
        double varEffort = Math.max(1e-9, (sumEffort2 / n) - Math.pow(sumEffort / n, 2));

        // Inverse-variance weighting to equalize scale across features
        double alpha = 1.0 / varTF;
        double beta = 1.0 / varEnjoy;
        double gamma = 1.0 / varEffort;

        // Preference bias: slightly prioritize effort penalty and enjoyment reward
        double gammaAdj = gamma * 1.1; // stronger penalty for high effort
        double betaAdj = beta * 1.0; // keep enjoyability as-is
        double alphaAdj = alpha * 0.9; // slightly lower time sensitivity to reduce noise

        // Normalize to keep weights comparable
        double norm = alphaAdj + betaAdj + gammaAdj;
        final double alphaNorm, betaNorm, gammaNorm;
        if (norm > 0) {
            alphaNorm = alphaAdj / norm;
            betaNorm = betaAdj / norm;
            gammaNorm = gammaAdj / norm;
        } else {
            alphaNorm = alphaAdj;
            betaNorm = betaAdj;
            gammaNorm = gammaAdj;
        }

        // Print tuned parameters for visibility in tests
        System.out.printf("Tuned parameters -> alpha=%.6f, beta=%.6f, gamma=%.6f%n", alphaNorm, betaNorm, gammaNorm);
        return tasks.stream().sorted((task1, task2) -> Double.compare(
            this.calculatePriorityScore(task1, alphaNorm, betaNorm, gammaNorm),
            this.calculatePriorityScore(task2, alphaNorm, betaNorm, gammaNorm)
        )).collect(Collectors.toList());
    }

    public double calculatePriorityScore(Task task, double alpha, double beta, double gamma) {
        double timeFactor = 1.0 / (Duration.between(
                DateTimeUtils.convertLongToLocalDateTime(task.getStartDate()), LocalDateTime.now()).toHours() + 1);
        return alpha * timeFactor + beta * task.getEnjoyability() - gamma * task.getEffort();
    }

    @Override
    public String mapResponse(List<Task> response) {
        if (response.isEmpty()) {
            return Constants.ErrorStatus.FAIL;
        }
        return Constants.ErrorStatus.SUCCESS;
    }

}
