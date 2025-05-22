package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.UserDto;
import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.entities.UserSetting;
import auth.authentication_service.core.domain.enums.BossType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.mapper.UserMapper;
import auth.authentication_service.core.port.mapper.UserSettingMapper;
import auth.authentication_service.core.port.store.LLMModelStore;
import auth.authentication_service.core.port.store.RoleStore;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.core.port.store.UserSettingStore;
import auth.authentication_service.core.services.interfaces.UserService;
import auth.authentication_service.core.validations.service_validations.UserServiceValidation;
import auth.authentication_service.kernel.utils.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
@Primary
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserCRUDStore userStore;
    private final RoleStore roleStore;
    private final UserSettingStore userSettingStore;
    private final LLMModelStore llmModelStore;
    private final UserServiceValidation userServiceValidation;
    private final UserMapper userMapper;
    private final UserSettingMapper userSettingMapper;
    private final ModelMapperConfig modelMapperConfig;
    private final PushKafkaMessage pushKafkaMessageService;

    private final ResponseUtils responseUtils;

    @Autowired
    private GenericResponse<?> genericResponse;

    @Override
    public ResponseEntity<?> createUser(RegisterDto userDto) {
        try {
            User user = modelMapperConfig._mapperDtoToEntity(userDto);

            GenericResponse<?> validation = userServiceValidation._validateUserCreation(userDto, user);
            if (validation.getResponseMessage() != ResponseEnum.msg200) {
                return genericResponse.matchingResponseMessage(validation);
            }

            List<LLMModel> llmModel = Collections.singletonList(llmModelStore.findModelById(1L));

            user.setPassword(new BCryptPasswordEncoder().encode(userDto.getPassword()));
            user.setRoles(Collections.singletonList(_isBoss(userDto.isBoss())));
            user.setEnabled(true);
            user.setLlmModels(llmModel);
            UserSetting userSetting = userSettingMapper.createUserSettingMapper(user);
            userSettingStore.save(userSetting);
            log.info("Create default setting for user: {}", user.getId().toString());

            userStore.save(user);
            log.info("User created: {}", user.getName().toString());
            pushKafkaMessageService.pushCreateUserMessage(user);
            log.info("Push message to kafka successfully");
            return genericResponse.matchingResponseMessage(new GenericResponse<>(user, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Create User failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.CREATE_USER,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    private Role _isBoss(final boolean isBoss) {
        if (isBoss) {
            return roleStore.findByName(BossType.BOSS.getRole());
        } else {
            return roleStore.findByName(BossType.USER.getRole());
        }
    }

    @Override
    public ResponseEntity<?> updateUser(UpdateUserRequest userDto) {
        try {
            GenericResponse<?> validation = userServiceValidation._validateUserUpdates(userDto);
            log.info("UserDTO: {}", userDto);
            if (validation.getResponseMessage() != ResponseEnum.msg200) {
                return genericResponse.matchingResponseMessage(validation);
            }

            User user = userStore.getUserById(userDto.getUserId());
            log.info("Update user: {} to: {}", user.getUsername(), userDto.getUsername());
            updateUserRoles(userDto, user);
            user = userMapper.updateUserMapper(userDto, user);
            userStore.save(user);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(user, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Update User failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.UPDATE_USER,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    private void updateUserRoles(UpdateUserRequest userDto, User user) {
        user.getRoles().clear();
        userDto.getRoles().forEach(roleName -> {
            Role role = roleStore.findByName(roleName);
            user.getRoles().add(role);
        });
    }

    @Override
    public ResponseEntity<?> deleteUser(UserDto userDto) {
        try {
            User user = modelMapperConfig._mapperDtoToEntity(userDto);
            GenericResponse<?> validation = userServiceValidation._validateUserDeletion(user);
            if (validation.getResponseMessage() != ResponseEnum.msg200) {
                // return http status code base on validate response message
                return genericResponse.matchingResponseMessage(validation);
            }

            User deleteUser = userStore.getUserById(user.getId());
            userStore.delete(deleteUser);
            log.info("Delete user: {}", deleteUser.getUsername());
            return genericResponse.matchingResponseMessage(new GenericResponse<>(deleteUser, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Delete User failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.DELETE_USER,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userStore.findAll();
            // List<UserResponse> userResponses =
            // modelMapperConfig._mapperEntityToDto(users);
            log.info("Get all users: {}", users.toString());
            return genericResponse.matchingResponseMessage(new GenericResponse<>(users, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Get all users failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.GET_ALL_USERS,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    @Cacheable(value = "userById", key = "#id", cacheManager = "cacheManager")
    public User getUserById(Long id, String usedClass) {
        try {
            User user = userStore.getUserById(id);
            log.info("Get user: {} from: {}", user.getUsername(), usedClass);
            return user;
        } catch (Exception e) {
            log.info("Get user: {} failed", id);
            return null;
        }
    }

    @Override
    public ResponseEntity<?> getUserByUsername(UserDto userDto) {
        try {
            String username = userDto.getUsername();
            User user = userStore.findByUsername(username);
            log.info("Get user: {}", user.getUsername());
            return genericResponse.matchingResponseMessage(new GenericResponse<>(user, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Get user failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.USER_NOT_FOUND,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    public User getUserByEmail(String email) {
        try {
            User user = userStore.findByEmail(email);
            log.info("Get user: {}", user.getUsername());
            return user;
        } catch (Exception e) {
            log.info("Get user: {} failed", email);
            return null;
        }
    }

    @Override
    // @Cacheable(value = "userResponseById", key = "#id", cacheManager =
    // "cacheManager") ??? TODO: Replace by Redis
    public ResponseEntity<?> getUserResponseById(Long id) {
        try {
            User user = getUserById(id, "Get User Response");
            log.info("User response: {}", user.toString());
            return genericResponse.matchingResponseMessage(new GenericResponse<>(user, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Get user failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.USER_NOT_FOUND,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }
}
