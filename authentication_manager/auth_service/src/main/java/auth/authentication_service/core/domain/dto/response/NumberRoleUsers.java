package auth.authentication_service.core.domain.dto.response;

import auth.authentication_service.core.domain.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NumberRoleUsers extends Role{
    private int numberOfUsers;
    private int totalNumberOfUsers;
}
