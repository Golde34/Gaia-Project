package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.UserDto;
import auth.authentication_service.core.domain.dto.request.UpdateUserRequest;
import auth.authentication_service.core.domain.entities.UserLLMModel;
import auth.authentication_service.core.services.interfaces.UserLLMModelService;
import auth.authentication_service.core.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final UserLLMModelService userLLMModelService;

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody RegisterDto userDto) {
        return userService.createUser(userDto);
    }

    @PutMapping("/update-user")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest userDto) {
        return userService.updateUser(userDto);
    }

    @DeleteMapping("/delete-user")
    public ResponseEntity<?> deleteUser(@RequestBody UserDto userDto){
        return userService.deleteUser(userDto);
    }

    @RequestMapping(value = "/get-all-users")
    public ResponseEntity<?> getAllUsers() {
        return userService.getAllUsers();
    }

    @RequestMapping(value = "/get-user")
    public ResponseEntity<?> getUser(@RequestBody UserDto userDto) {
        return userService.getUserByUsername(userDto);
    }

    @GetMapping("/get-user-by-id")
    public ResponseEntity<?> getUserById(@RequestParam Long id) {
        return userService.getUserResponseById(id);
    }

    @GetMapping("/llm-models")
    public ResponseEntity<?> getUserLLMModelsByUserId(@RequestParam Long userId) {
        return userLLMModelService.getUserLLMModelsByUserId(userId);
    }

    @PostMapping("/llm-models/upsert")
    public ResponseEntity<?> upsertLLMModel(@RequestBody UserLLMModel userLLMModel) {
        return userLLMModelService.upsert(userLLMModel);
    }
}
