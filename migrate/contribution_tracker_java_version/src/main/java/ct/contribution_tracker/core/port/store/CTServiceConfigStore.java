package ct.contribution_tracker.core.port.store;

import java.util.List;

import ct.contribution_tracker.core.domain.entity.CTServiceConfiguration;

public interface CTServiceConfigStore {
    List<CTServiceConfiguration> getConfigByParamType(String paramType);
    List<CTServiceConfiguration> getActiveConfigByParamType(String paramType);
}
