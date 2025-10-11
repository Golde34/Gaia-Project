package auth.authentication_service.infrastructure.store.adapter;

import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.entities.UserSetting;
import auth.authentication_service.core.port.store.UserSettingStore;
import auth.authentication_service.infrastructure.store.repositories.UserRepository;
import auth.authentication_service.infrastructure.store.repositories.UserSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSettingAdapter implements UserSettingStore {

    private final UserSettingRepository userSettingRepository;
    private final UserRepository userRepository;

    @Override
    public void save(UserSetting userSetting) {
        log.info("Saving user setting: {}", userSetting);
        userSettingRepository.save(userSetting);
    }

    @Override
    public UserSetting getUserSetting(Long userId) {
        User user = userRepository.findUserById(userId);
        return userSettingRepository.findUserSettingByUser(user);
    }

    @Override
    public UserSetting updateUserSetting(UserSetting userSetting) {
        log.info("Saving user setting: {}", userSetting);   
        return userSettingRepository.save(userSetting);
    }
}
