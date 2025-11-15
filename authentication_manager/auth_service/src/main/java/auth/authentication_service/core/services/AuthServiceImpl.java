package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.dto.TokenDto;
import auth.authentication_service.core.domain.dto.UserPermissionDto;
import auth.authentication_service.core.domain.dto.request.ServiceJwtRequest;
import auth.authentication_service.core.domain.dto.request.ValidateJwtRequest;
import auth.authentication_service.core.domain.dto.response.CheckTokenDtoResponse;
import auth.authentication_service.core.domain.dto.response.SignInDtoResponse;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.BossType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.mapper.ResponseCookieMapper;
import auth.authentication_service.core.port.mapper.UserMapper;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.core.services.interfaces.AuthService;
import auth.authentication_service.core.services.interfaces.RoleService;
import auth.authentication_service.core.services.interfaces.TokenService;
import auth.authentication_service.core.services.interfaces.UserService;
import auth.authentication_service.core.validations.service_validations.UserServiceValidation;
import auth.authentication_service.kernel.configs.JwtServiceConfig;
import auth.authentication_service.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.Date;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@EnableConfigurationProperties({
        JwtServiceConfig.class,
})
public class AuthServiceImpl implements AuthService {

    private final TokenService tokenService;
    private final UserService userService;
    private final RoleService roleService;
    private final UserDetailsServices userDetailService;
    private final UserCRUDStore userStore;
    // private final TokenStore tokenStore;
    private final UserMapper userMapper;
    private final ResponseCookieMapper responseCookieMapper;
    private final UserServiceValidation userServiceValidation;

    private final GenericResponse<String> genericResponse;
    private final JwtServiceConfig listJwtServiceConfig;

    // This function is similar to the Sign-in function
    public ResponseEntity<?> authenticated(String username, String password) throws Exception {
        try {
            User user = userStore.findByUsername(username);
            final UserDetails userDetails = userDetailService.loadUserByUsername(username);
            // Validate User
            GenericResponse<String> validate = userServiceValidation.validateUserSignin(
                    userDetails, username, password, user);
            if (!validate.getResponseMessage().equals(ResponseEnum.msg200)) {
                return genericResponse.matchingResponseMessage(validate);
            }

            if (user.isEnabled() == false) {
                log.error("User is inactive");
                return genericResponse
                        .matchingResponseMessage(new GenericResponse<>("User is inactive", ResponseEnum.msg401));
            }

            // Generate sign-in information
            return generateSignInToken(user, userDetails, BossType.USER);
        } catch (Exception e) {
            log.error("Error during sign-in: {}", e.getMessage(), e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }

    private ResponseEntity<?> generateSignInToken(User user, UserDetails userDetails, BossType bossType) {
        String accessToken = tokenService.generateAccessToken(userDetails);
        var accessTokenCookie = responseCookieMapper.genAccessTokenCookie(accessToken);

        String refreshToken = generateRefreshToken(user, userDetails);
        var refreshTokenCookie = responseCookieMapper.genRefreshTokenCookie(refreshToken);

        Role userRole = roleService.getBiggestRole(user.getRoles());
        SignInDtoResponse signInResponse = userMapper.signInMapper(
                user, userRole, accessToken, refreshToken, BossType.USER);
        log.info("User: " + user.getUsername() + " sign-in success");

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        return genericResponse.matchingResponseWithHeader(new GenericResponse<>(signInResponse, ResponseEnum.msg200),
                200, headers);
    }

    private String generateRefreshToken(User user, UserDetails userDetails) {
        String generatedToken = tokenService.generateRefreshToken(userDetails);
        user.setLastLogin(new Date());
        userStore.save(user);
        return generatedToken;
    }

    public ResponseEntity<?> gaiaAutoSignin(String username, String password) throws Exception {
        User user = userStore.findByUsername(username);
        final UserDetails userDetails = userDetailService.loadUserByUsername(username);
        // Validate User
        GenericResponse<String> validate = userServiceValidation.validateUserSignin(
                userDetails, username, password, user);
        if (!validate.getResponseMessage().equals(ResponseEnum.msg200)) {
            return genericResponse.matchingResponseMessage(validate);
        }
        // Generate sign-in information
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals(BossType.BOSS.getRole()))) {
            return generateSignInToken(user, userDetails, BossType.BOSS);
        } else {
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("Permission denied", ResponseEnum.msg401));
        }
    }

    public ResponseEntity<?> checkToken(TokenDto token) {
        boolean isValid = false;
        CheckTokenDtoResponse userResponse = tokenService.checkToken(token.getToken());
        if (userResponse.getExpiryDate().after(new Date())) {
            isValid = true;
        }
        log.info("Token of user {} is valid: {}", userResponse.getUsername(), isValid);
        userResponse.setValid(isValid);
        return genericResponse.matchingResponseMessage(new GenericResponse<>(userResponse, ResponseEnum.msg200));
    }

    public ResponseEntity<?> checkPermission(UserPermissionDto permission) {
        User user = userService.getUserById(permission.getUserId(), "Check Permission");

        var matchedPrivilege = user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())
                .filter(p -> p.getName().equals(permission.getPermission()))
                .findFirst().orElse(null);

        if (matchedPrivilege != null) {
            return genericResponse
                    .matchingResponseMessage(new GenericResponse<>(matchedPrivilege, ResponseEnum.msg200));
        }
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>("Permission denied", ResponseEnum.msg401));
    }

    public ResponseEntity<?> checkStatus() {
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>("Authentication service is running", ResponseEnum.msg200));
    }

    public ResponseEntity<?> refreshToken(String token) {
        try {
            String username = tokenService.getUsernameFromToken(token);

            final UserDetails userDetails = userDetailService.loadUserByUsername(username);

            User user = userStore.findByUsername(username);
            if (user == null) {
                log.error("User not found");
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("User not found", ResponseEnum.msg401));
            }
            if (!user.isEnabled()) {
                log.error("User is inactive");
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("User is inactive", ResponseEnum.msg401));
            }
            if (!tokenService.validateToken(token)) {
                log.error("Invalid refresh token");
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("Invalid refresh token", ResponseEnum.msg401));
            }

            String newAccessToken = tokenService.generateAccessToken(userDetails);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(newAccessToken, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error during refresh token: {}", e.getMessage(), e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }

    @Override
    public ResponseEntity<?> getServiceJwt(ServiceJwtRequest request) {
        try {
            User user = userStore.getUserById(request.getUserId());
            Duration serviceDuration = convertServiceDuration(request.getService());
            if (serviceDuration == null) {
                log.error("Service not found");
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("Service not found", ResponseEnum.msg401));
            }

            var jwtToken = tokenService.generateServiceToken(user.getUsername(), request.getService(),
                    serviceDuration);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(jwtToken, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error during get service jwt: {}", e.getMessage(), e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }

    private Duration convertServiceDuration(String service) {
        Long serviceDuration = 0L;
        var services = listJwtServiceConfig.getServices();
        log.info("Services: {}", services);
        for (var entry : services.entrySet()) {
            if (entry.getValue().getName().equals(service)) {
                String duration = entry.getValue().getDuration();
                serviceDuration = Long.parseLong(duration) * 60 * 60;
                return Duration.ofSeconds(serviceDuration);
            }
        }
        return null;
    }

    @Override
    public ResponseEntity<?> validateServiceJwt(ValidateJwtRequest request) {
        try {
            String username = tokenService.validateServiceToken(request.getJwt(), request.getService());
            User user = userStore.findByUsername(username);
            if (user == null) {
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("User not found", ResponseEnum.msg401));
            }
            String userId = user.getId().toString();
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(userId, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error during validate service jwt: {}", e.getMessage(), e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }
}
