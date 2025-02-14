package wo.work_optimization.infrastructure.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wo.work_optimization.core.domain.entity.Task;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    
    Task findByOriginalId(String originalId);
    void deleteById(String id);
    void delete(Task entity);
    Task findByTitle(String title);
    Optional<Task> findById(String id);
    Task findByStatus(String status);
    Task findByPriority(int priority);
    Optional<Task> findByIdAndScheduleTaskId(String id, String scheduleTaskId);
    Optional<Task> findByOriginalIdAndScheduleTaskIdAndId(String originalId, String scheduleTaskId, String id);
    List<Task> findByParentTaskId(Long parentTaskId);
    List<Task> findByParentTaskIdAndStartDate(Long parentTaskId, Long startDate);
    List<Task> findByParentTaskIdAndEndDate(Long parentTaskId, Long endDate);
}
