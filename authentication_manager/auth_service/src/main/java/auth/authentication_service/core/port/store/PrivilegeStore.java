package auth.authentication_service.core.port.store;

import java.util.List;

import auth.authentication_service.core.domain.entities.Privilege;

public interface PrivilegeStore {
    Privilege findByName(String name);

    Privilege findPrivilegeById(Long Id);

    List<Privilege> findAll();

    void delete(Privilege privilege);

    void save(Privilege privilege);
}
