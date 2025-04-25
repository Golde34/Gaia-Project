package auth.authentication_service.core.port.store;

import java.util.List;

import auth.authentication_service.core.domain.entities.LLMModel;

public interface LLMModelStore {

    void save(LLMModel userModelSetting);

    LLMModel fineModelByName(String modelName);

    LLMModel findModelById(Long id);

    List<LLMModel> findAll();

    void deleteModelById(Long id);
}
