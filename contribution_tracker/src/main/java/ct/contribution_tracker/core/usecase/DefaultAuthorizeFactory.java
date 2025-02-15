package ct.contribution_tracker.core.usecase;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.exception.BusinessException;
import ct.contribution_tracker.core.usecase.authorize.connector.AuthorizeConnector;
import ct.contribution_tracker.core.usecase.authorize.connector.AuthorizeFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DefaultAuthorizeFactory implements AuthorizeFactory {

    public static final Map<String, AuthorizeConnector> authorizeServiceMap = new ConcurrentHashMap<>();
    private final List<AuthorizeConnector> authorizeConnectors;

    @PostConstruct
    private void init() {
        authorizeServiceMap.putAll(authorizeConnectors.stream()
                .collect(Collectors.toMap(AuthorizeConnector::platform, Function.identity())));
    }
    
    @Override
    public AuthorizeConnector get(String Authorize) {
        AuthorizeConnector AuthorizeConnector = authorizeServiceMap.get(Authorize);
        if (Objects.isNull(AuthorizeConnector)) {
            throw new BusinessException("Authorize not supported: " + Authorize);
        }
        return AuthorizeConnector;
    }
}
