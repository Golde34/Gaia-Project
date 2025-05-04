package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.dto.TokenDto;
import auth.authentication_service.core.domain.dto.UserPermissionDto;
import auth.authentication_service.core.domain.dto.response.CheckTokenDtoResponse;
import auth.authentication_service.core.domain.dto.response.SignInDtoResponse;
import auth.authentication_service.core.domain.entities.AuthToken;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.BossType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.domain.enums.TokenType;
import auth.authentication_service.core.port.mapper.UserMapper;
import auth.authentication_service.core.port.store.TokenStore;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.core.services.interfaces.AuthService;
import auth.authentication_service.core.services.interfaces.RoleService;
import auth.authentication_service.core.services.interfaces.TokenService;
import auth.authentication_service.core.services.interfaces.UserService;
import auth.authentication_service.core.validations.service_validations.UserServiceValidation;
import auth.authentication_service.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.Collection;
import java.util.Date;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final TokenService tokenService;
    private final UserService userService;
    private final RoleService roleService;
    private final UserDetailsServices userDetailService;
    private final UserCRUDStore userStore;
    private final TokenStore tokenStore;
    private final UserMapper userMapper;
    private final UserServiceValidation userServiceValidation;

    private final GenericResponse<String> genericResponse;

    // This function is similar to the Sign-in function
    public ResponseEntity<?> authenticated(String username, String password) throws Exception {
        try {
            User user = userStore.findByUsername(username);
            final UserDetails userDetails = userDetailService.loadUserByUsername(username);
            // Validate User
            GenericResponse<String> validate = userServiceValidation._validateUserSignin(userDetails, username,
                    password,
                    user);
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
            return genericResponse
                    .matchingResponseMessage(
                            new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }

    private ResponseEntity<?> generateSignInToken(User user, UserDetails userDetails, BossType bossType) {
        String accessToken = _generateAccessToken(user, userDetails);
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofHours(2))
                .build();
        String refreshToken = _generateRefreshToken(user, userDetails);
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(1))
                .build();
        Role userRole = roleService.getBiggestRole(user.getRoles());
        SignInDtoResponse signInResponse = userMapper.signInMapper(user, userRole, accessToken, refreshToken,
                BossType.USER);
        log.info("User: " + user.getUsername() + " sign-in success");
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        return genericResponse.matchingResponseWithHeader(new GenericResponse<>(signInResponse, ResponseEnum.msg200),
                200, headers);
    }

    private String _generateAccessToken(User user, UserDetails userDetails) {
        AuthToken accessToken = new AuthToken();
        accessToken.setUser(user);
        accessToken.setTokenType(TokenType.ACCESS_TOKEN);
        String generatedToken = tokenService.generateAccessToken(userDetails);
        accessToken.setToken(generatedToken);
        accessToken.setExpiryDate(tokenService.getExpirationDateFromToken(generatedToken));
        tokenStore.save(accessToken);
        return generatedToken;
    }

    private String _generateRefreshToken(User user, UserDetails userDetails) {
        AuthToken refreshToken = new AuthToken();
        refreshToken.setUser(user);
        refreshToken.setTokenType(TokenType.REFRESH_TOKEN);
        String generatedToken = tokenService.generateRefreshToken(userDetails);
        refreshToken.setToken(generatedToken);
        refreshToken.setExpiryDate(tokenService.getExpirationDateFromToken(generatedToken));
        tokenStore.save(refreshToken);
        user.setLastLogin(new Date());
        userStore.save(user);
        return generatedToken;
    }

    public ResponseEntity<?> gaiaAutoSignin(String username, String password) throws Exception {
        User user = userStore.findByUsername(username);
        final UserDetails userDetails = userDetailService.loadUserByUsername(username);
        // Validate User
        GenericResponse<String> validate = userServiceValidation._validateUserSignin(userDetails, username, password,
                user);
        if (!validate.getResponseMessage().equals(ResponseEnum.msg200)) {
            return genericResponse.matchingResponseMessage(validate);
        }
        // Generate sign-in information
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals(BossType.BOSS.getRole()))) {
            return generateSignInToken(user, userDetails, BossType.BOSS);
        } else {
            return genericResponse
                    .matchingResponseMessage(new GenericResponse<>("Permission denied", ResponseEnum.msg401));
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
        Collection<Role> userRole = user.getRoles();
        for (Role role : userRole) {
            Collection<Privilege> rolePrivilege = role.getPrivileges();
            for (Privilege privilege : rolePrivilege) {
                if (privilege.getName().equals(permission.getPermission())) {
                    return genericResponse
                            .matchingResponseMessage(new GenericResponse<>(privilege, ResponseEnum.msg200));
                }
            }
        }
        return genericResponse
                .matchingResponseMessage(new GenericResponse<>("Permission denied", ResponseEnum.msg401));
    }

    public ResponseEntity<?> checkStatus() {
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>("Authentication service is running", ResponseEnum.msg200));
    }

    public ResponseEntity<?> refreshToken(String token) {
        try {
            final UserDetails userDetails = userDetailService
                    .loadUserByUsername(tokenService.getUsernameFromToken(token));
            User user = userStore.findByUsername(tokenService.getUsernameFromToken(token));
            if (user == null) {
                log.error("User not found");
                return genericResponse
                        .matchingResponseMessage(new GenericResponse<>("User not found", ResponseEnum.msg401));
            }
            if (!user.isEnabled()) {
                log.error("User is inactive");
                return genericResponse
                        .matchingResponseMessage(new GenericResponse<>("User is inactive", ResponseEnum.msg401));
            }
            if (!tokenService.validateToken(token)) {
                log.error("Invalid refresh token");
                return genericResponse
                        .matchingResponseMessage(new GenericResponse<>("Invalid refresh token", ResponseEnum.msg401));
            }
            String newAccessToken = tokenService.generateAccessToken(userDetails);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(newAccessToken, ResponseEnum.msg200));
        } catch (Exception e) {
            log.error("Error during refresh token: {}", e.getMessage(), e);
            return genericResponse
                    .matchingResponseMessage(
                            new GenericResponse<>("The system encountered an unexpected error", ResponseEnum.msg500));
        }
    }
}
