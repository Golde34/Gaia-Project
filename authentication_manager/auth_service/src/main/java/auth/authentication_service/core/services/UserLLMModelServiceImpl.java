package auth.authentication_service.core.services;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.entities.UserLLMModel;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.store.UserLLMModelStore;
import auth.authentication_service.core.services.interfaces.UserLLMModelService;
import auth.authentication_service.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLLMModelServiceImpl implements UserLLMModelService {

    private final UserLLMModelStore userLLMModelStore;
    private final GenericResponse<?> genericResponse;

    @Override
    public ResponseEntity<?> getUserLLMModelsByUserId(Long userId) {
        try {
            var userLLMModels = userLLMModelStore.getUserLLMModelsByUserId(userId);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(userLLMModels, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error fetching user LLM models: {}", e.getMessage());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Get user LLM models failed: %s".formatted(e.getMessage()),
                            ResponseEnum.msg500));
        }
    }

    @Override
    public ResponseEntity<?> upsert(UserLLMModel userLLMModel) {
        try {
            UserLLMModel userModel = Optional.ofNullable(userLLMModel.getId())
                    .flatMap(userLLMModelStore::findById)
                    .map(e -> UserLLMModel.builder()
                            .modelName(userLLMModel.getModelName())
                            .modelKey(userLLMModel.getModelKey())
                            .activeStatus(userLLMModel.getActiveStatus())
                            .userId(userLLMModel.getUserId())
                            .userModel(userLLMModel.getUserModel())
                            .build())
                    .orElse(userLLMModel);
            userLLMModelStore.saveUserLLMModel(userModel);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Save user LLM model successfully", ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error saving user LLM model: {}", e.getMessage());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Save user LLM model failed: %s".formatted(e.getMessage()),
                            ResponseEnum.msg500));
        }
    }
}
