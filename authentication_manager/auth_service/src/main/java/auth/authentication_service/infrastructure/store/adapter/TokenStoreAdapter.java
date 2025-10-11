package auth.authentication_service.infrastructure.store.adapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.AuthToken;
import auth.authentication_service.core.port.store.TokenStore;
import auth.authentication_service.infrastructure.store.repositories.TokenRepository;

@Component
public class TokenStoreAdapter implements TokenStore{ 

    @Autowired
    private TokenRepository tokenRepository;

    public AuthToken findByUserId(Long id) {
        return tokenRepository.findByUserId(id);
    }

    public AuthToken findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    public void save(AuthToken token) {
        tokenRepository.save(token);
    }
}
