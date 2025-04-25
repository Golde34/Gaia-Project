package auth.authentication_service.core.services.interfaces;

import java.util.Collection;
import java.util.List;

import org.springframework.http.ResponseEntity;

import auth.authentication_service.core.domain.dto.PrivilegeDto;
import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.domain.entities.Role;

public interface RoleService {
    ResponseEntity<?> createRole(RoleDto roleDto);
    ResponseEntity<?> updateRole(RoleDto roleDto);
    ResponseEntity<?> deleteRole(RoleDto roleDto);
    ResponseEntity<?> getAllRoles();
    ResponseEntity<?> getRoleByName(String name);
    ResponseEntity<?> addPrivilegeToRole(RoleDto roleDto, List<PrivilegeDto> privilegeNames);
    Role getBiggestRole(Collection<Role> roles);
}
