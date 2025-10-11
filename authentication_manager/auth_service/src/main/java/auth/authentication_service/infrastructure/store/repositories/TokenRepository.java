package auth.authentication_service.infrastructure.store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import auth.authentication_service.core.domain.entities.AuthToken;

public interface TokenRepository extends JpaRepository<AuthToken, Long>{
    
    AuthToken findByUserId(Long id);
    AuthToken findByToken(String token);
}
