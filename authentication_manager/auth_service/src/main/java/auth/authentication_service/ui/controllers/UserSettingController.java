package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.request.UpdateUserSettingRequest;
import auth.authentication_service.core.services.interfaces.UserSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
