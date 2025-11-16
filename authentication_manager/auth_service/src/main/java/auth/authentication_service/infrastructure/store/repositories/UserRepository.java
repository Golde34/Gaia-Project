package auth.authentication_service.infrastructure.store.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auth.authentication_service.core.domain.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findUserById(Long id);

    User findByEmail(String email);

    User findByUsername(String username);

    @Override
    void delete(User user);

}