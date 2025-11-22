package auth.authentication_service.core.services.interfaces;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.entities.UserLLMModel;

public interface UserLLMModelService {
    
    ResponseEntity<?> getUserLLMModelsByUserId(Long userId);

    ResponseEntity<?> upsert(UserLLMModel userLLMModel);

    ResponseEntity<?> delete(Long userModelId);
}
