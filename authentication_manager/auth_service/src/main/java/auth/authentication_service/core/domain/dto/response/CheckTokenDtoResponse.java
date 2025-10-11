package auth.authentication_service.core.domain.dto.response;

import java.util.Date;

//import auth.authentication_service.validations.dto_validations.ValidPassword;
import lombok.*;

@Getter
@Setter
@ToString
public class CheckTokenDtoResponse {
    
    private Long id;
    private String username;
    private String accessToken;
    private Date expiryDate;
    private boolean isValid;

    public CheckTokenDtoResponse(Long id, String username, String accessToken, Date expiryDate) {
        this.id = id;
        this.username = username;
        this.accessToken = accessToken;
        this.expiryDate = expiryDate;
    }
}