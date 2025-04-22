package auth.authentication_service.core.services.interfaces;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.dto.request.UpdateUserModelRequest;

public interface UserModelSettingService {
    ResponseEntity<?> getListModels(); 
    ResponseEntity<?> updateModelSetting(UpdateUserModelRequest updateUserModelRequest);
}
