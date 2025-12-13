package auth.authentication_service.core.services;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.entities.UserLLMModel;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.client.ChatHubServiceClient;
import auth.authentication_service.core.port.store.UserLLMModelStore;
import auth.authentication_service.core.services.interfaces.UserLLMModelService;
import auth.authentication_service.kernel.utils.BCryptPasswordEncoder;
import auth.authentication_service.kernel.utils.GenericResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLLMModelServiceImpl implements UserLLMModelService {

    private final UserLLMModelStore userLLMModelStore;
    private final ChatHubServiceClient chatHubServiceClient;

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
                    .map(existing -> updateExisting(existing, userLLMModel))
                    .orElseGet(() -> createNew(userLLMModel));
            userLLMModelStore.save(userModel);

            chatHubServiceClient.clearUserLLMModelCache(userLLMModel.getUserId());

            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Save user LLM model successfully", ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error saving user LLM model: {}", e.getMessage());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Save user LLM model failed: %s".formatted(e.getMessage()),
                            ResponseEnum.msg500));
        }
    }

    private UserLLMModel updateExisting(UserLLMModel existing, UserLLMModel request) {
        existing.setModelName(request.getModelName());
        existing.setActiveStatus(request.getActiveStatus());
        existing.setUserId(request.getUserId());
        existing.setUserModel(request.getUserModel());

        String newRawKey = request.getModelKey();
        if (newRawKey != null && !newRawKey.isBlank()
                && !newRawKey.equals(existing.getOriginKey())) {
            existing.setOriginKey(newRawKey);
            existing.setModelKey(new BCryptPasswordEncoder().encode(newRawKey));
        }
        return existing;
    }

    private UserLLMModel createNew(UserLLMModel request) {
        request.setOriginKey(request.getModelKey());
        request.setModelKey(new BCryptPasswordEncoder().encode(request.getModelKey()));
        return request;
    }

    @Override
    public ResponseEntity<?> delete(Long userModelId) {
        try {
            userLLMModelStore.deleteById(userModelId);
            chatHubServiceClient.clearUserLLMModelCache(userModelId);

            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Delete user LLM model successfully", ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error deleting user LLM model: {}", e.getMessage());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Delete user LLM model failed: %s".formatted(e.getMessage()),
                            ResponseEnum.msg500));
        }
    }

    @Override
    public Optional<UserLLMModel> getActiveLLMModelByUserId(Long userId, LLMModel activeModel) {
        return userLLMModelStore.findActiveModelByUserId(userId, activeModel.getModelName());
    }

    @Transactional
    public ResponseEntity<?> findOtherActiveModel(Long userId, Long modelId, LLMModel activeModel) {
        try {
            var errorModel = userLLMModelStore.findById(modelId);
            if (errorModel.isPresent()) {
                errorModel.get().setActiveStatus(false);
                userLLMModelStore.save(errorModel.get());
            }
            var otherActiveModel = this.getActiveLLMModelByUserId(userId, activeModel);
            if (otherActiveModel.isEmpty()) {
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>(null, ResponseEnum.msg200));
            }
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(otherActiveModel.get(), ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error fetching other active user LLM model: {}", e.getMessage());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Get other active user LLM model failed: %s".formatted(e.getMessage()),
                            ResponseEnum.msg500));
        }
    }
}
