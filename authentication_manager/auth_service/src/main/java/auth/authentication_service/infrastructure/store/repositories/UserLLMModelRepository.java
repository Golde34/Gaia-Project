package auth.authentication_service.infrastructure.store.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auth.authentication_service.core.domain.entities.UserLLMModel;

@Repository
public interface UserLLMModelRepository extends JpaRepository<UserLLMModel, Long> {

    List<UserLLMModel> findByUserId(Long userId);

    @Override
    void delete(UserLLMModel userLLMModel);

    Optional<UserLLMModel> findById(long id);

}
