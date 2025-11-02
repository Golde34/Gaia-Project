package wo.work_optimization.core.service.factory.schedule.tabu;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.dto.request.GaiaAlgorithmDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.port.store.TaskStore;
import wo.work_optimization.kernel.utils.DateTimeUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class TabuSearchHandler {

    private static final int MIN_ITERATIONS = 40;
    private static final int MAX_ITERATIONS = 350;
    private static final int MIN_TABU_TENURE = 5;
    private static final int MAX_TABU_TENURE = 25;
    private static final int STALE_ITERATION_LIMIT = 45;
    private static final double BASE_DURATION_PENALTY = 0.35;

    private final TaskStore taskStore;

    public List<Task> optimize(GaiaAlgorithmDTO request) {
        List<Task> originalTasks = Optional.ofNullable(request.getTasks()).orElse(List.of());
        if (originalTasks.isEmpty()) {
            return originalTasks;
        }

        TaskRegistration registration = request.getTaskRegistration();
        TabuSolution solution = runTabuSearch(originalTasks, registration);
        persistSolution(solution, request.getBatchIndex());
        return solution.orderedTasks();
    }

    private TabuSolution runTabuSearch(List<Task> tasks, TaskRegistration registration) {
        List<TaskFeature> features = buildFeatures(tasks, registration);
        Map<String, TaskFeature> featureMap = features.stream()
                .collect(Collectors.toMap(feature -> feature.task().getId(), feature -> feature));

        int taskCount = features.size();
        List<Integer> currentOrder = initialOrder(features);
        double capacity = resolveCapacity(registration, features);
        double overtimePenalty = resolveOvertimePenalty(registration);

        double currentScore = evaluateSolution(features, currentOrder, capacity, overtimePenalty);
        double bestScore = currentScore;
        List<Integer> bestOrder = new ArrayList<>(currentOrder);

        int maxIterations =
                Math.min(MAX_ITERATIONS, Math.max(MIN_ITERATIONS, taskCount * taskCount));
        int tabuTenure =
                Math.min(MAX_TABU_TENURE, Math.max(MIN_TABU_TENURE, taskCount / 2));

        Map<String, Integer> tabuList = new HashMap<>();
        Deque<String> tabuQueue = new ArrayDeque<>();
        int staleCounter = 0;

        for (int iteration = 0; iteration < maxIterations; iteration++) {
            NeighborCandidate candidate = findBestNeighbor(
                    features,
                    currentOrder,
                    capacity,
                    overtimePenalty,
                    tabuList,
                    bestScore,
                    iteration);

            if (candidate == null) {
                break;
            }

            currentOrder = candidate.order();
            currentScore = candidate.score();

            tabuList.put(candidate.moveKey(), iteration + tabuTenure);
            tabuQueue.addLast(candidate.moveKey());
            pruneExpiredTabuMoves(tabuQueue, tabuList, iteration);

            if (currentScore > bestScore) {
                bestScore = currentScore;
                bestOrder = new ArrayList<>(currentOrder);
                staleCounter = 0;
            } else {
                staleCounter++;
            }

            if (staleCounter >= STALE_ITERATION_LIMIT) {
                break;
            }
        }

        List<Task> orderedTasks = bestOrder.stream()
                .map(index -> features.get(index).task())
                .collect(Collectors.toList());

        return new TabuSolution(orderedTasks, featureMap, bestScore);
    }

    private NeighborCandidate findBestNeighbor(List<TaskFeature> features,
                                               List<Integer> currentOrder,
                                               double capacity,
                                               double overtimePenalty,
                                               Map<String, Integer> tabuList,
                                               double bestScore,
                                               int iteration) {

        NeighborCandidate bestCandidate = null;

        int size = currentOrder.size();
        for (int i = 0; i < size - 1; i++) {
            for (int j = i + 1; j < size; j++) {
                List<Integer> neighbor = new ArrayList<>(currentOrder);
                Collections.swap(neighbor, i, j);

                double score = evaluateSolution(features, neighbor, capacity, overtimePenalty);
                String moveKey = buildMoveKey(currentOrder.get(i), currentOrder.get(j));
                boolean isTabu = tabuList.getOrDefault(moveKey, -1) > iteration;

                if (bestCandidate == null
                        || score > bestCandidate.score()
                        || (isTabu && score > bestScore)) {
                    if (!isTabu || score > bestScore) {
                        bestCandidate = new NeighborCandidate(neighbor, score, moveKey);
                    }
                }
            }
        }

        return bestCandidate;
    }

    private List<Integer> initialOrder(List<TaskFeature> features) {
        return IntStream.range(0, features.size())
                .boxed()
                .sorted((left, right) -> Double.compare(
                        features.get(right).baseScore(),
                        features.get(left).baseScore()))
                .collect(Collectors.toList());
    }

    private List<TaskFeature> buildFeatures(List<Task> tasks, TaskRegistration registration) {
        double minPriority = tasks.stream().mapToDouble(Task::getPriority).min().orElse(0);
        double maxPriority = tasks.stream().mapToDouble(Task::getPriority).max().orElse(1);
        double minEnjoy = tasks.stream().mapToDouble(Task::getEnjoyability).min().orElse(0);
        double maxEnjoy = tasks.stream().mapToDouble(Task::getEnjoyability).max().orElse(1);
        double minEffort = tasks.stream().mapToDouble(Task::getEffort).min().orElse(0);
        double maxEffort = tasks.stream().mapToDouble(Task::getEffort).max().orElse(1);
        double minDuration = tasks.stream().mapToDouble(Task::getDuration).min().orElse(0);
        double maxDuration = tasks.stream().mapToDouble(Task::getDuration).max().orElse(1);

        double weightPriority = safePositive(registration != null ? registration.getConstant1() : null, 1.0);
        double weightEnjoy = safePositive(registration != null ? registration.getConstant2() : null, 1.0);
        double weightEffort = safePositive(registration != null ? registration.getConstant3() : null, 1.0);

        LocalDateTime now = LocalDateTime.now();
        List<TaskFeature> features = new ArrayList<>();

        for (Task task : tasks) {
            String taskId = task.getId();
            if (taskId == null) {
                continue;
            }

            double priorityNorm = normalize(task.getPriority(), minPriority, maxPriority);
            double enjoyNorm = normalize(task.getEnjoyability(), minEnjoy, maxEnjoy);
            double effortNorm = normalize(task.getEffort(), minEffort, maxEffort);
            double duration = Math.max(task.getDuration(), 0);
            double durationNorm = normalize(duration, minDuration, maxDuration);
            double urgency = computeUrgency(task, now);

            double baseScore = weightPriority * priorityNorm
                    + weightEnjoy * enjoyNorm
                    + weightEffort * (1.0 - effortNorm)
                    + urgency
                    - BASE_DURATION_PENALTY * durationNorm;

            features.add(new TaskFeature(task, duration, durationNorm, priorityNorm, enjoyNorm, effortNorm, urgency, baseScore));
        }

        return features;
    }

    private double resolveCapacity(TaskRegistration registration, List<TaskFeature> features) {
        double totalDuration = features.stream()
                .mapToDouble(TaskFeature::duration)
                .sum();
        if (registration == null || registration.getMaxWorkTime() == null || registration.getMaxWorkTime() <= 0) {
            return totalDuration;
        }
        return Math.max(registration.getMaxWorkTime(), totalDuration * 0.6);
    }

    private double resolveOvertimePenalty(TaskRegistration registration) {
        double weightSum = 3.0;
        if (registration != null) {
            weightSum += Optional.ofNullable(registration.getConstant1()).orElse(0.0);
            weightSum += Optional.ofNullable(registration.getConstant2()).orElse(0.0);
            weightSum += Optional.ofNullable(registration.getConstant3()).orElse(0.0);
        }
        return Math.max(1.5, weightSum);
    }

    private void persistSolution(TabuSolution solution, int batchIndex) {
        double cumulativeTime = 0.0;
        for (int order = 0; order < solution.orderedTasks().size(); order++) {
            Task task = solution.orderedTasks().get(order);
            TaskFeature feature = solution.features().get(task.getId());
            if (feature == null) {
                continue;
            }

            cumulativeTime += feature.duration();
            double weight = feature.baseScore();
            double stopTime = cumulativeTime;
            double effort = Objects.requireNonNullElse(task.getEffort(), feature.effortNorm());
            double enjoyability = Objects.requireNonNullElse(task.getEnjoyability(), feature.enjoymentNorm());

            try {
                taskStore.optimizeTask(task.getId(), weight, stopTime, effort, enjoyability, order + 1, batchIndex);
                task.setTaskOrder(order + 1);
                task.setWeight(weight);
                task.setStopTime(stopTime);
            } catch (Exception exception) {
                log.error("Failed to persist optimized task {}: {}", task.getId(), exception.getMessage(), exception);
            }
        }
    }

    private double evaluateSolution(List<TaskFeature> features,
                                    List<Integer> order,
                                    double capacity,
                                    double overtimePenalty) {
        double cumulativeTime = 0.0;
        double score = 0.0;

        for (int position = 0; position < order.size(); position++) {
            TaskFeature feature = features.get(order.get(position));
            cumulativeTime += feature.duration();

            double positionalWeight = 1.0 / (1 + position);
            double overtime = Math.max(0.0, cumulativeTime - capacity);
            double penalty = overtimePenalty * overtime + feature.durationNorm() * position * 0.05;

            score += positionalWeight * feature.baseScore() - penalty;
        }

        return score;
    }

    private void pruneExpiredTabuMoves(Deque<String> tabuQueue,
                                       Map<String, Integer> tabuList,
                                       int currentIteration) {
        while (!tabuQueue.isEmpty()) {
            String move = tabuQueue.peekFirst();
            Integer expiry = tabuList.get(move);
            if (expiry != null && expiry <= currentIteration) {
                tabuQueue.removeFirst();
                tabuList.remove(move);
            } else {
                break;
            }
        }
    }

    private double normalize(double value, double min, double max) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return 0.5;
        }
        double range = max - min;
        if (range < 1e-9) {
            return 0.5;
        }
        double normalized = (value - min) / range;
        return Math.max(0.0, Math.min(1.0, normalized));
    }

    private double computeUrgency(Task task, LocalDateTime now) {
        try {
            LocalDateTime deadline = DateTimeUtils.convertLongToLocalDateTime(task.getEndDate());
            Duration duration = Duration.between(now, deadline);
            double hours = Math.max(0.0, duration.toHours());
            return 1.0 / (1.0 + hours);
        } catch (Exception exception) {
            log.debug("Unable to compute urgency for task {}: {}", task.getId(), exception.getMessage());
            return 0.5;
        }
    }

    private double safePositive(Double value, double fallback) {
        if (value == null || value.isNaN() || value <= 0) {
            return fallback;
        }
        return value;
    }

    private String buildMoveKey(int first, int second) {
        return first < second ? first + "-" + second : second + "-" + first;
    }

    private record TabuSolution(List<Task> orderedTasks,
                                Map<String, TaskFeature> features,
                                double score) {
    }

    private record NeighborCandidate(List<Integer> order, double score, String moveKey) {
    }

    private record TaskFeature(Task task,
                               double duration,
                               double durationNorm,
                               double priorityNorm,
                               double enjoymentNorm,
                               double effortNorm,
                               double urgency,
                               double baseScore) {
    }
}
