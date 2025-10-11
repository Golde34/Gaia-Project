package auth.authentication_service.core.domain.dto;

//import auth.authentication_service.validations.dto_validations.ValidPassword;
import lombok.Data;

@Data
public class PasswordDto {
    
    private String oldPassword;

//    @ValidPassword
    private String newPassword;

    private String token;
}