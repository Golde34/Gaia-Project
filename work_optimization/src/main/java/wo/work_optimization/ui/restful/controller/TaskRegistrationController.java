package wo.work_optimization.ui.restful.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import wo.work_optimization.core.domain.dto.request.QueryTaskConfigRequestDTO;
import wo.work_optimization.core.domain.dto.request.TaskRegistrationRequestDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.core.domain.dto.response.base.ResponseFactory;
import wo.work_optimization.core.usecase.rest.TaskRegistrationUseCase;
import wo.work_optimization.ui.restful.router.TaskRegistrationRouter;

@RestController
@RequiredArgsConstructor
public class TaskRegistrationController implements TaskRegistrationRouter {

    public final ResponseFactory responseFactory;
    public final TaskRegistrationUseCase taskRegistrationUseCase;

    @Override
    public ResponseEntity<GeneralResponse<?>> registerTaskConfig(TaskRegistrationRequestDTO request) {
        GeneralResponse<?> response = taskRegistrationUseCase.registerTaskConfig(request);
        return responseFactory.success(response);
    }

    @Override
    public ResponseEntity<GeneralResponse<?>> isTaskConfigExisted(QueryTaskConfigRequestDTO request) {
        GeneralResponse<?> response = taskRegistrationUseCase.isTaskConfigExisted(request);
        return responseFactory.success(response);
    }
}