package auth.authentication_service.core.port.mapper;

import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.domain.dto.response.NumberRoleUsers;
import auth.authentication_service.core.domain.entities.Role;

import java.util.Collection;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {
    @Autowired
    private ModelMapper modelMapper = new ModelMapper();

    public Role map(RoleDto roleDto) {
        return modelMapper.map(roleDto, Role.class);
    }

    public List<NumberRoleUsers> mapToNumberRoleUsers(Collection<Role> roles) {
        final int[] totalUser = { 0 };
        return roles.stream().map(role -> {
            NumberRoleUsers listRole = mapToNumberRoleUsers(role); 
            listRole.setNumberOfUsers(role.getUsers().size());
            totalUser[0] += role.getUsers().size();
            listRole.setTotalNumberOfUsers(totalUser[0]);
            return listRole;
        }).toList();
    }

    private NumberRoleUsers mapToNumberRoleUsers(Role role) {
        return NumberRoleUsers.builder()
                .id(role.getId())
                .name(role.getName())
                .privileges(role.getPrivileges())
                .grantedRank(role.getGrantedRank())
                .build();
    }
}
