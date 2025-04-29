package auth.authentication_service.core.domain.dto.response;


import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignInDtoResponse {
    private String accessToken;
    private String refreshToken;
    private String name;
    private String username;
    private String email;
    private Date lastLogin;
    private String bossType;
    private String role;
}
