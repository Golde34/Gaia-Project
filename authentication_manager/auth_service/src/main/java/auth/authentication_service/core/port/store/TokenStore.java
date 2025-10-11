package auth.authentication_service.core.port.store;

import auth.authentication_service.core.domain.entities.AuthToken;

public interface TokenStore {
    AuthToken findByUserId(Long id);

    AuthToken findByToken(String token);

    void save(AuthToken token);
}
