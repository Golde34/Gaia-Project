package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.dto.request.UpdateUserSettingRequest;
import auth.authentication_service.core.domain.entities.UserSetting;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.mapper.UserSettingMapper;
import auth.authentication_service.core.port.store.UserSettingStore;
import auth.authentication_service.core.services.interfaces.UserSettingService;
import auth.authentication_service.kernel.utils.GenericResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserSettingServiceImpl implements UserSettingService {

    private final UserSettingStore userSettingStore;
    private final UserSettingMapper userSettingMapper;
    private final GenericResponse<?> genericResponse;

    @Override
    // @CacheEvict(value = "userResponseById", key = "#userId", cacheManager = "cacheManager") ??? TODO: Replace by Redis
    public ResponseEntity<?> updateUserSettings(UpdateUserSettingRequest updateUserSettingRequest) {
        UserSetting userSetting = userSettingStore.getUserSetting(updateUserSettingRequest.getUserId());
        userSetting = userSettingMapper.updateUserSettingMapper(updateUserSettingRequest, userSetting);
        
        UserSetting result = userSettingStore.updateUserSetting(userSetting);
        return genericResponse.matchingResponseMessage(new GenericResponse<>(result, ResponseEnum.msg200));
    }

    @Override
    public ResponseEntity<?> getUserSettings(Long userId) {
        UserSetting result = userSettingStore.getUserSetting(userId);
        return genericResponse.matchingResponseMessage(new GenericResponse<>(result, ResponseEnum.msg200));
    }
}
