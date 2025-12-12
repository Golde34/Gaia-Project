package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.request.UpdateUserSettingRequest;
import auth.authentication_service.core.services.interfaces.UserSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/user-setting")
@RequiredArgsConstructor
public class UserSettingController {
    private final UserSettingService userSettingService;

    @PutMapping("/update")
    public ResponseEntity<?> updateUserSetting(@RequestBody UpdateUserSettingRequest updateUserSettingRequest) {
        return userSettingService.updateUserSettings(updateUserSettingRequest);
    }    

    @GetMapping("/get-by-user")
    public ResponseEntity<?> getUserSetting(@RequestParam Long userId) {
        return userSettingService.getUserSettings(userId);
    }

    @PutMapping("/update-memory-model/{id}")
    public ResponseEntity<?> updateMemoryModelSetting(@PathVariable Long id, @RequestBody String memoryModel) {
        return userSettingService.updateMemoryModelSettings(id, memoryModel);
    }

    @GetMapping("/get-memory-model")
    public ResponseEntity<?> getUserMemoryModelSetting(@RequestParam Long userId) {
        return userSettingService.getUserMemoryModelSetting(userId);
    } 

}
