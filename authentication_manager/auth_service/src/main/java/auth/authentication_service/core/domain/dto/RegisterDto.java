package auth.authentication_service.core.domain.dto;

import auth.authentication_service.core.validations.dto_validations.PasswordMatches;
import auth.authentication_service.core.validations.dto_validations.ValidEmail;
import auth.authentication_service.core.validations.dto_validations.ValidPassword;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;


@PasswordMatches
@Data
public class RegisterDto {

    @NotNull
    @Size(min=1, message="{Size.userDto.name}")
    private String name;
    
    @NotNull
    @Size(min=1, message="{Size.userDto.username}")
    private String username;
    
    @NotNull
    @ValidEmail
    @Size(min=1, message="{Size.userDto.email}")
    private String email;

    @ValidPassword
    private String password;

    @NotNull
    @Size(min=1)
    private String matchingPassword;

    private boolean isUsing2FA = false;
    private boolean isBoss = false;
}