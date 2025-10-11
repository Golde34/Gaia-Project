package auth.authentication_service.core.domain.dto;

import lombok.Data;

@Data
public class UserPermissionDto {
    private Long userId;
    private String permission;
}
