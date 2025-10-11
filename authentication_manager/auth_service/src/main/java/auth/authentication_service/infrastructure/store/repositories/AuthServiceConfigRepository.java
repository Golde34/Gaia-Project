package auth.authentication_service.infrastructure.store.repositories;

import auth.authentication_service.core.domain.entities.AuthServiceConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthServiceConfigRepository extends JpaRepository<AuthServiceConfiguration, Long> {
    @Query("select c from AuthServiceConfiguration c where c.paramName = :paramName")
    Optional<AuthServiceConfiguration> findParam(String paramName);

}
