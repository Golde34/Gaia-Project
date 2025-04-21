package auth.authentication_service.infrastructure.store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auth.authentication_service.core.domain.entities.LLMModel;

@Repository
public interface LLMModelRepository extends JpaRepository<LLMModel, Long> {
    
    LLMModel findLLMModelByModelNameAndActiveStatus(String modelName, boolean activeStatus);
    LLMModel findLLMModelByModelIdAndActiveStatus(Long modelId, boolean activeStatus);
    
    @Override
    void delete(LLMModel entity);
}