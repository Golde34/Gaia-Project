package auth.authentication_service.core.port.mapper;

import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.dto.response.SignInDtoResponse;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.BossType;

@Component
public class UserMapper {

    public User updateUserMapper(UpdateUserRequest updateUser, User user) {
        user.setId(updateUser.getUserId());
        user.setEmail(updateUser.getEmail());
        user.setName(updateUser.getName());
        user.setUsername(updateUser.getUsername());
        return user;
    }

    public SignInDtoResponse signInMapper(User user, Role role, String accessToken, String refreshToken,
            BossType bossType) {
        return SignInDtoResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .lastLogin(user.getLastLogin())
                .bossType(bossType.getValue())
                .role(role.getName())
                .build();
    }
}
