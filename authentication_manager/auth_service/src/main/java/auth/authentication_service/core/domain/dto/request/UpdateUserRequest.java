package auth.authentication_service.core.domain.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UpdateUserRequest {
    private long userId;
    private String username;
    private String name;
    private String email;
    private List<String> roles;
}
