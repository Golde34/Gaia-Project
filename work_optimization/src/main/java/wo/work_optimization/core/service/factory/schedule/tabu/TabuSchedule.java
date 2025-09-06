package wo.work_optimization.core.service.factory.schedule.tabu;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import wo.work_optimization.core.domain.dto.request.GaiaAlgorithmDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.service.factory.schedule.connector.ScheduleService;

@Service
public class TabuSchedule extends ScheduleService<GaiaAlgorithmDTO, List<Task>> {
    @Override
    public String method() {
        return "TabuSearch";
    }

    @Override
    public List<Task> doSchedule(GaiaAlgorithmDTO request) {
        return null;
    }

    @Override
    public GaiaAlgorithmDTO createRequest(List<Task> tasks, TaskRegistration taskRegistration, int batchIndex) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createRequest'");
    }

    @Override
    public List<List<Task>> sortTaskToBatches(double totalTime, List<Task> tasks) {
        return Collections.singletonList(tasks);
    }

    @Override
    public String mapResponse(List<Task> response) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'mapResponse'");
    }
}
