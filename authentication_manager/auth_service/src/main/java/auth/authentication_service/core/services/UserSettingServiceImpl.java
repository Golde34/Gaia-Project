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

    @Override
    public ResponseEntity<?> updateMemoryModelSettings(long userId, String memoryModel) {
        try {
            userSettingStore.updateMemoryModelSetting(userId, memoryModel);
            return genericResponse.matchingResponseMessage(
                new GenericResponse<>("Update memory model setting successful", ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error updating memory model setting for user {}: {}", userId, e.getMessage());
            GenericResponse<String> response = new GenericResponse<>(
                    "Update memory model setting failed: %s".formatted(e.getMessage()),
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    public ResponseEntity<?> getUserMemoryModelSetting(Long userId) {
        UserSetting result = userSettingStore.getUserSetting(userId);
        String memoryModel = result.getMemoryModel();
        return genericResponse.matchingResponseMessage(new GenericResponse<>(memoryModel, ResponseEnum.msg200));
    }
}
