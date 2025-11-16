package auth.authentication_service.core.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.request.UpdateUserModelRequest;
import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.store.LLMModelStore;
import auth.authentication_service.core.port.store.UserCRUDStore;
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
    private final UserCRUDStore userStore;

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

    @Override
    public ResponseEntity<?> updateModelSetting(UpdateUserModelRequest updateUserModelRequest) {
        try {
            User user = userStore.findUserById(updateUserModelRequest.getUserId()); 
            LLMModel model = llmModelStore.findModelById(updateUserModelRequest.getModelId());
            List<LLMModel> updateModels = new ArrayList<>(user.getLlmModels());
            updateModels.clear();
            updateModels.add(model);
            user.setLlmModels(updateModels);
            userStore.save(user);
            return genericResponse.matchingResponseMessage(
                new GenericResponse<>("Save user model successfully", ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error updating model settings: {}", e.getMessage());
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Update model settings failed: %s ".formatted(e.getMessage()),
                    Constants.ResponseMessage.UPDATE_LLM_MODELS,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    public ResponseEntity<?> getModelByUser(Long userId) {
        try {
            User user = userStore.findUserById(userId);
            LLMModel model = user.getLlmModels().stream().findFirst().orElse(null);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(model, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error fetching model by user: {}", e.getMessage());
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Get model by user failed: %s ".formatted(e.getMessage()),
                    Constants.ResponseMessage.GET_LLM_MODEL_BY_USER,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }
}
