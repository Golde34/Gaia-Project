package auth.authentication_service.kernel.utils;

import auth.authentication_service.core.domain.dto.PrivilegeDto;
import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.domain.dto.UserDto;
import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.dto.response.UserResponse;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return modelMapper;
    }

    // DTO -> Entity

    public User _mapperDtoToEntity(RegisterDto userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public User _mapperDtoToEntity(UserDto userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public User _mapperDtoToEntity(UpdateUserRequest userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public Role _mapperDtoToEntity(RoleDto roleDto) {
        return modelMapper().map(roleDto, Role.class);
    }

    public Privilege _mapperDtoToEntity(PrivilegeDto privilegeDto) {
        return modelMapper().map(privilegeDto, Privilege.class);
    }

    // Entity -> DTO

    public UserDto _mapperEntityToDto(User user) {
        return modelMapper().map(user, UserDto.class);
    }

    public RoleDto _mapperEntityToDto(Role role) {
        return modelMapper().map(role, RoleDto.class);
    }

    public PrivilegeDto _mapperEntityToDto(Privilege privilege) {
        return modelMapper().map(privilege, PrivilegeDto.class);
    }

    public List<UserResponse> _mapperEntityToDto(List<User> users) {
        return users.stream().map(user -> modelMapper()
                .map(user, UserResponse.class))
                .collect(Collectors.toList());
    }
}
