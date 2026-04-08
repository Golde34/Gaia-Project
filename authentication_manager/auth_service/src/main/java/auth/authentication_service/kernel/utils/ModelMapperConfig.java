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

    public User mapperDtoToEntity(RegisterDto userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public User mapperDtoToEntity(UserDto userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public User mapperDtoToEntity(UpdateUserRequest userDto) {
        return modelMapper().map(userDto, User.class);
    }

    public Role mapperDtoToEntity(RoleDto roleDto) {
        return modelMapper().map(roleDto, Role.class);
    }

    public Privilege mapperDtoToEntity(PrivilegeDto privilegeDto) {
        return modelMapper().map(privilegeDto, Privilege.class);
    }

    public List<Privilege> mapperListPrivilegesDto(List<PrivilegeDto> privilegeDtos) {
        return privilegeDtos.stream().map(p -> mapperDtoToEntity(p)).toList();
    }

    // Entity -> DTO

    public UserDto mapperEntityToDto(User user) {
        return modelMapper().map(user, UserDto.class);
    }

    public RoleDto mapperEntityToDto(Role role) {
        return modelMapper().map(role, RoleDto.class);
    }

    public PrivilegeDto mapperEntityToDto(Privilege privilege) {
        return modelMapper().map(privilege, PrivilegeDto.class);
    }

    public List<UserResponse> mapperEntityToDto(List<User> users) {
        return users.stream().map(user -> modelMapper()
                .map(user, UserResponse.class))
                .collect(Collectors.toList());
    }
}
