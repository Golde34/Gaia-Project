package auth.authentication_service.core.domain.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String name;
    private String email;
}
