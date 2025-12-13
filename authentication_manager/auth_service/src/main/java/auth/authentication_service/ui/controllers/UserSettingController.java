package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.request.MemoryModelRequest;
import auth.authentication_service.core.domain.dto.request.UpdateUserSettingRequest;
import auth.authentication_service.core.services.interfaces.UserSettingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;


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
    public ResponseEntity<?> updateMemoryModelSetting(@PathVariable Long id, @RequestBody MemoryModelRequest memoryModel) {
        return userSettingService.updateMemoryModelSettings(id, memoryModel.getMemoryModel());
    }

    @GetMapping("/get-memory-model")
    public ResponseEntity<?> getUserMemoryModelSetting(@RequestParam Long userId) {
        return userSettingService.getUserMemoryModelSetting(userId);
    } 

}
