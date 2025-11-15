package auth.authentication_service.core.domain.dto.response;

import java.util.Date;

//import auth.authentication_service.validations.dto_validations.ValidPassword;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckTokenDtoResponse {
    
    private Long id;
    private String username;
    private String accessToken;
    private Date expiryDate;
    private boolean isValid;

}