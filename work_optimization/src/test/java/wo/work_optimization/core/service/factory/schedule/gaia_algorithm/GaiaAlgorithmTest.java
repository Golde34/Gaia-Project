package wo.work_optimization.core.service.factory.schedule.gaia_algorithm;

import org.junit.jupiter.api.Test;

import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.entity.Task;

import java.util.ArrayList;
import java.util.List;

@Slf4j
class GaiaAlgorithmTest {

    @Test
    void printsTunedAlphaBetaGamma() {
        long now = System.currentTimeMillis();

        List<Task> tasks = new ArrayList<>();
        tasks.add(Task.builder()
                .title("Task A")
                .startDate(now - 24L * 3600_000) // 24 hours ago
                .endDate(now + 24L * 3600_000)
                .enjoyability(8)
                .effort(3)
                .build());
        tasks.add(Task.builder()
                .title("Task B")
                .startDate(now - 2L * 3600_000) // 2 hours ago
                .endDate(now + 12L * 3600_000)
                .enjoyability(5)
                .effort(6)
                .build());
        tasks.add(Task.builder()
                .title("Task C")
                .startDate(now - 6L * 3600_000) // 6 hours ago
                .endDate(now + 48L * 3600_000)
                .enjoyability(2)
                .effort(9)
                .build());
        tasks.add(Task.builder()
                .title("Task D")
                .startDate(now - 1L * 3600_000) // 1 hour ago
                .endDate(now + 6L * 3600_000)
                .enjoyability(9)
                .effort(4)
                .build());
        tasks.add(Task.builder()
                .title("Task E")
                .startDate(now - 12L * 3600_000) // 12 hours ago
                .endDate(now + 72L * 3600_000)
                .enjoyability(4)
                .effort(5)
                .build());

        // We only need sort to trigger tuning and printing of alpha, beta, gamma.
        GaiaAlgorithm gaia = new GaiaAlgorithm(null);
        List<List<Task>> taskBatch = gaia.sortTaskToBatches(13, tasks);
        log.info("Task batch things: {}", taskBatch);

        // The tuned parameters are printed by GaiaAlgorithm.sortTaskByPriority via System.out.
    }
}

