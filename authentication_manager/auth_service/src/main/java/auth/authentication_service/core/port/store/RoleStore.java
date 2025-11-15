package auth.authentication_service.core.port.store;

import java.util.Collection;
import java.util.List;

import auth.authentication_service.core.domain.entities.Role;

public interface RoleStore {
    Collection<Role> findAllOrderByGrantedRank();

    Role findByName(String name);

    Role findRoleById(Long Id);

    List<Role> findAll();

    void delete(Role role);

    void save(Role role);
}
