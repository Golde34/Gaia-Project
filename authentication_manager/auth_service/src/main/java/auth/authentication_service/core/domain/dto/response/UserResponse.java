package auth.authentication_service.core.domain.dto.response;

import java.util.Date;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;

    private String name;

    private String username;

    private String email;

    private Date lastLogin;

    private boolean enabled;

    private boolean isUsing2FA;

    private String secret;
}
