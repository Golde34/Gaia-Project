package auth.authentication_service.core.port.store;

import java.util.List;

import auth.authentication_service.core.domain.entities.User;

public interface UserCRUDStore {
    User getUserById(Long id);

    User findUserById(Long id);

    User findByEmail(String email);

    User findByUsername(String username);

    List<User> findAll();

    void delete(User user);

    void save(User user);
}
