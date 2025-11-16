package wo.work_optimization.ui.restful.router;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import wo.work_optimization.core.domain.dto.request.QueryTaskConfigRequestDTO;
import wo.work_optimization.core.domain.dto.request.TaskRegistrationRequestDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;

@RequestMapping("/${spring.application.url-name}/register-task-config")
public interface TaskRegistrationRouter {
    
    @PostMapping("")
    ResponseEntity<GeneralResponse<?>> registerTaskConfig(@RequestBody TaskRegistrationRequestDTO request);

    @GetMapping("")
    ResponseEntity<GeneralResponse<?>> isTaskConfigExisted(@RequestBody QueryTaskConfigRequestDTO request);
}
