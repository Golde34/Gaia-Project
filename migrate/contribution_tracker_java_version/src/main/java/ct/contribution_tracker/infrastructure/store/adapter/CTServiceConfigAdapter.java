package ct.contribution_tracker.infrastructure.store.adapter;

import java.util.List;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.entity.CTServiceConfiguration;
import ct.contribution_tracker.core.port.store.CTServiceConfigStore;
import ct.contribution_tracker.infrastructure.store.repository.CTServiceConfigRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CTServiceConfigAdapter implements CTServiceConfigStore {
    
    private final CTServiceConfigRepo ctServiceConfigRepo;

    @Override
    public List<CTServiceConfiguration> getConfigByParamType(String paramType) {
        return ctServiceConfigRepo.findByParamType(paramType);
    }

    @Override
    public List<CTServiceConfiguration> getActiveConfigByParamType(String paramType) {
        return ctServiceConfigRepo.findByParamTypeAndStatus(paramType, true);
    }
}
