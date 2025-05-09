package auth.authentication_service.core.services.interfaces;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.dto.TokenDto;
import auth.authentication_service.core.domain.dto.UserPermissionDto;
import auth.authentication_service.core.domain.dto.request.ServiceJwtRequest;
import auth.authentication_service.core.domain.dto.request.ValidateJwtRequest;

public interface AuthService{
    ResponseEntity<?> authenticated(String username, String password) throws Exception;
    ResponseEntity<?> gaiaAutoSignin(String username, String password) throws Exception;
    ResponseEntity<?> checkToken(TokenDto token) throws Exception;
    ResponseEntity<?> refreshToken(String token) throws Exception;
    ResponseEntity<?> checkPermission(UserPermissionDto permission) throws Exception;
    ResponseEntity<?> checkStatus();
    ResponseEntity<?> getServiceJwt(ServiceJwtRequest request);
    ResponseEntity<?> validateServiceJwt(ValidateJwtRequest request ) throws Exception;
}
