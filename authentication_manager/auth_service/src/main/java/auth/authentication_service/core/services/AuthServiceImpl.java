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
import auth.authentication_service.core.domain.enums.LoggerType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.domain.enums.TokenType;
import auth.authentication_service.core.port.store.TokenStore;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.core.services.interfaces.AuthService;
import auth.authentication_service.core.services.interfaces.RoleService;
import auth.authentication_service.core.services.interfaces.TokenService;
import auth.authentication_service.core.services.interfaces.UserService;
import auth.authentication_service.core.validations.service_validations.UserServiceValidation;
import auth.authentication_service.infrastructure.store.repositories.TokenRepository;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.LoggerUtils;

import java.util.Collection;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private LoggerUtils _logger;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private UserService userService;
    @Autowired
    private RoleService roleService;

    private final UserCRUDStore userStore;
    private final TokenStore tokenStore;
    private final UserDetailsServices userDetailService;

    @Autowired
    private GenericResponse<String> genericResponse;
    @Autowired
    private UserServiceValidation userServiceValidation;

    public AuthServiceImpl(UserCRUDStore userStore, TokenStore tokenStore, UserDetailsServices userDetailService, TokenRepository tokenRepository) {
        this.userStore = userStore;
        this.tokenStore = tokenStore;
        this.userDetailService = userDetailService;
    }    

    // This function is similar to the Sign-in function
    public ResponseEntity<?> authenticated(String username, String password) throws Exception {
        User user = userStore.findByUsername(username);
        final UserDetails userDetails = userDetailService.loadUserByUsername(username);
        // Validate User
        GenericResponse<String> validate = userServiceValidation._validateUserSignin(userDetails, username, password,
                user);
        if (!validate.getResponseMessage().equals(ResponseEnum.msg200)) {
            return genericResponse.matchingResponseMessage(validate);
        }
        if(user.isEnabled() == false) {
            _logger.log("User is inactive", LoggerType.ERROR);
            return genericResponse.matchingResponseMessage(new GenericResponse<>("User is inactive", ResponseEnum.msg401));
        }
        // Generate sign-in information
        SignInDtoResponse response = _generateSignInToken(user, userDetails, BossType.USER);
        _logger.log("User: " + user.getUsername() + " sign-in success", LoggerType.INFO);

        return genericResponse.matchingResponseMessage(new GenericResponse<>(response, ResponseEnum.msg200));
    }

    private SignInDtoResponse _generateSignInToken(User user, UserDetails userDetails, BossType bossType) {
        String accessToken = _generateAccessToken(user, userDetails);
        String refreshToken = _generateRefreshToken(user, userDetails);
        Role role = roleService.getBiggestRole(user.getRoles());
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
            SignInDtoResponse response = _generateSignInToken(user, userDetails, BossType.BOSS);
            _logger.log("Boss: " + user.getUsername() + " sign-in success", LoggerType.INFO);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(response, ResponseEnum.msg200));
        } else {
            return genericResponse
                    .matchingResponseMessage(new GenericResponse<>("Permission denied", ResponseEnum.msg401));
        }
    }

    public ResponseEntity<?> checkToken(TokenDto token) {
        CheckTokenDtoResponse userResponse = tokenService.checkToken(token.getToken());
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

    // public GenericResponse<?> getNewAccessTokenResponse(String refreshToken)
    // throws Exception {
    // final UserDetails userDetails =
    // userDetailService.loadUserByUsername(tokenService.getUsernameFromToken(refreshToken));
    // User user =
    // userStore.findByUsername(tokenService.getUsernameFromToken(refreshToken));
    // if (user == null) {
    // _logger.log("User not found", LoggerType.ERROR);
    // return new GenericResponse<>("User not found", ResponseMessage.msg401);
    // }
    // if (!user.isEnabled()) {
    // _logger.log("User is inactive", LoggerType.ERROR);
    // return new GenericResponse<>("User is inactive", ResponseMessage.msg401);
    // }
    // if (!tokenService.validateToken(refreshToken)) {
    // _logger.log("Invalid refresh token", LoggerType.ERROR);
    // return new GenericResponse<>("Invalid refresh token",
    // ResponseMessage.msg401);
    // }
    // String newAccessToken = tokenService.generateAccessToken(userDetails);
    // return new GenericResponse<>(newAccessToken, ResponseMessage.msg200);
    // }
}
