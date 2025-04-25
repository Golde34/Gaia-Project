package auth.authentication_service.infrastructure.store.adapter;

import java.util.List;

import auth.authentication_service.core.domain.constant.Constants;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.port.store.LLMModelStore;
import auth.authentication_service.infrastructure.store.repositories.LLMModelRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LLMModelAdapter implements LLMModelStore {

    private final LLMModelRepository llmModelRepository; 

    @Override
    public void save(LLMModel model) {
        llmModelRepository.save(model);
    }

    @Override
    public LLMModel fineModelByName(String modelName) {
        return llmModelRepository.findLLMModelByModelNameAndActiveStatus(modelName, Constants.ActiveStatus.ACTIVE_BOOL);
    }

    @Override
    public LLMModel findModelById(Long id) {
        return llmModelRepository.findLLMModelByModelIdAndActiveStatus(id, Constants.ActiveStatus.ACTIVE_BOOL);
    }

    @Override
    public List<LLMModel> findAll() {
        return llmModelRepository.findAllByActiveStatus(Constants.ActiveStatus.ACTIVE_BOOL);
    }

    @Override
    public void deleteModelById(Long id) {
        LLMModel model = llmModelRepository.findLLMModelByModelIdAndActiveStatus(id, Constants.ActiveStatus.ACTIVE_BOOL);
        llmModelRepository.delete(model);
    }

}
