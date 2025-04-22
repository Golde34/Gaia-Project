package auth.authentication_service.core.services.interfaces;

import org.springframework.http.ResponseEntity;

public interface UserModelSettingService {
    ResponseEntity<?> getListModels(); 
}
