package auth.authentication_service.core.domain.dto.request;

import lombok.Data;

@Data
public class SignInDtoRequest {
    private String username;
    private String password;
}
