package auth.authentication_service.core.services.interfaces;

import auth.authentication_service.core.domain.dto.request.UpdateUserSettingRequest;

import org.springframework.http.ResponseEntity;

public interface UserSettingService {
    ResponseEntity<?> updateUserSettings(UpdateUserSettingRequest updateUserSettingRequest);
    ResponseEntity<?> getUserSettings(Long userId); 
    ResponseEntity<?> updateMemoryModelSettings(long userId, String memoryModel);
    ResponseEntity<?> getUserMemoryModelSetting(Long userId);
}
