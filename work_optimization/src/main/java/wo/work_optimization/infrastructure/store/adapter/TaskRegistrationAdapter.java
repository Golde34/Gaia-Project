package wo.work_optimization.infrastructure.store.adapter;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.port.store.TaskRegistrationStore;
import wo.work_optimization.infrastructure.store.repository.TaskRegistrationRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskRegistrationAdapter implements TaskRegistrationStore {
    
    private final TaskRegistrationRepository taskRegistrationRepository;

    @Override
    @Transactional
    public void userRegisterTaskOperation(TaskRegistration taskRegistration) {
        taskRegistrationRepository.save(taskRegistration);
        log.info("Task registered: {}", taskRegistration);
    }

    @Override
    @Transactional
    public Optional<TaskRegistration> getTaskRegistrationByUserId(Long id) {
        return taskRegistrationRepository.findByUserIdAndStatus(id, Constants.ActiveStatus.ACTIVE);
    }

    @Override
    @Transactional
    public Optional<TaskRegistration> getTaskRegistrationByTaskId(String taskId) {
        return taskRegistrationRepository.findByTaskId(taskId);
    }

    @Override
    public int updateUserConstant(long userId, double c1, double c2, double c3) {
        return taskRegistrationRepository.updateUserConstant(userId, c1, c2, c3);
    }
}
