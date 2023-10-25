package auth.authentication_service.modules.dto;


import java.util.Date;

import lombok.Data;

@Data
public class SignInDtoResponse {
    private String accessToken;
    private String refreshToken;
    private String name;
    private String username;
    private String email;
    private Date lastLogin;


    public SignInDtoResponse(String accessToken, String refreshToken, String name, String username, String email, Date lastLogin) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.name = name;
        this.username = username;
        this.email = email;
        this.lastLogin = lastLogin;
    }
}
