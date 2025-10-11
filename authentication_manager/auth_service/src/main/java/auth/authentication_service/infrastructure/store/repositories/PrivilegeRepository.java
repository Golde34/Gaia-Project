package auth.authentication_service.infrastructure.store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auth.authentication_service.core.domain.entities.Privilege;

@Repository
public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {
    
    Privilege findByName(String name);

    Privilege findPrivilegeById(Long Id);

    @Override
    void delete(Privilege privilege);
}
