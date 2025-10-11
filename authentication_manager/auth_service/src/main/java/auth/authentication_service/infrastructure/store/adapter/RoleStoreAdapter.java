package auth.authentication_service.infrastructure.store.adapter;

import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.port.store.RoleStore;
import auth.authentication_service.infrastructure.store.repositories.RoleRepository;

@Component
public class RoleStoreAdapter implements RoleStore {

    @Autowired
    private RoleRepository roleRepository;

    public Collection<Role> findAllOrderByGrantedRank() {
        return roleRepository.findAllOrderByGrantedRank();
    }

    public Role findByName(String name) {
        return roleRepository.findByName(name);
    }

    public Role findRoleById(Long Id) {
        return roleRepository.findRoleById(Id);
    }

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public void delete(Role role) {
        roleRepository.delete(role);
    }

    public void save(Role role) {
        roleRepository.save(role);
    }
}
