package wo.work_optimization.core.service.factory.schedule.connector;

import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.exception.BusinessException;
import wo.work_optimization.core.service.integration.database.TaskRegistrationService;
import wo.work_optimization.kernel.utils.JsonUtils;

@Slf4j
@Service
public abstract class ScheduleService<R, P> implements ScheduleConnector {

    @Autowired
    private TaskRegistrationService taskRegistrationService;

    @Override
    public Map<Integer, String> schedule(List<Task> tasks, Long userId) {
        try {
            Map<Integer, String> scheduleResult = new HashMap<>();

            TaskRegistration taskRegistration = taskRegistrationService.getTaskRegistrationByUserId(userId);
            List<List<Task>> taskBatches = sortTaskToBatches(taskRegistration.getMaxWorkTime(), tasks);

            for (int i = 0; i < taskBatches.size(); i++) {
                List<Task> taskBatch = taskBatches.get(i);

                R request = createRequest(taskBatch, taskRegistration, i);
                P resp = doSchedule(request);
                String result = mapResponse(resp);

                scheduleResult.put(i, result);
            }

            return scheduleResult;
        } catch (BusinessException e) {
            log.error("Error while scheduling", e);
            return Collections.emptyMap();
        } catch (Exception e) {
            log.error("Error while scheduling, system error:", e);
            return Collections.emptyMap();
        }
    }

    public abstract List<List<Task>> sortTaskToBatches(double totalTime, List<Task> tasks);
    public abstract P doSchedule(R request);
    public abstract R createRequest(List<Task> tasks, TaskRegistration taskRegistration, int batchIndex);

    public abstract String mapResponse(P response);

    public String requestToString(R request) {
        return JsonUtils.toJson(request);
    }

    public String responseToString(P response) {
        return JsonUtils.toJson(response);
    }
}
