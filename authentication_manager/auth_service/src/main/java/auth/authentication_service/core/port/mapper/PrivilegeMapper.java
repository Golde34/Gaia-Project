package auth.authentication_service.core.port.mapper;

import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.dto.response.ListPrivilegeResponse;
import auth.authentication_service.core.domain.dto.response.RoleOnlyResponse;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PrivilegeMapper {
    public ListPrivilegeResponse mapPrivilegeResponse(Privilege privilege) {
        return ListPrivilegeResponse.builder()
                .id(privilege.getId())
                .name(privilege.getName())
                .description(privilege.getDescription())
                .roles(convertRoleResponse(new ArrayList<>(privilege.getRoles())))
                .build();
    }

    private List<RoleOnlyResponse> convertRoleResponse(List<Role> roles) {
        return roles.stream()
            .map(role -> RoleOnlyResponse.builder()
                    .id(role.getId())
                    .name(role.getName())
                    .description(role.getDescription())
                    .build())
            .collect(Collectors.toList());
    }
}
