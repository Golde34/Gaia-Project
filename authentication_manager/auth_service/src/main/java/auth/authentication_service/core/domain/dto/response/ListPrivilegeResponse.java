package auth.authentication_service.core.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ListPrivilegeResponse {
    private Long id;
    private String name;
    private String description;
    
    private List<RoleOnlyResponse> roles;
}
