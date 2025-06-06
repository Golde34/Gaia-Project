package wo.work_optimization.infrastructure.client.adapter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import wo.work_optimization.core.domain.dto.request.GetGroupTaskProjectRequestDTO;
import wo.work_optimization.core.domain.dto.response.GroupTaskAndProjectResponseDTO;
import wo.work_optimization.core.domain.dto.response.OriginalTaskResponseDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.core.port.client.TaskManagerServiceClient;
import wo.work_optimization.infrastructure.client.ClientTemplate;

import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskManagerServiceAdapter implements TaskManagerServiceClient {

    @Value("${app.service.task-manager-service.api.get-grouptask-project}")
    private String getGroupTaskAPI;

    @Value("${app.service.task-manager-service.api.get-original-task}")
    private String getOriginalTaskAPI;

    private final ClientTemplate clientTemplate;

    public GroupTaskAndProjectResponseDTO getGroupTaskAndProject(String taskId, GetGroupTaskProjectRequestDTO request) {
        try {
            String uri = String.format(getGroupTaskAPI, taskId);
            log.info("Calling api to taskmanager service: {}", uri);
            ResponseEntity<GeneralResponse<GroupTaskAndProjectResponseDTO>> response = clientTemplate.post(
                    uri, null, request,
                    new ParameterizedTypeReference<GeneralResponse<GroupTaskAndProjectResponseDTO>>() {
                    });
            log.info("Response from taskmanager service: {}", response);
            return Objects.requireNonNull(response.getBody()).getData();
        } catch (Exception e) {
            log.error("Error when call api to get group task and project in TMservice: {}", e.getMessage());
        }
        return null;
    }

    public OriginalTaskResponseDTO getOriginalTask(String taskId) {
        try {
            String uri = String.format(getOriginalTaskAPI, taskId);
            log.info("Calling api to taskmanager service: {}", uri);
            ResponseEntity<GeneralResponse<OriginalTaskResponseDTO>> response = clientTemplate.get(
                    uri, null,
                    new ParameterizedTypeReference<GeneralResponse<OriginalTaskResponseDTO>>() {
                    });
            log.info("Response from taskmanager service: {}", response);
            return Objects.requireNonNull(response.getBody()).getData();
        } catch (Exception e) {
            log.error("Error when call api to get original task in TM service: {}", e.getMessage());
            return null;
        }
    }
}
