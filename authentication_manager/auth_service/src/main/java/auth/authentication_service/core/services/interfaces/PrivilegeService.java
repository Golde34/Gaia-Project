package auth.authentication_service.core.services.interfaces;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.dto.PrivilegeDto;

public interface PrivilegeService {
    ResponseEntity<?> createPrivilege(String privilegeName);
    ResponseEntity<?> updatePrivilege(PrivilegeDto privilegeDto);
    ResponseEntity<?> deletePrivilege(PrivilegeDto privilegeDto);
    ResponseEntity<?> getAllPrivileges();
    ResponseEntity<?> getPrivilegeByName(PrivilegeDto privilegeDto);
}
