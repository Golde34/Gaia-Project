package wo.work_optimization.core.service.integration.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.dto.request.QueryTaskConfigRequestDTO;
import wo.work_optimization.core.domain.dto.request.TaskRegistrationRequestDTO;
import wo.work_optimization.core.domain.dto.response.RegisteredTaskConfigStatus;
import wo.work_optimization.core.domain.dto.response.TaskResponseDTO;
import wo.work_optimization.core.domain.dto.response.UserResponseDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.core.domain.entity.TaskRegistration;
import wo.work_optimization.core.domain.enums.ResponseMessage;
import wo.work_optimization.core.port.client.AuthServiceClient;
import wo.work_optimization.core.port.store.TaskRegistrationStore;
import wo.work_optimization.core.service.integration.TaskRegistrationService;
import wo.work_optimization.kernel.utils.DataUtils;
import wo.work_optimization.kernel.utils.GenericResponse;

import java.util.Optional;

@Slf4j
@Service
public class TaskRegistrationServiceImpl implements TaskRegistrationService {

    @Autowired
    private AuthServiceClient authServiceClient;
    @Autowired
    private TaskRegistrationStore taskRegistrationStore;

    @Autowired
    private GenericResponse<TaskResponseDTO> genericResponse;

    public GeneralResponse<?> registerWorkOptimization(TaskRegistrationRequestDTO request) {
        boolean isUserRegisteredTask = checkExistedTaskRegistration(request.getUserId());
        if (isUserRegisteredTask) {
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ErrorMessage.EXISTED_USER, ResponseMessage.msg400));
        }

        TaskRegistration taskRegistration = createRequest(request);
        taskRegistrationStore.userRegisterTaskOperation(taskRegistration);
        return genericResponse.matchingResponseMessage(new GenericResponse<>(taskRegistration, ResponseMessage.msg200));
    }

    public Pair<String, Boolean> checkExistedUser(Long userId) {
        // check existed user in auth service
        UserResponseDTO response = authServiceClient.getExistedUser(userId);
        log.info("Check existed user in auth service: [{}] ", response.toString());
        if (DataUtils.isNullOrEmpty(response.getId())) {
            log.error("There is no information of user: {} in auth service", userId);
            return Pair.of(Constants.ErrorMessage.USER_NOT_FOUND, false);
        }

        return Pair.of(Constants.ErrorMessage.SUCCESS, true);
    }

    private boolean checkExistedTaskRegistration(Long userId) {
        log.info("Check existed user in task registration: [{}] ", userId);
        Optional<TaskRegistration> taskRegistration = taskRegistrationStore.getTaskRegistrationByUserId(userId);
        if (taskRegistration.isPresent()) {
            log.info("User has already registered task scheduling: [{}] ", userId);
            return true;
        }

        return false;
    }

    private TaskRegistration createRequest(TaskRegistrationRequestDTO request) {
        return TaskRegistration.builder()
                .userId(request.getUserId())
                .sleepDuration(request.getSleepDuration())
                .startSleepTime(request.getStartSleepTime())
                .endSleepTime(request.getEndSleepTime())
                .relaxTime(request.getRelaxTime())
                .travelTime(request.getTravelTime())
                .eatTime(request.getEatTime())
                .workTime(request.getWorkTime())
                .status(Constants.Status.ACTIVE)
                .build();
    }

    @Override
    public GeneralResponse<?> userRegisterTaskInformation(QueryTaskConfigRequestDTO request) {
        boolean isUserRegisteredTask = checkExistedTaskRegistration(request.getUserId());
        RegisteredTaskConfigStatus taskRegistration = RegisteredTaskConfigStatus.builder()
                .isTaskConfigExist(isUserRegisteredTask).build();
        return genericResponse
                .matchingResponseMessage(new GenericResponse<>(taskRegistration, ResponseMessage.msg200));
    }
}