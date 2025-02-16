package ct.contribution_tracker.infrastructure.store.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import ct.contribution_tracker.core.domain.entity.CTServiceConfiguration;

@Repository
public interface CTServiceConfigRepo {
    List<CTServiceConfiguration> findByParamTypeAndStatus(String paramType, Boolean status); 
    List<CTServiceConfiguration> findByParamType(String paramType);
}
