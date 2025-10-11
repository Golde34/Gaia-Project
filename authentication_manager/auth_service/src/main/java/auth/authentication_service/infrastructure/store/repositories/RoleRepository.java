package auth.authentication_service.infrastructure.store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import auth.authentication_service.core.domain.entities.Role;

import java.util.Collection;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    @Query("select r from Role r order by r.grantedRank desc")
    Collection<Role> findAllOrderByGrantedRank();
    Role findByName(String name);
    Role findRoleById(Long Id);

    @Override
    void delete(Role role);
}