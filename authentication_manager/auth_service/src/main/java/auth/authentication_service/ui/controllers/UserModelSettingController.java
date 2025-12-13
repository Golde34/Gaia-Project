package auth.authentication_service.ui.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import auth.authentication_service.core.domain.dto.request.UpdateUserModelRequest;
import auth.authentication_service.core.services.interfaces.UserModelSettingService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user-model-setting")
@RequiredArgsConstructor
public class UserModelSettingController {

    private final UserModelSettingService userModelSettingService;
   
    @GetMapping("/get-models")
    public ResponseEntity<?> getModels() {
        return userModelSettingService.getListModels();
    }
    
    @PostMapping("/update")
    public ResponseEntity<?> updateModelSetting(@RequestBody UpdateUserModelRequest updateUserModelRequest) {
        return userModelSettingService.updateModelSetting(updateUserModelRequest);
    }

    @GetMapping("/get-model-by-user")
    public ResponseEntity<?> getModelsByUser(@RequestParam Long userId) {
        return userModelSettingService.getModelByUser(userId);
    }
}
