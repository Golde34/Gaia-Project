package wo.work_optimization.infrastructure.store.adapter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.entity.ParentTask;
import wo.work_optimization.core.port.store.ParentTaskStore;
import wo.work_optimization.infrastructure.store.repository.ParentTaskRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentTaskAdapter implements ParentTaskStore {
    
    private final ParentTaskRepository parentTaskRepository;

    @Override
    public ParentTask createParentTask(ParentTask parentTask) {
        return this.parentTaskRepository.save(parentTask);
    }

    @Override
    public Optional<ParentTask> findByGroupTaskId(String groupTaskId) {
        return this.parentTaskRepository.findByGroupTaskId(groupTaskId);
    }

    @Override
    public Optional<List<ParentTask>> findByProjectId(String projectId) {
        return this.parentTaskRepository.findByProjectId(projectId);
    }
    
    @Override
    public Optional<ParentTask> findByScheduleId(String scheduleId) {
        return this.parentTaskRepository.findBySchedulePlanId(scheduleId);
    }

    @Override
    public List<ParentTask> findAll() {
        return this.parentTaskRepository.findAll();
    }

    @Override
    public List<ParentTask> findByUserId(long userId) {
        return this.parentTaskRepository.findByUserId(userId);
    }
}
