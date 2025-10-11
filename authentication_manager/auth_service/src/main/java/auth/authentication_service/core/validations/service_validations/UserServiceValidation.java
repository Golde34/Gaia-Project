package auth.authentication_service.core.validations.service_validations;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.LoggerType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.ObjectUtils;
import auth.authentication_service.kernel.utils.ResponseUtils;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@Slf4j
public class UserServiceValidation {

    private final AuthenticationConfiguration authenticationManager;
    private final UserCRUDStore userCRUDStore;

    @Autowired
    private ObjectUtils objectUtils;
    @Autowired
    private ResponseUtils responseUtils;
    

    public UserServiceValidation(AuthenticationConfiguration authenticationManager, UserCRUDStore userCRUDStore) {
        this.authenticationManager = authenticationManager;
        this.userCRUDStore = userCRUDStore;
    }

    public GenericResponse<String> _validateUserSignin(UserDetails userDetails, String username, String password,
            User user) {
        try {
            if (objectUtils.isNullOrEmpty(userDetails)) {
                return responseUtils.returnMessage("Validate user signin function: ",
                        Constants.ResponseMessage.USER_NOT_FOUND, ResponseEnum.msg401);
            }

            GenericResponse<String> validation = _validateAuthentication(username, password, user);
            if (validation.getResponseMessage() != ResponseEnum.msg200) {
                return validation;
            }
            return responseUtils.returnMessage("Validate user signin function: ", Constants.ResponseMessage.VALIDATE_SUCCESS, ResponseEnum.msg200);
        } catch (Exception e) {
            e.printStackTrace();
            return responseUtils.returnMessage("Validate user signin function: ", Constants.ResponseMessage.VALIDATE_FAILED, ResponseEnum.msg400);
        }
    }

    private GenericResponse<String> _validateAuthentication(String username, String password, User user) {
        try {
            if (objectUtils.isNullOrEmpty(user)) {
                return responseUtils.returnMessage("Validate authentication function: ",
                        Constants.ResponseMessage.USER_NOT_FOUND, ResponseEnum.msg401);
            }

            if (!objectUtils.isMatchingEncoderString(password, user.getPassword())) {
                return responseUtils.returnMessage("Validate authentication function: ",
                        Constants.ResponseMessage.INCORRECT_USERNAME_PASSWORD, ResponseEnum.msg401);
            }

            if (!user.isEnabled()) {
                return responseUtils.returnMessage("Validate authentication function: ",
                        Constants.ResponseMessage.INACTIVE_USER, ResponseEnum.msg401);
            }

            authenticationManager.getAuthenticationManager().authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
        } catch (BadCredentialsException e) {
            return responseUtils.returnMessage("Exception validation: %s ".formatted(e.getMessage()),
                    Constants.ResponseMessage.INCORRECT_USERNAME_PASSWORD, ResponseEnum.msg401);
        } catch (Exception e) {
            e.printStackTrace();
            return responseUtils.returnMessage("Exception validation: %s ".formatted(e.getMessage()), 
            Constants.ResponseMessage.VALIDATE_FAILED, ResponseEnum.msg400);
        } finally {
            log.info("Validate authentication function: {}", Constants.ResponseMessage.VALIDATE_SUCCESS);
        }
        return new GenericResponse<>(Constants.ResponseMessage.VALIDATE_SUCCESS, ResponseEnum.msg200);
    }

    public GenericResponse<String> _validateUserCreation(RegisterDto userDto, User user) {
        if (_checkExistUser(user)) {
            return responseUtils.returnMessage("Validate user creation function: ",
                    Constants.ResponseMessage.REGISTERED_ACCOUNT, ResponseEnum.msg400);
        }

        if (_emailExist(userDto.getEmail())) {
            return responseUtils.returnMessage("Validate user creation function: ",
                    Constants.ResponseMessage.EMAIL_EXISTS + userDto.getEmail(), ResponseEnum.msg400);
        }

        if (_checkExistUsername(userDto.getUsername())) {
            return responseUtils.returnMessage("Validate user creation function: ",
                    Constants.ResponseMessage.USER_ALREADY_EXISTS + userDto.getUsername(), ResponseEnum.msg400);
        }

        if (!objectUtils.isMatchingString(userDto.getPassword(), userDto.getMatchingPassword())) {
            return responseUtils.returnMessage("Validate user creation function: ",
                    Constants.ResponseMessage.MATCHING_PASSWORD, ResponseEnum.msg400);
        }
        return new GenericResponse<>(Constants.ResponseMessage.VALIDATE_SUCCESS, ResponseEnum.msg200);
    }

    public GenericResponse<String> _validateUserUpdates(UpdateUserRequest userDto) {
        log.info("Validate user updates function: {}", userDto);
        if (objectUtils.isNullOrEmpty(userDto.getEmail())) {
            return responseUtils.returnMessage("Validate user updates function: ",
                    "This account email: " + userDto.getEmail() + " must be not null.", ResponseEnum.msg400); 
        }

        if (objectUtils.isNullOrEmpty(userDto.getUsername())) {
            return responseUtils.returnMessage("Validate user updates function: ",
                    "This account username: " + userDto.getUsername() + " must be.", ResponseEnum.msg400);
        }

        User user = userCRUDStore.getUserById(userDto.getUserId());
        if (objectUtils.isNullOrEmpty(user)) {
            return responseUtils.returnMessage("Validate user updates function: ",
                    Constants.ResponseMessage.USER_NOT_FOUND, ResponseEnum.msg400);
        }

        return new GenericResponse<>(Constants.ResponseMessage.VALIDATE_SUCCESS, ResponseEnum.msg200);
    }

    public GenericResponse<String> _validateUserDeletion(User user) {
        if (_checkExistUser(user)) {
            return responseUtils.returnMessage("Validate DeleteUser function: ", Constants.ResponseMessage.USER_ALREADY_EXISTS, ResponseEnum.msg400); 
        }
        return new GenericResponse<>("There is error when delete this account.", ResponseEnum.msg400);
    }

    private boolean _emailExist(final String email) {
        return userCRUDStore.findByEmail(email) != null;
    }

    protected boolean _checkExistUsername(String username) {
        try {
            for (User user : userCRUDStore.findAll()) {
                if (Objects.equals(user.getUsername(), username)) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Check exist username: " + username + " failed", LoggerType.ERROR);
        }
        return false;
    }

    protected boolean _checkExistUser(User user) {
        try {
            for (User item : userCRUDStore.findAll()) {
                if (Objects.equals(item.getId(), user.getId()) && Objects.equals(item.getUsername(), user.getUsername())
                        && Objects.equals(item.getEmail(), user.getEmail())) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Check exist user: " + user.getUsername() + " failed", LoggerType.ERROR);
        }
        return false;
    }
}
