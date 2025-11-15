package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.entities.AuthServiceConfiguration;
import auth.authentication_service.core.exceptions.BusinessException;
import auth.authentication_service.infrastructure.store.repositories.AuthServiceConfigRepository;
import auth.authentication_service.kernel.utils.StringUtils;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlobalConfigService {

    private final AuthServiceConfigRepository globalConfigRepository;

    private LoadingCache<String, String> globalConfigCache;

    @PostConstruct
    public void init() {
        long reloadMin = Long.parseLong(findParam(Constants.AuthConfiguration.SYSTEM_CACHE_RELOAD_MINUTE));
        globalConfigCache =
                CacheBuilder.newBuilder()
                        .maximumSize(100000)
                        .refreshAfterWrite(reloadMin, TimeUnit.MINUTES)
                        .build(
                                new CacheLoader<String, String>() {
                                    public String load(String key) { // no checked exception
                                        return findParam(key);
                                    }
                                });
    }

    private String getGlobalParamCache(String paramName) {
        String res;
        try {
            res = globalConfigCache.get(paramName);

        } catch (Exception e) {
            log.error("Exception getting global cache: ", e);
            res = findParam(paramName);
        }
        if (StringUtils.isBlank(res)) {
            return StringUtils.EMPTY;
        }
        return res;
    }

    private String findParam(String paramName) {
        AuthServiceConfiguration globalConfig =
                globalConfigRepository
                        .findParam(paramName)
                        .orElseGet(
                                () -> {
                                    log.warn("Cannot find param name {}", paramName);
                                    return null;
                                });
        return globalConfig == null ? StringUtils.EMPTY : globalConfig.getParamValue();
    }

    public String getGlobalParamAsString(String paramName) {
        return getGlobalParamCache(paramName);
    }

    public Integer getGlobalParamAsInteger(String paramName) {
        try {
            return Integer.parseInt(getGlobalParamCache(paramName));
        } catch (Exception e) {
            return 0;
        }
    }

    public Long getGlobalParamAsLong(String paramName) {
        return Long.parseLong(getGlobalParamCache(paramName));
    }

    public Long getGlobalParamAsLong(String paramName, Long defaultValue) {
        String value = getGlobalParamCache(paramName);
        if (StringUtils.EMPTY.equals(value)) {
            return defaultValue;
        }
        return Long.parseLong(value);
    }

    public Boolean getGlobalParamAsBoolean(String paramName) {
        return Objects.equals(getGlobalParamCache(paramName), "1");
    }

    public Double getGlobalParamAsDouble(String paramName) {
        return Double.parseDouble(getGlobalParamCache(paramName));
    }

    public List<String> getGlobalParamAsListString(String paramName) {
        return Arrays.asList(StringUtils.split(getGlobalParamCache(paramName), ";"));
    }

    public List<Integer> getGlobalParamAsListInteger(String paramName) {
        return Arrays.stream(StringUtils.split(getGlobalParamCache(paramName), ";"))
                .map(Integer::valueOf)
                .collect(Collectors.toList());
    }

    public void setAuthServiceConfig(String paramName, String paramValue) {
        try {
            Optional<AuthServiceConfiguration> authServiceConfiguration = globalConfigRepository.findParam(paramName);
            if (authServiceConfiguration.isPresent()) {
                authServiceConfiguration.get().setParamValue(paramValue);
                globalConfigRepository.save(authServiceConfiguration.get());
            }
        } catch (BusinessException e) {
            log.error(String.format("Cannot set auth service config: %s", paramName), e);
        }
    }
}

