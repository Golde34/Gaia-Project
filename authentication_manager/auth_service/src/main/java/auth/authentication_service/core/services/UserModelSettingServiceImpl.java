package auth.authentication_service.core.services;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.store.LLMModelStore;
import auth.authentication_service.core.services.interfaces.UserModelSettingService;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserModelSettingServiceImpl implements UserModelSettingService {

    private final LLMModelStore llmModelStore;

    private final ResponseUtils responseUtils;
    private final GenericResponse<?> genericResponse;

    @Override
    public ResponseEntity<?> getListModels() {
        try {
            List<LLMModel> models = llmModelStore.findAll();
            return genericResponse.matchingResponseMessage(new GenericResponse<>(models, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error fetching models: {}", e.getMessage());
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Get all users failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.GET_ALL_LLM_MODELS,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }
}
