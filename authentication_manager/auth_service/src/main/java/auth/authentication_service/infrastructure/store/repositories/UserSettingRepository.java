package auth.authentication_service.infrastructure.store.repositories;

import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.entities.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
    UserSetting findUserSettingByUser(User userId);
}
