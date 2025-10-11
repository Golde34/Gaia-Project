package auth.authentication_service.core.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class RoleDto {
    private Long id;
    private String name;
    private String description;
    private int grantedRank;
    private List<PrivilegeDto> privileges;
}
