package auth.authentication_service.infrastructure.store.adapter;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.UserLLMModel;
import auth.authentication_service.core.port.store.UserLLMModelStore;
import auth.authentication_service.infrastructure.store.repositories.UserLLMModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserLLMModelAdapter implements UserLLMModelStore {

    private final UserLLMModelRepository userLLMModelRepository;

    @Override
    public List<UserLLMModel> getUserLLMModelsByUserId(Long userId) {
        return userLLMModelRepository.findByUserId(userId);
    }

    @Override
    public void saveUserLLMModel(UserLLMModel userLLMModel) {
        userLLMModelRepository.save(userLLMModel);
        log.info("UserLLMModel saved: {}", userLLMModel);
    }

    @Override
    public Optional<UserLLMModel> findById(Long id) {
        return userLLMModelRepository.findById(id);
    }

}
