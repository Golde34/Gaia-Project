package wo.work_optimization.infrastructure.store.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import wo.work_optimization.core.domain.entity.TaskRegistration;

import java.util.Optional;

@Repository
public interface TaskRegistrationRepository extends JpaRepository<TaskRegistration, String> {
    Optional<TaskRegistration> findByUserIdAndStatus(Long userId, int status);

    @Query("select tr from TaskRegistration tr join ParentTask pt on pt.userId = tr.userId join Task t on t.parentTask.id = pt.id where t.id = :taskId")
    Optional<TaskRegistration> findByTaskId(@Param("taskId") String taskId);

    @Transactional
    @Modifying
    @Query("update TaskRegistration tr set tr.constant1 = :c1, tr.constant2 = :c2, tr.constant3 = :c3 where tr.userId = :userId")
    int updateUserConstant(@Param("userId") long userId, @Param("c1") double c1, @Param("c2") double c2, @Param("c3") double c3);
}
