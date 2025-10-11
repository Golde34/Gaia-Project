package auth.authentication_service.infrastructure.store.adapter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.port.store.PrivilegeStore;
import auth.authentication_service.infrastructure.store.repositories.PrivilegeRepository;

@Component
public class PrivilegeStoreAdapter implements PrivilegeStore {
    
    @Autowired
    private PrivilegeRepository privilegeRepository;
    
    public Privilege findByName(String name) {
        return privilegeRepository.findByName(name);
    }

    public Privilege findPrivilegeById(Long Id) {
        return privilegeRepository.findPrivilegeById(Id);
    }

    public List<Privilege> findAll() {
        return privilegeRepository.findAll();
    }

    public void delete(Privilege privilege) {
        privilegeRepository.delete(privilege);
    }

    public void save(Privilege privilege) {
        privilegeRepository.save(privilege);
    }
}
