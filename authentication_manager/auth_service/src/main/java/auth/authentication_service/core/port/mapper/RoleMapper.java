package auth.authentication_service.core.port.mapper;

import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.domain.entities.Role;
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

}
