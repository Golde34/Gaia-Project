package auth.authentication_service.infrastructure.store.repositories;

import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.entities.UserSetting;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
    UserSetting findUserSettingByUser(User userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserSetting us SET us.memoryModel = :memoryModel WHERE us.user.id = :userId")
    void updateMemoryModelSetting(Long userId, String memoryModel);
}
