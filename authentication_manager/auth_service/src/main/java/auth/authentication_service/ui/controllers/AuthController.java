package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.RegisterDto;
import auth.authentication_service.core.domain.dto.TokenDto;
import auth.authentication_service.core.domain.dto.UserPermissionDto;
import auth.authentication_service.core.domain.dto.request.ServiceJwtRequest;
import auth.authentication_service.core.domain.dto.request.SignInDtoRequest;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.services.interfaces.AuthService;
import auth.authentication_service.core.services.interfaces.UserService;
import auth.authentication_service.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final GenericResponse<String> genericResponse;

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok("<h1>This application belong to Golde.</h1>");
    }

    @GetMapping("/user")
    public ResponseEntity<?> user() {
        return ResponseEntity.ok("<h1>Test user role.</h1>");
    }

    @GetMapping("/admin")
    public ResponseEntity<?> admin() {
        return ResponseEntity.ok("<h1>Test admin role.</h1>");
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return genericResponse.matchingResponseMessage(new GenericResponse<>("4001", ResponseEnum.status));
    }

    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn(@RequestBody SignInDtoRequest accountDto) throws Exception {
        return authService.authenticated(accountDto.getUsername(), accountDto.getPassword());
    }

    @PostMapping("/gaia-auto-sign-in")
    public ResponseEntity<?> gaiaAutoSignIn(@RequestBody SignInDtoRequest accountDto) throws Exception {
        return authService.gaiaAutoSignin(accountDto.getUsername(), accountDto.getPassword());
    }

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody RegisterDto request) throws Exception {
        return userService.createUser(request); 
    }

    @GetMapping("/check-token")
    public ResponseEntity<?> checkToken(@RequestBody TokenDto token) throws Exception {
        return authService.checkToken(token);
    }

    @GetMapping("/check-permission")
    public ResponseEntity<?> checkPermission(@RequestBody UserPermissionDto permission) throws Exception {
        return authService.checkPermission(permission);
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenDto token) throws Exception {
        return authService.refreshToken(token.getToken());
    }

    @PostMapping("/admin/get-service-jwt")
    public ResponseEntity<?> getServiceJwt(@RequestBody ServiceJwtRequest request) {
        return authService.getServiceJwt(request); 
    }
    
}
