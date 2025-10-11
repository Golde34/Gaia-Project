package auth.authentication_service.core.services.interfaces;

import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.UserDto;
import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.entities.User;

import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity<?> createUser(RegisterDto userDto);
    ResponseEntity<?> updateUser(UpdateUserRequest userDto);
    ResponseEntity<?> deleteUser(UserDto userDto);
    ResponseEntity<?> getAllUsers();
    ResponseEntity<?> getUserByUsername(UserDto userDto);
    User getUserByEmail(String email);
    User getUserById(Long id, String usedClass);
    ResponseEntity<?> getUserResponseById(Long id);
}