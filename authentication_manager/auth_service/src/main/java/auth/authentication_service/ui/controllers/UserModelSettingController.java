package auth.authentication_service.ui.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
