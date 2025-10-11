package auth.authentication_service.core.validations.dto_validations;

import auth.authentication_service.core.domain.dto.RegisterDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, Object> {

    @Override
    public void initialize(final PasswordMatches constraintAnnotation) {
        // empty
    }

    @Override
    public boolean isValid(final Object obj, final ConstraintValidatorContext context) {
        final RegisterDto user = (RegisterDto) obj;
        return user.getPassword().equals(user.getMatchingPassword());
    }
}