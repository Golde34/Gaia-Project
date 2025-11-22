package auth.authentication_service.core.port.store;

import java.util.List;
import java.util.Optional;

import auth.authentication_service.core.domain.entities.UserLLMModel;

public interface UserLLMModelStore {
    
    List<UserLLMModel> getUserLLMModelsByUserId(Long userId);

    Optional<UserLLMModel> findById(Long id);

    void save(UserLLMModel userLLMModel);

    void deleteById(Long id);

    Optional<UserLLMModel> findActiveModelByUserId(Long userId, String model);

}
