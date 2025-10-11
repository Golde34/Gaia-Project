package auth.authentication_service.core.validations.dto_validations;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

import auth.authentication_service.core.domain.dto.RegisterDto;

public class UserValidator implements Validator {
    
    @Override
    public boolean supports(Class<?> clazz) {
        return RegisterDto.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(final Object obj, final Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", "message.name", "Name is required.");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "username", "message.username", "Username is required.");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "password", "message.password", "Password is required.");
    }
}