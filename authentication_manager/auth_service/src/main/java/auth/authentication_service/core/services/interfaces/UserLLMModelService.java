package auth.authentication_service.core.services.interfaces;

import java.util.Optional;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.entities.UserLLMModel;

public interface UserLLMModelService {
    
    ResponseEntity<?> getUserLLMModelsByUserId(Long userId);

    ResponseEntity<?> upsert(UserLLMModel userLLMModel);

    ResponseEntity<?> delete(Long userModelId);

    Optional<UserLLMModel> getActiveLLMModelByUserId(Long userId, LLMModel activeModel);
}
