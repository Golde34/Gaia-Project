package auth.authentication_service.infrastructure.store.adapter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.infrastructure.store.repositories.UserRepository;

@Component
public class UserCRUDStoreAdapter implements UserCRUDStore {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findUserById(id);
    }

    public User findUserById(Long id) {
        return userRepository.findUserById(id);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void delete(User user) {
        userRepository.delete(user);
    }

    public void save(User user) {
        userRepository.save(user);
    }
}
